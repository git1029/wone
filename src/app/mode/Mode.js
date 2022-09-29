/* eslint-disable no-param-reassign */

import * as THREE from 'three'

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

    this.activeMode = this.controls.parameters.mode.value

    // Initialize text mode
    this.textMode = new Text()
    this.textMode.text.forEach((text) => {
      text.visible = false
    })

    this.setLogoColor()
  }

  setMode = () => {
    if (this.mode && this.activeMode.name !== 'Text') {
      this.destroy()
      this.mode = null
    }
    this.activeMode = this.controls.parameters.mode.value

    if (this.activeMode.name === 'Pattern') {
      this.mode = new Pattern()
      this.setTextPreview(this.controls.parameters.buttons.textPreview.value)
    } else if (this.activeMode.name === 'Image') {
      this.mode = new Image()
      this.setTextPreview(this.controls.parameters.buttons.textPreview.value)
    } else if (this.activeMode.name === 'Text') {
      this.textMode.updateCanvasBackground()
      this.textMode.setEvents()
      this.setTextPreview(true)
      this.mode = this.textMode
    } else {
      console.error('Invalid mode')
      this.mode = null
    }

    this.setLogoColor()
  }

  setTextPreview = (value) => {
    if (this.textMode.text) {
      this.textMode.text.forEach((text) => {
        text.visible = value
      })
    }
  }

  setLogoColor = () => {
    if (this.app.logoMesh) {
      if (this.activeMode.name !== 'Text') {
        this.app.logoMesh.material.color = new THREE.Color(this.controls.parameters.color.text.options.light.primary)
      } else {
        this.app.logoMesh.material.color = new THREE.Color(this.controls.parameters.color.text.value.primary)
      }
    }
  }

  update = () => {
    if (this.mode && this.mode.update) this.mode.update()
  }

  resize = () => {
    if (this.mode && this.mode.resize) this.mode.resize()

    if (this.textMode && this.textMode.resize && this.activeMode.name !== 'Text') this.textMode.resize()
  }

  destroy = () => {
    if (this.mode && this.mode.destroy) this.mode.destroy()
  }
}
