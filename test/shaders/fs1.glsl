#version 300 es

precision mediump float;

//in vec3 fs_norm;
in vec2 uvCoord;
uniform sampler2D sampler;
//uniform vec3 mDiffColor; //material diffuse color 
//uniform vec3 lightDirection; // directional light direction vec
//uniform vec3 lightColor; //directional light color 
out vec4 outColor;

void main() {
  //vec3 norm = normalize(fs_norm);
  //vec3 nLightDirection = normalize(lightDirection);
  //Here you should use either lightDirection or -lightDirection depending on
  //whether the direction has been inverted in webgl
  //In this case it has been inverted in webgl
  //vec3 lambertColor = mDiffColor * lightColor * clamp(dot(nLightDirection,norm), 0.0, 1.0);
  outColor = texture(sampler, uvCoord);
}