import * as THREE from 'three'
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
    this.camera.controls.reset()
    this.camera.controls.enabled = false

    this.init()
  }

  init = () => {
    this.destroy()

    // Mesh
    this.geometry = new THREE.PlaneGeometry(1, 1 * this.camera.aspect.y)
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        m: { value: this.controls.parameters.sliders.frequency.value },
        n: { value: this.controls.parameters.sliders.frequencyB.value },
        uDistortion: { value: this.controls.parameters.sliders.distortion.value },
        uDisplacement: { value: this.controls.parameters.sliders.displacement.value },
        uScale: { value: this.controls.parameters.sliders.scale.value },
        uGrain: { value: this.controls.parameters.sliders.grain.value },
        uAspect: { value: this.camera.aspect },
        uTexAspect: { value: new THREE.Vector4() },
        uResolution: { value: new THREE.Vector2(this.sizes.width, this.sizes.height) },
        uImage: { value: null },
      },
      vertexShader,
      fragmentShader,
    })
    this.mesh = new THREE.Mesh(this.geometry, this.material)

    this.setTextures()

    this.scene.add(this.mesh)

    this.controls.on('parameter-update-slider', () => {
      if (this.app.mode.activeMode.name === 'Image') {
        this.updateValues()
      }
    })
    this.controls.on('parameter-update-slider-random', () => {
      if (this.app.mode.activeMode.name === 'Image') {
        this.updateValues()
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

  updateValues = () => {
    this.material.uniforms.n.value = this.controls.parameters.sliders.frequencyB.value
    this.material.uniforms.m.value = this.controls.parameters.sliders.frequency.value
    this.material.uniforms.uDistortion.value = this.controls.parameters.sliders.distortion.value
    this.material.uniforms.uDisplacement.value = this.controls.parameters.sliders.displacement.value
    this.material.uniforms.uScale.value = this.controls.parameters.sliders.scale.value
    this.material.uniforms.uGrain.value = this.controls.parameters.sliders.grain.value
    this.material.needsUpdate = true
  }

  destroy = () => {
    this.controls.off('texture-update')
    this.controls.off('parameter-update-slider')
    this.controls.off('parameter-update-slider-random')
    if (this.mesh) {
      if (this.mesh.geometry) this.mesh.geometry.dispose()
      if (this.mesh.material) this.mesh.material.dispose()
      this.scene.remove(this.mesh)
    }
  }
}
