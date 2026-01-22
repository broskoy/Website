const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const DOT_COUNT = 2000;
const canvas = document.createElement('canvas');
canvas.width = WIDTH;
canvas.height = HEIGHT;
document.body.appendChild(canvas);
document.body.style.backgroundColor = "black";
const ctx = canvas.getContext('2d');
function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}
function initXYZ() {
    return {
        x: randomRange(-3, 3),
        y: randomRange(-3, 3),
        z: randomRange(-3, 3)
    };
}
function newPos(p, t) {
    let { x, y, z } = p;
    // reset if out of bounds
    if (Math.abs(x) > 100 || Math.abs(y) > 100 || Math.abs(z) > 100) {
        const fresh = initXYZ();
        x = fresh.x;
        y = fresh.y;
        z = fresh.z;
    }
    const dt = t / 10000;
    const a = 1.89;
    // halvorsen equations
    const new_x = x + dt * (-a * x - 4 * y - 4 * z - Math.pow(y, 2));
    const new_y = y + dt * (-a * y - 4 * z - 4 * x - Math.pow(z, 2));
    const new_z = z + dt * (-a * z - 4 * x - 4 * y - Math.pow(x, 2));
    return Object.assign(Object.assign({}, p), { x: new_x, y: new_y, z: new_z });
}
// initialization
let dots = Array.from({ length: DOT_COUNT }, () => initXYZ());
function loop() {
    // clear screen
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    for (let i = 0; i < dots.length; i++) {
        // update position
        dots[i] = newPos(dots[i], 16);
        const d = dots[i];
        // calculate color
        const r = Math.min(255, Math.max(0, 150 + (d.z * 5)));
        const g = Math.min(255, Math.max(0, 100 + (d.z * 5)));
        const b = Math.min(255, Math.max(0, 150 + (d.z * 5)));
        // Draw Dot
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.beginPath();
        const scale = Math.min(WIDTH, HEIGHT) / 25;
        ctx.arc(d.x * scale + WIDTH / 2 + 100, d.y * scale + HEIGHT / 2 + 100, 4, 0, Math.PI * 2);
        ctx.fill();
    }
    requestAnimationFrame(loop);
}
loop();
