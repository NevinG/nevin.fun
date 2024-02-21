const boidsContainer = document.getElementById("boids-container");
const boidsLeftElement = document.getElementById("boidsLeft");
const timeElapsedElement = document.getElementById("timeElapsed");
const highscoreElement = document.getElementById("highscore");
const titleElement = document.getElementById("title");
const userJoystickElement = document.getElementById("user-joystick");
const user2JoystickElement = document.getElementById("user2-joystick");

//detect if mobile
//from https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
window.mobileCheck = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  };

//constants
const boidAvoidVision = 15; //how much vision each boid has to avoid other boids
const boidUserVision = 200; //how far the boid can see the user
const boidUserAvoidFactor = .001 //how hard the boid moves to avoid the user
const boidAlignVision = 200;
const avoidFactor = .05; // how harsh boids move to avoid eachother
const matchingFactor = .05; // how much boids move to align with other boids veolocities
const centeringFactor = .0005; //how much boids move towards the center of mass of other boids
const turnFactor = .2;
const userTurnFactor = 450;
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
let lastRender;
startGame();

//GAME DIMENSIONS
//ASPECT RATIO OF 16:9
//width of 1920
//height of 1080

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

            //move away from user
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

            //move away from user
            xDist = boid.positionX - user2.positionX;
            yDist = boid.positionY - user2.positionY;

            boid.velocityX += xDist * boidUserAvoidFactor;
            boid.velocityY += yDist * boidUserAvoidFactor;
            normalizeDirection(boid);
        }

        //move according to direction
        normalizeDirection(boid);
        let deltaX = boid.velocityX * delta * speedFactor;
        let deltaY = boid.velocityY * delta * speedFactor;
        boid.positionX += deltaX;
        boid.positionY += deltaY;
    });

    //update user and user2
    let userIsBeingControlled = user.a || user.w || user.s || user.d || userJoystick != undefined;
    let user2IsBeingControlled = user2.a || user2.w || user2.s || user2.d || user2Joystick != undefined;
    //if out of bounds move in bounds
    user.returnVelocityX = 0;
    user.returnVelocityY = 0;
    user2.returnVelocityX = 0;
    user2.returnVelocityY = 0;
    if(user.positionX > 1920)
        user.returnVelocityX = -userTurnFactor;
    if(user.positionX < 0)
        user.returnVelocityX = userTurnFactor;
    if(user.positionY > 1080)
        user.returnVelocityY = -userTurnFactor;
    if(user.positionY < 0)
        user.returnVelocityY = userTurnFactor;
    if(user2.positionX > 1920)
        user2.returnVelocityX = -userTurnFactor;
    if(user2.positionX < 0)
        user2.returnVelocityX = userTurnFactor;
    if(user2.positionY > 1080)
        user2.returnVelocityY = -userTurnFactor;
    if(user2.positionY < 0)
        user2.returnVelocityY = userTurnFactor;

    user.positionX += user.velocityX * userSpeedFactor * delta;
    user.positionY += user.velocityY * userSpeedFactor * delta;
    if(!userIsBeingControlled){
        user.positionX += user.returnVelocityX * delta;
        user.positionY += user.returnVelocityY * delta;
    }

    user2.positionX += user2.velocityX * userSpeedFactor * delta;
    user2.positionY += user2.velocityY * userSpeedFactor * delta;
    if(!user2IsBeingControlled){
        user2.positionX += user2.returnVelocityX * delta;
        user2.positionY += user2.returnVelocityY * delta;
    }
    
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

        boid.velocityX = Math.random() * -1 + .5;
        boid.velocityY = Math.random() * -1 + .5;

        //add boid to boids
        boidsContainer.appendChild(boid);
        boids.push(boid)
    }
}

