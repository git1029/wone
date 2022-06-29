/* eslint-disable no-plusplus */

import * as THREE from 'three'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer'

// import { SVGObject } from 'three/examples/jsm/renderers/SVGRenderer'

// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
// import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
// import vertexShader from './shaders/vertex.glsl'
// import fragmentShader from './shaders/fragment.glsl'

import computeShaderPosition from './shaders/computeShaderPosition.glsl'
// import computeShaderVelocity from './shaders/computeShaderVelocity.glsl'
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
    // this.camera.controls.reset()
    // this.camera.controls.enabled = false
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

    // this.setPostProcessing(true)
    // this.setTextures()
  }

  setEvents = () => {
    this.controls.on('parameter-update-slider', () => {
      // console.log('parameter-update-slider pattern')
      if (this.app.mode.activeMode.name === 'Pattern') {
        this.updateValues(this.checkValues())
        if (this.app.mode.textMode) this.app.mode.textMode.updateValues()
      }
    })
    this.controls.on('parameter-update-slider-random', () => {
      // console.log('parameter-update-random pattern')
      if (this.app.mode.activeMode.name === 'Pattern') {
        this.updateValues()
        if (this.app.mode.textMode) this.app.mode.textMode.updateValues()
      }
    })
    this.controls.on('parameter-update-color-pattern', () => {
      // console.log('parameter-update-color pattern')
      if (this.app.mode.activeMode.name === 'Pattern') {
        this.updateColors()
      }
    })
  }

  // setTextures = () => {
  //   // Check if texture already loaded
  //   if (this.resources.itemsUser.patternTexture) {
  //     // this.updateTexture('itemsUser', 'patternTexture')
  //     // this.setPostProcessing(true)
  //   } else if (this.resources.items.patternTexture) {
  //     // this.updateTexture('items', 'patternTexture')
  //     // this.setPostProcessing(true)
  //   }

  //   // On texture update (new load or user upload)
  //   this.controls.on('texture-update', () => {
  //     if (this.app.mode.activeMode.name === 'Pattern') {
  //       if (this.resources.itemsUser.patternTexture) {
  //       //   this.setPostProcessing(true)
  //         this.renderPass.uniforms.uImage.value = this.resources.itemsUser.patternTexture.file
  //         this.renderPass.needsUpdate = true
  //         // this.updateTexture('itemsUser', 'patternTexture')
  //       } else if (this.resources.items.patternTexture) {
  //         console.log(this.repeatPass)
  //         // console.log(this.resources.items.patternTexture.file)
  //         this.repeatPass.uniforms.uImage.value = this.resources.items.patternTexture.file
  //         this.repeatPass.needsUpdate = true
  //         // this.setPostProcessing(true)
  //         // this.updateTexture('items', 'patternTexture')
  //       }
  //     }
  //   })
  // }

  // updateTexture = (items, name) => {
  //   this.texture = this.resources[items][name].file
  //   this.material.uniforms.uImage.value = this.texture

  //   const img = this.texture.image
  //   this.texAspect = new THREE.Vector4()
  //   this.texAspect.x = img.width
  //   this.texAspect.y = img.height
  //   if (img.width > img.height) {
  //     this.texAspect.z = img.width / img.height
  //     this.texAspect.w = 1
  //   } else if (img.height >= img.width) {
  //     this.texAspect.z = 1
  //     this.texAspect.w = img.height / img.width
  //   }

  //   this.material.uniforms.uTexAspect.value = this.texAspect
  //   this.material.needsUpdate = true
  // }

  initComputeRenderer = () => {
    this.gpuCompute = new GPUComputationRenderer(this.WIDTH, this.WIDTH, this.renderer.instance)

    if (this.renderer.instance.capabilities.isWebGL2 === false) {
      this.gpuCompute.setDataType(THREE.HalfFloatType)
    }

    const dtPosition = this.gpuCompute.createTexture()
    // const dtVelocity = this.gpuCompute.createTexture()

    // this.fillTextures(dtPosition, dtVelocity)
    this.fillTextures(dtPosition)

    // this.velocityVariable = this.gpuCompute.addVariable('textureVelocity', computeShaderVelocity, dtVelocity)
    this.positionVariable = this.gpuCompute.addVariable('texturePosition', computeShaderPosition, dtPosition)

    // this.gpuCompute.setVariableDependencies(
    //   this.velocityVariable,
    //   [this.positionVariable, this.velocityVariable],
    // )
    // this.gpuCompute.setVariableDependencies(
    //   this.positionVariable,
    //   [this.positionVariable, this.velocityVariable],
    // )
    this.gpuCompute.setVariableDependencies(
      this.positionVariable,
      [this.positionVariable],
    )

    // this.velocityUniforms = this.velocityVariable.material.uniforms
    this.positionUniforms = this.positionVariable.material.uniforms

    const keys = ['frequencyA', 'frequencyB', 'distortion', 'scale']
    keys.forEach((key) => {
      const uniform = `u${key[0].toUpperCase()}${key.substring(1, key.length)}`
      this.positionUniforms[uniform] = {
        value: this.controls.getSliderValue(key),
      }
    })

    // this.positionUniforms.n = { value: this.controls.getSliderValue('frequencyB') }
    // this.positionUniforms.m = { value: this.controls.getSliderValue('frequencyA') }
    // this.positionUniforms.uDistortion = { value: this.controls.getSliderValue('distortion') }
    // this.positionUniforms.uScale = { value: this.controls.getSliderValue('scale') }
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
    // const velArray = textureVelocity.image.data
    // const maxMass = 10.0
    // const randVel = 0.001

    for (let k = 0; k < posArray.length; k += 4) {
      // Position
      const x = (Math.random() * 1 - 0.5) * this.camera.aspect.x
      const y = (Math.random() * 1 - 0.5) * this.camera.aspect.y
      const z = 0

      // Velocity
      // const vel = 0.02

      // const vx = vel * y + (Math.random() * 1 - 0.5) * randVel
      // const vy = -vel * x + (Math.random() * 1 - 0.5) * randVel
      // const vz = 0

      // const mass = Math.random() * (maxMass * 0.75) + maxMass * 0.25

      // Fill in texture values
      posArray[k + 0] = x
      posArray[k + 1] = y
      posArray[k + 2] = z
      posArray[k + 3] = 1

      // velArray[k + 0] = vx
      // velArray[k + 1] = vy
      // velArray[k + 2] = vz
      // velArray[k + 3] = mass
    }
  }

  initSand = () => {
    // const geometry = new THREE.CircleGeometry(.1, 10)
    // const material = new THREE.MeshBasicMaterial({
    //   color: 0xff0000,
    // })
    // const mesh = new THREE.Mesh(geometry, material)
    // this.scene.add(mesh)

    // const node = document.createElementNS( 'http://www.w3.org/2000/svg', 'circle' );
    // // node.setAttribute( 'stroke', 'black' );
    // node.setAttribute( 'fill', 'red' );
    // node.setAttribute( 'r', '1' );

    // for ( let i = 0; i < this.PARTICLES; i ++ ) {

    //   const object = new SVGObject( node.cloneNode() );
    //   object.position.x = Math.random() * 1 - .5;
    //   object.position.y = Math.random() * 1 - .5;
    //   object.position.z = Math.random() * 1 - .5;
    //   this.scene.add( object );

    // }

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

    this.particleUniforms = {
      texturePosition: { value: null },
      textureVelocity: { value: null },
      uSize: { value: this.sizes.width / 1000 }, // [0 -> 1]
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

    // this.material = new THREE.ShaderMaterial({
    //   depthWrite: false,
    //   // uniforms: this.particleUniforms,
    //   vertexShader: vertexSVG,
    //   fragmentShader: fragmentSVG,
    //   // blending: THREE.AdditiveBlending,
    //   vertexColors: true,
    //   transparent: false,
    // })

    this.material.extensions.drawBuffers = true

    // this.material = new THREE.PointsMaterial({
    //   size: 0.005,
    //   sizeAttenuation: true,
    //   color: 0xff0000,
    // })

    this.mesh = new THREE.Points(this.geometry, this.material)
    this.mesh.matrixAutoUpdate = false
    this.mesh.updateMatrix()

    this.scene.add(this.mesh)

    // const vertices = [];
    // const divisions = 50;

    // for ( let i = 0; i <= divisions; i ++ ) {

    //   const v = ( i / divisions ) * ( Math.PI * 2 );

    //   const x = Math.sin( v );
    //   const z = Math.cos( v );

    //   vertices.push( x, 0, z );

    // }

    // const geometry = new THREE.BufferGeometry();
    // geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

    // //

    // for ( let i = 1; i <= 3; i ++ ) {

    //   const material = new THREE.LineBasicMaterial( {
    //     color: Math.random() * 0xffffff,
    //     linewidth: 10
    //   } );
    //   const line = new THREE.Line( geometry, material );
    //   line.scale.setScalar( i / 3 );
    //   this.scene.add( line );

    // }

    // const material = new THREE.LineDashedMaterial( {
    //   color: 'blue',
    //   linewidth: 1,
    //   dashSize: 10,
    //   gapSize: 10
    // } );
    // const line = new THREE.Line( geometry, material );
    // line.scale.setScalar( 2 );
    // this.scene.add( line );
  }

  // setPostProcessing = (active = true) => {
  //   if (!active) {
  //     if (this.effectComposer) {
  //       this.effectComposer.passes.forEach((pass) => {
  //         this.effectComposer.removePass(pass)
  //       })
  //     }

  //     this.effectComposer = null
  //     return
  //   }

  //   // Render target
  //   let RenderTargetClass = null
  //   if (this.renderer.pixelRatio === 1 && this.renderer.instance.capabilities.isWebGL2) {
  //     // WebGLMultisampleRenderTarget supports antialiasing (but not currently supported on Safari)
  //     RenderTargetClass = THREE.WebGLMultisampleRenderTarget
  //     // console.log('using WebGLMultisampleRenderTarget')
  //   } else {
  //     // use standard WebGLRenderTarget if pixel ratio > 1 or WebGL2 not supported
  //     RenderTargetClass = THREE.WebGLRenderTarget
  //     // console.log('using WebGLRenderTarget')
  //   }

  //   const renderTarget = new RenderTargetClass(
  //     800,
  //     600,
  //     {
  //       minFilter: THREE.LinearFilter,
  //       magFilter: THREE.LinearFilter,
  //       format: THREE.RGBAFormat,
  //       encoding: THREE.sRGBEncoding,
  //     },
  //   )

  //   // Composer
  //   this.effectComposer = new EffectComposer(this.renderer.instance, renderTarget)
  //   this.effectComposer.setPixelRatio(this.renderer.pixelRatio)
  //   this.effectComposer.setSize(this.sizes.width, this.sizes.height)

  //   // Passes
  //   const renderPass = new RenderPass(this.scene, this.camera.instance)
  //   this.effectComposer.addPass(renderPass)

  //   // const texture = this.resources.items.patternTexture.file
  //   // texture.needsUpdate = true

  //   // Repeat pass
  //   const ImageShader = {
  //     uniforms: {
  //       tDiffuse: { value: null },
  //       uImage: { value: null },
  //     },
  //     vertexShader,
  //     fragmentShader,
  //   }

  //   this.repeatPass = new ShaderPass(ImageShader)
  //   this.effectComposer.addPass(this.repeatPass)
  // }

  updateValues = (restartTime = true) => {
    const keys = ['frequencyA', 'frequencyB', 'distortion', 'scale']
    keys.forEach((key) => {
      const uniform = `u${key[0].toUpperCase()}${key.substring(1, key.length)}`
      this.positionUniforms[uniform].value = this.controls.getSliderValue(key)
    })

    // this.positionUniforms.n.value = this.controls.getSliderValue('frequencyB')
    // this.positionUniforms.m.value = this.controls.getSliderValue('frequencyA')
    // this.positionUniforms.uDistortion.value = this.controls.getSliderValue('distortion')
    // this.positionUniforms.uScale.value = this.controls.getSliderValue('scale')
    this.positionUniforms.uTime.value = this.time.elapsedTime
    if (restartTime) this.positionUniforms.uStartTime.value = this.time.elapsedTime
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
    // this.particleUniforms.textureVelocity.value = this.gpuCompute.getCurrentRenderTarget(this.velocityVariable).texture

    // if (this.material) this.material.uniforms.uTime.value = this.time.elapsedTime
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
    // if (this.effectComposer) {
    //   this.effectComposer.passes.forEach((pass) => {
    //     this.effectComposer.removePass(pass)
    //   })
    // }
    // this.effectComposer = null
  }
}
