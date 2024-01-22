//matter.js physics engine stuff
// create an engine
// module aliases
const Engine = Matter.Engine,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite;

const engine = Engine.create();

//get all divs on the screen
let domElements = [];
getDomElements();

//get screen dimensions
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

//goes through all physics bodies and add click handlers that run when they are clicked on
addClickHandlers();

//add the ground for the physics engine
const ground = Bodies.rectangle(screenWidth/2, screenHeight + 24, screenWidth, 50, { isStatic: true });
const leftWall = Bodies.rectangle(-4, screenHeight / 2, 10, screenHeight, { isStatic: true });
const rightWall = Bodies.rectangle(screenWidth + 4, screenHeight / 2, 10, screenHeight, { isStatic: true });
Composite.add(engine.world, [ground, leftWall, rightWall]);

//constants
let lastRender = 0;
let physicsBodies = [];

//is called each frame, used for physics calculations
//delta is miliseconds since the last frame
function update(delta){
    formUpdate(delta);
    //simulate the physics
    Engine.update(engine, delta);

    //for the js form stuff
    
}

//is alled eac fhrame to draw everything to the screen
function draw(){
    //position all elements based on their physics position
    for(let i = 0; i < physicsBodies.length; i++){
        //add position
        physicsBodies[i].htmlElement.style.left = physicsBodies[i].position.x;
        physicsBodies[i].htmlElement.style.top = physicsBodies[i].position.y;
        //add rotation
        physicsBodies[i].htmlElement.style.transform = `translateX(-50%) translateY(-50%) rotate(${physicsBodies[i].angle}rad)`;
    }
}

//this is the physics.game loop
function gameLoop(timestamp) {
    let delta = timestamp - lastRender;
  
    update(delta);
    draw();
  
    lastRender = timestamp;
    window.requestAnimationFrame(gameLoop);
}
window.requestAnimationFrame(gameLoop); //starts the game loop

//goes through everything on the screen and gets all the physics bodies
//and adds them the the physicsBodiesList
function getDomElements(parentElement = document.body, zIndex=0){
    for(let i = 0; i < parentElement.children.length; i++){
        parentElement.children[i].style.zIndex = zIndex;
        if(!parentElement.children[i].classList.contains("no"))
            domElements.push(parentElement.children[i]);
        getDomElements(parentElement.children[i], zIndex + 1);
    }
}

function addClickHandlers(){
    for(let i = 0; i < domElements.length; i++){
        domElements[i].addEventListener("click", (e) => handleDomElementClick(e.target));
    }
}

function handleDomElementClick(target){ 
    //if className has no ignore
    if(target.classList.contains("no"))
        return handleDomElementClick(target.parentElement);

    //prevents error where child is added, then parent is clicked which will add the child again
    //this makes each DOM element only ably to be given physics once and not duplicate anything
    if(target.style.visibility == "hidden")
        return;

    //get clone
    const clone = target.cloneNode(true);
    //clone.innerText = target.innerText;
    document.body.appendChild(clone); //add clone to screen

    //make object invisible on dom
    target.style.visibility = "hidden";
    const ogId = target.id;
    target.id = ""; //remove id so js works on physics element

    //TODO make it so you can't interact or click on the invisible object

    const boundingBox = target.getBoundingClientRect();

    //duplicate the object and add it to the dom in the same place with absolute position
    clone.style.position = "absolute";
    clone.style.left = boundingBox.left + (boundingBox.right - boundingBox.left) / 2;
    clone.style.top = boundingBox.top + (boundingBox.bottom - boundingBox.top) / 2;
    clone.classList.add("physics");

    //add clone to physics calculations
    let physicsBody = Bodies.rectangle(
        boundingBox.left + (boundingBox.right - boundingBox.left) / 2,
        boundingBox.top + (boundingBox.bottom - boundingBox.top) / 2,
        boundingBox.right - boundingBox.left,
        boundingBox.bottom - boundingBox.top);
        
    physicsBody.htmlElement = clone;
    physicsBodies.push(physicsBody);

    Composite.add(engine.world, [physicsBody]);

    //TODO: remove the red border, this is just for now
    //clone.style.borderColor = "red";
    //perfrom this on all children of the elment
    // for(let i = 0; i < target.children.length; i++){
    //     handleDomElementClick(target.children[i]);
    // }
    refetchElementsById();
    reupdateElements();

    //make it so you can type in a falling input immediately.
    if(target.tagName == "INPUT"){
        clone.focus();
        //puts cursor to end of word
        let placeholder = clone.value;
        clone.value = "";
        clone.value = placeholder;
    }
}



