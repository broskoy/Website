var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d')

// full canvas
canvas.width = Math.min(window.innerWidth, window.innerHeight);;
canvas.height = Math.min(window.innerWidth, window.innerHeight);;

let E = 2; // eponential base
// const B = 10; // numeral base - not used
let m = E;
let M = E;


// draw the corner text
function drawText() 
{
    // text preferences
    ctx.fillStyle = '#FFF';
    let fontsize = canvas.width / 12.0;
    ctx.font = fontsize + 'px monospace';
    let margin = canvas.width * 0.05;

    // draw text left and right
    ctx.fillText(E, margin, fontsize + margin);
    ctx.fillText(Math.trunc(m), canvas.width - 2 * fontsize - margin, fontsize + margin);
}


// draw the central shape
function drawShape() 
{
    // drawing values
    let centerX = canvas.width / 2; // canvas center
    let centerY = canvas.height / 2; // canvas center
    let shapeRadius = 0.4 * canvas.width; // circle radius

    // line preferences
    let alpha = 0.2 + Math.pow(1.01, -m + E);
    ctx.strokeStyle = `rgba(0, 255, 140, ${alpha})`;
    ctx.lineWidth = 2;

    // points  
    for (var i = 0; i <= M; i++) {
        let radians1 = 2.0 * Math.PI / m * i;
        let radians2 = 2.0 * Math.PI / m * ((i * E) % m);

        // rotate by 90 degrees up
        radians1 -= Math.PI / 2;
        radians2 -= Math.PI / 2;

        // convert to pixel coordinates
        let x1 = Math.cos(radians1) * shapeRadius;
        let y1 = Math.sin(radians1) * shapeRadius;
        let x2 = Math.cos(radians2) * shapeRadius;
        let y2 = Math.sin(radians2) * shapeRadius;

        ctx.beginPath();
        ctx.moveTo(centerX + x1, centerY + y1);
        ctx.lineTo(centerX + x2, centerY + y2);
        ctx.stroke();
    }

    // circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, shapeRadius, 0, 2 * Math.PI);
    ctx.stroke();
}


let stopFrames = 60;
let stopFramesLeft = 0;


function frame() 
{
    if (M < m) {
        while(true) {

        }    
    }

    if (0 < stopFramesLeft) 
    {
        // it is waiting
        stopFramesLeft--;
    }
    else 
    {
        // update the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawShape();
        drawText();
        m++;
        stopFramesLeft = Math.floor(stopFrames * (0.05 + Math.pow(1.05, -m + E)));
    }

    window.requestAnimationFrame(frame);
}


// 
function onclickbutton() {
    document.getElementById("inputcontainer").style.display = 'none';
    E = parseInt(document.getElementById("slider1").value);
    M = parseInt(document.getElementById("slider2").value);
    m = E;

    window.requestAnimationFrame(frame);
}


// update the value displayed under the slider
function slider1changed(ev) {
    let el = document.getElementById("slider1_value")
    el.textContent = ev.target.value;
}


// update the value displayed under the slider
function slider2changed(ev) {
    let el = document.getElementById("slider2_value")
    el.textContent = ev.target.value;
}


// TODO: add a button to restart beck to homescreen

// TODO: add fancy compute button and slider

// TODO: 