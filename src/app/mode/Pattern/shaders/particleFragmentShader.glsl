#include <common>

// varying vec3 vColor;
varying float vIndex;

uniform vec3 sandColor;
// uniform vec3 bgColor;

varying vec3 vPosition;

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


float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

vec3 zuc(float w, float k) {
  float x = (w - 400.) / 300.;
  if (x < 0.) x = 0.;
  if (x > 1.) x = 1.;

  vec3 color = vec3(0.0, 0.0, 0.0);

  vec3 cs = vec3(3.54541723, 2.86670055, 2.29421995);
  vec3 xs = vec3(0.69548916, 0.49416934, 0.28269708);
  vec3 ys = vec3(0.02320775, 0.15936245, 0.53520021);
  
  vec3 z = vec3(x - xs[0], x - xs[1], x - xs[2]);

  vec3 z1 = vec3(0.0);
  for (int i = 0; i < 3; i++) {
    z1[i] = cs[i] * z[i];
    // z1[i] = cs[i + 1] * z[i + 1];
  }

  if (k == 0.) {
    z1[0] = cs[1] * z[0];
    z1[1] = cs[2] * z[1];
    z1[2] = cs[0] * z[2];
  }
  else {
    z1[0] = cs[1] * z[1];
    z1[1] = cs[2] * z[2];
    z1[2] = cs[0] * z[0];
  }



  vec3 z2 = vec3(0.0);
  for (int i = 0; i < 3; i++) {
    z2[i] = 1. - (z1[i] * z1[i + 0]);
  }


  // z2[0] = 1. - (z1[0] * z1[2]);
  // z2[1] = 1. - (z1[1] * z1[0]);
  // z2[2] = 1. - (z1[2] * z1[1]);

  for (int i = 0; i < 3; i++) {
    color[i] = z2[i] - ys[i];
    // color[i] = 1.0 - color[i];
    // color[i] = clamp(color[i], 0., 1.);
  }


  if (k == 0.) {
    color[0] = z2[0] - ys[1];
    color[1] = z2[1] - ys[2];
    color[2] = z2[2] - ys[0];
  }


  color.rgb += .1;
  
  return color;
}



void main() {

  // vec2 resolution = vec2(1080.,1080.);
  // vec2 uv = gl_FragCoord.xy / resolution.xy;
  // if ( vColor.y == 0.0 ) discard;

  float strength = distance(gl_PointCoord, vec2(0.5));
  strength = 1.0 - strength;
  strength = smoothstep(.7, .8, strength);
  // strength = pow(strength, 5.0);

  // float f = length( gl_PointCoord - vec2( 0.5, 0.5 ) );
  // if ( f > 0.5 ) {
  //   // discard;
  // }
  // gl_FragColor = vColor;
  

  // vec3 col = mix(bgColor, sandColor, strength);
  // col.rgb *= sandColor;


  float cf = map(length(vPosition), 1., 0., 0., .3);
  vec3 sc = sandColor;
  // vec3 sc = vColor;
  // sc.rgb += cf;
  sc.rgb += vPosition.z * 2.;
  sc.rgb += (rand(vec2(vIndex))-.5)*2.*.04;
  
  // col.xyz *= zuc(length(uv) * 400. + 200., 1.);
  // col.x = gl_PointCoord.x;
  // col.y = 0.;
  // col.z = 0.;
  gl_FragColor = vec4(sc, strength);

}