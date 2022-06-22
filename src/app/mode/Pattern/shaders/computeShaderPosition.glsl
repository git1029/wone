#include <common>

uniform float m;
uniform float n;
uniform float uDistortion;
uniform vec2 uAspect;
uniform float uScale;
uniform float uTime;
uniform float uStartTime;
// uniform float uScaleMax;

#define delta ( 1.0 / 60.0 )


// float rand(vec2 co){
//     return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
// }


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


float chladni(float x, float y, float a, float b, vec3 pos) {
  float n_ = n;
  float m_ = m;
  n_ += snoise(pos.xy*2.) * uDistortion;
  m_ += snoise(pos.xy*2. + 123.4324) * uDistortion;
  float off = PI/2.*1.;
  vec2 L = vec2(1.,1.);
  return a * sin(PI*n_*x/L.x+off) * sin(PI*m_*y/L.y+off) + b * sin(PI*m_*x/L.x+off) * sin(PI*n_*y/L.y+off);
  // return a * cos(PI*n_*x/L.x+off) * cos(PI*m_*y/L.y+off) - b * cos(PI*m_*x/L.x+off) * cos(PI*n_*y/L.y+off);
}

void main() {

// vec2 resolution = vec2(1080., 1080.)
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  // uv *= .5;

  vec4 tmpPos = texture2D( texturePosition, uv );
  vec3 pos = tmpPos.xyz;

  // vec4 tmpVel = texture2D( textureVelocity, uv );
  // vec3 vel = tmpVel.xyz;
  // float mass = tmpVel.w;

  // if ( mass == 0.0 ) {
  //   vel = vec3( 0.0 );
  // }

  vec3 vel = vec3(0.);
  // float mass = 0.;


    // // perform one random walk
    // this.x += random(-this.stochasticAmplitude, this.stochasticAmplitude);
    // this.y += random(-this.stochasticAmplitude, this.stochasticAmplitude);

  // Dynamics
  // distance = velocity * time
  // pos += vel * delta;

  float scl = uScale;
  if (uScale < 0.) scl = abs(uScale) + 1.;
  else if (uScale >= 0.) scl = 1./(abs(uScale) + 1.);
  float eq = chladni((pos.x*scl), (pos.y*scl), 1., 1., pos);

  float v = 0. + length(uv) * 0.5;
  float amp = 0.5 * abs(eq);
  // if (amp < 0.002) amp = 0.002;
  if (amp < 0.008) amp = 0.008;
  // if (amp < 0.04) amp = 0.04;




  float tf = 1.;
  if ((uTime - uStartTime) < 1.) tf = 1.;
  else if ((uTime - uStartTime) < 2.) tf = 1.-((uTime - uStartTime)-1.);
  else tf = 0.;
  
  vel.x = rand(uv + pos.y + 3.143284) * amp * 2. - amp;
  vel.y = rand(uv + pos.x + 124.32347) * amp * 2. - amp;
  // vel.z = rand(uv + pos.x + 124.32347) * amp * 2. - amp;
  // vel.x = amp;
  // vel.y = amp;
  vel.z = 0.;

  pos += vel * delta * 4. * 1.;

  

  if (pos.x < -.5 * uAspect.x) pos.x = -.5 * uAspect.x; 
  if (pos.x >= .5 * uAspect.x) pos.x = .5 * uAspect.x; 
  if (pos.y < (-.5) * uAspect.y) pos.y = (-.5) * uAspect.y; 
  if (pos.y >= (.5) * uAspect.y) pos.y = (.5) * uAspect.y; 
  pos.z = (abs(eq)) * .04;

  gl_FragColor = vec4( pos, 1.0 );

}