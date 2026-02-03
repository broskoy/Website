// ---------------------------------------------------------
// 1 SETUP
// ---------------------------------------------------------

const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
document.body.style.backgroundColor = "#140014";
const ctx = canvas.getContext('2d')!;


// ---------------------------------------------------------
// 2 CONSTANTS & VIRTUAL WORLD
// ---------------------------------------------------------

// Simulation settings
const SCALE = Math.min(canvas.width, canvas.height) / 108;
const FPS = 60;
const PARTICLE_COUNT = 10;
const BARRIER = 60;

// Gravity settings
const GRAVITY = true;
const GRAVITY_STRENGTH = 100;

// Collision settings
const COLLISION = true;
const ELASTICITY = 0.9;

// Dynamic chunk grid 
const CHUNK_SIZE = 10;
const COLS = Math.ceil(BARRIER * 2 / CHUNK_SIZE);
const ROWS = Math.ceil(BARRIER * 2 / CHUNK_SIZE);

// Attraction Configuration
const attractions = [
    [1.0, 1.0, -1.0, 0.0],
    [0.0, 1.0, 1.0, -1.0],
    [-1.0, 0.0, 1.0, 1.0],
    [1.0, -1.0, 0.0, 1.0]
];


// ---------------------------------------------------------
// 3 TYPES
// ---------------------------------------------------------

type Particle = {
    x: number;
    y: number;
    // Verlet History
    oldX: number;
    oldY: number;
    // Helpers
    vx: number;
    vy: number;
    radius: number;
    mass: number;
    color: string;
    type: number;
};

let chunks: Particle[][][] = [];


// ---------------------------------------------------------
// 4 INITIALIZATION
// ---------------------------------------------------------

function initChunks() {
    chunks = [];
    for (let x = 0; x < COLS; x++) {
        const column: Particle[][] = [];
        for (let y = 0; y < ROWS; y++) {
            column.push([]);
        }
        chunks.push(column);
    }
}

function randomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

function createParticle(): Particle {
    const type: number = 0;
    let color = "#FFFFFF";

    switch (type) {
        case 0: color = "#FF0000"; break;
        case 1: color = "#00FFFF"; break;
        case 2: color = "#00FF00"; break;
        case 3: color = "#FFFF00"; break;
    }

    const x = randomRange(-BARRIER, +BARRIER);
    const y = randomRange(-BARRIER, +BARRIER);
    const vx = randomRange(-0.5, +0.5);
    const vy = randomRange(-0.5, +0.5);

    return {
        x: x,
        y: y,
        oldX: x - vx,
        oldY: y - vy,
        vx: vx,
        vy: vy,
        radius: 1,
        mass: 1,
        color: color,
        type: type
    };
}

const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, createParticle);
initChunks();


// ---------------------------------------------------------
// 5 PHYSICS ENGINE
// ---------------------------------------------------------

function applyGravity() {
    for (let p1 of particles) {
        let fx = 0;
        let fy = 0;

        for (let p2 of particles) {
            if (p1 === p2) continue;

            // FIX: Use oldX/oldY to calculate force based on CURRENT position,
            // not the future position. This restores Energy Conservation.
            const dx = p2.oldX - p1.oldX;
            const dy = p2.oldY - p1.oldY;

            const distanceSquared = dx * dx + dy * dy;
            if (distanceSquared > 40000) continue;

            let distance = Math.sqrt(distanceSquared);
            const overlapDistance = p1.radius + p2.radius;
            distance = Math.max(distance, overlapDistance);

            const forceFactor = GRAVITY_STRENGTH * (p1.mass * p2.mass) / distance;
            const attraction = attractions[p1.type][p2.type];

            fx += forceFactor * (dx / distance) * attraction;
            fy += forceFactor * (dy / distance) * attraction;
        }

        // MINOR FIX: You were adding Velocity (a*t) to Position directly.
        // You need Displacement (0.5*a*t^2). 
        // Dividing by FPS again corrects the units so gravity isn't 60x too strong.
        p1.vx += fx / p1.mass / FPS / FPS;
        p1.vy += fy / p1.mass / FPS / FPS;
    }
}

function updateChunkAssignments() {
    // Clear chunks
    for (let x = 0; x < COLS; x++) {
        for (let y = 0; y < ROWS; y++) {
            chunks[x][y].length = 0;
        }
    }

    for (let p of particles) {
        let cx = Math.floor((p.x + BARRIER) / CHUNK_SIZE);
        let cy = Math.floor((p.y + BARRIER) / CHUNK_SIZE);

        if (cx < 0) cx = 0;
        if (cx >= COLS) cx = COLS - 1;
        if (cy < 0) cy = 0;
        if (cy >= ROWS) cy = ROWS - 1;

        chunks[cx][cy].push(p);
    }
}

