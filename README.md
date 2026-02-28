# SynthWave Pong

A two-player Pong game with a SynthWave Neon Dark aesthetic, built entirely with vanilla JavaScript, WebGL, and the Web Audio API. No dependencies, no build step — just open and play.

![Theme: neon pink, cyan, yellow, and purple on a dark purple background]

## Gameplay

Two players compete on a neon-lit playing field. A glowing wireframe ball bounces between translucent 3D paddles. Obstacle boxes spawn periodically in the middle of the field — when the ball hits one, it explodes into a shower of neon particle shards and the ball bounces off. First player to **5 points** wins.

### Controls

| Player | Input | Action |
|--------|-------|--------|
| **Player 1** (left, pink) | `W` | Move paddle up |
| | `S` | Move paddle down |
| **Player 2** (right, cyan) | Mouse movement | Track paddle to cursor |
| | `↑` Arrow Up | Move paddle up |
| | `↓` Arrow Down | Move paddle down |
| **General** | `Space` / `Enter` / Click | Start game |
| | `Y` / Click | Restart after game over |

Player 2 can switch freely between mouse and keyboard — moving the mouse activates mouse tracking, pressing arrow keys switches to keyboard control.

### Rules

- The ball launches from the center in a random direction after each point
- Ball speed increases with every paddle hit, up to a maximum
- If the ball passes a player's edge, the opponent scores
- Obstacle boxes spawn every few seconds (up to 4 on screen) at random positions
- Hitting an obstacle destroys it with an explosion and bounces the ball
- First to 5 points wins — a game over screen appears with the option to replay

## Visual Features

- **3D wireframe paddles** with translucent neon faces (pink for P1, cyan for P2)
- **Rolling wireframe ball** that rotates based on its velocity, with translucent yellow shading
- **Obstacle boxes** in neon orange, purple, and green with wireframe edges
- **Particle explosions** — destroyed obstacles burst into 15-25 neon shards with gravity and fade-out
- **Dashed center divider** line in neon purple
- **Boundary lines** showing the playing field edges
- **Additive blending** for authentic neon glow
- **Perspective 3D camera** giving depth to the flat playing field
- **High-DPI rendering** — canvas scales to device pixel ratio for sharp visuals on Retina displays

## Audio

All sounds are synthesized in real-time using the Web Audio API — no audio files:

| Event | Sound |
|-------|-------|
| Paddle hit | Square-wave blip with pitch bend (different pitch per player) |
| Wall bounce | Short filtered noise burst |
| Score | Ascending sawtooth arpeggio (C5 → E5 → G5) |
| Obstacle explode | Low frequency sweep + noise burst |
| Game start | Dual sawtooth rising sweep |
| Game over | Descending square-wave sequence with delay reverb |

## Getting Started

No install or build required. Serve the files with any static HTTP server:

```bash
cd ping-pong
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080) in a modern browser (Chrome, Firefox, Safari, Edge).

### Requirements

- A browser with WebGL2 (or WebGL1 fallback) support
- A browser with Web Audio API support
- All modern browsers meet both requirements

## Project Structure

```
ping-pong/
├── index.html              Entry point — dual canvas setup
├── css/
│   └── style.css           Fullscreen dark canvas styling
└── js/
    ├── main.js             Game loop orchestration, event wiring
    ├── constants.js        SynthWave palette, dimensions, speeds, config
    ├── input.js            Keyboard (W/S, ↑/↓) and mouse input
    ├── game.js             State machine, physics, collisions, scoring, obstacles
    ├── renderer.js         WebGL setup, 3D mesh rendering, camera, sphere/cube drawing
    ├── shaders.js          GLSL vertex/fragment shaders with neon glow
    ├── particles.js        Particle shard system for explosions
    ├── audio.js            Web Audio API synthesized sound effects
    └── ui.js               2D canvas overlay — start screen, scoreboard, game over
```

### Architecture

The game uses ES modules with no bundler. `main.js` orchestrates the game loop and wires modules together:

- **`game.js`** owns all game state and physics. It emits events via callbacks (`onPaddleHit`, `onScore`, `onBoxHit`, etc.) that other modules respond to.
- **`renderer.js`** draws the 3D scene each frame using WebGL — paddles and obstacles as wireframe cubes, the ball as a wireframe sphere, with translucent colored faces and additive blending.
- **`audio.js`** plays synthesized sounds in response to game events.
- **`particles.js`** manages explosion shard lifecycles.
- **`ui.js`** draws the 2D HUD overlay (scores, start/end screens) on a separate canvas.
- **`constants.js`** is the shared configuration read by all modules — colors, dimensions, speeds, and tuning values.

## Configuration

Game parameters can be tuned in `js/constants.js`:

| Constant | Default | Description |
|----------|---------|-------------|
| `BALL.initialSpeed` | 6.0 | Starting ball speed |
| `BALL.maxSpeed` | 12.0 | Maximum ball speed after acceleration |
| `BALL.speedIncrement` | 0.3 | Speed increase per paddle hit |
| `PADDLE.speed` | 8.0 | Keyboard paddle movement speed |
| `PADDLE.height` | 1.8 | Paddle height |
| `OBSTACLE.spawnInterval` | 4.0s | Time between obstacle spawns |
| `OBSTACLE.maxCount` | 4 | Maximum simultaneous obstacles |
| `SCORE.winningScore` | 5 | Points needed to win |

## License

MIT
