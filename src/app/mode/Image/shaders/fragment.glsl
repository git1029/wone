#include <common>

uniform sampler2D uImage;

uniform float uFrequencyA;
uniform float uFrequencyB;
uniform float uDistortion;
uniform float uDisplacement;
uniform float uGrain;
uniform float uScale;
uniform vec2 uAspect;
uniform vec4 uTexAspect;
uniform vec4 uResolution;
uniform float uTime;
uniform vec2 uImgOffset;
uniform bool uImgFitWidth;
uniform bool uImgFitHeight;
uniform bool uImgScaleCustom;
uniform float uImgScale;

varying vec2 vUv;

//
// Description : Array and textureless GLSL 2D simplex noise function.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
// 

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+10.0)*x);
}

float snoise(vec2 v)
  {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
		+ i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// Compute final noise value at P
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float brightness(vec3 color) {
  return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
}

float chladni(float x, float y, float a, float b, vec2 pos) {
  float m_ = uFrequencyA;
  float n_ = uFrequencyB;
  vec2 pos_ = pos;
  pos_.x *= uAspect.x; 
  pos_.y *= uAspect.y; 
  n_ += snoise(pos_*2.) * uDistortion;
  m_ += snoise(pos_*2. + 123.4324) * uDistortion;
  float off = PI/2.*1.;
  vec2 L = vec2(1.,1.);
  return a * sin(PI*n_*x/L.x+off) * sin(PI*m_*y/L.y+off) + b * sin(PI*m_*x/L.x+off) * sin(PI*n_*y/L.y+off);
  // return a * cos(PI*n_*x/L+off) * cos(PI*m_*y/L+off) - b * cos(PI*m_*x/L+off) * cos(PI*n_*y/L+off);
}

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main() {
  vec2 uv = gl_FragCoord.xy/uResolution.xy;
  vec2 newUv = vUv - vec2(.5);

  float scl = uScale;
  if (uScale < 0.) scl = abs(uScale) + 1.;
  else if (uScale >= 0.) scl = 1./(abs(uScale) + 1.);
  newUv *= scl;

  vec4 color = vec4(1.);

  float eq = chladni(newUv.x * uAspect.x, newUv.y * uAspect.y, 1., 1., newUv/scl);

  float amp = 1. * abs(eq);
  amp = clamp(amp, 0., 1.);
  if (amp < 0.08) amp = 0.08;
  if (amp >= .08 && amp < .5) amp = map(amp, .08, .5, .08, 1.);
  else if (amp >= .5) amp = 1.;

  color.rgb = vec3(1.-pow(amp,.5));

  vec2 disp = vec2(1.-pow(amp, .1)) * .2;
  disp *= uDisplacement;

  vec2 imgUv = vUv;

  vec2 uvF = vec2(
    uTexAspect.x / uResolution.x,
    uTexAspect.y / uResolution.y
  );

  float imgScale = clamp(uImgScale, 50., 200.);
  imgScale = 1. / (imgScale / 100.);
  
  // Reset texture aspect
  imgUv /= uvF;

  float offSide = uImgFitWidth ? uResolution.x / uTexAspect.x : uResolution.y / uTexAspect.y;
  // offSide /= imgScale;

  vec2 uvOff = vec2(
    (uResolution.x - uTexAspect.x * offSide),
    (uResolution.y - uTexAspect.y * offSide)
  );

  uvOff *= .5;
  uvOff /= uTexAspect.xy;

  imgUv -= uvOff;
  imgUv *= uImgFitWidth ? uTexAspect.x / uResolution.x : uTexAspect.y / uResolution.y;
  imgUv += uImgOffset;

  if (imgUv.x < 0. || imgUv.x >= 1. || imgUv.y < 0. || imgUv.y >= 1.) discard; 

  vec2 dispUv = disp;
  float r = rand(vUv + uTime*.1);
  r *= length(disp);
  r *= (smoothstep(-.2, 1., abs(eq) * (1.-pow(abs(eq),.2))) * 5.);
  dispUv += r * uGrain; 

  float n = snoise(vUv*2.);

  color.rgb = vec3(length(dispUv)*8.);

  if (rand(uv + eq + uTime*.1) < 0.05) {
    dispUv += (1.-length(dispUv)) * rand(uv + eq + uTime*.1) * (1.-abs(eq)) * uGrain; 
  }

  color = texture2D(uImage, imgUv + dispUv);

  gl_FragColor = color;
}