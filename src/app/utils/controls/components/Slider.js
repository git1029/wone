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
      if (!this.parameters.sliders[key].ignoreReset) {
        const slider = this.parameters.sliders[key]
        const value = typeof slider.options.default === 'object'
          ? { ...slider.options.default }
          : slider.options.default
        this.update(slider, value, true)
      }
    })
    this.controls.updateLocalStorage()
    this.controls.trigger('parameter-update-slider')
  }

  randomize = () => {
    const { sliders } = this.parameters
    const keys = ['frequencyA', 'frequencyB', 'distortion', 'scale']
    keys.forEach((key) => {
      const slider = sliders[key]
      const { min, max } = slider.options
      const pres = Utils.precision(slider.options.step)
      const value = Math.round((Math.random() * (max - min) + min) * 10 ** pres) / 10 ** pres

      this.update(slider, value, true)
    })

    if (this.app.mode && this.app.mode.activeMode.name === 'Text'
    && this.app.mode.mode && this.app.mode.mode.randomizeXOffset) {
      this.app.mode.mode.randomizeXOffset()
    }

    this.controls.trigger('parameter-update-slider-random')
    this.controls.updateLocalStorage()
  }

  // eslint-disable-next-line class-methods-use-this
  update = (parameter, value, updateInput = false) => {
    const keyframe = this.parameters.keyframe.value.key

    parameter.prevValue = typeof parameter.value === 'object'
      ? { ...parameter.value }
      : parameter.value

    if (parameter.keyframes) {
      if (typeof value === 'object') parameter.value = value
      else parameter.value[keyframe] = value
    } else parameter.value = value

    const valueSlider = parameter.keyframes ? parameter.value[keyframe] : parameter.value

    if (updateInput) parameter.controller.value = valueSlider

    const sliderValue = parameter.controller.nextElementSibling
    const sliderValueSpan = sliderValue.querySelector('span')
    sliderValueSpan.innerHTML = valueSlider

    const left = Utils.map(valueSlider, parameter.options.min, parameter.options.max, 0, 1)
    const offset = 10 * Utils.map(left, 0, 1, 1, -1) - sliderValueSpan.offsetWidth / 2
    sliderValueSpan.style.left = `calc(${left * 100}% + ${offset}px)`
  }

  create = (name, parent = document.querySelector('#inputs')) => {
    const keyframe = this.parameters.keyframe.value.key

    const parameter = this.parameters.sliders[name]

    const value = parameter.keyframes ? parameter.value[keyframe] : parameter.value

    // Set previous value
    parameter.prevValue = parameter.value

    const inputContainer = document.createElement('div')
    inputContainer.classList.add('input', name)

    const sliderContainer = document.createElement('div')
    sliderContainer.classList.add('input-slider')

    const sliderSpan = document.createElement('span')
    sliderSpan.classList.add('input-slider-bg')

    const sliderValue = document.createElement('div')
    sliderValue.classList.add('input-slider-value')
    const sliderValueSpan = document.createElement('span')
    sliderValueSpan.innerHTML = value
    sliderValue.appendChild(sliderValueSpan)

    const sliderInput = document.createElement('input')
    const attributes = {
      type: 'range',
      min: parameter.options.min,
      max: parameter.options.max,
      step: parameter.options.step,
      value,
      tabindex: '0',
      id: name,
      class: 'slider',
    }
    Utils.setAttributes(sliderInput, attributes)

    sliderInput.addEventListener('input', (event) => {
      const targetValue = parseFloat(event.target.value)
      this.update(parameter, targetValue)

      this.controls.updateLocalStorage()
      if (name === 'textSize') this.controls.trigger('parameter-update-slider-textSize')
      else if (name.includes('imageOffset')) this.controls.trigger('parameter-update-image-position')
      else this.controls.trigger('parameter-update-slider')
    })

    parameter.controller = sliderInput
    this.controls.controllers.push(sliderInput)

    const range = document.createElement('div')
    range.classList.add('range')
    const rangeMin = parameter.options.range[0] || parameter.options.min
    const rangeMax = parameter.options.range[1] || parameter.options.max

    range.innerHTML = `
      <div class="min">${rangeMin}</div>
      <label>${parameter.options.label}</label>
      <div class="max">${rangeMax}</div>
    `

    sliderContainer.appendChild(sliderSpan)
    sliderContainer.appendChild(sliderInput)
    sliderContainer.appendChild(sliderValue)

    const label = document.createElement('label')
    label.setAttribute('for', name)
    label.innerText = parameter.options.label || ''

    inputContainer.appendChild(sliderContainer)
    inputContainer.appendChild(range)

    // Append to body so can get non-zero offsetWidth
    document.body.appendChild(inputContainer)

    this.setValuePosition(parameter)

    // Move element to parent and apply mode class
    inputContainer.classList.add(...parameter.modes.map((mode) => `${mode}-mode`))
    parent.appendChild(inputContainer)
  }

  // eslint-disable-next-line class-methods-use-this
  setValuePosition = (parameter) => {
    // Note: offsetWidth will return zero if the element or any of it's anscestors are set to 'display: none'
    // solution - add all to dom then add to parent
    const sliderValue = parameter.controller.nextElementSibling
    sliderValue.style.display = 'block'
    const sliderValueSpan = sliderValue.querySelector('span')
    sliderValueSpan.style.display = 'inline-block'
    const { value } = parameter.controller
    const left = Utils.map(value, parameter.options.min, parameter.options.max, 0, 1)
    const offset = 10 * Utils.map(left, 0, 1, 1, -1) - sliderValueSpan.offsetWidth / 2
    sliderValue.removeAttribute('style')
    sliderValueSpan.removeAttribute('style')
    sliderValueSpan.style.left = `calc(${left * 100}% + ${offset}px)`
  }
}
