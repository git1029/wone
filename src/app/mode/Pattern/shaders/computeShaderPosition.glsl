#include <common>

uniform float uFrequencyA;
uniform float uFrequencyB;
uniform float uDistortion;
uniform vec2 uAspect;
uniform float uScale;
uniform float uTime;
uniform float uStartTime;

#define delta ( 1.0 / 60.0 )

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

// https://github.com/addiebarron/chladni
// https://github.com/luciopaiva/chladni
// http://paulbourke.net/geometry/chladni/
float chladni(float x, float y, float a, float b, vec3 pos) {
  float m_ = uFrequencyA;
  float n_ = uFrequencyB;
  m_ += snoise(pos.xy*2. + 123.4324) * uDistortion;
  n_ += snoise(pos.xy*2.) * uDistortion;
  float off = PI/2.*1.;
  vec2 L = vec2(1.,1.);
  return a * sin(PI*n_*x/L.x+off) * sin(PI*m_*y/L.y+off) + b * sin(PI*m_*x/L.x+off) * sin(PI*n_*y/L.y+off);
  // return a * cos(PI*n_*x/L.x+off) * cos(PI*m_*y/L.y+off) - b * cos(PI*m_*x/L.x+off) * cos(PI*n_*y/L.y+off);
}

float cubicInOut(float t) {
  return t < 0.5
    ? 4.0 * t * t * t
    : 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;
}

float cubicOut(float t) {
  float f = t - 1.0;
  return f * f * f + 1.0;
}

float cubicIn(float t) {
  return t * t * t;
}

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

vec2 rotate(vec2 p, float a) {
  return vec2(
    p.x * cos(a) - p.y * sin(a),
    p.x * sin(a) + p.y * cos(a)
  );
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec4 tmpPos = texture2D( texturePosition, uv );
  vec3 pos = tmpPos.xyz;

  vec3 vel = vec3(0.);

  float scl = uScale;
  if (uScale < 0.) scl = abs(uScale) + 1.;
  else if (uScale >= 0.) scl = 1./(abs(uScale) + 1.);
  vec3 pos2 = pos;
  float eq = chladni((pos2.x*scl), (pos2.y*scl), 1., 1., pos2);

  float amp = 0.5 * abs(eq);
  if (amp < 0.008) amp = 0.008;

  float tf = 1.;
  float easeDuration = 6.;
  if ((uTime - uStartTime) < easeDuration) {
    tf = map(uTime - uStartTime, 0., easeDuration, 1., 0.);
    tf = map(tf, 1., 0., 1., 0.);
  }
  else tf = 0.;
    
  // for (int i = 0; i < 4; i++) {
    vel.x = rand(uv + pos.y + 3.143284 + uTime) * amp * 2. - amp;
    vel.y = rand(uv + pos.x + 124.32347 + uTime) * amp * 2. - amp;
    vel.z = 0.;

    // Velocity end (slowed down)
    vec3 vel2 = vec3(0.);
    vel2.x = (snoise(uv + pos.y + 3.143284 + uTime * .5)*.5+.5) * amp * 2. - amp;
    vel2.y = (snoise(uv + pos.x + 124.32347 + uTime * .5)*.5+.5) * amp * 2. - amp;

    pos += (vel * delta * (4. - 4.*(1.-tf)) * tf) + (vel2 * delta * .025 * (1.-tf));

    if (pos.x < -.5 * uAspect.x) pos.x = -.5 * uAspect.x; 
    if (pos.x >= .5 * uAspect.x) pos.x = .5 * uAspect.x; 
    if (pos.y < (-.5) * uAspect.y) pos.y = (-.5) * uAspect.y; 
    if (pos.y >= (.5) * uAspect.y) pos.y = (.5) * uAspect.y; 
  // }

  pos.z = (abs(eq)) * .04;

  gl_FragColor = vec4(pos, abs(eq));

}