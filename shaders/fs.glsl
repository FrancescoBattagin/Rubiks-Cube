#version 300 es

precision mediump float;

in vec2 uvCoord;

//in vec3 fs_norm;
in vec3 fs_Position;
//uniform vec3 mDiffColor; //material diffuse color 
//uniform vec3 lightDirection; // directional light direction vec
//uniform vec3 lightColor; //directional light color 
uniform sampler2D sampler;
out vec4 outColor;

void main() {
  //vec3 norm = normalize(fs_norm);
  //vec3 nEyeDirection = normalize(eyePosition-fs_Position);
  //vec3 nLightDirection = normalize(lightDirection);
  //Here you should use either lightDirection or -lightDirection depending on
  //whether the direction has been inverted in webgl
  //In this case it has been inverted in webgl
  //vec3 lambertColor = mDiffColor * lightColor * clamp(dot(nLightDirection,norm), 0.0, 1.0);
  outColor = texture(sampler, uvCoord);
}