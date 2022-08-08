/* eslint-disable no-plusplus */

import * as THREE from 'three'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer'
import computeShaderPosition from './shaders/computeShaderPosition.glsl'
import particleFragmentShader from './shaders/particleFragmentShader.glsl'
import particleVertexShader from './shaders/particleVertexShader.glsl'

import App from '../../App'

export default class Pattern {
  constructor() {
    this.app = new App()

    // Setup
    this.scene = this.app.scene
    this.resources = this.app.resources
    this.renderer = this.app.renderer
    this.sizes = this.app.sizes
    this.time = this.app.time
    this.camera = this.app.camera
    this.controls = this.app.controls

    this.init()
  }

  init = () => {
    this.destroy()

    this.renderer.instance.setClearColor(
      this.controls.parameters.color.pattern.value.background,
    )

    // Number of particles (storing particle data in each "pixel")
    this.WIDTH = 512
    this.PARTICLES = this.WIDTH * this.WIDTH

    this.initComputeRenderer()
    this.initSand()
    this.updateValues()

    this.setEvents()
  }

  setEvents = () => {
    this.controls.on('parameter-update-slider', () => {
      if (this.app.mode.activeMode.name === 'Pattern') {
        this.updateValues(this.checkValues())
        if (this.app.mode.textMode) this.app.mode.textMode.updateValues()
      }
    })
    this.controls.on('parameter-update-slider-random', () => {
      if (this.app.mode.activeMode.name === 'Pattern') {
        this.updateValues()
        if (this.app.mode.textMode) this.app.mode.textMode.updateValues()
      }
    })
    this.controls.on('parameter-update-color-pattern', () => {
      if (this.app.mode.activeMode.name === 'Pattern') {
        this.updateColors()
      }
    })
  }

  initComputeRenderer = () => {
    this.gpuCompute = new GPUComputationRenderer(this.WIDTH, this.WIDTH, this.renderer.instance)

    if (this.renderer.instance.capabilities.isWebGL2 === false) {
      this.gpuCompute.setDataType(THREE.HalfFloatType)
    }

    const dtPosition = this.gpuCompute.createTexture()

    this.fillTextures(dtPosition)

    this.positionVariable = this.gpuCompute.addVariable('texturePosition', computeShaderPosition, dtPosition)

    this.gpuCompute.setVariableDependencies(
      this.positionVariable,
      [this.positionVariable],
    )

    this.positionUniforms = this.positionVariable.material.uniforms

    const keys = ['frequencyA', 'frequencyB', 'distortion', 'scale']
    keys.forEach((key) => {
      const uniform = `u${key[0].toUpperCase()}${key.substring(1, key.length)}`
      this.positionUniforms[uniform] = {
        value: this.controls.getSliderValue(key),
      }
    })

    this.positionUniforms.uAspect = { value: this.camera.aspect }
    this.positionUniforms.uTime = { value: 0 }
    this.positionUniforms.uStartTime = { value: 0 }

    const error = this.gpuCompute.init()
    if (error !== null) {
      console.error(error)
    }
  }

  fillTextures = (texturePosition) => {
    const posArray = texturePosition.image.data

    for (let k = 0; k < posArray.length; k += 4) {
      // Position
      const x = (Math.random() * 1 - 0.5) * this.camera.aspect.x
      const y = (Math.random() * 1 - 0.5) * this.camera.aspect.y
      const z = 0

      // Fill in texture values
      posArray[k + 0] = x
      posArray[k + 1] = y
      posArray[k + 2] = z
      posArray[k + 3] = 1
    }
  }

