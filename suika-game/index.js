const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

// module aliases
var Engine = Matter.Engine,
    Events = Matter.Events,
    Collision = Matter.Collision,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

// create an engine
var engine = Engine.create();

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;
const width = Math.min(canvas.width - 100, canvas.height - 100);
const height = width;

let gameObjects = [];
// create ground and walls
let [obX, obY, obWidth, obHeight] = posTransform(.5, .0125, 1, .1);
let body = Bodies.rectangle(obX, obY, obWidth, obHeight, { isStatic: true });
body.width = obWidth;
body.height = obHeight;
gameObjects.push(body);
[obX, obY, obWidth, obHeight] = posTransform(.025, .5, .05, 1);
body = Bodies.rectangle(obX, obY, obWidth, obHeight, { isStatic: true });
body.width = obWidth;
body.height = obHeight;
gameObjects.push(body);
[obX, obY, obWidth, obHeight] = posTransform(.975, .5, .05, 1);
body = Bodies.rectangle(obX, obY, obWidth, obHeight, { isStatic: true });
body.width = obWidth;
body.height = obHeight;
gameObjects.push(body);

// add all of the bodies to the world
Composite.add(engine.world, gameObjects);

// create runner
var runner = Runner.create();

// run the engine
Runner.run(runner, engine);


function posTransform(x, y, obWidth, obHeight){
    let newX = (canvas.width - width) / 2 +  x * width;
    let newY = canvas.height - (y* height);
    let newWidth = obWidth * width;
    let newHeight = obHeight * height;

    return [newX, newY, newWidth, newHeight]
}

let numOfObjects = 11;
let score = 0;
let balls = [];
let nextBallX = 0;
let ballColors = ["red", "orange", "yellow", "green",
                  "blue", "purple", "indigo", "violet",
                  "pink", "limegreen", "beige", "darkgreen"];
let nextBallSizes = [];
for(let i = 0; i < 5; i++){
    nextBallSizes.push(Math.floor(Math.random() * 5));
}
//generate the nextballobjects for my renderer
let nextBalls = [];
for(let i = 0; i < 5; i++){
    nextBalls.push({
        x: (canvas.width - width) / 2  +width,
        y: height - (i/5 * height),
    })
}
let ballEvolution = [];
for(let i = 0; i < numOfObjects; i++){
    ballEvolution.push({
        x: (canvas.width - width) / 2,
        y: (i/numOfObjects * height),
    })
}

canvas.onclick = (e) => {
    let sizeIndex = nextBallSizes.shift();
    nextBallSizes.push(Math.floor(Math.random() * 5));
    createBall(sizeIndex,nextBallX, canvas.height - height - 30);
}
document.onmousemove = (e) =>{
    nextBallX = Math.min(e.clientX, width + (canvas.width - width) / 2 - .05 *width);
    nextBallX = Math.max(nextBallX, (canvas.width - width) / 2 + .05 * width);
}

Events.on(engine, "collisionStart", (e) => {
    for(let i = 0; i < balls.length; i++){
        for(let j = i + 1; j < balls.length; j++){
            if(Collision.collides(balls[i], balls[j])){
                if(balls[i].sizeIndex == balls[j].sizeIndex){
                    let sizeIndex = balls[i].sizeIndex + 1;
                    let x = (balls[i].position.x + balls[j].position.x) / 2;
                    let y = (balls[i].position.y + balls[j].position.y) / 2;
                    Composite.remove(engine.world, balls[i]);
                    Composite.remove(engine.world, balls[j]);
                    balls.splice(j,1);
                    balls.splice(i,1);
                    i--;

                    //add new ball
                    score += 2 *(sizeIndex)
                    createBall(sizeIndex, x, y)
                    break;
                }
            }
        }
    }
})

function createBall(sizeIndex, x, y){
    score += sizeIndex + 1;
    let radius = (width*.65) * Math.pow(.8164, (numOfObjects - 1) - sizeIndex + 1) / 2;
    let ball = Bodies.circle(x, y, radius);
    ball.sizeIndex = sizeIndex;
    ball.radius = radius;
    balls.push(ball);
    Composite.add(engine.world, [ball]);
}

//this is the physics.game loop
function render() {
    //clear screen
    context.clearRect(0,0,canvas.width, canvas.height);

    //score
    context.fillStyle = "black";
    context.font = "50px monospace";
    let title = `Score:${score}`;
    context.fillText(title, (canvas.width / 2) - (27.5 * title.length) / 2,40);

    //other
    for(let i = 0; i < gameObjects.length; i++){
        context.fillStyle = "black";
        context.fillRect(gameObjects[i].position.x - gameObjects[i].width / 2,
                         gameObjects[i].position.y - gameObjects[i].height / 2,
                         gameObjects[i].width,
                         gameObjects[i].height);
    }
    for(let i = 0; i < balls.length; i++){
        //check for game over
        if(balls[i].position.x < (canvas.width - width) / 2){
            gameOver();
            return;
        }
        if(balls[i].position.x > width + (canvas.width - width) / 2){
            gameOver();
            return;
        }
        context.fillStyle = ballColors[balls[i].sizeIndex];
        context.beginPath();
        context.arc(balls[i].position.x,
                    balls[i].position.y,
                    balls[i].radius,
                    0, 
                    Math.PI * 2);
        context.fill();
        context.closePath();
    }
    for(let i = 0; i < nextBalls.length; i++){
        context.fillStyle = ballColors[nextBallSizes[i]];
        context.beginPath();
        context.arc(nextBalls[i].x + 40,
                    canvas.height - nextBalls[i].y + 40,
                    20,
                    0, 
                    Math.PI * 2);
        context.fill();
        context.closePath();
    }
    for(let i = 0; i < ballEvolution.length; i++){
        context.fillStyle = ballColors[i];
        context.beginPath();
        context.arc(ballEvolution[i].x - 40,
                    canvas.height - ballEvolution[i].y - 20,
                    10,
                    0, 
                    Math.PI * 2);
        context.fill();
        context.closePath();
    }
    context.fillStyle = ballColors[nextBallSizes[0]];
    context.beginPath();
    context.arc(nextBallX,
                canvas.height - height - 30,
                (width*.65) * Math.pow(.8164, (numOfObjects - 1) - nextBallSizes[0] + 1) / 2,
                0, 
                Math.PI * 2);
        context.fill();
        context.closePath();
    window.requestAnimationFrame(render);
}
window.requestAnimationFrame(render); //starts the game loop

function gameOver(){
    location.reload();
}


