const boidsContainer = document.getElementById("boids-container");
const boidsLeftElement = document.getElementById("boidsLeft");
const timeElapsedElement = document.getElementById("timeElapsed");
const highscoreElement = document.getElementById("highscore");
const titleElement = document.getElementById("title");

//constants
const boidAvoidVision = 15; //how much vision each boid has to avoid other boids
const boidUserVision = 200; //how far the boid can see the user
const boidUserAvoidFactor = .001 //how hard the boid moves to avoid the user
const boidAlignVision = 100;
const avoidFactor = .05; // how harsh boids move to avoid eachother
const matchingFactor = .05; // how much boids move to align with other boids veolocities
const centeringFactor = .0005; //how much boids move towards the center of mass of other boids
const turnFactor = .2;
const userTurnFactor = .5;
const speedFactor = 450;
const userSpeedFactor = 450;

const numberOfBoids = 200;

//starting variables
let boids;
let timer;
let user;
let user2;
let gameRunning;
let width;
let height;
let userJoystick;
let user2Joystick;
startGame();

//GAME DIMENSIONS
//ASPECT RATIO OF 16:9
//width of 1920
//height of 1080

//game loop
let lastRender = 0;
function gameLoop(timestamp) {
    let delta = timestamp - lastRender;
  
    update(delta / 1000);
  
    lastRender = timestamp;
    window.requestAnimationFrame(gameLoop);
}

//functions
//TODO is to use delta in calculations
//used pseudocode from https://people.ece.cornell.edu/land/courses/ece4760/labs/s2021/Boids/Boids.html#:~:text=Boids%20is%20an%20artificial%20life,very%20simple%20set%20of%20rules.
function update(delta){
    //calculate stuff
    boids.forEach(boid => {
        //steer away from very nearby boids
        //align velocity with kinda nearby boids
        //loop through every boid
        let xDist = 0;
        let yDist = 0
        let avgXDir = 0;
        let avgYDir = 0;
        let avgXPos = 0;
        let avgYPos = 0;
        let boidsInSight = 0;
        boids.forEach(otherBoid => {
            //skip over itself
            if(boid == otherBoid)
                return;
            //seperation
            const dist = Math.sqrt(Math.pow((boid.positionX - otherBoid.positionX),2) + Math.pow((boid.positionY - otherBoid.positionY),2));
            if(dist < boidAvoidVision){
                xDist += boid.positionX - otherBoid.positionX;
                yDist += boid.positionY - otherBoid.positionY;
            }
            //alignment
            if(dist < boidAlignVision){
                avgXDir += otherBoid.velocityX;
                avgYDir += otherBoid.velocityY;
                avgXPos += otherBoid.positionX;
                avgYPos += otherBoid.positionY;
                boidsInSight++;
            }
        });

        //seperation
        boid.velocityX += xDist * avoidFactor;
        boid.velocityY += yDist * avoidFactor;
        normalizeDirection(boid)

        if(boidsInSight > 0){
            //alignment
            avgXDir /= boidsInSight;
            avgYDir /= boidsInSight;
            boid.velocityX += (avgXDir - boid.velocityX) * matchingFactor;
            boid.velocityY += (avgYDir - boid.velocityY) * matchingFactor;
            normalizeDirection(boid);

            //cohesion
            avgXPos /= boidsInSight;
            avgYPos /= boidsInSight;
            boid.velocityX += (avgXPos - boid.positionX) * centeringFactor;
            boid.velocityY += (avgYPos - boid.positionY) * centeringFactor;
            normalizeDirection(boid);

        }

        //if out of bounds move in bounds
        if(boid.positionX > 1920)
            boid.velocityX -= turnFactor;
        if(boid.positionX < 0)
            boid.velocityX += turnFactor;
        if(boid.positionY > 1080)
            boid.velocityY -= turnFactor;
        if(boid.positionY < 0)
            boid.velocityY += turnFactor;

        normalizeDirection(boid);

        //if near user1 move away
        let userDist = Math.sqrt(Math.pow((boid.positionX - user.positionX),2) + Math.pow((boid.positionY - user.positionY),2)) - user.size/2 - 7.5;
        if( userDist < boidUserVision){
            //remove boid if too close
            if(userDist <= 0){
                user.size++;
                boids.splice(boids.indexOf(boid), 1);
                boid.remove();
                return;
            }

            //move away from cursor
            xDist = boid.positionX - user.positionX;
            yDist = boid.positionY - user.positionY;

            boid.velocityX += xDist * boidUserAvoidFactor;
            boid.velocityY += yDist * boidUserAvoidFactor;
            normalizeDirection(boid);
        }

        //if near user2 move away
        let user2Dist = Math.sqrt(Math.pow((boid.positionX - user2.positionX),2) + Math.pow((boid.positionY - user2.positionY),2)) - user2.size/2 - 7.5;
        if( user2Dist < boidUserVision){
            //remove boid if too close
            if(user2Dist <= 0){
                user2.size++;
                boids.splice(boids.indexOf(boid), 1);
                boid.remove();
                return;
            }

            //move away from cursor
            xDist = boid.positionX - user2.positionX;
            yDist = boid.positionY - user2.positionY;

            boid.velocityX += xDist * boidUserAvoidFactor;
            boid.velocityY += yDist * boidUserAvoidFactor;
            normalizeDirection(boid);
        }

        //move according to direction
        let deltaX = boid.velocityX * delta * speedFactor;

        let deltaY = boid.velocityY * delta * speedFactor;
        boid.positionX += deltaX;

        boid.positionY += deltaY;
    });

    //update user
    console.log(user.velocityX, user.velocityY);
    user.positionX += user.velocityX * userSpeedFactor * delta;
    user.positionY += user.velocityY * userSpeedFactor * delta;

    user2.positionX += user2.velocityX * userSpeedFactor * delta;
    user2.positionY += user2.velocityY * userSpeedFactor * delta;
    
    //update boid positions in the div
    updateBoidDivPositions();

    //update text
    if(boids.length > 0)
        updateText();
    else if(gameRunning){
        endGame();
    }
}

