#include <common>

uniform sampler2D texturePosition;
uniform float uSize;

attribute float aIndex;
attribute float aMass;

varying vec3 vPosition;
varying float vIndex;

void main() {
  vec4 posTemp = texture2D( texturePosition, uv );
  vec3 pos = posTemp.xyz;
  float eq = posTemp.w;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  float scl = 1.-(eq);
  scl = (1.-clamp(eq, 0., 1.))*.5 + .5;
  
  gl_PointSize = aMass * uSize * scl;

  gl_Position = projectionMatrix * mvPosition;

  vPosition = pos;
  vIndex = aIndex;
}