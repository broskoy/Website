const WIDTH = 1920;
const HEIGHT = 1080;
const DOT_COUNT = 100;


const canvas = document.createElement('canvas');
canvas.width = WIDTH;
canvas.height = HEIGHT;
document.body.appendChild(canvas);
document.body.style.backgroundColor = "black";
const ctx = canvas.getContext('2d')!;


type Point = { x: number; y: number; z: number; colorOffset: number };


function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}


function initXYZ(): Point {
  return {
    x: randomRange(-3, 3),
    y: randomRange(-3, 3),
    z: randomRange(-3, 3),
    colorOffset: Math.floor(Math.random() * 30) // random int 0-30
  };
}


function newPos(p: Point, t: number): Point {
  let { x, y, z } = p;

  // reset if out of bounds
  if (Math.abs(x) > 100 || Math.abs(y) > 100 || Math.abs(z) > 100) {
    const fresh = initXYZ();
    x = fresh.x; y = fresh.y; z = fresh.z;
  }

  const dt = t / 5000;
  const a = 1.89;

  // halvorsen equations
  const new_x = x + dt * (-a * x - 4 * y - 4 * z - y ** 2);
  const new_y = y + dt * (-a * y - 4 * z - 4 * x - z ** 2);
  const new_z = z + dt * (-a * z - 4 * x - 4 * y - x ** 2);

  return { ...p, x: new_x, y: new_y, z: new_z };
}


// initialization
let dots: Point[] = Array.from({ length: 100 }, () => initXYZ());


function loop() {
  // clear screen
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // iterate unoptimized
  for (let i = 0; i < dots.length; i++) {
    // update position
    dots[i] = newPos(dots[i], 16);
    const d = dots[i];

    // calculate color
    const r = Math.min(255, Math.max(0, 150 + d.colorOffset + (d.z * 5)));
    const g = Math.min(255, Math.max(0, 100 + d.colorOffset + (d.z * 5)));
    const b = Math.min(255, Math.max(0, 150 + d.colorOffset + (d.z * 5)));
    
    // Draw Dot
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.beginPath();

    ctx.arc(
      d.x * 40 + WIDTH / 2 + 100,
      d.y * 40 + HEIGHT / 2 + 100,
      5,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  requestAnimationFrame(loop);
}


loop();