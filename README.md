# Hur långt är det kvar – manual

Appen: **https://visu250328.github.io/hur-langt-kvar/** · Spelen fristående: [spellabb.html](spellabb.html)


## Om appen

Hur långt är det kvar visar barn i baksätet hur länge en bilresa har kvar, på ett sätt som en 4–6-åring kan följa. En vuxen lägger in resan, och sedan sköter appen resten med hjälp av GPS:en i iPaden eller telefonen.

Appen har två delar:

- **Barnvyn**, som syns hela resan: en förenklad karta, tid kvar i ord, en rad prickar och, om ett matstopp är planerat, hur länge det är till maten.
- **Vuxenpanelen**, bakom knappen Vuxen: val mellan riktig GPS och simulering, testverktyg, statistik och knappar för att hoppa över matstoppet eller avsluta resan.

Appen visar bara körtid kvar. Stopp, köer och omvägar hanteras så att siffran förblir ärlig utan att hoppa fram och tillbaka. Den här manualen finns bara här och länkas inte från appen.

Vad appen inte gör i nuvarande version: den navigerar inte, den känner inte till trafik i realtid, den spårar inte när den ligger i bakgrunden och den fungerar inte utan uppkoppling.

## Installation och drift

Appen består av två filer: hur-langt-kvar.html, med allt innehåll, all stil och all logik, och sw.js, som sparar appen i enheten så att den går att öppna utan uppkoppling. Den behöver ingen egen server och inget konto.

**Publicerad version.** Appen ligger på GitHub Pages i det publika repot hur-langt-kvar och öppnas på https://visu250328.github.io/hur-langt-kvar/. Filen index.html i roten skickar vidare till hur-langt-kvar.html, så den korta adressen går direkt till appen. En ny version läggs upp genom att ladda upp filerna ur zip-filen i repot (Add file → Upload files, med mappen spel) och vänta tills publiceringen under Actions har en grön bock.

Alla filer levereras också samlade i hur-langt-kvar.zip, med rätt mappstruktur: hur-langt-kvar.html, sw.js, spellabb.html och mappen spel med spelfilerna. Packa upp den och lägg innehållet som det är på GitHub Pages.

1. Lägg båda filerna i samma mapp på GitHub Pages, eller annan webbplats som serveras över https.
2. Öppna adressen i Safari på iPaden.
3. Välj Dela och Lägg till på hemskärmen. Då öppnas appen i helskärm utan webbläsarens adressfält.
4. Tillåt platstjänster för sidan första gången den frågar. Öppna appen en gång med uppkoppling, så sparas den i enheten.

Appen måste ligga på https för att GPS:en ska fungera. Öppnad som lokal fil på en dator fungerar kartan, sökningen och simuleringen, men oftast inte GPS:en.

**Enheten måste ha GPS.** En iPad med bara Wi-Fi saknar GPS och får ingen position i bilen, inte heller via en delad uppkoppling från telefonen. Använd en iPad med mobilnät, en telefon, eller en extern GPS-mottagare via Bluetooth eller iPadens kontakt, till exempel Bad Elf. iOS använder en ansluten mottagare för alla appar, även Safari, så appen behöver inga ändringar. Kontrollera före resan att iPaden visar rätt position i Kartor utan Wi-Fi, och att noggrannheten i appens vuxenpanel är bättre än 100 meter.

**Testa på olika sätt.** Vad som fungerar beror på hur appen öppnas:

| Sätt | Fungerar | Fungerar inte |
| --- | --- | --- |
| Html-filen öppnad direkt i webbläsaren | Inläggning, sökning, karta, simulering och alla testverktyg | Sparad app och sparad karta; GPS oftast inte |
| Båda filerna via en lokal server på http://localhost, till exempel python3 -m http.server i mappen | Allt ovan, plus sparad app och sparad karta | GPS i bilen |
| Båda filerna på GitHub Pages | Allt, även GPS på iPaden | – |

Sparad app och sparad karta testas genom att öppna appen med nät, starta en resa och sedan stänga av nätet, i Chrome under Utvecklarverktyg, Nätverk, Offline, eller med flygplansläge på iPaden, och ladda om sidan. sw.js används bara över https eller från localhost.

Den fungerar inte i förhandsvisningen i Claude-chatten och inte som publicerad sida på claude.ai. Där blockeras anropen till kart-, sök- och vägtjänsterna, och kartbiblioteket kan inte starta. Appen visar då ett meddelande i kartytan i stället för en tom yta.

## Lägga in en resa

En resa läggs in på startsidan Vart ska vi åka? och består av start, resmål och eventuellt ett matstopp.

1. **Från.** Välj Där vi är nu, som hämtar enhetens position, eller Annan adress, som visar ett sökfält.
2. **Till.** Skriv resmålet. Efter 3 tecken visas upp till 5 förslag. Sökningen gynnar träffar nära Stockholm, så skriv gärna orten för platser långt bort.
3. **Matstopp (valfritt).** Tryck Lägg till matstopp, sök fram restaurangen eller orten och välj ungefär hur länge ni stannar: 30 minuter, 45 minuter, 1 timme eller 1 timme och 30 minuter. Ta bort matstoppet tar bort det igen. Ett matstopp kan också läggas till efter att resan har startat, i vuxenpanelen.
4. **Hämta vägen.** Appen hämtar bilvägen, genom matstoppet om ett sådant finns, och startar resan.

Om du skriver i ett fält utan att välja ett förslag används den första träffen. Avfärdstid och avfärdsplats sparas i samma ögonblick som resan startar.

**Prova med en påhittad resa** startar en låtsasresa Stockholm–Göteborg på ungefär 400 km med ett påhittat matstopp ungefär halvvägs. Vägen är framräknad, inte en riktig bilväg, men den behöver ingen uppkoppling för att räknas ut. Den startar alltid i simuleringsläge.

Felmeddelanden som kan visas:

| Meddelande börjar med | Orsak |
| --- | --- |
| Skriv vart ni ska åka | Fältet Till är tomt |
| Hittade ingen plats med det namnet | Sökningen gav inga träffar |
| Hittade inte matstoppet | Sökningen efter matstoppet gav inga träffar |
| Kunde inte se var vi är | Platstjänster är avstängda eller positionen tog mer än 15 sekunder |
| Hittade ingen bilväg dit | Vägtjänsten hittade ingen väg, till exempel över hav |
| Fick ingen kontakt med kart- eller vägtjänsten | Ingen uppkoppling, eller sidan körs där anrop blockeras |

## Barnvyn

Barnvyn visar uppifrån och ned: resmålets namn, kartan, en eventuell pausskylt, tid kvar, prickraden, sträcka kvar och raden om maten.

**Kartan** är en riktig karta i en egen, förenklad stil. Den visar vatten, skog, åkrar, tätorter, de största vägarna och landsgränser. Bara städer, tätorter och byar har namn. Kartan går inte att dra eller zooma och visar alltid hela resan: start, vägen ni har kört, vägen kvar, matstoppet och målet. Den zoomar om när rutten ändras.

På kartan betyder:

| Symbol | Betydelse |
| --- | --- |
| Liten rund markering med mörk kant | Starten |
| Bil i gul ring | Där ni är nu; bilen vänds åt det håll ni kör, öster eller väster |
| Tallrik | Matstoppet; bleknar när det är avklarat eller överhoppat |
| Målflagga | Resmålet |
| Gul linje | Vägen ni faktiskt har kört |
| Streckad gul linje | En sträcka ni körde medan appen låg i bakgrunden och där vägen är okänd |
| Vit linje med mörk kant | Den senast beräknade vägen från bilen till målet |
| Halvgenomskinlig bil | GPS saknas en stund, och bilen flyttas uppskattat längs vägen |

**Välj bil.** Ett tryck på bilen på kartan öppnar rutan Vilken bil vill du åka i? med 12 fordon: röd bil 🚗, blå bil 🚙, racerbil 🏎️, taxi 🚕, polisbil 🚓, ambulans 🚑, brandbil 🚒, minibuss 🚐, buss 🚌, pickup 🛻, lastbil 🚚 och traktor 🚜. Det valda fordonet har gul bakgrund. Ett tryck på ett fordon byter bilen på kartan med en liten studs, ett pling och fordonets namn uppläst; ett tryck utanför rutan stänger den utan att byta. Valet sparas i enheten, så varje iPad kan ha sitt eget fordon, och det gäller även nästa resa. Bilen vänds efter färdriktningen som förut, vilket förutsätter att emojin är ritad åt vänster; det stämmer för alla tolv på iPad men inte för alla på andra system, där vissa då kan åka baklänges. Ingen vuxenkod behövs.

**Dag och natt på kartan.** Under resan följer kartan solen där bilen är. Appen räknar ut solens höjd över horisonten utifrån bilens position och klockan, i simuleringen den simulerade klockan, med en förenklad astronomisk formel som ger solnedgången på några minuter när. När solens övre kant har gått under horisonten (höjd under −0,833°, som vid solnedgången) byter kartan till sina mörka färger, och när solen går upp byter den tillbaka till de ljusa. Samtidigt tänder bilen på kartan lamporna: en gul ljuskägla framåt i färdriktningen och en röd baklykta bakåt, och båda vänds när bilen vänder. Kartan följer solen oavsett om iPaden står i ljust eller mörkt läge; innan resans första position är känd följer den enhetens inställning. Resten av appen behåller enhetens ljusa eller mörka läge. Vuxenpanelens statusrad visar solens höjd och om kartan är i dag- eller nattläge.

**Tid kvar** visas i stor text, till exempel Ungefär 1 timme och 10 minuter kvar. Upp till 20 minuter anges exakt i minuter. Över 20 minuter avrundas till närmaste 5 minuter och föregås av Ungefär. All tid skrivs med siffror. Under 300 meter kvar står det Nu är vi nästan framme!

**Prickraden** visar samma sak för den som inte kan läsa: tända prickar är tid kvar, släckta prickar är körtid hittills. Den pågående pricken töms som en tårta, så att något händer även när en prick är 30 minuter eller 1 timme. Pricken där maten kommer har en tallrik. Hur prickarna räknas beskrivs under Logik: prickarna.

**Raden om maten** syns tills matstoppet är avklarat, till exempel Maten om ungefär 40 minuter. Under 300 meter kvar står det Nu är vi nästan vid maten!

**Pausskylten** syns när appen har avgjort att ni står still. Vid matstoppet står det Nu äter vi!, annars Vi har stannat en stund. Tiden kvar fortsätter visa resans körtid kvar under stoppet.

**Framme** visas över hela skärmen när det är mindre än 100 meter kvar. Tryck var som helst för att stänga den.

## Vuxenpanelen

Knappen Vuxen uppe till höger öppnar och stänger panelen. Den är tänkt för den vuxna och ligger ovanpå kartan.

**Vuxenlås.** Under resan skyddas knappen Vuxen av en mattefråga som kräver räkneordning, till exempel 6 + 3 × 4 = eller 2 × 5 + 4 × 6 =. Talen är mellan 2 och 9 och väljs slumpvis varje gång, och de är valda så att man får fel svar om man räknar från vänster till höger: 6 + 3 × 4 är 18, inte 36. Svaret skrivs in med sifferknappar (på dator även med tangentbordet) och bekräftas med OK; inga svarsförslag visas. Fel svar gör att rutan skakar och en ny fråga kommer. Rätt svar öppnar panelen och låser upp den i 5 minuter, så att den går att stänga och öppna igen utan ny fråga. Avbryt stänger rutan. Startsidan, där resan läggs in, har inget lås.

**Position: GPS eller Simulera.** GPS använder enhetens riktiga position och är förvalt för riktiga resor. Simulera kör en låtsasbil och är förvalt för den påhittade resan. Varje byte till Simulera startar simuleringen om från början. Den riktiga resan påverkas inte av simuleringen. Testverktygen beskrivs under Testverktygen i simuleringen.

**Statusraden** visar, i den här ordningen:

- Avfärdstid, eller simulerad klocka och avfärdstid i simuleringen.
- Körd sträcka och körtid, och tid stillastående med hur mycket av den som är uppskattad i efterhand.
- Takten: som beräknat, eller hur många procent långsammare eller snabbare än beräknat. De första 5 minuternas körning visas som räknas efter fem minuters körning.
- Beräknad total restid utan stopp, det vill säga körtid hittills plus körtid kvar.
- Beräknad ankomst som klockslag, med det planerade matstoppets längd inräknad om det inte är avklarat.
- Hur många gånger appen har legat i bakgrunden, om det har hänt.
- När rutten senast räknades ut, och hur långt från vägen ni är om det är mer än 200 meter.

Vid behov visas också: Ingen GPS sedan och klockslaget, när GPS:en har saknats i mer än 15 sekunder; Ingen uppkoppling, när vägen inte kan räknas om; och hur många kartbitar som är sparade för resan.

Under den visas GPS-noggrannheten och om skärmen hålls tänd.

**Lägg till matstopp** syns när inget matstopp är på gång: när resan saknar matstopp, eller när det förra är avklarat eller överhoppat. Sök fram restaurangen eller orten, välj ungefär hur länge ni stannar och tryck Lägg till matstopp. Sökningen gynnar träffar nära bilen. Appen räknar om vägen från bilen via matstoppet, och därefter fungerar det precis som ett matstopp som lades in vid start. Kräver internet; misslyckas omräkningen läggs matstoppet inte till och ett meddelande visas.

**Hoppa över matstoppet** syns bara när ett matstopp är planerat och inte avklarat. Den räknar om vägen direkt till målet.

**Avsluta resan** stänger av GPS:en, raderar den sparade resan och går tillbaka till startsidan.

## Logik: position, spår och körd sträcka

Varje ny position går genom samma steg, oavsett om den kommer från GPS:en eller från simuleringen. Simuleringen har en egen klocka men använder exakt samma kod.

1. **Bilen flyttas** till den nya positionen på kartan.
2. **Osäkra positioner sorteras bort.** Är noggrannheten sämre än 100 meter används positionen bara för att visa bilen, inte för spår, stopp eller rutt.
3. **Lucka eller inte.** Har det gått mer än 1 minut sedan förra godkända positionen hanteras tiden däremellan som en lucka (se Logik: luckor när appen lämnas). Annars fortsätter stegen nedan.
4. **Takten uppdateras** om bilen rullar, alltså går fortare än 0,5 m/s (cirka 2 km/h). Tiden och sträckan sedan förra positionen läggs till det appen har sett köras.
5. **Spåret förlängs** med en punkt om bilen är minst 50 meter från spårets senaste punkt. Avståndet läggs till körd sträcka.
6. **Stopp avgörs** (se Logik: stopp).
7. **Matstoppet kontrolleras** (se Logik: matstoppet).
8. **Avvikelse och ny rutt kontrolleras** (se Logik: ny rutt).

Körd sträcka är summan av spårets delsträckor plus det som fylls i vid luckor. Spåret sparas som en eller flera sammanhängande delar. En ny del börjar efter en lucka där vägen är okänd.

Bilens läge längs vägen räknas genom att positionen projiceras på närmaste punkt på den aktuella rutten. Det ger hur långt längs rutten ni har kommit, och därmed hur stor del av rutten som återstår. Avstånd räknas på jordytan (haversine) eller i en lokal plan projektion i meter med ruttens start som origo.

## Logik: tid och sträcka kvar, takt

Tid kvar är den planerade körtiden kvar på den senaste rutten, justerad efter er egen takt. Stopp räknas aldrig in.

**Sträcka kvar** = ruttens totala längd × andelen av rutten som återstår efter bilens läge. Är bilen inom 100 meter från målet är sträckan 0.

**Planerad tid kvar** = ruttens beräknade körtid × samma andel. Vägtjänsten ger körtiden för hela rutten, och den antas fördelad jämnt över sträckan.

**Utanför rutten:** är bilen mer än 200 meter från rutten läggs vägen tillbaka till den på, tills en ny rutt finns. Sträcka kvar ökar med avståndet till rutten × 1,25, och planerad tid kvar med samma sträcka i planerad medelfart.

**Takten** jämför hur lång tid den sedda körningen tog med hur lång tid den borde ha tagit i resans genomsnittsfart enligt den ursprungliga planen:

```latex
\text{rå takt} = \frac{\text{sedd körtid}}{\text{sedd sträcka} / \text{planerad medelfart}}
```

Rå takt 1,15 betyder att ni kör 15 procent långsammare än beräknat. Bara körning som appen faktiskt har sett räknas: när bilen rullar fortare än 0,5 m/s. Stopp, rödljus och luckor påverkar alltså inte takten. Är den sedda körtiden under 1 minut används takten 1.

Den råa takten vägs in gradvis och begränsas, så att en tillfällig kö i början inte förstör uppskattningen:

```latex
\text{takt} = 1 + w \cdot (\min(1{,}6;\ \max(0{,}8;\ \text{rå takt})) - 1), \quad w = 0{,}8 \cdot \min\left(1;\ \max\left(0;\ \frac{\text{sedd körtid} - 300}{1800}\right)\right)
```

Vikten är 0 de första 5 minuterna, ökar linjärt och når som mest 0,8 efter 35 minuters sedd körning. Takten hamnar därmed alltid mellan 0,84 och 1,48.

**Tid kvar** = planerad tid kvar × takt.

**Beräknad ankomst** i vuxenpanelen = klockan nu + tid kvar + det planerade matstoppets längd, om matstoppet inte är avklarat eller överhoppat.

## Logik: stopp

Ett stopp är när bilen har gått långsammare än 2 m/s (cirka 7 km/h) i mer än 2 minuter. Stoppet räknas från den senaste stunden bilen rörde sig, inte från när det upptäcktes, så alla minuterna kommer med.

Farten tas från GPS:en när den anger fart. Annars räknas den ut från avståndet och tiden mellan två positioner.

Stoppet avslutas vid första position där bilen går fortare än 2 m/s.

Stopp påverkar:

- **Körtiden**, som är tiden sedan avfärd minus all stopptid.
- **Pausskylten** i barnvyn, som syns medan stoppet pågår.
- **Statusraden** i vuxenpanelen, som visar tid stillastående.

Stopp påverkar inte tid kvar, sträcka kvar, takten eller prickarna. Under ett stopp står allt det barnen ser still, utom pausskylten. Ett stopp i början av resan, innan ni har kört iväg, räknas också som stopp och dras alltså inte från takten.

Körning i kö under 7 km/h i mer än 2 minuter räknas som stopp, men den långsamma körningen räknas fortfarande in i takten så länge farten är över 0,5 m/s.

## Logik: ny rutt vid avvikelse och periodiskt

Appen räknar ut en ny väg från bilens position till målet i två fall:

- **Avvikelse:** bilen har varit mer än 200 meter från rutten i mer än 25 sekunder. Bara positioner med noggrannhet bättre än 100 meter räknas.
- **Periodiskt:** det har gått mer än 10 minuter sedan rutten senast räknades, och ni står inte still. Det gäller bara riktig GPS, inte simuleringen.

Till båda gäller att ingen omräkning redan pågår och att det har gått minst 1 minut sedan förra försöket. Misslyckas ett försök, till exempel utan täckning, behålls den gamla rutten och appen försöker igen tidigast 1 minut senare.

Är matstoppet varken avklarat eller överhoppat räknas den nya vägen via matstoppet. Annars räknas den direkt till målet.

När en ny rutt kommer:

- Den vita linjen ersätts av den nya vägen från bilen.
- Den gula linjen, vägen ni redan har kört, påverkas inte.
- Kartan zoomar om så att hela resan syns.
- Tid och sträcka kvar räknas från den nya rutten. Takten behålls, eftersom den bygger på hela resans sedda körning.

