var canvas = document.getElementById('grid');
var ctx = canvas.getContext('2d');

let hexs = 10;
let N = 2*hexs-1;
let shapes = 3;
let totalcells = 3*hexs*(hexs-1);
var matrix = Array.from(Array(2*N), () => new Array(2*N));

let offleft = Array(N).fill(0);
let offright = Array(N).fill(0);

let gameEnd = false; 
let shouldRedraw = true;

var sq = 0, border = 0, radius = 0, side = 0;
  
///////////////////////////////////////////////////////////////

function init_grid(){
  console.log("initializing grid");
  for (var i=0;  i<N; i++){
    offleft[i] = Math.floor((Math.abs(i-hexs+1)-(hexs%2-1)) / 2);
    offright[i] = Math.floor((Math.abs(i-hexs+1)+(hexs%2)) / 2);
  }
  
  for (var i=0; i<N; i++){
    for (var j=0; j<N; j++)
      matrix[i][j] = 0;
  }
}

canvas.onclick = function(ev) {
  const rect = canvas.getBoundingClientRect();
  let cx = ev.clientX - rect.left;
  let cy = ev.clientY - rect.top;
  
  let tilei = pix_pos(cx, cy).i;
  let tilej = pix_pos(cx, cy).j;
  
  if ((offleft[tilei] <= tilej) && (tilej < N - offright[tilei])){
    matrix[tilei][tilej]++;
    matrix[tilei][tilej] %= shapes;
  }
  
  shouldRedraw = true;
}

function pos_pix(i, j){
  let x = (2*j+(1 + i%2))*radius + border;
  let y = (1 + i * 1.5) * side + border;
  
  return {x: x, y: y};
}

function pix_pos(x, y){
  let i = Math.round(((y-border)/side - 1) / 1.5);
  let j = Math.round(((x-border)/radius - (1 + i % 2)) / 2); 
  
  return {i: i, j: j};
}

function mark(i, j, dir){
  console.log("mark", i, j, dir);
  ctx.beginPath();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#D33';
  
  var ang;
  var from = pos_pix(i, j);
  
  switch(dir){
    case 0: ang = 0; break;
    case 1: ang = Math.PI/3; break;
    case 2: ang = 2*Math.PI/3; break;
  }
  
  ctx.moveTo(from.x, from.y); 
  ctx.lineTo(from.x + 8 * radius * Math.cos(ang), 
             from.y + 8 * radius * Math.sin(ang));
  ctx.stroke();
}

function match(){
  
  // check line
  for (var i=0; i<N; i++){
    for (var j=0; j<N; j++){
      var values = new Set();
      
      for (var k=0; k<5; k++)
        values.add(matrix[i][j+k]);
      
       if ((values.size == 1) && !(values.has(0)))
         mark(i, j, 0);
    }
  }
  
  
  // check diagonal 1
  for (var i=0; i<N; i++){
    for (var j=0; j<N; j++){
      var values = new Set();
      
      for (var k=0; k<5; k++)
        values.add(matrix[i+k][j+Math.floor((i+k)/2)-Math.floor(i/2)]);
      
       if ((values.size == 1) && !(values.has(0)))
         mark(i, j, 1);
    }
  }
  
  
  // check diagonal 2  
  for (var i=0; i<N; i++){
    for (var j=2; j<N; j++){
      var values = new Set();
      
      for (var k=0; k<5; k++)
        values.add(matrix[i+k][j-(Math.floor((i+k+1)/2)-Math.floor((i+1)/2))]);
      
       if ((values.size == 1) && !(values.has(0)))
         mark(i, j, 2);
    }
  }
  
}

function draw_hexagon(x, y){
  ctx.beginPath();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#DDD';
  
  ctx.beginPath(); 
  ctx.moveTo(x, y-side  );
  ctx.lineTo(x+radius, y-side/2);
  ctx.lineTo(x+radius, y+side/2);
  ctx.lineTo(x, y+side  );
  ctx.lineTo(x-radius, y+side/2);
  ctx.lineTo(x-radius, y-side/2);
  ctx.lineTo(x, y-side  );
}

function draw(x, y, type, rad){
  ctx.beginPath();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#DDD';
  //ctx.arc(x, y, rad, 0, 2 * Math.PI, false);
  draw_hexagon(x, y);
  ctx.stroke();
  
  switch(type){
    case 0: ; break;
    case 1: ctx.beginPath(); ctx.strokeStyle = '#48D'; ctx.strokeRect(x-rad/2, y-rad/2, rad, rad); break;
    case 2: ctx.beginPath(); ctx.strokeStyle = '#3b6'; ctx.moveTo(x-rad/2, y-rad/2); ctx.lineTo(x+rad/2, y+rad/2); ctx.moveTo(x-rad/2, y+rad/2); ctx.lineTo(x+rad/2, y-rad/2); break;
    case 3:ctx.beginPath(); ctx.strokeStyle = '#C6A'; ctx.strokeRect(x-rad/2, y-rad/2, rad, rad); break;
  } 
  
  ctx.stroke();
}

function draw_grid() {  
  sq = Math.min(window.innerWidth, window.innerHeight);
  canvas.width = sq;
  canvas.height = sq;
  
  border = sq/10;
  radius = (sq - 2*border) / (2*N+1);
  side = 2.0*radius/Math.sqrt(3);

  for (var i=0; i<N; i++){
    for (var j=offleft[i]; j<N-offright[i]; j++)
      draw(pos_pix(i, j).x, pos_pix(i, j).y, matrix[i][j], radius);
  }
}

function restart(){
  
}

function frame() {
  if (!gameEnd){
    if (shouldRedraw) {
      draw_grid();
      match();
      shouldRedraw = false;
    }
  }
  else restart();
  window.requestAnimationFrame(frame);
}

function onclickbutton() {
  document.getElementById("buttoncontainer").style.display = 'none';
  init_grid();
  window.requestAnimationFrame(frame); 
}