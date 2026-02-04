// ---------------------------------------------------------
// 1 SETUP
// ---------------------------------------------------------

const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
document.body.style.backgroundColor = "#111";
const ctx = canvas.getContext('2d')!;

const DOT_COUNT = 2000;
const FOCAL_LENGTH = 400;




// ---------------------------------------------------------
// 2 TYPES
// ---------------------------------------------------------

type Dot = { x: number; y: number; z: number };
type RenderDot = { x: number; y: number; r: number; color: string; depth: number };

type AttractorProfile = {
    update: (p: Dot) => void;                    // Physics Logic
    init: () => Dot;                             // Spawn Logic
    bounds: number;                              // Reset Threshold
    scale: number;                               // Zoom Divider (Higher Is Zoomed Out)
    offset: { x: number, y: number, z: number }; // Visual Center Correction
    baseColor: [number, number, number];         // RGB Base Color
    speed: number;                               // Time Step
};




// ---------------------------------------------------------
// 3 ATTRACTOR STRATEGIES
// ---------------------------------------------------------

const attractors: Record<string, AttractorProfile> = {
    halvorsen: {
        scale: 24,
        bounds: 20,
        speed: 1,
        offset: { x: 4, y: 2, z: 4 },
        baseColor: [50, 220, 220],
        init: () => ({
            x: randomRange(0, 5),
            y: randomRange(0, 5),
            z: randomRange(0, 5)
        }),
        update: (dot) => {
            const dt = 0.001
            const a = 1.89;
            const dx = -a * dot.x - 4 * dot.y - 4 * dot.z - dot.y ** 2;
            const dy = -a * dot.y - 4 * dot.z - 4 * dot.x - dot.z ** 2;
            const dz = -a * dot.z - 4 * dot.x - 4 * dot.y - dot.x ** 2;

            dot.x += dt * dx;
            dot.y += dt * dy;
            dot.z += dt * dz;
        }
    },

    lorenz: {
        scale: 50,
        bounds: 60,
        speed: 1,
        offset: { x: 0, y: 0, z: -25 },
        baseColor: [240, 100, 100],
        init: () => ({
            x: randomRange(-10, 10),
            y: randomRange(-10, 10),
            z: randomRange(10, 40)
        }),
        update: (dot) => {
            const sigma = 10;
            const rho = 28;
            const beta = 8 / 3;
            const dt = 0.002;

            const dx = sigma * (dot.y - dot.x);
            const dy = dot.x * (rho - dot.z) - dot.y;
            const dz = dot.x * dot.y - beta * dot.z;

            dot.x += dt * dx;
            dot.y += dt * dy;
            dot.z += dt * dz;
        }
    },

    aizawa: {
        scale: 4,
        bounds: 20,
        speed: 0.01,
        offset: { x: 0, y: 0, z: 0 },
        baseColor: [230, 220, 0],
        init: () => ({
            x: randomRange(-0.1, 0.1),
            y: randomRange(-0.1, 0.1),
            z: randomRange(-0.1, 0.1)
        }),
        update: (dot) => {
            const dt = 0.01;
            const a = 0.95;
            const b = 0.7;
            const c = 0.6;
            const d = 3.5;
            const e = 0.25;
            const f = 0.1;

            const dx = (dot.z - b) * dot.x - d * dot.y;
            const dy = d * dot.x + (dot.z - b) * dot.y;
            const dz = c + a * dot.z - (dot.z ** 3) / 3 - (dot.x ** 2 + dot.y ** 2) * (1 + e * dot.z) + f * dot.z * (dot.x ** 3);

            dot.x += dt * dx;
            dot.y += dt * dy;
            dot.z += dt * dz;
        }
    },

    thomas: {
        scale: 10,
        bounds: 10,
        speed: 0.05,
        offset: { x: 0, y: 0, z: 0 },
        baseColor: [160, 80, 230],
        init: () => ({
            x: randomRange(-4, 4),
            y: randomRange(-4, 4),
            z: randomRange(-4, 4)
        }),
        update: (dot) => {
            const dt = 0.05;
            const b = 0.208186;

            const dx = Math.sin(dot.y) - b * dot.x;
            const dy = Math.sin(dot.z) - b * dot.y;
            const dz = Math.sin(dot.x) - b * dot.z;

            dot.x += dt * dx;
            dot.y += dt * dy;
            dot.z += dt * dz;
        }
    }
};

