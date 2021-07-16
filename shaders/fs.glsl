#version 300 es

precision mediump float;

in vec2 uvCoord;

in vec3 fs_norm;
in vec3 fs_Position;
uniform vec3 lightDirection; // directional light direction vec
uniform vec3 lightColor; //directional light color 
uniform sampler2D sampler;
out vec4 outColor;

void main() {
  vec3 norm = normalize(fs_norm);
  //vec3 nEyeDirection = normalize(eyePosition-fs_Position);
  vec3 nLightDirection = -normalize(lightDirection);
  vec3 mDiffColor=texture(sampler, uvCoord).xyz;
  vec3 lambertColor = mDiffColor * lightColor * dot(nLightDirection,norm);
  
  outColor = vec4(clamp(lambertColor, 0.0, 1.0),1.0);;
}