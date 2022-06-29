/* eslint-disable no-param-reassign */

import { Text as TText } from 'troika-three-text'

import App from '../../App'
import * as Utils from '../../utils/controls/utils/Utils'
// import * as OpenSimplexNoise from '../../utils/OpenSimplexNoise'
import * as OpenSimplexNoise from 'open-simplex-noise'

export default class Text {
  constructor() {
    this.app = new App()

    // Setup
    this.scene = this.app.scene
    this.renderer = this.app.renderer
    this.resources = this.app.resources
    this.controls = this.app.controls
    this.camera = this.app.camera
    // this.camera.controls.reset()
    // this.camera.controls.enabled = false

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

    this.setEvents()
  }

  setEvents = () => {
    this.controls.off('parameter-update-slider-textSize')
    this.controls.off('parameter-update-slider')
    this.controls.off('parameter-update-color-text')
    this.controls.off('parameter-update-text')

    this.controls.on('parameter-update-slider-textSize', () => {
      // console.log('parameter-update-slider-textSize text')
      // console.log('parameter-update-slider text')
      // if (this.app.mode.activeMode.name === 'Text') {
        this.text.forEach((text, i) => {
          this.textSettings.fontSize = this.getSize()
          // this.textSettings.lineHeight = this.controls.parameters.sliders.lineHeight.value
          text.fontSize = this.textSettings.fontSize
          text.lineHeight = this.textSettings.lineHeight
          text.sync(() => {
            text.position.y = this.getYPos(i)
            this.getXOffset(text)
          })
          //   text.position.y = this.getYPos(i)
          //   const windowWidth = this.camera.aspect.x
          //   const width = text.geometry.boundingBox.max.x - text.geometry.boundingBox.min.x
          //   const eq = this.chladni(0.5, text.position.y, text.i, text.r)
          //   let amp = Math.abs(eq)
          //   if (amp > 1) amp = 1
          //   const offset = ((windowWidth - width - this.padding * 2) * 1) * amp
          //   text.offsetX = offset
          //   text.position.x = text.offsetX * this.controls.getSliderValue('textOffset')
          //   text.position.x -= (windowWidth * 0.5) - this.padding
          // })
        })
      })
    this.controls.on('parameter-update-slider', () => {
      // console.log('parameter-update-slider text')
      // console.log('parameter-update-slider text')
      // if (this.app.mode.activeMode.name === 'Text') {
        this.updateValues()

        // this.text.forEach((text, i) => {
        //   this.textSettings.fontSize = this.getSize()
        //   // this.textSettings.lineHeight = this.controls.parameters.sliders.lineHeight.value
        //   text.fontSize = this.textSettings.fontSize
        //   text.lineHeight = this.textSettings.lineHeight
        //   text.sync(() => {
        //     text.position.y = this.getYPos(i)
        //     this.getXOffset(text)
        //   })
        // })

        // this.text.forEach((text, i) => {
        //   this.textSettings.fontSize = this.getSize()
        //   // this.textSettings.lineHeight = this.controls.parameters.sliders.lineHeight.value
        //   text.fontSize = this.textSettings.fontSize
        //   text.lineHeight = this.textSettings.lineHeight
        //   text.sync(() => {
        //     text.position.y = this.getYPos(i)
        //     const windowWidth = this.camera.aspect.x
        //     const width = text.geometry.boundingBox.max.x - text.geometry.boundingBox.min.x
        //     const eq = this.chladni(0.5, text.position.y, text.i, text.r)
        //     let amp = Math.abs(eq)
        //     if (amp > 1) amp = 1
        //     const offset = ((windowWidth - width - this.padding * 2) * 1) * amp
        //     text.offsetX = offset
        //     text.position.x = text.offsetX * this.controls.getSliderValue('textOffset')
        //     text.position.x -= (windowWidth * 0.5) - this.padding
        //   })
        // })
      // }
    })
    this.controls.on('parameter-update-color-text', () => {
      // console.log('parameter-update-color text')
      // console.log('parameter-update-color text')
      // if (this.app.mode.activeMode.name === 'Text') {
        this.text.forEach((text) => {
          this.textSettings.color = this.controls.parameters.color.text.value.primary
          text.color = this.controls.parameters.color.text.value.primary
        })
        if (this.app.mode.activeMode.name === 'Text') {
          this.updateCanvasBackground()
        }
    })
    this.controls.on('parameter-update-text', () => {
      // console.log('parameter-update-text text')
      // console.log('parameter-update-text text')
      // if (this.app.mode.activeMode.name === 'Text') {
        if (this.controls.parameters.text.value !== this.string) {
          this.string = this.controls.parameters.text.value
          this.setText()
        }
      // }
    })
  }

