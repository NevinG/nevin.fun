const screenText = document.getElementById("screen-text");
const allTimeLeaderboardEntries = document.getElementById("all-time-leaderboard-entries");

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
let leaderboardData = [];

getLeaderboard();
document.addEventListener("mousedown", (e) => {
    if (currentTimeout)
        clearTimeout(currentTimeout)

    document.documentElement.style.backgroundColor = notReadyBackground;
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
        document.documentElement.style.backgroundColor = readyBackground;
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

    const response = await fetch(`https://backend-tfl5gdluba-uc.a.run.app/click?userId=${userId}`);
    if(response.ok){
        const jsonResponse = await response.json();
        currentTimeout = setTimeout(()=>{
            waitingClick = true;
            startTime = Date.now();
            document.documentElement.style.backgroundColor = readyBackground;
        }, parseInt(jsonResponse["waitTime"]))
        currentSecret = jsonResponse["secret"];
    }

}
async function getUserId(){
    const response = await fetch("https://backend-tfl5gdluba-uc.a.run.app/userId");
    if(response.ok){
        const jsonResponse = await response.json();
        return jsonResponse["userId"];
    }
}
async function sendResponseTime(){
    const response = await fetch(`https://backend-tfl5gdluba-uc.a.run.app/responseTime?userId=${userId}&secret=${currentSecret}&time=${testResults[testResults.length -1]}`,{
        method: "POST",
    });
}

async function getScore(){
    const response = await fetch(`https://backend-tfl5gdluba-uc.a.run.app/finalScore?userId=${userId}`);
    let averageTime;
    if(response.ok){
        const jsonResponse = await response.json();
        averageTime = jsonResponse["finalScore"];
        leaderboardData = jsonResponse["leaderboard"];
        updateLeaderboard();
    }else{
        return;
    }

    screenText.innerText += `You finished with a trimmed average time of ${averageTime.toFixed(2)} ms.\n`;
    screenText.innerText += `Click for a new test`;

    reset();
}

async function getLeaderboard(){
    const response = await fetch(`https://backend-tfl5gdluba-uc.a.run.app/leaderboard`);
    if(response.ok){
        const jsonResponse = await response.json();
        leaderboardData = jsonResponse["leaderboard"];
    }else{
        return;
    }
    updateLeaderboard();
}

function updateLeaderboard(){
    allTimeLeaderboardEntries.innerHTML = leaderboardData.map((x) => `<li>${x}</li>`).join(' ');
}