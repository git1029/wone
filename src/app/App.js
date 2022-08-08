import * as THREE from 'three'
import CCapture from 'ccapture.js-npmfixed'
import Stats from 'stats.js'

import Sizes from './utils/Sizes'
import Time from './utils/Time'
import Camera from './Camera'
import Renderer from './Renderer'
import Mode from './mode/Mode'
import Resources from './utils/Resources'
import sources from './sources'
import Controls from './utils/controls/Controls'

let instance = null

export default class App {
  constructor(canvas) {
    if (instance) {
      // eslint-disable-next-line no-constructor-return
      return instance
    }
    instance = this

    // Stats
    this.stats = new Stats()
    this.stats.domElement.style.bottom = 0
    this.stats.domElement.style.top = 'auto'
    document.body.appendChild(this.stats.dom)

    this.export = {
      recording: {
        still: false,
        animation: false,
      },
      recordStartTime: 0,
    }

    // Setup
    this.canvas = canvas
    this.sizes = new Sizes()
    this.time = new Time()
    this.scene = new THREE.Scene()
    this.resources = new Resources(sources)
    this.camera = new Camera()
    this.renderer = new Renderer()
    this.controls = new Controls()

    // Mode
    this.setMode()

    this.setLogo()

    // Add events
    this.sizes.on('resize', this.resize)
    this.time.on('tick', this.update)

    // eslint-disable-next-line no-undef
    this.capturer = new CCapture({
      format: 'png',
      framerate: 60,
      // verbose: true,
    })
  }

  setMode = () => {
    if (!this.mode) this.mode = new Mode()
    this.mode.setMode()
  }

