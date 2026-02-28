// Main entry — bootstraps game loop and wires modules together
// Filled in during integration phase after all modules are built

import { WORLD, BALL, PADDLE, SCORE, PLAYER1, PLAYER2 } from './constants.js';
import { initInput, getInput } from './input.js';
import { createGameState, updateGame, resetGame, startGame } from './game.js';
import { initRenderer, renderFrame } from './renderer.js';
import { initAudio, playHit, playScore, playExplode, playGameOver, playStart, playWallBounce } from './audio.js';
import { initParticles, spawnExplosion, updateParticles, getParticles } from './particles.js';
import { initUI, drawUI } from './ui.js';

let lastTime = 0;
let gameState;
let audioStarted = false;

function init() {
    const glCanvas = document.getElementById('gameCanvas');
    const uiCanvas = document.getElementById('uiCanvas');

    // Size canvases at 2x device pixel ratio for sharper rendering
    function resize() {
        const dpr = window.devicePixelRatio || 1;
        const w = window.innerWidth;
        const h = window.innerHeight;
        glCanvas.width = w * dpr;
        glCanvas.height = h * dpr;
        uiCanvas.width = w * dpr;
        uiCanvas.height = h * dpr;
    }
    resize();
    window.addEventListener('resize', resize);

    // Init subsystems
    initRenderer(glCanvas);
    initUI(uiCanvas);
    initInput(glCanvas);
    initParticles();

    // Create game state with event callbacks
    gameState = createGameState({
        onPaddleHit(side) {
            if (audioStarted) playHit(side);
        },
        onWallBounce() {
            if (audioStarted) playWallBounce();
        },
        onScore(player, scores) {
            if (audioStarted) playScore();
        },
        onBoxHit(box) {
            if (audioStarted) playExplode();
            spawnExplosion(box.x, box.y, box.size);
        },
        onGameOver(winner) {
            if (audioStarted) playGameOver();
        },
        onGameStart() {
            if (audioStarted) playStart();
        },
    });

    // Start/restart handler
    function handleStart() {
        if (gameState.phase === 'waiting' || gameState.phase === 'gameover') {
            if (!audioStarted) {
                initAudio();
                audioStarted = true;
            }
            if (gameState.phase === 'gameover') {
                resetGame(gameState);
            }
            startGame(gameState);
        }
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') handleStart();
        if (e.key === 'y' && gameState.phase === 'gameover') handleStart();
    });
    glCanvas.addEventListener('click', handleStart);

    // Game loop
    function loop(time) {
        const dt = Math.min((time - lastTime) / 1000, 0.05); // cap delta
        lastTime = time;

        const input = getInput();
        gameState.cpuMode = input.p2Cpu;
        updateGame(gameState, input, dt);
        updateParticles(dt);
        renderFrame(gameState, getParticles());
        drawUI(gameState);

        requestAnimationFrame(loop);
    }

    requestAnimationFrame((time) => {
        lastTime = time;
        requestAnimationFrame(loop);
    });
}

window.addEventListener('DOMContentLoaded', init);
