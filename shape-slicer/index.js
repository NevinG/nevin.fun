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

//removes right click
document.addEventListener('contextmenu', event => event.preventDefault());

let polygon = undefined;
let enemies = [];
let enemyCooldown = 0;
let rotationSpeed = undefined;
let rotatingAnchor = null;
let score = 0;
let hs = 0;
let lastRender = null;
let rotateCCW = false;
let timer = 0;
reset();

//detect if mobile
//from https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
window.mobileCheck = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  };

//display instructions
let imgSrc = "pc-instructions.png"
if(window.mobileCheck())
    imgSrc = "mobile-instructions.png"

const img = document.createElement('img');
img.src = imgSrc;
img.id = "instruction-image";
document.body.appendChild(img);

//start after click
document.addEventListener("click", (e) => {
    document.body.removeChild(img);
    addEventListeners();
    window.requestAnimationFrame(gameLoop);
}, { once: true });


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

function update(delta){
    //do the enemy stuff
    timer += delta;
    //remove time from old enemies
    for(let i = 0; i < enemies.length; i++){
        enemies[i][2] -= delta;
        if(enemies[i][2] <= 0){
            //check if you kill the player
            checkKill(enemies[i]);
            //remove the enemy
            enemies.shift();
            i--;
        }
    }
    //update new enemy cooldown
    enemyCooldown -= delta;
    //add new enemy
    if(enemyCooldown <= 0){
        //add score
        score += 1;
        scoreSpan.innerText = `Score: ${score}`;
        //high score
        if(score > hs){
            hs = score;
            localStorage.setItem("shape-slicer", JSON.stringify({"hs": hs}));
        }

        //enemy is [pointA,pointB,timeLeft]
        addEnemies(Math.floor(Math.random() * (Math.floor(score / 3) + 1)) + (Math.floor(score / 3) + 1), 5, 10);

        //reset cooldown
        enemyCooldown = 5 - Math.floor(score / 3) * .1;
    }
    

    //rotate the player
    if(rotatingAnchor){
        //rotate points
        let rotDir = rotateCCW ? -1 : 1;
        for(let i = 0; i < polygon.length; i++){
            //(α+(x−α)cosθ−(y−β)sinθ,β+(x−α)sinθ+(y−β)cosθ)
            polygon[i] = [
                rotatingAnchor[0] + (polygon[i][0] - rotatingAnchor[0]) * Math.cos(delta * rotationSpeed * rotDir) - (polygon[i][1] - rotatingAnchor[1]) * Math.sin(delta * rotationSpeed * rotDir),
                rotatingAnchor[1] + (polygon[i][0] - rotatingAnchor[0]) * Math.sin(delta * rotationSpeed * rotDir) + (polygon[i][1] - rotatingAnchor[1]) * Math.cos(delta * rotationSpeed * rotDir)
            ]
        }
    }

    //check if a point is out of screen
    //calculate how far to translate
    let xTranslate = 0;
    let yTranslate = 0;
    let curXTranslate = 0;
    let curYTranslate = 0;
    for(let i = 0; i < polygon.length; i++){
        if(window.innerWidth/2 + polygon[i][0] * edgeLength > window.innerWidth){
            curXTranslate = -polygon[i][0] + (window.innerWidth / 2) / edgeLength;
            if(Math.abs(curXTranslate) > Math.abs(xTranslate)){
                xTranslate = curXTranslate;
            }
        }
        if(window.innerHeight/2 - polygon[i][1] * edgeLength > window.innerHeight){
            curYTranslate = -polygon[i][1] + (window.innerHeight / 2) / -edgeLength;
            if(Math.abs(curYTranslate) > Math.abs(yTranslate)){
                yTranslate = curYTranslate;
            }
        }
        if(window.innerWidth/2 + polygon[i][0] * edgeLength < 0){
            curXTranslate = -polygon[i][0] + (window.innerWidth / -2) / edgeLength;
            if(Math.abs(curXTranslate) > Math.abs(xTranslate)){
                xTranslate = curXTranslate;
            }
        }
        if(window.innerHeight/2 - polygon[i][1] * edgeLength < 0){
            curYTranslate = -polygon[i][1] + (-window.innerHeight / 2) / -edgeLength;
            if(Math.abs(curYTranslate) > Math.abs(yTranslate)){
                yTranslate = curYTranslate;
            }
        }
    }

    //translate all points back into screen
    if(xTranslate != 0 || yTranslate != 0){
        for(let j = 0; j< polygon.length; j++){
            polygon[j][0] += xTranslate;
            polygon[j][1] += yTranslate;
        }
    }
}

