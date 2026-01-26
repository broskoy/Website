export {}

let canvas = document.getElementById('star') as HTMLCanvasElement;
let ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

// the canvas is a square
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = Math.min(window.innerWidth, window.innerHeight);

// this means the diameter is 80% of the canvas
let polygonRadius = canvas.width * 0.4;

// margin for text
let margin  = canvas.width * 0.05;

// vertices of current polygon
let vertices = 3;

let animationConstant = 100; // for how many frames to move
let pauseConstant = 40; // for how many frames to pause

let animationFramesLeft = animationConstant; // how many frames are left
let pauseFramesLeft = pauseConstant; // how many frames are left

let stellation = 1; // is continuous making the animation smooth
let stellationIncrement = 1 / animationConstant; // every frame increases stellation


function drawPolygon() 
{
    // line preferences
    ctx.strokeStyle = '#0FA';
    ctx.lineWidth = 4;
    ctx.beginPath();

    // goes through all points
    for (var chunkNumber = 0; chunkNumber < vertices; chunkNumber++) 
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
    ctx.fillStyle = '#FFF';
    let fontsize = canvas.width / 12.0; // size of font
    ctx.font = fontsize + 'px monospace'; // convert to string
    ctx.fillText(vertices.toString(), margin, fontsize + margin);
    ctx.fillText(stellation.toString(), canvas.width - fontsize - margin, fontsize + margin);
}

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
        // switch to animating
        animationFramesLeft = animationConstant;
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
        // after a final animation increase polygon
        if (vertices <= stellation + 0.1) 
            increasePolygon();

        // switch to pausing
        pauseFramesLeft = pauseConstant;
        window.requestAnimationFrame(pauseFrame);
    }
}

// start on pause because it gives a break
window.requestAnimationFrame(pauseFrame);