function normalizeDirection(boid){
    const magnitiude = Math.sqrt(boid.velocityX * boid.velocityX + boid.velocityY * boid.velocityY)
    if(magnitiude > 0){
        boid.velocityX /= magnitiude;
        boid.velocityY /= magnitiude;
    }
}

function generateBoids(n){
    for(let i = 0; i < n; i++){
        const boid = document.createElement('div');
        boid.className = "boid";

        //give boid a random position
        boid.positionX = Math.floor(Math.random() * 1920);
        boid.positionY = Math.floor(Math.random() * 1080);

        boid.velocityX = Math.random();
        boid.velocityY = Math.random();

        //add boid to boids
        boidsContainer.appendChild(boid);
        boids.push(boid)
    }
}

function generateUser() {
    //user 1
    user = document.createElement('div');
    user.className = 'user';

    user.positionX = 1920 / 2;
    user.positionY = 1080 / 2;

    user.velocityX = 0;
    user.velocityY = 0;

    user.size = 15;

    boidsContainer.appendChild(user);

    //user 2
    user2 = document.createElement('div');
    user2.className = 'user2';

    user2.positionX = 1920 / 2;
    user2.positionY = 1080 / 2;

    user2.velocityX = 0;
    user2.velocityY = 0;

    user2.size = 15;

    boidsContainer.appendChild(user2);
}

function getHighscore(){
    let highscore = localStorage.getItem("boidHighscore");
    if(highscore == null){
        highscoreElement.innerText = "None";
    }else{
        highscore = JSON.parse(highscore);
        highscoreElement.innerText = highscore["hs"].toFixed(1) + "s";
    }
}

