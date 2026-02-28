export const VERTEX_SHADER_SRC = `
attribute vec3 aPosition;
uniform mat4 uProjection;
uniform mat4 uModelView;

void main() {
    gl_Position = uProjection * uModelView * vec4(aPosition, 1.0);
}
`;

export const FRAGMENT_SHADER_SRC = `
precision mediump float;
uniform vec3 uColor;
uniform float uAlpha;
uniform float uGlow;

void main() {
    vec3 bright = mix(uColor, vec3(1.0), 0.3);
    vec3 finalColor = mix(uColor, bright, uGlow);
    gl_FragColor = vec4(finalColor, uAlpha);
}
`;
