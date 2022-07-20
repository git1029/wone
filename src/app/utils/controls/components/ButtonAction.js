import Controls from '../Controls'

export default class ButtonAction {
  constructor() {
    this.controls = new Controls()
    this.parameters = this.controls.parameters
  }

  create = (parameter, parent = document.querySelector('#inputs')) => {
    // const parameter = this.parameters.buttons[name]
    const { name } = parameter
    parent.classList.add(...parameter.modes.map((mode) => `${mode}-mode`))

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

    buttonInput.addEventListener('click', (event) => {
      event.preventDefault()

      if (name === 'textPreview') {
        const inputs = document.querySelector('#inputs')
        inputs.classList.toggle('preview-text')

        if (inputs.classList.contains('preview-text')) {
          buttonInput.value = 'Hide Text'
        } else {
          buttonInput.value = 'Show Text'
        }
      }

      if (name === 'logoPreview') {
        const inputs = document.querySelector('#inputs')
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

    buttonContainer.appendChild(buttonInput)

    // if (parameter.config) {
    //   // const exportButtonContainer = document.createElement('div')
    //   const buttonConfigInput = document.createElement('div')

    //   const buttonConfigInputImg = document.createElement('div')
    //   const buttonConfigInputSpan = document.createElement('span')
    //   buttonConfigInputImg.classList.add('button-config-img')
    //   buttonConfigInputSpan.innerHTML = 'Edit'

    //   // exportButtonContainer.setAttribute('class', 'export-button-container')
    //   // buttonConfigInput.setAttribute('type', 'submit')
    //   buttonConfigInput.setAttribute('id', `config-${name}`)
    //   // buttonConfigInput.setAttribute('value', 'Edit')
    //   buttonConfigInput.setAttribute('tabindex', '0')
    //   buttonConfigInput.setAttribute('class', 'button-config-input')

    //   buttonConfigInput.addEventListener('click', () => {
    //     if (name === 'textPreview') {
    //       const inputs = document.querySelector('#inputs')
    //       inputs.classList.toggle('preview-text-config')
    //     }

    //     if (name === 'logoPreview') {
    //       const inputs = document.querySelector('#inputs')
    //       inputs.classList.toggle('preview-logo-config')
    //     }

    //     // const exportConfigOptions = document.querySelector('#export-options')
    //     // exportConfigOptions.style.display = exportConfigOptions.style.display === 'none'
    //     //   ? 'flex' : 'none'
    //     // if (exportButtonContainer.classList.contains('config-open')) {
    //     //   exportButtonContainer.classList.remove('config-open')
    //     // } else {
    //     //   exportButtonContainer.classList.add('config-open')
    //     // }
    //     // exportButtonContainer.classList.toggle('config-open')
    //     // exportConfigOptions.style.top = `-${exportConfigOptions.offsetHeight + 10}px`
    //   })

    //   buttonConfigInput.appendChild(buttonConfigInputImg)
    //   buttonConfigInput.appendChild(buttonConfigInputSpan)

    //   // buttonContainer.appendChild(buttonInput)
    //   buttonContainer.appendChild(buttonConfigInput)
    //   // buttonContainer.appendChild(exportButtonContainer)
    // // } else {
    //   // buttonContainer.appendChild(buttonInput)
    // }



    parent.appendChild(buttonContainer)
  }

  // createExportButtons = () => {
  //   const parameter = this.parameters.buttons.export

  //   const exportButtonContainer = document.querySelector('.export-button-container')
  //   const exportBtnConfig = document.querySelector('#export-config')

  //   const scales = parameter.options.scale
  //   const buttonContainer = document.createElement('div')

  //   buttonContainer.setAttribute('id', 'export-options')
  //   buttonContainer.setAttribute('class', 'export-options')
  //   buttonContainer.style.display = 'none'

  //   scales.forEach((scale) => {
  //     const button = document.createElement('div')
  //     button.setAttribute('class', 'export-option')
  //     button.setAttribute('tabindex', '0')
  //     button.dataset.scale = scale
  //     if (scale === 1) button.classList.add('selected')
  //     const label = document.createElement('label')
  //     const width = this.controls.sizes.width * scale
  //     const height = this.controls.sizes.height * scale
  //     label.innerHTML = `${scale}x <span>${width}x${height}</span>`
  //     label.style.pointerEvents = 'none'
  //     label.querySelector('span').style.pointerEvents = 'none'
  //     button.appendChild(label)
  //     buttonContainer.appendChild(button)

  //     button.addEventListener('click', (event) => {
  //       event.preventDefault()
  //       if (scale !== parameter.value.scale) {
  //         parameter.value.scale = scale
  //         exportBtnConfig.value = `${parameter.value.scale}x`
  //         const optionButtons = buttonContainer.querySelectorAll('.export-option')
  //         optionButtons.forEach((option) => option.classList.remove('selected'))
  //         button.classList.add('selected')
  //       }
  //       buttonContainer.style.display = 'none'
  //       exportButtonContainer.classList.remove('config-open')
  //     })

  //     button.addEventListener('keydown', (event) => {
  //       if (event.key === 'Enter' && document.activeElement === button) {
  //         event.preventDefault()
  //         button.click()
  //       }
  //     })
  //   })

  //   const exportBtn = parameter.controller

  //   exportBtnConfig.value = `${parameter.value.scale}x`

  //   exportBtn.parentNode.appendChild(buttonContainer)
  //   buttonContainer.style.top = `-${buttonContainer.offsetHeight + 10}px`

  //   document.addEventListener('click', (event) => {
  //     // console.log(event.target)
  //     const { target } = event

  //     const exportConfigBtn = document.querySelector('#export-config')
  //     const exportConfigOptions = buttonContainer.querySelectorAll('.export-option')

  //     let inFocus = false
  //     exportConfigOptions.forEach((button) => {
  //       if (target === button) inFocus = true
  //     })
  //     if (target === exportConfigBtn) inFocus = true
  //     if (target === buttonContainer) inFocus = true

  //     if (!inFocus) {
  //       if (buttonContainer.style.display !== 'none') {
  //         buttonContainer.style.display = 'none'
  //       }
  //       exportButtonContainer.classList.remove('config-open')
  //     }
  //   })
  // }
}
