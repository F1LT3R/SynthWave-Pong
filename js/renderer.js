import { COLORS, WORLD, CAMERA, PADDLE, BALL } from './constants.js';
import { VERTEX_SHADER_SRC, FRAGMENT_SHADER_SRC } from './shaders.js';

let gl;
let program;
let aPosition;
let uProjection, uModelView, uColor, uAlpha, uGlow;
let cubeTriBuffer, cubeLineBuffer, cubeTriCount, cubeLineCount;
let sphereTriBuffer, sphereLineBuffer, sphereTriCount, sphereLineCount;
let lineBuffer, boundaryBuffer, boundaryVertCount;
let projectionMatrix;
let ballRotX = 0, ballRotZ = 0, lastFrameTime = 0;

// ---- Matrix helpers (column-major Float32Array(16)) ----

function mat4Identity() {
    const m = new Float32Array(16);
    m[0] = 1; m[5] = 1; m[10] = 1; m[15] = 1;
    return m;
}

function mat4Perspective(fovDeg, aspect, near, far) {
    const f = 1.0 / Math.tan((fovDeg * Math.PI / 180) / 2);
    const nf = 1 / (near - far);
    const m = new Float32Array(16);
    m[0] = f / aspect;
    m[5] = f;
    m[10] = (far + near) * nf;
    m[11] = -1;
    m[14] = 2 * far * near * nf;
    return m;
}

function mat4Translate(x, y, z) {
    const m = mat4Identity();
    m[12] = x;
    m[13] = y;
    m[14] = z;
    return m;
}

function mat4Scale(sx, sy, sz) {
    const m = new Float32Array(16);
    m[0] = sx; m[5] = sy; m[10] = sz; m[15] = 1;
    return m;
}

function mat4Multiply(a, b) {
    const r = new Float32Array(16);
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            r[j * 4 + i] =
                a[0 * 4 + i] * b[j * 4 + 0] +
                a[1 * 4 + i] * b[j * 4 + 1] +
                a[2 * 4 + i] * b[j * 4 + 2] +
                a[3 * 4 + i] * b[j * 4 + 3];
        }
    }
    return r;
}

function mat4RotateX(angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    const m = mat4Identity();
    m[5] = c; m[6] = s;
    m[9] = -s; m[10] = c;
    return m;
}

function mat4RotateZ(angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    const m = mat4Identity();
    m[0] = c; m[1] = s;
    m[4] = -s; m[5] = c;
    return m;
}

// ---- Cube mesh data ----

function createCubeTriangles() {
    // Unit cube centered at origin, faces as triangles
    const s = 0.5;
    // prettier-ignore
    return new Float32Array([
        // Front
        -s,-s, s,  s,-s, s,  s, s, s,
        -s,-s, s,  s, s, s, -s, s, s,
        // Back
        -s,-s,-s, -s, s,-s,  s, s,-s,
        -s,-s,-s,  s, s,-s,  s,-s,-s,
        // Top
        -s, s,-s, -s, s, s,  s, s, s,
        -s, s,-s,  s, s, s,  s, s,-s,
        // Bottom
        -s,-s,-s,  s,-s,-s,  s,-s, s,
        -s,-s,-s,  s,-s, s, -s,-s, s,
        // Right
         s,-s,-s,  s, s,-s,  s, s, s,
         s,-s,-s,  s, s, s,  s,-s, s,
        // Left
        -s,-s,-s, -s,-s, s, -s, s, s,
        -s,-s,-s, -s, s, s, -s, s,-s,
    ]);
}

function createCubeLines() {
    const s = 0.5;
    // 12 edges of a cube
    // prettier-ignore
    return new Float32Array([
        -s,-s,-s,  s,-s,-s,
         s,-s,-s,  s, s,-s,
         s, s,-s, -s, s,-s,
        -s, s,-s, -s,-s,-s,

        -s,-s, s,  s,-s, s,
         s,-s, s,  s, s, s,
         s, s, s, -s, s, s,
        -s, s, s, -s,-s, s,

        -s,-s,-s, -s,-s, s,
         s,-s,-s,  s,-s, s,
         s, s,-s,  s, s, s,
        -s, s,-s, -s, s, s,
    ]);
}

// ---- Sphere mesh data ----

function sphereVert(r, theta, phi) {
    return [
        r * Math.sin(theta) * Math.cos(phi),
        r * Math.cos(theta),
        r * Math.sin(theta) * Math.sin(phi),
    ];
}

