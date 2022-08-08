import Controls from '../Controls'

export default class ButtonColor {
  constructor() {
    this.controls = new Controls()
    this.parameters = this.controls.parameters
  }

  create = (name, parent = document.querySelector('#inputs')) => {
    const parameter = this.parameters.color[name]
    parent.classList.add(...parameter.modes.map((mode) => `${mode}-mode`))

    const buttonContainer = document.createElement('div')
    buttonContainer.setAttribute('class', `button-colors colors-${name}`)

    Object.keys(parameter.options).forEach((key) => {
      const value = parameter.options[key]
      const button = document.createElement('div')

      button.setAttribute('class', `button-color color-${name}`)
      button.setAttribute('tabindex', '0')
      button.style.backgroundColor = value.primary
      buttonContainer.append(button)

      parameter.controllers[key] = button
      this.controls.controllers.push(button)

      if (parameter.value.name === value.name) {
        button.classList.add('selected')
      }

      button.addEventListener('click', () => {
        if (button.classList.contains('selected')) return
        Object.keys(parameter.controllers).forEach((controller) => {
          parameter.controllers[controller].classList.remove('selected')
        })
        button.classList.add('selected')
        parameter.value = value

        if (name === 'pattern') this.controls.renderer.instance.setClearColor(value.background)
        this.controls.trigger(`parameter-update-color-${name}`)

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
    if (parameter.label) {
      const label = document.createElement('label')
      label.innerHTML = parameter.label
      parent.appendChild(label)
    }
  }
}