  updateValues = () => {
    this.text.forEach((text) => {
      const windowWidth = this.camera.aspect.x
      const width = text.geometry.boundingBox.max.x - text.geometry.boundingBox.min.x
      // const height = this.textSettings.lineHeight * this.textSettings.fontSize
      const eq = this.chladni(0.5, text.position.y, text.i, text.r)
      // const eq2 = this.chladni(0.5, text.position.y + height/2)
      // const eq = (eq1 + eq2) / 2
      let amp = Math.abs(eq)
      if (amp > 1) amp = 1
      const offset = ((windowWidth - width - this.padding * 2) * 1) * amp
      text.offsetX = offset
      text.position.x = text.offsetX * this.controls.getSliderValue('textOffset')
      text.position.x -= (windowWidth * 0.5) - this.padding
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

    this.strings = this.controls.parameters.text.value.split('\n')

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
      // text.r = random[i] ? random[i] : Math.random()
      // Use noise instead of random so doesn't change on refresh without text change
      text.r = random[i] ? random[i] : this.osn2D(i, string.length)

      this.text.push(text)

      text.sync(() => {
        text.position.y = this.getYPos(i)
        this.getXOffset(text)
      })
    })
  }

  chladni = (x, y, i, r) => {
    const m_ = this.controls.getSliderValue('frequencyA')
    const n_ = this.controls.getSliderValue('frequencyB')
    // vec2 pos_ = pos;
    // pos_.x *= uAspect.x; 
    // pos_.y *= uAspect.y; 
    // n_ += snoise(pos_*2.) * uDistortion;
    // m_ += snoise(pos_*2. + 123.4324) * uDistortion;
    const PI = Math.PI
    const off = Math.PI/2.*1.
    const L = { x: 1, y: 1 };
    const a = 1.
    const b = 1.
    // return a * Math.sin(PI*n_*x/L.x+off) * Math.sin(PI*m_*y/L.y+off) + b * Math.sin(PI*m_*x/L.x+off) * Math.sin(PI*n_*y/L.y+off)
    // return a * cos(PI*n_*x/L+off) * cos(PI*m_*y/L+off) - b * cos(PI*m_*x/L+off) * cos(PI*n_*y/L+off);

    let m = Utils.map(m_, this.app.controls.parameters.sliders.frequencyA.options.min,this.app.controls.parameters.sliders.frequencyA.options.max,-0., 1 )
    let n = Utils.map(n_, this.app.controls.parameters.sliders.frequencyB.options.min,this.app.controls.parameters.sliders.frequencyB.options.max,-0., 1 )
    m = Math.sin(m * Math.PI + r * Math.PI + n * Math.PI)
    // let m = Utils.map(m_, this.app.controls.parameters.sliders.frequencyA.options.min,this.app.controls.parameters.sliders.frequencyA.options.max,-0.5, 0.5 )
    return m
  }


  getXOffset = (text) => {

    const width = text.geometry.boundingBox.max.x - text.geometry.boundingBox.min.x
    const windowWidth = this.camera.aspect.x
    if (width + this.padding * 2 < 1) {
      
      const eq = this.chladni(0.5, text.position.y, text.i, text.r)
      let amp = Math.abs(eq)
      if (amp > 1) amp = 1
      const offset = ((windowWidth - width - this.padding * 2) * 1) * amp
      // const offset = ((1 - width) * 0.5 - 0.01) * Math.random()
      // text.offsetX = Math.random() < 0.5 ? -pad : pad
      // const offset = ((windowWidth - width - this.padding * 2) * 1) * Math.random()
      text.offsetX = offset
      text.position.x = text.offsetX * this.controls.getSliderValue('textOffset')
      text.position.x -= (windowWidth * 0.5) - this.padding
      
    } else {
      // text.offsetX = 0
      text.offsetX = -(windowWidth * 0.5) - this.padding
      // text.position.x = text.offsetX * this.controls.parameters.sliders.textOffset.value
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

  // eslint-disable-next-line class-methods-use-this
  // map = (value, low1, high1, low2, high2) => low2 + ((high2 - low2) * (value - low1)) / (high1 - low1)

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
