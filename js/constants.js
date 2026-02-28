// SynthWave Neon Dark Theme Palette
export const COLORS = {
    background: [0.04, 0.0, 0.08],       // #0a0014 deep dark purple
    neonPink: [1.0, 0.08, 0.58],          // #ff1493
    neonCyan: [0.0, 1.0, 0.94],           // #00fff0
    neonYellow: [1.0, 1.0, 0.0],          // #ffff00
    neonOrange: [1.0, 0.5, 0.0],          // #ff8000
    neonPurple: [0.7, 0.0, 1.0],          // #b300ff
    neonGreen: [0.2, 1.0, 0.4],           // #33ff66
    white: [1.0, 1.0, 1.0],
    gridLine: [0.15, 0.05, 0.25],         // subtle purple grid
};

// CSS color strings for UI overlay
export const CSS_COLORS = {
    neonPink: '#ff1493',
    neonCyan: '#00fff0',
    neonYellow: '#ffff00',
    neonOrange: '#ff8000',
    neonPurple: '#b300ff',
    neonGreen: '#33ff66',
    white: '#ffffff',
    dimWhite: 'rgba(255,255,255,0.3)',
    background: '#0a0014',
};

// Game dimensions (world-space units)
export const WORLD = {
    width: 16,          // total playfield width
    height: 9,          // total playfield height (16:9)
    depth: 1.5,         // z-depth for 3D effect
};

// Paddle config
export const PADDLE = {
    width: 0.3,
    height: 1.8,
    depth: 0.4,
    offsetX: 0.6,       // distance from edge
    speed: 8.0,         // units per second (keyboard player)
};

// Ball config
export const BALL = {
    size: 0.3,           // cube side length
    initialSpeed: 6.0,
    maxSpeed: 12.0,
    speedIncrement: 0.3, // speed up on each paddle hit
};

// Obstacle config
export const OBSTACLE = {
    minSize: 0.4,
    maxSize: 0.8,
    spawnInterval: 4.0,  // seconds between spawns
    maxCount: 4,
};

// Scoring
export const SCORE = {
    winningScore: 5,
};

// Camera
export const CAMERA = {
    fov: 45,              // degrees
    near: 0.1,
    far: 100,
    position: [0, 0, 14], // pulled back on Z
};

// Player identifiers
export const PLAYER1 = 0; // left, keyboard W/S
export const PLAYER2 = 1; // right, mouse
