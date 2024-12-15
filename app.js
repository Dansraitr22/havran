document.addEventListener("DOMContentLoaded", function () {
    var searchdata = document.getElementById("str1");
    var searched = document.getElementById("button1");
    var printtex = document.getElementById("enteredtext");
    function printtextAndSearch() {
        if (!searchdata || !printtex) {
            console.warn("Required elements are missing from the DOM.");
            return;
        }
        var inputValue = searchdata.value.trim(); // Trim whitespace
        printtex.textContent = inputValue;
        if (inputValue === "zprávy") {
            printtex.innerHTML = '<p><a href="./zpravy.cz/zpravyhlavnistr.html"><img src="../images/DALL·E 2024-12-07 17.57.16 - A creative and modern logo design for a news platform, featuring a stylized globe with abstract lines to symbolize connectivity, a bold font for the t.webp"></a></p></a></p>';
        }
        else {
            console.log("peknej moula");
        }
    }
    searched === null || searched === void 0 ? void 0 : searched.addEventListener("click", printtextAndSearch);
});