function render(){
    //draw current polygon
    context.strokeStyle = "rgba(0,200,0,.5)";
    context.fillStyle = "rgba(0,255,0,.25)";
    context.lineWidth = 1;
    context.clearRect(0,0, window.innerWidth, window.innerHeight);
    context.beginPath();
    context.moveTo(window.innerWidth/2 + polygon[0][0] * edgeLength, window.innerHeight/2 - polygon[0][1] * edgeLength);
    for(let i = 1; i < polygon.length; i++){
        context.lineTo(window.innerWidth/2 + polygon[i][0] * edgeLength, window.innerHeight/2 - polygon[i][1] * edgeLength);
    }
    context.lineTo(window.innerWidth/2 + polygon[0][0] * edgeLength, window.innerHeight/2 - polygon[0][1] * edgeLength);
    context.closePath();
    context.fill();
    context.stroke();

    //draw the enemies
    for(let i = 0; i < enemies.length; i++){
        context.beginPath();
        context.strokeStyle = `rgba(255,0,0,${1 - enemies[i][2] / 10})`;
        context.lineWidth = 3 - 3 * (enemies[i][2] / 10);
        context.moveTo(window.innerWidth/2 + enemies[i][0][0] * edgeLength, window.innerHeight/2 - enemies[i][0][1] * edgeLength);
        context.lineTo(window.innerWidth/2 + enemies[i][1][0] * edgeLength, window.innerHeight/2 - enemies[i][1][1] * edgeLength);
        context.closePath();
        context.stroke();
    }

    hsSpan.innerText = `High Score: ${hs}`;
}



function rotatePolygon(ccw, x, y){
    rotateCCW = !ccw;
    rotatingAnchor = [(x- window.innerWidth / 2) / edgeLength, (y - window.innerHeight / 2) / -edgeLength];
}

function endRotatePolygon(){
    rotatingAnchor = null;
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
    enemies = [];
    enemyCooldown = 0;
    timer = 0;
    rotationSpeed = 1;
    isRotating = false;
    score = 0;
    rotateCCW = false;
    hs = localStorage.getItem("shape-slicer") ?? JSON.stringify({"hs": 0});
    hs = JSON.parse(hs)["hs"];
    
    scoreSpan.innerText = `Score: ${score}`;
    lastRender = null;
    
    //initial polygon
    polygon.push([-.05,-.05]);
    polygon.push([-.05,.05]);
    polygon.push([.05,.05]);
    polygon.push([.05, -.05]);
}

function addEnemies(n, cooldownL, cooldownU){
    while(n--){
        let enemyPos = [0,0];
        for(let i = 0; i < 2; i++){
            //get point on polygon perimeter
            let pointA = Math.floor(Math.random() * polygon.length);
            let pointB = pointA;
            while(pointB == pointA){
                pointB = Math.floor(Math.random() * polygon.length);
            }
            pointA = [polygon[pointA][0], polygon[pointA][1]];
            pointB = [polygon[pointB][0], polygon[pointB][1]];
    
            //get random point on line;
            let randomMag = Math.random();
            pointA[0] += (pointB[0] - pointA[0]) * randomMag;
            pointA[1] += (pointB[1] - pointA[1]) * randomMag;
            enemyPos[i] = pointA;
        }
        //extend line very far
        let dirX = enemyPos[1][0] - enemyPos[0][0];
        let dirY = enemyPos[1][1] - enemyPos[0][1];
        enemyPos[0][0] += dirX * 2000;
        enemyPos[0][1] += dirY * 2000;
        enemyPos[1][0] -= dirX * 2000;
        enemyPos[1][1] -= dirY * 2000;

        enemies.push([enemyPos[0], enemyPos[1], Math.random() * (cooldownU - cooldownL) + cooldownL]);
    }
}

function checkKill(enemy){
    let u = polygonClipping.intersection([[enemy[0], [enemy[0][0] + .01, enemy[0][1]], enemy[1]]], [polygon]);
    if(u.length > 0){//kill them
        reset();
    }
}

function addEventListeners(){
    document.onmousedown = (e) => rotatePolygon(e.button == 0, e.clientX, e.clientY);
    document.onmouseup = (e) => endRotatePolygon();

    document.ontouchstart = (e) => rotatePolygon(e.touches.length == 1, e.touches[0].clientX, e.touches[0].clientY);
    document.ontouchend = (e) => {if(e.touches.length == 0){endRotatePolygon();}};
}