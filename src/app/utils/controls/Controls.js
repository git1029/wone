/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */

import App from '../../App'
import EventEmitter from '../EventEmitter'

import * as Utils from './utils/Utils'
import ButtonOption from './components/ButtonOption'
import ButtonColor from './components/ButtonColor'
import ButtonAction from './components/ButtonAction'
import TextInput from './components/TextInput'
import ImageUpload from './components/ImageUpload'
import Slider from './components/Slider'
import * as Easing from '../Easing'

let instance = null

export default class Controls extends EventEmitter {
  constructor() {
    if (instance) {
      // eslint-disable-next-line no-constructor-return
      return instance
    }

    super()

    instance = this

    this.app = new App()
    this.capturer = this.app.capturer
    this.resources = this.app.resources
    this.sizes = this.app.sizes
    this.camera = this.app.camera
    this.renderer = this.app.renderer
    this.time = this.app.time

    this.controllers = []

    this.parameters = {
      mode: {
        modes: [],
        label: 'Mode',
        // label: null,
        options: {
          pattern: { name: 'Pattern' },
          image: { name: 'Image' },
          text: { name: 'Text' },
        },
        controllers: {},
      },

      size: {
        modes: [],
        label: 'Canvas Size',
        options: {
          square: {
            name: 'Square', aspect: '1:1', width: 1080, height: 1080,
          },
          portrait: {
            name: 'Portrait', aspect: '16:9', width: 1080, height: 1920,
          },
          custom: {
            name: 'Custom', aspect: '', width: 1920, height: 1080,
          },
        },
        controllers: {},
      },

      keyframe: {
        modes: [],
        // label: null,
        label: 'Keyframe',
        options: {
          a: { name: 'Keyframe A', key: 'a' },
          b: { name: 'Keyframe B', key: 'b' },
        },
        controllers: {},
      },

      imageScale: {
        modes: ['image'],
        name: 'imageScale',
        label: 'Scale %:',
        // label: null,
        default: 100,
        options: {
          type: 'number',
          min: '50',
          max: '200',
          onChangeEmit: 'parameter-update-image-scale',
        },
        controllers: {},
      },

      export: {
        save: {
          modes: [],
          label: 'Export As',
          // label: null,
          options: {
            still: { name: 'Image', key: 'still' },
            animation: { name: 'Image Sequence', key: 'animation' },
          },
          controllers: {},
        },

        loop: {
          modes: [],
          label: 'Sequence Mode',
          exportModes: ['animation'],
          // label: null,
          options: {
            linear: { name: 'Linear (A → B)', key: 'linear' },
            loop: { name: 'Loop (A → B → A)', key: 'loop' },
          },
          controllers: {},
        },

        duration: {
          modes: [],
          name: 'exportDuration',
          label: 'Duration (seconds)',
          exportModes: ['animation'],
          default: 8,
          options: {
            type: 'number',
            min: '0.1',
            max: '30',
            onChangeEmit: 'parameter-update-export-duration',
          },
          // label: null,
          controllers: {},
        },

        scale: {
          modes: [],
          label: 'Image Scaling',
          exportModes: ['still'],
          sizeModes: ['square', 'portrait'],
          // label: null,
          options: {
            x1: { name: '1x', scale: 1 },
            x2: { name: '2x', scale: 2 },
            x3: { name: '3x', scale: 3 },
            x4: { name: '4x', scale: 4 },
          },
          controllers: {},
        },
      },

      color: {
        pattern: {
          modes: ['pattern'],
          label: 'Colour Palette',
          options: {
            blue: { name: 'Blue', background: '#BEC0E1', primary: '#0F57E5' },
            orange: { name: 'Orange', background: '#D6B2D9', primary: '#C55F36' },
            red: { name: 'Red', background: '#ED897F', primary: '#C3405B' },
            pink: { name: 'Pink', background: '#E5C7EA', primary: '#7AB3E5' },
            // blue: { name: 'Blue', background: '#255682', primary: '#81B0E3' },
            // cyan: { name: 'Cyan', background: '#74A6B7', primary: '#A4D0E3' },
            // pink: { name: 'Pink', background: '#B275BC', primary: '#E5B3EC' },
            // beige: { name: 'Beige', background: '#E2745A', primary: '#F0A48F' },
            // orange: { name: 'Orange', background: '#B72821', primary: '#FD5547' },
          },
          controllers: {},
        },

        text: {
          // modes: ['text'],
          modes: [],
          label: 'Text Colour',
          options: {
            // light: { name: 'Light', background: '#1D1D1B', primary: '#E1E0D3' },
            // dark: { name: 'Dark', background: '#E1E0D3', primary: '#1D1D1B' },
            light: { name: 'Light', background: '#1D1D1B', primary: '#FCFCFC' },
            dark: { name: 'Dark', background: '#FCFCFC', primary: '#1D1D1B' },
          },
          controllers: {},
        },

        // logo: {
        //   modes: [],
        //   label: 'Logo Colour',
        //   options: {
        //     light: { name: 'Light', background: '#1D1D1B', primary: '#FCFCFC' },
        //     dark: { name: 'Dark', background: '#FCFCFC', primary: '#1D1D1B' },
        //   },
        //   controllers: {},
        // },
      },

      sliders: {
        frequencyA: {
          // modes: ['pattern', 'image'],
          modes: [],
          keyframes: true,
          options: {
            random: true,
            min: 0.1,
            max: 10,
            step: 0.1,
            default: 7,
            label: 'Frequency A',
            // range: ['0hz', '600hz'],
            range: [],
          },
        },

        frequencyB: {
          // modes: ['pattern', 'image'],
          modes: [],
          keyframes: true,
          options: {
            random: true,
            min: 0.1,
            max: 10,
            step: 0.1,
            default: 7,
            label: 'Frequency B',
            // range: ['0hz', '600hz'],
            range: [],
          },
        },

        distortion: {
          modes: ['pattern', 'image'],
          keyframes: true,
          options: {
            random: true,
            min: 0,
            max: 2,
            step: 0.1,
            default: 0,
            label: 'Distortion',
            // range: ['0', '100'],
            range: [],
          },
        },

        scale: {
          modes: ['pattern', 'image'],
          keyframes: true,
          options: {
            random: true,
            min: -2,
            max: 2,
            step: 0.1,
            default: 0,
            label: 'Scale',
            // range: ['0', '100'],
            range: [],
          },
        },

        grain: {
          // modes: ['pattern', 'image'],
          modes: ['image'],
          keyframes: true,
          options: {
            random: false,
            min: 0,
            max: 1,
            step:
            0.01,
            default: 1,
            label: 'Grain',
            // range: ['0', '100'],
            range: [],
          },
        },

        displacement: {
          modes: ['image'],
          keyframes: true,
          options: {
            random: false,
            min: 0.5,
            max: 1,
            step: 0.01,
            default: 1,
            label: 'Displacement',
            // range: ['0', '100'],
            range: [],
          },
        },

        textSize: {
          // modes: ['text'],
          modes: [],
          keyframes: false,
          ignoreReset: true,
          options: {
            random: false,
            min: 12,
            max: 128,
            step: 1,
            default: 22,
            label: 'Text Size',
            range: ['12pt', '128pt'],
          },
        },

        imageOffsetX: {
          // modes: ['text'],
          modes: [],
          keyframes: false,
          ignoreReset: true,
          options: {
            random: false,
            min: -100,
            max: 100,
            step: 1,
            default: 0,
            label: 'X',
            range: ['-100', '100'],
          },
        },

        imageOffsetY: {
          // modes: ['text'],
          modes: [],
          keyframes: false,
          ignoreReset: true,
          options: {
            random: false,
            min: -100,
            max: 100,
            step: 1,
            default: 0,
            label: 'Y',
            range: ['-100', '100'],
          },
        },

        textOffset: {
          // modes: ['text'],
          modes: [],
          keyframes: true,
          options: {
            random: false,
            min: 0,
            max: 1,
            step: 0.01,
            default: 1,
            label: 'Text Offset',
            // range: ['12pt', '128pt'],
            // range: ['50%', '200%'],
            range: [],
          },
        },

        // loopDuration: {
        //   modes: ['pattern', 'image', 'text'],
        //   options: {
        //     min: 1,
        //     max: 15,
        //     step: 1,
        //     default: 8,
        //     label: 'Duration (sec)',
        //     // range: ['12pt', '128pt'],
        //     // range: ['50%', '200%'],
        //     range: [],
        //   },
        // },
      },

      text: {
        // modes: ['text'],
        modes: [],
        label: 'Text',
      },

      images: {
        patternTexture: {
          modes: ['image'],
          label: 'Image Upload',
          name: 'patternTexture',
        },

        // logoTexture: {
        //   modes: [],
        //   label: 'Logo Image Upload',
        //   name: 'logoTexture',
        // },
      },

      buttons: {
        randomize: {
          modes: [],
          name: 'randomize',
          label: 'Randomize',
          handleClick: () => this.slider.randomize(),
        },

        logoPreview: {
          modes: [],
          value: false,
          name: 'logoPreview',
          label: 'Show Logo',
          config: true,
          handleClick: () => {
            this.parameters.buttons.logoPreview.value = !this.parameters.buttons.logoPreview.value
            if (this.app.logoMesh) {
              this.app.logoMesh.visible = this.parameters.buttons.logoPreview.value
            }
            this.updateLocalStorage()
          },
        },

        textPreview: {
          modes: ['pattern', 'image'],
          value: false,
          name: 'textPreview',
          label: 'Show Text',
          // config: true,
          handleClick: () => {
            if (this.app.mode && this.app.mode.textMode && this.app.mode.activeMode.name !== 'Text') {
              this.parameters.buttons.textPreview.value = !this.parameters.buttons.textPreview.value
              this.app.mode.textMode.text.forEach((text) => {
                text.visible = this.parameters.buttons.textPreview.value
              })
              // const textInputs = document.querySelector('#input-text-container')
              // textInputs.style.display = this.parameters.buttons.textPreview.value ? 'block' : 'none'
            }
          },
        },

        reset: {
          modes: [],
          name: 'reset',
          label: 'Reset',
          handleClick: () => this.slider.reset(),
        },

        export: {
          modes: [],
          name: 'export',
          label: 'Export',
          options: {
            scale: [1, 2, 3, 4],
          },
          value: {
            scale: 1,
          },
          handleClick: () => {
            // this.export.export = () => {
            //   this.time.paused = false
            //   const animateBtn = this.debugFolderTime.children.filter((c) =>
            //      c.property === 'animate')[0].$button
            //   animateBtn.innerHTML = 'Pause'
            //   animateBtn.style.color = 'white'

            if (this.parameters.export.save.value.key === 'animation') {
              // this.time.restart()

              // Change to keyframe A
              this.parameters.keyframe.controllers.a.click()

              // // Hide text preview for Pattern and Image modes
              // if (this.app.mode.activeMode.name !== 'Text') {
              //   if (this.app.mode.textMode) {
              //     this.app.mode.textMode.text.forEach((text) => {
              //       text.visible = false
              //     })
              //   }
              // }

              this.parameters.buttons.export.controller.value = 'Preparing Export'

              // Wait for pattern to settle before beginning recording
              setTimeout(() => {
                this.app.export.recordStartTime = this.time.elapsedTime
                // console.log(this.app.export.recordStartTime)
                this.app.export.recording.animation = true
                // const button = this.parameters.buttons.export.controller
                // button.disabled = true
                this.parameters.buttons.export.controller.disabled = true

                const { width, height } = this.parameters.size.value

                // Scale canvas (and particles) to export size
                this.app.renderer.instance.setSize(width, height)

                this.app.sizes.scaleCanvas(true)

                const scl = (this.parameters.size.value.width) / this.app.sizes.limit.width
                if (this.app.mode.activeMode.name === 'Pattern') this.app.mode.mode.updateParticleSize(scl)

                this.app.capturer.start()
              }, 2000)
            } else {
              this.app.export.recording.still = true
            }

            //   this.export.recording = true

            //   const exportBtn = this.debugFolderExport.children.filter((c) =>
            //      c.property === 'export')[0].$button
            //   exportBtn.innerHTML = 'Exporting...'
            //   exportBtn.style.color = 'lime'

            //   this.capture = null
            //   // eslint-disable-next-line no-undef
            //   this.capturer = new CCapture({
            //     format: 'png',
            //     framerate: 30,
            //     // verbose: true,
            //     timeLimit: this.export.duration,
            //   })
            // }
          },
        },

        exportPreview: {
          modes: [],
          exportModes: ['animation'],
          name: 'exportPreview',
          label: 'Preview',
          value: false,
          handleClick: () => {
            console.log('Export Preview')
            // this.time.restart()

            if (this.parameters.export.save.value.key !== 'animation') return
            // this.time.paused = false
            // const animateBtn = this.debugFolderTime.children.filter((c) => c.property === 'animate')[0].$button
            // animateBtn.innerHTML = 'Pause'
            // animateBtn.style.color = 'white'
            this.parameters.buttons.exportPreview.value = true
            // this.time.restart()
            this.app.export.recordStartTime = this.time.elapsedTime

            // // Hide text preview for Pattern and Image modes
            // if (this.app.mode.activeMode.name !== 'Text') {
            //   if (this.app.mode.textMode) {
            //     this.app.mode.textMode.text.forEach((text) => {
            //       text.visible = false
            //     })
            //   }
            // }
            // this.export.recording = true

            // const exportBtn = this.debugFolderExport.children.filter((c) => c.property === 'export')[0].$button
            // exportBtn.innerHTML = 'Exporting...'
            // exportBtn.style.color = 'lime'
          },
        },

        image: {
          fitWidth: {
            modes: ['image'],
            name: 'imageFitWidth',
            label: 'Width',
            default: true,
            // handleClick: () => this.slider.randomize(),
            handleClick: () => {
              // console.log('Image fit width')
              this.parameters.buttons.image.fitWidth.value = true
              this.parameters.buttons.image.fitHeight.value = false
              if (this.app.mode && this.app.mode.activeMode.name === 'Image') {
                this.app.mode.mode.fitImage()
              }
              this.updateLocalStorage()
            },
          },

          fitHeight: {
            modes: ['image'],
            name: 'imageFitHeight',
            label: 'Height',
            default: false,
            // handleClick: () => this.slider.randomize(),
            handleClick: () => {
              // console.log('Image fit height')
              // if (this.app.mode && this.app.mode.activeMode.name === 'Image') {
              //   this.app.mode.mode.fitImageToHeight()
              // }
              this.parameters.buttons.image.fitWidth.value = false
              this.parameters.buttons.image.fitHeight.value = true
              if (this.app.mode && this.app.mode.activeMode.name === 'Image') {
                this.app.mode.mode.fitImage()
              }
              this.updateLocalStorage()
            },
          },
        },

      },
    }

    this.buttonOption = new ButtonOption()
    this.buttonColor = new ButtonColor()
    this.buttonAction = new ButtonAction()
    this.textInput = new TextInput()
    this.imageUpload = new ImageUpload()
    this.slider = new Slider()

    this.init()
  }