function resolveCollision(p1: Particle, p2: Particle) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distSq = dx * dx + dy * dy;
    const minDist = p1.radius + p2.radius;

    if (distSq < minDist * minDist && distSq > 0) {
        const dist = Math.sqrt(distSq);
        const overlap = (minDist - dist) / 2;

        const nx = dx / dist;
        const ny = dy / dist;

        p1.x -= nx * overlap;
        p1.y -= ny * overlap;
        p2.x += nx * overlap;
        p2.y += ny * overlap;

        const dvx = p2.vx - p1.vx;
        const dvy = p2.vy - p1.vy;
        const product = dvx * nx + dvy * ny;

        if (product < 0) {
            const m1 = p1.mass;
            const m2 = p2.mass;
            const totalMass = m1 + m2;
            const massRatio1 = (2 * m2) / totalMass;
            const massRatio2 = (2 * m1) / totalMass;

            p1.vx += massRatio1 * product * nx * ELASTICITY;
            p1.vy += massRatio1 * product * ny * ELASTICITY;
            p2.vx -= massRatio2 * product * nx * ELASTICITY;
            p2.vy -= massRatio2 * product * ny * ELASTICITY;
        }
    }
}

function checkCollisions(cx: number, cy: number) {
    const chunk = chunks[cx][cy];

    for (let i = 0; i < chunk.length; i++) {
        const p1 = chunk[i];
        for (let j = i + 1; j < chunk.length; j++) {
            resolveCollision(p1, chunk[j]);
        }

        const neighbors = [
            { x: cx + 1, y: cy },
            { x: cx - 1, y: cy + 1 },
            { x: cx, y: cy + 1 },
            { x: cx + 1, y: cy + 1 }
        ];

        for (let n of neighbors) {
            if (n.x >= 0 && n.x < COLS && n.y >= 0 && n.y < ROWS) {
                const neighborCell = chunks[n.x][n.y];
                for (let p2 of neighborCell) {
                    resolveCollision(p1, p2);
                }
            }
        }
    }
}

function updateGravity() {
    for (let p of particles) {
        const vx = (p.x - p.oldX);
        const vy = (p.y - p.oldY);

        p.oldX = p.x;
        p.oldY = p.y;

        p.x += vx;
        p.y += vy;

        p.vx = vx;
        p.vy = vy;
    }
    applyGravity();
    for (let p of particles) {
        p.x += (p.vx - (p.x - p.oldX));
        p.y += (p.vy - (p.y - p.oldY));
    }
}

function updateCollision() {
    updateChunkAssignments();
    for (let x = 0; x < COLS; x++) {
        for (let y = 0; y < ROWS; y++) {
            checkCollisions(x, y);
        }
    }

    for (let p of particles) {
        p.oldX = p.x - p.vx;
        p.oldY = p.y - p.vy;
    }
}

function checkBarrier() {
    for (let p of particles) {
        // Border constraints
        let collided = false;
        if (p.x < -BARRIER + p.radius) {
            p.x = -BARRIER + p.radius;
            p.vx *= -1;
            collided = true;
        }
        if (p.x > BARRIER - p.radius) {
            p.x = BARRIER - p.radius;
            p.vx *= -1;
            collided = true;
        }
        if (p.y < -BARRIER + p.radius) {
            p.y = -BARRIER + p.radius;
            p.vy *= -1;
            collided = true;
        }
        if (p.y > BARRIER - p.radius) {
            p.y = BARRIER - p.radius;
            p.vy *= -1;
            collided = true;
        }

        if (collided) {
            p.oldX = p.x - p.vx;
            p.oldY = p.y - p.vy;
        }
    }
}

function updatePhysics() {

    if (GRAVITY) updateGravity();
    if (COLLISION) updateCollision();

    checkBarrier();
}


// ---------------------------------------------------------
// 6 RENDER (Mapping Virtual -> Screen)
// ---------------------------------------------------------

function draw() {
    ctx.fillStyle = "#140014";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Barrier
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    const boxX = (-BARRIER * SCALE) + canvas.width / 2;
    const boxY = (-BARRIER * SCALE) + canvas.height / 2;
    const boxSize = (BARRIER * 2) * SCALE;
    ctx.strokeRect(boxX, boxY, boxSize, boxSize);

    // Draw Particles
    for (let p of particles) {
        const drawX = (p.x * SCALE) + canvas.width / 2;
        const drawY = (p.y * SCALE) + canvas.height / 2;
        const drawRadius = p.radius * SCALE;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(drawX, drawY, drawRadius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function loop() {
    updatePhysics();
    draw();
    requestAnimationFrame(loop);
}

// Start
loop();