import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import App from './App'

export default class Camera {
  constructor() {
    this.app = new App()
    this.sizes = this.app.sizes
    this.scene = this.app.scene
    this.canvas = this.app.canvas

    this.distance = 1

    this.setInstance()
  }

  setInstance = (mode = 'Ortho', pos = new THREE.Vector3(0, 0, 1)) => {
    if (this.instance) this.scene.remove(this.instance)

    this.setAspect()
    this.width = this.distance * this.aspect.x
    this.height = this.distance * this.aspect.y

    if (mode === 'Ortho') {
      this.instance = new THREE.OrthographicCamera(
        -this.width / 2,
        this.width / 2,
        this.height / 2,
        -this.height / 2,
        -1000,
        1000,
      )
    } else {
      this.instance = new THREE.PerspectiveCamera(
        75,
        this.width / this.height,
        0.01,
        1000,
      )
    }
    this.instance.position.set(...pos)
    this.scene.add(this.instance)
    this.setOrbitControls()
  }

  resize = () => {
    this.setAspect()
    this.width = this.distance * this.aspect.x
    this.height = this.distance * this.aspect.y
    this.instance.left = -this.width / 2
    this.instance.right = this.width / 2
    this.instance.top = this.height / 2
    this.instance.bottom = -this.height / 2
    if (this.instance.aspect) {
      this.instance.aspect = this.width / this.height
    }
    this.instance.updateProjectionMatrix()
  }

  setAspect = () => {
    this.aspect = new THREE.Vector2(1, 1)
    if (this.sizes.width > this.sizes.height) {
      this.aspect.x = this.sizes.width / this.sizes.height
      this.aspect.y = 1
    } else if (this.sizes.height > this.sizes.width) {
      this.aspect.x = 1
      this.aspect.y = this.sizes.height / this.sizes.width
    }
  }

  setOrbitControls = () => {
    this.controls = new OrbitControls(this.instance, this.canvas)
    // this.controls.enableDamping = true
    this.controls.enabled = false
  }

  update = () => {
    this.controls.update()
  }
}
