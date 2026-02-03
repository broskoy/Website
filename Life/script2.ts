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
// 2 CONSTANTS
// ---------------------------------------------------------
const SCALE = 0.5; // Zoom out to see the structures
const PARTICLE_COUNT = 600; // More particles = more fun structures
const FRICTION = 0.90; // High friction is CRITICAL for Matrix stability
const FORCE_STRENGTH = 1.0; 

// The Rules: 
// 1. Attraction (Matrix)
// 2. Repulsion (Close range safety)
const REPULSION_RANGE = 20; // Particles push away if closer than this

// ---------------------------------------------------------
// 3 THE MATRIX
// ---------------------------------------------------------
// Classic "Particle Life" settings
// Try changing these to see completely different "universes"
const attractions = [
    [ 1.0,  0.5, -0.2,  0.0], // Red rules
    [-0.5,  0.5,  0.0, -0.2], // Cyan rules
    [ 0.2,  0.0,  1.0, -0.5], // Green rules
    [ 0.0, -0.2,  0.5,  1.0]  // Yellow rules
];

// ---------------------------------------------------------
// 4 TYPES (Euler)
// ---------------------------------------------------------
type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    type: number;
};

// ---------------------------------------------------------
// 5 INITIALIZATION
// ---------------------------------------------------------
function createParticle(): Particle {
    const type = Math.floor(Math.random() * 4);
    const colors = ["#FF0000", "#00FFFF", "#00FF00", "#FFFF00"];
    
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 0,
        color: colors[type],
        type: type
    };
}

const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, createParticle);

// ---------------------------------------------------------
// 6 PHYSICS (Euler + Matrix)
// ---------------------------------------------------------
function updatePhysics() {
    
    // 1. Calculate Forces (The N^2 Loop)
    for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        let fx = 0;
        let fy = 0;

        for (let j = 0; j < particles.length; j++) {
            if (i === j) continue;
            const p2 = particles[j];

            let dx = p2.x - p1.x;
            let dy = p2.y - p1.y;
            
            // Wrap around screen (Toroidal world) - Makes it look infinite
            if (dx > canvas.width * 0.5) dx -= canvas.width;
            if (dx < -canvas.width * 0.5) dx += canvas.width;
            if (dy > canvas.height * 0.5) dy -= canvas.height;
            if (dy < -canvas.height * 0.5) dy += canvas.height;

            const distSq = dx*dx + dy*dy;
            if (distSq > 6400) continue; // Optimization: Ignore far away stuff

            const dist = Math.sqrt(distSq);
            const force = attractions[p1.type][p2.type];

            // A. The Matrix Force (Long range)
            if (dist > REPULSION_RANGE && dist < 80) {
                const f = force * FORCE_STRENGTH / dist;
                fx += f * dx;
                fy += f * dy;
            }

            // B. The Repulsion Force (Short range safety)
            // Replaces "Collisions" with a soft push
            if (dist < REPULSION_RANGE && dist > 0) {
                const f = -2.0 * FORCE_STRENGTH / dist; // Hard push
                fx += f * dx;
                fy += f * dy;
            }
        }

        // Apply Force to Velocity
        p1.vx += fx;
        p1.vy += fy;
    }

    // 2. Move & Friction
    for (let p of particles) {
        // Friction prevents the "infinite energy" explosion
        p.vx *= FRICTION;
        p.vy *= FRICTION;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around screen
        if (p.x < 0) p.x += canvas.width;
        if (p.x > canvas.width) p.x -= canvas.width;
        if (p.y < 0) p.y += canvas.height;
        if (p.y > canvas.height) p.y -= canvas.height;
    }
}

// ---------------------------------------------------------
// 7 RENDER
// ---------------------------------------------------------
function loop() {
    // Trail effect (optional, looks cool)
    ctx.fillStyle = "rgba(20, 0, 20, 0.2)"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let p of particles) {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 4, 4); // Draw squares for performance
    }

    updatePhysics();
    requestAnimationFrame(loop);
}

loop();