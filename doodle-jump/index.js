const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let width = Math.min(window.innerWidth, window.innerHeight / 2);
let height = width * 2;
canvas.style.width = width;
canvas.style.height = height;
canvas.width = width;
canvas.height = height;
let left = false;
let right = false;

let obstacles = [];
let backGroundColorChanges = [100] //indicies where we should change the background;
let backgroundColors = [[255,255,255]] //the colors for the background


//FOR CORDINATES AND OBSTACLES GAME IS 100 by 200
const player = {
    x: 50,
    y: 100,
    width: 10,
    height: 10,
    velX: 0,
    velY: 0
}
let cameraX = 50;
let cameraY = 100;
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
    //generate the first 20 floors
    let floorHeight = 0;
    for(let i = 0; i < 20; i++){
        //generate random obstacles 2-3 for this floor
        let obstaclesPerFloor = Math.floor(Math.random() * 2) + 2;
        for(let j = 0; j < obstaclesPerFloor; j++){
            obstacles.push({
                x: Math.floor(Math.random() * 100),
                y: floorHeight,
                width: Math.floor(Math.random() * 10) + 10,
                height: 10,
            })
        }
        
        //generate the next floor height
        floorHeight += Math.floor(Math.random() * 30 + 30);
    }
    //change background color
    backGroundColorChanges.push(floorHeight);
    backgroundColors.push([255, 200, 200])

    //generate second 20 floors
    for(let i = 0; i < 20; i++){
        //generate random obstacles 1-2 for this floor
        let obstaclesPerFloor = Math.floor(Math.random() * 1) + 1;
        for(let j = 0; j < obstaclesPerFloor; j++){
            obstacles.push({
                x: Math.floor(Math.random() * 100),
                y: floorHeight,
                width: Math.floor(Math.random() * 10) + 10,
                height: 10,
            })
        }
        
        //generate the next floor height
        floorHeight += Math.floor(Math.random() * 20 + 40);
    }
    //change background color
    backGroundColorChanges.push(floorHeight);
    backgroundColors.push([200, 255, 200])

    //generate third 20 floors
    for(let i = 0; i < 20; i++){
        //generate random obstacles 1 for this floor
        let obstaclesPerFloor = 1;
        for(let j = 0; j < obstaclesPerFloor; j++){
            obstacles.push({
                x: Math.floor(Math.random() * 100),
                y: floorHeight,
                width: Math.floor(Math.random() * 10) + 10,
                height: 10,
            })
        }
        
        //generate the next floor height
        floorHeight += Math.floor(Math.random() * 10 + 50);
    }

    //change background color
    backGroundColorChanges.push(floorHeight);
    backgroundColors.push([200, 200, 255])

    //generate fourth 20 floors
    for(let i = 0; i < 20; i++){
        //generate random obstacles 1 for this floor
        let obstaclesPerFloor = 1;
        for(let j = 0; j < obstaclesPerFloor; j++){
            obstacles.push({
                x: Math.floor(Math.random() * 100),
                y: floorHeight,
                width: 7,
                height: 10,
            })
        }
        
        //generate the next floor height
        floorHeight += Math.floor(Math.random() * 10 + 50);
    }

    //change background color
    backGroundColorChanges.push(floorHeight);
    backgroundColors.push([200, 255, 255])
}

const gravity = -80;
const bounceForce = 100;
const movementSpeed = 80;
function update(delta){
    //move with arrow key
    if(left){
        player.velX = -movementSpeed;
    }
    if (right){
        player.velX = movementSpeed;
    }
    if(!left && !right){
        player.velX = 0;
    }

    //gravity on player
    player.velY += gravity * delta;

    //check for collision
    let collisionTop = false;
    let collisionBottom = false;
    let aLeft = player.x - player.width / 2;
    let aRight = player.x + player.width / 2;
    let aTop = player.y  + player.height / 2;
    let aBottom = player.y  - player.height / 2;

    for(let i = 0; i < obstacles.length; i++){
        let bLeft = obstacles[i].x - obstacles[i].width / 2;
        let bRight = obstacles[i].x + obstacles[i].width / 2;
        let bTop = obstacles[i].y + obstacles[i].height / 2;
        let bBottom = obstacles[i].y - obstacles[i].height / 2;

        //collision bottom
        if(aBottom <= bTop && aBottom > bBottom && (aRight >= bLeft && aRight <= bRight || aLeft <= bRight && aLeft >= bLeft || aLeft <= bLeft && aRight >= bRight)){
            collisionBottom = true;
        }
        //collision top
        if(aTop >= bBottom && aTop < bTop && (aRight >= bLeft && aRight <= bRight || aLeft <= bRight && aLeft >= bLeft || aLeft <= bLeft && aRight >= bRight)){
            collisionTop = true;
        }
    }
    if(collisionBottom && player.velY < 0){
        player.velY = Math.max(-.8 * player.velY, bounceForce);
    }
    if(collisionTop && player.velY > 0){
        player.velY = .1;
    }

    //kill player on fallthrough ground
    if(player.y < cameraY - 100){
        player.x = 50;
        player.y = 100;
        player.velY = 0;
        player.velX = 0;
    }

    //move camera to player
    cameraY = Math.max(cameraY, player.y)

    //move player by velocity
    player.y += player.velY * delta;
    player.x += player.velX * delta;

    //update backgroundColor
    if(backGroundColorChanges.length > 2 && cameraY > backGroundColorChanges[1]){
        backGroundColorChanges.splice(0,1);
        backgroundColors.splice(0,1);
    }
}

function draw(){
    //clear the canvas
    ctx.fillStyle = getGradientBackground();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //draw the obstacles
    ctx.fillStyle = "black";
    for(let i = 0; i < obstacles.length; i++){
        let x = (obstacles[i].x - obstacles[i].width / 2 + 50 - cameraX) / 100 * width;
        let y = height - (obstacles[i].y + obstacles[i].height / 2 + 100 - cameraY) / 200 * height;
        let w = obstacles[i].width / 100 * width;
        let h = obstacles[i].height / 200 * height;

        ctx.fillRect(x, y, w, h);
    }

    //draw the player
    ctx.fillStyle = "red";
    ctx.fillRect((player.x - player.width / 2 + 50 - cameraX) / 100 * width, height - (player.y + player.height / 2 + 100 - cameraY) / 200 * height, player.width / 100 * width, player.height / 200 * height);
}

function getGradientBackground(){
    const gradPercent = ((cameraY - backGroundColorChanges[0]) / (backGroundColorChanges[1] - backGroundColorChanges[0]))
    return `rgb(${backgroundColors[0][0] +  gradPercent * (backgroundColors[1][0] - backgroundColors[0][0])}, 
                ${backgroundColors[0][1] +  gradPercent * (backgroundColors[1][1] - backgroundColors[0][1])}, 
                ${backgroundColors[0][2] +  gradPercent * (backgroundColors[1][2] - backgroundColors[0][2])}`;
}