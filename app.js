var searchdata = document.getElementById("str1");
var searched = document.getElementById("button1");
var printtex = document.getElementById("enteredtext");
function printtext() {
    var string1 = searchdata.value;
    printtex.textContent = string1;
}
searched.addEventListener('click', printtext);
function searching() {
    if (searchdata.textContent === "ahoj") {
        console.log("ahoj");
    }
    else {
        console.log("peknej moula");
    }
}