Den periodiska omräkningen ger liten effekt i dag, eftersom vägtjänsten inte känner till trafik. Samma väg ger samma tid. Den finns för att ta in en bättre väg om en sådan finns och för att kunna byta till en trafiktjänst senare.

Ett ruttanrop är några kilobyte. Det som drar batteri är skärmen och GPS:en, som ändå är igång hela resan.

## Logik: luckor när appen lämnas

När appen ligger i bakgrunden pausar iOS den och den får inga positioner. Mer än 1 minut mellan två godkända positioner räknas som en lucka. Appen fyller i luckan när första positionen kommer efter den.

**Sträckan i luckan** avgörs av var positionerna före och efter luckan ligger:

| Läge | Spåret på kartan | Körd sträcka |
| --- | --- | --- |
| Båda inom 200 m från rutten, och den senare längre fram på den | Ruttens form mellan punkterna, som vanlig gul linje | Ruttens längd mellan punkterna |
| Annars | Rak streckad gul linje; spåret börjar om på en ny del efter den | Fågelvägen × 1,25 |

**Tiden i luckan** delas upp i körning och stopp. Körtiden sätts till hur lång tid sträckan borde ta i resans genomsnittsfart och er nuvarande takt, dock högst hela luckan. Resten räknas som stopp.

```latex
\text{körtid i luckan} = \min\left(\text{luckans längd};\ \frac{\text{sträcka}}{\text{planerad medelfart}} \cdot \text{takt}\right)
```

Exempel: 40 minuters lucka, 40 km på rutten, planerad medelfart 80 km/h och takt 1. Körtiden blir 30 minuter och stoppet 10 minuter.

Specialfall:

- **Har ni rört er mindre än 200 meter** räknas hela luckan som ett stopp som fortfarande pågår.
- **Stod ni redan still när appen lämnades** förlängs det stoppet med luckans stopptid i stället för att ett nytt skapas.
- **Ett nytt stopp skapas bara om stopptiden är över 2 minuter.**

Stopp som skapas så märks som uppskattade och visas separat i vuxenpanelen. Luckor räknas aldrig in i takten.

Efter luckan körs vanlig kontroll av matstopp och avvikelse. Ligger bilen utanför rutten räknas en ny väg ut när avvikelsen har varat i 25 sekunder.

Resan sparas så fort appen hamnar i bakgrunden, så den finns kvar om iOS stänger sidan. När appen kommer tillbaka ber den igen om att hålla skärmen tänd.

## Logik: utan GPS och utan uppkoppling

GPS och internet hanteras var för sig. Utan GPS blir det en lucka, men under kortare avbrott rullar bilen vidare på skärmen. Utan internet fungerar resan som vanligt, utom att vägen inte kan räknas om.

### Utan GPS

**Bilen rullar vidare (tunnel).** Har det gått mer än 10 sekunder sedan senaste godkända position, och bilen då körde fortare än 2 m/s och var inom 200 meter från rutten, flyttas bilen vidare längs rutten. Farten är 80 procent av den lägsta av senaste farten och planerad medelfart justerad för takten. Uppskattningen pågår i högst 5 minuter och stannar 200 meter före målet.

Den uppskattade positionen används bara för det som visas: bilen, tid kvar, sträcka kvar och tid till maten. Den räknas aldrig som en riktig position, så spår, takt, stopp och luckor påverkas inte. Bilen visas halvgenomskinlig medan den är uppskattad.

Farten är medvetet lägre än er troliga fart. Kommer GPS:en tillbaka visar den då oftast att ni har kommit längre, så tid kvar minskar. Har ni kommit kortare ökar tid kvar lite, och prickarnas tröghet gör att ingen släckt prick tänds igen för några minuter.

**Längre avbrott.** När GPS:en kommer tillbaka efter mer än 1 minut hanteras tiden som en lucka, precis som när appen har legat i bakgrunden (se Logik: luckor när appen lämnas).

### Utan uppkoppling

GPS:en fungerar utan internet, och rutten är redan sparad. Spår, stopp, takt, tid kvar och prickar räknas som vanligt.

**Omväg utan ny rutt.** Är bilen mer än 200 meter från rutten och ingen ny rutt har kunnat hämtas, läggs vägen tillbaka till rutten till: avståndet till närmaste punkt på rutten × 1,25 läggs på sträcka kvar, och samma sträcka i planerad medelfart på planerad tid kvar. Det gäller även de 25 sekunder innan en ny rutt begärs.

**Sparad karta.** All kartdata hämtas via appens eget lager, som först tittar i enhetens cache. När resan startar, och varje gång rutten ändras, sparas kartbitarna för hela resan: kartans synliga yta plus 30 procent åt alla håll, på den zoomnivå kartan visar samt en nivå under och en över, högst 300 kartbitar. Kartbitar som visas sparas också. En ny resa tömmer den sparade kartan från förra resan.

**Sparad app.** Filen sw.js sparar appen och kartbiblioteket i enheten första gången appen öppnas med uppkoppling. Laddas sidan om utan nät, till exempel när iOS har stängt den i bakgrunden, öppnas den sparade versionen och fortsätter den sparade resan. Med uppkoppling hämtas alltid den senaste versionen av appen.

**Det som kräver uppkoppling:** att lägga in en resa, söka, lägga till matstopp, räkna om vägen och visa kartdelar utanför den sparade ytan.

Vuxenpanelen visar när GPS:en har saknats i mer än 15 sekunder, när uppkopplingen saknas och hur många kartbitar som är sparade.

## Logik: matstoppet

Ett planerat matstopp läggs in som en via-punkt: vägtjänsten räknar rutten start → matstopp → mål. Rutten består då av två delsträckor, och appen sparar den första delsträckans längd, körtid och andel av hela rutten.

**Tid till maten** = första delsträckans körtid × andelen av den som återstår × takten. Andelen räknas från bilens läge längs rutten. Samma avrundning används som för tid kvar.

**Matstoppet räknas som avklarat** när något av följande inträffar:

- bilen är inom 300 meter från matstoppet, eller
- bilen är på rutten (inom 200 meter) och har kommit mer än 500 meter förbi matstoppets läge längs rutten.

När matstoppet är avklarat försvinner raden om maten och tallriken i prickraden, kartans tallrik bleknar och nya rutter räknas direkt till målet. Står ni still inom 500 meter från ett avklarat matstopp visar pausskylten Nu äter vi!

**Matstopp som läggs till under resan:** den vuxna kan lägga till ett matstopp i vuxenpanelen när inget annat matstopp är på gång. Appen hämtar då en ny rutt från bilens position via matstoppet till målet. Den nya rutten börjar vid bilen, så tid till maten och avklarat-kontrollen räknas från där ni är. Lyckas inte omräkningen behålls den gamla rutten och matstoppet läggs inte till. Ett tillagt matstopp ersätter ett tidigare avklarat eller överhoppat, så kartan visar bara det senaste. I simuleringen läggs matstoppet bara till i simuleringen och försvinner när den börjar om.

**Hoppa över matstoppet** markerar det som överhoppat och räknar om vägen från bilen direkt till målet. Utan uppkoppling försvinner matraden ändå, men den vita linjen går via matstoppet tills en omräkning lyckas.

Matstoppets planerade längd används bara för beräknad ankomst i vuxenpanelen. Den syns inte för barnen och påverkar inte tid kvar.

## Logik: prickarna

Varje prick är en fast tidsenhet som väljs en gång per resa utifrån den ursprungligt planerade körtiden, så att raden får högst 24 prickar:

| Planerad körtid | En prick är |
| --- | --- |
| Upp till 4 timmar | 10 minuter |
| Upp till 12 timmar | 30 minuter |
| Längre | 1 timme |

**Tända prickar** = tid kvar delat med enheten, avrundat uppåt. **Släckta prickar** = hela enheter körtid hittills, avrundat nedåt. Raden är summan av båda och kan därför bli längre eller kortare under resan. Släckta prickar står till vänster, tända till höger, i samma riktning som resan.

**Den pågående pricken töms.** Den första tända pricken, närmast de släckta, är den som pågår. Den töms som en tårta: en allt större bit försvinner medsols från klockan 12, i takt med tid kvar inom den pricken. När den är tom slocknar den och nästa prick börjar tömmas. Andelen som är kvar är (tid kvar − (tända prickar − 1) × enheten) / enheten, begränsad till 0–1. Övriga prickar är alltid hela, så att de går att räkna.

Eftersom planerad körtid sällan är ett jämnt antal enheter är den pågående pricken oftast delvis tömd redan vid start. En resa på 4 timmar och 42 minuter med 30-minutersprickar börjar till exempel med 10 prickar där den första är 40 procent full.

Eftersom stopp varken räknas i körtiden eller ändrar tid kvar står prickraden helt stilla under ett stopp.

**Prickar tänds inte igen i onödan.** Antalet tända prickar får alltid minska direkt. Det får bara öka om tid kvar har blivit mer än 3 minuter längre än vad de tända prickarna redan visar. Ökar tid kvar mindre än så fylls den pågående pricken på i stället. Ökar den mer får de nya prickarna en kort animation, så att det syns att resan blev längre, till exempel efter en omväg eller i kö. Under 3 minuter står antalet kvar, och den pågående pricken är full tills tiden har hunnit ikapp.

**Matpricken:** pricken som motsvarar när ni är framme vid maten visas större och med en tallrik. Den räknas som pricken nummer tid till maten delat med enheten, avrundat uppåt, bland de tända prickarna.

Under raden står vad en prick betyder, till exempel Varje prick är 10 minuter.

När simuleringen börjar om, eller vid byte mellan GPS och simulering, nollställs prickarnas minne, så att raden visar läget direkt utan tröghet.

## Testverktygen i simuleringen

Simuleringen kör en låtsasbil genom samma kod som GPS:en, med en egen klocka. Därför testar verktygen den riktiga logiken. Simuleringen har ett eget tillstånd och ändrar aldrig den riktiga, sparade resan.

Låtsasbilen kör i resans planerade medelfart, delat med vald trafik. Den skickar en position minst var 1 000:e meter, med noggrannheten 5 meter.

| Verktyg | Vad det gör |
| --- | --- |
| Slidern | Kör bilen fram till vald andel av den nuvarande vägen. Bakåt börjar simuleringen om från start och kör fram till samma andel av den planerade vägen. |
| 0 %, 25 %, 50 %, 75 %, 97 %, 100 % | Som slidern, med fasta värden. |
| Trafik framåt: Som beräknat, Segt, Kö | Låtsasbilen kör i takt 1, 1,25 eller 1,5 gånger planerad tid från och med nu. |
| Stå still 15 min | Skickar en position var 30:e sekund på samma ställe i 15 minuter. Stoppet syns efter 2 minuter och pausskylten tills bilen kör igen. |
| Kör en omväg | Kör 1,5 km rakt åt sidan om rutten i 6 steg och räknar sedan om vägen därifrån. Kräver internet. |
| Lämna appen i 40 min: körde vi | Klockan går 40 minuter och bilen hoppar fram 40 minuters körning längs vägen. |
| Lämna appen i 40 min: åt vi lunch | Klockan går 40 minuter och bilen hoppar fram 10 minuters körning. Ger cirka 30 minuters uppskattat stopp. |
| Lämna appen i 40 min: tog vi en annan väg | Klockan går 40 minuter och bilen hamnar 1,5 km från vägen efter 32 minuters körning. Ger en streckad linje och en ny väg. Kräver internet. |
| Tunnel 3 min | Klockan går 3 minuter och bilen kör vidare, men inga positioner kommer fram. Bilen visas uppskattad och halvgenomskinlig. Dra slidern för att komma ut ur tunneln; då fylls tiden i som en lucka. |
| Internet: på / av | Stänger av uppkopplingen för vägberäkningen i simuleringen. Kombinera med Kör en omväg för att se tid kvar räknas med vägen tillbaka till rutten. |

Efter en omväg eller en annan väg följer låtsasbilen den nya vägen, och slidern visar andel av den omräknade vägen. Etiketten under slidern säger vilken väg som gäller.

Den påhittade resan kan inte räkna om vägen utan internet, eftersom omräkningen alltid går till den riktiga vägtjänsten. Då visas Kunde inte räkna om vägen. Det kräver internet.

Simuleringen testar inte GPS-mottagningen, platstjänsternas behörigheter, skärmen tänd eller vad iOS gör med sidan i bakgrunden. Det behöver testas i bilen.

## Lagring, omladdning och skärmen tänd

Den pågående resan sparas i webbläsarens lagring på enheten, under nyckeln hur-langt-kvar-resa-v3. Inget skickas till någon server utöver anropen till kart-, sök- och vägtjänsterna.

Det som sparas: start, resmål, matstopp, planerad rutt, aktuell rutt, avfärdstid, spåret, gissade sträckor, stopp, körd sträcka, sedd körning för takten, antal luckor och senaste position.

Resan sparas:

- när den startar,
- högst var 15:e sekund under körning,
- direkt vid ny rutt och tillagt eller överhoppat matstopp,
- när appen hamnar i bakgrunden eller stängs.

Laddas sidan om fortsätter appen den sparade resan i GPS-läge, eller i simuleringsläge för den påhittade resan. Avsluta resan raderar den sparade resan. Simuleringen sparas aldrig.

**Skärmen tänd:** appen ber webbläsaren hålla skärmen tänd under resan (Wake Lock). iOS släpper det när appen lämnas, och appen ber om det igen när den kommer tillbaka, och vid varje tryck i appen om det har släppts. Vuxenpanelen visar läget. Stöds det inte av webbläsaren står det där, och då behöver automatisk låsning stängas av i iPadens inställningar.

**Sparad karta och app:** kartbitarna för resan sparas i enhetens cache (hlk-karta) och töms när en ny resa läggs in. Under en lång resa med många omräkningar hålls cachen under cirka 4000 kartbitar: över det tas de äldsta bort ned till 3000, aldrig den pågående resans. Appen, spelen och kartbiblioteket sparas av sw.js (hlk-app-v12). Se Logik: utan GPS och utan uppkoppling.

## Externa tjänster och beroenden

Appen använder fyra öppna tjänster utan konto eller nyckel. Alla kräver uppkoppling. Kartdatan för resan och appen sparas dock i enheten och fungerar utan nät.

Spelet Slangbellan använder dessutom fysikbiblioteket Matter.js 0.20.0 (MIT-licens). Det ligger i projektet, i spel/lib, och kräver ingen uppkoppling.

| Tjänst | Används till | Adress |
| --- | --- | --- |
| Photon (Komoot) | Adressökning och förslag | photon.komoot.io |
| OSRM, publik server | Bilväg, körtid, sträcka och via-punkt | router.project-osrm.org |
| OpenFreeMap | Kartdata och typsnitt för ortnamn | tiles.openfreemap.org |
| MapLibre GL JS 4.7.1 | Kartbiblioteket som ritar kartan | cdn.jsdelivr.net |

Appen laddar också typsnittet Baloo 2 från Google Fonts. Saknas det används enhetens rundade systemtypsnitt.

Kartdatan kommer från OpenStreetMap via OpenMapTiles. Kartan visar källangivelsen nere till höger, som licensen kräver.

OSRM:s publika server är gratis men avsedd för lätt användning, och den känner inte till trafik. För trafikanpassad tid behövs en betaltjänst, till exempel Google, Mapbox eller TomTom.

Under resan används tjänsterna så här: kartdata hämtas när kartan ritas, vägtjänsten anropas vid start, vid avvikelse, var 10:e minut och vid tillagt eller överhoppat matstopp. Sökningen används på startsidan och när ett matstopp läggs till under resan.

## Kända begränsningar

De viktigaste begränsningarna i nuvarande version, med vad de innebär i praktiken:

- **Ingen spårning i bakgrunden.** Webbsidor pausas av iOS. Den uppskattade bilen hjälper bara vid korta avbrott när appen är öppen. Luckor fylls i efteråt, men stopp och vägval under luckan är uppskattade. Riktig bakgrundsspårning kräver en iOS-app.
- **Ingen trafikinformation.** Köer syns först när de påverkar er sedda takt, och takten vägs in gradvis.
- **Delvis beroende av uppkoppling.** Att lägga in en resa, söka, lägga till matstopp och räkna om vägen kräver nät. Under resan fungerar appen och den sparade kartan utan nät, men en omväg räknas grovt tills nätet är tillbaka.
- **Jämnt fördelad körtid.** Planerad tid kvar antas fördelad jämnt över rutten. Motorväg först och småväg sist ger därför för låg tid kvar i början.
- **Rutter som går nära sig själva.** Bilen kan kortvarigt placeras på fel del av rutten, till exempel vid en ramp eller en slinga.
- **Ett matstopp i taget.** Ett nytt kan läggas till först när det förra är avklarat eller överhoppat.
- **Sökningen på startsidan gynnar Stockholmsområdet.** Platser långt bort kan behöva orten i sökningen. Under resan gynnar sökningen i stället bilens position.
- **Den påhittade resan** följer ingen riktig väg och ser därför konstig ut på kartan.
- **Spel och andra planerade funktioner** är inte inkopplade i appen ännu. Spelen testas i spellabbet.

## Spel under resan

Spelen låses upp längs vägen. Vid start finns inga spel; efter en stund kommer det första, sedan ett till, och när ett tredje kommer försvinner det första. Det finns alltså högst två spel att välja mellan åt gången. Vilket spel som kommer bestäms av en kategori för just det steget och av en slumpgenerator som utgår från resans startdatum och resmål, så att två enheter i samma bil alltid får samma spel samtidigt.

### Kategorier

| Kategori | Spel |
| --- | --- |
| Titta ut | Bilbingo |
| Lugna | Memory, Pussel, Vad kommer sen?, Första bokstaven, Räkna, Färglägg, Prick till prick, Koppla ihop, Klä på dockan, Bygg bilen, Tornet, Labyrinten, Hitta felen, Tågbanan, Fiskdammen, Klockan |
| Aktiva | Slangbellan, Ballonger, Helikoptern, Kurragömma, Godisbyte, Parkera, Musik, Kontrollpanelen, Masken, Murbrytaren, Pip, Färgminnet, Papperskorgen |

Husdjuret ingår inte i turordningen: det finns på hyllan hela resan, från start till slut (se Spelhyllan nedan). Spellistan har version 11 sedan Papperskorgen lades till bland de aktiva spelen (version 10: Klockan bland de lugna) (version 9: Tågbanan och Fiskdammen) (version 8: Färgminnet bland de aktiva) (version 7: Hitta felen; version 6: Labyrinten) (version 5: Pip bland de aktiva; version 4: Tornet bland de lugna) (version 3: Masken och Murbrytaren i turordningen och Husdjuret med egen plats). Versionen ingår i ordningen, så två enheter med olika versioner får olika spel även med samma kod; öppna båda med nät så att de har samma version.

Det första spelet är alltid Bilbingo, det andra ett lugnt spel, och sedan varvas aktiva och lugna spel, så att hyllan oftast har ett av varje. De sista 30 minuterna före resmålet och när spelet låses upp klockan 19 eller senare kommer bara lugna spel, för att varva ner.

### När spelen låses upp

Upplåsningen sker vid fasta punkter räknat bakåt från resmålet, i planerad tid kvar, inte efter klockan. Två enheter i samma bil ser bilen på samma ställe och låser därför upp samtidigt, även om den ena startade resan lite senare eller tappade GPS en stund. Vid stopp och matstopp rör sig inte bilen, så då låses heller inget upp, och sover barnen väntar ingen hög med spel när de vaknar.

| Resans planerade längd | Prick | Nytt spel | Varje spel finns kvar |
| --- | --- | --- | --- |
| Upp till 4 timmar | 10 minuter | Var 15:e minut | Cirka 30 minuter |
| Längre än 4 timmar | 30 minuter eller 1 timme | Var 20:e minut | Cirka 40 minuter |