function endGame(){
    //update text
    updateText();
    //high score stuff
    let score = ((Date.now() - timer) / 1000)
    let highscore = localStorage.getItem("boidHighscore");
    if(highscore == null){
        highscore = {"hs" : score};
    }else{
        highscore = JSON.parse(highscore);
    }

    if (score < highscore["hs"]){
        highscore = {"hs" : score}; 
    }
    highscoreElement.innerText = highscore["hs"].toFixed(1) + "s";
    localStorage.setItem("boidHighscore", JSON.stringify(highscore));

    gameRunning = false;

    //display click to play again
    clickAgainText = document.createElement('p');
    clickAgainText.innerText = "Click to play again";
    clickAgainText.style.textAlign = "center";
    boidsContainer.appendChild(clickAgainText);
    document.addEventListener("click", (e) => {
        boidsContainer.innerHTML = "";
        resetGame();
    }, { once: true });
}

function startGame(){
    //prompt for orientation

    //display instructions
    const img = document.createElement('img');
    img.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/A_black_image.jpg/640px-A_black_image.jpg";
    img.id = "instruction-image";
    document.body.appendChild(img);


    //starts game on click
    document.addEventListener("click", (e) => {
        document.body.removeChild(img);
        resetGame();
        addEventListeners();
        window.requestAnimationFrame(gameLoop); //starts the game loop
    }, { once: true });
}

function resetGame(){
    boids = [];
    timer = Date.now();
    user = undefined;
    user2 = undefined;
    userJoystick = undefined;
    user2Joystick = undefined;
    generateBoids(numberOfBoids);
    generateUser();
    getHighscore();
    gameRunning = true;
    width = undefined;
    height = undefined;
    resizeWindow();
}

function updateBoidDivPositions(){
    boids.forEach(boid => {
        boid.style.left = (boid.positionX / 1920) * width + "px";
        boid.style.bottom = (boid.positionY / 1080) * height + "px";
        boid.style.width =(15 / 1080) * height;
        boid.style.height = (15 / 1080) * height;
    });

    //do user
    user.style.left = (user.positionX / 1920) * width + "px";
    user.style.bottom = (user.positionY / 1080) * height + "px";
    user.style.width = (user.size / 1080) * height;
    user.style.height = (user.size / 1080) * height;

    user2.style.left = (user2.positionX / 1920) * width + "px";
    user2.style.bottom = (user2.positionY / 1080) * height + "px";
    user2.style.width = (user2.size / 1080) * height;
    user2.style.height = (user2.size / 1080) * height;
}

function updateText(){
    if(boidsLeftElement.innerText != boids.length)
        boidsLeftElement.innerText = boids.length;

    let timeElapsed = ((Date.now() - timer) / 1000).toFixed(1);
    if (timeElapsedElement.innerText != timeElapsed)
        timeElapsedElement.innerText = timeElapsed + "s";
}

