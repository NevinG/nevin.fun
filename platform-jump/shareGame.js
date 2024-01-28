const urlParams = new URLSearchParams(window.location.search);
const distanceElement = document.getElementById("distance");
const timeElement = document.getElementById("time");
const dateElement = document.getElementById("date");

const hs = JSON.parse(atob(decodeURIComponent(urlParams.get('hs'))));
distanceElement.innerText = hs.distance;
timeElement.innerText = hs.time;
dateElement.innerText = hs.date;