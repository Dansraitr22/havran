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
            printtex.innerHTML='<p><a href="./zpravy.cz/zpravyhlavnistr.html">zprávy random</a></p></a></p>';
        } else {
            printtex.innerHTML="<p>Neznámé vyhledávání</p>";
        }
    }

    searched?.addEventListener("click", printtextAndSearch);
});