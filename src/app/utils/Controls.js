/* eslint-disable class-methods-use-this */

import App from '../App'
import EventEmitter from './EventEmitter'

export default class Controls extends EventEmitter {
  constructor() {
    super()

    this.app = new App()
    this.capturer = this.app.capturer
    this.resources = this.app.resources
    this.sizes = this.app.sizes
    this.camera = this.app.camera
    this.renderer = this.app.renderer

    this.parameters = {

      mode: {
        modes: [],
        options: {
          pattern: { name: 'Pattern' },
          image: { name: 'Image' },
          text: { name: 'Text' },
        },
        controllers: {},
      },

      size: {
        modes: [],
        options: {
          square: {
            name: 'Square', aspect: '1:1', width: 1080, height: 1080,
          },
          portrait: {
            name: 'Portrait', aspect: '16:9', width: 1080, height: 1920,
          },
        },
        controllers: {},
      },

      color: {
        pattern: {
          modes: ['pattern'],
          options: {
            blue: { name: 'Blue', background: '#BEC0E1', primary: '#0F57E5' },
            orange: { name: 'Orange', background: '#D6B2D9', primary: '#C55F36' },
            red: { name: 'Red', background: '#ED897F', primary: '#C3405B' },
          },
          controllers: {},
        },

        text: {
          modes: ['text'],
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

        // lineHeight: {
        //   modes: ['text'],
        //   options: {
        //     min: 0.5,
        //     max: 2,
        //     step: 0.01,
        //     default: 0.8,
        //     label: 'Line Height',
        //     // range: ['12pt', '128pt'],
        //     // range: ['50%', '200%'],
        //     range: [],
        //   },
        // },

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
          handleClick: () => {
            if (this.parameters.mode.value.name === 'Text') {
              if (this.app.mode && this.app.mode.activeMode.name === 'Text'
              && this.app.mode.mode && this.app.mode.mode.randomizeXOffset) {
                this.app.mode.mode.randomizeXOffset()
              }
            } else {
              const { sliders } = this.parameters
              const keys = ['frequency', 'frequencyB', 'distortion']
              keys.forEach((key) => {
                const slider = sliders[key]
                const { min, max } = slider.options
                const pres = this.precision(slider.options.step)
                const value = Math.round((Math.random() * (max - min) + min) * 10 ** pres) / 10 ** pres
                slider.value = value
                slider.controller.value = value

                const sliderInput = slider.controller
                const sliderValue = sliderInput.nextElementSibling
                sliderValue.innerHTML = value
                const left = this.map(value, min, max, 0, sliderInput.offsetWidth - sliderValue.offsetWidth)
                sliderValue.style.left = `${left}px`
              })
              this.trigger('parameter-update-slider-random')
              this.updateLocalStorage()
            }
          },
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
          handleClick: () => {
            // this.app.export.recording = true
            // this.capturer.start()

            // const screenshot = this.app.canvas.toDataURL("image/png");
            // let a = document.createElement('a');
            // a.href = screenshot;
            // a.download = "screenshot.png";
            // document.body.appendChild(a);
            // a.click();
            // document.body.removeChild(a);
            const exportConfigOptions = document.querySelector('#export-options')
            exportConfigOptions.style.display = 'none'

            this.app.export.recording = true
          },
        },
      },
    }

    this.init()
  }

