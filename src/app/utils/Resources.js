import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import EventEmitter from './EventEmitter'

export default class Resources extends EventEmitter {
  constructor(sources) {
    super()

    // Options
    this.sources = sources

    // Setup
    this.items = {}
    this.toLoad = this.sources.map((source) => source.path).flat().length
    this.loaded = 0
    this.itemsUser = {}

    this.setLoaders()
    this.startLoading()
  }

  setLoaders = () => {
    this.loaders = {}
    this.loaders.fontLoader = new FontLoader()
    this.loaders.textureLoader = new THREE.TextureLoader()
  }

  startLoading = () => {
    // // Check localStorage for previous uploads
    // // NOTE: disabling as can't guarantee image upload size and localStorage has limit
    // this.sources.forEach((source) => {
    //   if (['patternTexture'].includes(source.name)) {
    //     if (localStorage.getItem(source.name)) {
    //       const storage = JSON.parse(localStorage.getItem(source.name))
    //       source.path = storage.name
    //       source.data = storage.src
    //     }

    //     // if (localStorage.getItem('woneParams')) {
    //     //   const params = JSON.parse(localStorage.getItem('woneParams'))
    //     //   if (params && params.image && params.image.value && params.image.name === 'patternTexture') {
    //     //     const texture = params.image.value
    //     //     console.log(texture)
    //     //     // this.sourceLoaded(texture.source, texture.file)
    //     //   }
    //     // }
    //   }
    // })

    this.sources.forEach((source) => {
      if (source.type === 'texture') {
        this.loaders.textureLoader.load(
          source.data ? source.data : source.path,
          (file) => {
            this.sourceLoaded(source, file)
          },
        )
      } else if (source.type === 'font') {
        this.loaders.fontLoader.load(
          source.path,
          (file) => {
            this.sourceLoaded(source, file)
          },
        )
      } else if (source.type === 'matcap') {
        this.items[source.name] = []
        source.path.forEach((path) => {
          this.loaders.textureLoader.load(
            path,
            (file) => {
              this.sourceLoaded({ ...source, path }, file)
            },
          )
        })
      } else {
        console.warn(`Invalid source type: ${source.type}`)
        this.toLoad -= 1
      }
    })
  }

  sourceLoaded = (source, file) => {
    if (source.type === 'matcap') {
      let name = source.path.match(/[^/]+(?=\.[^/.]*$)/)[0]
      name = name[0].toUpperCase() + name.substring(1).toLowerCase()
      this.items[source.name][name] = { source, file }
      this.items[source.name].push({ source: { ...source, name }, file })
    } else {
      this.items[source.name] = { source, file }
    }

    this.loaded += 1

    if (this.loaded === this.toLoad) {
      console.log(`${this.loaded} ${this.loaded === 1 ? 'file' : 'files'} loaded`)
      this.trigger('ready')
    }
  }

  loadFile = (file, name) => {
    const filename = file.name
    const extension = filename.split('.').pop().toLowerCase()

    if (['jpg', '.jpeg', 'png'].includes(extension)) {
      const reader = new FileReader()
      reader.onload = (event) => this.loadImage(event, name, filename)
      reader.readAsDataURL(file)
    } else {
      console.warn('Invalid file format')
    }
  }

  loadImage = (event, name, filename) => {
    const img = new Image()
    img.onload = (imgEvent) => {
      this.itemsUser[name] = {
        source: {
          name,
          path: filename,
          type: 'texture',
        },
        file: new THREE.Texture(imgEvent.target),
      }
      this.itemsUser[name].file.needsUpdate = true
      this.trigger(`ready-${name}`)
      console.log(this.itemsUser)
    }
    img.src = event.target.result

    // const imgData = {
    //   name: filename,
    //   src: img.src,
    // }
    // localStorage.setItem(name, JSON.stringify(imgData))
  }
}