  init = () => {
    // Check localstorage for parameters
    let params = null
    if (window.localStorage.getItem('woneParams')) {
      params = JSON.parse(window.localStorage.getItem('woneParams'))
    }

    console.log(params)

    // Initialize values
    this.setParameter(params, null, 'mode', this.parameters.mode.options.pattern)
    this.setParameter(params, null, 'size', this.parameters.size.options.square)
    this.setParameter(params, null, 'keyframe', this.parameters.keyframe.options.a)
    this.setParameter(params, 'export', 'save', this.parameters.export.save.options.still)
    this.setParameter(params, 'export', 'loop', this.parameters.export.loop.options.linear)
    this.setParameter(params, 'export', 'scale', this.parameters.export.scale.options.x1)
    this.setParameter(params, 'export', 'duration', this.parameters.export.duration.default)
    this.setParameter(params, 'color', 'pattern', this.parameters.color.pattern.options.blue)
    this.setParameter(params, 'color', 'text', this.parameters.color.text.options.dark)
    // this.setParameter(params, 'color', 'logo', this.parameters.color.logo.options.light)
    this.setParameter(params, null, 'imageScale', this.parameters.imageScale.default)
    this.setParameter(params, 'buttons', 'logoPreview', false)
    Object.keys(this.parameters.sliders).forEach((key) => {
      // Check for default value in localStorage
      if (params && params.sliders && params.sliders[key] && params.sliders[key].default) {
        this.parameters.sliders[key].options.default = typeof params.sliders[key].default === 'object'
          ? { ...params.sliders[key].default }
          : params.sliders[key].default
      } else {
        // Initialize default values for slider (value for each keyframe)
        // eslint-disable-next-line no-lonely-if
        if (this.parameters.sliders[key].keyframes) {
          const value = this.parameters.sliders[key].options.random
            ? this.getRandomSliderValue(this.parameters.sliders[key])
            : this.parameters.sliders[key].options.default

          this.parameters.sliders[key].options.default = {}
          Object.keys(this.parameters.keyframe.options).forEach((keyframe) => {
            this.parameters.sliders[key].options.default[keyframe] = value
          })

          // this.setParameter(params, 'sliders', key, { ...this.parameters.sliders[key].options.default })
        } else {
          // eslint-disable-next-line no-lonely-if
          if (this.parameters.sliders[key].options.random) {
            this.parameters.sliders[key].options.default = this.getRandomSliderValue(this.parameters.sliders[key])
          }
          // this.setParameter(params, 'sliders', key, this.parameters.sliders[key].options.default)
        }
      }

      const defaultValue = typeof this.parameters.sliders[key].options.default === 'object'
        ? { ...this.parameters.sliders[key].options.default }
        : this.parameters.sliders[key].options.default
      this.setParameter(params, 'sliders', key, defaultValue)
    })
    this.setParameter(params, null, 'text', 'WONE IS\nA NEW MODEL\nOF HEALTH FOR\nTHE\nMODERN\nWORKPLACE')

    // Check fitWidth/fitHeight
    const imgKeys = ['fitWidth', 'fitHeight']
    imgKeys.forEach((key) => {
      const fallback = this.parameters.buttons.image[key].default
      if (params) {
        if (params[key] && typeof params[key].value !== 'undefined') {
          if (Utils.compareKeys(params[key].value, fallback)) {
            this.parameters.buttons.image[key].value = params[key].value
          } else {
            this.parameters.buttons.image[key].value = fallback
          }
        } else {
          this.parameters.buttons.image[key].value = fallback
        }
      } else {
        this.parameters.buttons.image[key].value = fallback
      }
    })

    // console.log(this.parameters)

    // Initialize canvas size
    this.sizes.size = this.parameters.size.value
    this.sizes.resize()
    this.app.resize()

    // Create controllers
    this.buttonOption.create('mode', null, document.querySelector('#input-mode'))
    this.buttonOption.create('size', null, document.querySelector('#input-size'))
    this.buttonColor.create('pattern', document.querySelector('#input-color-pattern'))
    this.buttonColor.create('text', document.querySelector('#input-color-text'))
    // this.buttonColor.create('logo', document.querySelector('#input-color-logo'))
    this.buttonOption.create('keyframe', null, document.querySelector('#input-keyframe'))
    this.textInput.createTextarea(document.querySelector('#input-text'))
    this.imageUpload.create('patternTexture', 'images', document.querySelector('#input-image'))
    // this.imageUpload.create('logoTexture', 'images', document.querySelector('#input-logo'))
    Object.keys(this.parameters.sliders).forEach((key) => {
      let parent = document.querySelector('#input-sliders')
      // if (key === 'loopDuration') parent = document.querySelector('#input-loop-duration')
      if (key === 'textSize') parent = document.querySelector('#input-text-settings')
      else if (key.includes('imageOffset')) parent = document.querySelector('#input-image-position')

      this.slider.create(key, parent)
      // this.slider.setValuePosition(this.parameters.sliders[key])
    })
    this.buttonAction.create(this.parameters.buttons.randomize, document.querySelector('#input-buttons-controls'))
    this.buttonAction.create(this.parameters.buttons.reset, document.querySelector('#input-buttons-controls'))
    this.buttonOption.create('save', 'export', document.querySelector('#input-export-mode'))
    this.buttonOption.create('loop', 'export', document.querySelector('#input-export-loop'))
    this.buttonOption.create('scale', 'export', document.querySelector('#input-export-scale'))
    this.textInput.createInput(this.parameters.export.duration, document.querySelector('#input-export-duration'))
    this.buttonAction.create(this.parameters.buttons.exportPreview, document.querySelector('#input-buttons-export'))
    this.buttonAction.create(this.parameters.buttons.export, document.querySelector('#input-buttons-export'))
    this.buttonAction.create(this.parameters.buttons.textPreview, document.querySelector('#input-text-preview-button'))
    this.buttonAction.create(this.parameters.buttons.logoPreview, document.querySelector('#input-logo-preview-button'))

    this.buttonAction.create(this.parameters.buttons.image.fitWidth, document.querySelector('#input-image-scale-buttons'))
    this.buttonAction.create(this.parameters.buttons.image.fitHeight, document.querySelector('#input-image-scale-buttons'))
    // this.textInput.createInput(this.parameters.imageScale, document.querySelector('#input-image-scale-input'))
    // Object.keys(this.parameters.buttons).forEach((key) => {
    //   this.buttonAction.create(key, document.querySelector('#input-buttons'))
    // })
    // this.buttonAction.createExportButtons()

    // this.setTextures()

    this.setToggleButton()

    this.updateLocalStorage()

    // Object.keys(this.parameters.sliders).forEach((key) => {
    //   this.slider.setValuePosition(this.parameters.sliders[key])
    // })
  }

