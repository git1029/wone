import * as THREE from 'three'

// import Stats from 'stats-js'
import CCapture from 'ccapture.js-npmfixed'

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

    // // Stats
    // this.stats = new Stats()
    // this.stats.domElement.style.bottom = 0
    // this.stats.domElement.style.top = 'auto'
    // document.body.appendChild(this.stats.dom)

    this.export = {
      recording: {
        still: false,
        animation: false,
      },
      recordStartTime: 0,
    }
    // eslint-disable-next-line no-undef
    // this.capturer = new CCapture({
    //   format: 'png',
    //   framerate: 30,
    //   // verbose: true,
    //   timeLimit: this.export.duration,
    // })

    // Setup
    this.canvas = canvas
    this.sizes = new Sizes()
    this.time = new Time()
    this.scene = new THREE.Scene()
    this.resources = new Resources(sources)
    this.camera = new Camera()
    this.renderer = new Renderer()
    this.controls = new Controls()

    // this.animate = {
    //   duration: 8,
    //   animate: () => {
    //     const btn = this.debugFolderTime.children.filter((c) =>
    //        c.property === 'animate')[0].$button
    //     if (this.time.paused) {
    //       btn.innerHTML = 'Pause'
    //       btn.style.color = 'white'
    //       return this.time.start()
    //     }
    //     btn.innerHTML = 'Play'
    //     btn.style.color = 'lime'
    //     return this.time.stop()
    //   },
    //   restart: () => {
    //     this.time.paused = false
    //     const btn = this.debugFolderTime.children.filter((c) =>
    //        c.property === 'animate')[0].$button
    //     btn.innerHTML = 'Pause'
    //     btn.style.color = 'white'
    //     this.time.restart()
    //   },
    // }
    // this.debugFolderTime = this.debug.ui.addFolder('Animation')
    // this.debugFolderTime.$title.style.backgroundColor = '#111111'
    // // this.debugFolderTime.add(this.animate, 'duration').min(1).max(15).step(1)
    // //   .name('Loop Duration')
    // this.debugFolderTime.add(this.animate, 'animate').name('Pause')
    // this.debugFolderTime.add(this.animate, 'restart').name('Restart')

    // this.export.export = () => {
    //   this.time.paused = false
    //   const animateBtn = this.debugFolderTime.children.filter((c) =>
    //      c.property === 'animate')[0].$button
    //   animateBtn.innerHTML = 'Pause'
    //   animateBtn.style.color = 'white'

    //   this.time.restart()
    //   this.export.recording = true

    //   const exportBtn = this.debugFolderExport.children.filter((c) =>
    //      c.property === 'export')[0].$button
    //   exportBtn.innerHTML = 'Exporting...'
    //   exportBtn.style.color = 'lime'

    //   this.capture = null
    //   // eslint-disable-next-line no-undef
    //   this.capturer = new CCapture({
    //     format: 'png',
    //     framerate: 30,
    //     // verbose: true,
    //     timeLimit: this.export.duration,
    //   })
    //   this.capturer.start()
    // }
    // this.debugFolderExport = this.debug.ui.addFolder('Export (Image Sequence)')
    // this.debugFolderExport.$title.style.backgroundColor = '#111111'
    // this.debugFolderExportDuration = this.debugFolderExport.add(this.export, 'duration')
    //    .min(1).max(30).step(1)
    //   .name('Duration')
    //   .disable()
    // this.debugFolderExport.add(this.export, 'export').name('Export')

    // Mode
    this.setMode()

    // Logo overlay
    this.logoMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        map: null,
        transparent: true,
        // color: 0x000000,
      }),
    )
    this.logoMesh.position.z = 15
    this.logoMesh.visible = false
    this.scene.add(this.logoMesh)

    this.resources.on('ready', () => {
      this.logoMesh.material.map = this.resources.items.logoTexture.file
      this.logoMesh.material.needsUpdate = true
    })
    this.resources.on('ready-logoTexture', () => {
      this.logoMesh.material.map = this.resources.itemsUser.logoTexture.file
      this.logoMesh.material.needsUpdate = true
    })

    // Add events
    this.sizes.on('resize', this.resize)
    this.time.on('tick', this.update)

    // this.exportVideo()

    // this.capture = null
    // eslint-disable-next-line no-undef
    this.capturer = new CCapture({
      format: 'png',
      framerate: 60,
      // verbose: true,
      // timeLimit: this.export.duration,
      // timeLimit: this.controls.parameters.export.duration.value,
    })
    // this.capturer.start()
    // this.capturer = new CCapture({
    //   format: 'webm',
    //   framerate: 60,
    //   quality: 0.95,
    //   // verbose: true,
    //   // timeLimit: this.export.duration,
    // })
    // this.capturer.start()
  }

  setMode = () => {
    if (!this.mode) this.mode = new Mode()
    this.mode.setMode()
  }

  resize = () => {
    this.camera.resize()
    this.renderer.resize()
    if (this.mode && this.mode.resize) this.mode.resize()

    // Update logo plane size
    if (this.logoMesh) {
      this.logoMesh.scale.x = this.camera.aspect.x
      this.logoMesh.scale.y = this.camera.aspect.y
    }
  }

  exportCC = () => {
    if (this.export.recording.animation && this.controls.parameters.export.save.value.key === 'animation') {
      // this.debugFolderTime.controllers.forEach((controller) => controller.disable())

      // console.log(this.time.elapsedTime)
      this.capturer.capture(this.canvas)

      // console.log(this.capturer)
      // console.log(ok)
      // console.log(this.export.recordStartTime)
      // console.log(this.time.elapsedTime)

      const duration = this.controls.parameters.export.duration.value

      if (this.time.elapsedTime > duration + this.export.recordStartTime) {
        this.export.recording.animation = false
        this.capturer.stop()
        this.capturer.save()
        // this.controls.parameters.buttons.export.controller.enable()
        this.controls.parameters.buttons.export.controller.disabled = false

        // // Reset text preview
        // if (this.mode.activeMode.name !== 'Text') {
        //   if (this.mode.textMode) {
        //     this.mode.textMode.text.forEach((text) => {
        //       text.visible = this.controls.parameters.buttons.textPreview.value
        //     })
        //   }
        // }

        // Reset canvas (and particle) size
        if (this.mode.activeMode.name === 'Pattern') {
          this.mode.mode.updateParticleSize(this.sizes.width / this.sizes.limit.width)
        }
        this.renderer.instance.setSize(this.sizes.width, this.sizes.height)
        this.sizes.scaleCanvas()

        // Change to keyframe B
        this.controls.parameters.keyframe.controllers.b.click()

        // this.debugFolderTime.controllers.forEach((controller) => controller.enable())
        // const btn = this.debugFolderExport.children.filter((c) =>
        //  c.property === 'export')[0].$button
        // btn.innerHTML = 'Export'
        // btn.style.color = 'white'
        this.capturer = null
        this.capturer = new CCapture({
          format: 'png',
          framerate: 60,
          // verbose: true,
          // timeLimit: this.export.duration,
          // timeLimit: this.controls.parameters.export.duration.value,
        })
      }
    }
  }

  exportImage = () => {
    if (this.export.recording.still && this.controls.parameters.export.save.value.key === 'still') {
      // this.renderer.instance.preserveDrawingBuffer = true
      // const sclFactor = this.controls.parameters.buttons.export.value.scale

      // // Hide text preview for Pattern and Image modes
      // if (this.mode.activeMode.name !== 'Text') {
      //   if (this.mode.textMode) {
      //     this.mode.textMode.text.forEach((text) => {
      //       text.visible = false
      //     })
      //   }
      // }

      // Only use export scale on preset sizes (need to limit max render size for performance reasons)
      const sclFactor = this.controls.parameters.size.value.name === 'Custom'
        ? 1
        : this.controls.parameters.export.scale.value.scale

      const width = this.controls.parameters.size.value.width * sclFactor
      const height = this.controls.parameters.size.value.height * sclFactor

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
      // a.download = `wone_fA${frequency}_fB${frequencyB}_d${distortion}_s${scale}.jpg`
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
      // this.renderer.instance.preserveDrawingBuffer = false

      // // Reset text preview
      // if (this.mode.activeMode.name !== 'Text') {
      //   if (this.mode.textMode) {
      //     this.mode.textMode.text.forEach((text) => {
      //       text.visible = this.controls.parameters.buttons.textPreview.value
      //     })
      //   }
      // }
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
    // const progress = (this.time.elapsedTime - this.export.recordStartTime) / duration

    // console.log(progress)

    // Preview
    if (this.controls.parameters.buttons.exportPreview.value || this.export.recording.animation) {
      // console.log(this.export.recordStartTime)
      // console.log(this.time.elapsedTime)
      const button = this.export.recording.animation
        ? this.controls.parameters.buttons.export.controller
        : this.controls.parameters.buttons.exportPreview.controller
      const t = ((this.time.elapsedTime - this.export.recordStartTime) % duration) / duration
      // const colorBg = '#1D1D1B'
      const colorBg = '#282826'
      const colorProgress = '#136DEB'
      button.style.background = `linear-gradient(to right, ${colorProgress} ${t * 100}%, ${colorBg} ${t * 100}%)`

      if (this.export.recording.animation) button.value = 'Exporting'

      if (this.time.elapsedTime > duration + this.export.recordStartTime) {
        if (this.controls.parameters.buttons.exportPreview.value) {
          this.controls.parameters.buttons.exportPreview.value = false
        }
        if (this.export.recording.animation) button.value = 'Export'
        button.removeAttribute('style')
      }
    }

    if (this.time.elapsedTime > duration + this.export.recordStartTime) {
      if (this.mode.mode.animate) this.mode.mode.animate()

      // // Reset text preview
      // if (this.mode.activeMode.name !== 'Text') {
      //   if (this.mode.textMode) {
      //     this.mode.textMode.text.forEach((text) => {
      //       text.visible = this.controls.parameters.buttons.textPreview.value
      //     })
      //   }
      // }
    }
  }

  update = () => {
    // this.camera.update()
    if (this.mode) this.mode.update()

    // Export preview
    if (this.controls.parameters.buttons.exportPreview.value || this.export.recording.animation) {
      this.animate()
    }

    if (this.mode && this.mode.mode.effectComposer) this.mode.mode.effectComposer.render()
    else this.renderer.update()

    // if (this.resources.items.logoTexture) {
    //   const c = this.canvas
    //   const ctx = c.getContext('webgl')
    //   console.log(ctx)
    //   const img = this.resources.items.logoTexture.file.image
    //   console.log(img)
    //   ctx.drawImage(img, 10, 10)
    // }

    if (this.export.recording.still) this.exportImage()
    if (this.export.recording.animation) this.exportCC()

    // if (this.time.elapsedTime >= 3 && this.mediaRecorder.state === 'recording') this.mediaRecorder.stop()

    // this.stats.update()

    // if (this.export.recording) {
    //   // this.debugFolderTime.controllers.forEach((controller) => controller.disable())
    //   this.capturer.capture(this.canvas)
    //   if (this.time.elapsedTime > this.export.duration) {
    //     this.export.recording = false
    //     // this.debugFolderTime.controllers.forEach((controller) => controller.enable())
    //     // const btn = this.debugFolderExport.children.filter((c) =>
    //          c.property === 'export')[0].$button
    //     // btn.innerHTML = 'Export'
    //     // btn.style.color = 'white'
    //   }
    //   else {
    //     capturer.stop()
    //     capturer.save()
    //     this.export.recording = false
    //   }
    // }
  }
}