  setLogo = () => {
    // Logo overlay
    this.logoMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        map: null,
        transparent: true,
        // color: this.controls.parameters.color.logo.value.primary,
      }),
    )
    this.logoMesh.position.z = 15
    this.logoMesh.visible = this.controls.parameters.buttons.logoPreview.value
    this.scene.add(this.logoMesh)

    this.resources.on('ready', () => {
      this.logoMesh.material.map = this.resources.items.logoTexture.file
      this.logoMesh.material.needsUpdate = true
      this.setLogoPosition()
    })
    // this.controls.on('parameter-update-color-logo', () => {
    //   this.logoMesh.material.color = new THREE.Color(this.controls.parameters.color.logo.value.primary)
    //   this.logoMesh.material.needsUpdate = true
    // })
    // this.resources.on('ready-logoTexture', () => {
    //   this.logoMesh.material.map = this.resources.itemsUser.logoTexture.file
    //   this.logoMesh.material.needsUpdate = true
    // })
  }

  setLogoPosition = () => {
    const padding = 40
    const texture = this.resources.items.logoTexture.file
    const logoSize = new THREE.Vector2(texture.image.width, texture.image.height)
    const logoAspect = new THREE.Vector2(1, logoSize.height / logoSize.width)
    const width = Math.min(200, this.controls.parameters.size.value.width * 0.2)
    if (this.logoMesh) {
      const scale = (width / this.controls.parameters.size.value.width) * this.camera.aspect.x
      this.logoMesh.scale.x = logoAspect.x * scale
      this.logoMesh.scale.y = logoAspect.y * scale
      this.logoMesh.position.y = -this.camera.aspect.y / 2
      this.logoMesh.position.y += this.logoMesh.scale.y / 2
      this.logoMesh.position.y += (padding / this.controls.parameters.size.value.height) * this.camera.aspect.y
      if (this.controls.parameters.size.value.height < 160) this.logoMesh.position.y = 0
    }
  }

  resize = () => {
    this.camera.resize()
    this.renderer.resize()
    if (this.mode && this.mode.resize) this.mode.resize()

    // Update logo plane size
    if (this.logoMesh) {
      this.setLogoPosition()
    }
  }

  exportCC = () => {
    if (this.export.recording.animation && this.controls.parameters.export.save.value.key === 'animation') {
      // this.debugFolderTime.controllers.forEach((controller) => controller.disable())

      this.capturer.capture(this.canvas)

      const duration = this.controls.parameters.export.duration.value

      // End capture
      if (this.time.elapsedTime > duration + this.export.recordStartTime) {
        this.stopExportCC()
      }
    }
  }

  stopExportCC = (save = true) => {
    this.export.recording.animation = false
    this.capturer.stop()
    if (save) this.capturer.save()
    // this.controls.parameters.buttons.export.controller.enable()
    // this.controls.parameters.buttons.export.controller.disabled = false
    this.controls.parameters.buttons.export.controller.removeAttribute('style')
    this.controls.parameters.buttons.export.controller.parentNode.classList.remove('progress')
    this.controls.parameters.buttons.export.controller.value = 'Export'

    // Reset canvas (and particle) size
    if (this.mode.activeMode.name === 'Pattern') {
      this.mode.mode.updateParticleSize(this.sizes.width / this.sizes.limit.width)
    }
    this.renderer.instance.setSize(this.sizes.width, this.sizes.height)
    this.sizes.scaleCanvas()

    // Change to keyframe B
    this.controls.parameters.keyframe.controllers.b.click()

    this.capturer = null
    this.capturer = new CCapture({
      format: 'png',
      framerate: 60,
      // verbose: true,
    })

    // this.controls.parameters.buttons.exportPreview.controller.disabled = false
    // this.controls.parameters.export.duration.controller.disabled = false
    // this.controls.parameters

    if (this.mode.activeMode.name === 'Pattern') {
      setTimeout(() => {
        this.mode.mode.positionUniforms.uStartTime.value = this.time.elapsedTime
      }, 100)
    }
  }

  exportImage = () => {
    if (this.export.recording.still && this.controls.parameters.export.save.value.key === 'still') {
      // Only use export scale on preset sizes (need to limit max render size for performance reasons)
      const sclFactor = this.controls.parameters.size.value.name === 'Custom'
        ? 1
        : this.controls.parameters.export.scale.value.scale

      const width = this.controls.parameters.size.value.width * sclFactor
      const height = this.controls.parameters.size.value.height * sclFactor

      this.setLogoPosition()

      // Scale canvas (and particles) to export size
      this.renderer.instance.setSize(width, height)
      const scl = (this.controls.parameters.size.value.width * sclFactor) / this.sizes.limit.width
      if (this.mode.activeMode.name === 'Pattern') this.mode.mode.updateParticleSize(scl)
      if (this.mode && this.mode.mode.effectComposer) this.mode.mode.effectComposer.render()
      else this.renderer.update()

      const imgData = this.renderer.instance.domElement.toDataURL('image/png')
      // const imgData = this.renderer.instance.domElement.toDataURL('image/jpeg', 1)
      const a = document.createElement('a')
      a.href = imgData
      const keyframe = this.controls.parameters.keyframe.value.key
      const frequency = Math.round(this.controls.parameters.sliders.frequencyA.value[keyframe] * 100) / 100
      const frequencyB = Math.round(this.controls.parameters.sliders.frequencyB.value[keyframe] * 100) / 100
      const distortion = Math.round(this.controls.parameters.sliders.distortion.value[keyframe] * 100) / 100
      const scale = Math.round(this.controls.parameters.sliders.scale.value[keyframe] * 100) / 100
      a.download = `wone_fA${frequency}_fB${frequencyB}_d${distortion}_s${scale}_${width}_${height}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      this.export.recording.still = false

      // Reset canvas (and particle) size
      if (this.mode.activeMode.name === 'Pattern') {
        this.mode.mode.updateParticleSize(this.sizes.width / this.sizes.limit.width)
      }
      this.renderer.instance.setSize(this.sizes.width, this.sizes.height)
      this.setLogoPosition()
    }
  }

  animate = () => {
    if (this.mode.mode.animate) {
      this.mode.mode.animate()

      if (this.mode.activeMode.name !== 'Text') {
        if (this.mode.textMode && this.controls.parameters.buttons.textPreview.value) {
          if (this.mode.textMode.animate) this.mode.textMode.animate()
        }
      }
    } else return

    const duration = this.controls.parameters.export.duration.value

    // Preview
    if (this.controls.parameters.buttons.exportPreview.value || this.export.recording.animation) {
      const button = this.export.recording.animation
        ? this.controls.parameters.buttons.export.controller
        : this.controls.parameters.buttons.exportPreview.controller
      const t = ((this.time.elapsedTime - this.export.recordStartTime) % duration) / duration
      const colorBg = '#282826'
      const colorProgress = '#136DEB'
      button.style.background = `linear-gradient(to right, ${colorProgress} ${t * 100}%, ${colorBg} ${t * 100}%)`
      button.style.paddingBottom = '15px'
      // const value = this.export.recording.animation ? 'Exporting' : 'Preview'

      if (this.export.recording.animation) button.value = 'Exporting'
      button.parentNode.classList.add('progress')
      // button.value = 'Cancel'
      // button.addEventListener('mouseover', this.handleMouseOver, true)
      // button.addEventListener('mouseout', (e) => this.handleMouseOut(e, value), true)

      if (this.time.elapsedTime > duration + this.export.recordStartTime) {
        // button.removeEventListener('mouseover', this.handleMouseOver, true)
        // button.removeEventListener('mouseout', this.handleMouseOut, true)
        button.parentNode.classList.remove('progress')

        this.controls.disableControls(false)

        if (this.controls.parameters.buttons.exportPreview.value) {
          button.value = 'Preview'
          this.controls.parameters.buttons.exportPreview.value = false
        }
        if (this.export.recording.animation) button.value = 'Export'
        button.removeAttribute('style')
      }
    }

    // End animate
    if (this.time.elapsedTime > duration + this.export.recordStartTime) {
      if (this.mode.mode.animate) this.mode.mode.animate()
    }
  }

  update = () => {
    // this.camera.update()
    if (this.mode) this.mode.update()

    // console.log(this.time.elapsedTime, 'elapsedTime')

    // Export preview
    if (this.controls.parameters.buttons.exportPreview.value || this.export.recording.animation) {
      this.animate()
    }

    if (this.mode && this.mode.mode.effectComposer) this.mode.mode.effectComposer.render()
    else this.renderer.update()

    this.stats.update()

    if (this.export.recording.still) this.exportImage()
    if (this.export.recording.animation) this.exportCC()
  }
}