  init = () => {
    let params = null
    if (window.localStorage.getItem('woneParams')) {
      params = JSON.parse(window.localStorage.getItem('woneParams'))
    }

    // Initialize values
    this.setParam(params, null, 'mode', this.parameters.mode.options.pattern)
    this.setParam(params, null, 'size', this.parameters.size.options.square)
    this.setParam(params, 'color', 'pattern', this.parameters.color.pattern.options.blue)
    this.setParam(params, 'color', 'text', this.parameters.color.text.options.dark)
    Object.keys(this.parameters.sliders).forEach((key) => {
      this.setParam(params, 'sliders', key, this.parameters.sliders[key].options.default)
    })
    this.setParam(params, null, 'text', 'WONE IS\nA NEW MODEL\nOF HEALTH FOR\nTHE\nMODERN\nWORKPLACE')

    this.sizes.size = this.parameters.size.value
    this.sizes.resize()
    this.app.resize()

    // Setup
    this.inputs = document.getElementById('inputs')
    this.createOptionButtons('mode', document.querySelector('#input-mode'))
    this.createOptionButtons('size', document.querySelector('#input-size'))
    this.createColorButtons('pattern', document.querySelector('#input-color-pattern'))
    this.createColorButtons('text', document.querySelector('#input-color-text'), false)
    Object.keys(this.parameters.sliders).forEach((key) => {
      this.createSlider(key, document.querySelector('#input-sliders'))
    })
    Object.keys(this.parameters.buttons).forEach((key) => {
      this.createButton(key, document.querySelector('#input-buttons'))
    })
    this.createTextarea(document.querySelector('#input-text'))
    this.createImageUpload(document.querySelector('#input-image'))
    this.createExportButtons()

    this.setTextures()

    // Add detailed label to size buttons
    Object.keys(this.parameters.size.controllers).forEach((key) => {
      const size = this.parameters.size.options[key]
      const button = this.parameters.size.controllers[key]
      const buttonLabel = button.querySelector('label')
      // buttonLabel.innerHTML = `${size.aspect}<br><span>${size.width}x${size.height}</span>`
      buttonLabel.innerHTML = `${size.name}<br><span>${size.width}x${size.height}</span>`
    })

    this.updateLocalStorage()

    document.addEventListener('click', (event) => {
      // console.log(event.target)
      const { target } = event

      const exportButtonContainer = document.querySelector('.export-button-container')
      const exportConfigBtn = document.querySelector('#export-config')
      const exportConfig = document.querySelector('#export-options')
      const exportConfigOptions = exportConfig.querySelectorAll('.export-option')

      let inFocus = false
      exportConfigOptions.forEach((button) => {
        if (target === button) inFocus = true
      })
      if (target === exportConfigBtn) inFocus = true
      if (target === exportConfig) inFocus = true

      if (!inFocus) {
        if (exportConfig.style.display !== 'none') {
          exportConfig.style.display = 'none'
        }
        exportButtonContainer.classList.remove('config-open')
      }
    })

    this.parameters.buttons.export.value.scale = 1
  }

