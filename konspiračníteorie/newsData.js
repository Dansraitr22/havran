// filepath: /c:/Users/Asus/Desktop/havranovi věci/havran/konspiračníteorie/newsData.js

const newsData = [
    {
        "title": "Teorie o Přistání na Měsíci: Skutečnost nebo Podvod?",
        "newsTitle": "Teorie o Přistání na Měsíci: Skutečnost nebo Podvod?",
        "content": "Přistání na Měsíci v roce 1969 je jedním z největších úspěchů lidstva. Nicméně, existují teorie, které tvrdí, že celé přistání bylo zinscenováno NASA ve spolupráci s Hollywoodem. Tato teorie zkoumá důkazy a argumenty obou stran."
    },
    {
        "title": "Ilumináti: Tajná Společnost Řídící Svět",
        "newsTitle": "Ilumináti: Tajná Společnost Řídící Svět",
        "content": "Ilumináti jsou často zmiňováni jako tajná společnost, která tahá za nitky světové politiky a ekonomiky. Tento článek se zaměřuje na historii Iluminátů, jejich údajné členy a vliv na současný svět."
    },
    {
        "title": "Chemtrails: Pravda o Kondenzovaných Stopách",
        "newsTitle": "Chemtrails: Pravda o Kondenzovaných Stopách",
        "content": "Teorie o chemtrails tvrdí, že vlády používají letadla k rozprašování chemikálií do atmosféry za účelem kontroly populace nebo klimatu. Tento článek zkoumá vědecké důkazy a názory odborníků na tuto kontroverzní teorii."
    },
    {
        "title": "Area 51: Místo Setkání s Mimozemšťany?",
        "newsTitle": "Area 51: Místo Setkání s Mimozemšťany?",
        "content": "Area 51 je tajná vojenská základna v Nevadě, která je často spojována s mimozemskými aktivitami. Tento článek se zabývá historií Area 51, svědectvími o UFO a teoriemi o mimozemských technologiích."
    },
    {
        "title": "Nový Světový Řád: Plán na Globální Dominanci",
        "newsTitle": "Nový Světový Řád: Plán na Globální Dominanci",
        "content": "Teorie o Novém Světovém Řádu tvrdí, že existuje tajná skupina elit, která plánuje vytvořit jednu světovou vládu. Tento článek zkoumá původ této teorie, její hlavní zastánce a důkazy, které ji podporují."
    },
    {
        "title": "JFK: Kdo Stojí za Atentátem?",
        "newsTitle": "JFK: Kdo Stojí za Atentátem?",
        "content": "Atentát na prezidenta Johna F. Kennedyho v roce 1963 je jednou z největších záhad moderní historie. Tento článek se zaměřuje na různé teorie o tom, kdo mohl být skutečným pachatelem a jaké byly jeho motivy."
    },
    {
        "title": "9/11: Pravda o Teroristických Útocích",
        "newsTitle": "9/11: Pravda o Teroristických Útocích",
        "content": "Teroristické útoky z 11. září 2001 otřásly celým světem. Existují však teorie, které tvrdí, že útoky byly zinscenovány nebo umožněny vládou USA. Tento článek zkoumá důkazy a argumenty pro a proti těmto teoriím."
    },
    {
        "title": "Reptiliáni: Mimozemské Bytosti mezi Námi",
        "newsTitle": "Reptiliáni: Mimozemské Bytosti mezi Námi",
        "content": "Teorie o reptiliánech tvrdí, že mezi námi žijí mimozemské bytosti, které se maskují jako lidé a ovládají světové vlády. Tento článek se zabývá původem této teorie, jejími hlavními zastánci a důkazy, které ji podporují."
    },
    {
        "title": "HAARP: Kontrola Počasí nebo Vědecký Výzkum?",
        "newsTitle": "HAARP: Kontrola Počasí nebo Vědecký Výzkum?",
        "content": "HAARP (High-Frequency Active Auroral Research Program) je často spojován s teoriemi o kontrole počasí a manipulaci s klimatem. Tento článek zkoumá skutečné účely HAARP a názory odborníků na jeho potenciální vliv na počasí."
    },
    {
        "title": "Konec Světa v roce 2012: Co se Skutečně Stalo?",
        "newsTitle": "Konec Světa v roce 2012: Co se Skutečně Stalo?",
        "content": "Podle mayského kalendáře měl svět skončit v roce 2012. Tento článek se zaměřuje na původ této teorie, proč se nenaplnila a jaké byly reakce lidí po celém světě."
    }
];

function generateLinks() {
    const container = document.getElementById('newsLinks');
    newsData.forEach((news, index) => {
        const linkElement = document.createElement('div');
        linkElement.className = 'news-item';
        linkElement.innerHTML = `
            <a href="newsTemplate.html?newsIndex=${index}">${news.title}</a>
            <p>${news.content.substring(0, 100)}...</p>
        `;
        container.appendChild(linkElement);
    });
}

document.addEventListener('DOMContentLoaded', generateLinks);