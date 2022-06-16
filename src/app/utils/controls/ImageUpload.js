import Controls from '../Controls'

export default class ImageUpload {
  constructor() {
    this.controls = new Controls()
    this.parameters = this.controls.parameters
  }

  create = (parent = document.querySelector('#inputs')) => {
    const parameter = this.parameters.image
    parent.classList.add(...parameter.modes.map((mode) => `${mode}-mode`))

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
      this.controls.resources.loadFile(file, parameter.name)
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
    label.innerHTML = parameter.label

    parent.appendChild(dropzone)
    parent.appendChild(label)

    parameter.controller = dropzone
    this.controls.controllers.push(dropzone)

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
        this.handleDragAndDrop(event.dataTransfer.items, parameter)
      } else if (event.dataTransfer.files) {
        this.handleDragAndDrop(event.dataTransfer.files, parameter)
      }
    })

    dropzone.addEventListener('dragover', (event) => {
      event.preventDefault()
      dropzone.focus()
    })

    this.setTextures()
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
        this.controls.resources.loadFile(file, image.name)
      } else {
        console.warn('Invalid file type, only images (.jpg, .jpeg .png) allowed')
      }
    }
  }

  setTextures = () => {
    const { image } = this.parameters

    // Resources (already loaded)
    if (this.controls.resources.itemsUser[image.name]) {
      this.updateTexture('itemsUser')
    } else if (this.controls.resources.items[image.name]) {
      this.updateTexture('items')
    }

    // Default resources (new load)
    this.controls.resources.on('ready', () => {
      this.updateTexture('items')
    })

    // Uploaded resources
    this.controls.resources.on(`ready-${image.name}`, () => {
      this.updateTexture('itemsUser')
    })
  }

  updateTexture = (items) => {
    // Update image value
    const { image } = this.parameters
    image.value = this.controls.resources[items][image.name]

    // Update drag and drop background image
    const controllerBg = image.controller.querySelector('.drop-zone-inner')
    controllerBg.style.backgroundImage = `url(${image.value.file.image.src})`

    this.controls.updateLocalStorage()
    this.controls.trigger('texture-update')
  }
}
