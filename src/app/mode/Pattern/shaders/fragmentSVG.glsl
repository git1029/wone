void main() {
  float strength = distance(gl_PointCoord, vec2(0.5));
  strength = 1.0 - strength;
  strength = smoothstep(.7, .8, strength);
  gl_FragColor = vec4(vec3(1.,0.,0.), strength);
}