//js to make the form stuff work
let timerText = document.getElementById("timer");

let instruction1 = document.getElementById("instruction-1");
let instruction2 = document.getElementById("instruction-2");
let instruction3 = document.getElementById("instruction-3");
let instruction4 = document.getElementById("instruction-4");
let instruction5 = document.getElementById("instruction-5");
let instruction6 = document.getElementById("instruction-6");
let instruction7 = document.getElementById("instruction-7");
let instruction8 = document.getElementById("instruction-8");
let instruction9 = document.getElementById("instruction-9");
let instruction10 = document.getElementById("instruction-10");
let instruction11 = document.getElementById("instruction-11");
let instruction12 = document.getElementById("instruction-12");
let instruction13 = document.getElementById("instruction-13");
let instruction14 = document.getElementById("instruction-14");
let instruction15 = document.getElementById("instruction-15");
let instruction16 = document.getElementById("instruction-16");
let instruction17 = document.getElementById("instruction-17");
let instruction18 = document.getElementById("instruction-18");
let instruction19 = document.getElementById("instruction-19");
let instruction20 = document.getElementById("instruction-20");

let instruction9Number = document.getElementById("instruction-9-number");

let instruction3Input = document.getElementById("instruction-3-input");
let instruction4Input = document.getElementById("instruction-4-input");
let instruction5Input1 = document.getElementById("instruction-5-input-1");
let instruction5Input2 = document.getElementById("instruction-5-input-2");
let instruction5Input3 = document.getElementById("instruction-5-input-3");
let instruction10Input = document.getElementById("instruction-10-input");
let instruction11Input = document.getElementById("instruction-11-input");
let instruction17Input = document.getElementById("instruction-17-input");

let instruction13Button1 = document.getElementById("instruction-13-button-1");
let instruction13Button2 = document.getElementById("instruction-13-button-2");
let instruction13Button3 = document.getElementById("instruction-13-button-3");
let instruction13Button4 = document.getElementById("instruction-13-button-4");
let instruction19Button = document.getElementById("instruction-19-button");

let instruction8Letter = document.getElementById("instruction-8-letter");
let instruction15Letter = document.getElementById("instruction-15-letter");
let lightSwitch = document.getElementById("light-switch");
let instruction3Copied = false;
let instruction13History = "";

let instructionsCompleteLabel = document.getElementById("instructions-complete");
let title = document.getElementById("title");
let completeAudio = new Audio('instruction-complete-sound.mp3');
let incompleteAudio = new Audio('instruction-incomplete-sound.mp3');
let gameOver = false;

let instructionsComplete = 1;
let timeElapsed = 0;
let instruction1Count = 0;
let instruction2Count = 0;
let instruction6Count = 0;
let instruction9Count = 0;
let instruction15Count = 0;
let instruction16Count = 0;
let instruction19Count = 0;
let flipLightSwitchCount = 0;
let instrution3Copied = false;
let instruction3Complete = false;
let instruction4Complete = false;
let instruction5Complete = false;
let instruction6Complete = false;
let instruction7Complete = false;
let instruction10Complete = false;
let instruction12Complete = false;
let instruction13Complete = false;
let instruction14Complete = false;
let instruction17Complete = false;
let instruction20Complete = false;
let instruction19Complete = true;
let input3Uppercase = false;
let input10Uppercase = false;
let input11Uppercase = false;
let input17Uppercase = false;

let instruction16TextOptions = [
    'ne.tCluci h0tr iks si tcoin11ti6m s',
    'ne.tCl1ci 0htr iks su tcoin1iti6m s',
    'ne.tCl1ci chts iks ru t0oin1it 6mis',
    '1c.tClnei ch stiks ru t0oin1it 6mis',
    '1c. Clnei thtsciks ru t0oin1it 6mis',
    '1c. Clkii thtscins ru t0oii1nt 6mes',
    '1c. Clkiitthtscins ru tnoi 10 i6mes',
    '16. Cliik thtscinstru tnoi 10 icmes',
    '16. Cliik this instru tnocc10 times',
    '16. Click this instruction 10 times'
  ];

