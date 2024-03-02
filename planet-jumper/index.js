const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

//Whatever is larger, width or height becomes
//the number of pixels in a box

//we render a 3x3 of boxes
//each box has 100 squares, and each square has a 2% chance to
//become a planet

//render everything with a canvas
let player = {
    x: 0,
    y: 0,
    r: 0.01,
    jump_angle: Math.PI / 2,
    tangent_angle: 0,
    angle_increase: true,
    stuck: true, //means gravity doesn't affect the player
    vx: 0,
    vy: 0,
    selecting_power: false,
    power_increase: true,
    power_amount: .5,
}

let endHeight = -1.5;
let firstClick = false;
let planets = []
let curBox = [0,0]
const GRAVITY = .2
let highscore = JSON.parse(localStorage.getItem("planet-jumper") ?? JSON.stringify({"hs": 0}))["hs"]

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let boxLength = Math.max(window.innerWidth, window.innerHeight);
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    boxLength = Math.max(window.innerWidth, window.innerHeight);
});

getNewPlanets();

//game looper
lastRender = null
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

//update function called every tick
function update(delta){
    //update endHeight
    if(firstClick)
        endHeight += delta * (1/20);

    //if we move into new box get new planets
    if (curBox[0] != getCurrentBox()[0] || curBox[1] != getCurrentBox()[1]){
        curBox = getCurrentBox();
        getNewPlanets();
    }

    //update player jump angle
    if(player.stuck && !player.selecting_power){
        if(player.angle_increase){
            player.jump_angle += delta * Math.PI / 1.5
            if(player.jump_angle >= Math.PI){
                player.jump_angle = Math.PI
                player.angle_increase = false
            }
        }else{
            player.jump_angle -= delta * Math.PI / 1.5
            if(player.jump_angle <= 0){
                player.jump_angle = 0
                player.angle_increase = true
            }
        }
    }
    else if(player.stuck && player.selecting_power){
        if(player.power_increase){
            player.power_amount += delta
            if(player.power_amount >= 1){
                player.power_amount = 1
                player.power_increase = false
            }
        }else{
            player.power_amount -= delta
            if(player.power_amount <= .01){
                player.power_amount = .01
                player.power_increase = true
            }
        }
    }
    //add velocity and gravity to player
    else if(!player.stuck){
        player.x += player.vx * delta
        player.vy -= GRAVITY * delta
        player.y += player.vy * delta 
    }

    //check for player collision to planet
    if(!player.stuck){
        planets.some(planet => {
            if (Math.pow(planet.x - player.x,2) + Math.pow(planet.y - player.y,2) <= Math.pow(planet.r + player.r, 2)){
                player.jump_angle = Math.PI / 2;
                player.angle_increase = true;
                player.stuck = true; //means gravity doesn't affect the player
                player.vx = 0;
                player.vy = 0;
                player.selecting_power = false;
                player.power_increase = true;
                player.power_amount = .5;

                //move player to right outside the planet
                vx = player.x - planet.x
                vy = player.y - planet.y
                l = Math.sqrt(vx*vx + vy*vy)
                vx /= l;
                vy /= l;
                
                player.x = (planet.x + vx * (player.r + planet.r + .001))
                player.y = (planet.y + vy * (player.r + planet.r + .001))

                //get tangent line for jump meter
                //(y,-x)
                player.tangent_angle = Math.atan(-vx/ vy);
                if(vy < 0)
                    player.tangent_angle += Math.PI;

                //do highscore
                if(Math.floor(player.y * 10) > highscore){
                    highscore = Math.floor(player.y * 10)
                    localStorage.setItem("planet-jumper", JSON.stringify({"hs": highscore}));
                }
                return true;
            }
        })
    }

    //check if player lose
    if(player.y <= endHeight){
        location.reload();
    }
        
}

function getCurrentBox(){
    return [Math.floor(player.x / .5), Math.floor(player.y / .5)]
}

function getNewPlanets(){
    planets = []
    for(let i = -1; i <= 1; i++){
        for(let j = -1; j <= 1; j++){
            for(let iStep = 0; iStep < 1; iStep += .1){
                for(let jStep = 0; jStep < 1; jStep += .1){
                    let x = curBox[0] + i + iStep;
                    let y = curBox[1] + j + jStep;
                    let random = jsf32(x * 409096 + 12312312, y*1231123 + 1231231, x * 4327189 + 891237, y*39214854 + 423897)
                    if (random < .01){
                        let randomRadius = jsf32(x * 857126 + 95834713, y*1923865 + 183964, x * 3869023 + 197583, y*8293374 + 3957292)
                        planets.push({x: x / 2, y: y / 2, r: Math.floor(randomRadius * 19 + 1) / 100, planetType: Math.floor(randomRadius * 11)})
                    }
                }
            }
        }   
    }
}

