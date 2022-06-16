/* eslint-disable no-param-reassign */

import { Text as TText } from 'troika-three-text'

import App from '../../App'

export default class Text {
  constructor() {
    this.app = new App()

    // Setup
    this.scene = this.app.scene
    this.renderer = this.app.renderer
    this.resources = this.app.resources
    this.controls = this.app.controls
    this.camera = this.app.camera
    this.camera.controls.reset()
    this.camera.controls.enabled = false

    this.init()
  }

  init = () => {
    this.renderer.instance.setClearAlpha(0)
    this.updateCanvas()

    this.string = this.controls.parameters.text.value

    this.padding = 0.015

    this.textSettings = {
      font: '/fonts/Theinhardt Pan Medium.otf',
      fontSize: this.getSize(),
      // anchorX: 'center',
      anchorX: 'left',
      anchorY: 'middle',
      // textAlign: 'center',
      textAlign: 'left',
      // maxWidth: 1,
      // overflowWrap: 'break-word',
      // lineHeight: this.controls.parameters.sliders.lineHeight.value,
      lineHeight: 0.8,
      color: this.controls.parameters.color.text.value.primary,
    }

    this.setText()

    this.controls.on('parameter-update-slider', () => {
      if (this.app.mode.activeMode.name === 'Text') {
        this.text.forEach((text, i) => {
          this.textSettings.fontSize = this.getSize()
          // this.textSettings.lineHeight = this.controls.parameters.sliders.lineHeight.value
          text.fontSize = this.textSettings.fontSize
          text.lineHeight = this.textSettings.lineHeight
          text.position.x = text.offsetX * this.controls.parameters.sliders.textOffset.value
          text.position.x -= 0.5 - this.padding
          text.sync(() => {
            text.position.y = this.getYPos(i)
          })
        })
      }
    })
    this.controls.on('parameter-update-color', () => {
      if (this.app.mode.activeMode.name === 'Text') {
        this.text.forEach((text) => {
          this.textSettings.color = this.controls.parameters.color.text.value.primary
          text.color = this.controls.parameters.color.text.value.primary
        })
        this.updateCanvas()
      }
    })
    this.controls.on('parameter-update-text', () => {
      if (this.app.mode.activeMode.name === 'Text') {
        if (this.controls.parameters.text.value !== this.string) {
          this.string = this.controls.parameters.text.value
          this.setText()
        }
      }
    })
  }

  getSize = () => this.map(this.controls.parameters.sliders.textSize.value, 12, 128, 0.05, 0.75)

  updateCanvasBorder = () => {
    if (this.controls.parameters.color.text.value.name === 'Light') {
      this.app.canvas.style.borderWidth = '1px'
      this.app.canvas.style.borderStyle = 'solid'
    } else {
      this.app.canvas.style.borderWidth = '0'
    }
  }

  updateCanvas = () => {
    this.app.canvas.style.background = this.controls.parameters.color.text.value.background
  }

  getYPos = (i) => {
    const height = this.textSettings.lineHeight * this.textSettings.fontSize
    return -(i - (this.strings.length - 1) * 0.5) * height
  }

  setText = () => {
    // Remove previous text
    if (this.text && this.text.length > 0) {
      this.text.forEach((text) => {
        this.scene.remove(text)
        text.dispose()
      })
    }
    this.text = []

    this.strings = this.controls.parameters.text.value.split('\n')

    this.strings.forEach((string, i) => {
      const text = new TText()
      this.scene.add(text)

      text.text = string.toUpperCase()
      text.position.z = 0

      Object.keys(this.textSettings).forEach((key) => {
        text[key] = this.textSettings[key]
      })

      text.offsetX = 0

      this.text.push(text)

      text.sync(() => {
        this.getXOffset(text)
        text.position.y = this.getYPos(i)
      })
    })
  }

  getXOffset = (text) => {
    const width = text.geometry.boundingBox.max.x - text.geometry.boundingBox.min.x
    if (width + this.padding * 2 < 1) {
      // const offset = ((1 - width) * 0.5 - 0.01) * Math.random()
      // text.offsetX = Math.random() < 0.5 ? -pad : pad
      const offset = ((1 - width - this.padding * 2) * 1) * Math.random()
      text.offsetX = offset
      text.position.x = text.offsetX * this.controls.parameters.sliders.textOffset.value
      text.position.x -= 0.5 - this.padding
    } else {
      // text.offsetX = 0
      text.offsetX = -0.5 - this.padding
      // text.position.x = text.offsetX * this.controls.parameters.sliders.textOffset.value
      text.position.x = text.offsetX
    }
  }

  randomizeXOffset = () => {
    this.text.forEach((text) => {
      this.getXOffset(text)
    })
  }

  // eslint-disable-next-line class-methods-use-this
  map = (value, low1, high1, low2, high2) => low2 + ((high2 - low2) * (value - low1)) / (high1 - low1)

  destroy = () => {
    this.controls.off('parameter-update-slider')
    this.controls.off('parameter-update-color')
    this.controls.off('parameter-update-text')
    this.text.forEach((text) => {
      this.scene.remove(text)
      text.dispose()
    })
    this.text = []
    this.app.canvas.style.background = 'none'
  }
}
