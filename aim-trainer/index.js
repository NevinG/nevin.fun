const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const timer = document.getElementById("timer");
const targetNumInput = document.getElementById("targetNumInput");
const targetSizeInput = document.getElementById("targetSizeInput");

ctx.canvas.width = canvas.offsetWidth;
ctx.canvas.height = canvas.offsetHeight;

let targetRadius = 25;
let targetsToClick = 30;

let targetsLeft = targetsToClick;
let gameStarted = false;
let timerInterval = undefined;
let timeElapsed = 0.0;

let currentTarget = {
    x: undefined,
    y: undefined,
}

//draw "click to start"
resetGame();

targetNumInput.onchange = (e) => {
    e.target.value = Math.max(1, Math.floor(e.target.value));
    targetsToClick = e.target.value;
}

targetSizeInput.onchange = (e) => {
    e.target.value = Math.max(1, Math.floor(e.target.value));
    targetRadius = e.target.value;
}

canvas.onclick = (e)=>{
    //check if you need to start the game
    if(!gameStarted){ //game hasn't started
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        gameStarted = true;
        targetsLeft = targetsToClick;
        //draw first target
        let randX = Math.floor(Math.random() * (ctx.canvas.width - 2* targetRadius) + targetRadius);
        let randY = Math.floor(Math.random() * (ctx.canvas.height - 2* targetRadius) + targetRadius);
        currentTarget.x = randX;
        currentTarget.y = randY;
        drawTarget(randX, randY, targetRadius);

        //start timer
        timerInterval = setInterval(()=>{
            timeElapsed += .01;
            if((Math.floor(timeElapsed * 100) / 100) * 10 % 1 == 0){
                timer.innerHTML = (Math.floor(timeElapsed * 100) / 100);
            }
        }, 10);
    }
    else{ //game is started
        //check if click hit a target
        const distance = Math.sqrt(Math.pow(e.offsetX - currentTarget.x,2) + Math.pow(e.offsetY - currentTarget.y, 2));
 
        if(distance <= targetRadius){
            //hit target
            targetsLeft--;
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            //check if done
            if(targetsLeft == 0){
                resetGame();
            }else{ //draw next target
                let randX = Math.floor(Math.random() * (ctx.canvas.width - 2* targetRadius) + targetRadius);
                let randY = Math.floor(Math.random() * (ctx.canvas.height - 2* targetRadius) + targetRadius);
                currentTarget.x = randX;
                currentTarget.y = randY;
                drawTarget(randX, randY, targetRadius);
            }
        }
    }
}

function resetGame(){
    clearInterval(timerInterval);
    ctx.font = "64px courier";
    ctx.fillStyle = "black";
    ctx.strokeStyle = "black";
    ctx.fillText("Click to start", ctx.canvas.width / 2 - 32 * 7, ctx.canvas.height / 2, ctx.canvas.width);
    timerInterval = undefined;
    targetsLeft = targetsToClick;
    gameStarted = false;
    timer.innerHTML = (Math.floor(timeElapsed * 100) / 100);
    timeElapsed = 0;
}

function drawTarget(x, y, r){
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.fillStyle = "red";
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    ctx.arc(x, y, r*.75, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.fillStyle = "red";
    ctx.arc(x, y, r*.5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    ctx.arc(x, y, r*.25, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

//resizing
function sizeCanvas() {
    ctx.canvas.width = canvas.offsetWidth;
    ctx.canvas.height = canvas.offsetHeight;
    resetGame();
}

new ResizeObserver(sizeCanvas).observe(canvas.parentElement);