function generateUser() {
    //user 1
    user = document.createElement('div');
    user.className = 'user';

    user.positionX = 1920 * (1/4);
    user.positionY = 1080 / 2;

    user.velocityX = 0;
    user.velocityY = 0;

    user.size = 25;

    boidsContainer.appendChild(user);

    //user 2
    user2 = document.createElement('div');
    user2.className = 'user2';

    user2.positionX = 1920 * (3/4);
    user2.positionY = 1080 / 2;

    user2.velocityX = 0;
    user2.velocityY = 0;

    user2.size = 25;

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
    let imgSrc = "keyboard-controls.png"
    if(window.mobileCheck())
        imgSrc = "mobile-controls.png"

    //display instructions
    const img = document.createElement('img');
    img.src = imgSrc;
    img.id = "instruction-image";

    //check for rotation
    const checkForRotation = () => {
        if (window.innerHeight > window.innerWidth){
            img.src = "rotate.png";
        }else{
            img.src = imgSrc;
        }
    }
    window.addEventListener("resize", checkForRotation);
    checkForRotation();

    document.body.appendChild(img);


    //starts game on click
    document.addEventListener("click", (e) => {
        window.removeEventListener("resize", checkForRotation);
        document.body.removeChild(img);
        resetGame();
        addEventListeners();
        window.requestAnimationFrame(gameLoop); //starts the game loop
    }, { once: true });
}

function resetGame(){
    boids = [];
    timer = Date.now();
    lastRender = undefined;  
    user = undefined;
    user2 = undefined;
    userJoystick = undefined;
    user2Joystick = undefined;
    gameRunning = true;
    width = undefined;
    height = undefined;

    resizeWindow();
    getHighscore();
    generateBoids(numberOfBoids);
    generateUser();
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
                userJoystickElement.style.display = "block";
                userJoystickElement.style.left = curTouch.clientX; 
                userJoystickElement.style.top = curTouch.clientY; 
                userJoystickElement.children[0].style.left = 0;
                userJoystickElement.children[0].style.top = 0;
            }
        }else{
            if(user2Joystick == undefined){
                user2Joystick = {
                    identifier: curTouch.identifier,
                    x: curTouch.clientX,
                    y: curTouch.clientY
                }
                user2JoystickElement.style.display = "block";
                user2JoystickElement.style.left = curTouch.clientX;
                user2JoystickElement.style.top = curTouch.clientY;
                user2JoystickElement.children[0].style.left = 0;
                user2JoystickElement.children[0].style.top = 0;
            }
        }

    });

    document.addEventListener("touchmove", (e) => {
        for(let i = 0; i < e.touches.length; i++){
            if(userJoystick != undefined && e.touches[i].identifier == userJoystick.identifier){
                user.velocityX = e.touches[i].clientX - userJoystick.x;
                user.velocityY = userJoystick.y - e.touches[i].clientY;
                normalizeDirection(user);

                //move nub on joystick
                userJoystickElement.children[0].style.left = user.velocityX * 15;
                userJoystickElement.children[0].style.top = -user.velocityY * 15;
            }
            else if(user2Joystick != undefined && e.touches[i].identifier == user2Joystick.identifier){
                user2.velocityX = e.touches[i].clientX - user2Joystick.x;
                user2.velocityY = user2Joystick.y - e.touches[i].clientY;
                normalizeDirection(user2);

                //move nub on joystick
                user2JoystickElement.children[0].style.left = user2.velocityX * 15;
                user2JoystickElement.children[0].style.top = -user2.velocityY * 15;
            }
        }
    });

    document.addEventListener("touchend", (e) => {
        let userIsThere = false;
        let user2IsThere = false;
        for(let i = 0; i < e.touches.length; i++){
            if(userJoystick != undefined && e.touches[i].identifier == userJoystick.identifier){
                userIsThere = true; 
            }
            else if(user2Joystick != undefined && e.touches[i].identifier == user2Joystick.identifier){
                user2IsThere = true;
            }
        }
        if(!userIsThere){
            userJoystick = undefined;
            user.velocityX = 0;
            user.velocityY = 0;

            userJoystickElement.style.display = "none";
        }
        if(!user2IsThere){
            user2Joystick = undefined;
            user2.velocityX = 0;
            user2.velocityY = 0;

            user2JoystickElement.style.display = "none";
        }
    });
}

function resizeWindow(e){
    width = Math.min(window.innerWidth, (window.innerHeight - titleElement.offsetHeight) * (16/9)) * .95;
    height = width * (9/16);

    //draw background area
    boidsContainer.style.width = width;
    boidsContainer.style.height = height;
}