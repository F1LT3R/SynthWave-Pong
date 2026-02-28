import { CSS_COLORS } from './constants.js';
import { PLAYER1 } from './constants.js';

let canvas, ctx;

export function initUI(c) {
    canvas = c;
    ctx = canvas.getContext('2d');
}

export function drawUI(gameState) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState.phase === 'waiting') {
        drawWaiting();
    } else if (gameState.phase === 'playing') {
        drawPlaying(gameState);
    } else if (gameState.phase === 'gameover') {
        drawGameOver(gameState);
    }
}

function drawWaiting() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Title
    ctx.save();
    ctx.font = 'bold ' + Math.floor(canvas.width / 12) + 'px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 30;
    ctx.shadowColor = CSS_COLORS.neonPink;
    ctx.fillStyle = CSS_COLORS.neonPink;
    ctx.fillText('SYNTHWAVE PONG', cx, cy - canvas.height * 0.12);
    ctx.restore();

    // Subtitle — pulsing
    const pulse = Math.sin(Date.now() / 500) * 0.3 + 0.7;
    ctx.save();
    ctx.font = Math.floor(canvas.width / 35) + 'px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 20;
    ctx.shadowColor = CSS_COLORS.neonCyan;
    ctx.fillStyle = CSS_COLORS.neonCyan;
    ctx.globalAlpha = pulse;
    ctx.fillText('Press Space or Click to Start', cx, cy + canvas.height * 0.04);
    ctx.restore();

    // Controls
    ctx.save();
    ctx.font = Math.floor(canvas.width / 50) + 'px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = CSS_COLORS.dimWhite;
    ctx.fillText('Player 1: W/S  |  Player 2: Mouse or \u2191/\u2193', cx, cy + canvas.height * 0.14);
    ctx.restore();
}

function drawPlaying(gameState) {
    const cx = canvas.width / 2;
    const scoreY = canvas.height * 0.08;
    const labelY = scoreY - canvas.height * 0.035;
    const scoreFont = 'bold ' + Math.floor(canvas.width / 14) + 'px monospace';
    const labelFont = Math.floor(canvas.width / 55) + 'px monospace';

    // Player 1 score (left)
    ctx.save();
    ctx.font = labelFont;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 15;
    ctx.shadowColor = CSS_COLORS.neonPink;
    ctx.fillStyle = CSS_COLORS.neonPink;
    ctx.fillText('PLAYER 1', cx - canvas.width * 0.15, labelY);

    ctx.font = scoreFont;
    ctx.fillText(String(gameState.scores[0]), cx - canvas.width * 0.15, scoreY + canvas.height * 0.02);
    ctx.restore();

    // Player 2 score (right)
    ctx.save();
    ctx.font = labelFont;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 15;
    ctx.shadowColor = CSS_COLORS.neonCyan;
    ctx.fillStyle = CSS_COLORS.neonCyan;
    ctx.fillText('PLAYER 2', cx + canvas.width * 0.15, labelY);

    ctx.font = scoreFont;
    ctx.fillText(String(gameState.scores[1]), cx + canvas.width * 0.15, scoreY + canvas.height * 0.02);
    ctx.restore();
}

function drawGameOver(gameState) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const isP1 = gameState.winner === PLAYER1;
    const winnerColor = isP1 ? CSS_COLORS.neonPink : CSS_COLORS.neonCyan;
    const winnerName = isP1 ? 'PLAYER 1' : 'PLAYER 2';

    // Winner text
    ctx.save();
    ctx.font = 'bold ' + Math.floor(canvas.width / 14) + 'px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 30;
    ctx.shadowColor = winnerColor;
    ctx.fillStyle = winnerColor;
    ctx.fillText(winnerName + ' WINS!', cx, cy - canvas.height * 0.08);
    ctx.restore();

    // Final score
    ctx.save();
    ctx.font = Math.floor(canvas.width / 25) + 'px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = CSS_COLORS.white;
    ctx.fillText(gameState.scores[0] + ' - ' + gameState.scores[1], cx, cy + canvas.height * 0.02);
    ctx.restore();

    // Play again — pulsing
    const pulse = Math.sin(Date.now() / 500) * 0.3 + 0.7;
    ctx.save();
    ctx.font = Math.floor(canvas.width / 35) + 'px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 20;
    ctx.shadowColor = CSS_COLORS.neonCyan;
    ctx.fillStyle = CSS_COLORS.neonCyan;
    ctx.globalAlpha = pulse;
    ctx.fillText('Press Y or Click to Play Again', cx, cy + canvas.height * 0.12);
    ctx.restore();
}
