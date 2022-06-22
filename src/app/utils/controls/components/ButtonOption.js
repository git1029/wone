/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */

import App from '../../../App'
import Controls from '../Controls'
import * as Utils from '../utils/Utils'

export default class ButtonOption {
  constructor() {
    this.app = new App()
    this.controls = new Controls()
    this.parameters = this.controls.parameters
    this.sizes = this.app.sizes
  }

  create = (name, paramParent = null, parent = document.querySelector('#inputs')) => {
    const parameter = paramParent ? this.parameters[paramParent][name] : this.parameters[name]

    if (parameter.modes) {
      parent.classList.add(...parameter.modes.map((mode) => `${mode}-mode`))
    }

    if (parameter.exportModes) {
      parent.classList.add(...parameter.exportModes.map((mode) => `${mode}-save`))
    }

    if (parameter.sizeModes) {
      parent.classList.add(...parameter.sizeModes.map((mode) => `${mode}-size`))
    }

    const inputs = document.getElementById('inputs')

    const customContainer = document.createElement('div')
    customContainer.setAttribute('class', 'input-custom-size-container custom-size')

    const buttonContainer = document.createElement('div')
    buttonContainer.setAttribute('class', `button-options ${name}-options`)

    if (name === 'size') {
      const buttonContainerInner = document.createElement('div')
      buttonContainerInner.setAttribute('class', 'button-options-inner')
    }

    const options = Object.keys(parameter.options)
    options.forEach((key) => {
      const value = parameter.options[key]
      const button = document.createElement('div')
      const buttonImg = document.createElement('div')
      const buttonRadio = document.createElement('div')
      buttonRadio.setAttribute('class', 'button-option-radio')
      buttonRadio.innerHTML = '<div></div>'
      const buttonLabel = document.createElement('label')

      button.setAttribute('class', `button-option ${name}-option ${name}-${key}`)
      button.setAttribute('tabindex', '0')
      button.dataset[name] = key
      buttonImg.setAttribute('class', `option-img ${name}-option-img`)
      if (name === 'size') {
        buttonLabel.innerHTML = `${value.name}<br><span>${value.width}x${value.height}</span>`
      } else {
        buttonLabel.innerText = value.name
      }

      if (name === 'size' && key === 'custom') {
        this.createCustomSize(customContainer)
      }

      button.appendChild(buttonImg)
      button.appendChild(buttonRadio)
      button.appendChild(buttonLabel)
      buttonContainer.append(button)

      parameter.controllers[key] = button
      this.controls.controllers.push(button)

      if (parameter.value.name === value.name) {
        button.classList.add('selected')
        inputs.classList.remove(...options.map((key_) => `${name}-${key_}`))
        inputs.classList.add(`${name}-${key}`)
      }

      button.addEventListener('click', () => {
        if (button.classList.contains('selected')) return
        Object.keys(parameter.controllers).forEach((controller) => {
          parameter.controllers[controller].classList.remove('selected')
        })
        button.classList.add('selected')
        parameter.value = value

        inputs.classList.remove(...options.map((key_) => `${name}-${key_}`))
        inputs.classList.add(`${name}-${key}`)

        if (name === 'mode') {
          this.controls.app.setMode()
        } else if (name === 'size') {
          this.updateCanvasSize(value)
        } else if (name === 'keyframe') {
          console.log(`${name}-${key}`)
        } else if (name === 'scale') {
          const label = document.querySelector('#input-export-scale > label')
          const width = this.parameters.size.value.width * parameter.value.scale
          const height = this.parameters.size.value.height * parameter.value.scale
          label.innerHTML = `${parameter.label}<span>Output size: ${width}x${height}</span>`
        }

        this.controls.updateLocalStorage()
      })

      button.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && document.activeElement === button) {
          event.preventDefault()
          button.click()
        }
      })
    })

    parent.appendChild(buttonContainer)
    if (name === 'size') parent.appendChild(customContainer)
    if (parameter.label) {
      const label = document.createElement('label')
      label.innerHTML = parameter.label
      if (paramParent === 'export' && name === 'scale') {
        const width = this.parameters.size.value.width * parameter.value.scale
        const height = this.parameters.size.value.height * parameter.value.scale
        label.innerHTML = `${parameter.label}<span>Output size: ${width}x${height}</span>`
      }
      parent.appendChild(label)
    }
  }

  createCustomSize = (parent) => {
    const customSizes = ['width', 'height']

    const inputs = {}

    const attributes = {
      type: 'number',
      min: 100,
      max: 5000,
      tabindex: '0',
    }

    const container = document.createElement('div')
    container.setAttribute('class', 'input-custom-size-container-inner')
    parent.appendChild(container)

    const errorMsg = document.createElement('span')
    errorMsg.setAttribute('class', 'custom-size error')
    errorMsg.innerHTML = `Min: ${attributes.min}px / Max: ${attributes.max}px`
    parent.appendChild(errorMsg)

    const applyBtnDiv = document.createElement('div')
    applyBtnDiv.setAttribute('class', 'input button button-small')

    const applyBtn = document.createElement('input')
    applyBtn.setAttribute('tabindex', '0')
    applyBtn.setAttribute('type', 'submit')
    applyBtn.setAttribute('value', 'Apply')

    customSizes.forEach((size) => {
      const input = document.createElement('input')
      attributes.value = size === 'width'
        ? this.parameters.size.options.custom.width
        : this.parameters.size.options.custom.height
      attributes.class = `input-custom-${size}`

      Utils.setAttributes(input, attributes)

      inputs[size] = input

      input.addEventListener('keyup', (event) => {
        this.checkInput(event, attributes, input, inputs, parent, applyBtn)
      })

      input.addEventListener('blur', (event) => {
        this.checkInput(event, attributes, input, inputs, parent, applyBtn)
      })

      this.controls.controllers.push(input)
      container.appendChild(input)

      if (size === 'width') {
        const labelMid = document.createElement('label')
        labelMid.innerHTML = 'x'
        container.appendChild(labelMid)
      }
    })

    applyBtn.addEventListener('click', (event) => {
      event.preventDefault()

      if (applyBtn.disabled === true) return

      customSizes.forEach((size) => {
        const value = parseFloat(inputs[size].value)
        if (value < attributes.min || value > attributes.max || inputs[size].value.length === 0) {
          if (!inputs[size].classList.contains('error')) {
            inputs[size].classList.add('error')
          }
        } else {
          inputs[size].classList.remove('error')
        }
      })

      const isError = Object.keys(inputs)
        .map((size) => inputs[size].classList.contains('error'))
        .some((bool) => bool === true)

      if (isError) {
        if (!parent.classList.contains('error')) parent.classList.add('error')
        applyBtn.disabled = true
      }

      if (isError) return

      parent.classList.remove('error')
      applyBtn.disabled = false

      const parameter = this.parameters.size
      const width = parseFloat(inputs.width.value)
      const height = parseFloat(inputs.height.value)
      parameter.options.custom.width = width
      parameter.options.custom.height = height
      if (parameter.value.name === 'Custom') {
        parameter.value.width = width
        parameter.value.height = height
      }

      const label = document.querySelector('.button-option.size-custom > label')
      label.innerHTML = `Custom<br><span>${width}x${height}</span>`

      this.updateCanvasSize(parameter.value)

      this.controls.updateLocalStorage()
    })

    const labelEnd = document.createElement('label')
    labelEnd.innerHTML = 'px'
    container.appendChild(labelEnd)

    this.controls.controllers.push(applyBtn)
    applyBtnDiv.appendChild(applyBtn)
    container.appendChild(applyBtnDiv)
  }

  updateCanvasSize = (value) => {
    this.app.sizes.size = value
    this.app.sizes.resize()
    const label = document.querySelector('#input-export-scale > label')
    const width = this.parameters.size.value.width * this.parameters.export.scale.value.scale
    const height = this.parameters.size.value.height * this.parameters.export.scale.value.scale
    label.innerHTML = `${this.parameters.export.scale.label}<span>Output size: ${width}x${height}</span>`
  }

  checkInput = (event, attributes, input, inputs, parent, applyBtn) => {
    const eventValue = parseFloat(event.target.value)

    if (eventValue < attributes.min || eventValue > attributes.max || event.target.value.length === 0) {
      if (!input.classList.contains('error')) {
        input.classList.add('error')
      }
    } else {
      input.classList.remove('error')
    }

    const isError = Object.keys(inputs)
      .map((key) => inputs[key].classList.contains('error'))
      .some((bool) => bool === true)

    if (isError) {
      if (!parent.classList.contains('error')) parent.classList.add('error')
      applyBtn.disabled = true
    } else {
      parent.classList.remove('error')
      applyBtn.disabled = false
    }
  }
}
