const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const killScreen = document.getElementById("kill-screen");
const scoreDistanceDisplay = document.getElementById("score-distance-display");
const scoreTimeDisplay = document.getElementById("score-time-display");
const copyLinkButton = document.getElementById("copy-link-button");
const playAgainButton = document.getElementById("play-again-button");
const highscoreDistance = document.getElementById("highscore-distance");
const highscoreTime = document.getElementById("highscore-time");


let width = Math.min(window.innerWidth, window.innerHeight / 2);
let height = width * 2;
canvas.style.width = width;
canvas.style.height = height;
canvas.width = width;
canvas.height = height;
let left = false;
let right = false;

let sectionsComplete = 0;
let obstacles = [];
let obstacleSections = [0];
let sectionChanges = [100]; //indicies where we should change the background;
let backgroundColors = [[255, 255, 255]]; //the colors for the background
let floorHeight = 0;

let timer = 0;
let alive = true; //when equal to false it stops the game loop

//FOR CORDINATES AND OBSTACLES GAME IS 100 by 200
const player = {
    x: 50,
    y: 100, //default is 100
    width: 10,
    height: 10,
    velX: 0,
    velY: 0
}
let cameraX = 50;
let cameraY = 100;
start();

document.addEventListener("keydown", (event) => {
    if (event.code == "ArrowRight" || event.code == "KeyD") {
        right = true;
    }
    else if (event.code == "ArrowLeft" || event.code == "KeyA") {
        left = true;
    }
})

