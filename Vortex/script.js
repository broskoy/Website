// canvas reference variables
var canvas = document.getElementById('canvas')
var context = canvas.getContext('2d')


// make canvas fit any screen
canvas.width = Math.min(window.innerWidth, window.innerHeight);;
canvas.height = Math.min(window.innerWidth, window.innerHeight);;


// variables of the math
let base = 2; // exponential base by which we multiply every remainder
let mode = 2; // mode to calculate remainders
let maximumMode = 200; // maximum mode where we sto the animation


// for how many frames to pause
let pauseFrames = 60;
let pauseFramesLeft = 0;


// draw the corner text
function drawText() 
{
    // text preferences
    context.fillStyle = '#FFF';
    let fontsize = canvas.width / 12.0;
    context.font = fontsize + 'px monospace';
    let margin = canvas.width * 0.05;

    // draw text left and right
    context.fillText(base, margin, fontsize + margin);
    context.fillText(Math.trunc(mode), canvas.width - 2 * fontsize - margin, fontsize + margin);
}


// draw the central shape
function drawShape() 
{
    // drawing values
    let centerX = canvas.width / 2; // canvas center
    let centerY = canvas.height / 2; // canvas center
    let shapeRadius = 0.4 * canvas.width; // circle radius

    // line preferences
    let alpha = 0.2 + Math.pow(1.01,  base - mode);
    context.strokeStyle = `rgba(0, 255, 140, ${alpha})`;
    context.lineWidth = 2;

    // points  
    for (let digit = 0; digit <= mode; digit++) {
        let radians1 = 2.0 * Math.PI / mode * digit;
        let radians2 = 2.0 * Math.PI / mode * ((digit * base) % mode);

        // rotate by 90 degrees up
        radians1 -= Math.PI / 2;
        radians2 -= Math.PI / 2;

        // convert to pixel coordinates
        let x1 = Math.cos(radians1) * shapeRadius;
        let y1 = Math.sin(radians1) * shapeRadius;
        let x2 = Math.cos(radians2) * shapeRadius;
        let y2 = Math.sin(radians2) * shapeRadius;

        context.beginPath();
        context.moveTo(centerX + x1, centerY + y1);
        context.lineTo(centerX + x2, centerY + y2);
        context.stroke();
    }

    // circle
    context.beginPath();
    context.arc(centerX, centerY, shapeRadius, 0, 2 * Math.PI);
    context.stroke();
}


// ensures there is a big pause between drawings
function pauseFrame()
{
    if (0 < pauseFramesLeft) 
    {
        pauseFramesLeft--;
        window.requestAnimationFrame(pauseFrame);
    }
    else 
    {
        window.requestAnimationFrame(animateFrame);
    }
}


// update the canvas
function animateFrame() 
{   
    // if animation has ended
    if (maximumMode < mode) 
    {
        document.getElementById("reload").style.visibility = 'visible';
        return;
    }
    else
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawShape();
        drawText();
        mode++;
        pauseFramesLeft = Math.floor(pauseFrames * (0.05 + Math.pow(1.06,  base - mode)));

        window.requestAnimationFrame(pauseFrame);
    }
}


// hide the panel and start the canvas animation
function onclickbutton() {
    document.getElementById("canvas").style.visibility = 'visible';
    document.getElementById("inputcontainer").style.visibility = 'hidden';
    base = parseInt(document.getElementById("slider").value);
    mode = base;

    window.requestAnimationFrame(animateFrame);
}


// update the value displayed under the slider
function sliderChanged(event) {
    let element = document.getElementById("slider-label");
    element.textContent = event.target.value;
}


// trigger when reload button is clicked
function reloadClicked() {
    document.getElementById("inputcontainer").style.visibility = 'visible';

    base = 2;
    mode = base;
    document.getElementById("slider").value = base;
    document.getElementById("slider-label").textContent = base;

    pauseFrames = 60;
    pauseFramesLeft = 0;
    document.getElementById("canvas").style.visibility = 'hidden';
    document.getElementById("reload").style.visibility = 'hidden';
}