Punkterna ligger på jämna avstånd från resmålet: 15, 30, 45 minuter kvar och så vidare (eller 20, 40, 60 vid längre resor). Det första spelet kommer vid den första punkten som ligger minst 15 minuter in på resan, alltså efter 15–30 minuter (15–35 minuter vid längre resor). Eftersom två spel ligger på hyllan samtidigt finns varje spel kvar i ungefär dubbla tiden mellan två nya spel. Den sista punkten ligger minst 15 minuter före resmålet, så inga nya spel kommer de allra sista minuterna. En resa som är kortare än cirka 30 minuter hinner inte nå någon punkt, så där kommer inga spel av sig själva. Punkterna sammanfaller inte alltid med prickarna; ikonen för ett kommande spel sitter på den prick som pågår när spelet låses upp. Går man en omväg så att tiden kvar ökar låses inga spel igen; de som har kommit finns kvar. Exempel: den påhittade resan Stockholm–Göteborg (planerad till 4 timmar och 42 minuter) ger första spelet efter 22 minuter och sedan ett nytt var 20:e minut, totalt 13 spel.

### Slumpgeneratorn och ordningen

Ordningen inom varje kategori bestäms av en fyrsiffrig kod och en slumpgenerator med fast frö (mulberry32 med en FNV-1a-hash). Koden räknas fram från resans startdatum (året, månaden och dagen då resan startade, så att en kvällsresa förbi midnatt inte byter ordning) och resmålets koordinater avrundade till två decimaler (så att hemresan samma dag får en ny ordning). Ordningen räknas sedan fram enbart från koden och spellistans version. Samma dag och samma resmål ger alltså samma kod och samma ordning på alla enheter. Inom en kategori kommer inget spel två gånger förrän alla i kategorin har varit med, och ett spel som redan ligger på hyllan hoppas över.

**Spelordningens kod.** I vuxenpanelen står till exempel Spelordningens kod: 2373 och spellistans version. Samma kod på båda enheterna betyder samma ordning. Olika koder betyder att enheterna har olika resmål (till exempel två olika träffar i sökningen) eller olika startdatum.

**Om koderna skiljer sig åt:** skriv in koden från den ena enheten i rutan Kod på den andra och tryck på Använd koden. Då får båda exakt samma ordning, och det går även mitt i resan: de spel som redan har låsts upp räknas om med den nya koden, med samma tider, så att hyllorna blir lika direkt. Statusraden visar då (inskriven) efter koden, och länken Använd den här enhetens egen kod ångrar. Den inskrivna koden sparas med resan och gäller tills resan avslutas. Koden kan inte rätta olika versioner av spellistan: står det olika versioner behöver enheten öppnas med nät så att den hämtar den senaste appen.

### Hur det visas för barnen

**Spelhyllan** under prickraden visar först Husdjuret, med gul kant, som finns hela resan, sedan de två spel som finns just nu som stora knappar med ikon och namn, och efter dem nästa spel som en grå ikon i en ring som fylls i takt med att bilen närmar sig punkten där det låses upp.

**Prickraden** visar ikonerna för de tre kommande spelen ovanför de prickar där de låses upp. Nästa spel har färg, de andra är grå. Barnen kan alltså räkna prickar fram till nästa spel. Prickarnas plats följer tiden kvar med takten, så ikonen kan ligga en prick fel om bilen kör mycket fortare eller långsammare än beräknat.

**Nytt spel.** När ett spel låses upp spelas ett pling, knappen hoppar fram på hyllan och rösten säger Nu finns ett nytt spel: till exempel Memory!. Låses flera upp samtidigt, till exempel efter en lång paus i simuleringen, sägs bara det sista.

**Spel som somnar.** De sista 5 minuterna innan ett nytt spel kommer bleknar det äldsta spelet på hyllan och får en måne 🌙. Sedan försvinner det utan röst. Spelar barnet det spelet just då får det spela klart; spelet försvinner först när man går ur det.

### Spela

Ett tryck på ett spel öppnar det över hela skärmen med knappen ← Tillbaka till resan överst. Spelet körs i en egen ram, filen spel.html, så att appens och spelets utseende inte påverkar varandra och ett fel i ett spel inte kan störa kartan eller tidsberäkningen. Resan fortsätter att räknas under tiden, och Framme! visas ovanpå spelet om man kommer fram. Spelens sparade lägen delas med spellabbet om de körs från samma adress.

### Vuxenpanelen: Spel

- **Nivå:** Liten (4 år) eller Stor (6 år) för den här enheten. Ställ in varje barns iPad var för sig; valet sparas i enheten och används för alla spel.
- **Ljud på/av** för spelen och för plinget och rösten när ett spel låses upp.
- **Spel på/av:** av tar bort hyllan och ikonerna i prickraden.
- **Status:** spelordningens kod och spellistans version, hur många spel som har låsts upp och vilket spel som kommer härnäst om hur många minuters körning. Under statusen finns rutan för att skriva in koden från den andra enheten.
- **Lås upp nästa spel nu** låser upp nästa spel direkt, och resten av resan ligger ett steg före. Tryck på båda enheterna, annars hamnar de olika.

### Installation och utan nät

Lägg spel.html och mappen spel bredvid hur-langt-kvar.html (allt finns i zip-filen). Service workern sparar startsidan, appen, spelvärden, alla 31 spel och fysikbiblioteket i enheten första gången appen öppnas med nät (cache hlk-app-v12), så att spelen fungerar utan nät under resan. Vid varje öppning försöker den hämta en ny version, men väntar högst 3,5 sekunder på nätet: med dålig täckning visas den sparade versionen direkt och den nya hämtas klart i bakgrunden till nästa gång.

## Genomgång och tester (november 2026)

Hela appen och alla 31 spel gicks igenom efter buggar och möjliga effektiviseringar.

**Stresstest av spelen.** Varje spel kördes på båda nivåerna i liggande läge och på liten nivå i stående läge, med 100 slumpvisa tryck, svep och tangenttryck per körning (93 körningar, cirka 9 300 åtgärder). Inga fel uppstod. Efter stopp (som när man trycker ← Tillbaka till resan) fanns inga lyssnare, öppna ljud eller animationer kvar. De få fördröjningar som löser ut efter stopp är avsiktliga (ljudet tonas ut innan det stängs). I appen töms dessutom spelramen helt när ett spel stängs.

**Mörkt läge.** Om iPaden byter till mörkt läge (till exempel automatiskt på kvällen) får spelen mörka färger. Kontrollen mätte kontrasten för all text i alla spel i både ljust och mörkt läge och hittade text som inte gick att läsa: Prick till prick hade svarta prickar på mörkblått (brädet är nu alltid vitt), och gula eller vita rutor i Musik, Kontrollpanelen, Fiskdammen, Papperskorgen, Husdjuret, Koppla ihop, Bygg bilen, Färglägg och Pip hade ljus text. De har nu fast mörk text, och den valda låten i Musik har fast blå bakgrund. Efter rättningen fanns ingen text med för svag kontrast.

**Nätanrop med tidsgräns.** I bilen kan uppkopplingen se ut att finnas utan att något går igenom. Vägtjänsten har nu en tidsgräns på 15 sekunder, platssökningen 10 sekunder och kartbitarna 12 sekunder. Efter tidsgränsen behandlas det som att nätet saknas: knappen Hämta vägen blir klickbar igen med meddelandet om att kontakten saknas, och omräkning av rutten försöker igen efter en minut i stället för att hänga.

**Batteri.** Kartans linjer skickas bara till kartan när de har ändrats, och kartan ritas inte alls medan ett spel ligger över den (den ritas när spelet stängs). Labyrinten och Papperskorgen ritar bara när något rör sig; förut ritade de 60 bilder per sekund även när inget hände. Spel där något rör sig hela tiden (Masken, Fiskdammen, Helikoptern, Pip, Slangbellan, Murbrytaren, Kontrollpanelen och fläkten i Papperskorgen på stor nivå) ritar som förut.

**Appen.** En påhittad resa kördes från start till mål med vuxenlås (fel svar ger ny fråga, rätt svar öppnar), upplåsning av spel, öppna och stänga spel och framme, utan fel. Kartan kan inte provas i testmiljön, eftersom kartservern inte nås därifrån.

## Spelbiblioteket och spellabbet

Spelen byggs som ett bibliotek av fristående spel som testas i spellabbet. De är ännu inte inkopplade i huvudappen; senare ska de låsas upp längs resan.

**Filer:**

| Fil | Innehåll |
| --- | --- |
| spellabb.html | Testsidan som listar och startar spelen |
| spellabb-fristaende.html | Spellabbet med alla spel inbakade i en enda fil, för snabb test. Skapas på nytt från spellabb.html och spelfilerna när ett spel ändras. |
| spel.html | Spelvärden: huvudappen visar ett spel i en ram med den här sidan, som laddar bara det spelets filer |
| spel/bilbingo.js | Bilbingo |
| spel/memory.js | Memory |
| spel/monster.js | Vad kommer sen? |
| spel/pussel.js | Pussel |
| spel/kurragomma.js | Kurragömma |
| spel/forstabokstaven.js | Första bokstaven |
| spel/slangbellan.js | Slangbellan |
| spel/lib/matter.min.js | Fysikbiblioteket Matter.js 0.20.0, som Slangbellan behöver. Laddas före spelet. Licensen ligger i spel/lib/matter-LICENSE.txt. |
| spel/ballonger.js | Ballonger |
| spel/helikoptern.js | Helikoptern |
| spel/klapadockan.js | Klä på dockan |
| spel/rakna.js | Räkna |
| spel/parkera.js | Parkera (Parkera bilarna och Ut ur garaget) |
| spel/godis.js | Godisbyte |
| spel/farglagg.js | Färglägg |
| spel/prickar.js | Prick till prick |
| spel/musik.js | Musik (piano, trummor och gitarr) |
| spel/byggbilen.js | Bygg bilen |
| spel/koppla.js | Koppla ihop |
| spel/panelen.js | Kontrollpanelen |
| spel/masken.js | Masken |
| spel/murbrytaren.js | Murbrytaren |
| spel/husdjuret.js | Husdjuret |
| spel/hanoi.js | Tornet (Tornet i Hanoi) |
| spel/pip.js | Pip (plattformsspel) |
| spel/labyrint.js | Labyrinten |
| spel/hittafelen.js | Hitta felen |
| spel/fargminnet.js | Färgminnet |
| spel/tagbanan.js | Tågbanan |
| spel/fiskdammen.js | Fiskdammen |
| spel/klockan.js | Klockan |
| spel/papperskorgen.js | Papperskorgen (paper toss) |

