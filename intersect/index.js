const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const scoreSpan = document.getElementById("score");
const hsSpan = document.getElementById("high-score");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let edgeLength = Math.min(window.innerHeight, window.innerWidth);

const CIRCLE_PERIMETER = Math.sqrt(Math.pow(.25, 2) + Math.pow(.25, 2)) * 2 * Math.PI;

window.onresize = () =>{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    edgeLength = Math.min(window.innerHeight, window.innerWidth);
}

let polygon = [];
let rotation = -Math.PI / 4;
let score = 0;
let hs = localStorage.getItem("intersect") ?? JSON.stringify({"hs": 0});
hs = JSON.parse(hs)["hs"];

let lastRender = null;
reset();

//game loop
function gameLoop(timestamp) {
    if(!lastRender){
        lastRender = timestamp
        window.requestAnimationFrame(gameLoop);
        return;
    }

    let delta = timestamp - lastRender;

    if(delta > 1000){ //prevent huge jumps when script isn't rendered
        lastRender = timestamp
        window.requestAnimationFrame(gameLoop);
        return;
    }

    update(delta / 1000);
    render();
  
    lastRender = timestamp;
    window.requestAnimationFrame(gameLoop);
}
window.requestAnimationFrame(gameLoop);

function update(delta){
    rotation -= 1 * delta * (1 + (.1 * score));
    if(rotation <= -Math.PI * 2){
        rotation += (Math.PI * 2);
    }
}

function render(){
    //draw current polygon
    context.strokeStyle = "rgba(255,0,0,.5)";
    context.fillStyle = "rgba(255,0,0,.25)";
    context.clearRect(0,0, window.innerWidth, window.innerHeight);
    context.beginPath();
    context.moveTo(window.innerWidth/2 + polygon[0][0] * edgeLength, window.innerHeight/2 - polygon[0][1] * edgeLength);
    for(let i = 1; i< polygon.length; i++){
        context.lineTo(window.innerWidth/2 + polygon[i][0] * edgeLength, window.innerHeight/2 - polygon[i][1] * edgeLength);
    }
    context.lineTo(window.innerWidth/2 + polygon[0][0] * edgeLength, window.innerHeight/2 - polygon[0][1] * edgeLength);
    context.closePath();
    context.fill();
    context.stroke();

    //draw rotating polygon
    //(x,y)↦(x′,y′)=(xcosθ−ysinθ,xsinθ+ycosθ)
    context.strokeStyle = "rgba(0,200,0,1)";
    context.fillStyle = "rgba(0,255,0,.25)";
    context.beginPath();
    context.moveTo(window.innerWidth/2 + (polygon[0][0] * Math.cos(rotation) - polygon[0][1]*Math.sin(rotation)) * edgeLength, window.innerHeight/2 - (polygon[0][0]*Math.sin(rotation) + polygon[0][1]*Math.cos(rotation)) * edgeLength);
    for(let i = 1; i< polygon.length; i++){
        context.lineTo(window.innerWidth/2 + (polygon[i][0] * Math.cos(rotation) - polygon[i][1]*Math.sin(rotation)) * edgeLength, window.innerHeight/2 - (polygon[i][0]*Math.sin(rotation) + polygon[i][1]*Math.cos(rotation)) * edgeLength);
    }
    context.lineTo(window.innerWidth/2 + (polygon[0][0] * Math.cos(rotation) - polygon[0][1]*Math.sin(rotation)) * edgeLength, window.innerHeight/2 - (polygon[0][0]*Math.sin(rotation) + polygon[0][1]*Math.cos(rotation)) * edgeLength);
    context.closePath();
    context.fill();
    context.stroke();
}

document.onmousedown = (e) => cutPolygon();
document.onkeydown = (e) => {
    if(e.code == "Space"){
        cutPolygon();
    }
}


function cutPolygon(){
    //only cut polygon if there is a difference
    //give margin of error

    let deg = Math.round((rotation * -1) / (Math.PI / 2));
    let diff = Math.abs((rotation * -1) - (deg* (Math.PI / 2)));

    if(diff > .05){
        rotatedPolygon = JSON.parse(JSON.stringify(polygon));
        rotatedPolygon = rotatedPolygon.map(x => [
            (x[0] * Math.cos(rotation) - x[1]*Math.sin(rotation)),
            (x[0]*Math.sin(rotation) + x[1]*Math.cos(rotation))
        ]);
    
        polygon = polygonClipping.intersection([polygon], [rotatedPolygon])[0][0];
        polygon.pop();
    }
    //add score
    score += 1;
    scoreSpan.innerText = `Score: ${score}`;

    //high score
    if(score > hs){
        hs = score;
        localStorage.setItem("intersect", JSON.stringify({"hs": hs}));
    }

    hsSpan.innerText = `High Score: ${hs}`;

    //check if game over
    if(perimeter(polygon) - CIRCLE_PERIMETER <= .001){
        //check for highscore
        reset();
    }
}

function perimeter(a){
    sum = 0;
    for(let i = 1; i < a.length; i++){
        sum += Math.sqrt(Math.pow(a[i][0] - a[i-1][0],2) + Math.pow(a[i][1] - a[i-1][1],2));
    }
    sum += Math.sqrt(Math.pow(a[0][0] - a[a.length - 1][0],2) + Math.pow(a[0][1] - a[a.length - 1][1],2));
    return sum;
}

function reset(){
    polygon = [];
    rotation = -Math.PI / 4;
    score = 0;
    hs = localStorage.getItem("intersect") ?? JSON.stringify({"hs": 0});
    hs = JSON.parse(hs)["hs"];

    scoreSpan.innerText = `Score: ${score}`;
    lastRender = null;
    
    //initial polygon
    polygon.push([0,.5]);
    polygon.push([.5,0]);
    polygon.push([0, -.5]);
    polygon.push([-.5,0]);
}