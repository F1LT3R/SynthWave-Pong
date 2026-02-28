// Input handling — keyboard for Player 1, mouse for Player 2

const keys = {};
let mouseY = 0.5; // normalized 0-1 (0=top, 1=bottom)

export function initInput(canvas) {
    window.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
    });
    window.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    });
}

export function getInput() {
    let p1Direction = 0;
    if (keys['w']) p1Direction += 1;  // W = up in world = positive Y
    if (keys['s']) p1Direction -= 1;  // S = down in world = negative Y

    return {
        p1Direction,
        p2MouseY: mouseY,
    };
}
