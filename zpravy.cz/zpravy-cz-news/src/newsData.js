const zpravyNewsData = [
    { title: "Prezident Clinton Navštívil Kalifornii", content: "Prezident Bill Clinton dnes navštívil Kalifornii, kde se setkal s místními představiteli a diskutoval o otázkách týkajících se životního prostředí a ekonomického rozvoje. Prezident také navštívil několik škol a setkal se s místními obyvateli." },
    { title: "NASA Oznámila Nové Mise na Mars", content: "NASA dnes oznámila plány na nové mise na Mars, které mají za cíl prozkoumat povrch planety a hledat známky života. Mise budou zahrnovat nové rovery a sondy, které budou vybaveny pokročilými vědeckými přístroji." },
    { title: "Zemětřesení v Kalifornii", content: "Silné zemětřesení zasáhlo dnes ráno jižní Kalifornii, způsobilo škody na budovách a infrastruktuře. Úřady hlásí několik zraněných, ale zatím žádné oběti na životech. Záchranné týmy jsou na místě a pomáhají postiženým obyvatelům." },
    { title: "Nový Film Titanic Připravuje Premiéra", content: "Režisér James Cameron dnes oznámil, že jeho nový film Titanic bude mít premiéru v prosinci tohoto roku. Film, který vypráví příběh o tragické plavbě slavného parníku, slibuje být jedním z největších filmových hitů roku." },
    { title: "Microsoft Uvádí Nový Software", content: "Společnost Microsoft dnes představila nový software, který má zlepšit produktivitu a efektivitu v kancelářích. Nový balíček obsahuje aktualizace pro Windows a Office, které přinášejí nové funkce a vylepšení." },
    { title: "Zdravotní Krize v New Yorku", content: "New York čelí zdravotní krizi kvůli nárůstu případů chřipky a dalších respiračních onemocnění. Nemocnice jsou přeplněné a zdravotnické úřady vyzývají obyvatele, aby dodržovali hygienická opatření a nechali se očkovat." },
    { title: "Ekonomika USA Roste", content: "Nové údaje ukazují, že ekonomika USA roste rychlejším tempem, než se očekávalo. Nezaměstnanost klesá a spotřebitelská důvěra je na nejvyšší úrovni za poslední desetiletí. Analytici předpovídají, že tento trend bude pokračovat i v následujících měsících." },
    { title: "Nové Zákony o Kontrole Zbraní", content: "Kongres dnes schválil nové zákony o kontrole zbraní, které mají za cíl snížit násilí spojené se střelnými zbraněmi. Nové předpisy zahrnují přísnější kontroly při nákupu zbraní a zákaz prodeje určitých typů střelných zbraní." },
    { title: "Skandál v Hollywoodu", content: "Hollywood čelí novému skandálu poté, co byly zveřejněny informace o údajném zneužívání moci některými producenty a režiséry. Několik hereček a herců vystoupilo s obviněními, která vyvolala vlnu reakcí v celém filmovém průmyslu." },
    { title: "Sportovní Události", content: "Dnes se konají významné sportovní události po celé zemi. V NBA probíhají play-off zápasy, zatímco v MLB začíná nová sezóna. Fanoušci se těší na napínavé zápasy a doufají, že jejich týmy dosáhnou úspěchu." }
];

const zpravyResultsContainer = document.getElementById('zpravyNewsResults');
if (zpravyResultsContainer) {
    zpravyNewsData.forEach(news => {
        const newsElement = document.createElement('div');
        newsElement.className = 'news-item';
        newsElement.innerHTML = `
            <h2>${news.title}</h2>
            <p>${news.content}</p>
        `;
        zpravyResultsContainer.appendChild(newsElement);
    });
}

