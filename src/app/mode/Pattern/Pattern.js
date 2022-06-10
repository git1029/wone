/* eslint-disable no-plusplus */

import * as THREE from 'three'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer'

// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
// import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
// import vertexShader from './shaders/vertex.glsl'
// import fragmentShader from './shaders/fragment.glsl'

import computeShaderPosition from './shaders/computeShaderPosition.glsl'
import computeShaderVelocity from './shaders/computeShaderVelocity.glsl'
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
    this.camera.controls.enabled = true
    this.controls = this.app.controls

    this.init()
  }

  init = () => {
    this.destroy()

    this.renderer.instance.setClearColor(
      this.controls.parameters.color.pattern.value.background,
    )

    this.WIDTH = 512
    this.PARTICLES = this.WIDTH * this.WIDTH

    this.initComputeRenderer()
    this.initSand()
    this.updateValues()

    this.controls.on('parameter-update-slider', () => {
      if (this.app.mode.activeMode.name === 'Pattern') {
        this.updateValues()
      }
    })
    this.controls.on('parameter-update-slider-random', () => {
      if (this.app.mode.activeMode.name === 'Pattern') {
        this.updateValues()
      }
    })
    this.controls.on('parameter-update-color', () => {
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
    const dtVelocity = this.gpuCompute.createTexture()

    this.fillTextures(dtPosition, dtVelocity)

    this.velocityVariable = this.gpuCompute.addVariable('textureVelocity', computeShaderVelocity, dtVelocity)
    this.positionVariable = this.gpuCompute.addVariable('texturePosition', computeShaderPosition, dtPosition)

    this.gpuCompute.setVariableDependencies(
      this.velocityVariable,
      [this.positionVariable, this.velocityVariable],
    )
    this.gpuCompute.setVariableDependencies(
      this.positionVariable,
      [this.positionVariable, this.velocityVariable],
    )

    this.velocityUniforms = this.velocityVariable.material.uniforms
    this.positionUniforms = this.positionVariable.material.uniforms

    this.positionUniforms.n = { value: this.controls.parameters.sliders.frequencyB.value }
    this.positionUniforms.m = { value: this.controls.parameters.sliders.frequency.value }
    this.positionUniforms.uDistortion = { value: this.controls.parameters.sliders.distortion.value }
    this.positionUniforms.uScale = { value: this.controls.parameters.sliders.scale.value }
    this.positionUniforms.uAspect = { value: this.camera.aspect }

    const error = this.gpuCompute.init()
    if (error !== null) {
      console.error(error)
    }
  }

  fillTextures = (texturePosition, textureVelocity) => {
    const posArray = texturePosition.image.data
    const velArray = textureVelocity.image.data
    const maxMass = 10.0
    const randVel = 0.001

    for (let k = 0; k < posArray.length; k += 4) {
      // Position
      const x = Math.random() * 1 - 0.5
      const y = (Math.random() * 1 - 0.5) * this.camera.aspect.y
      const z = 0

      // Velocity
      const vel = 0.02

      const vx = vel * y + (Math.random() * 1 - 0.5) * randVel
      const vy = -vel * x + (Math.random() * 1 - 0.5) * randVel
      const vz = 0

      const mass = Math.random() * (maxMass * 0.75) + maxMass * 0.25

      // Fill in texture values
      posArray[k + 0] = x
      posArray[k + 1] = y
      posArray[k + 2] = z
      posArray[k + 3] = 1

      velArray[k + 0] = vx
      velArray[k + 1] = vy
      velArray[k + 2] = vz
      velArray[k + 3] = mass
    }
  }

  initSand = () => {
    this.geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(this.PARTICLES * 3)
    const uvs = new Float32Array(this.PARTICLES * 2)
    const indexes = new Float32Array(this.PARTICLES * 1)

    let p = 0
    for (let i = 0; i < this.PARTICLES; i++) {
      positions[p++] = (Math.random() * 1 - 0.5)
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

    for (let i = 0; i < this.PARTICLES; i++) {
      indexes[i] = i
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    this.geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
    this.geometry.setAttribute('aIndex', new THREE.BufferAttribute(indexes, 1))

    this.particleUniforms = {
      texturePosition: { value: null },
      textureVelocity: { value: null },
      // 'cameraConstant': { value: getCameraConstant( camera ) },
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
      // blending: THREE.AdditiveBlending,
      vertexColors: true,
      transparent: true,
    })

    this.material.extensions.drawBuffers = true

    this.mesh = new THREE.Points(this.geometry, this.material)
    this.mesh.matrixAutoUpdate = false
    this.mesh.updateMatrix()

    this.scene.add(this.mesh)
  }

  updateValues = () => {
    this.positionUniforms.n.value = this.controls.parameters.sliders.frequencyB.value
    this.positionUniforms.m.value = this.controls.parameters.sliders.frequency.value
    this.positionUniforms.uDistortion.value = this.controls.parameters.sliders.distortion.value
    this.positionUniforms.uScale.value = this.controls.parameters.sliders.scale.value
  }

  updateColors = () => {
    this.material.uniforms.sandColor.value = new THREE.Color(
      this.controls.parameters.color.pattern.value.primary,
    )
    this.material.needsUpdate = true
  }

  update = () => {
    this.gpuCompute.compute()

    this.particleUniforms.texturePosition.value = this.gpuCompute
      .getCurrentRenderTarget(this.positionVariable).texture
    this.particleUniforms.textureVelocity.value = this.gpuCompute
      .getCurrentRenderTarget(this.velocityVariable).texture
    // if (this.material) this.material.uniforms.uTime.value = this.time.elapsedTime
  }

  resize = () => {
    this.init()
  }

  // Destroy
  destroy = () => {
    this.controls.off('parameter-update-slider')
    this.controls.off('parameter-update-slider-random')
    this.controls.off('parameter-update-color')
    if (this.mesh) {
      if (this.mesh.geometry) this.mesh.geometry.dispose()
      if (this.mesh.material) this.mesh.material.dispose()
      this.scene.remove(this.mesh)
    }
  }
}
