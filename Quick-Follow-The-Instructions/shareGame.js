const urlParams = new URLSearchParams(window.location.search);
const timeElement = document.getElementById("time");
const time = atob(decodeURIComponent(urlParams.get('t')));
timeElement.innerText = time;