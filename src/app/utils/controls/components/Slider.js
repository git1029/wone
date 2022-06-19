/* eslint-disable no-param-reassign */

import Controls from '../Controls'
import * as Utils from '../utils/Utils'

export default class Slider {
  constructor() {
    this.controls = new Controls()
    this.app = this.controls.app
    this.parameters = this.controls.parameters
  }

  reset = () => {
    Object.keys(this.parameters.sliders).forEach((key) => {
      const parameter = this.parameters.sliders[key]
      const value = parameter.options.default
      this.update(parameter, value, true)
    })
    this.controls.updateLocalStorage()
    this.controls.trigger('parameter-update-slider')
  }

  randomize = () => {
    if (this.parameters.mode.value.name === 'Text') {
      if (this.app.mode && this.app.mode.activeMode.name === 'Text'
      && this.app.mode.mode && this.app.mode.mode.randomizeXOffset) {
        this.app.mode.mode.randomizeXOffset()
      }
    } else {
      const { sliders } = this.parameters
      const keys = ['frequency', 'frequencyB', 'distortion']
      keys.forEach((key) => {
        const slider = sliders[key]
        const { min, max } = slider.options
        const pres = Utils.precision(slider.options.step)
        const value = Math.round((Math.random() * (max - min) + min) * 10 ** pres) / 10 ** pres

        slider.value = value
        slider.controller.value = value

        const sliderInput = slider.controller
        const sliderValue = sliderInput.nextElementSibling
        sliderValue.innerHTML = value
        const left = Utils.map(value, min, max, 0, sliderInput.offsetWidth - sliderValue.offsetWidth)
        sliderValue.style.left = `${left}px`
      })
      this.controls.trigger('parameter-update-slider-random')
      this.controls.updateLocalStorage()
    }
  }

  // eslint-disable-next-line class-methods-use-this
  update = (parameter, value, updateInput = false) => {
    const sliderValue = parameter.controller.nextElementSibling

    parameter.value = value
    sliderValue.innerHTML = value

    if (updateInput) {
      const sliderInput = parameter.controller
      sliderInput.value = value
    }

    // sliderValue.style.left = `${this.map(slider.value, slider.options.min, slider.options.max, 0, 100)}%`
    // const leftMax = sliderInput.offsetWidth - sliderValue.offsetWidth
    const leftMax = 500 - sliderValue.offsetWidth
    const left = Utils.map(parameter.value, parameter.options.min, parameter.options.max, 0, leftMax)
    sliderValue.style.left = `${left}px`

    // const slider = sliders[key]
    // const { min, max } = slider.options
    // const pres = this.precision(slider.options.step)
    // const value = Math.round((Math.random() * (max - min) + min) * 10 ** pres) / 10 ** pres

    // slider.value = value
    // slider.controller.value = value

    // const sliderInput = slider.controller
    // sliderValue.innerHTML = value
    // const left = this.map(value, min, max, 0, sliderInput.offsetWidth - sliderValue.offsetWidth)
    // sliderValue.style.left = `${left}px`
  }

  create = (name, parent = document.querySelector('#inputs')) => {
    const parameter = this.parameters.sliders[name]
    parent.classList.add(...parameter.modes.map((mode) => `${mode}-mode`))

    const inputContainer = document.createElement('div')
    inputContainer.classList.add('input', name)
    inputContainer.classList.add(...parameter.modes.map((mode) => `${mode}-mode`))

    const sliderContainer = document.createElement('div')
    sliderContainer.classList.add('input-slider')

    const sliderSpan = document.createElement('span')
    sliderSpan.classList.add('input-slider-bg')

    const sliderValue = document.createElement('span')
    sliderValue.classList.add('input-slider-value')
    sliderValue.innerHTML = parameter.value

    const sliderInput = document.createElement('input')
    const attributes = {
      type: 'range',
      min: parameter.options.min,
      max: parameter.options.max,
      step: parameter.options.step,
      value: parameter.value,
      tabindex: '0',
      id: name,
      class: 'slider',
    }
    Utils.setAttributes(sliderInput, attributes)

    sliderInput.addEventListener('input', (event) => {
      const value = parseFloat(event.target.value)
      this.update(parameter, value)

      this.controls.updateLocalStorage()
      this.controls.trigger('parameter-update-slider')
    })

    parameter.controller = sliderInput
    this.controls.controllers.push(sliderInput)

    const range = document.createElement('div')
    range.classList.add('range')
    const rangeMin = parameter.options.range[0] || parameter.options.min
    const rangeMax = parameter.options.range[1] || parameter.options.max
    // range.innerHTML = `<div>${rangeMin}</div><div>${rangeMax}</div>`
    range.innerHTML = `
      <div class="min">${rangeMin}</div>
      <label>${parameter.options.label}</label>
      <div class="max">${rangeMax}</div>
    `

    // const min = document.createElement('div')
    // min.setAttribute('class', 'min')
    // min.innerHTML = rangeMin

    // const max = document.createElement('div')
    // max.setAttribute('class', 'max')
    // max.innerHTML = rangeMax

    // const sliderWrapper = document.createElement('div')
    // sliderWrapper.setAttribute('class', 'slider-wrapper')
    // sliderWrapper.appendChild(sliderSpan)
    // sliderWrapper.appendChild(sliderInput)

    // sliderContainer.appendChild(min)
    // sliderContainer.appendChild(sliderWrapper)
    sliderContainer.appendChild(sliderSpan)
    sliderContainer.appendChild(sliderInput)
    // sliderContainer.appendChild(max)
    sliderContainer.appendChild(sliderValue)

    const label = document.createElement('label')
    label.setAttribute('for', name)
    label.innerText = parameter.options.label || ''

    inputContainer.appendChild(sliderContainer)
    inputContainer.appendChild(range)
    // inputContainer.appendChild(label)

    parent.appendChild(inputContainer)
    // const leftMax = sliderInput.offsetWidth - sliderValue.offsetWidth
    const leftMax = 500 - sliderValue.offsetWidth
    const left = Utils.map(parameter.value, parameter.options.min, parameter.options.max, 0, leftMax)
    sliderValue.style.left = `${left}px`
  }
}
