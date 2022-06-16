import Controls from '../Controls'

export default class ButtonAction {
  constructor() {
    this.controls = new Controls()
    this.parameters = this.controls.parameters
  }

  create = (name, parent = document.querySelector('#inputs')) => {
    const parameter = this.parameters.buttons[name]

    const buttonContainer = document.createElement('div')
    buttonContainer.classList.add('input', 'button', name)
    // buttonContainer.classList.add(...parameter.modes.map((mode) => `${mode}-mode`))

    const buttonInput = document.createElement('input')
    buttonInput.setAttribute('type', 'submit')
    buttonInput.setAttribute('id', name)
    buttonInput.setAttribute('value', parameter.label)
    buttonInput.setAttribute('tabindex', '0')

    buttonInput.addEventListener('click', (event) => {
      event.preventDefault()
      parameter.handleClick()
    })

    parameter.controller = buttonInput
    this.controls.controllers.push(buttonInput)

    if (name === 'export') {
      const exportButtonContainer = document.createElement('div')
      const buttonConfigInput = document.createElement('input')

      exportButtonContainer.setAttribute('class', 'export-button-container')
      buttonConfigInput.setAttribute('type', 'submit')
      buttonConfigInput.setAttribute('id', 'export-config')
      buttonConfigInput.setAttribute('value', '1x')
      buttonConfigInput.setAttribute('tabindex', '0')

      buttonConfigInput.addEventListener('click', () => {
        const exportConfigOptions = document.querySelector('#export-options')
        exportConfigOptions.style.display = exportConfigOptions.style.display === 'none'
          ? 'flex' : 'none'
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

  createExportButtons = () => {
    const parameter = this.parameters.buttons.export

    const exportButtonContainer = document.querySelector('.export-button-container')
    const exportBtnConfig = document.querySelector('#export-config')

    const scales = parameter.options.scale
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
      const width = this.controls.sizes.width * scale
      const height = this.controls.sizes.height * scale
      label.innerHTML = `${scale}x <span>${width}x${height}</span>`
      label.style.pointerEvents = 'none'
      label.querySelector('span').style.pointerEvents = 'none'
      button.appendChild(label)
      buttonContainer.appendChild(button)

      button.addEventListener('click', (event) => {
        event.preventDefault()
        if (scale !== parameter.value.scale) {
          parameter.value.scale = scale
          exportBtnConfig.value = `${parameter.value.scale}x`
          const optionButtons = buttonContainer.querySelectorAll('.export-option')
          optionButtons.forEach((option) => option.classList.remove('selected'))
          button.classList.add('selected')
        }
        buttonContainer.style.display = 'none'
        exportButtonContainer.classList.remove('config-open')
      })

      button.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && document.activeElement === button) {
          event.preventDefault()
          button.click()
        }
      })
    })

    const exportBtn = parameter.controller

    exportBtnConfig.value = `${parameter.value.scale}x`

    exportBtn.parentNode.appendChild(buttonContainer)
    buttonContainer.style.top = `-${buttonContainer.offsetHeight + 10}px`

    document.addEventListener('click', (event) => {
      // console.log(event.target)
      const { target } = event

      const exportConfigBtn = document.querySelector('#export-config')
      const exportConfigOptions = buttonContainer.querySelectorAll('.export-option')

      let inFocus = false
      exportConfigOptions.forEach((button) => {
        if (target === button) inFocus = true
      })
      if (target === exportConfigBtn) inFocus = true
      if (target === buttonContainer) inFocus = true

      if (!inFocus) {
        if (buttonContainer.style.display !== 'none') {
          buttonContainer.style.display = 'none'
        }
        exportButtonContainer.classList.remove('config-open')
      }
    })
  }
}
