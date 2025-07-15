var canvas = document.getElementById('star')
var ctx = canvas.getContext('2d')

let E = 2; // eponential base
// const B = 10; // numeral base - not used
let m = E;
let M = E;

function coord(idx, m) {
  // takes points returns pixel coordinates
  let u = 2.0 * Math.PI / m * idx - Math.PI / 2;
  return {x: Math.cos(u),
          y: Math.sin(u)}
}

function draw(m) {
  // full canvas
  let sq = Math.min(window.innerWidth, window.innerHeight);
  canvas.width = sq;
  canvas.height = sq;
  
  // drawing box
  let cx = canvas.width / 2; // canvas center
  let cy = canvas.height / 2; // canvas center
  let R = Math.min(cx, cy) * 0.8; // circle radius
  let margin = canvas.width * 0.05; // text margin
  
  // text
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#FFF';
  let fontsize = cx / 6.0;
  ctx.font = fontsize + 'px monospace';
  ctx.fillText(E, margin, fontsize + margin);
  ctx.fillText(Math.trunc(m), canvas.width - 2*fontsize - margin, fontsize + margin);
  
  // line preferences
  let alpha = 0.2 + Math.pow(1.01, -m+E);
  ctx.strokeStyle = `rgba(0, 255, 140, ${alpha})`;
  ctx.lineWidth = 2;
   
  // points  
  for (var i = 0; i <= M; i++){    
    let c1 = coord(i, m);
    let c2 = coord((i*E)%m, m);

    ctx.beginPath();
    ctx.moveTo(cx + c1.x * R, cy + c1.y * R);
    ctx.lineTo(cx + c2.x * R, cy + c2.y * R);
    ctx.stroke(); 
  }
  
  // circle
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, 2 * Math.PI);
  ctx.stroke(); 

}


let stopFrames = 60;
let frames = 1;
let isAnimating = true;

function frame() {
  if (frames <= 0 && m <= M){
    draw(m);
    m++;
    frames = Math.floor(stopFrames * (0.05 + Math.pow(1.05, -m+E)));
    console.log(m, E, frames);
  }

  frames--;
  window.requestAnimationFrame(frame);

  if (m > M) {
    document.getElementById("inputcontainer").style.display = 'block';
  }
}

function onclickbutton() {
  document.getElementById("inputcontainer").style.display = 'none';
  E = parseInt(document.getElementById("slider1").value);
  M = parseInt(document.getElementById("slider2").value);
  m = E;
  
  window.requestAnimationFrame(frame); 
}

function slider1changed(ev) {
  let el = document.getElementById("slider1_value")
  el.textContent = ev.target.value;
}

function slider2changed(ev) {
  let el = document.getElementById("slider2_value")
  el.textContent = ev.target.value;
}