import { COLORS } from './constants.js';

let particles = [];

const neonColors = [
    COLORS.neonPink,
    COLORS.neonCyan,
    COLORS.neonYellow,
    COLORS.neonOrange,
    COLORS.neonPurple,
    COLORS.neonGreen,
];

export function initParticles() {
    particles = [];
}

export function spawnExplosion(x, y, size) {
    const count = 15 + Math.floor(Math.random() * 11); // 15-25
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        particles.push({
            x,
            y,
            z: 0,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            vz: (Math.random() - 0.5) * 2,
            size: 0.05 + Math.random() * 0.1,
            color: neonColors[Math.floor(Math.random() * neonColors.length)],
            alpha: 1.0,
            life: 0.5 + Math.random() * 0.5,
            rotation: Math.random() * Math.PI * 2,
        });
    }
}

export function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.z += p.vz * dt;
        p.vy -= 2 * dt;
        p.life -= dt;
        p.alpha = Math.max(0, p.life);
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

export function getParticles() {
    return particles;
}
