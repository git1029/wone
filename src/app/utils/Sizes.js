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

    this.limit = {
      width: 1000,
      height: 1000,
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

    // Constrain size to limit
    this.getAspect()
    if (this.width > this.limit.width || this.height > this.limit.height) {
      this.width = this.limit.width * this.aspect.x
      this.height = this.limit.height * this.aspect.y
    }

    this.scaleCanvas()
    this.trigger('resize')
  }

  getAspect = () => {
    this.aspect = { x: 1, y: 1 }
    if (this.width > this.height) {
      this.aspect.x = 1
      this.aspect.y = this.height / this.width
    } else if (this.height > this.width) {
      this.aspect.x = this.width / this.height
      this.aspect.y = 1
    }
  }

  scaleCanvas = () => {
    let pad = 30
    if (window.innerWidth < 1200) {
      pad = 10
    }

    let availableWidth = Math.max(1200, Math.min(2560, window.innerWidth)) - 600 - pad * 2
    const availableHeight = Math.max(320, Math.min(1440, window.innerHeight)) - pad * 2

    if (window.innerWidth < 1200) {
      availableWidth = window.innerWidth - pad * 2
    }

    const scaleX = availableWidth < this.width ? availableWidth / this.width : 1
    const scaleY = availableHeight < this.height * scaleX ? availableHeight / (this.height * scaleX) : 1
    const scale = scaleX * scaleY

    // document.querySelector('.canvas').style.width = `${widnwo}px`

    if (window.innerWidth > 320) this.canvas.style.transform = `scale(${scale}, ${scale})`
    // else this.canvas.style.transform = 'scale(1, 1)'
  }
}