function createSphereTriangles(segs, rings) {
    const verts = [];
    for (let r = 0; r < rings; r++) {
        const t1 = (r / rings) * Math.PI;
        const t2 = ((r + 1) / rings) * Math.PI;
        for (let s = 0; s < segs; s++) {
            const p1 = (s / segs) * 2 * Math.PI;
            const p2 = ((s + 1) / segs) * 2 * Math.PI;
            const a = sphereVert(0.5, t1, p1);
            const b = sphereVert(0.5, t1, p2);
            const c = sphereVert(0.5, t2, p1);
            const d = sphereVert(0.5, t2, p2);
            verts.push(...a, ...b, ...d, ...a, ...d, ...c);
        }
    }
    return new Float32Array(verts);
}

function createSphereLines(segs, rings) {
    const verts = [];
    // Latitude lines
    for (let r = 1; r < rings; r++) {
        const t = (r / rings) * Math.PI;
        for (let s = 0; s < segs; s++) {
            const p1 = (s / segs) * 2 * Math.PI;
            const p2 = ((s + 1) / segs) * 2 * Math.PI;
            verts.push(...sphereVert(0.5, t, p1), ...sphereVert(0.5, t, p2));
        }
    }
    // Longitude lines
    for (let s = 0; s < segs; s++) {
        const p = (s / segs) * 2 * Math.PI;
        for (let r = 0; r < rings; r++) {
            const t1 = (r / rings) * Math.PI;
            const t2 = ((r + 1) / rings) * Math.PI;
            verts.push(...sphereVert(0.5, t1, p), ...sphereVert(0.5, t2, p));
        }
    }
    return new Float32Array(verts);
}

// ---- Shader compile ----

function compileShader(type, src) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// ---- Public API ----

export function initRenderer(canvas) {
    gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) {
        console.error('WebGL not available');
        return;
    }

    // Compile and link program
    const vs = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fs = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.bindAttribLocation(program, 0, 'aPosition');
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
    }
    gl.useProgram(program);

    // Locations
    aPosition = gl.getAttribLocation(program, 'aPosition');
    uProjection = gl.getUniformLocation(program, 'uProjection');
    uModelView = gl.getUniformLocation(program, 'uModelView');
    uColor = gl.getUniformLocation(program, 'uColor');
    uAlpha = gl.getUniformLocation(program, 'uAlpha');
    uGlow = gl.getUniformLocation(program, 'uGlow');

    // Cube triangle buffer
    const triData = createCubeTriangles();
    cubeTriBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeTriBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, triData, gl.STATIC_DRAW);
    cubeTriCount = triData.length / 3;

    // Cube line buffer
    const lineData = createCubeLines();
    cubeLineBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeLineBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, lineData, gl.STATIC_DRAW);
    cubeLineCount = lineData.length / 3;

    // Sphere buffers
    const sphereTriData = createSphereTriangles(6, 4);
    sphereTriBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereTriBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sphereTriData, gl.STATIC_DRAW);
    sphereTriCount = sphereTriData.length / 3;

    const sphereLineData = createSphereLines(6, 4);
    sphereLineBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereLineBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sphereLineData, gl.STATIC_DRAW);
    sphereLineCount = sphereLineData.length / 3;

    // Boundary lines (4 edges of the playing field)
    const hw = WORLD.width / 2, hh = WORLD.height / 2;
    const bVerts = new Float32Array([
        -hw, -hh, 0,  hw, -hh, 0,
         hw, -hh, 0,  hw,  hh, 0,
         hw,  hh, 0, -hw,  hh, 0,
        -hw,  hh, 0, -hw, -hh, 0,
    ]);
    boundaryBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boundaryBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, bVerts, gl.STATIC_DRAW);
    boundaryVertCount = bVerts.length / 3;

    // Line buffer for divider
    lineBuffer = gl.createBuffer();

    // GL state
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // additive blending for glow
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // Build projection
    const aspect = canvas.width / canvas.height;
    projectionMatrix = mat4Perspective(CAMERA.fov, aspect, CAMERA.near, CAMERA.far);
}

function setModelView(x, y, z, sx, sy, sz) {
    const t = mat4Translate(x - CAMERA.position[0], y - CAMERA.position[1], z - CAMERA.position[2]);
    const s = mat4Scale(sx, sy, sz);
    const mv = mat4Multiply(t, s);
    gl.uniformMatrix4fv(uModelView, false, mv);
}

function drawBox(x, y, z, w, h, d, color, faceAlpha, wireAlpha, glow) {
    setModelView(x, y, z, w, h, d);

    // Filled faces
    gl.uniform3fv(uColor, color);
    gl.uniform1f(uAlpha, faceAlpha);
    gl.uniform1f(uGlow, 0.0);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeTriBuffer);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, cubeTriCount);

    // Wireframe edges
    gl.uniform1f(uAlpha, wireAlpha);
    gl.uniform1f(uGlow, glow);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeLineBuffer);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINES, 0, cubeLineCount);
}