  getRandomSliderValue = (slider) => {
    const { min, max } = slider.options
    const pres = Utils.precision(slider.options.step)
    return Math.round((Math.random() * (max - min) + min) * 10 ** pres) / 10 ** pres
  }

  // eslint-disable-next-line default-param-last
  setParameter = (params = null, parent = null, name, fallback) => {
    if (params) {
      if (parent) {
        if (params[parent] && params[parent][name] && typeof params[parent][name].value !== 'undefined') {
          if (Utils.compareKeys(params[parent][name].value, fallback)) {
            this.parameters[parent][name].value = params[parent][name].value
          } else {
            this.parameters[parent][name].value = fallback
          }
        } else {
          this.parameters[parent][name].value = fallback
        }
      } else if (params[name] && typeof params[name].value !== 'undefined') {
        if (Utils.compareKeys(params[name].value, fallback)) {
          if (name === 'text' && params[name].value === '') {
            this.parameters[name].value = fallback
          } else {
            this.parameters[name].value = params[name].value
          }
        } else {
          this.parameters[name].value = fallback
        }
      } else {
        this.parameters[name].value = fallback
      }

      if (name === 'size') {
        if (params.sizeCustom && params.sizeCustom.value !== 'undefined') {
          if (Utils.compareKeys(params.sizeCustom.value, this.parameters.size.options.custom)) {
            this.parameters.size.options.custom = params.sizeCustom.value
          }
        }
      }
    } else if (parent) {
      this.parameters[parent][name].value = fallback
    } else {
      this.parameters[name].value = fallback
    }
  }

