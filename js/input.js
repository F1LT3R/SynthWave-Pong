// Input handling — keyboard for Player 1, mouse for Player 2

const keys = {};
let mouseY = 0.5; // normalized 0-1 (0=top, 1=bottom)
let p2UseMouse = true; // tracks whether P2 is in mouse or keyboard mode

export function initInput(canvas) {
    window.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            p2UseMouse = false;
        }
    });
    window.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        p2UseMouse = true;
    });
}

export function getInput() {
    let p1Direction = 0;
    if (keys['w']) p1Direction += 1;
    if (keys['s']) p1Direction -= 1;

    let p2Direction = 0;
    if (keys['arrowup']) p2Direction += 1;
    if (keys['arrowdown']) p2Direction -= 1;

    return {
        p1Direction,
        p2Direction,
        p2UseMouse,
        p2MouseY: mouseY,
    };
}