function drawSphere(x, y, z, diameter, color, faceAlpha, wireAlpha, glow, rotX, rotZ) {
    const s = diameter;
    const t = mat4Translate(x - CAMERA.position[0], y - CAMERA.position[1], z - CAMERA.position[2]);
    const rz = mat4RotateZ(rotZ);
    const rx = mat4RotateX(rotX);
    const sc = mat4Scale(s, s, s);
    const mv = mat4Multiply(t, mat4Multiply(rz, mat4Multiply(rx, sc)));
    gl.uniformMatrix4fv(uModelView, false, mv);

    // Filled faces
    gl.uniform3fv(uColor, color);
    gl.uniform1f(uAlpha, faceAlpha);
    gl.uniform1f(uGlow, 0.0);
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereTriBuffer);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, sphereTriCount);

    // Wireframe (all lines visible)
    gl.uniform3fv(uColor, color);
    gl.uniform1f(uAlpha, wireAlpha);
    gl.uniform1f(uGlow, glow);
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereLineBuffer);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINES, 0, sphereLineCount);
}

function drawBoundary() {
    const mv = mat4Translate(-CAMERA.position[0], -CAMERA.position[1], -CAMERA.position[2]);
    gl.uniformMatrix4fv(uModelView, false, mv);
    gl.uniform3fv(uColor, COLORS.white);
    gl.uniform1f(uAlpha, 0.25);
    gl.uniform1f(uGlow, 0.3);

    gl.bindBuffer(gl.ARRAY_BUFFER, boundaryBuffer);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINES, 0, boundaryVertCount);
}

export function renderFrame(gameState, particles) {
    if (!gl) return;

    // Update projection on resize
    const aspect = gl.canvas.width / gl.canvas.height;
    projectionMatrix = mat4Perspective(CAMERA.fov, aspect, CAMERA.near, CAMERA.far);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    const bg = COLORS.background;
    gl.clearColor(bg[0], bg[1], bg[2], 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    gl.uniformMatrix4fv(uProjection, false, projectionMatrix);

    // ---- Boundary lines ----
    drawBoundary();

    // ---- Middle divider line (dashed) ----
    drawDivider();

    // ---- Paddles ----
    const hw = WORLD.width / 2;
    const p1 = gameState.paddles[0];
    const p2 = gameState.paddles[1];

    drawBox(
        -hw + PADDLE.offsetX, p1.y, 0,
        PADDLE.width, PADDLE.height, PADDLE.depth,
        COLORS.neonPink, 0.2, 1.0, 0.6
    );
    drawBox(
        hw - PADDLE.offsetX, p2.y, 0,
        PADDLE.width, PADDLE.height, PADDLE.depth,
        COLORS.neonCyan, 0.2, 1.0, 0.6
    );

    // ---- Ball (sphere with rolling rotation) ----
    const b = gameState.ball;
    const now = performance.now() / 1000;
    const dt = lastFrameTime ? now - lastFrameTime : 0;
    lastFrameTime = now;
    const radius = BALL.size / 2;
    if (radius > 0) {
        ballRotZ -= (b.vx * dt) / radius;
        ballRotX += (b.vy * dt) / radius;
    }
    drawSphere(
        b.x, b.y, 0,
        BALL.size,
        COLORS.neonYellow, 0.2, 1.0, 0.8,
        ballRotX, ballRotZ
    );

    // ---- Obstacles ----
    if (gameState.obstacles) {
        for (const obs of gameState.obstacles) {
            drawBox(
                obs.x, obs.y, 0,
                obs.size, obs.size, obs.size,
                obs.color || COLORS.neonOrange, 0.15, 1.0, 0.5
            );
        }
    }

    // ---- Particles ----
    for (const p of particles) {
        drawBox(
            p.x, p.y, p.z,
            p.size, p.size, p.size,
            p.color, p.alpha * 0.3, p.alpha, 0.9
        );
    }
}

function drawDivider() {
    const halfH = WORLD.height / 2;
    const dashLen = 0.3;
    const gapLen = 0.3;
    const verts = [];

    for (let y = -halfH; y < halfH; y += dashLen + gapLen) {
        const y1 = y;
        const y2 = Math.min(y + dashLen, halfH);
        verts.push(0, y1, 0, 0, y2, 0);
    }

    const data = new Float32Array(verts);
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);

    const mv = mat4Translate(-CAMERA.position[0], -CAMERA.position[1], -CAMERA.position[2]);
    gl.uniformMatrix4fv(uModelView, false, mv);
    gl.uniform3fv(uColor, COLORS.neonPurple);
    gl.uniform1f(uAlpha, 0.6);
    gl.uniform1f(uGlow, 0.4);

    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINES, 0, data.length / 3);
}
