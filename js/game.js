// Game logic — state machine, physics, collisions, scoring, obstacles

import { WORLD, BALL, PADDLE, OBSTACLE, SCORE, COLORS, PLAYER1, PLAYER2 } from './constants.js';

export function createGameState(callbacks) {
    return {
        phase: 'waiting',
        ball: { x: 0, y: 0, vx: 0, vy: 0, size: BALL.size },
        paddles: [
            // PLAYER1 — left side
            {
                x: -WORLD.width / 2 + PADDLE.offsetX,
                y: 0,
                width: PADDLE.width,
                height: PADDLE.height,
            },
            // PLAYER2 — right side
            {
                x: WORLD.width / 2 - PADDLE.offsetX,
                y: 0,
                width: PADDLE.width,
                height: PADDLE.height,
            },
        ],
        obstacles: [],
        scores: [0, 0],
        winner: null,
        obstacleTimer: 0,
        callbacks: callbacks || {},
        _relaunchTimer: 0,
        _relaunchPending: false,
    };
}

export function startGame(state) {
    state.phase = 'playing';
    launchBall(state);
    if (state.callbacks.onGameStart) state.callbacks.onGameStart();
}

export function resetGame(state) {
    state.scores = [0, 0];
    state.obstacles = [];
    state.ball.x = 0;
    state.ball.y = 0;
    state.ball.vx = 0;
    state.ball.vy = 0;
    state.phase = 'waiting';
    state.winner = null;
    state.obstacleTimer = 0;
    state._relaunchTimer = 0;
    state._relaunchPending = false;
    state.paddles[0].y = 0;
    state.paddles[1].y = 0;
}

export function updateGame(state, input, dt) {
    if (state.phase !== 'playing') return;

    // --- Relaunch delay after scoring ---
    if (state._relaunchPending) {
        state._relaunchTimer -= dt;
        if (state._relaunchTimer <= 0) {
            state._relaunchPending = false;
            launchBall(state);
        }
        // Still update paddles during relaunch wait
        updatePaddles(state, input, dt);
        return;
    }

    // --- Paddles ---
    updatePaddles(state, input, dt);

    // --- Ball movement ---
    state.ball.x += state.ball.vx * dt;
    state.ball.y += state.ball.vy * dt;

    const halfW = WORLD.width / 2;
    const halfH = WORLD.height / 2;
    const halfBall = state.ball.size / 2;

    // --- Wall bounce (top/bottom) ---
    if (state.ball.y + halfBall > halfH) {
        state.ball.y = halfH - halfBall;
        state.ball.vy = -Math.abs(state.ball.vy);
        if (state.callbacks.onWallBounce) state.callbacks.onWallBounce();
    } else if (state.ball.y - halfBall < -halfH) {
        state.ball.y = -halfH + halfBall;
        state.ball.vy = Math.abs(state.ball.vy);
        if (state.callbacks.onWallBounce) state.callbacks.onWallBounce();
    }

    // --- Paddle collisions ---
    for (let i = 0; i < 2; i++) {
        const paddle = state.paddles[i];
        if (aabb(state.ball, paddle)) {
            // Reflect vx
            if (i === PLAYER1) {
                state.ball.vx = Math.abs(state.ball.vx);
                state.ball.x = paddle.x + paddle.width / 2 + halfBall;
            } else {
                state.ball.vx = -Math.abs(state.ball.vx);
                state.ball.x = paddle.x - paddle.width / 2 - halfBall;
            }

            // Adjust vy based on where ball hit paddle (offset from center)
            const offset = (state.ball.y - paddle.y) / (paddle.height / 2);
            state.ball.vy += offset * 2.0;

            // Speed up
            const speed = Math.sqrt(state.ball.vx * state.ball.vx + state.ball.vy * state.ball.vy);
            const newSpeed = Math.min(speed + BALL.speedIncrement, BALL.maxSpeed);
            const scale = newSpeed / speed;
            state.ball.vx *= scale;
            state.ball.vy *= scale;

            if (state.callbacks.onPaddleHit) state.callbacks.onPaddleHit(i);
        }
    }

    // --- Scoring ---
    if (state.ball.x - halfBall < -halfW) {
        // Ball passed left edge — Player 2 scores
        state.scores[PLAYER2]++;
        if (state.callbacks.onScore) state.callbacks.onScore(PLAYER2, state.scores);
        if (state.scores[PLAYER2] >= SCORE.winningScore) {
            state.phase = 'gameover';
            state.winner = PLAYER2;
            if (state.callbacks.onGameOver) state.callbacks.onGameOver(PLAYER2);
            return;
        }
        scheduleRelaunch(state);
    } else if (state.ball.x + halfBall > halfW) {
        // Ball passed right edge — Player 1 scores
        state.scores[PLAYER1]++;
        if (state.callbacks.onScore) state.callbacks.onScore(PLAYER1, state.scores);
        if (state.scores[PLAYER1] >= SCORE.winningScore) {
            state.phase = 'gameover';
            state.winner = PLAYER1;
            if (state.callbacks.onGameOver) state.callbacks.onGameOver(PLAYER1);
            return;
        }
        scheduleRelaunch(state);
    }

    // --- Obstacle spawning ---
    state.obstacleTimer += dt;
    if (state.obstacleTimer >= OBSTACLE.spawnInterval && state.obstacles.length < OBSTACLE.maxCount) {
        state.obstacleTimer = 0;
        spawnObstacle(state);
    }

    // --- Ball-obstacle collision ---
    for (let i = state.obstacles.length - 1; i >= 0; i--) {
        const obs = state.obstacles[i];
        if (aabbSquare(state.ball, obs)) {
            // Reflect ball based on which axis has less overlap (shallower penetration)
            const halfBall = state.ball.size / 2;
            const halfObs = obs.size / 2;
            const overlapX = (halfBall + halfObs) - Math.abs(state.ball.x - obs.x);
            const overlapY = (halfBall + halfObs) - Math.abs(state.ball.y - obs.y);

            if (overlapX < overlapY) {
                state.ball.vx = -state.ball.vx;
                state.ball.x += (state.ball.x < obs.x ? -overlapX : overlapX);
            } else {
                state.ball.vy = -state.ball.vy;
                state.ball.y += (state.ball.y < obs.y ? -overlapY : overlapY);
            }

            if (state.callbacks.onBoxHit) state.callbacks.onBoxHit(obs);
            state.obstacles.splice(i, 1);
        }
    }
}