// ---------------------------------------------------------
// 4 HELPER FUNCTIONS
// ---------------------------------------------------------

function randomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

function emptyRenderDot(): RenderDot {
    return { x: 0, y: 0, r: 0, color: 'rgb(0,0,0)', depth: 0 };
}

// Dot Depth Fade (Lower Z is brighter)
function getDepthColor(base: [number, number, number], depth: number): string {
    const [r, g, b] = base;
    const fade = depth * 4;

    const R = Math.min(255, Math.max(10, r - fade));
    const G = Math.min(255, Math.max(10, g - fade));
    const B = Math.min(255, Math.max(10, b - fade));

    return `rgb(${R}, ${G}, ${B})`;
}

function initSimulation() {
    const attractor = attractors[currentAttractor];
    dots = Array.from({ length: DOT_COUNT }, () => attractor.init());
    renderDots = Array.from({ length: DOT_COUNT }, () => emptyRenderDot());
}

// ---------------------------------------------------------
// 5. STATE MANAGEMENT
// ---------------------------------------------------------

let currentAttractor = 'halvorsen';
let dots: Dot[] = [];
let renderDots: RenderDot[] = [];
let angle = 0;

// ---------------------------------------------------------
// 6. MAIN LOOPS
// ---------------------------------------------------------

function updatePositions() {
    const attractor = attractors[currentAttractor]

    for (let i = 0; i < dots.length; i++) {
        let dot = dots[i];

        // Bounds Check And Reset
        if (Math.abs(dot.x) > attractor.bounds ||
            Math.abs(dot.y) > attractor.bounds ||
            Math.abs(dot.z) > attractor.bounds) {

            dots[i] = attractor.init();
            continue;
        }

        attractor.update(dot);
    }
}

function projectToScreen() {
    const attractor = attractors[currentAttractor]
    const dynamicScale = Math.min(canvas.width, canvas.height) / attractor.scale;

    for (let i = 0; i < renderDots.length; i++) {
        let dot = dots[i];
        let renderDot = renderDots[i];

        // Center the Attractor (Object Space -> World Space)
        const worldX = dot.x + attractor.offset.x;
        const worldY = dot.y + attractor.offset.y;
        const worldZ = dot.z + attractor.offset.z;

        // Rotate Camera (World Space -> Camera Space)
        // Rotating around the Y-axis
        const rotX = worldX * Math.cos(angle) - worldZ * Math.sin(angle);
        const rotZ = worldX * Math.sin(angle) + worldZ * Math.cos(angle);
        const rotY = worldY;

        // Perspective Projection (Camera Space -> Screen Space)
        // The "+80" pushes the camera back so we don't clip through the object
        const perspective = FOCAL_LENGTH / (FOCAL_LENGTH + rotZ + 80);

        renderDot.x = (canvas.width / 2) + (rotX * perspective * dynamicScale);
        renderDot.y = (canvas.height / 2) + (rotY * perspective * dynamicScale);
        renderDot.r = 4 * perspective; // Scale radius by depth
        renderDot.depth = rotZ; // Store for sorting

        // 4. Color Calculation
        renderDot.color = getDepthColor(attractor.baseColor, rotZ);
    }
}

function drawDots() {
    for (let renderDot of renderDots) {
        ctx.fillStyle = renderDot.color;
        ctx.beginPath();
        ctx.arc(renderDot.x, renderDot.y, renderDot.r, 0, Math.PI * 2);
        ctx.fill();
    }
}

function loop() {
    // Slight trail effect using alpha
    ctx.fillStyle = "rgba(17, 17, 17, 1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    updatePositions();
    projectToScreen();

    // Painter's Algorithm
    renderDots.sort((a, b) => b.depth - a.depth);

    drawDots();

    angle += 0.003;
    requestAnimationFrame(loop);
}

// ---------------------------------------------------------
// 7. START
// ---------------------------------------------------------

const select = document.getElementById('attractorSelect') as HTMLSelectElement;
select.value = currentAttractor;

select.addEventListener('change', (e) => {
    const target = e.target as HTMLSelectElement;
    currentAttractor = target.value;
    initSimulation();
});

initSimulation();
loop();