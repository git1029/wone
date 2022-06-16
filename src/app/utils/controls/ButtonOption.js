import Controls from '../Controls'

export default class ButtonOption {
  constructor() {
    this.controls = new Controls()
    this.parameters = this.controls.parameters
  }

  create = (name, parent = document.querySelector('#inputs')) => {
    const parameter = this.parameters[name]
    parent.classList.add(...parameter.modes.map((mode) => `${mode}-mode`))

    const inputs = document.getElementById('inputs')

    const buttonContainer = parent.querySelector(`.${name}-blocks`)
    const options = Object.keys(parameter.options)
    options.forEach((key) => {
      const value = parameter.options[key]
      const button = document.createElement('div')
      const buttonImg = document.createElement('div')
      const buttonLabel = document.createElement('label')

      button.setAttribute('class', `${name}-block`)
      button.setAttribute('tabindex', '0')
      button.dataset[name] = key
      buttonImg.setAttribute('class', `${name}-block-img`)
      if (name === 'size') {
        buttonLabel.innerHTML = `${value.name}<br><span>${value.width}x${value.height}</span>`
      } else {
        buttonLabel.innerText = value.name
      }
      button.appendChild(buttonImg)
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
          this.controls.sizes.size = value
          this.controls.sizes.resize()
          const exportConfigOptions = document.querySelectorAll('#export-options .export-option')
          exportConfigOptions.forEach((option) => {
            const scale = parseFloat(option.dataset.scale)
            const label = option.querySelector('label')
            const span = label.querySelector('span')
            const width = this.controls.sizes.width * scale
            const height = this.controls.sizes.height * scale
            span.innerHTML = `${width}x${height}`
            label.style.pointerEvents = 'none'
            span.style.pointerEvents = 'none'
          })
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
  }
}
