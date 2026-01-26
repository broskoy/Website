var canvas = document.getElementById('star')
var ctx = canvas.getContext('2d')

var N = 0; // starting polygon

function coord(idx) {
  // takes point returns pixel coordinates
  let u = 2.0 * Math.PI / N * idx - Math.PI / 2;
  return {x: Math.cos(u),
          y: Math.sin(u)}
}

function input(){
  
}

function draw(m) {
  // full canvas
  let sq = Math.min(window.innerWidth, window.innerHeight);
  canvas.width = sq;
  canvas.height = sq;
  
  // drawing box
  let cx = canvas.width / 2;
  let cy = canvas.height / 2;
  let R = Math.min(cx, cy) * 0.8;
  let margin = canvas.width * 0.05;
  
  // corner text
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#FFF';
  let fontsize = cx / 6.0;
  ctx.font = fontsize + 'px monospace';
  ctx.fillText(N, margin, fontsize + margin);
  ctx.fillText(Math.trunc(m), canvas.width - fontsize - margin, fontsize + margin);
  
  // line preferences
  ctx.strokeStyle = '#0FA';
  ctx.lineWidth = 4;
  ctx.beginPath();

  // points
  for (var i = 0; i < N; i++) {
    let c1 = coord(i);
    let c2 = coord(i + m);

    ctx.moveTo(cx + c1.x * R, cy + c1.y * R);
    ctx.lineTo(cx + c2.x * R, cy + c2.y * R);
  }

  ctx.stroke(); 
}

let animationFrames = 10;
var m = 0;
var stopFrames = 10;
var isAnimating = true;

function frame() {
  if (isAnimating) {
    m++;
    if (m % animationFrames == 0) isAnimating = false;
  } else {
    if (stopFrames > 0) stopFrames--;
    else {
      isAnimating = true;
      stopFrames = 30;
      if (m / animationFrames == N) {
        if (N == 16)
          N = 3;
        else {
          N++;
        }
        m = 0;
      }
    }
  }
  draw(m / animationFrames);

  window.requestAnimationFrame(frame);
}

window.requestAnimationFrame(frame);