title.onclick = instruction1function;

//do the heightlocked element to make the light switch work
Array.prototype.slice.call(document.getElementsByClassName("height-locked")).forEach((element) => {
    element.style.height = element.offsetHeight;
})

function refetchElementsById(){
    timerText = document.getElementById("timer");

    instruction1 = document.getElementById("instruction-1");
    instruction2 = document.getElementById("instruction-2");
    instruction3 = document.getElementById("instruction-3");
    instruction4 = document.getElementById("instruction-4");
    instruction5 = document.getElementById("instruction-5");
    instruction6 = document.getElementById("instruction-6");
    instruction7 = document.getElementById("instruction-7");    
    instruction8 = document.getElementById("instruction-8");
    instruction10 = document.getElementById("instruction-10");
    instruction11 = document.getElementById("instruction-11");
    instruction12 = document.getElementById("instruction-12");
    instruction13 = document.getElementById("instruction-13");
    instruction14 = document.getElementById("instruction-14");
    instruction15 = document.getElementById("instruction-15");
    instruction16 = document.getElementById("instruction-16");
    instruction17 = document.getElementById("instruction-17");
    instruction18 = document.getElementById("instruction-18");
    instruction19 = document.getElementById("instruction-19");
    instruction20 = document.getElementById("instruction-20");

    instruction9Number = document.getElementById("instruction-9-number");

    instruction15Letter = document.getElementById("instruction-15-letter");
    instructionsCompleteLabel = document.getElementById("instructions-complete");
    instruction3Input = document.getElementById("instruction-3-input");
    instruction4Input = document.getElementById("instruction-4-input");
    instruction5Input1 = document.getElementById("instruction-5-input-1");
    instruction5Input2 = document.getElementById("instruction-5-input-2");
    instruction5Input3 = document.getElementById("instruction-5-input-3");
    instruction10Input = document.getElementById("instruction-10-input");
    instruction11Input = document.getElementById("instruction-11-input");
    instruction17Input = document.getElementById("instruction-17-input");

    instruction13Button1 = document.getElementById("instruction-13-button-1");
    instruction13Button2 = document.getElementById("instruction-13-button-2");
    instruction13Button3 = document.getElementById("instruction-13-button-3");
    instruction13Button4 = document.getElementById("instruction-13-button-4");
    instruction19Button = document.getElementById("instruction-19-button");
}

