const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const accuracyText = document.getElementById("accuracy-text");

ctx.canvas.width = canvas.offsetWidth;
ctx.canvas.height = canvas.offsetHeight;

const canvasTop = ctx.canvas.getBoundingClientRect().top;
let lastX = undefined;
let lastY = undefined;

let shapePoints = [];
let xMin = Number.MAX_SAFE_INTEGER;
let xMax = 0;
let yMin = Number.MAX_SAFE_INTEGER;
let yMax = 0;
let drawingStartTime = undefined;

let drawing = false;
let drawingTimeout = undefined;
const strokeRadius = 5;

if (localStorage.getItem("circle") == undefined)
    localStorage.setItem("circle",JSON.stringify(0));
if (localStorage.getItem("square") == undefined)
    localStorage.setItem("square",JSON.stringify(0));
if (localStorage.getItem("triangle") == undefined)
    localStorage.setItem("triangle",JSON.stringify(0));

ctx.lineWidth = strokeRadius;

canvas.onmousedown = (e) => {onMouseDown(e)}
canvas.addEventListener("touchstart", (e) => {onMouseDown(e.touches[0])})

canvas.onmouseup = () => {
    if(drawing)
        endDrawing();
}

canvas.addEventListener("touchend", () => {
    if(drawing)
        endDrawing();
});

addEventListener("mousemove", (e) => {moveMouse(e)});
addEventListener("touchmove", (e) => {moveMouse(e.touches[0])});

function drawCircle(x, y){
    ctx.lineTo(x, y);
    ctx.stroke();
}

function onMouseDown(e){
    accuracyText.innerText = "0% accurate";
    drawingTimeout = setTimeout(() => {
        if(drawing)
            endDrawing();
    }, 3000);
    drawingStartTime = Date.now();
    shapePoints = []
    lastX = e.clientX;
    lastY = e.clientY - canvasTop;
    xMin = Number.MAX_SAFE_INTEGER;
    xMax = 0;
    yMin = Number.MAX_SAFE_INTEGER;
    yMax = 0;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.moveTo(e.clientX, e.clientY - canvasTop);
    ctx.beginPath();
    drawing = true
    
}

function moveMouse(e){
    if(drawing){
        accuracyText.innerText = ((3000 - (Date.now() - drawingStartTime)) /1000).toFixed(2) + " seconds remaining";
        if (Math.sqrt(Math.pow(lastX - e.clientX, 2) + Math.pow(lastY - (e.clientY - canvasTop), 2)) > 5){
            drawCircle(e.clientX, e.clientY - canvasTop, strokeRadius);
            shapePoints.push({x: e.clientX, y: e.clientY - canvasTop});
            xMin = Math.min(xMin, e.clientX);
            yMin = Math.min(yMin, e.clientY - canvasTop);
            xMax = Math.max(xMax, e.clientX);
            yMax = Math.max(yMax, e.clientY - canvasTop);
            lastX = e.clientX;
            lastY = e.clientY - canvasTop;
        }
    }
}

