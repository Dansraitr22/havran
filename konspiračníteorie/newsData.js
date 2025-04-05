const konspiraNewsData = [
    { title: "Konec Světa v roce 2012: Co se Skutečně Stalo?", content: "Podle mayského kalendáře měl svět skončit v roce 2012. Tento článek se zaměřuje na původ této teorie, proč se nenaplnila a jaké byly reakce lidí po celém světě." },
    { title: "Chemtrails: Pravda o Kondenzovaných Stopách", content: "Teorie o chemtrails tvrdí, že vlády používají letadla k rozprašování chemikálií do atmosféry za účelem kontroly populace nebo klimatu. Tento článek zkoumá vědecké důkazy a názory odborníků na tuto kontroverzní teorii." },
    { title: "Area 51: Místo Setkání s Mimozemšťany?", content: "Area 51 je tajná vojenská základna v Nevadě, která je často spojována s mimozemskými aktivitami. Tento článek se zabývá historií Area 51, svědectvími o UFO a teoriemi o mimozemských technologiích." },
    { title: "Nový Světový Řád: Plán na Globální Dominanci", content: "Teorie o Novém Světovém Řádu tvrdí, že existuje tajná skupina elit, která plánuje vytvořit jednu světovou vládu. Tento článek zkoumá původ této teorie, její hlavní zastánce a důkazy, které ji podporují." },
    { title: "JFK: Kdo Stojí za Atentátem?", content: "Atentát na prezidenta Johna F. Kennedyho v roce 1963 je jednou z největších záhad moderní historie. Tento článek se zaměřuje na různé teorie o tom, kdo mohl být skutečným pachatelem a jaké byly jeho motivy." },
    { title: "9/11: Pravda o Teroristických Útocích", content: "Teroristické útoky z 11. září 2001 otřásly celým světem. Existují však teorie, které tvrdí, že útoky byly zinscenovány nebo umožněny vládou USA. Tento článek zkoumá důkazy a argumenty pro a proti těmto teoriím." },
    { title: "Reptiliáni: Mimozemské Bytosti mezi Námi", content: "Teorie o reptiliánech tvrdí, že mezi námi žijí mimozemské bytosti, které se maskují jako lidé. Tento článek zkoumá původ této teorie, její hlavní zastánce a důkazy, které ji podporují." }
];

// This part seems to be for another context, possibly for displaying news items in a different part of the application
const resultsContainer = document.getElementById('newsResults');
if (resultsContainer) {
    konspiraNewsData.forEach(news => {
        const newsElement = document.createElement('div');
        newsElement.className = 'news-item';
        newsElement.innerHTML = `
            <h2>${news.title}</h2>
            <p>${news.content}</p>
        `;
        resultsContainer.appendChild(newsElement);
    });
}