function initialElementHandlers(){
    instruction3.onclick = instruction2function;
    instruction8.onclick = instruction2function;
    instruction10.onclick = instruction2function;

    instruction1.onclick = instruction6function;
    instruction2.onclick = instruction6function;
    instruction4.onclick = instruction6function;
    instruction5.onclick = instruction6function;
    instruction9.onclick = instruction9function;
    instruction18.onclick = instruction6function;

    instruction8Letter.onclick = instruction8function;
}
function reupdateElements(){
    instruction3.oncopy =instruction3CopyEvent;

    instruction3Input.oninput = (e) => {
        if(e.target.value.toLowerCase() == "first" && instruction4Complete){
            instructionsComplete++;
            updateInstructionCount(3);
            instruction3Complete = true;
        }else if (instruction3Complete){
            instructionsComplete--;
            instruction3Complete = false;
            updateInstructionCount(3,false);
        }else{
            instruction3Complete = false;
        }

        if(e.target.value && e.target.value== e.target.value.toUpperCase()){
            input3Uppercase = true;
        }else{
            input3Uppercase = false;
        }
        checkInstruction20();
    };

    instruction4Input.oninput = (e) => {
        if(e.target.value == 12){
            instructionsComplete++;
            updateInstructionCount(4);
            instruction4Complete = true;
        }else if(instruction4Complete){
            instructionsComplete--;
            instruction4Complete = false;
            updateInstructionCount(4,false);
        }
        else{
            instruction4Complete = false;
        }
    }

    instruction5Input1.oninput= instruction5function;
    instruction5Input2.oninput= instruction5function;
    instruction5Input3.oninput= instruction5function;

    instruction10Input.oninput = (e) => {
        if(e.target.value.toLowerCase() == "word"){
            instructionsComplete++;
            updateInstructionCount(10);
            instruction10Complete = true;
        }else if(instruction10Complete){
            instructionsComplete--;
            instruction10Complete = false;
            updateInstructionCount(10,false);
        }
        else{
            instruction10Complete = false;
        }

        if(e.target.value && e.target.value== e.target.value.toUpperCase()){
            input10Uppercase = true;
        }else{
            input10Uppercase = false;
        }
        checkInstruction20();
    }

    instruction11Input.onpaste = () => {
        if(instruction3Copied){
            instructionsComplete++;
            updateInstructionCount(11);
        }
    }

    instruction11Input.oninput = (e) => {
        if(e.target.value && e.target.value== e.target.value.toUpperCase()){
            input11Uppercase = true;
        }else{
            input11Uppercase = false;
        }
        checkInstruction20();
    }

    instruction13Button1.onclick = instruction13function;
    instruction13Button2.onclick = instruction13function;
    instruction13Button3.onclick = instruction13function;
    instruction13Button4.onclick = instruction13function;

    instruction15Letter.onclick = instruction15function;

    instruction16.onclick = (e) => {
        if(instruction16Count < 10){
            instruction16Count++;

            if(instruction16Count == 10){
                instructionsComplete++;
                updateInstructionCount(16);
            }
        }
    }

    instruction17Input.oninput = (e) => {
        if(e.target.value.toLowerCase() == "sthgil"){
            instructionsComplete++;
            updateInstructionCount(17);
            instruction17Complete = true;
        }else if(instruction17Complete){
            instructionsComplete--;
            updateInstructionCount(17,false);
            instruction17Complete = false;
        }else{
            instruction17Complete = false;
        }

        if(e.target.value && e.target.value== e.target.value.toUpperCase()){
            input17Uppercase = true;
        }else{
            input17Uppercase = false;
        }
        checkInstruction20();
    }

    instruction19Button.onclick = () => {
        instruction19Count++;
        checkInstruction19();
    }
}

function instruction3CopyEvent(e){
    instruction3Copied = true;
}

function formUpdate(delta){
    if(!gameOver){
        timeElapsed += delta / 1000;
        timerText.innerText = timeElapsed.toFixed(1) + " seconds";
    }
}
//special funtions
function instruction1function(e){
    if(['a','e','i','o','u'].includes(e.target.textContent.toLowerCase())){
        e.target.onclick = null;
        instruction1Count++;
    
        if(instruction1Count == 9){
            instructionsComplete++;
            updateInstructionCount(1);
        }
    }
}

function instruction2function(){
    instruction2Count++;
    if(instruction2Count == 3){
        instructionsComplete++;
        updateInstructionCount(2);
    }
}

function instruction6function(){
    instruction6Count++;
    if(instruction6Count == 5){
        instructionsComplete++;
        updateInstructionCount(6);
    }
}

function instruction5function(){
    let a = parseInt(instruction5Input1.value);
    let b = parseInt(instruction5Input2.value);
    let c = parseInt(instruction5Input3.value);

    if(a + b == c){
        instruction5Complete = true;
        instructionsComplete++;
        updateInstructionCount(5);
    }else if(instruction5Complete){
        instructionsComplete--;
        instruction5Complete = false;
        updateInstructionCount(5,false);
    }else{
        instruction5Complete = false;
    }

    if(b == 17 && !instruction7Complete){
        instruction7Complete = true;
        instructionsComplete++;
        updateInstructionCount(7);
    }else if(b != 17 && instruction7Complete){
        instructionsComplete--;
        instruction7Complete = false;
        updateInstructionCount(7,false);
    }else if(b!= 17){
        instruction7Complete = false;
    }
}

function instruction8function(e){
    instructionsComplete++;
    lightSwitch.style.display="inline-block";
    lightSwitch.style.margin = `0 ${(e.target.offsetWidth - lightSwitch.offsetWidth) / 2}`;
    e.target.style.display = "none";

    updateInstructionCount(8);
}

