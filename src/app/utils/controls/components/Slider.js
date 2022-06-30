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
      if (key !== 'textSize') {
        const slider = this.parameters.sliders[key]
        const value = typeof slider.options.default === 'object'
          ? { ...slider.options.default }
          : slider.options.default
        // if (key === 'frequencyA') console.log('resetting', key, 'to', value)
        this.update(slider, value, true)
      }
    })
    this.controls.updateLocalStorage()
    this.controls.trigger('parameter-update-slider')
  }

  randomize = () => {
    // const keyframe = this.parameters.keyframe.value.key

    // if (this.parameters.mode.value.name === 'Text') {
    //   if (this.app.mode && this.app.mode.activeMode.name === 'Text'
    //   && this.app.mode.mode && this.app.mode.mode.randomizeXOffset) {
    //     this.app.mode.mode.randomizeXOffset()
    //   }
    // } else {
    const { sliders } = this.parameters
    const keys = ['frequencyA', 'frequencyB', 'distortion', 'scale']
    keys.forEach((key) => {
      const slider = sliders[key]
      const { min, max } = slider.options
      const pres = Utils.precision(slider.options.step)
      const value = Math.round((Math.random() * (max - min) + min) * 10 ** pres) / 10 ** pres

      // if (slider.keyframes) slider.value[keyframe] = value
      // else slider.value = value
      // slider.controller.value = value

      // const sliderInput = slider.controller
      // const sliderValue = sliderInput.nextElementSibling
      // sliderValue.innerHTML = value
      // const left = Utils.map(value, min, max, 0, sliderInput.offsetWidth - sliderValue.offsetWidth)
      // sliderValue.style.left = `${left}px`

      this.update(slider, value, true)
    })

    if (this.app.mode && this.app.mode.activeMode.name === 'Text'
    && this.app.mode.mode && this.app.mode.mode.randomizeXOffset) {
      this.app.mode.mode.randomizeXOffset()
    }

    this.controls.trigger('parameter-update-slider-random')
    this.controls.updateLocalStorage()
  // }
  }

  // eslint-disable-next-line class-methods-use-this
  update = (parameter, value, updateInput = false) => {
    // console.log(value)
    const keyframe = this.parameters.keyframe.value.key

    parameter.prevValue = typeof parameter.value === 'object'
      ? { ...parameter.value }
      : parameter.value

    if (parameter.keyframes) {
      if (typeof value === 'object') parameter.value = value
      else parameter.value[keyframe] = value
    } else parameter.value = value

    const valueSlider = parameter.keyframes ? parameter.value[keyframe] : parameter.value
    // console.log(valueSlider)
      // if (slider.keyframes) slider.value[keyframe] = value
      // else slider.value = value
      // slider.controller.value = value

      // const sliderInput = slider.controller
      // const sliderValue = sliderInput.nextElementSibling
      // sliderValue.innerHTML = value
      // const left = Utils.map(value, min, max, 0, sliderInput.offsetWidth - sliderValue.offsetWidth)
      // sliderValue.style.left = `${left}px`

      // console.log(parameter.controller.value)
      // console.log
      // console.log(keyframe)
    if (updateInput) parameter.controller.value = valueSlider

    const sliderValue = parameter.controller.nextElementSibling
    const sliderValueSpan = sliderValue.querySelector('span')
    sliderValueSpan.innerHTML = valueSlider

    // sliderValue.style.left = `${this.map(slider.value, slider.options.min, slider.options.max, 0, 100)}%`
    // const leftMax = sliderInput.offsetWidth - sliderValue.offsetWidth
    // const leftMax = document.querySelector('#input-sliders').offsetWidth - sliderValueSpan.offsetWidth
    // const left = Utils.map(valueSlider, parameter.options.min, parameter.options.max, 0, leftMax)
    // sliderValueSpan.style.left = `${left}px`
    const left = Utils.map(valueSlider, parameter.options.min, parameter.options.max, 0, 1)
    const offset = 10 * Utils.map(left, 0, 1, 1, -1) - sliderValueSpan.offsetWidth / 2
    sliderValueSpan.style.left = `calc(${left * 100}% + ${offset}px)`

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

    // console.log(parameter)
  }

  create = (name, parent = document.querySelector('#inputs')) => {
    const keyframe = this.parameters.keyframe.value.key

    const parameter = this.parameters.sliders[name]
    // parent.classList.add(...parameter.modes.map((mode) => `${mode}-mode`))

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
      else this.controls.trigger('parameter-update-slider')
    })

    parameter.controller = sliderInput
    this.controls.controllers.push(sliderInput)

    const range = document.createElement('div')
    range.classList.add('range')
    const rangeMin = parameter.options.range[0] || parameter.options.min
    const rangeMax = parameter.options.range[1] || parameter.options.max
    // range.innerHTML = `<div>${rangeMin}</div><div>${rangeMax}</div>`
    // const rangeLabel = document.createElement('label')
    // rangeLabel.innerHTML = parameter.options.label
    // rangeLabel.appendChild(sliderValue)
    range.innerHTML = `
      <div class="min">${rangeMin}</div>
      <label>${parameter.options.label}</label>
      <div class="max">${rangeMax}</div>
    `
    // range.innerHTML = `<div class="min">${rangeMin}</div>`
    // range.appendChild(rangeLabel)
    // range.innerHTML += `<div class="max">${rangeMax}</div>`

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

    // Append to body so can get non-zero offsetWidth
    // console.log(inputContainer)
    document.body.appendChild(inputContainer)

    this.setValuePosition(parameter)

    // Move element to parent and apply mode class
    inputContainer.classList.add(...parameter.modes.map((mode) => `${mode}-mode`))
    parent.appendChild(inputContainer)

    // const leftMax = sliderInput.offsetWidth - sliderValue.offsetWidth
    // const leftMax = document.querySelector('#input-sliders').offsetWidth - sliderValueSpan.offsetWidth
    // const left = Utils.map(value, parameter.options.min, parameter.options.max, 0, leftMax)
    // sliderValueSpan.style.left = `${left}px`
    // console.log(sliderValueSpan.getBoundingClientRect())
    // const node = document.createTextNode(`${value}`)
    // const left = Utils.map(value, parameter.options.min, parameter.options.max, 0, 1)
    // const offset = 10 * Utils.map(left, 0, 1, 1, -1) - sliderValueSpan.offsetWidth / 2
    // sliderValueSpan.style.left = `calc(${left * 100}% + ${offset}px)`
  }

  // eslint-disable-next-line class-methods-use-this
  setValuePosition = (parameter) => {
    // Note: offsetWidth will return zero if the element or any of it's anscestors are set to 'display: none'
    // solution - add all to dom then add to parent

    // console.log(parameter.options.label)
    // const sliderContainer = parameter.controller.parentNode.parentNode
    // sliderContainer.style.display = 'block'
    // console.log(sliderContainer)
    const sliderValue = parameter.controller.nextElementSibling
    sliderValue.style.display = 'block'
    const sliderValueSpan = sliderValue.querySelector('span')
    sliderValueSpan.style.display = 'inline-block'
    const { value } = parameter.controller
    // console.log(sliderValueSpan.offsetWidth)
    const left = Utils.map(value, parameter.options.min, parameter.options.max, 0, 1)
    const offset = 10 * Utils.map(left, 0, 1, 1, -1) - sliderValueSpan.offsetWidth / 2
    // sliderContainer.removeAttribute('style')
    sliderValue.removeAttribute('style')
    sliderValueSpan.removeAttribute('style')
    sliderValueSpan.style.left = `calc(${left * 100}% + ${offset}px)`
  }
}
