import * as THREE from 'three'
import * as Utils from '../../utils/controls/utils/Utils'
import App from '../../App'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

export default class Image {
  constructor() {
    this.app = new App()

    // Setup
    this.scene = this.app.scene
    this.camera = this.app.camera
    this.sizes = this.app.sizes
    this.resources = this.app.resources
    this.controls = this.app.controls
    this.camera = this.app.camera
    this.renderer = this.app.renderer
    // this.camera.controls.reset()
    // this.camera.controls.enabled = false
    this.time = this.app.time

    this.init()
  }

  init = () => {
    this.destroy()

    this.renderer.instance.setClearColor(0x000000, 0)
    this.renderer.instance.setClearAlpha(0)
    this.app.canvas.style.background = '#1D1D1B'

    const uniforms = {}
    const keys = ['frequencyA', 'frequencyB', 'distortion', 'displacement', 'scale', 'grain']
    keys.forEach((key) => {
      const uniform = `u${key[0].toUpperCase()}${key.substring(1, key.length)}`
      uniforms[uniform] = {
        value: this.controls.getSliderValue(key),
      }
    })

    const imgOffset = new THREE.Vector2(
      this.controls.parameters.sliders.imageOffsetX.value / 100,
      this.controls.parameters.sliders.imageOffsetY.value / 100,
    )

    // Mesh
    this.geometry = new THREE.PlaneGeometry(this.camera.aspect.x, this.camera.aspect.y)
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        ...uniforms,
        uAspect: { value: this.camera.aspect },
        uTexAspect: { value: new THREE.Vector4() },
        uResolution: { value: new THREE.Vector2(this.sizes.width, this.sizes.height) },
        uImage: { value: null },
        uTime: { value: 0 },
        uImgOffset: { value: imgOffset },
        uImgFitWidth: { value: this.controls.parameters.buttons.image.fitWidth.value },
        uImgFitHeight: { value: this.controls.parameters.buttons.image.fitHeight.value },
        uImgScaleCustom: { value: false },
        uImgScale: { value: this.controls.parameters.imageScale.value },
      },
      vertexShader,
      fragmentShader,
    })
    this.mesh = new THREE.Mesh(this.geometry, this.material)

    this.setTextures()

    this.scene.add(this.mesh)

    this.setEvents()
  }

  setEvents = () => {
    this.controls.on('parameter-update-slider', () => {
      // console.log('parameter-update-slider image')
      if (this.app.mode.activeMode.name === 'Image') {
        this.updateValues()
        if (this.app.mode.textMode) this.app.mode.textMode.updateValues()
      }
    })
    this.controls.on('parameter-update-image-position', () => {
      // console.log('parameter-update-image-position image')
      if (this.app.mode.activeMode.name === 'Image') {
        this.material.uniforms.uImgOffset.value.x = this.controls.parameters.sliders.imageOffsetX.value / 100
        this.material.uniforms.uImgOffset.value.y = this.controls.parameters.sliders.imageOffsetY.value / 100
        this.material.needsUpdate = true
        // this.updateValues()
        // if (this.app.mode.textMode) this.app.mode.textMode.updateValues()
      }
    })
    this.controls.on('parameter-update-image-scale', () => {
      // console.log('parameter-update-image-scale image')
      if (this.app.mode.activeMode.name === 'Image') {
        const scale = this.controls.parameters.imageScale
        // this.material.uniforms.uImgScale.value = Utils.map(scale.value, scale.options.min, scale.options.max, 1, 0.5)
        this.material.uniforms.uImgScale.value = scale.value
        this.material.needsUpdate = true
        // this.updateValues()
        // if (this.app.mode.textMode) this.app.mode.textMode.updateValues()
      }
    })
    this.controls.on('parameter-update-slider-random', () => {
      // console.log('parameter-update-random image')
      if (this.app.mode.activeMode.name === 'Image') {
        this.updateValues()
        if (this.app.mode.textMode) this.app.mode.textMode.updateValues()
      }
    })
  }

  setTextures = () => {
    // Check if texture already loaded
    if (this.resources.itemsUser.patternTexture) {
      this.updateTexture('itemsUser', 'patternTexture')
    } else if (this.resources.items.patternTexture) {
      this.updateTexture('items', 'patternTexture')
    }

    // On texture update (new load or user upload)
    this.controls.on('texture-update', () => {
      if (this.app.mode.activeMode.name === 'Image') {
        if (this.resources.itemsUser.patternTexture) {
          this.updateTexture('itemsUser', 'patternTexture')
        } else if (this.resources.items.patternTexture) {
          this.updateTexture('items', 'patternTexture')
        }
      }
    })
  }

  updateTexture = (items, name) => {
    this.texture = this.resources[items][name].file
    this.material.uniforms.uImage.value = this.texture

    const img = this.texture.image
    this.texAspect = new THREE.Vector4()
    this.texAspect.x = img.width
    this.texAspect.y = img.height
    if (img.width > img.height) {
      this.texAspect.z = img.width / img.height
      this.texAspect.w = 1
    } else if (img.height >= img.width) {
      this.texAspect.z = 1
      this.texAspect.w = img.height / img.width
    }

    this.material.uniforms.uTexAspect.value = this.texAspect
    this.material.needsUpdate = true
  }

  resize = () => {
    this.init()
  }

  animate = () => {
    this.updateValues()
  }

  updateValues = () => {
    const keys = ['frequencyA', 'frequencyB', 'distortion', 'displacement', 'scale', 'grain']
    keys.forEach((key) => {
      const uniform = `u${key[0].toUpperCase()}${key.substring(1, key.length)}`
      this.material.uniforms[uniform].value = this.controls.getSliderValue(key)
    })
    // this.material.uniforms.uFrequencyA.value = this.controls.getSliderValue('frequencyA')
    // this.material.uniforms.uFrequencyB.value = this.controls.getSliderValue('frequencyB')
    // this.material.uniforms.uDistortion.value = this.controls.getSliderValue('distortion')
    // this.material.uniforms.uDisplacement.value = this.controls.getSliderValue('displacement')
    // this.material.uniforms.uScale.value = this.controls.getSliderValue('scale')
    // this.material.uniforms.uGrain.value = this.controls.getSliderValue('grain')
    this.material.needsUpdate = true
  }

  update = () => {
    this.material.uniforms.uTime.value = this.time.elapsedTime
    this.material.needsUpdate = true
  }

  fitImage = () => {
    this.material.uniforms.uImgFitWidth.value = this.controls.parameters.buttons.image.fitWidth.value
    this.material.uniforms.uImgFitHeight.value = this.controls.parameters.buttons.image.fitHeight.value
    this.material.needsUpdate = true
  }

  // fitImageToHeight = () => {
  //   this.material.uniforms.uImgFitWidth.value = false
  //   this.material.uniforms.uImgFitHeight.value = true
  //   this.material.needsUpdate = true
  // }

  destroy = () => {
    this.controls.off('texture-update')
    this.controls.off('parameter-update-slider')
    this.controls.off('parameter-update-image-position')
    this.controls.off('parameter-update-slider-random')
    if (this.mesh) {
      if (this.mesh.geometry) this.mesh.geometry.dispose()
      if (this.mesh.material) this.mesh.material.dispose()
      this.scene.remove(this.mesh)
    }
  }
}
