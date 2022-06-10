uniform sampler2D tDiffuse;
uniform sampler2D uImage;

varying vec2 vUv;

float brightness(vec3 color) {
  return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
}

void main() {
  highp vec4 colorDiff = texture2D(tDiffuse, vUv);
  float b = brightness(colorDiff.rgb);
  b = pow(b, 1.);
  vec2 newUv = vUv + b * .1;

  highp vec4 color = texture2D(uImage, newUv);

  // color.r = 1.;

  gl_FragColor = color;
}