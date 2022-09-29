/* eslint-disable no-param-reassign */

import Controls from '../Controls'

export default class ButtonAction {
  constructor() {
    this.controls = new Controls()
    this.parameters = this.controls.parameters
  }

  create = (parameter, parent = document.querySelector('#inputs')) => {
    const { name } = parameter
    parent.classList.add(...parameter.modes.map((mode) => `${mode}-mode`))

    const inputs = document.querySelector('#inputs')

    const buttonContainer = document.createElement('div')
    buttonContainer.classList.add('input', 'button', name)
    if (parameter.config) buttonContainer.classList.add('button-config')

    if (parameter.exportModes) {
      buttonContainer.classList.add(...parameter.exportModes.map((mode) => `${mode}-save`))
    }

    const buttonInput = document.createElement('input')
    buttonInput.setAttribute('type', 'submit')
    buttonInput.setAttribute('id', name)
    buttonInput.setAttribute('value', parameter.label)
    buttonInput.setAttribute('tabindex', '0')
    if (parameter.config) buttonInput.classList.add('button-config-input-main')

    if (name === 'export' || name === 'exportPreview') {
      const buttonCancel = document.createElement('span')
      buttonCancel.classList.add('button-cancel')
      buttonCancel.innerHTML = 'Click to cancel'
      buttonContainer.appendChild(buttonCancel)
    }

    if (name === 'logoPreview') {
      if (parameter.value) {
        buttonInput.value = 'Hide Logo'
        inputs.classList.add('preview-logo')
      } else {
        buttonInput.value = 'Show Logo'
        inputs.classList.remove('preview-logo')
      }
    }

    if (name === 'textPreview') {
      if (parameter.value) {
        buttonInput.value = 'Hide Text'
        inputs.classList.add('preview-text')
      } else {
        buttonInput.value = 'Show Text'
        inputs.classList.remove('preview-text')
      }
    }

    buttonInput.addEventListener('click', (event) => {
      event.preventDefault()

      if (name === 'textPreview') {
        inputs.classList.toggle('preview-text')

        if (inputs.classList.contains('preview-text')) {
          buttonInput.value = 'Hide Text'
        } else {
          buttonInput.value = 'Show Text'
        }
      }

      if (name === 'logoPreview') {
        inputs.classList.toggle('preview-logo')

        if (inputs.classList.contains('preview-logo')) {
          buttonInput.value = 'Hide Logo'
        } else {
          buttonInput.value = 'Show Logo'
        }
      }

      parameter.handleClick()
    })

    parameter.controller = buttonInput
    this.controls.controllers.push(buttonInput)

    buttonContainer.prepend(buttonInput)

    parent.appendChild(buttonContainer)
  }
}
