screenText = document.getElementById("screen-text");
let waitingToStartTest = true
let testResults = [];
const totalNumberOfTests = 5;

let waitingClick = false;
let startTime;
const notReadyBackground = "#be1f1a";
const readyBackground = "#15b315";
let currentTimeout = undefined;
let userId = undefined;
let currentSecret = undefined;

document.addEventListener("mousedown", (e) => {
    if (currentTimeout)
        clearTimeout(currentTimeout)

    document.body.style.backgroundColor = notReadyBackground;
    if (waitingToStartTest){
        screenText.innerText = "Click the screen when the background turns green";
        started = true;
        waitingToStartTest = false;
        getWaitime();
        return
    }

    if(!waitingClick){
        screenText.innerText = "You clicked to early! Click to retry test";
        waitingToStartTest = true;
        reset();
    }
    else{
        let elapsedTime = Date.now() - startTime;
        testResults.push(elapsedTime)
        waitingToStartTest = true;
        screenText.innerText = `Your reaction time was ${elapsedTime} ms.\n`;
        sendResponseTime();
        if (testResults.length == totalNumberOfTests){
            getScore();
        }
        else
            screenText.innerText += `Click for test ${testResults.length + 1}/${totalNumberOfTests}`;
    }

    waitingClick = false;
})

function reset(){
    testResults = []
    currentTimeout = undefined;
    userId = undefined;
    currentSecret = undefined;
}

async function getWaitime(){
    if(!userId){
        userId = await getUserId();
    }

    const response = await fetch(`http://localhost:3000/click?userId=${userId}`);
    if(response.ok){
        const jsonResponse = await response.json();
        currentTimeout = setTimeout(()=>{
            waitingClick = true;
            startTime = Date.now();
            document.body.style.backgroundColor = readyBackground;
        }, parseInt(jsonResponse["waitTime"]))
        currentSecret = jsonResponse["secret"];
    }

}
async function getUserId(){
    const response = await fetch("http://localhost:3000/userId");
    if(response.ok){
        const jsonResponse = await response.json();
        return jsonResponse["userId"];
    }
}
async function sendResponseTime(){
    const response = await fetch(`http://localhost:3000/responseTime?userId=${userId}&secret=${currentSecret}&time=${testResults[testResults.length -1]}`,{
        method: "POST",
    });
}

async function getScore(){
    const response = await fetch(`http://localhost:3000/finalScore?userId=${userId}`);
    let averageTime;
    if(response.ok){
        const jsonResponse = await response.json();
        averageTime = jsonResponse["finalScore"];
    }else{
        return;
    }

    screenText.innerText += `You finished with a trimmed average time of ${averageTime.toFixed(2)} ms.\n`;
    screenText.innerText += `Click for a new test`;

    reset();
}