//render function called every tick
function render(){
    //clear screen
    context.clearRect(0,0,canvas.width, canvas.height);

    //render planets
    planets.forEach(planet => {
        drawPlanet(planet)
    })

    //render the player
    context.beginPath();
    context.fillStyle = "red";
    context.lineWidth = 2;
    //context.arc(player.x * boxLength + window.innerWidth / 2, window.innerHeight / 2 - player.y * boxLength, player.r * boxLength, 0, Math.PI * 2);
    context.arc(window.innerWidth / 2, window.innerHeight / 2, player.r * boxLength, 0, Math.PI * 2);
    context.fill();
    context.stroke();

    //render score
    context.fillStyle = "black"
    context.font = "48px Courier" //char width: 28.81, char height: 54
    let text = `Score:${Math.floor(player.y * 10)}`
    context.fillText(text, window.innerWidth / 2 - (text.length * 28.81 / 2), 54/2 + 35)
    context.font = "24px Courier" //char width: 14.41, char height: 27
    text = `High Score:${highscore}`
    context.fillText(text, window.innerWidth / 2 - (text.length * 14.41 / 2), + 54 + 35)

    //render play jump meter
    context.strokeStyle = "gray";
    if(player.stuck && !player.selecting_power){
        context.lineWidth = 4;
        context.beginPath();
        context.moveTo((Math.cos(player.jump_angle + player.tangent_angle) * player.r) * boxLength + window.innerWidth / 2, window.innerHeight / 2 - (Math.sin(player.jump_angle + player.tangent_angle) * player.r) * boxLength);
        context.lineTo((Math.cos(player.jump_angle + player.tangent_angle) * (.05 + player.r)) * boxLength + window.innerWidth / 2, window.innerHeight / 2 - (Math.sin(player.jump_angle + player.tangent_angle) * (player.r + .05)) * boxLength);
        context.stroke();
    }
    //render the power meter
    else if(player.stuck && player.selecting_power){
        context.lineWidth = 4;
        context.strokeStyle = "gray";
        context.beginPath();
        context.moveTo((Math.cos(player.jump_angle + player.tangent_angle) * player.r) * boxLength + window.innerWidth / 2, window.innerHeight / 2 - (Math.sin(player.jump_angle + player.tangent_angle) * player.r) * boxLength);
        context.lineTo((Math.cos(player.jump_angle + player.tangent_angle) * (1 *.1 + player.r)) * boxLength + window.innerWidth / 2, window.innerHeight / 2 - (Math.sin(player.jump_angle + player.tangent_angle) * (1 * .1 + player.r)) * boxLength);
        context.stroke();

        context.strokeStyle = "black"
        context.beginPath();
        context.moveTo((Math.cos(player.jump_angle + player.tangent_angle) * player.r) * boxLength + window.innerWidth / 2, window.innerHeight / 2 - (Math.sin(player.jump_angle + player.tangent_angle) * player.r) * boxLength);
        context.lineTo((Math.cos(player.jump_angle + player.tangent_angle) * (player.power_amount * .1 + player.r)) * boxLength + window.innerWidth / 2, window.innerHeight / 2 - (Math.sin(player.jump_angle + player.tangent_angle) * (player.power_amount * .1 + player.r)) * boxLength);
        context.stroke();
    }

    //render tangent angle
    // context.moveTo((Math.cos(player.tangent_angle) * player.r) * boxLength + window.innerWidth / 2, window.innerHeight / 2 - (Math.sin(player.tangent_angle) * player.r) * boxLength);
    // context.lineTo((Math.cos(player.tangent_angle) * (1 *.1 + player.r)) * boxLength + window.innerWidth / 2, window.innerHeight / 2 - (Math.sin(player.tangent_angle) * (1 * .1 + player.r)) * boxLength);
    // context.stroke();

    //render lava
    context.fillStyle = "orange";
    context.fillRect(0, window.innerHeight / 2 - (endHeight - player.y) * boxLength, innerWidth, innerHeight)

}

function drawPlanet(planet){
    switch(planet.planetType){
        case 0:
            context.fillStyle = "#90EE90";
            break;
        case 1:
            context.fillStyle = "#006400";
            break;
        case 2:
            context.fillStyle = "#708238";
            break;
        case 3:
            context.fillStyle = "#00563B";
            break;
        case 4:
            context.fillStyle = "#50C878";
            break;
        case 5:
            context.fillStyle = "#B2AC88";
            break;
        case 6:
            context.fillStyle = "#98FB98";
            break;
        case 7:
            context.fillStyle = "#228B22";
            break;
        case 8:
            context.fillStyle = "#33B864";
            break;
        case 9:
            context.fillStyle = "#01796F";
            break;
        case 10:
            context.fillStyle = "#4CBB17";
            break;
        default:
            context.fillStyle = "#355E3B";
            break;

    }
    context.strokeStyle = "black"
    context.lineWidth = 5;
    context.beginPath();
    context.arc((planet.x - player.x) * boxLength + window.innerWidth / 2, window.innerHeight / 2 - (planet.y - player.y) * boxLength, planet.r * boxLength, 0, Math.PI * 2);
    context.fill();
    context.stroke();
}

//this is the prng we are using
//got from https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
function jsf32(a, b, c, d) {
    a |= 0; b |= 0; c |= 0; d |= 0;
    var t = a - (b << 27 | b >>> 5) | 0;
    a = b ^ (c << 17 | c >>> 15);
    b = c + d | 0;
    c = d + t | 0;
    d = a + t | 0;
    return (d >>> 0) / 4294967296;
}

document.onclick = (e) => {
    firstClick = true;
    //launch player
    if(player.stuck && !player.selecting_power){
        player.selecting_power = true;
    }
    else if(player.stuck && player.selecting_power){
        player.selecting_power = false;
        player.stuck = false
        player.vx = Math.cos(player.jump_angle + player.tangent_angle) * player.power_amount / 1.5
        player.vy = Math.sin(player.jump_angle + player.tangent_angle) * player.power_amount / 1.5
    }
}