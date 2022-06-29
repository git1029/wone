// For PI declaration:
#include <common>

uniform sampler2D texturePosition;
// uniform sampler2D textureVelocity;
uniform float uSize;

// uniform float cameraConstant;
// uniform float density;

attribute float aIndex;
attribute float aMass;

// varying vec3 vColor;
varying vec3 vPosition;
varying float vIndex;
// varying float vEq;

// float radiusFromMass( float mass ) {
//   // Calculate radius of a sphere from mass and density
//   return pow( ( 3.0 / ( 4.0 * PI ) ) * mass / density, 1.0 / 3.0 );
// }


void main() {


  vec4 posTemp = texture2D( texturePosition, uv );
  vec3 pos = posTemp.xyz;
  float eq = posTemp.w;

  // vec4 velTemp = texture2D( textureVelocity, uv );
  // vec3 vel = velTemp.xyz;
  // float mass = velTemp.w;

  // vColor = vec4( 1.0, mass / 250.0, 0.0, 1.0 );

  vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );

  // Calculate radius of a sphere from mass and density
  //float radius = pow( ( 3.0 / ( 4.0 * PI ) ) * mass / density, 1.0 / 3.0 );
  // float radius = radiusFromMass( mass );
  // float radius = 1.;

  // float ms = mass;

  // // Apparent size in pixels
  // if ( mass == 0.0 ) {
  //   gl_PointSize = 0.0;
  // }
  // else {
  //   // gl_PointSize = radius * cameraConstant / ( - mvPosition.z );
  //   // gl_PointSize = mass*1. / -mvPosition.z;
  //   gl_PointSize = mass*1. * uSize;
  // }

  float scl = 1.-(eq);
  scl = (1.-clamp(eq, 0., 1.))*.5 + .5;
  // scl = 1.-clamp(abs(eq), 0., 1.);
  // scl = .0 + 1.*(1.-clamp(abs(eq), 0., 1.));
  // scl = 1.;
  gl_PointSize = aMass * uSize * scl;

  gl_Position = projectionMatrix * mvPosition;

  vPosition = pos;
  // vColor = color;
  vIndex = aIndex;
  // vEq = eq;

}