function addEventListeners(){
    window.addEventListener("resize", resizeWindow);

    document.addEventListener("keydown", (e) => {
        if(e.code == 'KeyA'){
            user.a = true;
        }
        if(e.code == 'KeyW'){
            user.w = true;
        }
        if(e.code == 'KeyD'){
            user.d = true;
        }
        if(e.code == 'KeyS'){
            user.s = true;
        }
        if(e.code == 'ArrowLeft'){
            user2.a = true;
        }
        if(e.code == 'ArrowUp'){
            user2.w = true;
        }
        if(e.code == 'ArrowRight'){
            user2.d = true;
        }
        if(e.code == 'ArrowDown'){
            user2.s = true;
        }

        user.velocityX = (user.a ? -1 : 0) + (user.d ? 1 : 0);
        user.velocityY = (user.s ? -1 : 0) + (user.w ? 1 : 0);
        
        user2.velocityX = (user2.a ? -1 : 0) + (user2.d ? 1 : 0);
        user2.velocityY = (user2.s ? -1 : 0) + (user2.w ? 1 : 0);

        //if out of bounds move in bounds
        if(user.positionX > 1920)
            user.velocityX = -userTurnFactor;
        if(user.positionX < 0)
            user.velocityX = userTurnFactor;
        if(user.positionY > 1080)
            user.velocityY = -userTurnFactor;
        if(user.positionY < 0)
            user.velocityY = userTurnFactor;
        if(user2.positionX > 1920)
            user2.velocityX = -userTurnFactor;
        if(user2.positionX < 0)
            user2.velocityX = userTurnFactor;
        if(user2.positionY > 1080)
            user2.velocityY = -userTurnFactor;
        if(user2.positionY < 0)
            user2.velocityY = userTurnFactor;

        normalizeDirection(user);
        normalizeDirection(user2);
    });
    document.addEventListener("keyup", (e) => {
        if(e.code == 'KeyA'){
            user.a = false;
        }
        if(e.code == 'KeyW'){
            user.w = false;
        }
        if(e.code == 'KeyD'){
            user.d = false;
        }
        if(e.code == 'KeyS'){
            user.s = false;
        }
        if(e.code == 'ArrowLeft'){
            user2.a = false;
        }
        if(e.code == 'ArrowUp'){
            user2.w = false;
        }
        if(e.code == 'ArrowRight'){
            user2.d = false;
        }
        if(e.code == 'ArrowDown'){
            user2.s = false;
        }

        user.velocityX = (user.a ? -1 : 0) + (user.d ? 1 : 0);
        user.velocityY = (user.s ? -1 : 0) + (user.w ? 1 : 0);

        user2.velocityX = (user2.a ? -1 : 0) + (user2.d ? 1 : 0);
        user2.velocityY = (user2.s ? -1 : 0) + (user2.w ? 1 : 0);

        //if out of bounds move in bounds
        if(user.positionX > 1920)
            user.velocityX = -userTurnFactor;
        if(user.positionX < 0)
            user.velocityX = userTurnFactor;
        if(user.positionY > 1080)
            user.velocityY = -userTurnFactor;
        if(user.positionY < 0)
            user.velocityY = userTurnFactor;
        if(user2.positionX > 1920)
            user2.velocityX = -userTurnFactor;
        if(user2.positionX < 0)
            user2.velocityX = userTurnFactor;
        if(user2.positionY > 1080)
            user2.velocityY = -userTurnFactor;
        if(user2.positionY < 0)
            user2.velocityY = userTurnFactor;

        normalizeDirection(user);
        normalizeDirection(user2);
    });

    document.addEventListener("touchstart", (e) => {
        let curTouch = e.touches[e.touches.length - 1];
        let xpos = curTouch.clientX;
        if(xpos < window.innerWidth / 2){
            if(userJoystick == undefined){
                userJoystick = {
                    identifier: curTouch.identifier,
                    x: curTouch.clientX,
                    y: curTouch.clientY
                }
            }
        }else{
            if(user2Joystick == undefined){
                user2Joystick = {
                    identifier: curTouch.identifier,
                    x: curTouch.clientX,
                    y: curTouch.clientY
                }
            }
        }

    });

    document.addEventListener("touchmove", (e) => {
        for(let i = 0; i < e.touches.length; i++){
            if(userJoystick != undefined && e.touches[i].identifier == userJoystick.identifier){
                user.velocityX = e.touches[i].clientX - userJoystick.x;
                user.velocityY = userJoystick.y - e.touches[i].clientY;
                normalizeDirection(user);
                userJoystick.x = e.touches[i].clientX;
                userJoystick.y = e.touches[i].clientY;
            }
            else if(user2Joystick != undefined && e.touches[i].identifier == user2Joystick.identifier){
                user2.velocityX = e.touches[i].clientX - user2Joystick.x;
                user2.velocityY = user2Joystick.y - e.touches[i].clientY;
                normalizeDirection(user2);
                user2Joystick.x = e.touches[i].clientX;
                user2Joystick.y = e.touches[i].clientY;
            }
        }
    });

    document.addEventListener("touchend", (e) => {
        for(let i = 0; i < e.touches.length; i++){
            if(userJoystick != undefined && e.touches[i].identifier == userJoystick.identifier){
                userJoystick = undefined;
            }
            else if(user2Joystick != undefined && e.touches[i].identifier == user2Joystick.identifier){
                user2Joystick = undefined;
            }
        }
    });
}

function resizeWindow(e){
    console.log("resize");
    width = Math.min(window.innerWidth, (window.innerHeight - titleElement.offsetHeight) * (16/9)) * .95;
    height = width * (9/16);

    //draw background area
    boidsContainer.style.width = width;
    boidsContainer.style.height = height;
}