document.addEventListener("keyup", (event) => {
    if (event.code == "ArrowRight" || event.code == "KeyD") {
        right = false;
    }
    else if (event.code == "ArrowLeft" || event.code == "KeyA") {
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
    if(alive)
        window.requestAnimationFrame(gameLoop);
}
window.requestAnimationFrame(gameLoop); //starts the game loop

function start() {
    //generate the three sections
    generateSection(1);
    generateSection(2);
    generateSection(3);
}

const gravity = -80;
const bounceForce = 100;
const movementSpeed = 80;
function update(delta) {
    timer += delta;

    //move with arrow key
    if (left) {
        player.velX = -movementSpeed;
    }
    if (right) {
        player.velX = movementSpeed;
    }
    if (!left && !right) {
        player.velX = 0;
    }

    //gravity on player
    player.velY += gravity * delta;

    //check for collision
    let collisionTop = false;
    let collisionBottom = false;
    let aLeft = player.x - player.width / 2;
    let aRight = player.x + player.width / 2;
    let aTop = player.y + player.height / 2;
    let aBottom = player.y - player.height / 2;

    let shouldKill = false;
    let YCollision = 0;
    for (let i = 0; i < obstacles.length; i++) {
        let bLeft = obstacles[i].x - obstacles[i].width / 2;
        let bRight = obstacles[i].x + obstacles[i].width / 2;
        let bTop = obstacles[i].y + obstacles[i].height / 2;
        let bBottom = obstacles[i].y - obstacles[i].height / 2;

        //collision bottom
        if (aBottom <= bTop && aBottom > bBottom && (aRight >= bLeft && aRight <= bRight || aLeft <= bRight && aLeft >= bLeft || aLeft <= bLeft && aRight >= bRight)) {
            collisionBottom = true;
            YCollision = bTop + player.height / 2;
            if (obstacles[i].type && obstacles[i].type.includes("touch")) {
                shouldKill = true;
                break;
            }
            else if (obstacles[i].type && obstacles[i].type.includes("break")) {
                obstacles[i].health--;
                if (obstacles[i].health <= 0) {
                    obstacles.splice(i, 1);
                    i--;
                    continue;
                }
            }
        }
        //collision top
        if (aTop >= bBottom && aTop < bTop && (aRight >= bLeft && aRight <= bRight || aLeft <= bRight && aLeft >= bLeft || aLeft <= bLeft && aRight >= bRight)) {
            collisionTop = true;
            YCollision = bBottom - player.height / 2;
            if (obstacles[i].type && obstacles[i].type.includes("touch")) {
                shouldKill = true;
                break;
            }
            else if (obstacles[i].type && obstacles[i].type.includes("break")) {
                obstacles[i].health--;
                if (obstacles[i].health <= 0) {
                    obstacles.splice(i, 1);
                    i--;
                    continue;
                }
            }
        }

        //update shooters
        if (obstacles[i].type && obstacles[i].type.includes("shooter")) {
            obstacles[i].timer -= delta;
            if (obstacles[i].timer <= 0) {
                //shoot new shot
                obstacles.push({
                    type: "shot " + obstacles[i].shotType,
                    velX: obstacles[i].shootDirection == "left" ? -50 : 50,
                    x: obstacles[i].x,
                    y: obstacles[i].y,
                    width: 5,
                    height: 5,
                })
                //reset timer
                obstacles[i].timer = obstacles[i].coolDown;
            }
        }
        if (obstacles[i].type && obstacles[i].type.includes("shot")) {
            //move the shot left or right
            obstacles[i].x += obstacles[i].velX * delta;
            //remove shot if off screen
            if (obstacles[i].x < -5) {
                obstacles.splice(i, 1);
                i--;
            }
            else if (obstacles[i].x > 105) {
                obstacles.splice(i, 1);
                i--;
            }
        }
    }
    if (collisionBottom && player.velY < 0) {
        player.y = YCollision;
        player.velY = Math.max(-.8 * player.velY, bounceForce);
    }
    if (collisionTop && player.velY > 0) {
        player.y = YCollision;
        player.velY = -5;
    }

    //kill player on fallthrough ground
    if (shouldKill || player.y < cameraY - 100)
        killPlayer();

    //move camera to player
    cameraY = Math.max(cameraY, player.y)

    //move player by velocity
    player.y += player.velY * delta;
    player.x += player.velX * delta;

    //move player to other side
    if(player.x < 0){
        player.x += 100;
    }
    else if(player.x > 100){
        player.x -= 100;
    }

    //update backgroundColor & remove old obstacles
    if (sectionChanges.length > 2 && cameraY > sectionChanges[1]) {
        //increment sections counter
        sectionsComplete++;

        //remove a section
        sectionChanges.splice(0, 1);
        backgroundColors.splice(0, 1);
        obstacles.splice(0,obstacleSections[0] - 1);
        obstacleSections.splice(0,1);

        //generate new section
        if(sectionsComplete > 1){
            generateSection(sectionsComplete + 2);
        }
    }

}

function draw() {
    //clear the canvas
    ctx.fillStyle = getGradientBackground();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //draw the obstacles
    for (let i = 0; i < obstacles.length; i++) {
        let x = (obstacles[i].x - obstacles[i].width / 2 + 50 - cameraX) / 100 * width;
        let y = height - (obstacles[i].y + obstacles[i].height / 2 + 100 - cameraY) / 200 * height;
        let w = obstacles[i].width / 100 * width;
        let h = obstacles[i].height / 200 * height;

        //get color of obstacle
        if (obstacles[i].type) {
            if (obstacles[i].type.includes("touch")) {
                ctx.fillStyle = "yellow";
            } else if (obstacles[i].type.includes("break")) {
                if (obstacles[i].health == 2) {
                    ctx.fillStyle = "gray";
                } else if (obstacles[i].health == 1) {
                    ctx.fillStyle = "darkgray";
                }
            } else if (obstacles[i].type.includes("shooter")) {
                ctx.fillStyle = "blue";
            } else {
                ctx.fillStyle = "black"
            }
        } else {
            ctx.fillStyle = "black";
        }

        //draw the obstacle
        ctx.fillRect(x, y, w, h);
    }

    //draw the player
    ctx.fillStyle = "red";
    ctx.fillRect((player.x - player.width / 2 + 50 - cameraX) / 100 * width, height - (player.y + player.height / 2 + 100 - cameraY) / 200 * height, player.width / 100 * width, player.height / 200 * height);

    //draw the score
    ctx.fillStyle = "black"
    ctx.font = "bold 48px monospace"
    let text = (parseInt(cameraY) / 100).toFixed(1) + "m";
    let textWidth = 26.39 * text.length;
    let textHeight = 56;
    ctx.fillText(text, (width - textWidth) / 2, textHeight, width);
}

function killPlayer() {
    killScreen.style.display = "flex";
    alive = false;

    //get highscore
    let hs = localStorage.getItem("hs");
    if(hs){
        hs = JSON.parse(hs);
        if(hs.date != (new Date()).toISOString().substring(0,10)){
            hs = {
                "distance": 0,
                "time": 0,
                "date": (new Date()).toISOString().substring(0,10),
                };
        }
    }
    else
        hs = {
            "distance": 0,
            "time": 0,
            "date": (new Date()).toISOString().substring(0,10),
            };
    
    //update highscore
    if(parseFloat((parseInt(cameraY) / 100).toFixed(1)) > parseFloat(hs.distance)){
        hs.distance = parseFloat((parseInt(cameraY) / 100).toFixed(1));
        hs.time = parseFloat(timer.toFixed(1));
    }
    else if(parseFloat((parseInt(cameraY) / 100).toFixed(1)) == parseFloat(hs.distance)){
        if(timer < parseFloat(hs.time)){
            hs.time = parseFloat(timer.toFixed(1));
        }
    }
    //save highscore
    localStorage.setItem("hs", JSON.stringify(hs));


    //populate the killscreen
    scoreDistanceDisplay.innerText = (parseInt(cameraY) / 100).toFixed(1);
    scoreTimeDisplay.innerText = timer.toFixed(1);
    highscoreDistance.innerText = hs.distance;
    highscoreTime.innerText = hs.time;

    const link = `https://nevin.fun/platform-jump/sharegame?hs=${encodeURIComponent(btoa(JSON.stringify(hs)))}`;
    copyLinkButton.onclick = () => {
        navigator.clipboard.writeText(link);
        copyLinkButton.innerText = "Copied";
    };
    playAgainButton.onclick = () => {
        location.reload();
    }
}

function getGradientBackground() {
    const gradPercent = ((cameraY - sectionChanges[0]) / (sectionChanges[1] - sectionChanges[0]))
    return `rgb(${backgroundColors[0][0] + gradPercent * (backgroundColors[1][0] - backgroundColors[0][0])}, 
                ${backgroundColors[0][1] + gradPercent * (backgroundColors[1][1] - backgroundColors[0][1])}, 
                ${backgroundColors[0][2] + gradPercent * (backgroundColors[1][2] - backgroundColors[0][2])}`;
}

function generateSection(sectionNum) {
    let oldObstacleAmount = obstacles.length;
    switch (sectionNum) {
        case 1:
            for (let i = 0; i < 10; i++) {
                //generate random obstacles 2-3 for this floor
                let obstaclesPerFloor = Math.floor(Math.random() * 2) + 2;
                for (let j = 0; j < obstaclesPerFloor; j++) {
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

            //generate second 10 floors
            for (let i = 0; i < 10; i++) {
                //generate random obstacles 1 for this floor
                let obstaclesPerFloor = 1;
                for (let j = 0; j < obstaclesPerFloor; j++) {
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
            //change background color and add section
            obstacleSections.push(obstacles.length - oldObstacleAmount);
            sectionChanges.push(floorHeight);
            backgroundColors.push([45, 49, 92])
            break;
        case 2:
            //ADD SOME TOUCH OBSTACLES
            //generate third 20 floors
            for (let i = 0; i < 20; i++) {
                //generate random obstacles 2 for this floor
                let obstaclesPerFloor = 2;
                for (let j = 0; j < obstaclesPerFloor; j++) {
                    obstacles.push({
                        x: Math.floor(Math.random() * 100),
                        y: floorHeight,
                        width: Math.floor(Math.random() * 10) + 15,
                        height: 10,
                    })
                }
                //add a touch obstacle
                if ((i + 1) % 5 == 0) {
                    obstacles.push({
                        type: "touch",
                        x: Math.floor(Math.random() * 100),
                        y: floorHeight + Math.floor(Math.random() * 11) + 15,
                        width: 10,
                        height: 10,
                    })
                }
                //generate the next floor height
                floorHeight += Math.floor(Math.random() * 10 + 50);
            }
            //change background color and add section
            obstacleSections.push(obstacles.length - oldObstacleAmount);
            sectionChanges.push(floorHeight);
            backgroundColors.push([222, 73, 200])
            break;
        case 3:
            //ADD SOME BREAKING FLOORS
            //generate fourth 20 floors
            for (let i = 0; i < 20; i++) {
                //generate random 1-2 obstacles for this floor
                let obstaclesPerFloor = Math.floor(Math.random() * 2) + 1;
                for (let j = 0; j < obstaclesPerFloor; j++) {
                    obstacles.push({
                        //50% chance to be a breaking floor or normal
                        type: Math.floor(Math.random() * 2) == 1 ? "break" : undefined,
                        health: 2,
                        x: Math.floor(Math.random() * 100),
                        y: floorHeight,
                        width: Math.floor(Math.random() * 10) + 25,
                        height: 10,
                    })
                }

                //generate the next floor height
                floorHeight += Math.floor(Math.random() * 30 + 30);
            }
            //change background color and add section
            obstacleSections.push(obstacles.length - oldObstacleAmount);
            sectionChanges.push(floorHeight);
            backgroundColors.push([10, 73, 200]);
            break;
        case 4:
            //ADD SOME TOUCH OBSTACLES && BREAKING FLOORS
            //generate fifth 20 floors
            for (let i = 0; i < 20; i++) {
                //generate random 1-3 obstacles for this floor
                let obstaclesPerFloor = Math.floor(Math.random() * 3) + 1;
                for (let j = 0; j < obstaclesPerFloor; j++) {
                    obstacles.push({
                        //50% chance to be a breaking floor or normal
                        type: Math.floor(Math.random() * 2) == 1 ? "break" : undefined,
                        health: 2,
                        x: Math.floor(Math.random() * 100),
                        y: floorHeight,
                        width: Math.floor(Math.random() * 10) + 15,
                        height: 10,
                    })
                }
                //add a touch obstacle
                if ((i + 1) % 5 == 0) {
                    obstacles.push({
                        type: "touch",
                        x: Math.floor(Math.random() * 100),
                        y: floorHeight + Math.floor(Math.random() * 11) + 15,
                        width: 10,
                        height: 10,
                    })
                }
                //generate the next floor height
                floorHeight += Math.floor(Math.random() * 20 + 25);
            }
            //change background color and add section
            obstacleSections.push(obstacles.length - oldObstacleAmount);
            sectionChanges.push(floorHeight);
            backgroundColors.push([222, 40, 10])
            break;
        case 5:
            //ADD SOME TOUCH OBSTACLES
            //generate sixth 20 floors
            for (let i = 0; i < 20; i++) {
                //generate random obstacles 2 for this floor
                let obstaclesPerFloor = 2;
                for (let j = 0; j < obstaclesPerFloor; j++) {
                    obstacles.push({
                        x: Math.floor(Math.random() * 100),
                        y: floorHeight,
                        width: Math.floor(Math.random() * 10) + 15,
                        height: 10,
                    })
                }

                //add a shooter obstacle
                if ((i + 1) % 5 == 0) {
                    obstacles.push({
                        type: "shooter",
                        shotType: "touch",
                        coolDown: 1.5,
                        timer: 0,
                        shootDirection: Math.floor(Math.random() * 2) == 1 ? "left" : "right",
                        x: Math.floor(Math.random() * 100),
                        y: floorHeight + Math.floor(Math.random() * 11) + 15,
                        width: 10,
                        height: 10,
                    })
                }

                //generate the next floor height
                floorHeight += Math.floor(Math.random() * 10 + 50);
            }
            //change background color and add section
            obstacleSections.push(obstacles.length - oldObstacleAmount);
            sectionChanges.push(floorHeight);
            backgroundColors.push([10, 200, 200])
            break;
        case 6:
            //ADD SOME TOUCH, BREAK, SHOOT OBSTACLES
            //generate seventh 20 floors
            for (let i = 0; i < 20; i++) {
                //generate random 2-3 obstacles for this floor
                let obstaclesPerFloor = Math.floor(Math.random() * 2) + 2;
                for (let j = 0; j < obstaclesPerFloor; j++) {
                    obstacles.push({
                        //50% chance to be a breaking floor or normal
                        type: Math.floor(Math.random() * 2) == 1 ? "break" : undefined,
                        health: 2,
                        x: Math.floor(Math.random() * 100),
                        y: floorHeight,
                        width: Math.floor(Math.random() * 10) + 15,
                        height: 10,
                    });
                }
                //add a touch obstacle
                if ((i + 3) % 5 == 0) {
                    obstacles.push({
                        type: "touch",
                        x: Math.floor(Math.random() * 100),
                        y: floorHeight + Math.floor(Math.random() * 11) + 15,
                        width: 10,
                        height: 10,
                    });
                }
                //add a shooter obstacle
                if ((i + 1) % 5 == 0) {
                    obstacles.push({
                        type: "shooter",
                        shotType: "touch",
                        coolDown: 1.5,
                        timer: 0,
                        shootDirection: Math.floor(Math.random() * 2) == 1 ? "left" : "right",
                        x: Math.floor(Math.random() * 100),
                        y: floorHeight + Math.floor(Math.random() * 11) + 15,
                        width: 10,
                        height: 10,
                    });
                }

                //generate the next floor height
                floorHeight += Math.floor(Math.random() * 40 + 20);
            }
            //change background color and add section
            obstacleSections.push(obstacles.length - oldObstacleAmount);
            sectionChanges.push(floorHeight);
            backgroundColors.push([150, 10, 150])
            break;
        case 7:
            //SPECIAL FLOORS SHOT FROM SHOOTER
            //generate eighth 15 floors
            for (let i = 0; i < 15; i++) {
                //add a shooter obstacle
                let left = Math.floor(Math.random() * 2) == 1;
                obstacles.push({
                    type: "shooter",
                    shotType: "",
                    coolDown: Math.floor(Math.random() * 11 + 10) / 10,
                    timer: 0,
                    shootDirection: left ? "left" : "right",
                    x: left ? 105 : -5,
                    y: floorHeight,
                    width: 10,
                    height: 10,
                });

                //add a shooter obstacle
                if ((i + 1) % 3 == 0) {
                    obstacles.push({
                        type: "shooter",
                        shotType: "touch",
                        coolDown: 2,
                        timer: 0,
                        shootDirection: Math.floor(Math.random() * 2) == 1 ? "left" : "right",
                        x: Math.floor(Math.random() * 100),
                        y: floorHeight + Math.floor(Math.random() * 11) + 15,
                        width: 10,
                        height: 10,
                    });
                }

                //generate the next floor height
                floorHeight += Math.floor(Math.random() * 10 + 50);
            }
            //change background color and add section
            obstacleSections.push(obstacles.length - oldObstacleAmount);
            sectionChanges.push(floorHeight);
            backgroundColors.push([30, 180, 200]);
            break;
        default:
            //generate a completely random section
            //generate 20 floors
            for (let i = 0; i < 20; i++) {
                //generate random 1-3 obstacles for this floor
                let obstaclesPerFloor = Math.floor(Math.random() * 3) + 1;
                for (let j = 0; j < obstaclesPerFloor; j++) {
                    obstacles.push({
                        //50% chance to be a breaking floor or normal
                        type: Math.floor(Math.random() * 2) == 1 ? "break" : undefined,
                        health: parseInt(Math.floor(Math.random() * 2) + 1),
                        x: Math.floor(Math.random() * 100),
                        y: floorHeight,
                        width: Math.floor(Math.random() * 10) + 15,
                        height: 10,
                    });
                }
                //add a touch obstacle
                let randomObstacle = Math.floor(Math.random() * 6);
                if (randomObstacle == 0 || randomObstacle == 1) {
                    obstacles.push({
                        type: "touch",
                        x: Math.floor(Math.random() * 100),
                        y: floorHeight + Math.floor(Math.random() * 11) + 15,
                        width: 10,
                        height: 10,
                    });
                }
                //add a shooter obstacle
                else if (randomObstacle == 2 || randomObstacle == 3) {
                    obstacles.push({
                        type: "shooter",
                        shotType: "touch",
                        coolDown: 1.5,
                        timer: 0,
                        shootDirection: Math.floor(Math.random() * 2) == 1 ? "left" : "right",
                        x: Math.floor(Math.random() * 100),
                        y: floorHeight + Math.floor(Math.random() * 11) + 15,
                        width: 10,
                        height: 10,
                    });
                }else if(randomObstacle == 4){
                    //add a shooter obstacle
                    let left = Math.floor(Math.random() * 2) == 1;
                    obstacles.push({
                        type: "shooter",
                        shotType: "",
                        coolDown: Math.floor(Math.random() * 11 + 10) / 10,
                        timer: 0,
                        shootDirection: left ? "left" : "right",
                        x: left ? 105 : -5,
                        y: floorHeight,
                        width: 10,
                        height: 10,
                    });
                }

                //generate the next floor height
                floorHeight += Math.floor(Math.random() * 55 + 10);
            }
            //change background color and add section
            obstacleSections.push(obstacles.length - oldObstacleAmount);
            sectionChanges.push(floorHeight);
            backgroundColors.push([255, 10, 150]);
            break;
    }
}