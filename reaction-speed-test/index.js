screenText = document.getElementById("screen-text");
let waitingToStartTest = true
let testResults = [];
let totalNumberOfTests = 5;

let waitingClick = false;
let startTime;
const notReadyBackground = "#be1f1a";
const readyBackground = "#15b315";
let currentTimeout;
document.addEventListener("mousedown", (e) => {
    if (currentTimeout)
        clearTimeout(currentTimeout)

    document.body.style.backgroundColor = notReadyBackground;
    if (waitingToStartTest){
        screenText.innerText = "Click the screen when the background turns green";
        started = true;
        waitingToStartTest = false;
        getWaitime();
        // currentTimeout = setTimeout(()=>{
        //     waitingClick = true;
        //     startTime = Date.now();
        //     document.body.style.backgroundColor = readyBackground;
        // }, Math.floor(Math.random() * 5000) + 1000)
        return
    }

    if(!waitingClick){
        screenText.innerText = "You clicked to early! Click to retry test";
        waitingToStartTest = true;
        testResults = [];
    }
    else{
        let elapsedTime = Date.now() - startTime;
        testResults.push(elapsedTime)
        waitingToStartTest = true;
        screenText.innerText = `Your reaction time was ${elapsedTime} ms.\n`;
        if (testResults.length == totalNumberOfTests){
            const averageTime = testResults.reduce((a,b) => a+b) / testResults.length;
            screenText.innerText += `You finished with an average time of ${averageTime} ms.\n`;
            screenText.innerText += `Click for a new test`;
        }
        else
            screenText.innerText += `Click for test ${testResults.length + 1}/${totalNumberOfTests}`;
    }

    waitingClick = false;
})

async function getWaitime(){
    const response = await fetch("http://localhost:3000/");
    if(response.ok){
        const jsonResponse = await response.json();
        console.log(jsonResponse);
    }

}