function endDrawing(){
    clearTimeout(drawingTimeout);

    ctx.closePath();
    drawing = false;
    
    //check if shape is complete
    if(shapePoints.length < 2)
        return;

    if (Math.sqrt(Math.pow(shapePoints[0].x - shapePoints[shapePoints.length - 1].x, 2) + 
        Math.pow(shapePoints[0].y - shapePoints[shapePoints.length - 1].y, 2)) > 40){
            accuracyText.innerText = "Incomplete shape";
            return;
      }
    //calculate shape score
    const middleX = (xMin + xMax) / 2;
    const middleY = (yMax + yMin) / 2;
    
    //circle
    //equations for shape
    //get avg distance from points to shape
    let distance = 0;
    let r = (xMax - xMin) / 2;
    for(let i = 0; i < shapePoints.length; i++){
        distance += Math.abs(r - Math.sqrt(Math.pow(shapePoints[i].x - middleX, 2) + Math.pow(shapePoints[i].y - middleY,2)));
    }
    const circleAccuracy = 1 - (distance / shapePoints.length) / r;
    
    //square
    //get point to left, right, top, bottom. Average distance, and use that to draw the square
    const width = (xMax - xMin + yMax - yMin) / 2;
    distance = 0;
    for(let i = 0; i < shapePoints.length; i++){
        distance += Math.min(Math.abs(shapePoints[i].x - (middleX - width / 2)), 
                             Math.abs(shapePoints[i].x - (middleX + width / 2)),
                             Math.abs(shapePoints[i].y - (middleY + width / 2)),
                             Math.abs(shapePoints[i].y - (middleY - width / 2)));
    }
    const squareAccuracy = 1 - (distance / shapePoints.length) / (width / 2);

    //triangle
    //get point to left, right, top. Average distance, and use that to draw the square
    distance = 0;
    const sideLength = (xMax -xMin + 
        Math.sqrt(Math.pow(xMin - (xMax + xMin) / 2,2) + Math.pow(yMin - yMax,2)) +
        Math.sqrt(Math.pow(xMax - (xMax + xMin) / 2,2) + Math.pow(yMax - yMin,2))) / 3;
    for(let i = 0; i < shapePoints.length; i++){
        //line 1
        let x1 = middleX - sideLength / 2;
        let x2 = middleX;
        let x3 = shapePoints[i].x;
        let y1 = middleY + Math.sqrt(3) * sideLength / 4;
        let y2 = middleY - Math.sqrt(3) * sideLength / 4;
        let y3 = shapePoints[i].y;

        let dx = x2 - x1;
        let dy = y2 - y1;
        let det = dx*dx + dy*dy;
        let a = (dy*(y3-y1)+dx*(x3-x1))/det;
        let newX = x1+a*dx;
        let newY = y1+a*dy;
        let distance1 = Math.sqrt(Math.pow(newX - shapePoints[i].x, 2) + Math.pow(newY - shapePoints[i].y, 2));

        //line 2
        x1 = middleX;
        x2 = middleX + sideLength / 2;
        x3 = shapePoints[i].x;
        y1 = middleY - Math.sqrt(3) * sideLength / 4
        y2 = middleY + Math.sqrt(3) * sideLength / 4;
        y3 = shapePoints[i].y;

        dx = x2 - x1;
        dy = y2 - y1;
        det = dx*dx + dy*dy;
        a = (dy*(y3-y1)+dx*(x3-x1))/det;
        newX = x1+a*dx;
        newY = y1+a*dy;
        distance2 = Math.sqrt(Math.pow(newX - shapePoints[i].x, 2) + Math.pow(newY - shapePoints[i].y, 2));

        //line 3
        x1 = middleX + sideLength / 2;;
        x2 = middleX - sideLength / 2;
        x3 = shapePoints[i].x;
        y1 = middleY + Math.sqrt(3) * sideLength / 4;
        y2 = middleY + Math.sqrt(3) * sideLength / 4;
        y3 = shapePoints[i].y;

        dx = x2 - x1;
        dy = y2 - y1;
        det = dx*dx + dy*dy;
        a = (dy*(y3-y1)+dx*(x3-x1))/det;
        newX = x1+a*dx;
        newY = y1+a*dy;
        distance3 = Math.sqrt(Math.pow(newX - shapePoints[i].x, 2) + Math.pow(newY - shapePoints[i].y, 2));

        distance += Math.min(distance1, distance2, distance3);
    }
        const triangleAccuracy = 1 - (distance / shapePoints.length) / (sideLength / 2);

    //draw example shape
    if(circleAccuracy >= squareAccuracy && circleAccuracy >= triangleAccuracy){
        if(r < 125)
            accuracyText.innerText = "Too Small";
        else{
            localStorage.setItem("circle", JSON.stringify(Math.max(parseFloat(JSON.parse(localStorage.getItem("circle"))), circleAccuracy)));

            accuracyText.innerText = "Circle is " + (circleAccuracy * 100).toFixed(1) + "% accurate";
            accuracyText.innerText += " | High Score: " + (parseFloat(JSON.parse(localStorage.getItem("circle"))) * 100).toFixed(1) + "%";
            ctx.strokeStyle = "red";
            ctx.beginPath();
            ctx.arc(middleX, middleY, r, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.closePath();
        }
    }else if(squareAccuracy >= circleAccuracy && squareAccuracy >= triangleAccuracy){
        if(width < 250)
            accuracyText.innerText = "Too Small";
        else{
            localStorage.setItem("square", JSON.stringify(Math.max(parseFloat(JSON.parse(localStorage.getItem("square"))), squareAccuracy)));

            accuracyText.innerText = "Square is " + (squareAccuracy * 100).toFixed(1) + "% accurate";
            accuracyText.innerText += " | High Score: " + (parseFloat(JSON.parse(localStorage.getItem("square"))) * 100).toFixed(1) + "%";
            ctx.strokeStyle = "red";
            ctx.beginPath();
            ctx.strokeRect(middleX - width / 2, middleY - width / 2, width, width)
            ctx.closePath();
        }
    }else{
        if(sideLength < 250){
            accuracyText.innerText = "Too Small"
        }
        else{
            localStorage.setItem("triangle", JSON.stringify(Math.max(parseFloat(JSON.parse(localStorage.getItem("triangle"))), triangleAccuracy)));

            accuracyText.innerText = "Triangle is " + (triangleAccuracy * 100).toFixed(1) + "% accurate";
            accuracyText.innerText += " | High Score: " + (parseFloat(JSON.parse(localStorage.getItem("triangle"))) * 100).toFixed(1) + "%";
            ctx.strokeStyle = "red";
            ctx.beginPath();
            ctx.moveTo(middleX - sideLength / 2, middleY + Math.sqrt(3) * sideLength / 4);
            ctx.lineTo(middleX, middleY - Math.sqrt(3) * sideLength / 4);
            ctx.lineTo(middleX + sideLength / 2, middleY + Math.sqrt(3) * sideLength / 4);
            ctx.lineTo(middleX - sideLength / 2, middleY + Math.sqrt(3) * sideLength / 4);
            ctx.stroke();
            ctx.closePath();
        }
    }
    ctx.strokeStyle = "black";
}