  updateLocalStorage = () => {
    const values = {
      mode: { value: this.parameters.mode.value },
      size: { value: this.parameters.size.value },
      sizeCustom: { value: this.parameters.size.options.custom },
      keyframe: { value: this.parameters.keyframe.value },
      color: {
        pattern: { value: this.parameters.color.pattern.value },
        text: { value: this.parameters.color.text.value },
        // logo: { value: this.parameters.color.logo.value },
      },
      text: { value: this.parameters.text.value },
      images: {},
      sliders: {},
      export: {},
      imageScale: { value: this.parameters.imageScale.value },
      fitWidth: { value: this.parameters.buttons.image.fitWidth.value },
      fitHeight: { value: this.parameters.buttons.image.fitHeight.value },
      buttons: {
        logoPreview: { value: this.parameters.buttons.logoPreview.value },
      },
    }

    Object.keys(this.parameters.export).forEach((key) => {
      values.export[key] = {
        value: key === 'duration'
          ? parseFloat(this.parameters.export[key].value)
          : this.parameters.export[key].value,
      }
    })

    Object.keys(this.parameters.images).forEach((key) => {
      if (this.parameters.images[key].value) {
        if (this.parameters.images[key].value.source) {
          values.images[key] = {
            value: {
              ...this.parameters.images[key].value,
              source: { ...this.parameters.images[key].value.source, data: null },
            },
          }
        }
      }
    })

    Object.keys(this.parameters.sliders).forEach((key) => {
      values.sliders[key] = {
        value: this.parameters.sliders[key].value,
        default: this.parameters.sliders[key].options.default,
      }
    })

    // console.log('values', JSON.stringify(values))
    // console.log('values', JSON.parse(JSON.stringify(values)))
    window.localStorage.setItem('woneParams', JSON.stringify(values))
  }

