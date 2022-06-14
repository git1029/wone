import * as THREE from 'three'

import CCapture from 'ccapture.js-npmfixed'
import Stats from 'stats-js'

import Sizes from './utils/Sizes'
import Time from './utils/Time'
import Camera from './Camera'
import Renderer from './Renderer'
import Mode from './mode/Mode'
import Resources from './utils/Resources'
import sources from './sources'
import Controls from './utils/Controls'

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

    // // Debug
    // this.debug = new Debug()
    // this.debugFolderScene = this.debug.ui.addFolder('Scene')
    // this.debugFolderScene.$title.style.backgroundColor = '#111111'

    this.export = {
      recording: false,
      duration: 1,
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

    // Add events
    this.sizes.on('resize', this.resize)
    this.time.on('tick', this.update)

    // this.exportVideo()

    // this.capturer = new CCapture({
    //   format: 'webm',
    //   framerate: 60,
    //   quality: 0.95,
    //   // verbose: true,
    //   timeLimit: this.export.duration,
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
  }

  exportCC = () => {
    if (this.export.recording) {
      // this.debugFolderTime.controllers.forEach((controller) => controller.disable())
      this.capturer.capture(this.canvas)

      if (this.time.elapsedTime > this.export.duration) {
        this.export.recording = false
        this.capturer.stop()
        this.capturer.save()
        // this.debugFolderTime.controllers.forEach((controller) => controller.enable())
        // const btn = this.debugFolderExport.children.filter((c) =>
        //  c.property === 'export')[0].$button
        // btn.innerHTML = 'Export'
        // btn.style.color = 'white'
      }
    }
  }

  exportImage = () => {
    if (this.export.recording) {
      // this.renderer.instance.preserveDrawingBuffer = true
      const sclFactor = this.controls.parameters.buttons.export.value.scale
      if (sclFactor !== 1) {
        this.renderer.instance.setSize(this.sizes.width * sclFactor, this.sizes.height * sclFactor)
        const scl = (this.sizes.width * sclFactor) / this.sizes.width
        if (this.mode.activeMode.name === 'Pattern') this.mode.mode.updateParticleSize(scl)
        if (this.mode && this.mode.mode.effectComposer) this.mode.mode.effectComposer.render()
        else this.renderer.update()
      }

      const imgData = this.renderer.instance.domElement.toDataURL('image/png')
      // const imgData = this.renderer.instance.domElement.toDataURL('image/jpg', 0.5)
      const a = document.createElement('a')
      a.href = imgData
      const frequency = Math.round(this.controls.parameters.sliders.frequency.value * 100) / 100
      const frequencyB = Math.round(this.controls.parameters.sliders.frequencyB.value * 100) / 100
      const distortion = Math.round(this.controls.parameters.sliders.distortion.value * 100) / 100
      const scale = Math.round(this.controls.parameters.sliders.scale.value * 100) / 100
      const w = this.sizes.width * sclFactor
      const h = this.sizes.height * sclFactor
      // a.download = `wone_fA${frequency}_fB${frequencyB}_d${distortion}_s${scale}.jpg`
      a.download = `wone_fA${frequency}_fB${frequencyB}_d${distortion}_s${scale}_${w}_${h}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      this.export.recording = false

      if (sclFactor !== 1) {
        if (this.mode.activeMode.name === 'Pattern') this.mode.mode.updateParticleSize(1)
        this.renderer.instance.setSize(this.sizes.width, this.sizes.height)
      }
      // this.renderer.instance.preserveDrawingBuffer = false
    }
  }

  // exportVideo = () => {
  //   const chunks = []
  //   const canvasStream = this.canvas.captureStream(30) // fps
  //   // Create media recorder from canvas stream
  //   this.mediaRecorder = new MediaRecorder(canvasStream, {
  //     mimeType: 'video/webm; codecs=vp8,opus',
  //   })
  //   // Record data in chunks array when data is available
  //   this.mediaRecorder.ondataavailable = (evt) => { chunks.push(evt.data) }
  //   // Provide recorded data when recording stops
  //   this.mediaRecorder.onstop = () => { this.onMediaRecorderStop(chunks) }
  //   // Start recording using a 1s timeslice [ie data is made available every 1s)
  //   this.mediaRecorder.start(1000)
  // }

  // onMediaRecorderStop = (chunks) => {
  //   // Gather chunks of video data into a blob and create an object URL
  //   const blob = new Blob(chunks, { type: 'video/webm' })
  //   const recordingUrl = URL.createObjectURL(blob)
  //   // Attach the object URL to an <a> element, setting the download file name
  //   const a = document.createElement('a')
  //   a.style = 'display: none;'
  //   a.href = recordingUrl
  //   a.download = 'video.webm'
  //   document.body.appendChild(a)
  //   // Trigger the file download
  //   a.click()
  //   setTimeout(() => {
  //     // Clean up - see https://stackoverflow.com/a/48968694 for why it is in a timeout
  //     URL.revokeObjectURL(recordingUrl)
  //     document.body.removeChild(a)
  //   }, 0)
  // }

  update = () => {
    // this.camera.update()
    if (this.mode) this.mode.update()
    if (this.mode && this.mode.mode.effectComposer) this.mode.mode.effectComposer.render()
    else this.renderer.update()

    if (this.export.recording) this.exportImage()
    // if (this.export.recording) this.exportCC()

    // if (this.time.elapsedTime >= 3 && this.mediaRecorder.state === 'recording') this.mediaRecorder.stop()

    this.stats.update()

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