  // eslint-disable-next-line default-param-last
  setParam = (params = null, parent = null, name, fallback) => {
    if (params) {
      if (parent) {
        if (params[parent] && params[parent][name] && typeof params[parent][name].value !== 'undefined') {
          if (this.compareKeys(params[parent][name].value, fallback)) {
            this.parameters[parent][name].value = params[parent][name].value
          } else {
            this.parameters[parent][name].value = fallback
          }
        } else {
          this.parameters[parent][name].value = fallback
        }
      } else if (params[name] && typeof params[name].value !== 'undefined') {
        if (this.compareKeys(params[name].value, fallback)) {
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
    } else if (parent) {
      this.parameters[parent][name].value = fallback
    } else {
      this.parameters[name].value = fallback
    }
  }

  compareKeys = (a, b) => {
    // Check type of values first (some e.g. sliders are just numbers)
    if (typeof a !== 'object' || typeof b !== 'object') {
      return typeof a === typeof b
    }

    // Compare object properties
    const aKeys = Object.keys(a).sort()
    const bKeys = Object.keys(b).sort()
    const aTypes = aKeys.map((key) => typeof a[key])
    const bTypes = aKeys.map((key) => typeof b[key])
    return (JSON.stringify(aKeys) === JSON.stringify(bKeys)) && (JSON.stringify(aTypes) === JSON.stringify(bTypes))
  }

  setTextures = () => {
    const { image } = this.parameters

    // Resources (already loaded)
    if (this.resources.itemsUser[image.name]) {
      this.updateTexture('itemsUser')
    } else if (this.resources.items[image.name]) {
      this.updateTexture('items')
    }

    // Default resources (new load)
    this.resources.on('ready', () => {
      this.updateTexture('items')
    })

    // Uploaded resources
    this.resources.on(`ready-${image.name}`, () => {
      this.updateTexture('itemsUser')
    })
  }

  updateTexture = (items) => {
    // Update image value
    const { image } = this.parameters
    image.value = this.resources[items][image.name]

    // Update drag and drop background image
    const controllerBg = image.controller.querySelector('.drop-zone-inner')
    controllerBg.style.backgroundImage = `url(${image.value.file.image.src})`

    this.updateLocalStorage()
    this.trigger('texture-update')
  }

  updateLocalStorage = () => {
    const values = {
      mode: { value: this.parameters.mode.value },
      size: { value: this.parameters.size.value },
      color: {
        pattern: { value: this.parameters.color.pattern.value },
        text: { value: this.parameters.color.text.value },
      },
      text: { value: this.parameters.text.value },
      image: {
        // value: {
        //   ...this.parameters.image.value,
        //   source: { ...this.parameters.image.value.source, data: null },
        // }
      },
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

  createExportButtons = () => {
    const exportButtonContainer = document.querySelector('.export-button-container')
    const exportBtnConfig = document.querySelector('#export-config')

    const scales = this.parameters.buttons.export.options.scale
    // const buttonContainer = document.querySelector('#export-overlay .export-options')
    const buttonContainer = document.createElement('div')
    buttonContainer.setAttribute('id', 'export-options')
    buttonContainer.setAttribute('class', 'export-options')
    buttonContainer.style.display = 'none'
    scales.forEach((scale) => {
      const button = document.createElement('div')
      button.setAttribute('class', 'export-option')
      button.setAttribute('tabindex', '0')
      button.dataset.scale = scale
      if (scale === 1) button.classList.add('selected')
      const label = document.createElement('label')
      label.innerHTML = `${scale}x <span>${this.sizes.width * scale}x${this.sizes.height * scale}</span>`
      label.style.pointerEvents = 'none'
      label.querySelector('span').style.pointerEvents = 'none'
      button.appendChild(label)
      buttonContainer.appendChild(button)

      button.addEventListener('click', (event) => {
        // console.log(event.target)
        // console.log('click')
        event.preventDefault()
        if (scale !== this.parameters.buttons.export.value.scale) {
          this.parameters.buttons.export.value.scale = scale
          exportBtnConfig.value = `${this.parameters.buttons.export.value.scale}x`
          // console.log(this.parameters.buttons.export.value.scale)
          const optionButtons = buttonContainer.querySelectorAll('.export-option')
          optionButtons.forEach((option) => option.classList.remove('selected'))
          button.classList.add('selected')
        }
        buttonContainer.style.display = 'none'
        exportButtonContainer.classList.remove('config-open')
      })

      button.addEventListener('keydown', (event) => {
        // console.log('enter')
        if (event.key === 'Enter' && document.activeElement === button) {
          event.preventDefault()
          button.click()
        }
      })
    })
    const exportBtn = this.parameters.buttons.export.controller

    exportBtnConfig.value = `${this.parameters.buttons.export.value.scale}x`

    exportBtn.parentNode.appendChild(buttonContainer)
    buttonContainer.style.top = `-${buttonContainer.offsetHeight + 10}px`
  }

  createOptionButtons = (name, parent) => {
    parent.classList.add(...this.parameters[name].modes.map((mode) => `${mode}-mode`))
    const buttonContainer = parent.querySelector(`.${name}-blocks`)
    Object.keys(this.parameters[name].options).forEach((key) => {
      const value = this.parameters[name].options[key]
      const button = document.createElement('div')
      const buttonImg = document.createElement('div')
      const buttonLabel = document.createElement('label')
      button.setAttribute('class', `${name}-block`)
      button.setAttribute('tabindex', '0')
      button.dataset[name] = key
      buttonImg.setAttribute('class', `${name}-block-img`)
      buttonLabel.innerText = value.name
      button.appendChild(buttonImg)
      button.appendChild(buttonLabel)
      buttonContainer.append(button)
      this.parameters[name].controllers[key] = button

      if (this.parameters[name].value.name === value.name) {
        button.classList.add('selected')
        this.inputs.classList.remove(...Object.keys(this.parameters[name].options).map((key_) => `${name}-${key_}`))
        this.inputs.classList.add(`${name}-${key}`)
      }

      button.addEventListener('click', () => {
        if (button.classList.contains('selected')) return
        Object.keys(this.parameters[name].controllers).forEach((controller) => {
          this.parameters[name].controllers[controller].classList.remove('selected')
        })
        button.classList.add('selected')
        this.parameters[name].value = value

        this.inputs.classList.remove(...Object.keys(this.parameters[name].options).map((key_) => `${name}-${key_}`))
        this.inputs.classList.add(`${name}-${key}`)

        if (name === 'mode') {
          this.app.setMode()
        } else if (name === 'size') {
          this.sizes.size = value
          this.sizes.resize()
          const exportConfigOptions = document.querySelectorAll('#export-options .export-option')
          exportConfigOptions.forEach((option) => {
            const scale = parseFloat(option.dataset.scale)
            const label = option.querySelector('label')
            const span = label.querySelector('span')
            span.innerHTML = `${this.sizes.width * scale}x${this.sizes.height * scale}`
            label.style.pointerEvents = 'none'
            span.style.pointerEvents = 'none'
          })
        }

        this.updateLocalStorage()
      })

      button.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && document.activeElement === button) {
          event.preventDefault()
          button.click()
        }
      })
    })
  }

  createColorButtons = (name, parent, inner = true) => {
    parent.classList.add(...this.parameters.color[name].modes.map((mode) => `${mode}-mode`))
    const buttonContainer = parent.querySelector('.color-blocks')
    const keys = Object.keys(this.parameters.color[name].options)
    keys.forEach((key, i) => {
      const value = this.parameters.color[name].options[key]
      const button = document.createElement('div')
      const buttonDivide = document.createElement('div')
      button.setAttribute('class', 'color-block')
      button.setAttribute('tabindex', '0')
      buttonDivide.setAttribute('class', 'color-block-divide')
      button.style.backgroundColor = name === 'text' ? value.primary : value.background
      if (name !== 'text') button.style.borderColor = value.background
      if (inner) {
        const buttonInner = document.createElement('div')
        buttonInner.setAttribute('class', 'color-block-inner')
        buttonInner.style.backgroundColor = value.primary
        button.appendChild(buttonInner)
      }
      buttonContainer.append(button)
      if (i < keys.length - 1) buttonContainer.append(buttonDivide)
      this.parameters.color[name].controllers[key] = button

      if (this.parameters.color[name].value.name === value.name) {
        button.classList.add('selected')
      }

      button.addEventListener('click', () => {
        if (button.classList.contains('selected')) return
        Object.keys(this.parameters.color[name].controllers).forEach((controller) => {
          this.parameters.color[name].controllers[controller].classList.remove('selected')
        })
        button.classList.add('selected')
        this.parameters.color[name].value = value

        if (name !== 'text') this.renderer.instance.setClearColor(value.background)
        this.trigger('parameter-update-color')

        this.updateLocalStorage()
      })

      button.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && document.activeElement === button) {
          event.preventDefault()
          button.click()
        }
      })
    })
  }

  map = (value, low1, high1, low2, high2) => low2 + ((high2 - low2) * (value - low1)) / (high1 - low1)

  precision = (a) => {
    if (!Number.isFinite(a)) return 0
    let e = 1
    let p = 0
    while (Math.round(a * e) / e !== a) {
      e *= 10
      p += 1
    }
    return p
  }

  createButton = (name, parent) => {
    const button = this.parameters.buttons[name]

    const buttonContainer = document.createElement('div')
    buttonContainer.classList.add('input', 'button', name)
    buttonContainer.classList.add(...this.parameters.buttons[name].modes.map((mode) => `${mode}-mode`))

    const buttonInput = document.createElement('input')
    buttonInput.setAttribute('type', 'submit')
    buttonInput.setAttribute('id', name)
    buttonInput.setAttribute('value', button.label)
    buttonInput.setAttribute('tabindex', '0')

    buttonInput.addEventListener('click', (event) => {
      event.preventDefault()
      button.handleClick()
    })

    this.parameters.buttons[name].controller = buttonInput

    if (name === 'export') {
      const exportButtonContainer = document.createElement('div')
      exportButtonContainer.setAttribute('class', 'export-button-container')
      const buttonConfigInput = document.createElement('input')
      buttonConfigInput.setAttribute('type', 'submit')
      buttonConfigInput.setAttribute('id', `${name}-config`)
      buttonConfigInput.setAttribute('value', '1x')
      buttonConfigInput.setAttribute('tabindex', '0')
      buttonConfigInput.addEventListener('click', () => {
        const exportConfigOptions = document.querySelector('#export-options')
        exportConfigOptions.style.display = exportConfigOptions.style.display === 'none' ? 'flex' : 'none'
        // if (exportButtonContainer.classList.contains('config-open')) {
        //   exportButtonContainer.classList.remove('config-open')
        // } else {
        //   exportButtonContainer.classList.add('config-open')
        // }
        exportButtonContainer.classList.toggle('config-open')
        exportConfigOptions.style.top = `-${exportConfigOptions.offsetHeight + 10}px`
      })
      exportButtonContainer.appendChild(buttonInput)
      exportButtonContainer.appendChild(buttonConfigInput)
      buttonContainer.appendChild(exportButtonContainer)
    } else {
      buttonContainer.appendChild(buttonInput)
    }

    parent.appendChild(buttonContainer)
  }

  createSlider = (name, parent) => {
    const slider = this.parameters.sliders[name]

    const inputContainer = document.createElement('div')
    inputContainer.classList.add('input', name)
    inputContainer.classList.add(...slider.modes.map((mode) => `${mode}-mode`))

    const sliderContainer = document.createElement('div')
    sliderContainer.classList.add('input-slider')

    const sliderSpan = document.createElement('span')
    sliderSpan.classList.add('input-slider-bg')

    const sliderValue = document.createElement('span')
    sliderValue.classList.add('input-slider-value')
    sliderValue.innerHTML = slider.value

    const sliderInput = document.createElement('input')
    const attributes = {
      type: 'range',
      min: slider.options.min,
      max: slider.options.max,
      step: slider.options.step,
      value: slider.value,
      tabindex: '0',
      id: name,
      class: 'slider',
    }
    this.setAttributes(sliderInput, attributes)

    sliderInput.addEventListener('input', (event) => {
      slider.value = parseFloat(event.target.value)
      sliderValue.innerHTML = slider.value

      // sliderValue.style.left = `${this.map(slider.value, slider.options.min, slider.options.max, 0, 100)}%`
      // const leftMax = sliderInput.offsetWidth - sliderValue.offsetWidth
      const leftMax = 540 - sliderValue.offsetWidth
      const left = this.map(slider.value, slider.options.min, slider.options.max, 0, leftMax)
      sliderValue.style.left = `${left}px`

      this.updateLocalStorage()

      this.trigger('parameter-update-slider')
    })

    slider.controller = sliderInput

    sliderContainer.appendChild(sliderSpan)
    sliderContainer.appendChild(sliderInput)
    sliderContainer.appendChild(sliderValue)

    const range = document.createElement('div')
    range.classList.add('range')
    const rangeMin = slider.options.range[0] || slider.options.min
    const rangeMax = slider.options.range[1] || slider.options.max
    // range.innerHTML = `<div>${rangeMin}</div><div>${rangeMax}</div>`
    range.innerHTML = `
      <div class="min">${rangeMin}</div>
      <label>${slider.options.label}</label>
      <div class="max">${rangeMax}</div>
    `

    const label = document.createElement('label')
    label.setAttribute('for', name)
    label.innerText = slider.options.label || ''

    inputContainer.appendChild(sliderContainer)
    inputContainer.appendChild(range)
    // inputContainer.appendChild(label)

    parent.appendChild(inputContainer)
    // const leftMax = sliderInput.offsetWidth - sliderValue.offsetWidth
    const leftMax = 540 - sliderValue.offsetWidth
    const left = this.map(slider.value, slider.options.min, slider.options.max, 0, leftMax)
    sliderValue.style.left = `${left}px`
  }

  setAttributes = (element, attributes) => {
    Object.keys(attributes).forEach((attr) => {
      element.setAttribute(attr, attributes[attr])
    })
  }

  createTextarea = (parent) => {
    const { text } = this.parameters

    parent.classList.add(...text.modes.map((mode) => `${mode}-mode`))

    const textarea = document.createElement('textarea')
    const label = document.createElement('label')

    textarea.setAttribute('tabindex', '0')
    textarea.value = text.value
    textarea.addEventListener('keyup', (event) => {
      text.value = event.target.value

      this.trigger('parameter-update-text')

      this.updateLocalStorage()
    })
    label.innerHTML = text.label

    parent.appendChild(textarea)
    parent.appendChild(label)

    text.controller = textarea
  }

  createImageUpload = (parent) => {
    const { image } = this.parameters

    parent.classList.add(...image.modes.map((mode) => `${mode}-mode`))

    const dropzone = document.createElement('div')
    dropzone.setAttribute('id', 'drop-zone')
    dropzone.setAttribute('tabindex', '0')

    const dropzoneInner = document.createElement('div')
    dropzoneInner.classList.add('drop-zone-inner')

    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', '.jpg, .jpeg, .png')
    input.setAttribute('id', 'file-selector')
    input.style.display = 'none'
    input.addEventListener('change', (event) => {
      const file = event.target.files[0]
      this.resources.loadFile(file, image.name)
    })
    dropzoneInner.appendChild(input)

    const dropzoneText = document.createElement('p')
    dropzoneText.innerText = 'Click here or\nDrag an image here'

    const dropzoneBg = document.createElement('div')
    dropzoneBg.classList.add('drop-zone-bg')

    dropzoneInner.appendChild(dropzoneText)
    dropzoneInner.appendChild(dropzoneBg)
    dropzone.appendChild(dropzoneInner)

    const label = document.createElement('label')
    label.innerHTML = image.label

    parent.appendChild(dropzone)
    parent.appendChild(label)

    this.parameters.image.controller = dropzone

    dropzone.addEventListener('click', () => {
      input.click()
    })

    dropzone.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && document.activeElement === dropzone) {
        event.preventDefault()
        input.click()
      }
    })

    dropzone.addEventListener('drop', (event) => {
      event.preventDefault()

      if (event.dataTransfer.items) {
        this.handleDragAndDrop(event.dataTransfer.items, image)
      } else if (event.dataTransfer.files) {
        this.handleDragAndDrop(event.dataTransfer.files, image)
      }
    })

    dropzone.addEventListener('dragover', (event) => {
      event.preventDefault()
      dropzone.focus()
    })
  }

  handleDragAndDrop = (items, image) => {
    if (items.length > 0) {
      if (items.length > 1) {
        console.warn('Only 1 file can be uploaded, uploading first file only')
      }
      // Limit to one file
      const item = items[0]

      // Check file is an image
      if (item.kind === 'file' && ['image/png', 'image/jpeg'].includes(item.type)) {
        const file = item.getAsFile()
        this.resources.loadFile(file, image.name)
      } else {
        console.warn('Invalid file type, only images (.jpg, .jpeg .png) allowed')
      }
    }
  }
}
