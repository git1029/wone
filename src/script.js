import './styles/style.scss'
import WebGL from 'three/examples/jsm/capabilities/WebGL'
import App from './app/App'

// Check for WebGL support before rendering
if (WebGL.isWebGLAvailable()) {
  const canvas = document.querySelector('canvas.webgl')
  // eslint-disable-next-line no-unused-vars
  const app = new App(canvas)
} else {
  const warning = WebGL.getWebGLErrorMessage()

  const generator = document.getElementById('generator')
  generator.style.display = 'none'

  const msgContainer = document.createElement('div')
  msgContainer.classList.add('nowebgl-container')

  const msg = document.createElement('div')
  msg.classList.add('nowebglmsg')
  msg.innerHTML = `
    <div class="msg"> 
      <p>Please enable WebGL to use this application.</p>
      <p class="info">${warning.innerHTML}</p>
    </div>
    <div class="divider"></div>
    <div class="image">
      <img src="images/wone.png" width="120" height="29">
    </div>
  `

  msgContainer.appendChild(msg)
  document.body.appendChild(msgContainer)
}
