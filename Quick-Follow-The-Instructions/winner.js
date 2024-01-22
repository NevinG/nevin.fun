const urlParams = new URLSearchParams(window.location.search);
const timeElement = document.getElementById("time");
const highscoreElement = document.getElementById("highscore");
const shareLink = document.getElementById("share-link");
const copyLink = document.getElementById("copy-link");

const time = atob(decodeURIComponent(urlParams.get('t')));
const highscore = atob(decodeURIComponent(urlParams.get('h')));
timeElement.innerText = time;
highscoreElement.innerText = highscore;

const encodedTime = encodeURIComponent(btoa(time));
const link = `https://neving.github.io/Quick-Follow-The-Instructions/shareGame?t=${encodedTime}`;
shareLink.innerText = link;
shareLink.href = link;

copyLink.onclick = () => {
    copyToClipboard();
    copyLink.innerText = "Copied";
}

function copyToClipboard(){
    navigator.clipboard.writeText(link);
}