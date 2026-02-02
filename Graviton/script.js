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
const PARTICLE_COUNT = 10;
const CHUNK_SIZE = 40; // Pixel size of each chunk
const GRAVITY = true; // Toggle this for gravity
const GRAVITY_STRENGTH = 1; // From Java
const DECELERATION_FACTOR = 0.999; // Compensates for Euler errors
const COLLISION = false; // Toggle this for collisions
// Dynamic Grid Sizing
const COLS = Math.ceil(canvas.width / CHUNK_SIZE);
const ROWS = Math.ceil(canvas.height / CHUNK_SIZE);
// ---------------------------------------------------------
// MATRIX CONFIGURATION
// ---------------------------------------------------------
// The attraction matrix from your Java code
const attractionMatrix = [
    [1.0, 1.0, -1.0, 0.0], // Type 0
    [0.0, 1.0, 1.0, -1.0], // Type 1
    [-1.0, 0.0, 1.0, 1.0], // Type 2
    [1.0, -1.0, 0.0, 1.0] // Type 3
];
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
    const type = 0;
    let color = "#FFFFFF";
    switch (type) {
        case 0:
            color = "#FF0000";
            break; // Red
        case 1:
            color = "#00FFFF";
            break; // Cyan
        case 2:
            color = "#00FF00";
            break; // Green
        case 3:
            color = "#FFFF00";
            break; // Yellow
    }
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: 3,
        mass: 10,
        color: color,
        type: type
    };
}
const particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
initChunks();
// ---------------------------------------------------------
// 5 PHYSICS ENGINE
// ---------------------------------------------------------
function applyGravity() {
    for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        let fx = 0;
        let fy = 0;
        for (let j = 0; j < particles.length; j++) {
            if (i === j)
                continue;
            const p2 = particles[j];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const distSq = dx * dx + dy * dy;
            // Avoid division by zero or extreme forces at very close range
            // Java used Math.max(distance.magSquared(), 0.1)
            const safeDistSq = Math.max(distSq, 1);
            // F = G * m1 * m2 / r^2 * vector_component
            // Note: In Java code, multiplying by 'distance.x' (dx) without normalizing 
            // effectively creates a 1/r force, not 1/r^2. Replicating that exact behavior here.
            const forceFactor = (GRAVITY_STRENGTH * p1.mass * p2.mass) / safeDistSq;
            // Get attraction value from matrix [-1 to 1]
            const attr = attractionMatrix[p1.type][p2.type];
            fx += forceFactor * dx * attr;
            fy += forceFactor * dy * attr;
        }
        // Apply acceleration (F = ma -> a = F/m)
        p1.vx += fx / p1.mass / FPS;
        p1.vy += fy / p1.mass / FPS;
    }
    for (let p of particles) {
        p.vx *= DECELERATION_FACTOR;
        p.vy *= DECELERATION_FACTOR;
    }
}
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
    if (distSq < minDist * minDist && distSq > 0) {
        const dist = Math.sqrt(distSq);
        const overlap = (minDist - dist) / 2;
        // 1. Separate them (Fix Overlap)
        const nx = dx / dist;
        const ny = dy / dist;
        p1.x -= nx * overlap;
        p1.y -= ny * overlap;
        p2.x += nx * overlap;
        p2.y += ny * overlap;
        // 2. Bounce (Mass-Corrected Elastic Collision)
        const dvx = p2.vx - p1.vx;
        const dvy = p2.vy - p1.vy;
        // Relative velocity along the normal
        const product = dvx * nx + dvy * ny;
        // Only resolve if moving towards each other
        if (product < 0) {
            const m1 = p1.mass;
            const m2 = p2.mass;
            const totalMass = m1 + m2;
            const massRatio1 = (2 * m2) / totalMass;
            const massRatio2 = (2 * m1) / totalMass;
            // Apply impulse
            p1.vx += massRatio1 * product * nx;
            p1.vy += massRatio1 * product * ny;
            p2.vx -= massRatio2 * product * nx;
            p2.vy -= massRatio2 * product * ny;
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
    // 1. Apply Gravity (Forces change Velocity)
    if (GRAVITY) {
        applyGravity();
    }
    // 2. Move Particles (Velocity changes Position)
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
    // 3. Collision Detection
    if (COLLISION) {
        updateChunkAssignments();
        for (let x = 0; x < COLS; x++) {
            for (let y = 0; y < ROWS; y++) {
                checkCollisions(x, y);
            }
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
