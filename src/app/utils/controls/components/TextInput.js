import Controls from '../Controls'

export default class TextInput {
  constructor() {
    this.controls = new Controls()
    this.parameters = this.controls.parameters
  }

  createTextarea = (parent = document.querySelector('#inputs')) => {
    const { text } = this.parameters

    parent.classList.add(...text.modes.map((mode) => `${mode}-mode`))

    const textarea = document.createElement('textarea')
    const label = document.createElement('label')

    textarea.setAttribute('tabindex', '0')
    textarea.value = text.value

    textarea.addEventListener('keyup', (event) => {
      text.value = event.target.value

      this.controls.trigger('parameter-update-text')

      this.controls.updateLocalStorage()
    })

    label.innerHTML = text.label

    parent.appendChild(textarea)
    parent.appendChild(label)

    text.controller = textarea
    this.controls.controllers.push(textarea)
  }

  createInput = (name, paramParent = null, parent = document.querySelector('#inputs')) => {
    const parameter = paramParent ? this.parameters[paramParent][name] : this.parameters[name]
    parent.classList.add(...parameter.modes.map((mode) => `${mode}-mode`))

    if (parameter.exportModes) {
      parent.classList.add(...parameter.exportModes.map((mode) => `${mode}-save`))
    }

    const input = document.createElement('input')
    const label = document.createElement('label')

    input.setAttribute('tabindex', '0')
    input.setAttribute('type', 'number')
    input.setAttribute('class', 'input-export-duration-input')
    input.setAttribute('min', '0.1')
    input.setAttribute('max', '30')
    input.value = parameter.value

    input.addEventListener('keyup', (event) => {
      parameter.value = parseFloat(event.target.value)

      this.controls.trigger('parameter-update-export-duration')

      this.controls.updateLocalStorage()
    })

    label.innerHTML = parameter.label

    parent.appendChild(input)
    parent.appendChild(label)

    parameter.controller = input
    this.controls.controllers.push(input)
  }
}