  initSand = () => {
    this.geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(this.PARTICLES * 3)
    const uvs = new Float32Array(this.PARTICLES * 2)
    const indexes = new Float32Array(this.PARTICLES * 1)
    const masses = new Float32Array(this.PARTICLES * 1)

    let p = 0
    for (let i = 0; i < this.PARTICLES; i++) {
      positions[p++] = (Math.random() * 1 - 0.5) * this.camera.aspect.x
      positions[p++] = ((Math.random() * 1 - 0.5)) * this.camera.aspect.y
      positions[p++] = 0
    }

    p = 0
    for (let j = 0; j < this.WIDTH; j++) {
      for (let i = 0; i < this.WIDTH; i++) {
        uvs[p++] = i / (this.WIDTH - 1)
        uvs[p++] = (j / (this.WIDTH - 1))
      }
    }

    const maxMass = 10
    for (let i = 0; i < this.PARTICLES; i++) {
      indexes[i] = i
      masses[i] = Math.random() * (maxMass * 0.75) + maxMass * 0.25
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    this.geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
    this.geometry.setAttribute('aIndex', new THREE.BufferAttribute(indexes, 1))
    this.geometry.setAttribute('aMass', new THREE.BufferAttribute(masses, 1))

    // Use diagonal length of canvas instead of width
    const particleSize = Math.sqrt(this.sizes.width ** 2 + this.sizes.height ** 2)
      / Math.sqrt(this.sizes.limit.width ** 2 + this.sizes.limit.height ** 2)

    this.particleUniforms = {
      texturePosition: { value: null },
      textureVelocity: { value: null },
      uSize: { value: particleSize },
      density: { value: 0.0 },
      sandColor: {
        value: new THREE.Color(this.controls.parameters.color.pattern.value.primary),
      },
    }

    this.material = new THREE.ShaderMaterial({
      depthWrite: false,
      uniforms: this.particleUniforms,
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      vertexColors: true,
      transparent: true,
    })

    this.material.extensions.drawBuffers = true

    this.mesh = new THREE.Points(this.geometry, this.material)
    this.mesh.matrixAutoUpdate = false
    this.mesh.updateMatrix()

    this.scene.add(this.mesh)
  }

  updateValues = (restartTime = true) => {
    const keys = ['frequencyA', 'frequencyB', 'distortion', 'scale']
    keys.forEach((key) => {
      const uniform = `u${key[0].toUpperCase()}${key.substring(1, key.length)}`
      this.positionUniforms[uniform].value = this.controls.getSliderValue(key)
    })

    this.positionUniforms.uTime.value = this.time.elapsedTime
    if (restartTime) this.positionUniforms.uStartTime.value = this.time.elapsedTime

    // console.log(restartTime)
    // console.log(this.positionUniforms.uTime.value - this.positionUniforms.uStartTime.value)
    // console.log(this.positionUniforms.uStartTime.value)
  }

  updateColors = () => {
    this.material.uniforms.sandColor.value = new THREE.Color(
      this.controls.parameters.color.pattern.value.primary,
    )
    this.material.needsUpdate = true
  }

  updateParticleSize = (size) => {
    this.material.uniforms.uSize.value = size
    this.material.needsUpdate = true
  }

  update = () => {
    this.gpuCompute.compute()

    this.positionUniforms.uTime.value = this.time.elapsedTime
    this.particleUniforms.texturePosition.value = this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture

    // console.log(this.positionUniforms.uTime.value, 'uTime')
    // console.log(this.positionUniforms.uStartTime.value, 'uStartTime')
    // console.log(this.positionUniforms.uTime.value - this.positionUniforms.uStartTime.value)
  }

  // Do not restart time if slider values are equal between keyframes or if updating text values
  checkValues = () => {
    let restartTime = true
    const keys = ['frequencyA', 'frequencyB', 'distortion', 'scale']
    keys.forEach((key) => {
      const slider = this.controls.parameters.sliders[key]
      if (slider.keyframes) {
        restartTime = restartTime && (
          (this.controls.parameters.sliders[key].value.a === this.controls.parameters.sliders[key].value.b)
          && (this.controls.parameters.sliders[key].value.a === this.controls.parameters.sliders[key].prevValue.b)
          && (this.controls.parameters.sliders[key].value.a === this.controls.parameters.sliders[key].prevValue.a)
          && (this.controls.parameters.sliders[key].value.b === this.controls.parameters.sliders[key].prevValue.b)
        )
      }
    })
    return !restartTime
  }

  animate = () => {
    this.updateValues(this.checkValues())
  }

  resize = () => {
    this.init()
  }

  // Destroy
  destroy = () => {
    this.controls.off('parameter-update-slider')
    this.controls.off('parameter-update-slider-random')
    this.controls.off('parameter-update-color-pattern')
    if (this.mesh) {
      if (this.mesh.geometry) this.mesh.geometry.dispose()
      if (this.mesh.material) this.mesh.material.dispose()
      this.scene.remove(this.mesh)
    }
  }
}
