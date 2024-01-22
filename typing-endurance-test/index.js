const typingAreaContainer = document.getElementById("typing-area-container");
const typingArea = document.getElementById("typing-area");
const typingAreaChild = document.getElementById("typing-area-child");
const blinkingCursor = document.getElementById("blinking-cursor");
const topLine = document.getElementById("top-line");
const middleLine = document.getElementById("middle-line");
const bottomLine = document.getElementById("bottom-line");
const startNewText = document.getElementById("start-new-text");
const highScoreText = document.getElementById("high-score-text");

let blinkInterval = undefined;
let timeElapsed = 0;
let charsTyped = 0;
let firstCharisXCharTyped = 0;
let firstCharisXCharTypedLast = 0;
let wpmInterval = undefined;
const charWidth = getCharWidth();
const wpmText = document.getElementById("wpm-text");
let goalSpeed = 100; //wpm to type in
let testReady = true;
let testOngoing = false;
const wrongColor = "#ff5454";

currentTextLetter = 0;
let currentTextLine = "";
let nextTextLine = "";
let lastTextLine = "";

typingAreaChild.onanimationend = (e) => {
    if (e.srcElement == typingAreaChild) {
        typingAreaChild.className = "";
        addTextToDOM(2);
    }
}

if (localStorage.getItem("hs") == undefined)
    localStorage.setItem("hs", JSON.stringify({}));

resetTest();

//listen for keyboard pressses
document.addEventListener("keypress", (e) => {
    if (e.key == currentTextLine[currentTextLetter] && testReady) {
        //start wpm counter if it hasn't been started
        if (wpmInterval == undefined) {
            highScoreText.style.display = "none";
            wpmInterval = setInterval(updateWPM, 100);
            testOngoing = true;
        }

        charsTyped++;
        currentTextLetter++;
        //update graphics
        blinkingCursor.parentNode.insertBefore(blinkingCursor, blinkingCursor.nextElementSibling.nextElementSibling);
        //reset blinker
        resetBlinker();

        //check if line is complete
        if (currentTextLetter == currentTextLine.length) {

            currentTextLetter = 0;
            lastTextLine = currentTextLine;
            currentTextLine = nextTextLine;
            nextTextLine = generateLine();

            typingAreaChild.className = "test-animation";
            addTextToDOM(1);
            firstCharisXCharTypedLast = firstCharisXCharTyped;
            firstCharisXCharTyped += currentTextLine.length;
        }
    }
});

//add a blinking cursor
function resetBlinker() {
    clearInterval(blinkInterval);
    blinkingCursor.style.backgroundColor = "black";
    blinkInterval = setInterval(startBlinking, 530);
}

function startBlinking() {
    if (blinkingCursor.style.backgroundColor == "black")
        blinkingCursor.style.backgroundColor = "transparent";
    else
        blinkingCursor.style.backgroundColor = "black";
}

function getCharWidth() {
    let char = document.createElement("span");
    document.body.appendChild(char);
    char.innerHTML = "a";
    const width = char.getBoundingClientRect().width;
    char.remove();
    return width;
}

function addTextToDOM(stage) {
    let line1text = "";
    let line2text = "";
    let line3text = "";

    //do correct order of lines
    //TODO, moving the order of these causes animations to reset
    if (stage == 0) {
        line1text = currentTextLine;
        line2text = nextTextLine;
        line3text = "";
    } else if (stage == 1) {
        line1text = lastTextLine;
        line2text = currentTextLine;
        line3text = nextTextLine;
    } else if (stage == 2) {
        line1text = currentTextLine;
        line2text = nextTextLine;
        line3text = "";
    }


    //remove children from TopLine except for "blinking-cursor" and line chaser
    for (let i = 0; i < topLine.children.length; i++) {
        if (topLine.children[i].id != "blinking-cursor" && topLine.children[i].id != "top-line-chaser") {
            topLine.children[i].remove();
            i--;
        }
    }
    //remove children from middle line except for "blinking-cursor" and line chaser
    for (let i = 0; i < middleLine.children.length; i++) {
        if (middleLine.children[i].id != "blinking-cursor" && middleLine.children[i].id != "middle-line-chaser") {
            middleLine.children[i].remove();
            i--;
        }
    }
    //remove children from bottom line
    bottomLine.innerHTML = '';

    //add text to top line
    for (let i = 0; i < line1text.length; i++) {
        const letter = document.createElement("span");
        letter.innerHTML = line1text[i];
        topLine.appendChild(letter);
    }
    //add text to middle line
    for (let i = 0; i < line2text.length; i++) {
        const letter = document.createElement("span");
        letter.innerHTML = line2text[i];
        middleLine.appendChild(letter);
    }
    //add text to bottom line
    for (let i = 0; i < line3text.length; i++) {
        const letter = document.createElement("span");
        letter.innerHTML = line3text[i];
        bottomLine.appendChild(letter);
    }

    //add blinking cursor to correct line
    if (stage == 0) {
        topLine.insertBefore(blinkingCursor, topLine.children[currentTextLetter]);
    }
    else if (stage == 1) {
        middleLine.insertBefore(blinkingCursor, middleLine.children[currentTextLetter]);
    }
    else if (stage == 2) {
        topLine.insertBefore(blinkingCursor, topLine.children[currentTextLetter]);
    }

    //red background for chaser
    for (let i = 0; i < (goalSpeed / 12) * timeElapsed - firstCharisXCharTyped; i++) {
        try {
            topLine.children[i].style.backgroundColor = wrongColor;
        }
        catch (e) {

        }
    }
}

