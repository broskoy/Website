/*
Some explanations

The order of steps when drawing is:
round -> pause -> (animate -> round -> pause) * vertices

Because animate is not exact roud must come after and
pause does not draw therefore rounding must happen before it

The code compensates for frame rate but it must be set manually
since there is no way to ask the system for it
*/

// getting the canvas element
let canvas = document.getElementById('star');
let ctx = canvas.getContext('2d');

// the canvas is a square
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = Math.min(window.innerWidth, window.innerHeight);

// this means the diameter is 80% of the canvas
let polygonRadius = canvas.width * 0.4;

// margin for text
let margin = canvas.width * 0.05;

// vertices of current polygon
let vertices = 3;

let FPS = 60;

// for how many frames to move or pause
let animationFrames = 1.5 * FPS; 
let pauseFrames = 0.5 * FPS;

// how many frames are left
let animationFramesLeft = animationFrames; 
let pauseFramesLeft = pauseFrames;

// a continuous value making the animation smooth
let stellation = 0; 
let stellationIncrement = 1 / animationFrames;


// draw the central polygon
function drawPolygon() 
{
    // line preferences
    ctx.strokeStyle = '#0FA';
    ctx.lineWidth = 4;
    ctx.beginPath();

    // goes through all points
    for (let chunkNumber = 0; chunkNumber < vertices; chunkNumber++) 
    {
        // dividing the circle into equal parts
        let chunkLength = 2.0 * Math.PI / vertices;

        // calculate where the points are
        let radians1 = chunkLength * chunkNumber;
        let radians2 = chunkLength * (chunkNumber + stellation);

        // ourn radians 90 degrees to begin up
        radians1 -= Math.PI / 2;
        radians2 -= Math.PI / 2;

        // convert from radians to coordinates
        let x1 = Math.cos(radians1) * polygonRadius;
        let y1 = Math.sin(radians1) * polygonRadius;
        let x2 = Math.cos(radians2) * polygonRadius;
        let y2 = Math.sin(radians2) * polygonRadius;

        // points offset to center on canvas
        let offset = canvas.width / 2;
        ctx.moveTo(offset + x1, offset + y1);
        ctx.lineTo(offset + x2, offset + y2);
    }

    // can do all lines at once
    ctx.stroke(); 
}


// draw the corner text
function drawText() 
{
    // setting parameters
    ctx.fillStyle = '#FFF'; // color of text
    let fontsize = canvas.width / 12.0; // size of font
    ctx.font = fontsize + 'px monospace'; // convert to string

    // write numbers left and right
    ctx.fillText(vertices.toString(), margin, fontsize + margin);
    ctx.fillText(Math.trunc(stellation).toString(), canvas.width - fontsize - margin - 100, fontsize + margin);
}


// increases the vertex number and loops it
function increasePolygon() 
{
    // loop if polygon is greater 16
    if (vertices == 16)
        vertices = 3;  
    else
        vertices++;
    
    // stellation is always reset
    stellation = 0;
}


// rounds stellation to fix errors
function roundingFrame() {
    stellation = Math.round(stellation);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawText();
    drawPolygon();

    window.requestAnimationFrame(pauseFrame);
}


// draws a frame of pause
function pauseFrame() 
{
    if (0 < pauseFramesLeft) 
    {
        // case when we wait
        pauseFramesLeft--;
        window.requestAnimationFrame(pauseFrame);
    }
    else 
    {
        // after a final pause increase polygon
        if (vertices <= stellation + 0.1) 
            increasePolygon();

        // switch to animating
        animationFramesLeft = animationFrames;
        window.requestAnimationFrame(animationFrame);
    }
}

// draws a frame of animation
function animationFrame() 
{
    // only clear in the begining of frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw the shape
    drawPolygon();
    drawText();

    // change state
    if  (0 < animationFramesLeft) 
    {
        // case when we still animate
        stellation += stellationIncrement;
        animationFramesLeft--;
        window.requestAnimationFrame(animationFrame);
    } 
    else 
    {
        // switch to pausing
        pauseFramesLeft = pauseFrames;
        window.requestAnimationFrame(roundingFrame);
    }
}

// start on rounding because it goes to pause
window.requestAnimationFrame(roundingFrame);