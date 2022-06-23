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
        label: 'Size',
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
          a: { name: 'Keyframe A' },
          b: { name: 'Keyframe B' },
        },
        controllers: {},
      },

      export: {
        save: {
          modes: [],
          label: 'Export As',
          // label: null,
          options: {
            still: { name: 'Image' },
            animation: { name: 'Image Sequence' },
          },
          controllers: {},
        },

        loop: {
          modes: [],
          label: 'Sequence Mode',
          exportModes: ['animation'],
          // label: null,
          options: {
            linear: { name: 'Linear (A → B)' },
            loop: { name: 'Loop (A → B → A)' },
          },
          controllers: {},
        },

        duration: {
          modes: [],
          label: 'Duration (seconds)',
          exportModes: ['animation'],
          // label: null,
          default: 8,
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
          label: 'Color Palette',
          options: {
            blue: { name: 'Blue', background: '#BEC0E1', primary: '#0F57E5' },
            orange: { name: 'Orange', background: '#D6B2D9', primary: '#C55F36' },
            red: { name: 'Red', background: '#ED897F', primary: '#C3405B' },
          },
          controllers: {},
        },

        text: {
          modes: ['text'],
          label: 'Text Color',
          options: {
            light: { name: 'Light', background: '#1D1D1B', primary: '#E1E0D3' },
            dark: { name: 'Dark', background: '#E1E0D3', primary: '#1D1D1B' },
          },
          controllers: {},
        },
      },

      sliders: {
        frequency: {
          modes: ['pattern', 'image'],
          options: {
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
          modes: ['pattern', 'image'],
          options: {
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
          options: {
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
          options: {
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
          options: {
            min: 0,
            max: 1,
            step:
            0.01,
            default: 0,
            label: 'Grain',
            // range: ['0', '100'],
            range: [],
          },
        },

        displacement: {
          modes: ['image'],
          options: {
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
          modes: ['text'],
          options: {
            min: 12,
            max: 128,
            step: 1,
            default: 22,
            label: 'Text Size',
            range: ['12pt', '128pt'],
          },
        },

        textOffset: {
          modes: ['text'],
          options: {
            min: 0,
            max: 1,
            step: 0.01,
            default: 1,
            label: 'X Offset',
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
        modes: ['text'],
        label: 'Text',
      },

      image: {
        modes: ['image'],
        label: 'Image Upload',
        name: 'patternTexture',
      },

      buttons: {
        randomize: {
          modes: [],
          name: 'Randomize',
          label: 'Randomize',
          handleClick: () => this.slider.randomize(),
        },

        textPreview: {
          modes: ['pattern', 'image'],
          name: 'TextPreview',
          label: 'Show Text Preview',
          handleClick: () => { console.log('preview text') },
        },

        reset: {
          modes: [],
          name: 'Reset',
          label: 'Reset',
          handleClick: () => this.slider.reset(),
        },

        export: {
          modes: [],
          name: 'Export',
          label: 'Export',
          options: {
            scale: [1, 2, 3, 4],
          },
          value: {
            scale: 1,
          },
          handleClick: () => { this.app.export.recording = true },
        },

        exportPreview: {
          modes: [],
          exportModes: ['animation'],
          name: 'Preview',
          label: 'Preview',
          handleClick: () => { console.log('Export Preview') },
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
    Object.keys(this.parameters.sliders).forEach((key) => {
      this.setParameter(params, 'sliders', key, this.parameters.sliders[key].options.default)
    })
    this.setParameter(params, null, 'text', 'WONE IS\nA NEW MODEL\nOF HEALTH FOR\nTHE\nMODERN\nWORKPLACE')

    // Initialize canvas size
    this.sizes.size = this.parameters.size.value
    this.sizes.resize()
    this.app.resize()

    // Create controllers
    this.buttonOption.create('mode', null, document.querySelector('#input-mode'))
    this.buttonOption.create('size', null, document.querySelector('#input-size'))
    this.buttonColor.create('pattern', document.querySelector('#input-color-pattern'))
    this.buttonColor.create('text', document.querySelector('#input-color-text'))
    this.buttonOption.create('keyframe', null, document.querySelector('#input-keyframe'))
    this.textInput.createTextarea(document.querySelector('#input-text'))
    this.imageUpload.create(document.querySelector('#input-image'))
    Object.keys(this.parameters.sliders).forEach((key) => {
      let parent = document.querySelector('#input-sliders')
      // if (key === 'loopDuration') parent = document.querySelector('#input-loop-duration')
      if (key === 'textSize') parent = document.querySelector('#input-text-settings')
      this.slider.create(key, parent)
    })
    this.buttonAction.create('randomize', document.querySelector('#input-buttons-controls'))
    this.buttonAction.create('reset', document.querySelector('#input-buttons-controls'))
    this.buttonOption.create('save', 'export', document.querySelector('#input-export-mode'))
    this.buttonOption.create('loop', 'export', document.querySelector('#input-export-loop'))
    this.buttonOption.create('scale', 'export', document.querySelector('#input-export-scale'))
    this.textInput.createInput('duration', 'export', document.querySelector('#input-export-duration'))
    this.buttonAction.create('exportPreview', document.querySelector('#input-buttons-export'))
    this.buttonAction.create('export', document.querySelector('#input-buttons-export'))
    this.buttonAction.create('textPreview', document.querySelector('#input-text-preview-button'))
    // Object.keys(this.parameters.buttons).forEach((key) => {
    //   this.buttonAction.create(key, document.querySelector('#input-buttons'))
    // })
    // this.buttonAction.createExportButtons()

    // this.setTextures()

    this.setToggleButton()

    this.updateLocalStorage()
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
      color: {
        pattern: { value: this.parameters.color.pattern.value },
        text: { value: this.parameters.color.text.value },
      },
      text: { value: this.parameters.text.value },
      image: {},
      sliders: {},
    }

    if (this.parameters.image.value) {
      if (this.parameters.image.value.source) {
        values.image.value = {
          ...this.parameters.image.value,
          source: { ...this.parameters.image.value.source, data: null },
        }
      }
    }

    Object.keys(this.parameters.sliders).forEach((key) => {
      values.sliders[key] = {
        value: this.parameters.sliders[key].value,
      }
    })

    window.localStorage.setItem('woneParams', JSON.stringify(values))
  }

  setToggleButton = () => {
    const button = document.querySelector('#controls-toggle')
    const buttonLabel = button.querySelector('label')
    const controls = document.querySelector('.controls-inner')

    button.addEventListener('click', (event) => {
      event.preventDefault()

      controls.classList.toggle('hidden')
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
