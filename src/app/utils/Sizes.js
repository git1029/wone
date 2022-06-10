import EventEmitter from './EventEmitter'
import App from '../App'

export default class Sizes extends EventEmitter {
  constructor() {
    super()

    // Setup
    this.app = new App()
    this.canvas = this.app.canvas

    // Setup
    this.size = {
      width: 1080, height: 1080, aspect: '1:1', name: 'Square',
    }

    this.width = this.size.width
    this.height = this.size.height
    this.pixelRatio = Math.min(window.devicePixelRatio, 2)

    window.addEventListener('resize', () => {
      this.scaleCanvas()
    })
  }

  // Resize
  resize = () => {
    this.width = this.size.width
    this.height = this.size.height
    this.pixelRatio = Math.min(window.devicePixelRatio, 2)

    this.scaleCanvas()

    this.trigger('resize')
  }

  scaleCanvas = () => {
    const pad = 30

    const availableWidth = Math.max(1366, Math.min(2560, window.innerWidth)) - 600 - pad * 2
    const availableHeight = Math.max(320, Math.min(1440, window.innerHeight)) - pad * 2

    const scaleX = availableWidth < this.width ? availableWidth / this.width : 1

    const scaleY = availableHeight < this.height * scaleX ? availableHeight / (this.height * scaleX) : 1

    this.canvas.style.transform = `scale(${scaleX * scaleY}, ${scaleX * scaleY})`

    // const maxHeight = Math.min(1440, window.innerHeight) - pad * 2
    // const scaleY = maxHeight < this.height ? maxHeight / this.height : 1
    // this.canvas.style.transform = `scale(${scaleY})`
  }
}