// --- Helpers ---

function updatePaddles(state, input, dt) {
    const halfH = WORLD.height / 2;
    const p1 = state.paddles[PLAYER1];
    const p2 = state.paddles[PLAYER2];

    // Player 1 — keyboard
    p1.y += input.p1Direction * PADDLE.speed * dt;
    p1.y = clamp(p1.y, -halfH + p1.height / 2, halfH - p1.height / 2);

    // Player 2 — arrow keys or mouse (0=top, 1=bottom mapped to world Y)
    if (input.p2UseMouse) {
        const targetY = halfH - input.p2MouseY * WORLD.height;
        const lerpFactor = 1 - Math.pow(0.001, dt);
        p2.y += (targetY - p2.y) * lerpFactor;
    } else {
        p2.y += input.p2Direction * PADDLE.speed * dt;
    }
    p2.y = clamp(p2.y, -halfH + p2.height / 2, halfH - p2.height / 2);
}

function launchBall(state) {
    state.ball.x = 0;
    state.ball.y = 0;
    // Random angle, mostly horizontal (between -30 and +30 degrees)
    const angle = (Math.random() - 0.5) * (Math.PI / 3);
    const direction = Math.random() < 0.5 ? 1 : -1;
    state.ball.vx = Math.cos(angle) * BALL.initialSpeed * direction;
    state.ball.vy = Math.sin(angle) * BALL.initialSpeed;
}

function scheduleRelaunch(state) {
    state.ball.x = 0;
    state.ball.y = 0;
    state.ball.vx = 0;
    state.ball.vy = 0;
    state._relaunchPending = true;
    state._relaunchTimer = 1.0; // 1 second delay
}

function aabb(ball, paddle) {
    const halfBall = ball.size / 2;
    const halfPW = paddle.width / 2;
    const halfPH = paddle.height / 2;
    return (
        ball.x - halfBall < paddle.x + halfPW &&
        ball.x + halfBall > paddle.x - halfPW &&
        ball.y - halfBall < paddle.y + halfPH &&
        ball.y + halfBall > paddle.y - halfPH
    );
}

function aabbSquare(ball, obstacle) {
    const halfBall = ball.size / 2;
    const halfObs = obstacle.size / 2;
    return (
        ball.x - halfBall < obstacle.x + halfObs &&
        ball.x + halfBall > obstacle.x - halfObs &&
        ball.y - halfBall < obstacle.y + halfObs &&
        ball.y + halfBall > obstacle.y - halfObs
    );
}

function spawnObstacle(state) {
    // Spawn in middle 60% of the field
    const xRange = WORLD.width * 0.3;
    const yRange = WORLD.height * 0.3;
    const x = (Math.random() - 0.5) * 2 * xRange;
    const y = (Math.random() - 0.5) * 2 * yRange;
    const size = OBSTACLE.minSize + Math.random() * (OBSTACLE.maxSize - OBSTACLE.minSize);
    const neonColors = [COLORS.neonOrange, COLORS.neonPurple, COLORS.neonGreen];
    const color = neonColors[Math.floor(Math.random() * neonColors.length)];
    state.obstacles.push({ x, y, size, color });
}

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}
