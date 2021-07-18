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
  outColor=texture(sampler, uvCoord);
}