function instruction9function(e){
    if(e.target.classList.contains("instruction-9")){
        instruction9Count++;
        if(instruction9Count == 7){
            instructionsComplete++;
            updateInstructionCount(9);
        }
        e.target.classList.remove("instruction-9");
    }
}

function instruction13function(e){
    instruction13History += e.target.textContent;
    if(instruction13History.length > 4)
        instruction13History = instruction13History.slice(1);

    if(instruction13History == "1423" && !instruction13Complete){
        instruction13Complete = true;
        instructionsComplete++;
        updateInstructionCount(13);

    } else if (instruction13History == "1234" && !instruction14Complete){
        instruction14Complete = true;
        instructionsComplete++;
        updateInstructionCount(14);
    }
}

function instruction15function(e){
    if(instruction15Count < 5){
        instruction15Count++;

        if(instruction15Count == 5){
            instructionsComplete++;
            updateInstructionCount(15);
        }
    }
}

function updateInstructionCount(i, beep = true){
    switch(i){
        case 1:
            instruction1.children[0].style.color = beep ? "green" : "black";
            instruction1.children[0].style.fontWeight = beep ? "bold" : "normal";
            break;
        case 2:
            instruction2.children[0].style.color = beep ? "green" : "black";
            instruction2.children[0].style.fontWeight = beep ? "bold" : "normal";
            break;
        case 3:
            instruction3.children[0].style.color = beep ? "green" : "black";
            instruction3.children[0].style.fontWeight = beep ? "bold" : "normal";
            break;
        case 4:
            instruction4.children[0].style.color = beep ? "green" : "black";
            instruction4.children[0].style.fontWeight = beep ? "bold" : "normal";
            break;
        case 5:
            instruction5.children[0].style.color = beep ? "green" : "black";
            instruction5.children[0].style.fontWeight = beep ? "bold" : "normal";
            break;
        case 6:
            instruction6.children[0].style.color = beep ? "green" : "black";
            instruction6.children[0].style.fontWeight = beep ? "bold" : "normal";
            break;
        case 7:
            instruction7.children[0].style.color = beep ? "green" : "black";
            instruction7.children[0].style.fontWeight = beep ? "bold" : "normal";
            break;
        case 8:
            instruction8.children[0].style.color = beep ? "green" : "black";
            instruction8.children[0].style.fontWeight = beep ? "bold" : "normal";
            break;
        case 9:
            instruction9Number.style.color = beep ? "green" : "black";
            instruction9Number.style.fontWeight = beep ? "bold" : "normal";
            break;
        case 10:
            instruction10.children[0].style.color = beep ? "green" : "black";
            instruction10.children[0].style.fontWeight = beep ? "bold" : "normal";
            break;
        case 11:
            instruction11.children[0].style.color = beep ? "green" : "black";
            instruction11.children[0].style.fontWeight = beep ? "bold" : "normal";
            break;
        case 12:
            instruction12.children[0].style.color = beep ? "green" : "black";
            instruction12.children[0].style.fontWeight = beep ? "bold" : "normal";
            break;
        case 13:
            instruction13.children[0].style.color = beep ? "green" : "black";
            instruction13.children[0].style.fontWeight = beep ? "bold" : "normal";
            break;
        case 14:
            instruction14.children[0].style.color = beep ? "green" : "black";
            instruction14.children[0].style.fontWeight = beep ? "bold" : "normal";
            break;
        case 15:
            instruction15.children[0].style.color = beep ? "green" : "black";
            instruction15.children[0].style.fontWeight = beep ? "bold" : "normal";
            break;
        case 16:
            instruction16.innerHTML = instruction16.innerText.replace(
                '1', '<span class="no hide" style="color:green; font-weight: bold;">1</span>').replace(
                '6', '<span class="no hide" style="color:green; font-weight: bold;">6</span>').replace(
                '.', '<span class="no hide" style="color:green; font-weight: bold;">.</span>')
            break;
        case 17:
            instruction17.children[0].style.color = beep ? "green" : "black";
            instruction17.children[0].style.fontWeight = beep ? "bold" : "normal";
            break;
        case 18:
            instruction18.children[0].style.color = beep ? "green" : "black";
            instruction18.children[0].style.fontWeight = beep ? "bold" : "normal";
            break;
        case 19:
            instruction19.children[0].style.color = beep ? "green" : "black";
            instruction19.children[0].style.fontWeight = beep ? "bold" : "normal";
            break;
        case 20:
            instruction20.children[0].style.color = beep ? "green" : "black";
            instruction20.children[0].style.fontWeight = beep ? "bold" : "normal";
            break;
    }

    if(beep){
        if (completeAudio.paused) {
            completeAudio.play();
        }else{
            completeAudio.currentTime = 0
        }
    }else{
        if (incompleteAudio.paused) {
            incompleteAudio.play();
        }else{
            incompleteAudio.currentTime = 0
        }
    }
    instructionsCompleteLabel.innerText = `Instructions Complete ${instructionsComplete}/20`;
    if(instructionsComplete == 20){
        gameOver = true;
        const encodedTime = encodeURIComponent(btoa(timeElapsed.toFixed(1)));
        let highscoreTime = JSON.parse(localStorage.getItem("highscore"));
        if(highscoreTime == null || timeElapsed < parseFloat(highscoreTime)){
            highscoreTime = timeElapsed.toFixed(1);
            localStorage.setItem("highscore", JSON.stringify(highscoreTime));
        }
        const encodedHighscore = encodeURIComponent(btoa(highscoreTime));
        window.location.href = `winner?t=${encodedTime}&h=${encodedHighscore}`;
    }
}

