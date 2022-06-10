// For PI declaration:
#include <common>

uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;
uniform float uSize;

// uniform float cameraConstant;
// uniform float density;

attribute float aIndex;

// varying vec3 vColor;
varying vec3 vPosition;
varying float vIndex;

// float radiusFromMass( float mass ) {
//   // Calculate radius of a sphere from mass and density
//   return pow( ( 3.0 / ( 4.0 * PI ) ) * mass / density, 1.0 / 3.0 );
// }


void main() {


  vec4 posTemp = texture2D( texturePosition, uv );
  vec3 pos = posTemp.xyz;

  vec4 velTemp = texture2D( textureVelocity, uv );
  vec3 vel = velTemp.xyz;
  float mass = velTemp.w;

  // vColor = vec4( 1.0, mass / 250.0, 0.0, 1.0 );

  vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );

  // Calculate radius of a sphere from mass and density
  //float radius = pow( ( 3.0 / ( 4.0 * PI ) ) * mass / density, 1.0 / 3.0 );
  // float radius = radiusFromMass( mass );
  float radius = 1.;

  // float ms = mass;

  // Apparent size in pixels
  if ( mass == 0.0 ) {
    gl_PointSize = 0.0;
  }
  else {
    // gl_PointSize = radius * cameraConstant / ( - mvPosition.z );
    // gl_PointSize = mass*1. / -mvPosition.z;
    gl_PointSize = mass*1. * uSize;
  }

  gl_Position = projectionMatrix * mvPosition;

  vPosition = pos;
  // vColor = color;
  vIndex = aIndex;

}