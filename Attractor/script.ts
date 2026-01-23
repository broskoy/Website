// create canvas
const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
document.body.style.backgroundColor = "#222";
const ctx = canvas.getContext('2d')!;


// constants
const DOT_COUNT = 2000;
const SCALE = 24;
const FOCAL_LENGTH = 400;
const ATTRACTOR = 0;



// types
type Dot = { x: number; y: number; z: number };
type RenderDot = { x: number; y: number; r: number; color: string; depth: number };


// data arrays
let dots: Dot[] = Array.from({ length: DOT_COUNT }, () => randomDot());
let renderDots: RenderDot[] = Array.from({ length: DOT_COUNT }, () => emptyRenderDot());
let angle = 0;


function randomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}


function randomDot(): Dot {
    return {
        x: randomRange(0, 3),
        y: randomRange(0, 3),
        z: randomRange(0, 3)
    };
}

function emptyRenderDot(): RenderDot {
    return {
        x: 0,
        y: 0,
        r: 0,
        color: 'rgb(0,0,0)',
        depth: 0
    }
}

function halvorsen(dot: Dot): Dot {
    const dt = 0.001;
    const a = 1.89;

    const dx = -a * dot.x - 4 * dot.y - 4 * dot.z - dot.y ** 2;
    const dy = -a * dot.y - 4 * dot.z - 4 * dot.x - dot.z ** 2;
    const dz = -a * dot.z - 4 * dot.x - 4 * dot.y - dot.x ** 2;

    dot.x += dt * dx;
    dot.y += dt * dy;
    dot.z += dt * dz;

    return dot;
}


function updatePositions() {
    for (let i = 0; i < dots.length; i++) {
        let dot = dots[i];

        // prevent out of bounds
        if (Math.abs(dot.x) > 20 || Math.abs(dot.y) > 20 || Math.abs(dot.z) > 20) {
            dot = randomDot();
            continue;
        }

        dot = halvorsen(dot);
    }
}


function projectToScreen() {
    for (let i = 0; i < renderDots.length; i++) {
        let dot = dots[i]
        let renderDot = renderDots[i]

        // center attractor
        const worldX = dot.x + 4;
        const worldY = dot.y + 2;
        const worldZ = dot.z + 3;

        // move camera (around y axis)
        const rotX = worldX * Math.cos(angle) - worldZ * Math.sin(angle);
        const rotZ = worldX * Math.sin(angle) + worldZ * Math.cos(angle);
        const rotY = worldY;

        // project 3d into 2d
        const perspective = FOCAL_LENGTH / (FOCAL_LENGTH + rotZ + 80);

        // calculate color
        const intensity = rotZ;
        const r = Math.min(255, Math.max(0, 100 - (intensity * 5)));
        const g = Math.min(255, Math.max(0, 150 - (intensity * 5)));
        const b = Math.min(255, Math.max(0, 150 - (intensity * 5)));

        renderDot.x = (canvas.width / 2) + (rotX * perspective * SCALE),
            renderDot.y = (canvas.height / 2) + (rotY * perspective * SCALE),
            renderDot.r = 5 * perspective,
            renderDot.color = `rgb(${r}, ${g}, ${b})`,
            renderDot.depth = rotZ
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
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // world coordinates
    updatePositions();

    // view coordinates
    projectToScreen();

    // sort by depth
    renderDots.sort((a, b) => b.depth - a.depth);

    // draw
    drawDots();

    angle += 0.002;

    requestAnimationFrame(loop);
}

loop();
