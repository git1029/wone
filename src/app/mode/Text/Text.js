/* eslint-disable max-len */
/* eslint-disable no-param-reassign */

import * as THREE from 'three'
import { Text as TText } from 'troika-three-text'
import * as OpenSimplexNoise from 'open-simplex-noise'

import App from '../../App'
import * as Utils from '../../utils/controls/utils/Utils'

export default class Text {
  constructor() {
    this.app = new App()

    // Setup
    this.scene = this.app.scene
    this.renderer = this.app.renderer
    this.resources = this.app.resources
    this.controls = this.app.controls
    this.camera = this.app.camera

    this.osn2D = OpenSimplexNoise.makeNoise2D(1000)

    this.init()
  }

  init = () => {
    if (this.controls.parameters.mode.value.name === 'Text') this.updateCanvasBackground()

    this.string = this.controls.parameters.text.value

    this.padding = 0.015

    this.textSettings = {
      font: '/fonts/Theinhardt Pan Medium.otf',
      fontSize: this.getSize(),
      anchorX: 'left',
      anchorY: 'middle',
      textAlign: 'left',
      // maxWidth: 1,
      // overflowWrap: 'break-word',
      // lineHeight: this.controls.parameters.sliders.lineHeight.value,
      lineHeight: 0.8,
      color: this.controls.parameters.color.text.value.primary,
    }

    this.setText()

    this.setEvents()
  }

  setEvents = () => {
    this.controls.off('parameter-update-slider-textSize')
    this.controls.off('parameter-update-slider')
    this.controls.off('parameter-update-color-text')
    this.controls.off('parameter-update-text')

    this.controls.on('parameter-update-slider-textSize', () => {
      this.text.forEach((text, i) => {
        this.textSettings.fontSize = this.getSize()
        text.fontSize = this.textSettings.fontSize
        text.sync(() => {
          text.position.y = this.getYPos(i)
          this.getXOffset(text)
        })
      })
    })

    this.controls.on('parameter-update-slider', () => {
      this.updateValues()
    })

    this.controls.on('parameter-update-color-text', () => {
      this.text.forEach((text) => {
        this.textSettings.color = this.controls.parameters.color.text.value.primary
        text.color = this.controls.parameters.color.text.value.primary
      })
      if (this.app.mode.activeMode.name === 'Text') {
        this.updateCanvasBackground()
      }

      // Logo color can be controlled in text mode only, will be fixed at off white in other modes
      if (this.app.mode.activeMode.name === 'Text' && this.app.logoMesh) {
        this.app.logoMesh.material.color = new THREE.Color(this.controls.parameters.color.text.value.primary)
        this.app.logoMesh.material.needsUpdate = true
      }
    })

    this.controls.on('parameter-update-text', () => {
      if (this.controls.parameters.text.value !== this.string) {
        this.string = this.controls.parameters.text.value
        this.setText()
      }
    })
  }

  updateValues = () => {
    this.text.forEach((text) => {
      this.getXOffset(text)
    })
  }

  getSize = () => Utils.map(this.controls.parameters.sliders.textSize.value, 12, 128, 0.05, 0.75)

  updateCanvasBackground = () => {
    this.renderer.instance.setClearColor(0x000000, 0)
    this.renderer.instance.setClearAlpha(0)
    this.app.canvas.style.background = this.controls.parameters.color.text.value.background
  }

  getYPos = (i) => {
    const height = this.textSettings.lineHeight * this.textSettings.fontSize
    return -(i - (this.strings.length - 1) * 0.5) * height
  }

  setText = () => {
    // Check for previous random values
    const random = []

    // Remove previous text
    if (this.text && this.text.length > 0) {
      this.text.forEach((text) => {
        random.push(text.r)
        this.scene.remove(text)
        text.dispose()
      })
    }
    this.text = []

    this.strings = this.controls.parameters.text.value.trim().split('\n')

    this.strings.forEach((string, i) => {
      const text = new TText()
      this.scene.add(text)

      text.text = string.toUpperCase()
      text.position.z = 10

      Object.keys(this.textSettings).forEach((key) => {
        text[key] = this.textSettings[key]
      })

      text.offsetX = 0
      text.i = i

      // Use OS noise instead of random so doesn't change on refresh without text change
      // text.r = random[i] ? random[i] : Math.random()
      text.r = random[i] ? random[i] : this.osn2D(i, string.length)

      this.text.push(text)

      text.sync(() => {
        text.position.y = this.getYPos(i)
        this.getXOffset(text)
      })
    })
  }

  chladni = (x, y, i, r) => {
    const freqA = this.controls.getSliderValue('frequencyA')
    const freqB = this.controls.getSliderValue('frequencyB')
    const m = Utils.map(freqA, this.app.controls.parameters.sliders.frequencyA.options.min, this.app.controls.parameters.sliders.frequencyA.options.max, 0, 1)
    const n = Utils.map(freqB, this.app.controls.parameters.sliders.frequencyB.options.min, this.app.controls.parameters.sliders.frequencyB.options.max, 0, 1)
    return Math.sin(m * Math.PI + r * Math.PI + n * Math.PI)
  }

  getXOffset = (text) => {
    const width = text.geometry.boundingBox.max.x - text.geometry.boundingBox.min.x
    const windowWidth = this.camera.aspect.x
    if ((width + this.padding * 2) < windowWidth) {
      const eq = this.chladni(0.5, text.position.y, text.i, text.r)
      let amp = Math.abs(eq)
      if (amp > 1) amp = 1
      const offset = ((windowWidth - width - this.padding * 2) * 1) * amp
      text.offsetX = offset
      text.position.x = text.offsetX * this.controls.getSliderValue('textOffset')
      text.position.x -= (windowWidth * 0.5) - this.padding
    } else {
      text.offsetX = -(windowWidth * 0.5) - this.padding
      text.position.x = text.offsetX
    }
  }

  randomizeXOffset = () => {
    this.text.forEach((text) => {
      this.getXOffset(text)
    })
  }

  animate = () => {
    this.updateValues()
  }

  resize = () => {
    this.updateValues()
  }

  destroy = () => {
    this.controls.off('parameter-update-slider-textSize')
    this.controls.off('parameter-update-slider')
    this.controls.off('parameter-update-color-text')
    this.controls.off('parameter-update-text')
    this.text.forEach((text) => {
      this.scene.remove(text)
      text.dispose()
    })
    this.text = []
    this.app.canvas.style.background = 'none'
  }
}
