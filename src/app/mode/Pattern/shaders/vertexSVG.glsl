varying vec2 vUv;

void main() {
  gl_PointSize = .1;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); 
}