function checkInstruction20(){
    if(!instruction20Complete){
        if(input3Uppercase && input10Uppercase && input11Uppercase && input17Uppercase){
            instruction20Complete = true;
            instructionsComplete++;
            updateInstructionCount(20, true);
        }else{
            insinstruction20Complete = false;
        }
    }else if(!(input3Uppercase && input10Uppercase && input11Uppercase && input17Uppercase)){
        instructionsComplete--;
        instruction20Complete = false;
        updateInstructionCount(20, false);
    }
}

function flipLightSwitch(){
    if(window.getComputedStyle( document.body ,null).getPropertyValue('background-color') == "rgb(255, 255, 255)"){
        instruction16.innerHTML = instruction16TextOptions[Math.min(flipLightSwitchCount,9)]
        if(instruction16Count > 9){
            instruction16.innerHTML = instruction16.innerText.replace(
                '1', '<span class="no hide" style="color:green; font-weight: bold;">1</span>').replace(
                '6', '<span class="no hide" style="color:green; font-weight: bold;">6</span>').replace(
                '.', '<span class="no hide" style="color:green; font-weight: bold;">.</span>');
        }
            
        document.body.style.backgroundColor = "black";
        instruction18.children[0].style.color = flipLightSwitchCount > 9 ? "green" : "white";
        //hide all bright elements like input
        Array.prototype.slice.call(document.getElementsByClassName("hide")).forEach(e =>{
            e.classList.add("hide-in-dark");
        })

        if(!instruction12Complete){
            instruction12Complete = true;
            instructionsComplete++;
            updateInstructionCount(12);
        }
    }else{
        document.body.style.backgroundColor = "rgb(255, 255, 255)";
        instruction18.children[0].style.color = "white";
        //make all bright elements normal
        Array.prototype.slice.call(document.getElementsByClassName("hide")).forEach(e =>{
            e.classList.remove("hide-in-dark");
        })

        flipLightSwitchCount++;
        if(flipLightSwitchCount == 10){
            instructionsComplete++;
            updateInstructionCount(18);
        }
        instruction19.children[1].innerText = `Click the button ${flipLightSwitchCount} times `;
        checkInstruction19();
    }
}

function checkInstruction19(){
    if(instruction19Complete){
        if(instruction19Count < flipLightSwitchCount){
            instruction19Complete = false;
            instructionsComplete--;
            updateInstructionCount(19, false);
        }
    }else{
        if(instruction19Count >= flipLightSwitchCount){
            instruction19Complete = true;
            instructionsComplete++;
            updateInstructionCount(19);
        }
    }
}
initialElementHandlers();
reupdateElements();
