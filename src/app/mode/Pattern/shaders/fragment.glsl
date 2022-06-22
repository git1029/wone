uniform sampler2D tDiffuse;
uniform sampler2D uImage;

varying vec2 vUv;

float brightness(vec3 color) {
  return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
}

void main() {
  highp vec4 colorDiff = texture2D(tDiffuse, vUv);
  float b = brightness(colorDiff.rgb);
  b = 1.-pow(b, 2.);
  // b = 1.-smoothstep(0.1, 0.9, b);
  vec2 newUv = vUv + b * .1;

  highp vec4 color = texture2D(uImage, newUv);

  // color.rgb = vec3(b);
  // color.a = 1.;
  // color.r = 1.;

  gl_FragColor = color;
}