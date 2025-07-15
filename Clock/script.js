var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

let sq = Math.min(window.innerWidth, window.innerHeight);
canvas.width = sq;
canvas.height = sq;

let clock = document.getElementById('clock');
clock.style.top = sq / 2 - clock.clientHeight + 'px';
clock.style.left = canvas.getBoundingClientRect().left + 'px';
clock.style.width = canvas.getBoundingClientRect().top + sq + 'px';

let time; // 0 9 44 11;

function draw_hexagon(x, y, side){
  var radius = 0.866 * side;
  ctx.beginPath();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#6F6';
  
  const cx = [x, x+radius, x+radius, x, x-radius, x-radius, x];
  const cy = [y-side, y-side/2, y+side/2, y+side, y+side/2, y-side/2, y-side];
  
  ctx.beginPath(); 
  
  for (var i=0; i<6; i++){
    if (time & (1 << i)){
      ctx.moveTo(cx[i], cy[i]);
      ctx.lineTo(cx[i+1], cy[i+1]);
    }
  }
  
  ctx.stroke();
}

function draw_inhexagon(x, y, side){
  var radius = 0.866 * side;
  ctx.beginPath();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#6F6';
  
  const cx = [x, x+radius, x+radius, x, x-radius, x-radius, x];
  const cy = [y-side, y-side/2, y+side/2, y+side, y+side/2, y-side/2, y-side];
  
  ctx.beginPath(); 
  
  for (var i=0; i<6; i++){
    if (time & (1 << (i+6))){
      ctx.moveTo(cx[i], cy[i]);
      ctx.lineTo(cx[i+1], cy[i+1]);
    }
  }
  
  ctx.stroke();
}

function draw_lines(x, y, side, rel){
  var radius = 0.866 * side;
  ctx.beginPath();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#6F6';
  
  const cx = [x, x+radius, x+radius, x, x-radius, x-radius, x];
  const cy = [y-side, y-side/2, y+side/2, y+side, y+side/2, y-side/2, y-side];
  
  ctx.beginPath(); 
  
  for (var i=0; i<6; i++){
    if (time & (1 << (i+12))){
      ctx.moveTo(cx[i], cy[i]);
      ctx.lineTo(x+(cx[i]-x)*rel, y+(cy[i]-y)*rel);
    }
  }
  
  ctx.stroke();
}

function draw_inlines(x, y, side){
  var radius = 0.866 * side;
  ctx.beginPath();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#6F6';
  
  const cx = [x, x+radius, x+radius, x, x-radius, x-radius, x];
  const cy = [y-side, y-side/2, y+side/2, y+side, y+side/2, y-side/2, y-side];
  
  ctx.beginPath(); 
  
  for (var i=0; i<6; i++){
    ctx.moveTo(cx[i], cy[i]);
    ctx.lineTo(x, y);
  }
  
  ctx.stroke();
}

function draw_dots(){
  
}

function draw_indots(){
  
}

function draw_clock(){
  let bigr = 0.4;
  let rel = 3/5.;
  draw_hexagon(sq/2, sq/2, bigr*sq);
  draw_inhexagon(sq/2, sq/2, bigr*rel*sq);
  draw_lines(sq/2, sq/2, bigr*sq, rel);
  //draw_inlines(sq/2, sq/2, bigr*rel*sq);
}

function currentTime() {
  let date = new Date(); 
  let hh = date.getHours();
  let mm = date.getMinutes();
  let ss = date.getSeconds();

   hh = (hh < 10) ? "0" + hh : hh;
   mm = (mm < 10) ? "0" + mm : mm;
   ss = (ss < 10) ? "0" + ss : ss;
    
   let t = hh + ":" + mm + ":" + ss + " ";
   document.getElementById("clock").innerText = t; 
  
  return (hh << 12) + (mm << 6) + ss;
}

function frame() { 
  ctx.clearRect(0, 0, canvas.width, canvas.height);;
  time = currentTime();
  draw_clock();
  window.requestAnimationFrame(frame);
}

window.requestAnimationFrame(frame);