  getSliderValue = (name) => {
    const slider = this.parameters.sliders[name]
    if (slider.keyframes) {
      const keyframe = this.parameters.keyframe.value.key

      let value = slider.value[keyframe]

      // console.log(this.time.elapsedTime)

      if (this.parameters.buttons.exportPreview.value || this.app.export.recording.animation) {
        const duration = this.parameters.export.duration.value
        let t = ((this.time.elapsedTime - this.app.export.recordStartTime) % duration) / duration
        // if (name === 'frequencyA') console.log(t)
        // // t = easeInOutCubic(t)
        const pad = 0.2

        // Need to bias ending pattern so has time to settle (>2s generally)
        if (this.parameters.export.loop.value.key === 'linear') {
          if (t < pad * 0) t = 0
          else if (t < 1 - pad) t = Utils.map(t, pad * 0, 1 - pad, 0, 1)
          else t = 1
        } else if (this.parameters.export.loop.value.key === 'loop') {
          if (t < 0.5) t = Utils.map(t, 0, 0.5, 0, 1)
          else t = Utils.map(t, 0.5, 1, 1, 0)
          // t = Math.sin(t * (Math.PI / 2))
        }
        t = Easing.easeInOutCubic(t)
        value = Utils.lerp(slider.value.a, slider.value.b, t)
      }

      return value

      // const values = []
      // Object.keys(slider.value).sort().forEach((keyframe) => {
      //   values.push(slider.value[keyframe])
      // })
      // return new THREE.Vector2(...values)
    }

    return slider.value
  }

  setToggleButton = () => {
    const button = document.querySelector('#controls-toggle')
    const buttonLabel = button.querySelector('label')
    const controls = document.querySelector('.controls-inner')
    const controlsContainer = document.querySelector('.controls')

    button.addEventListener('click', (event) => {
      event.preventDefault()

      controls.classList.toggle('hidden')
      controlsContainer.classList.toggle('controls-open')
      button.classList.toggle('hide')

      if (controls.classList.contains('hidden')) {
        buttonLabel.innerHTML = 'Show Controls'
      } else {
        buttonLabel.innerHTML = 'Hide Controls'
      }
    })

    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && document.activeElement === button) {
        event.preventDefault()
        button.click()
      }
    })
  }
}