//generates a line of text with the correct amount chars and words
function generateLine() {
    //generate the random line
    let line = "";
    while (true) {
        //get random word
        const word = words[Math.floor(Math.random() * words.length)].toLowerCase();
        if (line.length + word.length > typingAreaContainer.offsetWidth / charWidth)
            break;
        line += word + " ";
    }

    //removes the space at the end of the line
    line = line.substring(0, line.length - 1);

    return line;
}

function updateWPM() {
    timeElapsed += .1;
    const wpm = (charsTyped / timeElapsed * 12)
    const newText = "Words per minute: " + wpm.toFixed(0) + " Time: " + (timeElapsed).toFixed(0) + "s";
    if (newText != wpmText.innerHTML)
        wpmText.innerHTML = newText;

    if (wpm < goalSpeed) {
        endTest();
    }

    //red background for chaser

    if (typingAreaChild.className == "test-animation") {
        for (let i = 0; i < (goalSpeed / 12) * timeElapsed - firstCharisXCharTypedLast; i++) {
            try { topLine.children[i].style.backgroundColor = wrongColor; }
            catch (e) { };
        }
    }
    for (let i = 0; i < (goalSpeed / 12) * timeElapsed - firstCharisXCharTyped; i++) {
        try {
            if (typingAreaChild.className == "test-animation") {
                topLine.children[i].style.backgroundColor = wrongColor;
                middleLine.children[i].style.backgroundColor = wrongColor;
            } else {
                topLine.children[i].style.backgroundColor = wrongColor;
            }
        }
        catch (e) {
        }


    }
}

function resetTest() {
    blinkInterval = undefined;
    timeElapsed = 0;
    charsTyped = 0;
    wpmInterval = undefined;
    testReady = true;
    firstCharisXCharTyped = 0;

    //add typing text
    lastTextLine = "";
    currentTextLine = generateLine();
    nextTextLine = generateLine();
    currentTextLetter = 0;
    addTextToDOM(0);

    //start the blinking cursor
    resetBlinker();

    //set wpm text
    wpmText.innerHTML = `Goal: <input style="width: 3rem" type="number" value="${goalSpeed}" min="20" step="10" onchange="setGoalSpeed(this)"/> words per minute`;
    highScoreText.style.display = "block";
    highScoreText.innerHTML = `High Score (${goalSpeed} wpm): ` + getScore() + " seconds";

    //reset text blur
    typingArea.style.filter = "none";

    //remove start new test text
    startNewText.style.display = "none";

}

function setGoalSpeed(e) {
    e.value = Math.max(20, parseInt(Math.floor(e.value / 10) * 10))
    goalSpeed = parseInt(e.value);
    document.documentElement.style.setProperty('--chaser-duration', (typingAreaContainer.clientWidth / charWidth) / (goalSpeed / 12) + "s");
    highScoreText.innerHTML = `High Score (${goalSpeed} wpm): ` + getScore() + " seconds";
}

function endTest() {
    clearInterval(wpmInterval);
    clearInterval(blinkInterval);
    blinkingCursor.style.backgroundColor = "black";
    testReady = false;
    testOngoing = false;
    typingArea.style.filter = "blur(2px)";
    wpmText.innerHTML = "Time: " + timeElapsed.toFixed(1) + "s";
    saveScore(timeElapsed);

    highScoreText.style.display = "block";
    highScoreText.innerHTML = `High Score (${goalSpeed} wpm): ` + getScore() + " seconds";

    //add click to start new test
    startNewText.style.display = "block";

    //reset on click or enter
    document.addEventListener("click", checkForClick);
    document.addEventListener("keypress", checkForEnter);
    function checkForClick(e) {
        document.removeEventListener("click", checkForClick);
        document.removeEventListener("keypress", checkForEnter);
        resetTest();
    }
    function checkForEnter(e) {
        if (e.key == "Enter") {
            document.removeEventListener("click", checkForClick);
            document.removeEventListener("keypress", checkForEnter);
            resetTest();
        }
    }
}

function getScore() {
    const scores = JSON.parse(localStorage.getItem("hs"));
    if (scores[goalSpeed] != undefined)
        return scores[goalSpeed].toFixed(1);
    return 0;
}

function saveScore(score) {
    const scores = JSON.parse(localStorage.getItem("hs"));
    scores[goalSpeed] = parseFloat(Math.max(score, scores[goalSpeed] ?? 0));
    localStorage.setItem("hs", JSON.stringify(scores));
}