spellabb.html ligger bredvid hur-langt-kvar.html, och spelen i undermappen spel. Spellabbet går att öppna direkt som fil i webbläsaren, utan server. Den fristående versionen kräver ingen mapp alls och är enklast att testa med. Den finns också publicerad som sida på claude.ai, [Spellabb – Hur långt är det kvar](https://claude.ai/artifact/1mTQ6xhbM57vBdVUmPa22y), som går att öppna direkt på datorn eller iPaden och uppdateras när spelen ändras.

**Gemensamt gränssnitt.** Varje spel är en egen fil som lägger till sig i en gemensam lista och anger:

- id, namn, symbol och en kort beskrivning för vuxna,
- en startfunktion som ritar spelet i en given yta och lämnar tillbaka en funktion för att avsluta det.

Startfunktionen får nivå (liten för cirka 4 år, stor för cirka 6 år), om ljud är på, en egen del av webbläsarens lagring och en funktion att anropa när spelet är klart. Huvudappen behöver därför inte veta något om hur ett spel fungerar inuti.

**Regler för alla spel:**

- Spelet ska gå att förstå utan att läsa; text är bara stöd för vuxna.
- Stora knappar, minst cirka 40 punkter.
- Inga förluster, ingen tidspress och inget som kan gå fel.
- Lugna rörelser, så att ingen blir åksjuk, och respekt för inställningen minska rörelse. Helikoptern är ett medvetet undantag, eftersom bilden rullar; se dess avsnitt.
- Kort att spela klart, men går att avsluta när som helst och sparar sitt läge, utom spel där en omgång tar under 1 minut.
- Fungerar utan nät.
- Fungerar i ljust och mörkt läge.

**Spellabbet** har reglage för nivå, ljud och skärmstorlek: iPad liggande eller stående, telefon liggande eller stående, eller hela fönstret. Den valda storleken skalas ned om fönstret är mindre, så proportionerna stämmer. Under spelet visas vald nivå och ljud, och när spelet anropar att det är klart. Rensa sparade spel tar bort alla spels sparade lägen. Nivå och ljud gäller nästa gång ett spel startas.

**Lägga till ett spel:** skapa en ny fil i mappen spel enligt gränssnittet och lägg till en rad med filen i spellabb.html. Spelet syns då i listan.

**Kontroll av utseende:** utöver att logiken testas körs spelen i en riktig webbläsare i liggande och stående iPad-storlek, och skärmbilder granskas innan ett spel lämnas över.

**Unika namn.** I spellabbet delar alla spel samma sida, så ett spels stilregler gäller även andra spels element med samma klassnamn. Varje spel har därför ett eget kort namn på sitt yttersta element och ett eget prefix på alla andra klasser och på stilblockets id (till exempel laby och laby- för Labyrinten, pip och pip- för Pip). Ett nytt spel måste få ett namn som inget annat spel använder, varken som prefix eller som vanligt klassnamn. Före varje publicering kontrolleras automatiskt att inget spels regler utan prefix träffar klassnamn som ett annat spel använder. Kontrollen infördes efter två krockar: Pip använde först samma prefix som Prick till prick, och Labyrinten hette först lb, samma namn som en lampa i blåljuset i Bygg bilen, som då sträcktes ut över hela bilden. I huvudappen körs varje spel i en egen ram och kan inte krocka.

## Spel: Bilbingo

Barnen tittar ut genom fönstret och trycker på bilderna av det de ser. En hel rad ger bingo, och hela brickan avslutar spelet. Spelet ger en paus från skärmen, eftersom blicken är ute.

**Nivåer:**

| Nivå | Bricka | Innehåll |
| --- | --- | --- |
| Liten, cirka 4 år | 3 × 3, 9 rutor | Bara vanliga saker |
| Stor, cirka 6 år | 4 × 4, 16 rutor | 10 vanliga och 6 ovanliga saker |

**Saker att leta efter.** Vanliga: ko, häst, får, hund, fågel, lastbil, buss, traktor, röd bil, blå bil, cykel, motorcykel, tåg, bro, hus, gran, flagga, trafikljus, bensinmack och båt. Ovanliga: polisbil, ambulans, brandbil, älg, rådjur, flygplan, kyrka, slott, byggkran, stoppskylt, regnbåge och husbil. Varje ny bricka slumpas fram ur listorna.

Bilderna är emojier, utom flaggan, som ritas av spelet som en svensk flagga på flaggstång. Flaggemojier visas nämligen som bokstäverna SE på bland annat Windows. Även brickor som sparades med den gamla flaggemojin visar den ritade flaggan.

**Så fungerar en ruta.** Varje ruta visar en stor bild och namnet i mindre text. Ett tryck markerar rutan gul med en bock; med ljud på hörs en kort ton och namnet läses upp med svensk röst. Ett nytt tryck tar bort markeringen, om barnet tryckte fel.

**Bingo.** När en rad, kolumn eller diagonal är hel får dess rutor en tjock kant, och skärmen visar Bingo! med tre stjärnor i cirka 3 sekunder, eller tills någon trycker. Tas en markering bort räknas raden inte längre. Varje ny rad firas för sig.

**Hela brickan.** När alla rutor är markerade visas Hela brickan! med en knapp för ny bricka, och spelet anropar att det är klart. Brickan går inte att ändra därefter.

**Ny bricka** uppe till höger kräver två tryck inom 3 sekunder, så att ingen råkar börja om.

**Sparat läge.** Brickan sparas efter varje tryck, en för varje nivå, och finns kvar när spelet startas igen.

**Ljud:** tonerna skapas i spelet och namnen läses upp av enhetens talsyntes. Båda fungerar utan nät, om enheten har en svensk röst installerad.

## Spel: Memory

Korten ligger med baksidan upp, och barnen vänder två i taget för att hitta par. Det går att spela själv eller två och två på samma iPad. Ingen vinner eller förlorar.

**Nivåer:**

| Nivå | Kort | Par |
| --- | --- | --- |
| Liten, cirka 4 år | 6 | 3 |
| Stor, cirka 6 år | 12 | 6 |

Bilderna är djur och slumpas fram för varje nytt spel ur 20 djur: hund, katt, kanin, räv, björn, panda, groda, apa, gris, ko, lejon, tiger, höna, pingvin, sköldpadda, bläckfisk, fjäril, bi, uggla och häst. Korten placeras i det antal kolumner som ger störst kort på skärmen.

**Start.** Ett nytt spel börjar med frågan hur många som spelar: Själv, med en dinosaurie, eller Två och två, med en dinosaurie och en enhörning.

**Vända kort.** Ett tryck vänder kortet, med en kort ton om ljud är på.

- **Par:** korten stannar uppvända med gul kant, en glad ton hörs och djurets namn läses upp. Samma spelare fortsätter.
- **Inte par:** korten vänds tillbaka efter cirka 1,3 sekunder. Under tiden går inga andra kort att vända. Spelar två går turen över.

**Två och två.** Uppe visas båda spelarnas symboler med antal hittade par. Den som har turen är tydligare, större och har gul kant. Varje hittat par får en liten symbol för vem som hittade det.

**Alla par.** När alla par är hittade visas Alla par! och, vid två spelare, hur många par var och en hittade, utan att någon utses till vinnare. Spelet anropar att det är klart, och Nytt spel går tillbaka till frågan om antal spelare.

**Nytt spel** uppe till höger kräver två tryck inom 3 sekunder under ett pågående spel.

**Sparat läge.** Spelet sparas efter varje vändning som avslutas, ett för varje nivå. Kort som var uppvända utan att vara par vänds tillbaka när spelet startas igen.

## Spel: Vad kommer sen?

Ett mönster av bilder visas på en rad, och den sista platsen är ett frågetecken. Barnet väljer vad som kommer härnäst bland några svarsknappar. En omgång är 5 mönster.

**Nivåer:**

| Nivå | Mönstertyper | Svarsknappar |
| --- | --- | --- |
| Liten, cirka 4 år | AB (oftast), ABB, AAB | 3 |
| Stor, cirka 6 år | ABC, AABB, ABB, AAB, AABC | 4 |

Bokstäverna står för olika bilder; AAB betyder till exempel hund, hund, katt, hund, hund, katt.

**Bilderna** tas ur en grupp per mönster: djur, frukt, fordon, färgade cirklar eller sol, måne och natur. Varje grupp har 6 bilder.

**Hur ett mönster byggs.** Raden visar minst 6 bilder och minst två hela varv av mönstret, så att det går att se, och högst 9 bilder. Frågetecknet hamnar på varierande plats i varvet. Svarsknapparna är rätt svar, de andra bilderna i mönstret och vid behov fler bilder ur samma grupp, i slumpad ordning.

**Rätt svar:** frågetecknet fylls med bilden, rätt knapp får gul kant, en glad ton hörs och bildens namn läses upp. Efter cirka 1,4 sekunder kommer nästa mönster.

**Fel svar:** knappen vickar lite, tonar bort och går inte att välja igen, med en svag, låg ton. Inget annat händer, och barnet kan försöka igen tills rätt svar är hittat.

**Framsteg:** 5 prickar uppe fylls i allteftersom mönstren löses. Efter 5 mönster visas Bra jobbat! med stjärnor, spelet anropar att det är klart och Spela igen startar en ny omgång.

**Nytt spel** kräver två tryck inom 3 sekunder under en pågående omgång.

**Sparat läge.** Omgången sparas efter varje val, en för varje nivå, inklusive vilka fel svar som redan har tonats bort. Stängdes spelet precis efter ett rätt svar fortsätter det med nästa mönster.

## Spel: Pussel

En bild är delad i fyrkantiga bitar som barnet lägger på rätt plats på en bräda. Bitarna går bara att lägga på rätt plats, så inget kan bli fel.

**Nivåer:**

| Nivå | Bitar | Hjälpbild |
| --- | --- | --- |
| Liten, cirka 4 år | 4 (2 × 2) | Hela bilden syns svagt på brädan |
| Stor, cirka 6 år | 9 (3 × 3) | Ingen, bara rutor |

**Bilderna** ritas av spelet självt, med enkla former och bildsymboler, så inga bildfiler behövs: Bilen, Huset, Båten, Kon, Natten och Tåget. Ett nytt pussel börjar på en slumpad bild, och Nästa pussel tar nästa bild i tur och ordning.

**Brädan och bitarna.** I liggande läge ligger brädan till vänster och de lösa bitarna till höger; i stående läge brädan överst och bitarna under. De lösa bitarna ligger i slumpad ordning och är så stora som får plats, högst lika stora som platserna på brädan.

**Lägga en bit** går på två sätt:

- **Dra:** bitarna följer fingret i full storlek. Släpps biten nära sin rätta plats, inom knappt halva rutans storlek från mitten, fastnar den där. Annars glider den tillbaka bland de lösa bitarna.
- **Trycka:** ett tryck på en bit markerar den med gul ram, och ett tryck på rätt plats på brädan lägger den där. Trycker man på fel plats vickar biten lite. Ett nytt tryck på samma bit tar bort markeringen.

**Klart.** När sista biten ligger på plats hörs en fanfar, bildens namn läses upp och efter en halv sekund visas Pusslet är klart! ovanpå den färdiga bilden, som syns igenom. Spelet anropar att det är klart, och Nästa pussel startar nästa bild.

**Nytt pussel** kräver två tryck inom 3 sekunder under ett pågående pussel.

**Sparat läge.** Pusslet sparas efter varje lagd bit, ett för varje nivå, med bild, vilka bitar som ligger på plats och ordningen på de lösa bitarna.

## Spel: Kurragömma

En lugn variant av whack-a-mole. Djur tittar upp ur hål på en gräsmatta, och barnet trycker på dem för att hitta dem. Ingen slår på något, och den som inte hinner trycka gör inget fel: djuret kryper bara ned igen.

**Nivåer:**

|  | Liten, cirka 4 år | Stor, cirka 6 år |
| --- | --- | --- |
| Hål | 6 (3 × 2) | 9 (3 × 3) |
| Djur per omgång | 15 | 20 |
| Nytt djur ungefär var | 1,7 sekund | 1,15 sekund |
| Djuret stannar uppe | 2,8 sekunder | 2 sekunder |
| Djur uppe samtidigt | Högst 1 | Högst 2 |

Tiden mellan djuren varierar slumpmässigt mellan 80 och 120 procent av värdet i tabellen. Djuren väljs bland hamster, mus, kanin, igelkott, ekorre och groda, och dyker upp i ett slumpat ledigt hål.

**Start.** Spelet börjar med en stor startknapp, så att det inte drar igång innan barnet är redo.

**Hitta ett djur:** ett tryck på ett djur som är uppe ger en stjärna som flyger upp, en glad ton i lite olika höjd och en stjärna till i räknaren uppe till höger. Djuret blir glatt en kort stund och kryper sedan ned. Tryck på tomma hål gör ingenting.

**Slut.** När alla djur i omgången har varit uppe visas Bra jobbat! med antal hittade djur, spelet anropar att det är klart och Spela igen startar en ny omgång.

**Paus.** Låses iPaden eller lämnas appen pausas omgången, och djuren som var uppe kryper ned. Den fortsätter när man kommer tillbaka.

**Inget sparat läge.** En omgång tar under 1 minut, så den sparas inte. Det är ett medvetet undantag från regeln att spelen sparar sitt läge.

## Spel: Första bokstaven

Tre bilder visas på saker som börjar på samma bokstav, med ordet under. Första bokstaven är bortplockad och ersatt av en tom ruta, till exempel \_OLL, \_OK och \_AJS. Barnet väljer rätt bokstav bland stora knappar. En omgång är 5 bokstäver, och samma bokstav kommer inte två gånger i en omgång.

**Nivåer:**

| Nivå | Bokstäver | Knappar | Felalternativ |
| --- | --- | --- | --- |
| Liten, cirka 4 år | A, B, F, G, H, K, L, M, O, P, S och T | 2 | En annan av samma vanliga bokstäver |
| Stor, cirka 6 år | Alla som finns i ordlistan, även Ä och Ö | 4 | I första hand bokstäver som liknar den rätta i form eller ljud, som B, D och P eller M och N |

**Orden** skrivs med versaler. Varje bokstav har 3–8 ord med en bild som barn känner igen, och tre av dem slumpas fram. Bokstäver som saknar tre bra bildord är inte med: Q, W, X, Y, Z och Å.

**Höra ordet:** ett tryck på en bild läser upp ordet, så att barnet kan lyssna efter första ljudet.

**Rätt svar:** rutorna i alla tre ord fylls med bokstaven, knappen får gul kant, en glad ton hörs och bokstaven och de tre orden läses upp med en kort paus mellan varje ord. Nästa bokstav kommer 1,2 sekunder efter att uppläsningen är klar. Med ljud av, eller om enheten inte kan läsa upp, kommer nästa bokstav efter cirka 3 sekunder. Spelet väntar aldrig längre än 12 sekunder, ifall uppläsningen fastnar.

**Fel svar:** knappen vickar lite, tonar bort och går inte att välja igen, med en svag, låg ton. Barnet kan försöka igen tills rätt bokstav är hittad.

**Framsteg och slut:** 5 prickar uppe fylls i allteftersom. Efter 5 bokstäver visas Bra jobbat!, spelet anropar att det är klart och Spela igen startar en ny omgång.

**Nytt spel** kräver två tryck inom 3 sekunder under en pågående omgång.

**Sparat läge.** Omgången sparas efter varje val, en för varje nivå, inklusive vilka fel svar som redan har tonats bort.

## Spel: Slangbellan

En egen variant av slangbellespel. Barnet drar en boll bakåt i en slangbella och släpper, och bollen flyger mot ett torn av träklossar. Målet är att få loss alla tre stjärnorna. Det finns obegränsat antal skott, så det går inte att misslyckas. Kameran står still och hela banan syns hela tiden, så att ingen blir åksjuk. Figurerna är egna: en röd boll med glatt ansikte, träklossar och stjärnor.

**Banor.** Spelet har 8 banor med stigande svårighet. Varje bana har tre stjärnor.

| Bana | Namn | Upplägg |
| --- | --- | --- |
| 1 | Tornet | Ett torn av två pelare, en planka, två lådor och en planka till, med en stjärna högst upp och en på marken mellan pelarna. En tredje stjärna står på en egen stolpe till höger. |
| 2 | Två torn | Ett lågt bord med en stjärna och ett högre torn av tre lådor med en stjärna överst. Den tredje stjärnan ligger på marken bakom tornet. |
| 3 | Höga tornet | Ett torn i tre våningar med en stjärna högst upp, en i mitten och en på marken under. |
| 4 | Muren | En mur av tre lådor med en stjärna överst skyddar ett bord med två stjärnor bakom sig. |
| 5 | Hyllan | En hylla av sten på en stenstolpe bär ett litet torn med två stjärnor. Under hyllan ligger en stjärna på marken, och en stapel lådor står framför. Kräver minst två skott: ett högt upp på hyllan och ett lågt. |
| 6 | Pyramiden | En pyramid av tio lådor med en stjärna högst upp, en stjärna på marken bakom och en högst upp på en smal stolpe längst till höger. |
| 7 | Borgen | Två murar av lådor med ett tak emellan. En stjärna på vänstra muren, en på taket mellan två lådor och en skyddad på marken inne i borgen. |
| 8 | Stenhyllan | En hög stenhylla på en stenstolpe med ett litet torn och en stjärna på, ett lådtorn till höger med en stjärna överst och en stjärna gömd på marken under hyllan. Kräver minst två skott. |

**Välja bana.** Uppe finns en knapp per bana, numrerade 1–8. Klara banor är gula, och den valda har en blå ring. Ett tryck på en knapp byter bana direkt. När en bana är klar leder Nästa bana till nästa, och efter bana 8 börjar man om från bana 1.

**Sten.** Grå block är sten som sitter fast och inte påverkas av bollen. Övriga block är trä.

**Nivåer:**

|  | Liten, cirka 4 år | Stor, cirka 6 år |
| --- | --- | --- |
| Bollens storlek | Större | Mindre |
| Siktlinje | Lång, visar nästan hela banan | Kort, bara början |

Banorna är desamma på båda nivåerna.

**Sikta och skjuta.** Barnet trycker på eller nära bollen, drar bakåt och släpper. Ju längre drag, desto hårdare skott, upp till en gräns. Ett mycket kort drag räknas inte som skott. Medan man drar visas vita prickar där bollen kommer att flyga, räknade med samma fysik som spelet. Innan första skottet visar en hand var man ska dra.

**Stjärnorna.** En stjärna är loss när bollen träffar den eller när den har flyttats en bit, till exempel för att tornet rasar. Den flyger då upp och försvinner med en glad ton, och räknaren uppe fylls i.

**Ny boll.** När bollen har stannat, lämnat banan eller flugit i 9 sekunder läggs en ny boll i slangbellan. Klossarna ligger kvar där de hamnade.

**Klart.** När alla tre stjärnor på en bana är loss blir banans knapp gul, Alla stjärnor! visas och spelet anropar att det är klart. Knappen leder till nästa bana, eller till bana 1 efter sista banan; är alla banor klara står det Alla banor klara!. Börja om uppe till höger bygger upp samma bana på nytt och kräver två tryck inom 3 sekunder.

**Paus och sparat läge.** Låses iPaden pausas spelet. Vilken bana man är på och vilka banor som är klara sparas, en gång per nivå. Själva banan, med klossarnas läge, sparas inte, eftersom den går snabbt att spela om; precis som Kurragömma är det ett undantag från regeln om sparat läge.

**Fysiken** sköts av Matter.js: tyngdkraft, friktion, studs och att klossar välter och rasar. Stillastående klossar vilar tills något stöter till dem, så att tornet står stadigt innan det träffas.

**Kontroll av banorna.** Varje bana provas med samma fysik som spelet, på båda nivåerna. Först körs banan i 8 sekunder utan skott, och ingen stjärna får röra sig: tornet ska stå stadigt av sig självt. Sedan provas 70 olika skott, med vinklar från 5 till 70 grader och dragstyrka från 60 till 100 procent, och det bästa skottet väljs i tur och ordning tills alla stjärnor är loss. Alla 8 banor går att klara: bana 1–4 och 7 med ett skott, bana 6 med ett skott på liten nivå och två på stor, och bana 5 och 8 med två.

## Spel: Ballonger

Ballonger i olika färger stiger sakta och vajar lätt mot en himmel. Barnet trycker på dem för att poppa dem. Ballonger som inte poppas flyger bara iväg upptill, utan att något händer.

**Nivåer:**

|  | Liten, cirka 4 år | Stor, cirka 6 år |
| --- | --- | --- |
| Ballonger per omgång | 20 | 26 |
| Tid från botten till topp | 9–11 sekunder | 6,5–8 sekunder |
| Ny ballong ungefär var | 1,3 sekund | 0,95 sekund |
| Ballonger i luften samtidigt | Högst 3 | Högst 5 |
| Vilka ger stjärna | Alla | Bara den färg som gäller |

Tiden mellan ballongerna varierar slumpmässigt mellan 80 och 120 procent av värdet i tabellen. Färgerna är röd, blå, gul, grön, lila och orange, och ballongerna ritas av spelet.

**Liten nivå: färger.** Varje poppad ballong ger en stjärna, och färgens namn läses upp, till exempel Röd!, så att fyraåringen övar färger.

**Stor nivå: rätt färg.** Uppe visas vilken färg som gäller, med en ballong och färgens namn, och spelet säger till exempel Poppa de blå!. Ungefär hälften av ballongerna har den färgen. Färgen byts efter var sjunde ballong, med en kort markering och uppläsning. Ballonger i andra färger går också att poppa, men ger ingen stjärna; det är inget fel och inget som straffar.

**Poppa:** ett tryck på en ballong ger ett mjukt pop-ljud och små bitar i ballongens färg som sprids ut. Ger den en stjärna flyger en stjärna upp, en ton hörs och räknaren uppe till höger ökar.

**Start och slut.** Spelet börjar med en stor startknapp. När alla ballonger i omgången har poppats eller flugit iväg visas Bra jobbat! med antal stjärnor, spelet anropar att det är klart och Spela igen startar en ny omgång.

**Paus och sparat läge.** Låses iPaden pausas omgången. En omgång tar under 1 minut och sparas inte, som Kurragömma.

## Spel: Helikoptern

Ett flygspel inspirerat av Tiny Wings, med en helikopter. Barnet håller inne för att stiga och släpper för att sjunka, plockar stjärnor på vägen och landar på en helikopterplatta efter cirka 1 minut.

**Åksjuka.** Det här är det enda spelet där bilden rör sig hela tiden, och sådana spel gör lättare barn åksjuka i bil. Därför:

- rullar bilden bara i sidled och i jämn fart; himlen och marken flyttar sig aldrig upp och ned och inget skakar,
- rör sig moln och avlägsna kullar långsammare än marken, men lugnt,
- är en tur kort, cirka 1 minut.

Prova själv hur det känns i bilen innan barnen spelar länge.

**Nivåer:**

|  | Liten, cirka 4 år | Stor, cirka 6 år |
| --- | --- | --- |
| Fart framåt | Lugnare | Cirka 40 procent snabbare |
| Hur snabbt helikoptern stiger och sjunker | Mjukt | Lite kvickare |
| Stjärnor | Rader och små vågor, glest | Även höga bågar och dalar, tätare |

**Styrning.** Håll fingret var som helst på spelytan för att stiga, släpp för att sjunka. Mellanslag fungerar också på en dator. Helikoptern lutar lite åt det håll den rör sig, och rotorn snurrar.

**Inga krascher.** Nuddar helikoptern backen studsar den mjukt upp med ett lågt ljud. Högst upp tar himlen stopp. Det finns inget sätt att förlora.

**Stjärnor.** Stjärnorna ligger i grupper om fem, i rader, vågor, bågar eller dalar, och slumpas fram för varje tur. Helikoptern plockar en stjärna när den kommer nära, med en ton och en stjärna som flyger upp.

**Framsteg.** Uppe visas en linje där en liten helikopter rör sig mot en målflagga, som i huvudappen.

**Landning och slut.** Vid målet glider helikoptern av sig själv ned och landar på plattan. Sedan visas Framme! med antal stjärnor, spelet anropar att det är klart och Flyg igen startar en ny tur med nya stjärnor.

**Paus och sparat läge.** Låses iPaden pausas turen. En tur tar cirka 1 minut och sparas inte, som Kurragömma.

## Spel: Klä på dockan

Ett skapande spel utan mål: barnet klär en figur i kläder från olika yrken och teman och blandar fritt. Inget kan bli fel. Figuren och alla kläder ritas av spelet, i lager ovanpå varandra.

**Plagg och teman.** Det finns fem sorters plagg och sex teman, med ett plagg av varje sort per tema:

| Tema | Hatt | Tröja | Byxor | Skor | Sak |
| --- | --- | --- | --- | --- | --- |
| Polis | Polismössa | Polisskjorta | Polisbyxor | Svarta skor | Radio |
| Brandman | Brandhjälm | Brandjacka | Brandbyxor | Stövlar | Brandsläckare |
| Ballerina | Diadem | Balettdräkt | Tutu | Balettskor | Ros |
| Pirat | Piratskepa | Randig tröja | Piratbyxor | Piratstövlar | Kikare |
| Astronaut | Rymdhjälm | Rymddräkt | Rymdbyxor | Rymdkängor | Flagga |
| Kock | Kockmössa | Kockrock | Rutiga byxor | Träskor | Stekpanna |
| Dinosaurie 🦖 | Dinoluva (taggar, ögon och tänder) | Dinodräkt (ljus mage) | Dinobyxor (prickar) | Dinofötter (klor) | Dinosvans (taggar) |
| Snickare 🔨 | Bygghjälm | Rutig skjorta | Snickarbyxor (knäskydd, tumstock) | Arbetskängor | Hammare |
| Doktor 🩺 | Pannspegel | Läkarrock (stetoskop, pennor) | Gröna byxor | Vita skor | Läkarväska |
| Superhjälte 🦸 | Ögonmask | Superdräkt (mantel, blixt, handskar) | Superbyxor (bälte) | Superstövlar | Sköld |
| Trollkarl 🧙 | Trollkarlshatt (stjärnor) | Stjärnmantel (måne) | Lång kjortel | Spetsiga skor | Trollstav (gnistrar) |
| Fotbollsspelare ⚽ | Keps | Fotbollströja (nummer 10) | Shorts | Fotbollsskor (strumpor och dobbar) | Fotboll |

De sex sista temana lades till senare, så det finns nu 12 teman med 60 plagg och saker. Temaknapparna (hela dräkter) går över två rader. Superhjältens mantel och handskar och trollkarlens långa kjortel ritas som en del av tröjan respektive byxorna, så de följer med när man blandar plagg.

**Klä på.** Flikarna Hattar, Tröjor, Byxor, Skor och Saker visar plaggen som bilder. Ett tryck tar på plagget, som får gul ram, och med ljud på läses namnet upp. Ett tryck till på samma plagg tar av det. Ett nytt plagg av samma sort byter ut det gamla.

**Figuren.** Fliken Figur har 4 hudfärger, 4 hårfärger (brunt, ljust, svart och rött) och 3 frisyrer (kort, långt och lockigt), så att barnen kan göra en figur som liknar dem själva. Utan skor syns bara fötter.

**Hela dräkter.** En rad med en knapp per tema klär på alla fem plagg från det temat på en gång, och temats namn läses upp. Blanda väljer ett slumpat plagg av varje sort från olika teman, och ibland inget. Ta av allt tar av alla plagg.

**Klar!** uppe till höger tar en kort blixt, som ett foto, visar Så snygg! över figurens ben, läser upp det och anropar att spelet är klart. Man kan fortsätta klä om efteråt.

**Nivåer.** Spelet är detsamma på båda nivåerna.

**Sparat läge.** Figuren och kläderna sparas efter varje ändring och finns kvar nästa gång.

**Liggande och stående.** I liggande läge står figuren till vänster och plaggen till höger. I stående läge står figuren överst och plaggen under.

## Spel: Räkna

Ett räknespel med olika upplägg för de två nivåerna. En omgång är 5 uppgifter.

**Liten nivå, cirka 4 år: peka och räkna.** Spelet visar 1–6 likadana saker, till exempel äpplen, i rader om högst 5, och frågar Hur många äpplen?. Barnet trycker på sakerna en i taget: varje tryck sätter nästa tal på saken och läser upp det, ett, två, tre. Det övar att räkna en sak i taget. Sedan väljer barnet svar bland 3 knappar, som visar både siffran och samma antal prickar som på en tärning, så att det går att svara utan att kunna siffrorna. De två första uppgifterna har högst 3 saker.

**Stor nivå, cirka 6 år: räkna till 20, plus, minus och gånger.** Anpassad för ett barn som räknar till 20 och kan enkla gånger. En omgång har 1 räkneuppgift, 1 plus, 1 minus och 2 gånger, i slumpad ordning.

| Uppgift | Tal | Visas som | Exempel |
| --- | --- | --- | --- |
| Räkna | 11–20 saker | Sakerna i rader om 5 | 15 ballonger i 3 rader |
| Plus | 3–12 plus 2–9, svar högst 20 | Talet stort överst och två grupper, i rader om 5, med ett plustecken mellan | 5 + 8 = ? |
| Minus | 8–20 minus 2–9 | Talet stort överst och en grupp där de sista är överkryssade och gråa | 14 − 4 = ? |
| Gånger | 2–5 gånger 2–5, svar högst 25 | Talet stort överst och sakerna i lika många rader som första talet, med lika många i varje rad som andra talet | 3 × 4 = ? som 3 rader med 4 i varje |

Frågan läses upp, till exempel tre gånger fyra. Under sakerna står en hjälptext, vid gånger till exempel 3 rader med 4 i varje. Sakerna går att trycka och räkna som hjälp, utom de överkryssade, och talen läses upp ända till tjugofem. Barnet väljer bland 4 svar, bara siffror. Sparade omgångar från den tidigare versionen, med tal upp till 10, börjas om automatiskt.

**Svarsalternativen** är rätt svar och tal nära det, i slumpad ordning.

**Bilderna** är äpplen, nyckelpigor, bilar, stjärnor, fiskar, ankor, ballonger och jordgubbar, en sort per uppgift.

**Rätt svar:** knappen får gul kant, frågetecknet fylls i och svaret läses upp, till exempel tre äpplen! eller två plus tre är fem!. Nästa uppgift kommer 1,2 sekunder efter uppläsningen, eller efter cirka 3 sekunder utan ljud, och aldrig senare än efter 10 sekunder.

**Fel svar:** knappen vickar, tonar bort och går inte att välja igen. Barnet kan försöka igen.

**Slut, nytt spel och sparat läge** fungerar som i Första bokstaven: Bra räknat! efter 5 uppgifter, Nytt spel med två tryck och sparad omgång per nivå.

## Spel: Parkera

Ett bilspel med två olika varianter: Parkera bilarna på liten nivå och Ut ur garaget på stor nivå. Bilarna och lastbilarna ritas uppifrån av spelet.

### Liten nivå: Parkera bilarna

En parkering har 5 parkeringsrutor överst, var och en i en färg med en färgad prick, och 5 bilar i samma färger nedanför, i en annan ordning. Färgerna väljs bland röd, blå, gul, grön, lila och orange.

Barnet drar en bil och släpper den på en ruta. Har rutan samma färg glider bilen in, den tutar och färgen läses upp, till exempel Röd bil!. Har rutan en annan färg rullar bilen tillbaka med en svag ton. Släpps den någon annanstans rullar den bara tillbaka.

När alla 5 står på rätt plats visas Alla parkerade!, spelet anropar att det är klart och Parkera igen blandar nya färger och ordning. Börja om kräver två tryck inom 3 sekunder. Parkeringen sparas efter varje parkerad bil.

### Stor nivå: Ut ur garaget

Ett skjutpussel i stil med spelet Rush Hour. Garaget är 6 × 6 rutor med en grön utgång till höger på tredje raden. Den röda bilen ska ut genom utgången. Bilar, som är 2 rutor långa, och lastbilar, som är 3 rutor långa, går bara att skjuta fram och tillbaka i sin egen riktning och stannar när de stöter i något.

**Styrning.** Dra ett fordon längs sin riktning; det följer fingret och lägger sig i närmaste ruta när det släpps. Ett fordon som fått fokus går också att flytta en ruta i taget med piltangenterna.

**Banor.** Det finns 10 banor som kräver 2, 3, 4, 5, 6, 7, 8, 10, 12 och 14 drag, där ett drag är att flytta ett fordon, oavsett hur långt. Knapparna 1–10 uppe väljer bana; klara banor är gula och den valda har en blå ring.

**Klart.** När den röda bilen når utgången tutar den och kör ut, banans knapp blir gul och Ut ur garaget! visas. Nästa bana leder vidare, och efter bana 10 börjar man om från bana 1; är alla klara står det Alla banor klara!. Börja om ställer tillbaka samma bana och kräver två tryck. Fordonens lägen sparas efter varje drag.

**Hur banorna togs fram.** Ett program placerade fordon slumpmässigt och löste varje uppställning genom att pröva alla möjliga drag, steg för steg, tills den röda bilen kom ut. Uppställningar som krävde exakt det antal drag som behövdes valdes ut. Alla 10 banor har lösts igen ur spelfilen och spelats igenom i en riktig webbläsare med lösningarna.

## Spel: Godisbyte

Ett eget tre-i-rad-spel med godis, inspirerat av Candy Crush. Barnet byter plats på två godisbitar som ligger bredvid varandra så att tre eller fler likadana hamnar i rad. Raden försvinner, bitarna ovanför faller ned och nya fyller på uppifrån. Bildas nya rader av det blir det kedjereaktioner.

**Godisbitarna** skiljer sig både i färg och form, så att de går att skilja åt även för den som har svårt med färger: röd rund, blå fyrkant, gul stjärna, grön triangel, lila romb och rosa hjärta. Alla ritas av spelet.

**Nivåer:**

|  | Liten, cirka 4 år | Stor, cirka 6 år |
| --- | --- | --- |
| Bräde | 6 × 6 | 8 × 8 |
| Sorters godis | 4 | 5 |
| Godis för full burk | 40 | 80 |

**Byta.** Dra en godisbit mot en granne, eller tryck på en bit, som förstoras, och sedan på en bit bredvid. Ger bytet ingen rad glider bitarna tillbaka med en svag ton; det kostar ingenting.

**Inget sätt att förlora.** Det finns inga begränsade drag och ingen tid. Målet är att fylla godisburken uppe, en mätare som visar antal godis av målet.

**Kedjor.** Varje omgång i en kedjereaktion spelar en lite ljusare ton. Vid andra omgången står det Snyggt!, vid tredje Superbra! och vid fjärde eller fler Fantastiskt!.

**Hjälp.** Har barnet inte gjort något på 6 sekunder vickar två godisbitar som går att byta. Finns inga drag kvar på brädet står det Vi blandar om!, och bitarna blandas om så att det finns minst ett drag och inga färdiga rader. Ett nytt bräde läggs alltid ut så att det finns drag och inga färdiga rader.

**Slut.** När burken är full visas Burken är full!, spelet anropar att det är klart och Spela igen lägger ut ett nytt bräde. Nytt bräde uppe till höger kräver två tryck inom 3 sekunder.

**Sparat läge.** Brädet och antal godis sparas efter varje byte, ett för varje nivå.

## Spel: Färglägg

En målarbok. Barnet väljer en svartvit bild, väljer en färg och trycker på en yta i bilden; hela ytan fylls direkt med färgen. Det går inte att måla utanför, och inget kan bli fel.

**Bilderna** är egna teckningar med tydliga, stora ytor: Fågel, Polisbil, Brandbil, Hjullastare, Mobilkran, Grävmaskin, Traktor och Segelbåt. Varje bild har en bakgrund och oftast en mark att färglägga, och mellan 10 och 19 ytor. Linjer som dörrspringor, stegpinnar och texten POLIS ligger ovanpå och färgläggs inte.

**Bildlistan** visar alla bilder som små bilder med den färg de har just nu. Ett tryck öppnar bilden och läser upp namnet. ← Bilder går tillbaka till listan.

**Färgerna** är 14: röd, orange, gul, ljusgrön, grön, ljusblå, blå, lila, rosa, brun, ljusbrun, grå, svart och vit. Vit fungerar som suddgummi för en enskild yta. Ett tryck på en färg väljer den, markerar den med en blå ring och läser upp färgens namn.

**Knappar.** Ångra tar tillbaka den senaste fyllningen, och kan tryckas flera gånger. Sudda allt gör hela bilden vit igen och kräver två tryck inom 3 sekunder. Klar! visar Så fint! och anropar att spelet är klart; man kan fortsätta måla efteråt.

**Liggande och stående.** I liggande läge står bilden till vänster och färgerna i två kolumner till höger. I stående läge ligger färgerna i rader under bilden.

**Nivåer.** På liten nivå fyller ett tryck hela ytan, som ovan. På stor nivå finns två verktyg ovanför färgerna: 🖌️ Pensel, som är förvalt, och 🪣 Fyll, som fyller hela ytan.

**Penseln (stor nivå).** Man målar med fingret. Ett penseldrag stannar i den yta där det började, så färgen hamnar aldrig utanför linjerna, men man kan måla mönster, prickar och ränder inne i ytan. Drar man vidare över en annan yta syns draget bara i den första; börjar man till exempel i himlen och drar över bilen syns draget bara på himlen bakom bilen. Penseln finns i tre storlekar, liten, mellan och stor, som visas när penseln är vald; mellan är förvald. Det går att fylla en yta först och sedan måla ovanpå. Vit färg fungerar som suddgummi även med penseln. Ångra tar bort det senaste penseldraget eller den senaste fyllningen.

**Sparat med pensel.** Varje bild sparar både fyllningar och penseldrag, och bildlistan visar dem. Högst 600 penseldrag sparas per bild; därefter försvinner de äldsta. Penseldrag som gjorts på stor nivå syns även på liten nivå.

**Sparat läge.** Varje bild sparar sina färger efter varje fyllning och finns kvar nästa gång, även i bildlistan. Ångra-historiken sparas inte.

## Spel: Prick till prick

Numrerade prickar ska förbindas i ordning. När sista strecket är draget stängs figuren, den färgläggs automatiskt med detaljer och namnet läses upp.

**Bilder per nivå:**

| Nivå | Bilder | Prickar | Hjälp |
| --- | --- | --- | --- |
| Liten, cirka 4 år | 11 bilder: Ett hus, En stjärna, En fisk, En segelbåt, Ett hjärta, En bil, En glass, Ett äpple, En ballong, En tulpan, En gran | 7–10 | Nästa prick blinkar hela tiden |
| Stor, cirka 6 år | 9 bilder: En raket, En katt, Ett flygplan, En dinosaurie, En fjäril, Ett lok, Ett slott, En krona, En robot | 13–20 | Prick 1 blinkar; sedan blinkar nästa prick bara efter 5 sekunder utan framsteg |

**De nya bilderna** (tillagda senare): glassen har strutmönster, strössel och ett körsbär; äpplet stjälk och blad; ballongen knut och snöre; tulpanen stjälk och två blad; granen stam, julgranskulor och en stjärna i toppen; loket fönster, hjul och rökpuffar; slottet två blå torn med flaggor, port och fönster; kronan juveler; roboten antenn, ögon, mun och knappar på magen. Prickarna i de nya bilderna ligger minst cirka 27 punkter isär, så att de är lätta att träffa. Alla 20 bilder gick att klara med riktiga tryck i kontrollen.

**Dra strecken.** Tryck på prickarna i nummerordning, eller håll fingret nere och dra från prick till prick; varje rätt prick man passerar kopplas på. Prickar som är klara blir blå. Numret läses upp vid varje prick, så det blir räkneträning på köpet, ända till tjugo.

**Fel prick.** Ett tryck på en annan prick än nästa gör att pricken vickar lite, med en svag ton, och inget streck dras. Klara prickar reagerar inte. När man drar fingret ignoreras prickar som inte är nästa.

**Klar bild.** Sista strecket går tillbaka till prick 1. Sedan tonar färgerna och detaljerna fram, till exempel fönster och dörr på huset eller vingar på flygplanet, prickarna tonar bort, en fanfar hörs och namnet läses upp. Bilden flyttar upp lite, och under den står namnet och en knapp till nästa bild.

**Välja bild.** Knapparna uppe väljer bild; klara bilder är gula och den valda har en blå ring. Efter sista bilden börjar man om från bild 1. Börja om tar bort strecken på samma bild med ett enda tryck, även strax efter att bilden blev klar (färgläggning och slutruta som är på väg avbryts). Var bilden påbörjad blir knappen ↩ Ångra i 4 sekunder; ett tryck på den lägger tillbaka strecken och nästa prick, så att ett barn som råkar trycka inte förlorar något.

**Sparat läge.** Vilken bild man är på och vilka som är klara sparas, per nivå. Strecken på en påbörjad bild sparas inte.

**Siffrornas placering.** Varje siffra står en bit utanför sin prick, bort från figurens mitt, så att den inte hamnar på strecken.

## Spel: Musik

Tre instrument att spela på: piano, trummor och gitarr, med en flik för varje. Alla ljud skapas av enheten medan man spelar, så det behövs inga ljudfiler och inget nät. Flera fingrar kan spela samtidigt. Är ljudet avstängt visas en påminnelse om att slå på det. Den senast valda fliken kommer ihåg.

### Piano

En oktav med färgade tangenter från C till C, med tonnamnen C, D, E, F, G, A, H och C. Ljudet är en mjuk, pianoliknande ton som klingar ut.

|  | Liten, cirka 4 år | Stor, cirka 6 år |
| --- | --- | --- |
| Tangenter | 8 vita | 8 vita och 5 svarta |
| Blinka lilla stjärna | Början, 14 toner | Hela, 42 toner |

**Lär dig en visa.** Utöver Spela fritt finns sex melodier som är fria att använda:

| Melodi | Liten nivå | Stor nivå |
| --- | --- | --- |
| Blinka lilla stjärna | Början, 14 toner | Hela, 42 toner |
| Gubben Noak | Första versen, 13 toner | Första versen, 13 toner |
| Imse vimse spindel | 13 toner, bara vita tangenter | 13 toner |
| Broder Jakob | Början, 14 toner | Hela, 32 toner |
| Ode till glädjen (Beethoven) | Första raden, 15 toner | Båda raderna, 30 toner |
| Für Elise (Beethoven) | Finns inte | Början, 22 toner |

Broder Jakob spelas med det låga G:et i sista raden som det höga, så att visan ryms på en oktav. Für Elise är början förenklad till bara melodin, utan ackord, och flyttad till d-moll så att den ryms på pianot. Den behöver en svart tangent (G#) och finns därför bara på stor nivå.

Tangenten för nästa ton lyser gult; en svart tangent blir gul och pulserar. En mätare visar hur långt man kommit. Trycker man på en annan tangent låter den bara, utan att något går fel. När melodin är slut visas Bravo!, spelet anropar att det är klart och melodin börjar om.

### Trummor

Åtta stora trumplattor i olika färger: Bastrumma, Virvel, Hi-hat, Cymbal, Tom, Handklapp, Tamburin och Koskälla. Plattan blinkar till när man slår på den.

### Gitarr

En gitarrhals med sex strängar, stämda som en vanlig gitarr, och sex ackordknappar: C, G, D, Am, Em och F. Ett tryck på en ackordknapp väljer ackordet och slår an det. Dra fingret upp eller ned över strängarna för att slå an, eller tryck nära en sträng för att knäppa på den. Strängar som inte ingår i ackordet är bleka och låter inte. Strängarna vibrerar när de låter, och ljudet är en knäppt sträng som klingar ut.

**Sparat läge.** Bara vald flik sparas.

## Spel: Bygg bilen

Ett skapande spel i stil med Klä på dockan, fast med bilar. Barnet väljer en biltyp, byter delar, färg och dekor fritt, väljer motor och kan sedan starta motorn och varva med en gaspedal. Bilen ses från sidan med fronten åt höger, och allt ritas av spelet i lager.

**Biltyper.** Sportbil, SUV, Pickup, Buss och Formelbil. Sportbilen är en egen kilformad superbil med mittmotor: vass låg nos och rak motorhuv som stiger mot en mycket lutande vindruta, kort låg kupé framför bakaxeln och en lång, låg motorkåpa med ventiler som sluttar ned mot en rak bakdel. Den har större hjul bak än fram, ett stort luftintag med lameller framför bakhjulet, en skarp kilformad sidolinje, tonat glas med kromram, backspegel i bilens färg, infällt dörrhandtag och svart tröskel. Allt följer med när färgen byts. SUV:n är en egen modern SUV, ritad från grunden: upprätt och robust med korta överhäng, hög motorhuv, lutande vindruta, nästan plant tak, en rak bakdel med lite lutning och stora hjul. Den har tre sidorutor med svarta stolpar emellan (taket ser ut att sväva), två dörrar i profil med handtag, mörka skärmbreddare runt hjulen och längs tröskeln, ett hasskydd fram och en backspegel i bilens färg vid vindrutans fot. Pickupen har förarhytt och flak, och bussen är lång med sex sidofönster och en dörr fram. Alla bilar har glans upptill och skugga nedtill i lacken; alla utom formelbilen har tonat glas med reflexer och kromram. Pickupen har dessutom flakkant, skärmbreddare, dörrhandtag och backspegel, och bussen en ljus sidolinje och en kromlist. Formelbilen är en egen modern formelbil, omritad från grunden: lång och låg, med en spetsig nos som sluttar ned mot frontvingen (med ändplatta och vingklaff i bilens färg), sidolåda med luftintag, en motorkåpa som stiger mot ett luftintag ovanför förarens huvud och bakvingen över bakhjulet. Föraren i gul hjälm sitter i cockpit, så att hjälmen sticker upp ur öppningen, med en skyddsbåge (halo) över. Länkarmarna mellan karossen och de fritt stående hjulen syns, liksom en mörk bottenplatta. Startnumret sitter på sidan bakom framhjulet. Som standard är den röd med racingdekor, GT-vinge och V12. Varje typ har sin egen form, sina egna fästpunkter för delarna och sparar sin egen uppsättning. Byt bil går tillbaka till valet av typ.

**Tuta.** Knappen Tuta, med symbolen för signalhorn som på ratten (ett smalt rör som vidgar sig i en trumpetformad tratt), i gruppen Tuta och taklampa, bredvid blinkersknapparna, tutar, både i verkstaden och när man kör, och den fungerar även när motorn är avstängd. Varje bil har sin egen tuta:

| Bil | Tuta |
| --- | --- |
| Sportbil | Snabbt, ljust tu-tut! i två korta stötar |
| SUV | Klassisk biltuta i två toner, en stöt |
| Pickup | Djupare honk-honk i två stötar |
| Buss | Lång, djup lufttuta i tre toner |
| Formelbil | Snabbt, stigande pip-pip |

För att slippa tut-spam i den riktiga bilen går det bara att tuta en gång varannan sekund: efter ett tut bleknar knappen i 2 sekunder, och tryck under tiden gör ingenting. Med ljudet avstängt hörs ingen tuta. Kontroll: fem snabba tryck under en sekund gav ett enda tut, och efter 2 sekunder tutade den igen.

**Delar att byta**, i varsin flik:

| Flik | Val |
| --- | --- |
| Färg | 12 färger: röd, orange, gul, grön, turkos, blå, mörkblå, lila, rosa, vit, silver och svart |
| Dekor | Ingen, Racing (två ränder och nummer 7), Polis (blågul rutmönster och POLIS), Flammor, Taxi (rutad rand och TAXI) och Bred rand |
| Tak | Inget, Blåljus, Varningsljus (orange), Ljusramp, Takbox och Taxiskylt |
| Vinge | Ingen, Läpp, Hög vinge, Dubbelvinge och GT-vinge |
| Huv | Vanlig, Luftintag, Kupol och Ventiler |
| Framlampor | Runda, Smala LED, Dubbla, Fyrkantiga och Arga ögon |
| Baklampor | Runda, LED-list, Fyrkantiga, Trekantiga och Dubbla |
| Fälgar | Vanliga, Sportfälgar, Terräng (större däck med mönster), Guldfälgar och Stjärnfälgar |
| Motor | Elmotor, V6, V8, V12 och Diesel |
| Höjd och hjul | Höjd i 7 steg, från 2 steg sänkt till 4 steg höjd, och hjulstorlek i 6 steg, från 2 steg mindre till 3 steg större, plus en knapp för normal höjd och normala hjul |

Förhandsbilderna i flikarna zoomar in på just den del som byts, så att skillnaden syns; Färg och Dekor visar hela bilen och Motor visar kort med namn och beskrivning. Delar i bilens färg, som vinge och huv, får samma färg som bilen. Dekoren håller sig inom bilens kaross. Ett tryck på ett val byter delen och läser upp namnet.

**Höjd och hjul.** Fliken har två reglage med minus och plus och staplar som visar steget; stapeln med mörk ram är det normala läget. Höjden flyttar hela karossen med alla delar upp eller ned, 12 enheter per steg, medan hjulen står kvar på marken. Hjulstorleken ändrar hjulens storlek med 10 procent per steg, och hjulen står fortfarande på marken. Hjulhusen i karossen följer hjulen. Är karossen höjd så mycket att det blir ett glapp mellan kaross och hjul syns fjädringen där, en stötdämpare och en orange spiralfjäder, i monstertruck-stil. Strålkastarnas ljuskägla och avgasröken följer karossens höjd. Höjd och hjulstorlek sparas per fordon.

**Motorerna:**

| Motor | Beskrivning | Tomgång | Max varv | Avgasrör |
| --- | --- | --- | --- | --- |
| Elmotor | Tyst och snabb | – | 12 000 | Inga |
| V6 | Brummar | 850 | 7 000 | 1 |
| V8 | Mullrar | 700 | 6 500 | 2 |
| V12 | Skriker | 650 | 8 500 | 4 |
| Diesel | Knattrar | 600 | 3 800 | 1 grovt |

**Motorsymboler och emblem.** I fliken Motor har varje motor en egen symbol, så att skillnaden syns: V6, V8 och V12 ritas som riktiga V-motorer framifrån, med oljetråg, motorblock, två cylinderbankar i V-form, ventilkåpor i motorns färg (orange, röd respektive lila), insugsgrenrör med motorns namn, avgasgrenrör samt remskivor och rem. Tändstiften längs varje bank visar antalet cylindrar, 3, 4 eller 6 per sida. V6:an har ett avlångt luftfilter, V8:an ett klassiskt runt luftfilter och V12:an två spjällhus. Dieseln är en rak sexa från sidan med sex insprutare och bränsleledningar, turbo, fläkt och rök. Elmotorn är en cylindrisk turkos motor med kylflänsar, axel, fästen och orange högvoltskablar till en kopplingsbox med blixt. Bilen får dessutom ett emblem baktill, ovanför bakhjulet, med texten V6, V8, V12, D eller EL i motorns färg.

**Starta och varva.** START startar motorn, med en kort startmotor för förbränningsmotorerna, och knappen blir STOPP. Lamporna tänds med en egen knapp, se nedan. Gaspedalen fungerar bara när motorn går: håll inne för att varva upp mot maxvarvet, släpp för att gå ned till tomgång. Vid maxvarvet slår varvbegränsaren till. Varvräknaren visar varvtalet i tusental med rött fält i toppen och motorns namn. Bilen skakar lite i takt med motorn, utom elbilen, och vid höga varv kommer rök ur avgasrören, mörkare för diesel. Byts motor medan bilen går stängs den av och förblir avstängd; den nya motorn startas med START.

**Bränsle och batteri.** Bredvid kontrollerna finns en mätare som visar tanken, märkt Bensin eller Diesel, eller batteriet, märkt Batteri, för elmotorn. Varje fordon har en egen tank och ett eget batteri, som sparas; en elbil och en bil med V8 har alltså var sin nivå. Mätaren är grön, gul under 35 procent och blinkar rött under 15 procent.

|  | Värde |
| --- | --- |
| Förbrukning på tomgång | 0,5 procent per sekund, en full tank räcker cirka 3 minuter |
| Förbrukning på maxvarv | 3 procent per sekund, en full tank räcker cirka 35 sekunder |
| Påfyllning | 30 procent per sekund, från tom till full på knappt 4 sekunder |

När tanken eller batteriet tar slut hackar motorn och stannar, och en notis säger Tanken är tom! eller Batteriet tog slut!. Motorn går inte att starta förrän man har fyllt på.

**Tanka och ladda.** Knappen bredvid mätaren heter Tanka (med en bensinpump) eller Ladda (med en laddkontakt) för elmotorn. Som på riktigt måste motorn vara avstängd: trycker man medan den går står det Stäng av motorn först!. Under påfyllningen hörs ett skvalpande ljud, eller stigande pip vid laddning, och knappen heter Stopp och avbryter. När det är fullt står det Full tank! eller Fulladdad!. Är det redan fullt säger en notis det.

**Lampor.** Knappgruppen Lampor bredvid gaspedalen har tre lägen, oavsett om motorn går: Av, Halvljus och Helljus. Det valda läget är gult. Knapparna visar samma symboler som en riktig instrumentbräda, så att barnen lär sig dem: Av en grå lampa utan strålar, Halvljus den gröna lampan med strålar snett nedåt och Helljus den blå lampan med raka strålar.

| Läge | Framlampor | Baklampor | Instrument |
| --- | --- | --- | --- |
| Av | Släckta, gråvita | Släckta, mörkt röda | – |
| Halvljus | Tända med gult sken och en kortare ljuskägla riktad nedåt | Tända, klart röda med rött sken | Grön halvljussymbol, med strålar snett nedåt, mitt i varvräknaren |
| Helljus | Tända med större sken och en längre, bredare och starkare ljuskägla | Tända, klart röda med rött sken | Blå helljussymbol, med raka strålar, mitt i varvräknaren |

Lamporna är släckta när man öppnar en bil och sparas inte.

**Blinkers.** Varje bil har en orange blinkers fram, under framlampan, och en bak, under baklampan. Knappgruppen Blinkers har Vänster, Varning och Höger, med samma symboler som på en riktig instrumentbräda: gröna pilar åt vänster och höger och den röda dubbeltriangeln (en triangel inuti en triangel) för varningsblinkers. Blinkersen blinkar ungefär 80 gånger i minuten, som en vanlig bil, med ett tickande ljud, och i varvräknaren blinkar en grön pil åt vänster eller höger; vid varningsblinkers blinkar båda pilarna. Eftersom bilen syns från sidan blinkar samma lampor på bilen åt båda hållen, och det är pilarna som visar riktningen. Ett nytt tryck på samma knapp stänger av, och ett tryck på en annan byter. Blinkersen fungerar oavsett om motorn går och sparas inte.

**Backljus.** Varje bil har ett vitt backljus baktill, under blinkersen. Det tänds bara i körläget: på stor nivå när växelväljaren står i R, även om bilen står still, och på liten nivå när bilen rullar bakåt. Släckt är det ljusgrått; tänt lyser det klart vitt med ett sken.

**Motorljudet** skapas av enheten utifrån motorns antal cylindrar och varvtal: tändningstakten bestämmer tonhöjden och ett filter gör ljudet ljusare vid högre varv. Elmotorn ger ett stigande surr. Ljudet har två lager: ett mjukt, av sinus- och triangelvågor, som bär tomgången, och ett vasst, med motorns egen vågform, som blandas in i takt med varvtalet. På tomgång är ljudet därför mjukt, dovt och lågt, och pulseringen i tändningstakt svag; först när man gasar kommer motorns karaktär fram, till exempel V8:ans mullrande och V12:ans skrik. Efter 3 sekunder på tomgång utan gas blir tomgången successivt tystare under ytterligare 3 sekunder, och den vaknar direkt när man gasar. Uppmätt är tomgången 5–8 dB tystare än i första versionen, och efter 6 sekunder ytterligare cirka 3 dB, medan ljudet på fullt varv är oförändrat. V12:an har lägst tomgång, 650 varv per minut.

**Ljus på taket.** Med Blåljus, Varningsljus, Ljusramp eller Taxiskylt på taket visas en knapp som tänder och släcker taklampan. Den sitter bredvid tutan i gruppen Tuta och taklampa, och dess symbol och namn visar vad som sitter på taket, ritade som på manöverpanelen i en utryckningsbil: för Blåljus ett blått takljus (kupol på sockel) med strålar, för Varningsljus samma takljus i orange, för Ljusramp en ramp med lampor och strålar framåt, och för Taxiskylt en gul TAXI-skylt. Tänd är knappen blå. Blåljus och varningsljus blinkar, och blåljuset har också en sirén med två växlande toner. Ljusrampen sitter på en takbåge med fyra lamphus som är riktade framåt (glaset åt bilens front). Tänd lyser glasen stadigt vitt med sken framför lamporna och, i verkstaden, en svag ljuskägla framåt. På natten när man kör lyser rampen upp vägen långt framför bilen med en lång, bred ljuskägla från taket, som räcker längre än helljuset och lyser tillsammans med strålkastarna. Taxiskylten lyser upp i gult; släckta är rampens glas gråvita och skylten mörkare gul. Ljuset är släckt när man öppnar en bil och sparas inte.

**Dimljus.** Bredvid strålkastarknapparna finns en egen grupp med två knappar, Dimljus fram (grön symbol) och Dimljus bak (gul symbol), som tänds och släcks var för sig och oberoende av strålkastarna, både i verkstaden och när man kör. Alla bilar har små runda främre dimljus lågt på framstötfångaren och ett rött bakre dimljus lågt baktill (på bussen ovanför baklamporna, på formelbilen mitt bak som ett regnljus). Tända lyser de främre vitgult med en låg, bred ljuskägla framåt, och det bakre starkt rött med sken. På natten lyser de främre dimljusen upp vägen närmast framför bilen och det bakre ger ett rött sken på vägen bakom. När dimljusen är tända visas samma symboler i varvräknaren: grön till vänster, gul till höger. Dimljusen är släckta när man öppnar en bil och sparas inte.

**Klar!** tar en kort blixt, som ett foto, visar Vilken bil! och anropar att spelet är klart.

### Köra i världen

Knappen 🏁 Kör! i verkstan tar med bilen ut i en enkel 2D-värld sedd från sidan. Panelen med flikarna göms, och uppe finns ← Verkstan för att åka tillbaka och en knapp för dag och natt. Alla kontroller finns kvar: START, gaspedal, lampor, blinkers, ljus på taket, bränslemätare och tankning, och en röd bromspedal tillkommer.

**Världen.** En väg med vita mittlinjer som går i lugna kullar, platt vid starten och sedan med högst cirka 15 graders lutning. Bakom vägen finns gatlyktor, hus i olika färger och träd, kullar och berg längre bort och sol och moln på himlen. Lagren rör sig i olika takt, så att det känns djup. Världen fortsätter åt båda hållen så långt man kör och ser likadan ut nästa gång. Kameran följer bilen i sidled men inte i höjdled, utan skakningar.

**Dag och natt.** Knappen 🌙 Natt eller ☀️ Dag byter. På natten är himlen mörkblå med måne och stjärnor, landskapet mörkare, husens fönster och gatlyktorna lyser med ljuspölar på vägen, och med halvljus eller helljus tända lyser strålkastarna upp vägen framför bilen; helljuset når nästan dubbelt så långt. Ett tänt blåljus ger ett mjukt blått sken runt taket som växlar mellan vänster och höger lampa i takt med blinkningen, och ett tänt varningsljus ett orange sken som blinkar med lampan; båda färgar också vägen runt bilen. Skenet syns bara på natten. Valet sparas.

**Köra.** Motorn måste vara igång för att gasen ska fungera. Bilen lutar med vägen och hjulen snurrar i takt med farten. Förbränningsmotorerna växlar automatiskt i fem steg, så motorljudet stiger och faller som i en riktig bil. Släpper man gasen rullar bilen ut. Backarna gör bilen långsammare uppför och snabbare nedför. Stannar man i en backe och släpper bromsen rullar bilen nedför backen: framåt i en nedförsbacke och bakåt i en uppförsbacke (i svaga backar bara sakta, eftersom rullmotståndet nästan tar ut lutningen). Tidigare rullade den åt fel håll, uppför; det rättades i november 2026. På dator fungerar även höger piltangent som gas och vänster som broms.

**Hastighetsmätare.** I körläget finns en rund hastighetsmätare bredvid varvräknaren, ritad på samma sätt: 0–240 km/h med siffror var 40:e km/h, en blå visare, farten i siffror i mitten och under den växeln: 1–5 för förbränningsmotorerna, E för elmotorn och R när bilen backar på liten nivå, eller vald växel på stor nivå (P, R, N, eller D med växelnummer, till exempel D3).

**Liten nivå: automatiskt.** Gasen kör framåt. Bromsen stannar bilen; håller man kvar bromsen 0,7 sekunder efter att bilen har stannat backar den sakta, högst 30 km/h.

**Stor nivå: växelväljare P R N D.** Bredvid hastighetsmätaren finns fyra knappar. Bilen står i P när man kör ut, och vald växel läses upp.

| Läge | Vad händer |
| --- | --- |
| P, Parkera | Bilen står låst. Gasen varvar bara motorn. |
| R, Back | Gasen kör bakåt, högst 30 km/h. |
| N, Neutral | Gasen varvar motorn men driver inte bilen; den rullar fritt i backarna. |
| D, Kör | Gasen kör framåt med fem automatiska växlar. |

Bromsen stannar bilen i alla lägen men backar aldrig. P och R går bara att välja när bilen nästan står still (under 5 km/h), och D inte när bilen rullar bakåt; annars står det Stanna bilen först! och växeln blir kvar. På dator byter tangenterna P, R, N och D växel.

**Motorerna kör olika:**

| Motor | Toppfart cirka | Acceleration |
| --- | --- | --- |
| Elmotor | 180 km/h | Snabbast |
| V6 | 160 km/h | Medel |
| V8 | 180 km/h | Snabb |
| V12 | 205 km/h | Snabbare |
| Diesel | 120 km/h | Segast |

Toppfarten nås bara på plan mark i långa raksträckor; efter 3 sekunder med full gas hade en elbil 137 km/h, en V12 135, en V8 120 och en diesel 75 vid provkörning.

**Bränsle.** Tanken eller batteriet förbrukas medan man kör, efter varvtalet. Tar det slut stannar motorn och bilen rullar ut. Man kan bara tanka när bilen står still och motorn är avstängd; annars står det Stanna bilen först! eller Stäng av motorn först!.

**Åksjuka.** Världen rullar i sidled när man kör. Den är lugn och utan skakningar, men för den som lätt blir åksjuk i bilen kan det vara klokt att inte köra länge åt gången.

**Paus och sparat läge.** Låses iPaden stängs motorn och sirenen av. Vald biltyp och alla fem fordonens uppsättningar sparas efter varje ändring. Spelet är detsamma på båda nivåerna.

## Spel: Koppla ihop

Dra streck mellan prickar med samma färg. Färgerna är röd, blå, gul, grön, orange, lila och rosa, och färgens namn läses upp när man börjar dra.

### Liten nivå: fria streck

Prickarna ligger utspridda, minst en bit från varandra och från kanten. Barnet sätter fingret på en prick och drar ett streck dit fingret går; släpps det på pricken med samma färg dras strecket ända in, båda prickarna studsar till och en ton spelas. Släpps det någon annanstans försvinner strecket. Strecken får korsa varandra. Börjar man på en prick som redan är kopplad tas det gamla strecket bort. När alla par är kopplade visas Bra jobbat! och Nästa ger en ny omgång. Omgångarna har 2, 3, 3, 4, 4 och 5 par och börjar sedan om; prickarnas lägen och färger slumpas varje gång. Börja om tar bort strecken i omgången.

### Stor nivå: rutnät där strecken inte får korsa

Ett rutnät där strecken går från ruta till ruta, upp, ned eller åt sidan, och inte får korsa varandra. Man börjar på en prick, eller på ett eget streck för att fortsätta därifrån. Drar man tillbaka i sitt eget streck kortas det. Ett streck stannar om nästa ruta upptas av en annan färgs streck eller prick, med en låg ton, och det stannar när det nått sin andra prick. Rutor som ett streck går genom färgas svagt i streckets färg, och kopplade par får tjockare streck och kant på prickarna.

**Banor.** 12 banor: 1–4 är 5 × 5 med 3–4 färger, 5–8 är 6 × 6 med 4–5 färger och 9–12 är 7 × 7 med 5–6 färger. Knapparna 1–12 uppe väljer bana; klara banor är gula och den valda har en blå ring. Börja om tar bort strecken på banan.

**Klart.** När alla par är kopplade visas Alla ihopkopplade! på ett kort mitt i bilden, och är dessutom varje ruta fylld kommer en extra rad: ⭐ Hela rutnätet är fyllt! ⭐. Nästa bana leder vidare; efter bana 12 börjar man om från bana 1. Vilken bana man är på och vilka som är klara sparas.

**Hur banorna togs fram.** Ett program drog en slumpad slingrande väg genom alla rutor i rutnätet och delade den i lika många bitar som färger, var och en minst 3 rutor och högst halva rutnätet, och där de två prickarna inte ligger bredvid varandra. Bitarnas ändar blev prickarna. Därför går varje bana att lösa, och det finns alltid en lösning som fyller hela rutnätet. Alla 12 banor har lösts i en riktig webbläsare med fingerdrag.

## Spel: Kontrollpanelen

En "busy board" där det inte är självklart vad som styr vad. Reglagen (knappar, vred, brytare, spak, reglage och knappsats) och det de styr (lampor, fläkt, varningsljus, klocka, trafikljus, kugghjul, lysdioder, visare och display) sitter ihop i moduler, varje sak med sitt reglage. Kopplingen är fast, så samma reglage styr alltid samma sak: varje gång ett reglage används blinkar en gul ring kort runt brickan som påverkades. Det finns inget rätt eller fel, men när barnet har provat alla reglage minst en gång visas Du har provat allt! 🎉 med en fanfar, och spelet anropar att det är klart. Allt ritas av spelet, och alla ljud skapas av enheten.

**Det som styrs och reglagen:**

| Det som styrs | Styrs av | Vad händer | Nivå |
| --- | --- | --- | --- |
| Lampor, 4 på liten och 6 på stor nivå (röd, blå, gul, grön, vit, orange) | Fyrkantiga tryckknappar (2 respektive 4) och vippbrytare (2), en per lampa | Lampan tänds och släcks; knapparna ger en ton, brytarna ett klick | Båda |
| Fläkten | Vred med fyra lägen | Fläkten snurrar i tre farter med mjuk start och stopp och ett sus som blir starkare | Båda |
| Varningsljuset | Stora röda knappen | Snurrar och blinkar i 3 sekunder, med sirén | Båda |
| Ringklockan | En tryckknapp | Klockan skakar och låter pling plong | Båda |
| Trafikljuset | En tryckknapp | Rött, gult och grönt i tur och ordning; Stopp, Vänta och Kör läses upp | Båda |
| Kugghjulen | Spak | Två kugghjul snurrar åt var sitt håll, med motorbrum | Stor |
| Lysdiodstapeln | Skjutreglage | 8 lysdioder tänds, gröna, gula och röda överst, med stigande ton | Stor |
| Visarmätaren | Vred med sex lägen | Visaren glider till motsvarande läge, med rött fält i toppen | Stor |
| Displayen | Knappsats med 0–9, C och ✓ | Siffrorna visas (de 4 senaste) och läses upp; ✓ läser upp hela talet och C suddar | Stor |

**Moduler.** Panelen ser likadan ut varje gång, och varje sak sitter ihop med sitt reglage i en egen modul med namn. Först kommer STRÖM med nyckeln, kraftmätaren, på stor nivå säkringen, och NÖDSTOPP. Sedan LAMPOR, där lamporna ligger på en rad med sin knapp eller brytare direkt under; knapparna har samma färg som lampan de tänder. Därefter FLÄKTEN (fläkt och vred), VARNINGSLJUSET (varningsljus och stora röda knappen), KLOCKAN (klocka och knapp), TRAFIKLJUSET (trafikljus och knapp) och TRANSPORTBANDET (band, spak och på stor nivå ett vred för farten), och på stor nivå även KUGGHJULEN (kugghjul och spak), LYSDIODERNA (lysdiodstapel och reglage), VISAREN (visarmätare och vred) och DISPLAYEN (display och knappsats). LJUSHJULET finns på båda nivåerna: på liten nivå på första raden bredvid lamporna, på stor nivå sist, bredvid displayen. Lamporna har kromad ram och glasskimmer och knapparna är fyrkantiga, så att det syns vad som är lampa och vad som är knapp. När strömmen är av (nyckeln av eller säkringen ute) mörknar sakerna men inte reglagen.

**Ljushjulet.** Ett vred i en större bricka med tio färgade lysdioder i en ring runt omkring sig, i regnbågens färger från röd högst upp och medsols. Vredet har sex lägen, som de andra vreden: tryck för nästa läge eller vrid. I läge 0 är alla lysdioder släckta. I läge 1–5 lyser en lysdiod i taget och ljuset går runt, runt: när nästa tänds släcks den förra. Ju längre vredet är vridet, desto fortare går det: cirka 2, 3, 5, 8 och 13 steg per sekund. Vid varje varv hörs ett litet pling. Ljushjulet drar 30 W per läge, högst 150 W, och stannar när nyckeln är av eller säkringen har gått.

**Transportbandet.** Ett band med tre rullar mellan två bruna lådor. I början ligger sex saker i vänster låda: 📦 🍎 ⚽ 🧸 🚗 🎁. Bandet styrs med en spak med tre lägen, märkta ▶ (framåt, överst), ■ (stopp, mitten) och ◀ (bakåt, nederst); tryck högt, i mitten eller lågt på spaken. Framåt tas en sak i taget ur vänster låda när det finns plats på bandet, åker åt höger och ramlar ned i höger låda med ett plopp; bakåt åker sakerna tillbaka på samma sätt. Rullarna snurrar och bandets yta rör sig. När alla sex har hamnat i höger låda spelas en fanfar och rösten säger Allt är flyttat!, och när alla är tillbaka till vänster Allt är tillbaka!. Det finns alltid sex saker; lådorna visar dem staplade. På liten nivå går bandet i en fart (alla sex flyttas på cirka 9 sekunder). På stor nivå finns dessutom ett vred med tre lägen för farten (vid högsta fart cirka 3 sekunder). Bandet drar 40 W per fartläge när det går och stannar vid nödstopp, när nyckeln är av och när säkringen går; sakerna ligger då kvar där de är.

**Nyckeln.** På båda nivåerna sitter en nyckelbrytare först på panelen KNAPPAR OCH REGLAGE: en mässingscylinder med en nyckel, märkt AV och PÅ, och en liten lampa. Panelen startar med nyckeln på AV: panelen med lampor och maskiner är mörk, kraftmätaren visar 0 W och nyckelns bricka lyser svagt gult för att visa var man ska börja. Ett tryck vrider nyckeln till PÅ: det låter som när en maskin startar, lampan vid nyckeln blir grön, rösten säger Panelen är på! och allt tänds som reglagen står. Ett nytt tryck vrider tillbaka till AV med ett nedåtgående ljud och Panelen är av.

Med nyckeln av fungerar ingenting: knapparna ger bara ett dovt klick och nyckelns bricka blinkar till som ledtråd. Brytare, vred, spak och reglage går att flytta och kommer ihåg sina lägen, så att det som står på tänds när nyckeln vrids på. Tryckknapparna, röda knappen, ringklockan, trafikljuset och knappsatsen gör ingenting och kommer inte ihåg tryck. Nyckeln räknas inte bland reglagen man ska prova, och NÖDSTOPP vrider den till AV. Säkringen på stor nivå kan bara gå när nyckeln är på.

**Kraftmätaren.** På panelen LAMPOR OCH MASKINER finns en kraftmätare med en blixt, en visare och siffror i watt som visar hur mycket el allt drar just nu. Skalan går till 600 W på liten nivå och 1 000 W på stor nivå, där fältet över 750 W är rött och siffrorna blir röda nära gränsen.

| Sak | Watt |
| --- | --- |
| Lampa (även disco och regnbåge) | 60 |
| Fläkten | 40 per läge, högst 120 |
| Ljushjulet | 30 per läge, högst 150 |
| Transportbandet, när det går | 40 per fartläge (liten nivå 40, stor nivå 40–120) |
| Varningsljuset (röda knappen eller polisljus) | 100 |
| Trafikljuset, när det lyser | 30 |
| Kugghjulen | 150 |
| Lysdioderna | 10 per tänd lysdiod, 80 vid ljusjakt |
| Visaren | 20 per läge på vredet, högst 100 |
| Displayen, när den visar siffror | 10 |

**Säkringen (stor nivå).** Drar panelen mer än 750 W slår säkringen ifrån: det låter som när strömmen går, panelen med lampor och maskiner blir mörk, allt stannar och släcks, kraftmätaren visar 0 W och en röd, pulserande knapp SÄKRING på reglagepanelen visar vad som hänt. Rösten säger Säkringen gick! Tryck på säkringen för att få tillbaka strömmen. Så länge säkringen är ute händer ingenting när man trycker på reglagen, bara ett dovt klick, men brytare, vred och reglage kommer ihåg sina lägen. Ett tryck på SÄKRING slår på strömmen igen, och allt tänds som reglagen står. Säkringen räknas inte bland reglagen man ska prova.

**Hemliga kombinationer.** Vissa lägen samtidigt ger något extra, alltid samma kombinationer. Uppe står ⭐ Hemligheter: 0 av 3 (liten nivå) eller 0 av 6 (stor nivå). Första gången en kombination hittas spelas en fanfar, räknaren studsar och rösten säger Du hittade en hemlighet! (Du hittade alla hemligheter! för den sista). Effekten varar så länge kombinationen står kvar.

| Nivå | Kombination | Vad som händer |
| --- | --- | --- |
| Liten | Brytare 1 och brytare 2 på | Deras två lampor blir disco och skiftar färg hela tiden |
| Liten | Trafikljuset grönt och fläkten igång | Fläktbladen blir gröna |
| Liten | Fläkten på högsta fart och lampan som knapp 2 styr tänd | Varningsljuset blir ett blått polisljus som snurrar |
| Stor | Brytare 1 och spaken på | Den vita lampan, som brytare 1 styr, lyser gult |
| Stor | Alla fyra knapplamporna tända | Regnbåge: de fyra lamporna skiftar färg |
| Stor | Fläkten på högsta fart och trafikljuset rött | Blått polisljus |
| Stor | Reglaget högst upp och visarvredet på sista läget | Lysdioderna kör ljusjakt upp och ned och visaren darrar |
| Stor | Knappsatsen 1 2 3 ✓ | Displayen visar HEJ! och alla lampor blinkar i regnbågens färger i 3,5 sekunder |
| Stor | Mer än 750 W | Säkringen går, se ovan |

**Säkringen slås på med allt avslaget.** När säkringen slås på igen är alla reglage avslagna: brytare och spak nere, alla vred och reglaget på noll, trafikljuset och displayen nollställda. Nyckeln står kvar på PÅ, så strömmen kommer tillbaka direkt men ingenting startar av sig självt; rösten säger Strömmen är tillbaka! Allt är avslaget. Hittade hemligheter räknas tills spelet stängs; de sparas inte.

**Vreden** vrids genom att dra runt dem, eller ett läge i taget genom att trycka; efter sista läget börjar de om från noll. Reglaget dras upp och ned eller trycks där man vill ha det.

**NÖDSTOPP** sitter i modulen STRÖM under nyckeln: en stor röd svampknapp på en gul platta med texten NÖDSTOPP. Ett tryck stänger av alla reglage (brytare och spak nere, alla vred och reglaget på noll, trafikljuset och displayen nollställda), släcker och stannar allt och bryter strömmen genom att vrida nyckeln till AV, som ett riktigt nödstopp. Knappen trycks in med ett tungt klonk och ett nedåtgående ljud, och rösten säger Nödstopp! Allt är avstängt. Nödstoppet fungerar alltid, även när strömmen redan är av, och räknas inte bland reglagen man ska prova. Det ersätter knappen Stäng av allt som tidigare satt uppe till höger. STRÖM ligger i två rader: nyckeln, kraftmätaren och (på stor nivå) säkringen överst, nödstoppet under nyckeln.

**Utseende och storlek.** Panelen anpassar brickornas storlek efter skärmen den visas på: den börjar stort och krymper i steg om 2 punkter tills hela panelen ryms utan att rulla, och innehållet i brickorna skalas i samma takt. Brickorna blir högst 132 punkter på liten nivå och 110 på stor, och minst 64 respektive 52. Storleken räknas om när fönstret ändras eller iPaden vrids. Exempel: på en iPad i liggande läge blir brickorna 110 punkter på liten nivå och 86 på stor; i stående läge 114 respektive 74. Trafikljuset är dubbelt så högt som en bricka, och kraftmätaren, visarmätaren och displayen dubbelt så breda.

## Spel: Masken

Barnet styr en mask till frukterna så att den blir längre (som det klassiska Snake). Masken dör aldrig: den går genom väggarna och kommer ut på andra sidan, och krockar den med sig själv biter den bara av svansen där och kör vidare.

|  | Liten nivå | Stor nivå |
| --- | --- | --- |
| Spelplan | 12 × 9 rutor | 16 × 12 rutor |
| Fart | Ett steg var 0,33 sekund | Ett steg var 0,21 sekund |
| Frukter till mätt | 10 | 20 |
| Stenar | Inga | 7 |

**Styra.** Pilknapparna bredvid spelplanen, svep på spelplanen eller piltangenterna. Masken kan inte vända rakt bakåt. Masken står still tills barnet trycker på en pil första gången.

**Frukterna** är äpple, päron, banan, jordgubbe, vindruvor, apelsin, vattenmelon och körsbär, och räknaren uppe visar till exempel 🍎 4 av 10. Varje frukt ger en ton som blir lite ljusare för varje frukt.

**Stenar** (stor nivå) ligger aldrig i startraden. Kör masken mot en sten stannar den med ett dovt ljud tills barnet svänger.

**Mätt.** När sista frukten är äten visas Masken är mätt! med en fanfar, spelet anropar att det är klart och Spela igen startar en ny omgång. Inget sparas mellan omgångarna.

## Spel: Murbrytaren

Barnet flyttar en platta i sidled med fingret och studsar en boll mot färgade klossar (som det klassiska Breakout). Missar man bollen kommer en ny på plattan med texten Ny boll!; det finns inga liv som tar slut. Ett tryck skjuter iväg bollen. Var bollen träffar plattan avgör studsvinkeln, så att barnet kan sikta.

|  | Liten nivå | Stor nivå |
| --- | --- | --- |
| Plattans bredd | 230 av 800 | 140 av 800 |
| Bollens fart | 300 per sekund | 430 per sekund |
| Klossar | En träff | Mörkare kant kräver två träffar; efter första träffen får klossen en spricka |

**Banorna.** Fem banor där klossarna bildar en bild: 1 Regnbågen, 2 Hjärtat, 3 Bilen, 4 Glada gubben, 5 Fisken. Knapparna 1–5 uppe byter bana; klarade banor blir gula, och nivåns klarade banor och aktuell bana sparas. När alla klossar är borta visas Hela muren är borta! och knappen Nästa bana (Alla murar är borta! och Börja om från bana 1 efter den sista).

**Stjärnklossar.** Från bana 2 har fyra klossar per bana en vit rund bricka med en stjärna ⭐ som pulserar lite. Bana 1 har inga. Stjärnklossarna sitter på samma ställen varje gång banan spelas (en fast slumpföljd per bana), och de fyra effekterna fördelas så att varje bana har en av varje. När en stjärnkloss krossas händer något direkt, utan att något behöver fångas, med ett glatt ljud och stor text:

| Effekt | Vad som händer | Hur länge |
| --- | --- | --- |
| 🔵 Fler bollar! | Två nya bollar skjuts ut från den boll som är högst upp, åt lite olika håll (högst sex bollar samtidigt) | Tills bollarna försvinner |
| ↔️ Bred platta! | Plattan blir 1,5 gånger så bred och ljusblå | 15 sekunder |
| 🔥 Eldboll! | Bollarna blir orange och går rakt igenom klossarna och krossar dem direkt, även tvåträffsklossar | 8 sekunder |
| 🐢 Långsam boll! | Bollarna går med 65 % av farten | 12 sekunder |

Aktiva effekter med tid visas uppe till vänster på spelplanen, till exempel ↔️ 9, med sekunder kvar. Med flera bollar i spel gör det inget att en försvinner; en ny boll kommer först när alla har försvunnit. Effekterna nollställs när en bana startas. Kontroll med autopilot: alla banor går fortfarande att klara på båda nivåerna, och alla fyra effekter utlöses på banorna 2–5.

**Osynlig hjälp.** Har ingen kloss träffats på 12 sekunder siktar nästa studs mot plattan mot en av de kvarvarande klossarna, så att bollen aldrig fastnar i ett mönster som missar de sista klossarna. Kontroll med autopilot: alla fem banor går att klara på båda nivåerna, på mellan cirka 100 och 200 sekunder.

**Styra** går även med piltangenterna och mellanslag på dator.

## Spel: Husdjuret

Barnet får ett eget djur att ta hand om (som Tamagotchi). Djuret dör aldrig och blir aldrig sjukt; om det har fått för lite blir det bara lite ledset och visar i en pratbubbla vad det helst vill ha. Djuret sparas mellan resorna och är gemensamt för båda nivåerna på samma enhet, och för spellabbet och appen när de körs från samma adress. Under resan finns Husdjuret på hyllan hela tiden, från start till slut, utanför turordningen; Spel av i vuxenpanelen döljer även det.

**Kläcka.** Första gången väljer barnet ett av sex ägg i olika färger, som bestämmer djurets färg. Sedan knackar barnet på ägget: det gungar och får sprickor, och efter fjärde knackningen kläcks det. Djuret frågar Vad ska jag heta? och barnet väljer bland Bubbel, Pippi, Knatte, Mysan, Pricken, Fluffe, Totte och Smulan.

**Behoven** visas som staplar uppe: mat 🍎, lek ⚽, sömn 💤 och (bara på stor nivå) bad 🛁. Grön stapel är bra, gul halvbra, röd låg. Behoven minskar med tiden även när spelet är stängt, men aldrig under 5 %:

| Behov | Minskar per timme (stor nivå) |
| --- | --- |
| Mat | 10 |
| Lek | 14 |
| Sömn | 8, efter klockan 19 nästan dubbelt |
| Bad | 6 |

På liten nivå minskar allt med 60 % av det. Är genomsnittet minst 65 % ler djuret, minst 40 % har det rak mun och annars är det ledset. Är något behov under 40 % visar pratbubblan det lägsta.

**Ta hand om djuret:**

- **Mata:** välj äpple, morot, banan eller kaka; maten flyger till munnen och djuret tuggar (+30 mat, kakan +20 mat och lite lek). Är djuret mätt skakar det på huvudet och säger Jag är mätt!
- **Leka:** en boll dyker upp; tryck på den så flyger den upp och djuret hoppar efter (+12 lek, lite trött).
- **Sova:** rummet blir mörkt, djuret blundar och Z svävar upp; sömnen fylls på tills djuret är utvilat eller man trycker på Sova igen.
- **Bada** (stor nivå): gnugga på djuret med fingret så kommer bubblor; när det är helt rent säger det Ren och fin!
- **Klappa:** ett tryck på djuret får det att hoppa och fnissa (+3 lek).

**Växa.** Efter 20 omvårdnader (matning, kastad boll, utvilad, rent) växer djuret: det blir större och får en liten antenn med en guldstjärna, och rösten säger att det har vuxit. Spelet anropar att det är klart när djuret växer och när alla behov är minst 80 %.

## Spel: Tornet

Tornet i Hanoi anpassat för barn: flytta hela tornet av ringar från den vänstra pinnen till pinnen med flaggan 🏁, en ring i taget. En större ring får inte ligga på en mindre. Ringarna har regnbågens färger, minst röd och störst blå, och en groda 🐸 sitter vid målpinnen.

| Nivå | Antal ringar | Minsta antal drag |
| --- | --- | --- |
| Liten | 2, sedan 3 | 3 respektive 7 |
| Stor | 3, sedan 4, sedan 5 | 7, 15 respektive 31 |

Knapparna uppe väljer antal ringar. Nästa storlek är låst (🔒) tills den förra är klarad; klarade blir gula.

**Flytta en ring.** Tryck på en pinne så lyfts den översta ringen upp ovanför pinnen; tryck på en annan pinne så läggs den där. Ett tryck på samma pinne lägger ned ringen igen. Det går också att dra ringen med fingret och släppa den över en pinne.

**Regeln lärs av spelet.** Försöker man lägga en större ring på en mindre skakar ringen och glider tillbaka med ett mjukt ljud. Inget straff och ingen text.

**Ledtråd.** Har barnet inte flyttat något på 5 sekunder (liten nivå) eller 8 sekunder (stor nivå) lyser ringen som bör flyttas och pinnen den ska till. Ledtråden räknas fram från läget just nu och följer alltid kortaste vägen till målet, även om barnet har gått en omväg.

**Klart.** När alla ringar ligger på flaggpinnen hoppar grodan upp på tornet, en fanfar spelas och spelet anropar att det är klart. Slutrutan visar ⭐⭐ och till exempel 7 drag – så få som det går! om tornet flyttades på minsta antal drag, annars ⭐ och till exempel 11 drag. Det går på 7. Det finns ingen gräns för antalet drag. Knappen går till nästa storlek eller Spela igen. Läget och antalet drag sparas, så att ett påbörjat torn finns kvar.

## Spel: Pip

Ett enkelt plattformsspel i stil med de tidiga plattformsspelen, med en egen figur: Pip, en rund orange varelse med vit mage och öron. Pip springer och hoppar åt höger till flaggan i slutet av banan, samlar mynt och stöter i stjärnblock. Spelet rullar i sidled; den som lätt blir åksjuk bör spela en kort stund i taget.

**Inga liv och ingen tid.** Ramlar Pip ned i ett hål kommer han tillbaka på senaste säkra marken (där han stod stadigt) med texten Hoppsan!. Går Pip in i en snigel från sidan puttas han bakåt och blinkar en sekund, utan att något går förlorat.

**Styrning.** Knapparna ◀ och ▶ nere till vänster och den stora knappen Hoppa nere till höger; de är halvgenomskinliga så att banan syns igenom. På dator fungerar piltangenterna och mellanslag. Ju längre Hoppa hålls in, desto högre hopp. Hoppet är förlåtande: ett tryck strax före landningen räknas, och det går att hoppa en kort stund efter att ha sprungit över en kant.

**På banan:**

- **Mynt** som snurrar; springer eller hoppar Pip igenom dem plockas de. Räknaren uppe visar 🪙 och antalet.
- **Stjärnblock** (gula med ⭐): stöt i dem underifrån med huvudet så hoppar ett mynt ut och blocket blir brunt. Tegelblock säger bara bonk.
- **Sniglar** (stor nivå): kryper sakta och vänder vid väggar och kanter. Hoppar Pip på en snigel plattas den till och ger ett mynt. En snigel på ett block ramlar av om Pip stöter i blocket underifrån.
- **Trappor, stubbar och moln** att hoppa upp på, och **hål** att hoppa över.

| Bana | Namn | Innehåll |
| --- | --- | --- |
| 1 | Ängen | Platt mark, två hål, block, en stubbe och en liten trappa |
| 2 | Trappan | Trappor upp och ned och hål mellan dem |
| 3 | Skogen | Stubbar i olika höjd att hoppa över |
| 4 | Molnen | Moln att hoppa mellan över stora hål |

|  | Liten nivå | Stor nivå |
| --- | --- | --- |
| Fart | Lugnare (210) | Snabbare (260) |
| Hål | Högst 2 rutor | Högst 3 rutor |
| Sniglar | Inga | 2–4 per bana |

Hoppet räcker cirka 3,8 rutor långt på liten nivå och 4,7 på stor, och cirka 3,7 rutor högt, så alla hål och stubbar har marginal. Kontroll med en robot som springer åt höger och hoppar vid väggar, hål och sniglar: alla fyra banor går att klara på båda nivåerna, på cirka 20 sekunder för roboten.

**Bana klar.** När Pip når flaggan spelas en fanfar, slutrutan visar Bana klar! 🏁 och antalet mynt, och spelet anropar att det är klart. Knappen går till nästa bana (efter bana 4: Börja om från bana 1). Knapparna 1–4 uppe byter bana; klarade blir gula och sparas. Mynten sparas inte mellan banorna. Spelet passar bäst i liggande läge, där man ser längre framåt.

## Spel: Labyrinten

En mus 🐭 ska hitta genom labyrinten till osten 🧀. Musen börjar uppe till vänster och osten ligger nere till höger. Barnet drar musen med fingret längs gångarna; musen följer rutan under fingret om den går att nå på högst fyra steg utan att gå genom en vägg, så att den aldrig hoppar över väggar även om fingret rör sig fort. Ett tryck på en ruta nära musen fungerar också, och på dator piltangenterna. Mot en vägg händer ingenting.

**Spåret.** Efter musen ritas ett blått spår. Går musen tillbaka suddas spåret, och kommer musen till en ruta där den redan har varit klipps spåret dit, som när man ritar med penna och suddar.

**Storlekar.** Labyrinterna växer för varje klarad, och numret står uppe (Labyrint 1, 2, …). Numret sparas per nivå.

| Nivå | Storlekar (rutor) | Vägar |
| --- | --- | --- |
| Liten | 4 × 3, 5 × 4, 5 × 5, 6 × 5, 7 × 5, sedan 7 × 6 | En enda väg till osten |
| Stor | 7 × 5, 8 × 6, 9 × 7, 10 × 7, 11 × 8, 12 × 8, sedan 13 × 9 | Flera vägar: minst en extra öppning per 20 rutor, minst två |

Labyrinterna skapas med en slumpgenerator med fast frö per nummer och nivå (recursive backtracker), så labyrint nummer 3 ser alltid likadan ut. Efter den största storleken blir varje ny labyrint lika stor men annorlunda. Knappen Ny labyrint hoppar till nästa nummer.

**Ledtråd.** Står musen still i 9 sekunder (liten nivå) eller 15 sekunder (stor nivå) lyser fyra gula prickar på de närmaste stegen längs kortaste vägen till osten. Prickarna försvinner när musen flyttas.

**Klart.** När musen når osten spelas en fanfar, rösten säger Mums! Musen hittade osten!, slutrutan visar Musen hittade osten! och spelet anropar att det är klart. Knappen Nästa labyrint startar nästa. Kontroll: alla storlekar på båda nivåerna går att lösa, och de stora har flera vägar.

## Spel: Hitta felen

Två bilder som ser likadana ut, men inte riktigt. Bilderna står bredvid varandra i liggande läge och ovanför varandra i stående. Barnet trycker där det ser en skillnad, i vilken av bilderna som helst. Rätt tryck ritar en röd ring runt skillnaden i båda bilderna och ger en ton; fel tryck visar bara en grå ring som försvinner och ett mjukt ljud, utan straff. Uppe visas en rad med prickar, en per skillnad, som blir röda när de hittas.

|  | Liten nivå | Stor nivå |
| --- | --- | --- |
| Skillnader | 3 | 5 |
| Sorts skillnader | Bara tydliga: en sak som saknas eller en stor sak i annan färg | Även små och kluriga: ett äpple, en fågel, en bubbla, en fisk som simmar åt andra hållet |
| Ledtråd efter | 15 sekunder utan fynd | 25 sekunder utan fynd |

**Miljöerna.** Fyra bilder, ritade av spelet så att de ser likadana ut på alla enheter: Trädgården (hus, träd med äpplen, blommor, sol, moln, boll), Stranden (båt, parasoll, hink, boll, krabba, snäcka), Rymden (raket, planet, måne, UFO, komet, stjärnor) och Havet (fiskar, bläckfisk, sjöstjärna, skattkista, sjögräs, bubblor). Varje miljö har 10–12 saker som kan ändras. Skillnaderna väljs slumpvis varje gång bland dem, aldrig två som ligger ovanpå varandra, och det är slumpvis vilken av bilderna som har ändringarna. Samma miljö kan alltså spelas många gånger. Miljöerna kommer i tur och ordning, och var man är sparas.

**Ledtråd.** Har inget hittats på ett tag pulserar en streckad gul ring kring området där en skillnad finns (ringen är större än skillnaden och lite förskjuten, så att barnet ändå får leta). Ringen försvinner vid nästa fynd.

**Klart.** När alla är hittade spelas en fanfar, rösten säger Du hittade alla!, slutrutan visar Du hittade alla! och spelet anropar att det är klart. Nästa bild går vidare till nästa miljö. Ny bild uppe byter direkt. Kontroll: i alla fyra miljöer på båda nivåerna syns varje skillnad i bilderna och går att hitta genom att trycka i någon av dem.

## Spel: Färgminnet

Ett minnesspel i stil med Simon. Fyra stora knappar i en rund panel lyser i en ordning, och barnet trycker i samma ordning. Knapparna har var sin färg, ton och symbol: röd ★, blå ●, gul ▲ och grön ■, så att det fungerar även för den som har svårt att skilja vissa färger. Tonerna ligger i en dur-treklang, så att alla ordningar låter bra.

**Gången.** I mitten står Titta! medan knapparna lyser en i taget; under tiden går det inte att trycka. Sedan står det Din tur!, och en rad prickar visar hur långt barnet har kommit. Är hela ordningen rätt står det Bra! (eller Nytt rekord!), en kort fanfar spelas och ordningen blir en ton längre: samma ordning som förut plus en ny ton på slutet.

**Om det blir fel.** Det heter inte fel. I mitten står Det var den här! medan rätt knapp lyser lugnt två gånger med sin ton, sedan Vi tar en kortare, och en ny ordning börjar som är två toner kortare än den förra (aldrig kortare än startlängden). Inga ljud för misslyckande.

**Visa igen** (👀 uppe till höger) spelar upp ordningen en gång till när det är barnets tur, utan att något går förlorat.

|  | Liten nivå | Stor nivå |
| --- | --- | --- |
| Startlängd | 2 toner | 3 toner |
| Takt | En ton per 0,76 sekund | Börjar på cirka 0,55 sekund per ton och blir snabbare ju längre ordningen är, ned till 0,33 |
| Rösten säger rekordet | Från 4 i rad | Från 6 i rad |
| Spelet anropar att det är klart | Vid 5 i rad | Vid 8 i rad |

**Rekord** (🏆 uppe) är den längsta ordningen barnet har klarat på nivån, och det sparas mellan resorna. På dator går det att spela med piltangenterna (upp = röd, höger = blå, vänster = gul, ned = grön) eller tangenterna 1–4.

## Spel: Tågbanan

En tågbana från en röd station till vänster till en röd flagga till höger, med ängar, träd, hus, kor och får runt omkring. Rälsen däremellan har luckor, markerade med gul streckad ram och ett +. Barnet trycker i en lucka så läggs en rälsbit; varje nytt tryck vrider biten till nästa form: rak vågrät, rak lodrät och fyra kurvor. De bitar som redan ligger kan inte ändras; trycker man på dem vickar de lite.

**Rälsen som hänger ihop lyser.** Från stationen och så långt rälsen hänger ihop blir den grön, så att barnet ser hur långt det har kommit och var nästa lucka är. När hela vägen hänger ihop tutar tåget (Tuut tuut!) och kör med lok och två vagnar längs rälsen ända till flaggan, med tuff-ljud och rökpuffar. Slutrutan visar Tuut tuut! Framme! 🚂, spelet anropar att det är klart och Nästa bana startar nästa.

|  | Liten nivå | Stor nivå |
| --- | --- | --- |
| Rutnät | 5 × 3 | 7 × 5 |
| Vägens längd | Minst 7 rutor | Minst 11 rutor |
| Luckor | 2–3 | 4–6 |

Banorna skapas av en slumpgenerator med fast frö per nummer, så bana 3 ser alltid likadan ut. Vägen går alltid från vänster kant till höger kant och korsar aldrig sig själv; luckan är aldrig den första rutan vid stationen. Numret sparas per nivå, och Ny bana hoppar vidare. Kontroll: 15 banor per nivå gick att lösa, och tåget kör hela vägen till flaggan.

## Spel: Fiskdammen

En damm med brygga, fiskespö, vass och sandbotten. Barnet drar kroken med fingret dit det vill i vattnet; en streckad ring runt kroken visar hur nära en fisk måste vara. Den stora knappen 🎣 Dra upp! nere till höger drar upp kroken. Är en fisk vid kroken följer den med upp och flyger i en båge ned i hinken uppe till höger, och rösten säger vad det blev. Är ingen fisk nära står det Ingen fisk den här gången och kroken åker ned igen, utan straff.

**Sorterna:** blå fisk 🐟, randig fisk 🐠, blåsfisk 🐡, bläckfisk 🐙, krabba 🦀 (kryper på botten) och, ibland, en stövel 👢 (En stövel! Hihi!). På stor nivå även räka 🦐 och en sällsynt guldfisk som glöder.

|  | Liten nivå | Stor nivå |
| --- | --- | --- |
| Fiskarnas fart | Lugn | 1,6 gånger snabbare |
| Kroken räcker | Långt (ringen är stor) | Kortare |
| Nyfikna fiskar | Ja: fiskar nära kroken simmar sakta dit | Nej |
| Full hink | 6 | 10 |

**Full hink.** När hinken är full spelas en fanfar, slutrutan visar Hinken är full! 🪣 och allt som fångats, och spelet anropar att det är klart. Töm hinken och fiska mer börjar om.

**Fiskboken** (📖 uppe) visar alla sorter: fångade med namn och antal, ännu inte fångade som en mörk siluett med ?. Fiskboken sparas mellan resorna och är gemensam för båda nivåerna på samma enhet.

På dator går det att dra kroken med musen och dra upp med mellanslag eller Enter.

## Spel: Klockan

Ett spel för att lära sig klockan. En stor urtavla med siffrorna 1–12, minutstreck, en kort blå timvisare och en lång röd minutvisare. Bredvid (under, i stående läge) står uppgiften med tiden i rött. En omgång har fem uppgifter, och stjärnorna uppe visar hur många som är klara.

**Liten nivå: hela timmar.** Uppgiften är till exempel Ställ klockan på sex!. Minutvisaren står på 12, och barnet drar den lilla visaren till rätt siffra eller trycker direkt på siffran. Ett kort tryck på en siffra som en visare ligger över räknas också som ett tryck på siffran, så att även 12 går att trycka på fast minutvisaren pekar dit. Rösten läser uppgiften.

**Stor nivå: två sorters uppgifter, varannan gång.**

- **Ställ klockan:** till exempel Ställ klockan på halv fyra!. Barnet drar minutvisaren runt; den hoppar i steg om 5 minuter och timvisaren följer med som på en riktig klocka, även över hela timmar. Timvisaren går också att dra eller flytta med ett tryck på en siffra; den hoppar till närmaste timme och minuterna står kvar.
- **Vad är klockan?:** klockan visar en tid och barnet väljer bland tre svar.

**Svårigheten ökar på stor nivå** efter varje hel omgång: först hel och halv, sedan även kvart över och kvart i, och sist alla femminuter (fem över, tio över, tjugo över, fem i halv, fem över halv, tjugo i, tio i, fem i). Steget sparas. Klockorden följer svenskt talspråk, till exempel 3.25 fem i halv fyra, 12.30 halv ett och 11.45 kvart i tolv. På skärmen skrivs de med versaler, som är lättare för den som håller på att lära sig läsa: uppgiften (STÄLL KLOCKAN PÅ HALV FYRA!), svarsknapparna (KVART I NIO) och texten vid rätt svar (KLOCKAN ÄR HALV FYRA!). Rösten läser samma ord.

**Inget heter fel.** Står visarna inte rätt händer ingenting, och barnet kan fortsätta flytta. Ett fel svarsalternativ skakar till och blir grått. Har barnet inte hittat rätt efter 10 sekunder (liten nivå) eller 15 sekunder (stor nivå) visas svaga skuggvisare där visarna ska stå. Vid rätt svar står det och sägs till exempel Klockan är halv fyra!, och en kort fanfar spelas.

**Klart.** Efter fem uppgifter visas Bra jobbat! 🎉 (på stor nivå, när ett nytt steg börjar, till exempel Nu kan du hel och halv! Nu kommer kvart! 🎉), och spelet anropar att det är klart. Fortsätt börjar en ny omgång.

## Spel: Papperskorgen

Ett kastspel i stil med Paper Toss. Ett rum med fönster och trägolv i perspektiv, en papperskorg en bit bort och en papperstuss längst fram. Barnet sveper uppåt för att kasta: svepets längd uppåt ger hur långt tussen flyger och svepet i sidled åt vilket håll. Kastvinkeln är fast (cirka 50°), och tussen flyger i en båge med skugga på golvet och ett litet spår. Vid start visar en streckad pil och en hand hur man sveper, med texten Svep uppåt för att kasta!; den försvinner efter första kastet.

**I korgen** räknas tussen när den passerar kanten på väg nedåt inom öppningen: ett swisch, en av texterna Mitt i!, Swisch!, Snyggt! eller I korgen!, en kort fanfar och stjärnor som sprutar upp. Nuddar tussen kanten studsar den och det står Nära!. Hamnar den utanför rullar den en bit och en ny tuss kommer; inget går förlorat. Uppe visas antal i korgen, i rad och rekordet (flest i rad), som sparas mellan resorna per nivå. Vid ny rekordserie från 3 i rad står och sägs till exempel 6 i rad! Rekord!.

|  | Liten nivå | Stor nivå |
| --- | --- | --- |
| Korgen | Mitt fram, cirka 4,5 meter bort, stor öppning | Flyttar sig efter varje träff: åt sidan och 5,5–8 meter bort, mindre öppning |
| Vind | Ingen | En fläkt blåser åt sidan, olika styrka varje kast (pilar och Vind uppe visar riktning och styrka) |
| Hjälp att sikta | 65 % av vägen mot ett träffande kast | 45 % (vinden räknas inte med) |

**Träffsäkerhet** (mätt med simulerade kast): på liten nivå träffar cirka 80 % av ungefär rätt svep och cirka 40 % av helt slumpade; sex riktiga svep i webbläsaren gav sex träffar. På stor nivå går det alltid att träffa, oavsett korgens läge och vind; svepet får avvika cirka 230 punkter i sidled och 70 punkter i längd och ändå träffa (snävast längst bort med motvind). Spelet anropar att det är klart vid 5 i korgen på liten nivå och 10 på stor.

## Referens: tröskelvärden och konstanter

Alla gränsvärden som styr appens logik, samlade för den som vill justera dem i koden.

| Område | Värde | Betydelse |
| --- | --- | --- |
| Position | 100 m | Sämre noggrannhet används bara för att visa bilen |
| Spår | 50 m | Minsta avstånd mellan två spårpunkter |
| Lucka | 1 minut | Längre tid utan godkänd position räknas som lucka |
| Lucka | 200 m | Punkter inom detta från rutten räknas som på rutten vid ifyllnad |
| Lucka | × 1,25 | Påslag på fågelvägen när vägen i luckan är okänd |
| Lucka | 200 m | Mindre förflyttning räknas som att ni stått still hela luckan |
| Stopp | 2 m/s (cirka 7 km/h) | Långsammare räknas som stillastående |
| Stopp | 2 minuter | Så länge måste bilen stå still för att ett stopp ska räknas |
| Takt | 0,5 m/s (cirka 2 km/h) | Fortare räknas som rullande och tas med i takten |
| Takt | 1 minut | Kortare sedd körtid ger takt 1 |
| Takt | 5 minuter | Takten börjar vägas in efter så här lång sedd körning |
| Takt | 30 minuter | Tiden det tar för vikten att gå från 0 till 0,8 |
| Takt | 0,8–1,6 | Gränser för den råa takten |
| Takt | 0,8 | Största vikt för den råa takten |
| Ny rutt | 200 m | Avstånd från rutten som räknas som avvikelse |
| Ny rutt | 25 sekunder | Så länge avvikelsen måste vara innan ny rutt |
| Ny rutt | 10 minuter | Periodisk omräkning under körning, bara GPS |
| Ny rutt | 1 minut | Minsta tid mellan två försök |
| Matstopp | 300 m | Inom detta räknas matstoppet som avklarat |
| Matstopp | 500 m | Så långt förbi matstoppet längs rutten räknas det som avklarat |
| Matstopp | 500 m | Stillastående inom detta från avklarat matstopp visar Nu äter vi! |
| Text | 300 m | Under detta: Nu är vi nästan framme! eller Nu är vi nästan vid maten! |
| Text | 20 minuter | Upp till detta exakta minuter, över avrundat till 5 minuter |
| Framme | 100 m | Framme-skärmen visas och sträcka kvar blir 0 |
| Prickar | 24 | Högsta antal prickar för den planerade körtiden |
| Prickar | 3 minuter | Så mycket måste tid kvar öka innan en prick tänds igen |
| Sparande | 15 sekunder | Längsta tid mellan två sparningar under körning |
| Simulering | 1 000 m | Längsta steg mellan låtsasbilens positioner |
| Simulering | 1,5 km | Sidoförflyttning vid omväg och annan väg |
| Simulering | 40 minuter | Luckans längd i testknapparna |
| Plats | 15 sekunder | Längsta väntan på position när resan läggs in |
| Utan GPS | 10 sekunder | Efter så här lång tid utan position börjar bilen flyttas uppskattat |
| Utan GPS | 80 % | Den uppskattade bilens fart i förhållande till er fart |
| Utan GPS | 5 minuter | Längsta uppskattning; därefter står bilen kvar tills GPS:en är tillbaka |
| Utan GPS | 15 sekunder | Därefter visar vuxenpanelen Ingen GPS sedan |
| Utanför rutten | × 1,25 | Påslag på avståndet tillbaka till rutten i sträcka och tid kvar |
| Sparad karta | 300 | Högsta antal kartbitar som sparas i förväg |
| Sparad karta | 30 % | Marginal runt kartans synliga yta som sparas |
| Uppdatering | 5 sekunder | Barnvyn ritas om minst så här ofta i GPS-läge, även utan nya positioner |
