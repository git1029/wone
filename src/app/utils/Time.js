import * as THREE from 'three'

import EventEmitter from './EventEmitter'

export default class Time extends EventEmitter {
  constructor() {
    super()

    this.paused = false

    // Setup
    this.clock = new THREE.Clock()
    this.elapsedTime = this.clock.getElapsedTime()
    this.pausedTime = this.elapsedTime
    this.pauseDuration = 0

    this.start()
  }

  tick = () => {
    if (this.paused) return

    this.elapsedTime = this.clock.getElapsedTime() - this.pauseDuration
    this.trigger('tick')
    window.requestAnimationFrame(this.tick)
  }

  restart = () => {
    this.stop()

    setTimeout(() => {
      this.clock.start()
      this.elapsedTime = 0
      this.pausedTime = 0
      this.pauseDuration = 0
      this.paused = false
      this.tick()
    }, 100)
  }

  start = () => {
    this.pauseDuration = this.clock.getElapsedTime() - this.pausedTime
    this.paused = false
    this.tick()
  }

  stop = () => {
    this.paused = true
    this.pausedTime = this.elapsedTime
  }
}
