# Nákup iPhone na iWantu

**Zadání**
Nasadili jsme do našeho e-shopu novou kategorii s iphony, je potřeba napsat user-journey performance test, který ověří:
- zákazník může iPhone vyhledat
- zákazník se může prokliknout na detail iPhone
- zákazník může změnit velikost paměti na 256GB
- načítají se filtry, stránkování a iphony v našeptávači

**NFR**
- Test1:

        - Prostředí https://www.iwant.cz/
	- Každý request musí být odbaven do 1000ms.
	- Našeptávač musí vrátit více jako 10 iphonů.
	- Číselník vrátí více jak 1000 filtrů.
	- Výsledky vyhledávání zobrazí na stránce 12 iphonů.
	- Funguje stránkování a vrací tlačítka pro přechod na další stránku.
	- Stránka s detailem iPhone se zobrazí do 1500ms
	- Vyhledání iPhone nesmí trvat déle jak 1300ms
	- Funguje změna velikosti iPhone.
	- Ověřuj, že response vrací správné response codes.
	- TestCase poběží 5minut.
	- Maximální zátěž je 2 VU

**Ostatní požadavky**
- Všechny hodnoty v testu (konfigurace) musí být parametrizovatelný.
- Requesty zařaď do groups, vytvoř custom metriky a thresholdy

**Jak udělat**
- Pro konstrukci testu nepotřebuješ extra knihovnu, vystačíš si s:
	- `r.body.includes` vyhledávání v response body
	- `r.json().length` počítání položek v poli
	- `r.body.match` další způsob jak vyhledat string v response

**Ukázky checks**
```javascript
const matches = r.body.match(/<div class="productList-item"/g);
return matches && matches.length === 2;
...
'Response of AllFilterData contains more than 500 items': (r) => r.json().length > 2,
...
r.body.includes('<meta name="title" content="Apple iPhone 14 128GB temn&#x11B; inkoustov&#xFD; | iWant.cz" />')
```


**Hodnocení výsledků**
- Připrav si manažerské shrnutí s informací, jak test dopadl (ústně)
- Funkční test společně s instrukcemi jak jej spustit pushni do vlastního Git repozitáře na Githubu
