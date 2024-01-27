const canvas = document.getElementById("canvas");
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;
const ctx = canvas.getContext("2d");

let width = canvas.offsetWidth;
let height = canvas.offsetHeight;
let left = false;
let right = false;

let obstacles = [];
let nextObstacles = [];

const player = {
    x: .5,
    y: .5,
    width: .1,
    height: .1,
    velX: 0,
    velY: 0
}
start();

document.addEventListener("keydown", (event) =>{
    if(event.code == "ArrowRight" || event.code == "KeyD"){
        right = true;
    }
    else if (event.code == "ArrowLeft" || event.code == "KeyA"){
        left = true;
    }
})

document.addEventListener("keyup", (event) =>{
    if(event.code == "ArrowRight" || event.code == "KeyD"){
        right = false;
    }
    else if (event.code == "ArrowLeft" || event.code == "KeyA"){
        left = false;
    }
})

//this is the physics.game loop
let lastRender = 0
function gameLoop(timestamp) {
    let delta = timestamp - lastRender;
  
    update(delta / 1000);
    draw();
  
    lastRender = timestamp;
    window.requestAnimationFrame(gameLoop);
}
window.requestAnimationFrame(gameLoop); //starts the game loop

function start(){
    for(let i = 0; i < 5; i++){
        obstacles.push({
            x: Math.random(),
            y: Math.random(),
            width: Math.random() * .2 + .1,
            height: .05
        })
        nextObstacles.push({
            x: Math.random(),
            y: Math.random(),
            width: Math.random() * .2 + .1,
            height: .05
        })
    }
}

const gravity = 1;
const bounceForce = 1;
const movementSpeed = 20;
function update(delta){
    //move with arrow key
    if(left){
        player.velX = -movementSpeed * delta;
    }
    if (right){
        player.velX = movementSpeed * delta;
    }

    //gravity on player
    player.velY += gravity * delta;

    //check for collision
    let collisionTop = false;
    let collisionBottom = false;
    let aLeft = player.x * width;
    let aRight = player.x * width + player.width * width;
    let aTop = player.y * height;
    let aBottom = player.y * height + player.height * width + 1;

    for(let i = 0; i < obstacles.length; i++){
        let bLeft = obstacles[i].x * width;
        let bRight = obstacles[i].x * width + obstacles[i].width * width;
        let bTop = obstacles[i].y * height;
        let bBottom = obstacles[i].y * height + obstacles[i].height * height;

        //collision bottom
        if(aBottom > bTop && aBottom < bBottom && (aRight > bLeft && aRight < bRight || aLeft < bRight && aLeft > bLeft)){
            collisionBottom = true;
        }
        //collision top
        if(aTop < bBottom && aTop > bTop && (aRight > bLeft && aRight < bRight || aLeft < bRight && aLeft > bLeft)){
            collisionTop = true;
        }
    }
    if(collisionBottom && player.velY > 0){
        player.velY = Math.max(.8 * player.velY, bounceForce) *-1;
    }
    if(collisionTop && player.velY < 0){
        player.velY = .1;
    }

    //kill player on fallthrough ground
    if(player.y > 1){
        player.x = .5;
        player.y = .5;
        player.velY = 0;
        player.velX = 0;
    }

    //move camera to player
    if(player.y < 0){
        player.y = 1 ;
        obstacles = nextObstacles;
    }
    
    //move player by velocity
    player.y += player.velY * delta;
    player.x += player.velX * delta;
}

function draw(){
    //update canvas dimensions
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    //clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //draw the obstacles
    ctx.fillStyle = "black";
    for(let i = 0; i < obstacles.length; i++){
        let x = obstacles[i].x * width;
        let y = obstacles[i].y * height;
        let w = obstacles[i].width * width;
        let h = obstacles[i].height * height;

        ctx.fillRect(x, y, w, h);
    }

    //draw the player
    ctx.fillStyle = "red";
    ctx.fillRect(player.x * width, player.y * height, player.width * width, player.height * width);

    //draw the player collision detector
    ctx.fillStyle = "yellow";
    ctx.fillRect(player.x * width, player.y * height + player.height * width, player.width * width, 1);

}