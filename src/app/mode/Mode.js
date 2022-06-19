import EventEmitter from '../utils/EventEmitter'
import App from '../App'
import Pattern from './pattern/Pattern'
import Image from './image/Image'
import Text from './text/Text'

export default class Mode extends EventEmitter {
  constructor() {
    super()

    // Setup
    this.app = new App()
    this.resources = this.app.resources
    this.controls = this.app.controls
  }

  setMode = () => {
    this.destroy()
    this.activeMode = this.controls.parameters.mode.value
    this.mode = null

    if (this.activeMode.name === 'Pattern') {
      this.mode = new Pattern()
    } else if (this.activeMode.name === 'Image') {
      this.mode = new Image()
    } else if (this.activeMode.name === 'Text') {
      this.mode = new Text()
    } else {
      console.error('Invalid mode')
      this.mode = null
    }
  }

  update = () => {
    if (this.mode && this.mode.update) this.mode.update()
  }

  resize = () => {
    if (this.mode && this.mode.resize) this.mode.resize()
  }

  destroy = () => {
    if (this.mode && this.mode.destroy) this.mode.destroy()
  }
}
