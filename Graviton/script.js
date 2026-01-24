// ---------------------------------------------------------
// 1 SETUP
// ---------------------------------------------------------
const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
document.body.style.backgroundColor = "#140014";
const ctx = canvas.getContext('2d');
// ---------------------------------------------------------
// 2 CONSTANTS
// ---------------------------------------------------------
const SCALE = Math.min(canvas.width, canvas.height) / 54; // pixels per unit that will maintain 20 units
const FPS = 60;
const PARTICLE_COUNT = 1500;
const CHUNK_SIZE = 40; // Pixel size of each chunk
const GRAVITY = 0;
// Dynamic Grid Sizing
const COLS = Math.ceil(canvas.width / CHUNK_SIZE);
const ROWS = Math.ceil(canvas.height / CHUNK_SIZE);
// A 2D array of Particle Arrays
let chunks = [];
// ---------------------------------------------------------
// 4 INITIALIZATION
// ---------------------------------------------------------
function initChunks() {
    chunks = [];
    for (let x = 0; x < COLS; x++) {
        const column = [];
        for (let y = 0; y < ROWS; y++) {
            column.push([]);
        }
        chunks.push(column);
    }
}
function createParticle() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: 3,
        mass: 1,
        color: `hsl(${Math.random() * 60 + 180}, 100%, 50%)`
    };
}
const particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
initChunks();
// ---------------------------------------------------------
// 5 PHYSICS ENGINE
// ---------------------------------------------------------
function updateChunkAssignments() {
    // clear every chunk in the grid
    for (let x = 0; x < COLS; x++) {
        for (let y = 0; y < ROWS; y++) {
            chunks[x][y].length = 0;
        }
    }
    // sort particles into chunks
    for (let p of particles) {
        // fast floor logic
        let cx = Math.floor(p.x / CHUNK_SIZE);
        let cy = Math.floor(p.y / CHUNK_SIZE);
        // safety clamp (keep inside grid bounds)
        if (cx < 0)
            cx = 0;
        if (cx >= COLS)
            cx = COLS - 1;
        if (cy < 0)
            cy = 0;
        if (cy >= ROWS)
            cy = ROWS - 1;
        chunks[cx][cy].push(p);
    }
}
function resolveCollision(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distSq = dx * dx + dy * dy;
    const minDist = p1.radius + p2.radius;
    // Check squared distance to avoid expensive Sqrt()
    if (distSq < minDist * minDist && distSq > 0) {
        const dist = Math.sqrt(distSq);
        const overlap = (minDist - dist) / 2;
        // 1. Separate them (Fix Overlap)
        const nx = dx / dist; // Normal X
        const ny = dy / dist; // Normal Y
        p1.x -= nx * overlap;
        p1.y -= ny * overlap;
        p2.x += nx * overlap;
        p2.y += ny * overlap;
        // 2. Bounce (Elastic Collision)
        // Simple swap logic for same-mass particles
        // (For complex mass, use your full Java formula here)
        const dvx = p2.vx - p1.vx;
        const dvy = p2.vy - p1.vy;
        // Dot product of velocity difference and normal
        const product = dvx * nx + dvy * ny;
        if (product < 0) { // Only bounce if moving towards each other
            p1.vx += nx * product;
            p1.vy += ny * product;
            p2.vx -= nx * product;
            p2.vy -= ny * product;
        }
    }
}
function checkCollisions(cx, cy) {
    const chunk = chunks[cx][cy];
    // check particles inside this chunk against each other
    for (let i = 0; i < chunk.length; i++) {
        const p1 = chunk[i];
        for (let j = i + 1; j < chunk.length; j++) {
            resolveCollision(p1, chunk[j]);
        }
        // Neighbor Checks (Right, Bottom-Left, Bottom, Bottom-Right)
        // We only check "forward" neighbors to avoid double checking
        const neighbors = [
            { x: cx + 1, y: cy }, // right
            { x: cx - 1, y: cy + 1 }, // bottom left
            { x: cx, y: cy + 1 }, // bottom
            { x: cx + 1, y: cy + 1 } // bottom right
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
function updatePhysics() {
    for (let p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        // border bounce
        if (p.x < 0 || canvas.width < p.x)
            p.vx *= -1;
        if (p.y < 0 || canvas.height < p.y)
            p.vy *= -1;
        // keep in bounds
        p.x = Math.max(0, Math.min(canvas.width, p.x));
        p.y = Math.max(0, Math.min(canvas.height, p.y));
    }
    // rebuild assignments
    updateChunkAssignments();
    // collision detection
    for (let x = 0; x < COLS; x++) {
        for (let y = 0; y < ROWS; y++) {
            checkCollisions(x, y);
        }
    }
}
// ---------------------------------------------------------
// 6 RENDER & LOOP
// ---------------------------------------------------------
function draw() {
    ctx.fillStyle = "#140014";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let p of particles) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
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
