document.addEventListener("DOMContentLoaded", () => {
    const searchdata = document.getElementById("str1") as HTMLInputElement | null;
    const searched = document.getElementById("button1") as HTMLButtonElement | null;
    const printtex = document.getElementById("enteredtext") as HTMLElement | null;

    function printtextAndSearch(): void {
        if (!searchdata || !printtex) {
            console.warn("Required elements are missing from the DOM.");
            return;
        }

        const inputValue = searchdata.value.trim(); // Trim whitespace
        printtex.textContent = inputValue;

        if (inputValue === "zprávy") {
            printtex.innerHTML='<p><a href="./zpravy.cz/zpravyhlavnistr.html"><img src="../images/DALL·E 2024-12-07 17.57.16 - A creative and modern logo design for a news platform, featuring a stylized globe with abstract lines to symbolize connectivity, a bold font for the t.webp"></a></p></a></p>';
        } else {
            console.log("peknej moula");
        }
    }

    searched?.addEventListener("click", printtextAndSearch);
});