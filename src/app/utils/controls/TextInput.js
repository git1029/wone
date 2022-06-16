import Controls from '../Controls'

export default class TextInput {
  constructor() {
    this.controls = new Controls()
    this.parameters = this.controls.parameters
  }

  create = (parent = document.querySelector('#inputs')) => {
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
}
