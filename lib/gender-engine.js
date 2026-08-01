// gender-engine.js — multi-tier German gender prediction
// Goal: hit 90%+ accuracy on real German vocabulary
// Architecture: 6-tier (Sheet lookup → A1/A2 → TopFreq → Compound → Semantic → Suffix)
// Reference rule grid: Jasper's "Rule Category Indicator / Ending Dictated Gender Plural Morphological Shift Critical Boundaries & Exceptions" (2026-07-31)

// ===== TIER 1: Lexical lookup tables =====
// Sheet data (94 nouns, 100% confidence)
const SHEET_LOOKUP = require('./sheet-lookup.json'); // populated separately

// Tier 2: A1/A2 starter list (~200 common nouns)
const A1_A2 = {
  // Masc - der
  'mann': 'der', 'frau': 'die', 'kind': 'das', 'junge': 'der', 'mädchen': 'das',
  'vater': 'der', 'mutter': 'die', 'bruder': 'der', 'schwester': 'die',
  'sohn': 'der', 'tochter': 'die', 'onkel': 'der', 'tante': 'die',
  'freund': 'der', 'freundin': 'die', 'feind': 'der',
  'herr': 'der', 'dame': 'die', 'kunde': 'der', 'kundin': 'die',
  'kollege': 'der', 'kollegin': 'die', 'mensch': 'der',
  'lehrer': 'der', 'lehrerin': 'die', 'schüler': 'der', 'schülerin': 'die',
  'student': 'der', 'studentin': 'die', 'arzt': 'der', 'ärztin': 'die',
  'bürger': 'der', 'bürgerin': 'die', 'gast': 'der', 'gäste': 'die',
  
  // Tools/objects - masc
  'tisch': 'der', 'stuhl': 'der', 'schrank': 'der', 'stiefel': 'der',
  'schuh': 'der', 'hut': 'der', 'mantel': 'der', 'rock': 'der',
  // Sheet nouns (added 2026-07-30 from no-sheet assessment)
  'satz': 'der', 'gedanke': 'der', 'schritt': 'der', 'abend': 'der', 'jahr': 'das', 'welt': 'die', 'teil': 'der', 'ende': 'das', 'steuern': 'die', 'prozess': 'der', 'lager': 'das', 'geschäft': 'das', 'nudeln': 'die', 'zukunft': 'die', 'dashboard': 'das', 'portfolio': 'das', 'konto': 'das', 'gesetz': 'das', 'netzwerk': 'das', 'bezirk': 'der', 'eltern': 'die', 'smartphone': 'das', 'betrieb': 'der', 'möbel': 'die', 'morgen': 'der', 'finanzen': 'die', 'daten': 'die', 'ziel': 'das', 'regel': 'die', 'beispiel': 'das', 'straße': 'die', 'restaurant': 'das', 'fehler': 'der', 'ding': 'das', 'buch': 'das', 'aufgabe': 'die', 'nacht': 'die', 'arbeit': 'die', 'familie': 'die', 'monat': 'der', 'stadt': 'die', 'schule': 'die', 'unternehmen': 'das', 'problem': 'das', 'auto': 'das', 'wasser': 'das', 'geld': 'das', 'haus': 'das', 'freund': 'der', 'freundin': 'die', 'mensch': 'der', 'kind': 'das', 'name': 'der', 'sohn': 'der', 'wort': 'das', 'zeit': 'die', 'weg': 'der', 'projekt': 'das', 'system': 'das', 'leben': 'das', 'plan': 'der', 'stuhl': 'der', 'tag': 'der', 'markt': 'der', 'manager': 'der', 'team': 'das', 'server': 'der', 'update': 'das', 'büro': 'das', 'kollege': 'der', 'kollegin': 'die', 'bericht': 'der', 'vertrag': 'der', 'bildschirm': 'der', 'lösung': 'die', 'agent': 'der', 'zimmer': 'das', 'barung': 'die',
    'computer': 'der', 'laptop': 'der', 'bildschirm': 'der',
  'schlüssel': 'der', 'ball': 'der', 'koffer': 'der',
  
  // Time - mostly masc
  'tag': 'der', 'monat': 'der', 'jah': 'das',
  'montag': 'der', 'dienstag': 'der', 'mittwoch': 'der', 'donnerstag': 'der',
  'freitag': 'der', 'samstag': 'der', 'sonntag': 'der',
  'januar': 'der', 'februar': 'der', 'märz': 'der', 'april': 'der',
  'mai': 'der', 'juni': 'der', 'juli': 'der', 'august': 'der',
  'september': 'der', 'oktober': 'der', 'november': 'der', 'dezember': 'der',
  
  // Time - fem
  'stunde': 'die', 'minute': 'die', 'sekunde': 'die',
  'woche': 'die', 'zeit': 'die', 'nacht': 'die',
  
  // Nature - mostly masc
  'baum': 'der', 'wald': 'der', 'berg': 'der', 'fluss': 'der',
  'see': 'der', 'weg': 'der', 'park': 'der', 'garten': 'der',
  
  // Places - mostly masc
  'ort': 'der', 'platz': 'der', 'markt': 'der', 'bahnhof': 'der',
  'flughafen': 'der', 'hafen': 'der', 'turm': 'der',
  
  // Places - fem
  'stadt': 'die', 'straße': 'die', 'brücke': 'die', 'kirche': 'die',
  'schule': 'die', 'universität': 'die', 'fabrik': 'die',
  'apotheke': 'die', 'bank': 'die',
  
  // Body parts
  'kopf': 'der', 'arm': 'der', 'fuß': 'der', 'finger': 'der',
  'mund': 'der', 'zahn': 'der', 'hals': 'der', 'rücken': 'der',
  'bauch': 'der', 'daumen': 'der',
  'hand': 'die', 'nase': 'die',
  'auge': 'das', 'ohr': 'das', 'bein': 'das', 'herz': 'das',
  
  // Animals
  'hund': 'der', 'kater': 'der', 'ochse': 'der', 'stier': 'der',
  'löwe': 'der', 'affe': 'der', 'vogel': 'der', 'fisch': 'der',
  'wolf': 'der', 'bär': 'der',
  'katze': 'die', 'kuh': 'die', 'ente': 'die', 'gans': 'die',
  'pferd': 'das', 'schaf': 'das', 'schwein': 'das', 'kaninchen': 'das',
  'lamm': 'das', 'kalb': 'das', 'ferkel': 'das',
  
  // Food/drink
  'apfel': 'der', 'käse': 'der', 'reis': 'der', 'fisch': 'der',
  'kaffee': 'der', 'tee': 'der', 'wein': 'der', 'saft': 'der',
  'kuchen': 'der', 'keks': 'der', 'bonbon': 'der',
  'milch': 'die', 'butter': 'die', 'suppe': 'die',
  
  // Household
  'haus': 'das', 'zimmer': 'das', 'auto': 'das', 'rad': 'das',
  'fenster': 'das', 'bett': 'das', 'sofa': 'das',
  'buch': 'das', 'heft': 'das', 'wort': 'das', 'bild': 'das',
  'land': 'das', 'dorf': 'das',
  'lampe': 'die',
  
  // Abstract - mostly fem
  'liebe': 'die', 'freude': 'die', 'angst': 'die', 'hoffnung': 'die',
  'idee': 'die', 'meinung': 'die', 'antwort': 'die', 'frage': 'die',
  'möglichkeit': 'die', 'chance': 'die',
  
  // Common neuter
  'wasser': 'das', 'feuer': 'das', 'wetter': 'das', 'klima': 'das',
  'leben': 'das', 'glück': 'das', 'pech': 'das',
  'geld': 'das', 'gold': 'das', 'silber': 'das', 'eisen': 'das',
  
  // Common monosyllabic natives (added 2026-07-31 for stress-test coverage)
  'post': 'die', 'maus': 'die', 'see': 'der', 'tor': 'das', 'tür': 'die',
  'uhr': 'die', 'wand': 'die', 'hand': 'die', 'band': 'das', 'land': 'das',
  'hemd': 'das', 'bad': 'das', 'dach': 'das', 'fach': 'das', 'loch': 'das',
  'tuch': 'das', 'reh': 'das', 'kuh': 'die', 'schuh': 'der', 'buch': 'das',
  'mann': 'der', 'frau': 'die', 'kind': 'das',
  'brot': 'das', 'haar': 'das', 'tal': 'das',
  'möbel': 'das', // Sheet had wrong: das Möbel (plural: die Möbel)
  'dutzend': 'das', 'elend': 'das', 'humus': 'der',
  'konsum': 'der', 'luxus': 'der', 'reichtum': 'der', 'irrtum': 'der',
  'held': 'der', 'schlaf': 'der', 'herd': 'der', 'fjord': 'der',
  'flug': 'der', 'zug': 'der', 'pass': 'der', 'fass': 'das',
  'schloss': 'das', 'nuss': 'die', 'eis': 'das', 'list': 'die',
  'wirt': 'der', 'ort': 'der', 'wert': 'der', 'sport': 'der',
  'witz': 'der', 'blitz': 'der', 'schatz': 'der', 'tanz': 'der',
  'fleck': 'der', 'zweck': 'der', 'pfahl': 'der', 'nadel': 'die',
  'wurzel': 'die', 'helm': 'der', 'figur': 'die',
  'benzin': 'das', 'vitamin': 'das', 'insulin': 'das',
  'zeuge': 'der', 'gemälde': 'das',
  'logos': 'der', 'professor': 'der', 'doktor': 'der', 'traktor': 'der',
  'mac': 'der', 'shop': 'der', 'show': 'die', 'party': 'die',
  'baby': 'das', 'cello': 'das',

  // Common monosyllabic additions (round 2)
  'kraft': 'die', 'schoß': 'der', 'kreis': 'der',
  // Common masc
  'plan': 'der', 'punkt': 'der', 'text': 'der', 'film': 'der',
  'brief': 'der', 'roman': 'der',
  'name': 'der', 'fehler': 'der', 'beruf': 'der', 'auftrag': 'der',
  
  // Misc A1
  'wort': 'das', 'ding': 'das', 'foto': 'das', 'video': 'das',
  'regel': 'die', 'liste': 'die', 'nummer': 'die',
  'lied': 'das', 'buch': 'das', 'spiel': 'das',
  
  // Computer/internet
  'computer': 'der', 'drucker': 'der', 'browser': 'der', 'server': 'der',
  'router': 'der', 'monitor': 'der',
  'mail': 'die', 'website': 'die', 'app': 'die',
  'programm': 'das', 'system': 'das', 'update': 'das',
  'internet': 'das', 'netz': 'das', 'passwort': 'das',
  'foto': 'das', 'video': 'das',
  
  // Work/business
  'büro': 'das', 'projekt': 'das', 'team': 'das', 'meeting': 'das',
  'konzept': 'das', 'beispiel': 'das', 'thema': 'das', 'problem': 'das',
  'zimmer': 'das', 'gebäude': 'das', 'unternehmen': 'das',
  'bericht': 'der', 'vertrag': 'der', 'auftrag': 'der', 'kunde': 'der',
  'firma': 'die', 'branche': 'die', 'abteilung': 'die',
  'arbeit': 'die', 'aufgabe': 'die', 'lösung': 'die',
  'chef': 'der', 'manager': 'der', 'kollege': 'der', 'mitarbeiter': 'der',
  
  // Countries/cities (mostly fem/neut)
  'deutschland': 'das', 'österreich': 'das', 'amerika': 'das',
  'china': 'das', 'russland': 'das', 'frankreich': 'das', 'italien': 'das',
  'spanien': 'das', 'japan': 'das',
  'schweiz': 'die', 'türkei': 'die',
  'berlin': 'das', 'münchen': 'das', 'frankfurt': 'das', 'hamburg': 'das',
  
  // Vehicles
  'wagen': 'der', 'bus': 'der', 'zug': 'der', 'lastwagen': 'der',
  'motorrad': 'das', 'fahrrad': 'das', 'schiff': 'das', 'flugzeug': 'das',
  'boot': 'das', 'taxi': 'das',

  // ===== Added 2026-08-01: Root-dependent -e words (override -e$ → die) =====
  // Animals / masc -e
  'riese': 'der', 'hase': 'der', 'affe': 'der', 'käse': 'der',
  'falke': 'der', 'funke': 'der', 'knabe': 'der', 'bube': 'der',
  'schimmel': 'der', 'pfosten': 'der', 'schinken': 'der', 'pfahl': 'der',
  'bürge': 'der', 'zeuge': 'der', 'kunde': 'der', 'nachbar': 'der',
  'nagel': 'der', 'pfosten': 'der', 'nadel': 'die', 'insel': 'die',
  'bauer': 'der', 'bär': 'der', 'eber': 'der', 'geier': 'der',
  'habicht': 'der', 'karpfen': 'der', 'schmetterling': 'der',
  'fuchs': 'der', 'löwe': 'der', 'elefant': 'der', 'tiger': 'der',
  'wolf': 'der', 'adler': 'der',
  // People / masc -e (nationalities, professions)
  'russe': 'der', 'finne': 'der', 'grieche': 'der', 'pole': 'der',
  'schwede': 'der', 'tscheche': 'der', 'slowake': 'der', 'sachse': 'der',
  'franzose': 'der', 'engländer': 'der', 'italiener': 'der', 'spanier': 'der',
  'japaner': 'der', 'chinese': 'der', 'koreaner': 'der', 'portugiese': 'der',
  'holländer': 'der', 'däne': 'der', 'norweger': 'der', 'kroate': 'der',
  'serbe': 'der', 'rumäne': 'der', 'ungar': 'der', 'türke': 'der',
  'patient': 'der', 'präsident': 'der', 'assistent': 'der',
  'praktikant': 'der', 'musikant': 'der', 'kommandant': 'der',
  // Common -e nouns by gender
  'gebäude': 'das', 'gemälde': 'das', 'interesse': 'das', 'abenteuer': 'das',
  'genie': 'das', 'erbe': 'das', 'ergebnis': 'das',
  'aussage': 'die', 'analyse': 'die', 'partei': 'die',
  'theorie': 'die', 'philosophie': 'die', 'technologie': 'die', 'energie': 'die',
  'strategie': 'die', 'taktik': 'die', 'methode': 'die', 'episode': 'die',
  'phase': 'die', 'basis': 'die', 'krise': 'die', 'masse': 'die',
  'reise': 'die', 'strecke': 'die', 'sache': 'die',
  'fläche': 'die', 'brücke': 'die', 'lücke': 'die', 'stärke': 'die',
  'größe': 'die', 'länge': 'die', 'breite': 'die', 'höhe': 'die',
  'tiefe': 'die', 'wärme': 'die', 'kälte': 'die', 'nähe': 'die',
  'ferne': 'die', 'liebe': 'die', 'ruhe': 'die', 'treue': 'die',

  // ===== Languages (always das) — added 2026-08-01 =====
  'deutsch': 'das', 'englisch': 'das', 'französisch': 'das', 'spanisch': 'das',
  'italienisch': 'das', 'portugiesisch': 'das', 'russisch': 'das', 'chinesisch': 'das',
  'japanisch': 'das', 'koreanisch': 'das', 'arabisch': 'das', 'türkisch': 'das',
  'polnisch': 'das', 'tschechisch': 'das', 'ungarisch': 'das', 'griechisch': 'das',
  'latein': 'das', 'hebräisch': 'das', 'hindi': 'das',
  'schwedisch': 'das', 'norwegisch': 'das', 'dänisch': 'das', 'finnisch': 'das',
  'holländisch': 'das', 'niederländisch': 'das', 'kroatisch': 'das', 'serbisch': 'das',
  'rumänisch': 'das', 'bulgarisch': 'das', 'thai': 'das', 'vietnamesisch': 'das',

  // ===== Cardinal numbers as nouns (always die) — added 2026-08-01 =====
  'eins': 'die', 'zwei': 'die', 'drei': 'die', 'vier': 'die', 'fünf': 'die',
  'sechs': 'die', 'sieben': 'die', 'acht': 'die', 'neun': 'die', 'zehn': 'die',
  'elf': 'die', 'zwölf': 'die', 'dreizehn': 'die', 'vierzehn': 'die',
  'fünfzehn': 'die', 'sechzehn': 'die', 'siebzehn': 'die', 'achtzehn': 'die',
  'neunzehn': 'die', 'zwanzig': 'die', 'dreißig': 'die', 'vierzig': 'die',
  'fünfzig': 'die', 'sechzig': 'die', 'siebzig': 'die', 'achtzig': 'die',
  'neunzig': 'die', 'million': 'die', 'milliarde': 'die', 'billion': 'die',

  // ===== Common countries — added 2026-08-01 =====
  'spanien': 'das', 'portugal': 'das', 'russland': 'das', 'polen': 'das',
  'tschechien': 'das', 'ungarn': 'das', 'griechenland': 'das',
  'china': 'das', 'japan': 'das', 'korea': 'das', 'indien': 'das',
  'brasilien': 'das', 'argentinien': 'das', 'mexiko': 'das',
  'kanada': 'das', 'australien': 'das', 'neuseeland': 'das',
  'libanon': 'der', 'irak': 'der', 'iran': 'der', 'sudan': 'der',
  'jemen': 'der', 'oman': 'der', 'katar': 'das', 'bahrain': 'das',
  'kuba': 'das', 'panama': 'das', 'israel': 'das',
  'england': 'das', 'schottland': 'das', 'irland': 'das', 'wales': 'das',
  'usa': 'die', 'eu': 'die', 'unesco': 'die',

  // ===== Common infinitive-as-noun (will be reinforced by suffix rule) =====
  'essen': 'das', 'trinken': 'das', 'lesen': 'das', 'schlafen': 'das',
  'wandern': 'das', 'schwimmen': 'das', 'kochen': 'das', 'backen': 'das',
  'reisen': 'das', 'lernen': 'das', 'arbeiten': 'das', 'spielen': 'das',
  'tanzen': 'das', 'singen': 'das', 'leben': 'das',
  'sterben': 'das', 'kämpfen': 'das', 'hoffen': 'das', 'lieben': 'das',
  'vergessen': 'das', 'wissen': 'das', 'kennen': 'das',

  // ===== B1 — Everyday extended vocabulary — added 2026-08-01 =====
  // Family & relationships (B1)
  'verwandte': 'der', 'verwandter': 'der', 'angehörige': 'der', 'angehöriger': 'der',
  'ehepartner': 'der', 'ehemann': 'der', 'ehefrau': 'die', 'bräutigam': 'der', 'braut': 'die',
  'enkel': 'der', 'enkelin': 'die', 'neffe': 'der', 'nichte': 'die',
  'cousin': 'der', 'cousine': 'die', 'geschwister': 'die', 'zwilling': 'der',
  'patenkind': 'das', 'pate': 'der', 'patin': 'die', 'witwe': 'die', 'witwer': 'der',
  'waise': 'die', 'pflegekind': 'das', 'stiefvater': 'der', 'stiefmutter': 'die',
  'stiefkind': 'das', 'schwiegermutter': 'die', 'schwiegervater': 'der',
  'schwiegersohn': 'der', 'schwiegertochter': 'die', 'schwager': 'der', 'schwägerin': 'die',

  // Body & health (B1)
  'wirbelsäule': 'die', 'rippe': 'die', 'lunge': 'die', 'leber': 'die',
  'niere': 'die', 'magen': 'der', 'darm': 'der', 'blut': 'das',
  'ader': 'die', 'vene': 'die', 'sehne': 'die', 'muskel': 'der',
  'knorpel': 'der', 'knochen': 'der', 'gelenk': 'das', 'wirbel': 'der',
  'schädel': 'der', 'stirn': 'die', 'wange': 'die', 'kinn': 'das',
  'schulter': 'die', 'brust': 'die', 'rücken': 'der', 'bauch': 'der',
  'hüfte': 'die', 'knie': 'das', 'knöchel': 'der', 'ferse': 'die',
  'zehe': 'die', 'daumen': 'der', 'zeigefinger': 'der', 'mittel': 'das', // Mittel in B1 context
  'ringfinger': 'der', 'kleiner finger': 'der', 'ellenbogen': 'der',
  'handgelenk': 'das', 'augenbraue': 'die', 'wimper': 'die', 'pupille': 'die',
  'netzhaut': 'die', 'hornhaut': 'die', 'zahnfleisch': 'das', 'zunge': 'die',
  'gaumen': 'der', 'rachen': 'der', 'kehlkopf': 'der', 'speiseröhre': 'die',
  'blasen': 'die', 'nabel': 'der',

  // Clothing & accessories (B1)
  'hemd': 'das', 'bluse': 'die', 'hose': 'die', 'jeans': 'die',
  'jacke': 'die', 'mantel': 'der', 'anorak': 'der', 'pullover': 'der',
  'socke': 'die', 'strumpf': 'der', 'unterhose': 'die', 'unterhemd': 'das',
  'bh': 'der', 'büstenhalter': 'der', 'slip': 'der', 'schal': 'der',
  'handschuh': 'der', 'mütze': 'die', 'kappe': 'die', 'hut': 'der',
  'schirm': 'der', 'regenschirm': 'der', 'sonnenschirm': 'der',
  'gürtel': 'der', 'riemen': 'der', 'kragen': 'der', 'ärmel': 'der',
  'knopf': 'der', 'reißverschluss': 'der', 'saum': 'der', 'bündchen': 'das',
  'stoff': 'der', 'baumwolle': 'die', 'wolle': 'die', 'seide': 'die',
  'leinen': 'das', 'leder': 'das', 'pelz': 'der', 'samt': 'der',
  'krawatte': 'die', 'fliege': 'die', 'strick': 'der', 'schleife': 'die',

  // Food & cooking (B1)
  'kartoffel': 'die', 'tomate': 'die', 'zwiebel': 'die', 'knoblauch': 'der',
  'karotte': 'die', 'möhre': 'die', 'paprika': 'die', 'gurke': 'die',
  'salat': 'der', 'kohl': 'der', 'brokkoli': 'der', 'blumenkohl': 'der',
  'spinat': 'der', 'erbsen': 'die', 'bohnen': 'die', 'linsen': 'die',
  'mais': 'der', 'reis': 'der', 'nudel': 'die', 'spaghetti': 'die',
  'pizza': 'die', 'burger': 'der', 'sandwich': 'das', 'toast': 'der',
  'brötchen': 'das', 'semmel': 'die', 'baguette': 'das', 'croissant': 'das',
  'käse': 'der', 'quark': 'der', 'joghurt': 'der', 'sahne': 'die',
  'rahm': 'der', 'speisequark': 'der', 'skyr': 'der', 'hüttenkäse': 'der',
  'wurst': 'die', 'schinken': 'der', 'speck': 'der', 'salami': 'die',
  'braten': 'der', 'schnitzel': 'das', 'kotelett': 'das', 'gulasch': 'das',
  'fisch': 'der', 'lachs': 'der', 'forelle': 'die', 'karpfen': 'der',
  'thunfisch': 'der', 'kabeljau': 'der', 'hering': 'der', 'sardine': 'die',
  'garnele': 'die', 'muschel': 'die', 'austern': 'die', 'hummer': 'der',
  'krabbe': 'die', 'tintenfisch': 'der', 'frucht': 'die', 'obst': 'das',
  'gemüse': 'das', 'beere': 'die', 'erdbeere': 'die', 'himbeere': 'die',
  'blaubeere': 'die', 'brombeere': 'die', 'johannisbeere': 'die',
  'kirsche': 'die', 'pflaume': 'die', 'aprikose': 'die', 'pfirsich': 'der',
  'birne': 'die', 'banane': 'die', 'ananas': 'die', 'mango': 'die',
  'kiwi': 'die', 'zitrone': 'die', 'limette': 'die', 'grapefruit': 'die',
  'orange': 'die', 'mandarine': 'die', 'dattel': 'die', 'feige': 'die',
  'oliven': 'die', 'mandel': 'die', 'haselnuss': 'die', 'walnuss': 'die',
  'kastanie': 'die', 'erdnuss': 'die', 'pistazie': 'die', 'kokosnuss': 'die',
  'gewürz': 'das', 'salz': 'das', 'pfeffer': 'der', 'zucker': 'der',
  'essig': 'der', 'öl': 'das', 'senf': 'der', 'ketchup': 'der',
  'mayonnaise': 'die', 'soße': 'die', 'brühe': 'die', 'fond': 'der',
  'mehl': 'das', 'grieß': 'der', 'hafer': 'der', 'gerste': 'die',
  'weizen': 'der', 'roggen': 'der', 'hirse': 'die', 'buchweizen': 'der',
  'hefe': 'die', 'backpulver': 'das', 'teig': 'der', 'masse': 'die',

  // House & home (B1)
  'wohnung': 'die', 'haus': 'das', 'villa': 'die', 'bungalow': 'der',
  'reihenhaus': 'das', 'einfamilienhaus': 'das', 'mehrfamilienhaus': 'das',
  'hochhaus': 'das', 'mietshaus': 'das', 'etage': 'die', 'stock': 'der',
  'stockwerk': 'das', 'keller': 'der', 'dachgeschoss': 'das', 'dachboden': 'der',
  'garage': 'die', 'carport': 'der', 'garten': 'der', 'balkon': 'der',
  'terrasse': 'die', 'veranda': 'die', 'loggia': 'die', 'patio': 'der',
  'eingang': 'der', 'ausgang': 'der', 'flur': 'der', 'diele': 'die',
  'treppe': 'die', 'treppenhaus': 'das', 'aufzug': 'der', 'fahrstuhl': 'der',
  'küche': 'die', 'küche': 'die', 'kochnische': 'die', 'speisekammer': 'die',
  'vorratskammer': 'die', 'wohnzimmer': 'das', 'esszimmer': 'das',
  'schlafzimmer': 'das', 'kinderzimmer': 'das', 'arbeitszimmer': 'das',
  'gästezimmer': 'das', 'badezimmer': 'das', 'bad': 'das', 'dusche': 'die',
  'badewanne': 'die', 'toilette': 'die', 'wc': 'das', 'klo': 'das',
  'waschbecken': 'das', 'spülbecken': 'das', 'spüle': 'die', 'herd': 'der',
  'ofen': 'der', 'backofen': 'der', 'kühlschrank': 'der', 'gefrierschrank': 'der',
  'kühltruhe': 'die', 'gefriertruhe': 'die', 'spülmaschine': 'die',
  'waschmaschine': 'die', 'trockner': 'der', 'bügeleisen': 'das', 'staubsauger': 'der',
  'besen': 'der', 'schaufel': 'die', 'eimer': 'der', 'wischeimer': 'der',
  'lappen': 'der', 'tuch': 'das', 'handtuch': 'das', 'badetuch': 'das',
  'geschirrtuch': 'das', 'bett': 'das', 'bettdecke': 'die', 'kopfkissen': 'das',
  'kissen': 'das', 'matratze': 'die', 'lattenrost': 'der', 'schrank': 'der',
  'kleiderschrank': 'der', 'küchenschrank': 'der', 'regal': 'das', 'bücherregal': 'das',
  'kommode': 'die', 'schreibtisch': 'der', 'stuhl': 'der', 'sessel': 'der',
  'couch': 'die', 'sofa': 'das', 'bank': 'die', 'hocker': 'der',
  'tisch': 'der', 'esstisch': 'der', 'couchtisch': 'der', 'beistelltisch': 'der',
  'lampe': 'die', 'leuchte': 'die', 'kerze': 'die', 'laterne': 'die',
  'teppich': 'der', 'vorleger': 'der', 'fußmatte': 'die', 'gardine': 'die',
  'vorhang': 'der', 'rollo': 'das', 'jalousie': 'die', 'plissee': 'das',
  'wand': 'die', 'decke': 'die', 'boden': 'der', 'parkett': 'das',
  'fliese': 'die', 'teppichboden': 'der', 'laminat': 'das', 'vinyl': 'das',

  // City & infrastructure (B1)
  'straße': 'die', 'gasse': 'die', 'allee': 'die', 'boulevard': 'der',
  'autobahn': 'die', 'schnellstraße': 'die', 'landstraße': 'die', 'bundesstraße': 'die',
  'kreuzung': 'die', 'einmündung': 'die', 'auffahrt': 'die', 'abfahrt': 'die',
  'ausfahrt': 'die', 'parkplatz': 'der', 'parkhaus': 'das', 'tiefgarage': 'die',
  'bushaltestelle': 'die', 'haltestelle': 'die', 'bahnhof': 'der', 'flughafen': 'der',
  'hafen': 'der', 'seehafen': 'der', 'flughafen': 'der', 'werft': 'die',
  'kai': 'der', 'mole': 'die', 'pier': 'der', 'brücke': 'die',
  'tunnel': 'der', 'unterführung': 'die', 'überführung': 'die', 'damm': 'der',
  'deich': 'der', 'kanal': 'der', 'graben': 'der', 'bach': 'der',
  'fluss': 'der', 'bach': 'der', 'teich': 'der', 'see': 'die',  // B1: die See (lake)
  'meer': 'das', 'ozean': 'der', 'lagune': 'die',
  'insel': 'die', 'halbinsel': 'die', 'kap': 'das', 'küste': 'die',
  'strand': 'der', 'klippe': 'die', 'fels': 'der', 'felsen': 'der',
  'höhle': 'die', 'grotte': 'die', 'schlucht': 'die', 'tal': 'das',
  'berg': 'der', 'hügel': 'der', 'kuppe': 'die', 'gipfel': 'der',
  'sattel': 'der', 'pass': 'der', 'kamm': 'der', 'grat': 'der',
  'wald': 'der', 'forst': 'der', 'dickicht': 'das', 'urwald': 'der',
  'park': 'der', 'garten': 'der', 'wiese': 'die', 'weide': 'die',
  'feld': 'das', 'acker': 'der', 'weinberg': 'der', 'obstgarten': 'der',
  'gemüsegarten': 'der', 'spielplatz': 'der', 'sportplatz': 'der', 'stadion': 'das',
  'arena': 'die', 'freibad': 'das', 'schwimmbad': 'das', 'hallenbad': 'das',
  'strandbad': 'das', 'zoo': 'der', 'tierpark': 'der', 'wildpark': 'der',

  // Transport (B1)
  'auto': 'das', 'wagen': 'der', 'pkw': 'der', 'lkw': 'der',
  'lastkraftwagen': 'der', 'lieferwagen': 'der', 'transporter': 'der',
  'motorrad': 'das', 'moped': 'das', 'roller': 'der', 'fahrrad': 'das',
  'mountainbike': 'das', 'rennrad': 'das', 'e-bike': 'das', 'pedelec': 'das',
  'bus': 'der', 'reisebus': 'der', 'stadtbus': 'der', 'linienbus': 'der',
  'zug': 'der', 'eisenbahn': 'die', 'regionalbahn': 'die', 's-bahn': 'die',
  'u-bahn': 'die', 'straßenbahn': 'die', 'tram': 'die', 'taxi': 'das',
  'flugzeug': 'das', 'hubschrauber': 'der', 'ballon': 'der', 'zeppelin': 'der',
  'drohne': 'die', 'schiff': 'das', 'boot': 'das', 'kanu': 'das',
  'kajak': 'das', 'segelboot': 'das', 'motorboot': 'das', 'yacht': 'die',
  'fähre': 'die', 'floss': 'das', 'floß': 'das', 'ruderboot': 'das',
  'jetski': 'der', 'wassermotorrad': 'das',

  // Tools & household (B1)
  'werkzeug': 'das', 'gerät': 'das', 'hammer': 'der', 'nagel': 'der',
  'schraube': 'die', 'schraubenzieher': 'der', 'schraubendreher': 'der',
  'zange': 'die', 'schere': 'die', 'säge': 'die', 'bohrer': 'der',
  'bohrmaschine': 'die', 'schleifmaschine': 'die', 'schweißgerät': 'das',
  'lötkolben': 'der', 'lineal': 'das', 'maßstab': 'der', 'meterstab': 'der',
  'bandmaß': 'das', 'zollstock': 'der', 'wasserwaage': 'die', 'lot': 'das',
  'klappspaten': 'der', 'spaten': 'der', 'schaufel': 'die', 'pickel': 'der',
  'hacke': 'die', 'rechen': 'der', 'harke': 'die', 'besen': 'der',
  'schubkarre': 'die', 'karre': 'die', 'eimer': 'der', 'kanister': 'der',
  'krug': 'der', 'kanne': 'die', 'tasse': 'die', 'becher': 'der',
  'glas': 'das', 'kelch': 'der', 'pokal': 'der', 'flasche': 'die',
  'krug': 'der', 'topf': 'der', 'pfanne': 'die', 'kessel': 'der',
  'schüssel': 'die', 'platte': 'die', 'teller': 'der', 'teller': 'der',
  'untertasse': 'die', 'schale': 'die', 'napf': 'der', 'töpfchen': 'das',
  'löffel': 'der', 'gabel': 'die', 'messer': 'das', 'essstäbchen': 'die',
  'besteck': 'das', 'messer': 'das', 'gabel': 'die', 'löffel': 'der',
  'kochlöffel': 'der', 'kelle': 'die', 'sieb': 'das', 'durchschlag': 'der',
  'schneebesen': 'der', 'rührgerät': 'das', 'mixer': 'der', 'pürierstab': 'der',
  'waage': 'die', 'küchenwaage': 'die', 'briefwaage': 'die',

  // Office & work (B1)
  'büro': 'das', 'arbeitszimmer': 'das', 'arbeitsplatz': 'der', 'schreibtisch': 'der',
  'computer': 'der', 'laptop': 'der', 'tablet': 'das', 'monitor': 'der',
  'bildschirm': 'der', 'tastatur': 'die', 'maus': 'die', 'touchpad': 'das',
  'trackpad': 'das', 'drucker': 'der', 'scanner': 'der', 'kopierer': 'der',
  'faxgerät': 'das', 'fax': 'das', 'telefon': 'das', 'handy': 'das',
  'smartphone': 'das', 'mobiltelefon': 'das', 'festnetztelefon': 'das',
  'headset': 'das', 'kopfhörer': 'der', 'lautsprecher': 'der', 'mikrofon': 'das',
  'webcam': 'die', 'kamera': 'die', 'fotoapparat': 'der', 'camcorder': 'der',
  'videokamera': 'die', 'stativ': 'das', 'steckdose': 'die', 'verlängerungskabel': 'das',
  'kabel': 'das', 'adapter': 'der', 'ladegerät': 'das', 'akku': 'der',
  'batterie': 'die', 'speicher': 'der', 'festplatte': 'die', 'ssd': 'die',
  'usb-stick': 'der', 'speicherstick': 'der', 'cd': 'die', 'dvd': 'die',
  'diskette': 'die', 'kassette': 'die', 'tonband': 'das', 'videokassette': 'die',
  'papier': 'das', 'blatt': 'das', 'bogen': 'der', 'heft': 'das',
  'notizbuch': 'das', 'notizblock': 'der', 'tagebuch': 'das', 'kalender': 'der',
  'agenda': 'die', 'planer': 'der', 'terminplaner': 'der', 'ordner': 'der',
  'mappe': 'die', 'hülle': 'die', 'umschlag': 'der', 'briefumschlag': 'der',
  'kuvert': 'das', 'brief': 'der', 'schreiben': 'das', 'dokument': 'das',
  'formular': 'das', 'vertrag': 'der', 'rechnung': 'die', 'quittung': 'die',
  'beleg': 'der', 'kassenbon': 'der', 'scheck': 'der', 'scheckkarte': 'die',
  'kreditkarte': 'die', 'ec-karte': 'die', 'geldkarte': 'die', 'visum': 'das',
  'pass': 'der', 'reisepass': 'der', 'ausweis': 'der', 'personalausweis': 'der',
  'führerschein': 'der', 'führerschein': 'der', 'führer': 'der', 'führerin': 'die',

  // Communication (B1)
  'sprache': 'die', 'rede': 'die', 'gespräch': 'das', 'diskussion': 'die',
  'unterhaltung': 'die', 'konversation': 'die', 'dialog': 'der', 'monolog': 'der',
  'streit': 'der', 'streitgespräch': 'das', 'diskussion': 'die', 'debatte': 'die',
  'argument': 'das', 'meinung': 'die', 'ansicht': 'die', 'einstellung': 'die',
  'haltung': 'die', 'position': 'die', 'standpunkt': 'der', 'überzeugung': 'die',
  'glaube': 'der', 'glauben': 'der', 'überzeugung': 'die', 'vertrauen': 'das',
  'zweifel': 'der', 'frage': 'die', 'problem': 'das', 'schwierigkeit': 'die',
  'herausforderung': 'die', 'aufgabe': 'die', 'problem': 'das', 'pflicht': 'die',
  'verantwortung': 'die', 'schuld': 'die', 'fehler': 'der', 'irrtum': 'der',

  // Education (B1)
  'schule': 'die', 'grundschule': 'die', 'hauptschule': 'die', 'realschule': 'die',
  'gymnasium': 'das', 'gesamtschule': 'die', 'berufsschule': 'die', 'fachschule': 'die',
  'hochschule': 'die', 'universität': 'die', 'fachhochschule': 'die',
  'volkshochschule': 'die', 'kindergarten': 'der', 'kita': 'die', 'hort': 'der',
  'klasse': 'die', 'schulklasse': 'die', 'kurs': 'der', 'lehrgang': 'der',
  'seminar': 'das', 'vorlesung': 'die', 'übung': 'die', 'praktikum': 'das',
  'praktikant': 'der', 'praktikantin': 'die', 'auszubildende': 'der',
  'auszubildender': 'der', 'azubi': 'der', 'lehrling': 'der', 'lehrling': 'der',
  'student': 'der', 'studentin': 'die', 'doktorand': 'der', 'doktorandin': 'die',
  'stipendiat': 'der', 'stipendiatin': 'die', 'schüler': 'der', 'schülerin': 'die',
  'lehrer': 'der', 'lehrerin': 'die', 'dozent': 'der', 'dozentin': 'die',
  'professor': 'der', 'professorin': 'die', 'lehrstuhl': 'der', 'fakultät': 'die',
  'fachbereich': 'der', 'institut': 'das', 'dekanat': 'das', 'rektorat': 'das',
  'prüfung': 'die', 'klausur': 'die', 'test': 'der', 'examen': 'das',
  'zeugnis': 'das', 'diplom': 'das', 'zertifikat': 'das', 'urkunde': 'die',
  'note': 'die', 'zensur': 'die', 'bewertung': 'die', 'beurteilung': 'die',

  // Work & professions (B1)
  'beruf': 'der', 'job': 'der', 'stelle': 'die', 'anstellung': 'die',
  'position': 'die', 'posten': 'der', 'amt': 'das', 'aufgabe': 'die',
  'tätigkeit': 'die', 'beschäftigung': 'die', 'arbeit': 'die', 'erwerb': 'der',
  'karriere': 'die', 'laufbahn': 'die', 'werdegang': 'der', 'berufslaufbahn': 'die',
  'gehalt': 'das', 'lohn': 'der', 'einkommen': 'das', 'verdienst': 'der',
  'gehaltsabrechnung': 'die', 'lohnabrechnung': 'die', 'sozialversicherung': 'die',
  'rente': 'die', 'pension': 'die', 'ruhegeld': 'das', 'versorgung': 'die',
  'arbeitszeit': 'die', 'arbeitsstelle': 'die', 'arbeitsplatz': 'der',
  'arbeitsvertrag': 'der', 'kündigung': 'die', 'kündigungsschreiben': 'das',
  'arbeitszeugnis': 'das', 'zeugnis': 'das', 'referenz': 'die', 'empfehlung': 'die',
  'bewerbung': 'die', 'lebenslauf': 'der', 'anschreiben': 'das', 'motivationsschreiben': 'das',
  'vorstellungsgespräch': 'das', 'bewerbungsgespräch': 'das', 'einstellung': 'die',
  'beförderung': 'die', 'versetzung': 'die', 'abteilung': 'die', 'team': 'das',
  'gruppe': 'die', 'gruppe': 'die', 'abteilung': 'die', 'sektion': 'die',
  'abteilung': 'die', 'filiale': 'die', 'niederlassung': 'die', 'zentrale': 'die',
  'hauptsitz': 'der', 'firmensitz': 'der', 'geschäftssitz': 'der', 'standort': 'der',

  // Health & medical (B1)
  'arzt': 'der', 'ärztin': 'die', 'doktor': 'der', 'doktorin': 'die',
  'zahnarzt': 'der', 'zahnärztin': 'die', 'kieferorthopäde': 'der',
  'augenarzt': 'der', 'augenärztin': 'die', 'facharzt': 'der', 'fachärztin': 'die',
  'hausarzt': 'der', 'hausärztin': 'die', 'notarzt': 'der', 'notärztin': 'die',
  'sanitäter': 'der', 'sanitäterin': 'die', 'krankenpfleger': 'der',
  'krankenschwester': 'die', 'pfleger': 'der', 'pflegerin': 'die',
  'therapeut': 'der', 'therapeutin': 'die', 'psychologe': 'der', 'psychologin': 'die',
  'psychotherapeut': 'der', 'psychiater': 'der', 'psychiaterin': 'die',
  'apotheke': 'die', 'apotheker': 'der', 'apothekerin': 'die', 'medizin': 'die',
  'medikament': 'das', 'arzneimittel': 'das', 'präparat': 'das', 'tablette': 'die',
  'kapsel': 'die', 'tropfen': 'die', 'saft': 'der', 'sirup': 'der',
  'zäpfchen': 'das', 'pille': 'die', 'salbe': 'die', 'creme': 'die',
  'tinktur': 'die', 'pflaster': 'das', 'verband': 'der', 'binde': 'die',
  'kompresse': 'die', 'mullbinde': 'die', 'elastische binde': 'die',
  'injektion': 'die', 'spritze': 'die', 'nadel': 'die', 'kanüle': 'die',
  'skalpell': 'das', 'klemme': 'die', 'pinzette': 'die', 'schere': 'die',
  'stethoskop': 'das', 'thermometer': 'das', 'blutdruckmessgerät': 'das',
  'röntgengerät': 'das', 'ct': 'das', 'mrt': 'das', 'ultraschall': 'der',
  'endoskop': 'das', 'mikroskop': 'das', 'labor': 'das', 'analyse': 'die',
  'diagnose': 'die', 'therapie': 'die', 'behandlung': 'die', 'operation': 'die',
  'eingriff': 'der', 'transplantation': 'die', 'implantation': 'die',
  'narkose': 'die', 'anästhesie': 'die', 'rehabilitation': 'die', 'reha': 'die',
  'genesung': 'die', 'heilung': 'die', 'gesundheit': 'die', 'krankheit': 'die',
  'erkrankung': 'die', 'leiden': 'das', 'beschwerde': 'die', 'symptom': 'das',
  'fieber': 'das', 'schmerz': 'der', 'entzündung': 'die', 'infektion': 'die',
  'virus': 'das', 'bakterie': 'die', 'pilz': 'der', 'allergie': 'die',
  'asthma': 'das', 'diabetes': 'der', 'krebs': 'der', 'tumor': 'der',
  'herzinfarkt': 'der', 'schlaganfall': 'der', 'leukämie': 'die', 'hiv': 'das',
  'aids': 'das', 'demenz': 'die', 'alzheimer': 'das', 'parkinson': 'der',
  'multiple sklerose': 'die', 'epilepsie': 'die', 'migräne': 'die', 'grippe': 'die',
  'erkältung': 'die', 'schnupfen': 'der', 'husten': 'der', 'halsschmerzen': 'die',
  'durchfall': 'der', 'verstopfung': 'die', 'übelkeit': 'die', 'erbrechen': 'das',

  // Sports (B1)
  'sport': 'der', 'sportart': 'die', 'disziplin': 'die', 'training': 'das',
  'übung': 'die', 'aufwärmen': 'das', 'dehnen': 'das', 'stretching': 'das',
  'fitness': 'die', 'fitnessstudio': 'das', 'studio': 'das', 'turnhalle': 'die',
  'halle': 'die', 'feld': 'das', 'platz': 'der', 'court': 'der',
  'spielfeld': 'das', 'sportplatz': 'der', 'stadion': 'das', 'arena': 'die',
  'schwimmbad': 'das', 'becken': 'das', 'pool': 'der',  // no duplicate 'see'
  'meer': 'das', 'strand': 'der', 'skipiste': 'die', 'piste': 'die',
  'loipe': 'die', 'eisbahn': 'die', 'schlittschuh': 'der', 'ski': 'der',
  'snowboard': 'das', 'schlitten': 'der', 'rodel': 'der', 'sled': 'der',
  'fahrrad': 'das', 'mountainbike': 'das', 'heimtrainer': 'der', 'ergometer': 'das',
  'hantel': 'die', 'gewicht': 'das', 'kreisel': 'der', 'springseil': 'das',
  'ball': 'der', 'fußball': 'der', 'basketball': 'der', 'volleyball': 'der',
  'handball': 'der', 'tennisball': 'der', 'golfball': 'der', 'tischtennisball': 'der',
  'schläger': 'der', 'racket': 'das', 'schläger': 'der', 'keule': 'die',
  'schwert': 'das', 'fecht': 'das', 'bogen': 'der', 'pfeil': 'der',
  'speer': 'der', 'diskus': 'der', 'hammer': 'der', 'kugel': 'die',
  'geweih': 'das', 'rekord': 'der', 'bestleistung': 'die', 'meisterschaft': 'die',
  'wettkampf': 'der', 'wettbewerb': 'der', 'turnier': 'das', 'spiel': 'das',
  'match': 'das', 'partie': 'die', 'runde': 'die', 'satz': 'der',
  'spielzug': 'der', 'punkt': 'der', 'tor': 'das', 'treffer': 'der',
  'sieg': 'der', 'niederlage': 'die', 'unentschieden': 'das', 'remis': 'das',
  'mannschaft': 'die', 'team': 'das', 'kader': 'der', 'aufstellung': 'die',
  'trainer': 'der', 'trainerin': 'die', 'coach': 'der', 'co-trainer': 'der',
  'schiedsrichter': 'der', 'schiedsrichterin': 'die', 'linienrichter': 'der',
  'linienrichterin': 'die', 'fan': 'der', 'fanin': 'die', 'zuschauer': 'der',
  'zuschauerin': 'die', 'publikum': 'das', 'stadion': 'das', 'tribüne': 'die',

  // Arts & culture (B1)
  'kunst': 'die', 'kunstwerk': 'das', 'werk': 'das', 'gemälde': 'das',
  'bild': 'das', 'malerei': 'die', 'zeichnung': 'die', 'skizze': 'die',
  'illustration': 'die', 'grafik': 'die', 'plakat': 'das', 'poster': 'das',
  'skulptur': 'die', 'plastik': 'die', 'statue': 'die', 'büste': 'die',
  'relief': 'das', 'installation': 'die', 'performance': 'die', 'kunstaktion': 'die',
  'fotografie': 'die', 'foto': 'das', 'bild': 'das', 'aufnahme': 'die',
  'film': 'der', 'kinofilm': 'der', 'spielfilm': 'der', 'dokumentarfilm': 'der',
  'kurzfilm': 'der', 'animationsfilm': 'der', 'zeichnung': 'die', 'comic': 'der',
  'manga': 'der', 'graphic novel': 'die', 'roman': 'der', 'erzählung': 'die',
  'geschichte': 'die', 'märchen': 'das', 'sage': 'die', 'fabel': 'die',
  'legende': 'die', 'mythos': 'der', 'mythologie': 'die', 'epos': 'das',
  'gedicht': 'das', 'lied': 'das', 'sonett': 'das', 'ode': 'die',
  'ballade': 'die', 'hymne': 'die', 'elegie': 'die', 'epigramm': 'das',
  'drama': 'das', 'tragödie': 'die', 'komödie': 'die', 'lustspiel': 'das',
  'schauspiel': 'das', 'theaterstück': 'das', 'stück': 'das', 'akt': 'der',
  'szene': 'die', 'aufzug': 'der', 'monolog': 'der', 'dialog': 'der',
  'regie': 'die', 'inszenierung': 'die', 'aufführung': 'die', 'vorstellung': 'die',
  'premiere': 'die', 'uraufführung': 'die', 'theater': 'das', 'bühne': 'die',
  'kulisse': 'die', 'vorhang': 'der', 'loge': 'die', 'parkett': 'das',
  'rang': 'der', 'balkon': 'der', 'galerie': 'die', 'foyer': 'das',
  'orchester': 'das', 'musikband': 'die', 'ensemble': 'das', 'kapelle': 'die',  // 'band' = das (ribbon), use 'musikband' for music group
  'chor': 'der', 'konzert': 'das', 'aufführung': 'die', 'konzertsaal': 'der',
  'oper': 'die', 'operette': 'die', 'oper': 'die', 'operette': 'die',
  'ballett': 'das', 'musical': 'das', 'show': 'die', 'revue': 'die',
  'varieté': 'das', 'zirkus': 'der', 'manege': 'die', 'artist': 'der',
  'artistin': 'die', 'akrobat': 'der', 'akrobatin': 'die', 'clown': 'der',
  'jongleur': 'der', 'jongleurin': 'die', 'zauberer': 'der', 'zauberin': 'die',
  'magier': 'der', 'magierin': 'die', 'illussionist': 'der', 'illussionistin': 'die',

  // Music (B1)
  'musik': 'die', 'musikstück': 'das', 'komposition': 'die', 'stück': 'das',
  'sonate': 'die', 'symphonie': 'die', 'sinfonie': 'die', 'konzert': 'das',
  'op': 'die', 'op.': 'die', 'präludium': 'das', 'fuge': 'die',
  'kadenz': 'die', 'arie': 'die', 'lied': 'das', 'chanson': 'das',
  'romanze': 'die', 'ballade': 'die', 'etüde': 'die', 'sonatine': 'die',
  'suite': 'die', 'partita': 'die', 'toccata': 'die', 'fantasie': 'die',
  'rhapsodie': 'die', 'kantate': 'die', 'motette': 'die', 'requiem': 'das',
  'messe': 'die', 'oratorium': 'das', 'passion': 'die', 'kantate': 'die',
  'instrument': 'das', 'gerät': 'das', 'klavier': 'das', 'piano': 'das',
  'flügel': 'der', 'cembalo': 'das', 'orgel': 'die', 'harmonium': 'das',
  'geige': 'die', 'violine': 'die', 'bratsche': 'die', 'viola': 'die',
  'cello': 'das', 'violoncello': 'das', 'kontrabass': 'der', 'gitarre': 'die',
  'laute': 'die', 'mandoline': 'die', 'harfe': 'die', 'zither': 'die',
  'flöte': 'die', 'querflöte': 'die', 'blockflöte': 'die', 'oboen': 'die',
  'oboe': 'die', 'klarinette': 'die', 'fagott': 'das', 'saxofon': 'das',
  'saxophon': 'das', 'trompete': 'die', 'posaune': 'die', 'horn': 'das',
  'tuba': 'die', 'pauke': 'die', 'trommel': 'die', 'schlagzeug': 'das',
  'becken': 'das', 'becken': 'das', 'triangel': 'das', 'xylophon': 'das',
  'glockenspiel': 'das', 'gong': 'der', 'sirene': 'die', 'stimme': 'die',
  'gesang': 'der', 'chor': 'der', 'solist': 'der', 'solistin': 'die',
  'sänger': 'der', 'sängerin': 'die', 'musiker': 'der', 'musikerin': 'die',
  'komponist': 'der', 'komponistin': 'die', 'dirigent': 'der', 'dirigentin': 'die',
  'kapellmeister': 'der', 'kapellmeisterin': 'die', 'ton': 'der', 'note': 'die',
  'melodie': 'die', 'harmonie': 'die', 'rhythmus': 'der', 'takt': 'der',
  'beat': 'der', 'tempo': 'das', 'lautstärke': 'die', 'tonlage': 'die',

  // Media (B1)
  'medien': 'die', 'medium': 'das', 'presse': 'die', 'journalismus': 'der',
  'zeitung': 'die', 'tageszeitung': 'die', 'wochenzeitung': 'die',
  'monatszeitung': 'die', 'zeitschrift': 'die', 'magazin': 'das', 'journal': 'das',
  'gazette': 'die', 'postille': 'die', 'revue': 'die', 'rundschau': 'die',
  'artikel': 'der', 'bericht': 'der', 'reportage': 'die', 'kommentar': 'der',
  'glosse': 'die', 'kolumne': 'die', 'rezension': 'die', 'kritik': 'die',
  'interview': 'das', 'umfrage': 'die', 'meinungsumfrage': 'die', 'statistik': 'die',
  'diagramm': 'das', 'tabelle': 'die', 'grafik': 'die', 'foto': 'das',
  'bild': 'das', 'illustration': 'die', 'karikatur': 'die', 'titel': 'der',
  'überschrift': 'die', 'schlagzeile': 'die', 'text': 'der', 'nachricht': 'die',
  'meldung': 'die', 'report': 'der', 'story': 'die', 'feature': 'das',
  'dokumentation': 'die', 'dossier': 'das', 'reportage': 'die', 'essay': 'der',
  'kommentar': 'der', 'glosse': 'die', 'leitartikel': 'der', 'kommentar': 'der',
  'fernsehen': 'das', 'tv': 'das', 'fernseher': 'der', 'fernsehapparat': 'der',
  'sender': 'der', 'kanal': 'der', 'programm': 'das', 'sendung': 'die',
  'serie': 'die', 'show': 'die', 'soap': 'die', 'telenovela': 'die',
  'nachrichten': 'die', 'tagesschau': 'die', 'heute': 'die', 'nachrichten': 'die',
  'werbung': 'die', 'reklame': 'die', 'spot': 'der', 'werbespot': 'der',
  'trailer': 'der', 'vorschau': 'die', 'rückblick': 'der', 'zusammenfassung': 'die',
  'radio': 'das', 'rundfunk': 'der', 'sender': 'der', 'frequenz': 'die',
  'welle': 'die', 'podcast': 'der', 'sendung': 'die', 'folge': 'die',
  'episode': 'die', 'staffel': 'die', 'saison': 'die', 'staffel': 'die',

  // Travel (B1)
  'reise': 'die', 'fahrt': 'die', 'tour': 'die', 'ausflug': 'der',
  'trip': 'der', 'urlaub': 'der', 'ferien': 'die', 'urlaubsreise': 'die',
  'geschäftsreise': 'die', 'dienstreise': 'die', 'rundreise': 'die',
  'kreuzfahrt': 'die', 'schiffsreise': 'die', 'flugreise': 'die',
  'pauschalreise': 'die', 'individualreise': 'die', 'abenteuerreise': 'die',
  'sightseeing': 'das', 'besichtigung': 'die', 'rundgang': 'der', 'führung': 'die',
  'stadtführung': 'die', 'museumsführung': 'die', 'rundfahrt': 'die',
  'wanderung': 'die', 'wanderung': 'die', 'trekking': 'das', 'safari': 'die',
  'expedition': 'die', 'kreuzfahrt': 'die', 'pauschaltour': 'die',
  'reisebüro': 'das', 'reiseveranstalter': 'der', 'reisebürokauffrau': 'die',
  'reisebürokaufmann': 'der', 'reisleiter': 'der', 'reisleiterin': 'die',
  'reiseführer': 'der', 'reisende': 'der', 'reisender': 'der', 'tourist': 'der',
  'touristin': 'die', 'backpacker': 'der', 'globetrotter': 'der',
  'passagier': 'der', 'passagierin': 'die', 'fahrgast': 'der', 'fluggast': 'der',
  'hotelanmeldung': 'die', 'reservierung': 'die', 'buchung': 'die', 'bestätigung': 'die',
  'stornierung': 'die', 'umbuchung': 'die', 'aufenthalt': 'der', 'übernachtung': 'die',
  'unterkunft': 'die', 'hotel': 'das', 'gasthaus': 'das', 'gasthof': 'der',
  'pension': 'die', 'herberge': 'die', 'jugendherberge': 'die', 'hostel': 'das',
  'motel': 'das', 'resort': 'das', 'camp': 'das', 'campingplatz': 'der',
  'wohnwagen': 'der', 'caravan': 'der', 'zelten': 'das', 'zelt': 'das',
  'jurte': 'die', 'iglu': 'das', 'hütte': 'die', 'berghütte': 'die',
  'koje': 'die', 'kabine': 'die', 'kajüte': 'die', 'suite': 'die',
  'doppelzimmer': 'das', 'einzelzimmer': 'das', 'familienzimmer': 'das',
  'frühstück': 'das', 'halbpension': 'die', 'vollpension': 'die',
  'all-inclusive': 'das', 'reception': 'die', 'portier': 'der', 'concierge': 'der',
  'zimmerservice': 'der', 'roomservice': 'der', 'hausmeister': 'der',

  // ===== B2 — Upper intermediate vocabulary — added 2026-08-01 =====
  // Society & politics (B2)
  'gesellschaft': 'die', 'gemeinschaft': 'die', 'sozietät': 'die', 'verein': 'der',
  'organisation': 'die', 'institution': 'die', 'verband': 'der', 'bund': 'der',
  'liga': 'die', 'klub': 'der', 'club': 'der', 'partei': 'die',
  'bewegung': 'die', 'regierung': 'die', 'opposition': 'die', 'koalition': 'die',
  'fraktion': 'die', 'parlament': 'das', 'bundestag': 'der', 'landtag': 'der',
  'bürgerschaft': 'die', 'senat': 'der', 'gemeinderat': 'der', 'stadtrat': 'der',
  'kreistag': 'der', 'bezirksverordnetenversammlung': 'die',
  'demokratie': 'die', 'republik': 'die', 'monarchie': 'die', 'diktatur': 'die',
  'autokratie': 'die', 'theokratie': 'die', 'aristokratie': 'die', 'oligarchie': 'die',
  'anarchie': 'die', 'tyrannei': 'die', 'despotie': 'die', 'diktatur': 'die',
  'bürokratie': 'die', 'hierarchie': 'die', 'autorität': 'die', 'macht': 'die',
  'gewalt': 'die', 'herrschaft': 'die', 'regime': 'das', 'system': 'das',
  'ordnung': 'die', 'chaos': 'das', 'anarchie': 'die', 'stabilität': 'die',
  'wandel': 'der', 'veränderung': 'die', 'umbruch': 'der', 'revolution': 'die',
  'reform': 'die', 'evolution': 'die', 'umwälzung': 'die', 'umsturz': 'der',
  'puts': 'der', 'puts': 'der', 'coup': 'der', 'staatsstreich': 'der',
  'krieg': 'der', 'kriegserklärung': 'die', 'frieden': 'der', 'friedensvertrag': 'der',
  'waffenstillstand': 'der', 'verhandlung': 'die', 'gespräch': 'das', 'dialog': 'der',
  'abkommen': 'das', 'vertrag': 'der', 'pakt': 'der', 'bündnis': 'das',
  'allianz': 'die', 'koalition': 'die', 'konföderation': 'die', 'föderation': 'die',
  'bund': 'der', 'union': 'die', 'gemeinschaft': 'die', 'nato': 'die',
  'uno': 'die', 'eu': 'die', 'europarat': 'der', 'g7': 'die',
  'g20': 'die', 'brd': 'die', 'drd': 'die', 'ns': 'das',

  // Law (B2)
  'gesetz': 'das', 'recht': 'das', 'verordnung': 'die', 'erlass': 'der',
  'verfügung': 'die', 'bescheid': 'der', 'anordnung': 'die', 'verfügung': 'die',
  'paragraph': 'der', 'artikel': 'der', 'abschnitt': 'der', 'bestimmung': 'die',
  'vorschrift': 'die', 'regel': 'die', 'norm': 'die', 'standard': 'der',
  'richtlinie': 'die', 'weisung': 'die', 'anweisung': 'die', 'instruktion': 'die',
  'justiz': 'die', 'gericht': 'das', 'gerichtshof': 'der', 'verfassungsgericht': 'das',
  'oberlandesgericht': 'das', 'landgericht': 'das', 'amtsgericht': 'das',
  'arbeitsgericht': 'das', 'sozialgericht': 'das', 'finanzgericht': 'das',
  'verwaltungsgericht': 'das', 'patentgericht': 'das', 'oberstes gericht': 'das',
  'richter': 'der', 'richterin': 'die', 'vorsitzende': 'der', 'vorsitzender': 'der',
  'anwalt': 'der', 'anwältin': 'die', 'rechtsanwalt': 'der', 'rechtsanwältin': 'die',
  'staatsanwalt': 'der', 'staatsanwältin': 'die', 'verteidiger': 'der',
  'verteidigerin': 'die', 'kläger': 'der', 'klägerin': 'die', 'beklagte': 'der',
  'beklagter': 'der', 'angeklagte': 'der', 'angeklagter': 'der', 'zeuge': 'der',
  'zeugin': 'die', 'sachverständiger': 'der', 'gutachter': 'der', 'gutachterin': 'die',
  'prozess': 'der', 'verfahren': 'das', 'prozess': 'der', 'verhandlung': 'die',
  'sitzung': 'die', 'termin': 'der', 'verhandlungstermin': 'der', 'hauptverhandlung': 'die',
  'beweisaufnahme': 'die', 'beweis': 'der', 'beweismittel': 'das', 'zeuge': 'der',
  'gutachten': 'das', 'urteil': 'das', 'spruch': 'der', 'beschluss': 'der',
  'entscheidung': 'die', 'bescheid': 'der', 'verfügung': 'die', 'verordnung': 'die',
  'strafe': 'die', 'buße': 'die', 'geldbuße': 'die', 'geldstrafe': 'die',
  'freiheitsstrafe': 'die', 'haftstrafe': 'die', 'lebenslange freiheitsstrafe': 'die',
  'todesstrafe': 'die', 'bewährung': 'die', 'bewährungsstrafe': 'die', 'strafrest': 'der',
  'begnadigung': 'die', 'amnestie': 'die', 'rehabilitation': 'die', 'wiedergutmachung': 'die',
  'schadensersatz': 'der', 'schmerzensgeld': 'das', 'rückerstattung': 'die',
  'verjährung': 'die', 'verjährungsfrist': 'die', 'frist': 'die', 'termin': 'der',
  'klage': 'die', 'klageschrift': 'die', 'einspruch': 'der', 'widerspruch': 'der',
  'berufung': 'die', 'revision': 'die', 'beschwerde': 'die', 'antrag': 'der',
  'anfechtung': 'die', 'vollstreckung': 'die', 'pfändung': 'die', 'zwangsvollstreckung': 'die',
  'konkurs': 'der', 'insolvenz': 'die', 'pleite': 'die', 'zahlungsunfähigkeit': 'die',
  'überschuldung': 'die', 'scheitern': 'das', 'vergleich': 'der', 'sanierung': 'die',
  'abwicklung': 'die', 'liquidation': 'die', 'auflösung': 'die', 'stilllegung': 'die',

  // Economics & finance (B2)
  'wirtschaft': 'die', 'volkswirtschaft': 'die', 'betriebswirtschaft': 'die',
  'marktwirtschaft': 'die', 'sozialwirtschaft': 'die', 'planwirtschaft': 'die',
  'globalisierung': 'die', 'digitalisierung': 'die', 'automatisierung': 'die',
  'industrialisierung': 'die', 'privatisierung': 'die', 'liberalisierung': 'die',
  'deregulierung': 'die', 'regulierung': 'die', 'subvention': 'die', 'subventionierung': 'die',
  'steuer': 'die', 'steuerlast': 'die', 'steuererklärung': 'die', 'finanzamt': 'das',
  'einkommensteuer': 'die', 'körperschaftssteuer': 'die', 'umsatzsteuer': 'die',
  'mehrwertsteuer': 'die', 'grundsteuer': 'die', 'gewerbesteuer': 'die',
  'erbschaftssteuer': 'die', 'schenkungssteuer': 'die', 'kapitalertragssteuer': 'die',
  'lohnsteuer': 'die', 'kirchensteuer': 'die', 'solidaritätszuschlag': 'der',
  'bilanz': 'die', 'jahresabschluss': 'der', 'quartalsbericht': 'der', 'monatsbericht': 'der',
  'wochenbericht': 'der', 'tagesbericht': 'der', 'geschäftsbericht': 'der', 'lagebericht': 'der',
  'umsatz': 'der', 'ertrag': 'der', 'erlös': 'der', 'einnahme': 'die',
  'ausgabe': 'die', 'kosten': 'die', 'aufwand': 'der', 'investition': 'die',
  'gewinn': 'der', 'verlust': 'der', 'profit': 'der', 'defizit': 'das',
  'rendite': 'die', 'ertrag': 'der', 'dividende': 'die', 'ausschüttung': 'die',
  'aktie': 'die', 'anteil': 'der', 'wertpapier': 'das', 'anleihe': 'die',
  'obligation': 'die', 'schuldverschreibung': 'die', 'aktienindex': 'der', 'dax': 'der',
  'dow': 'der', 'nasdaq': 'der', 's&p': 'der', 'nikkei': 'der',
  'kredit': 'der', 'darlehen': 'das', 'hypothek': 'die', 'grundschuld': 'die',
  'zins': 'der', 'zinssatz': 'der', 'zinseszins': 'der', 'tilgung': 'die',
  'rate': 'die', 'tilgungsrate': 'die', 'monatsrate': 'die', 'annuität': 'die',
  'inflation': 'die', 'deflation': 'die', 'stagnation': 'die', 'rezession': 'die',
  'depression': 'die', 'konjunktur': 'die', 'zyklus': 'der', 'aufschwung': 'der',
  'abschwung': 'der', 'boom': 'der', 'crash': 'der', 'krise': 'die',
  'rezession': 'die', 'wachstum': 'das', 'bruttoinlandsprodukt': 'das', 'inlandsprodukt': 'das',
  'bruttonationaleinkommen': 'das', 'volkseinkommen': 'das', 'arbeitseinkommen': 'das',
  'kapitaleinkommen': 'das', 'vermögenseinkommen': 'das', 'miet': 'die', 'pacht': 'die',
  'erbpacht': 'die', 'grundstück': 'das', 'immobilie': 'die', 'eigentum': 'das',
  'besitz': 'der', 'vermögen': 'das', 'kapital': 'das', 'anlage': 'die',
  'anlageform': 'die', 'investitionsform': 'die', 'sparbuch': 'das', 'sparbuch': 'das',
  'girokonto': 'das', 'sparkonto': 'das', 'festgeldkonto': 'das', 'tagesgeldkonto': 'das',
  'depot': 'das', 'brokerage': 'das', 'broker': 'der', 'finanzberater': 'der',
  'bankberater': 'der', 'bankkaufmann': 'der', 'bankkauffrau': 'die',
  'sparkassenkaufmann': 'der', 'sparkassenkauffrau': 'die', 'versicherungsmakler': 'der',
  'makler': 'der', 'maklerin': 'die', 'vermittler': 'der', 'vermittlerin': 'die',

  // Science & research (B2)
  'wissenschaft': 'die', 'forschung': 'die', 'forschung': 'die', 'studie': 'die',
  'untersuchung': 'die', 'analyse': 'die', 'erhebung': 'die', 'umfrage': 'die',
  'erhebung': 'die', 'studie': 'die', 'versuch': 'der', 'experiment': 'das',
  'test': 'der', 'prüfung': 'die', 'kontrolle': 'die', 'überprüfung': 'die',
  'begutachtung': 'die', 'bewertung': 'die', 'evaluation': 'die', 'auswertung': 'die',
  'statistik': 'die', 'statistische analyse': 'die', 'korrelation': 'die',
  'kausalität': 'die', 'hypothese': 'die', 'theorie': 'die', 'these': 'die',
  'antithese': 'die', 'synthese': 'die', 'axiom': 'das', 'postulat': 'das',
  'theorem': 'das', 'beweis': 'der', 'demonstration': 'die', 'veranschaulichung': 'die',
  'paradigma': 'das', 'modell': 'das', 'konzept': 'das', 'ansatz': 'der',
  'methode': 'die', 'verfahren': 'das', 'technik': 'die', 'praxis': 'die',
  'anwendung': 'die', 'umsetzung': 'die', 'implementierung': 'die', 'einführung': 'die',
  'publikation': 'die', 'veröffentlichung': 'die', 'artikel': 'der', 'aufsatz': 'der',
  'abhandlung': 'die', 'dissertation': 'die', 'doktorarbeit': 'die', 'habilitation': 'die',
  'masterarbeit': 'die', 'bachelorarbeit': 'die', 'magisterarbeit': 'die',
  'diplomarbeit': 'die', 'studienarbeit': 'die', 'seminararbeit': 'die',
  'hausarbeit': 'die', 'referat': 'das', 'vortrag': 'der', 'präsentation': 'die',
  'vorlesung': 'die', 'seminar': 'das', 'übung': 'die', 'kurs': 'der',
  'vorlesungsverzeichnis': 'das', 'skript': 'das', 'lehrbuch': 'das', 'manual': 'das',
  'handbuch': 'das', 'fachbuch': 'das', 'sachbuch': 'das', 'ratgeber': 'der',
  'enzyklopädie': 'die', 'lexikon': 'das', 'wörterbuch': 'das', 'glossar': 'das',
  'register': 'das', 'index': 'der', 'katalog': 'der', 'bibliografie': 'die',
  'literaturverzeichnis': 'das', 'quellenverzeichnis': 'das', 'anhang': 'der',
  'fußnote': 'die', 'zitat': 'das', 'beleg': 'der', 'quelle': 'die',
  'literatur': 'die', 'fachliteratur': 'die', 'primärliteratur': 'die',
  'sekundärliteratur': 'die', 'tertiärliteratur': 'die',

  // Technology (B2)
  'technologie': 'die', 'technik': 'die', 'verfahren': 'das', 'methode': 'die',
  'prozess': 'der', 'system': 'das', 'plattform': 'die', 'infrastruktur': 'die',
  'architektur': 'die', 'design': 'das', 'konzept': 'das', 'lösung': 'die',
  'algorithmus': 'der', 'programm': 'das', 'software': 'die', 'anwendung': 'die',
  'applikation': 'die', 'app': 'die', 'webseite': 'die', 'website': 'die',
  'homepage': 'die', 'portal': 'das', 'plattform': 'die', 'forum': 'das',
  'blog': 'der', 'wiki': 'das', 'soziales netzwerk': 'das', 'social media': 'die',
  'datenbank': 'die', 'speicher': 'der', 'server': 'der', 'cloud': 'die',
  'sicherheit': 'die', 'verschlüsselung': 'die', 'passwort': 'das', 'kennwort': 'das',
  'authentifizierung': 'die', 'autorisierung': 'die', 'berechtigung': 'die',
  'zugriff': 'der', 'zugang': 'der', 'anmelden': 'das', 'abmelden': 'das',
  'protokoll': 'das', 'protokollierung': 'die', 'überwachung': 'die', 'monitoring': 'das',
  'warnung': 'die', 'alarm': 'der', 'benachrichtigung': 'die', 'meldung': 'die',
  'fehler': 'der', 'problem': 'das', 'störung': 'die', 'defekt': 'der',
  'ausfall': 'der', 'absturz': 'der', 'hänger': 'der', 'einfrieren': 'das',
  'neustart': 'der', 'reset': 'der', 'wiederherstellung': 'die', 'backup': 'das',
  'sicherung': 'die', 'wiederherstellungspunkt': 'der', 'version': 'die',
  'update': 'das', 'aktualisierung': 'die', 'upgrade': 'das', 'patch': 'der',
  'installation': 'die', 'konfiguration': 'die', 'einrichtung': 'die', 'setup': 'das',
  'wartung': 'die', 'pflege': 'die', 'reinigung': 'die', 'optimierung': 'die',
  'verbesserung': 'die', 'erweiterung': 'die', 'erhöhung': 'die', 'senkung': 'die',
  'verringerung': 'die', 'reduzierung': 'die', 'minimierung': 'die', 'maximierung': 'die',

  // Environment (B2)
  'umwelt': 'die', 'natur': 'die', 'ökologie': 'die', 'ökosystem': 'das',
  'biotop': 'das', 'habitat': 'das', 'biologie': 'die', 'botanik': 'die',
  'zoologie': 'die', 'art': 'die', 'spezies': 'die', 'rasse': 'die',
  'population': 'die', 'artbestand': 'der', 'vielfalt': 'die', 'diversität': 'die',
  'biodiversität': 'die', 'artenvielfalt': 'die', 'artensterben': 'das',
  'ausrottung': 'die', 'aussterben': 'das', 'gefährdung': 'die', 'schutz': 'der',
  'naturschutz': 'der', 'umweltschutz': 'der', 'klimaschutz': 'der', 'tierschutz': 'der',
  'pflanzenschutz': 'der', 'waldschutz': 'der', 'gebietsschutz': 'der',
  'nationalpark': 'der', 'naturpark': 'der', 'naturreservat': 'das', 'schutzgebiet': 'das',
  'biosphärenreservat': 'das', 'weltnaturerbe': 'das', 'unesco': 'die',
  'klima': 'das', 'klimaerwärmung': 'die', 'klimawandel': 'der', 'globale erwärmung': 'die',
  'treibhauseffekt': 'der', 'co2': 'das', 'kohlendioxid': 'das', 'methan': 'das',
  'luftverschmutzung': 'die', 'luft': 'die', 'atmosphäre': 'die', 'luft': 'die',
  'luftqualität': 'die', 'luftreinheit': 'die', 'feinstaub': 'der', 'stickoxid': 'das',
  'schwefeldioxid': 'das', 'ozon': 'das', 'sauerstoff': 'der', 'stickstoff': 'der',
  'wasserstoff': 'der', 'edelgas': 'das', 'wasserverschmutzung': 'die',
  'gewässerverschmutzung': 'die', 'abwässer': 'die', 'abfall': 'der', 'müll': 'der',
  'restmüll': 'der', 'biomüll': 'der', 'papiermüll': 'der', 'glasmüll': 'der',
  'kunststoffmüll': 'der', 'metallmüll': 'der', 'sondermüll': 'der', 'giftmüll': 'der',
  'atommüll': 'der', 'mülltrennung': 'die', 'recycling': 'das', 'wiederverwertung': 'die',
  'reparatur': 'die', 'instandsetzung': 'die', 'aufarbeitung': 'die', 'sanierung': 'die',
  'renaturierung': 'die', 'aufforstung': 'die', 'wiederbewaldung': 'die',
  'entsiegelung': 'die', 'begrünung': 'die', 'bepflanzung': 'die', 'anpflanzung': 'die',

  // ===== C1 — Advanced vocabulary — added 2026-08-01 =====
  // Abstract concepts (C1)
  'wirklichkeit': 'die', 'realität': 'die', 'vorstellung': 'die', 'konzept': 'das',
  'idee': 'die', 'gedanke': 'der', 'überlegung': 'die', 'erwägung': 'die',
  'reflexion': 'die', 'betrachtung': 'die', 'kontemplation': 'die', 'meditation': 'die',
  'besinnung': 'die', 'innenschau': 'die', 'selbstreflexion': 'die', 'introspektion': 'die',
  'erfahrung': 'die', 'erlebnis': 'das', 'begebenheit': 'die', 'geschehnis': 'das',
  'vorfall': 'der', 'ereignis': 'das', 'episode': 'die', 'kapitel': 'das',
  'abschnitt': 'der', 'phase': 'die', 'stadium': 'das', 'etappe': 'die',
  'schritt': 'der', 'station': 'die', 'halt': 'der', 'haltpunkt': 'der',
  'meilenstein': 'der', 'wende': 'die', 'wendepunkt': 'der', 'zäsur': 'die',
  'bruch': 'der', 'knick': 'der', 'einschnitt': 'der', 'schwelle': 'die',
  'übergang': 'der', 'passage': 'die', 'transformation': 'die', 'wandel': 'der',
  'metamorphose': 'die', 'mutation': 'die', 'modifikation': 'die', 'variante': 'die',
  'variation': 'die', 'spielart': 'die', 'ausprägung': 'die', 'erscheinungsform': 'die',
  'manifestation': 'die', 'offenbarung': 'die', 'enthüllung': 'die', 'entdeckung': 'die',
  'erkenntnis': 'die', 'einsicht': 'die', 'durchblick': 'der', 'überblick': 'der',
  'verständnis': 'das', 'begreifen': 'das', 'verstehen': 'das', 'nachvollziehen': 'das',
  'nachempfinden': 'das', 'mitgefühl': 'das', 'einfühlungsvermögen': 'das',
  'empathie': 'die', 'sympathie': 'die', 'antipathie': 'die', 'ablehnung': 'die',
  'zustimmung': 'die', 'einverständnis': 'das', 'einwilligung': 'die', 'genehmigung': 'die',
  'erlaubnis': 'die', 'bewilligung': 'die', 'zustand': 'der', 'verfassung': 'die',
  'lage': 'die', 'situation': 'die', 'umstand': 'der', 'gegebenheit': 'die',
  'bedingung': 'die', 'voraussetzung': 'die', 'vorbedingung': 'die',
  'grundlage': 'die', 'basis': 'die', 'fundament': 'das', 'säule': 'die',
  'stütze': 'die', 'pfeiler': 'der', 'tragwerk': 'das', 'gerüst': 'das',

  // Philosophy & thought (C1)
  'philosophie': 'die', 'erkenntnistheorie': 'die', 'ontologie': 'die',
  'epistemologie': 'die', 'metaphysik': 'die', 'ethik': 'die', 'ästhetik': 'die',
  'logik': 'die', 'rhetorik': 'die', 'dialektik': 'die', 'hermeneutik': 'die',
  'phänomenologie': 'die', 'existenzialismus': 'der', 'existenzphilosophie': 'die',
  'idealismus': 'der', 'materialismus': 'der', 'rationalismus': 'der',
  'empirismus': 'der', 'konstruktivismus': 'der', 'pragmatismus': 'der',
  'nihilismus': 'der', 'skeptizismus': 'der', 'relativismus': 'der',
  'fundamentalismus': 'der', 'dogmatismus': 'der', 'fanatismus': 'der',
  'humanismus': 'der', 'aufklärung': 'die', 'romantik': 'die', 'idealismus': 'der',
  'realismus': 'der', 'naturalismus': 'der', 'symbolismus': 'der', 'expressionismus': 'der',
  'impressionismus': 'der', 'kubismus': 'der', 'surrealismus': 'der', 'futurismus': 'der',
  'expressionismus': 'der', 'dadaismus': 'der', 'minimalismus': 'der', 'postmoderne': 'die',
  'poststrukturalismus': 'der', 'dekonstruktivismus': 'der', 'feminismus': 'der',
  'ökofeminismus': 'der', 'ökologismus': 'der', 'globalisierungskritik': 'die',

  // Politics & ideology (C1)
  'ideologie': 'die', 'weltanschauung': 'die', 'überzeugung': 'die', 'glaube': 'der',
  'doktrin': 'die', 'lehre': 'die', 'grundsatz': 'der', 'prinzip': 'das',
  'maxime': 'die', 'regel': 'die', 'norm': 'die', 'standard': 'der',
  'kodex': 'der', 'kanon': 'der', 'dogma': 'das', 'gebot': 'das',
  'verbot': 'das', 'erlaubnis': 'die', 'ausnahme': 'die', 'regelung': 'die',
  'bestimmung': 'die', 'vorschrift': 'die', 'anordnung': 'die', 'verfügung': 'die',
  'verordnung': 'die', 'erlass': 'der', 'dekret': 'das', 'edikt': 'das',
  'verfassung': 'die', 'grundgesetz': 'das', 'charta': 'die', 'konstitution': 'die',
  'souveränität': 'die', 'autonomie': 'die', 'unabhängigkeit': 'die', 'selbständigkeit': 'die',
  'eigenständigkeit': 'die', 'identität': 'die', 'selbstverständnis': 'das',
  'staatsbürgerschaft': 'die', 'bürgerrecht': 'das', 'menschenrecht': 'das',
  'grundrecht': 'das', 'freiheitsrecht': 'das', 'gleichheitsrecht': 'das',
  'bürgerrecht': 'das', 'wahlrecht': 'das', 'stimmrecht': 'das', 'aktives wahlrecht': 'das',
  'passives wahlrecht': 'das', 'vereinigungsfreiheit': 'die', 'versammlungsfreiheit': 'die',
  'meinungsfreiheit': 'die', 'pressefreiheit': 'die', 'religionsfreiheit': 'die',
  'gewissensfreiheit': 'die', 'forschung': 'die', 'kunstfreiheit': 'die',
  'briefgeheimnis': 'das', 'fernmeldegeheimnis': 'das', 'unverletzlichkeit': 'die',
  'asylrecht': 'das', 'bleiberecht': 'das', 'aufenthaltsrecht': 'das',

  // Literature (C1)
  'literatur': 'die', 'schriftstellerei': 'die', 'dichtung': 'die', 'poesie': 'die',
  'prosa': 'die', 'epik': 'die', 'lyrik': 'die', 'dramatik': 'die',
  'epos': 'das', 'erzählung': 'die', 'erzählprosa': 'die', 'narrativ': 'das',
  'novelle': 'die', 'roman': 'der', 'kurzgeschichte': 'die', 'feuilleton': 'das',
  'essay': 'der', 'glosse': 'die', 'feuilleton': 'das', 'rezension': 'die',
  'kritik': 'die', 'literaturkritik': 'die', 'werk': 'das', 'œuvre': 'das',
  'gesamtausgabe': 'die', 'auswahl': 'die', 'anthologie': 'die', 'sammelband': 'der',
  'textsammlung': 'die', 'text': 'der', 'originaltext': 'der', 'quellentext': 'der',
  'übersetzung': 'die', 'übertragung': 'die', 'nachdichtung': 'die', 'dolmetschen': 'das',
  'verfasser': 'der', 'verfasserin': 'die', 'autor': 'der', 'autorin': 'die',
  'dichter': 'der', 'dichterin': 'die', 'schriftsteller': 'der', 'schriftstellerin': 'die',
  'novelist': 'der', 'novelistin': 'die', 'erzähler': 'der', 'erzählerin': 'die',
  'lyriker': 'der', 'lyrikerin': 'die', 'dramatiker': 'der', 'dramatikerin': 'die',
  'romancier': 'der', 'essayist': 'der', 'essayistin': 'die', 'publizist': 'der',
  'publizistin': 'die', 'kritiker': 'der', 'kritikerin': 'die', 'rezensent': 'der',
  'rezensentin': 'die', 'übersetzer': 'der', 'übersetzerin': 'die', 'dolmetscher': 'der',
  'dolmetscherin': 'die', 'lektor': 'der', 'lektorin': 'die', 'redakteur': 'der',
  'redakteurin': 'die', 'herausgeber': 'der', 'herausgeberin': 'die',
  'verleger': 'der', 'verlegerin': 'die', 'buchhändler': 'der', 'buchhändlerin': 'die',

  // ===== C2 — Mastery / native-speaker vocabulary — added 2026-08-01 =====
  // Rare & literary (C2)
  'weidmannsheil': 'das', 'grenzdebatte': 'die', 'sprachkritik': 'die',
  'wortschöpfung': 'die', 'neologismus': 'der', 'archaismus': 'der',
  'dialekt': 'der', 'mundart': 'die', 'hochsprache': 'die', 'standardsprache': 'die',
  'umgangssprache': 'die', 'slang': 'der', 'jargon': 'der', 'fachsprache': 'die',
  'terminologie': 'die', 'nomenklatur': 'die', 'onomatopoesie': 'die',
  'onomatopöie': 'die', 'onomatopoetikum': 'das', 'lautmalerei': 'die',
  'alliteration': 'die', 'assonanz': 'die', 'reim': 'der', 'rhythmus': 'der',
  'metrum': 'das', 'versfuß': 'der', 'hexameter': 'der', 'pentameter': 'der',
  'strophe': 'die', 'vers': 'der', 'zeile': 'die', 'reimschema': 'das',
  'kreuzreim': 'der', 'paarreim': 'der', 'umarmender reim': 'der', 'schweifreim': 'der',
  'kehrreim': 'der', 'refrain': 'der', 'leitmotiv': 'das', 'motiv': 'das',
  'thema': 'das', 'sujet': 'das', 'stoff': 'der', 'plot': 'der',
  'handlung': 'die', 'fabel': 'die', 'intrige': 'die', 'knoten': 'der',
  'peripetie': 'die', 'klimax': 'die', 'katastrophe': 'die', 'denouement': 'das',
  'lösung': 'die', 'auflösung': 'die', 'ausgang': 'der', 'schluss': 'der',
  'exposition': 'die', 'einleitung': 'die', 'eröffnung': 'die', 'auftakt': 'der',
  'vorspiel': 'das', 'präludium': 'das', 'ouverture': 'die', 'prolog': 'der',
  'epilog': 'der', 'nachwort': 'das', 'nachspiel': 'das', 'postludium': 'das',
  'intermezzo': 'das', 'intervall': 'das', 'pause': 'die', 'unterbrechung': 'die',
  'zäsur': 'die', 'einschnitt': 'der', 'übergang': 'der', 'transition': 'die',

  // Idiomatic & figurative (C2)
  'redewendung': 'die', 'redensart': 'die', 'sprichwort': 'das', 'gefügeltes wort': 'das',
  'floskel': 'die', 'phrase': 'die', 'klischee': 'das', 'schablon': 'die',
  'formel': 'die', 'formulierung': 'die', 'ausdruck': 'der', 'wendung': 'die',
  'umschreibung': 'die', 'periphrase': 'die', 'metapher': 'die', 'vergleich': 'der',
  'gleichnis': 'das', 'parabel': 'die', 'allegorie': 'die', 'symbol': 'das',
  'sinnbild': 'das', 'embleme': 'das', 'attribut': 'das', 'merkmal': 'das',
  'kennzeichen': 'das', 'charakteristikum': 'das', 'eigenschaft': 'die',
  'eigenart': 'die', 'besonderheit': 'die', 'spezifikum': 'das', 'merkmal': 'das',
  'charakter': 'der', 'charakteristik': 'die', 'profil': 'das', 'persönlichkeit': 'die',
  'identität': 'die', 'individualität': 'die', 'originalität': 'die', 'kreativität': 'die',
  'fantasie': 'die', 'phantasie': 'die', 'vorstellungskraft': 'die', 'einbildungskraft': 'die',
  'imagination': 'die', 'kreativität': 'die', 'schöpferische kraft': 'die',
  'erfindungsgabe': 'die', 'erfindungsgeist': 'der', 'innovationskraft': 'die',
  'innovationsgeist': 'der', 'vision': 'die', 'weitsicht': 'die', 'umsicht': 'die',
  'besonnenheit': 'die', 'gelassenheit': 'die', 'gleichmut': 'der', 'souveränität': 'die',
  'sicherheit': 'die', 'gewandtheit': 'die', 'gefalligkeit': 'die', 'anmut': 'die',
  'würde': 'die', 'gravität': 'die', 'gravitas': 'die', 'autorität': 'die',

  // ===== Important C1/C2 specialized — added 2026-08-01 =====
  // Additional infinitives-as-nouns (B2-C1 verbs)
  'verhandeln': 'das', 'auswählen': 'das', 'vereinbaren': 'das', 'anstreben': 'das',
  'vorhaben': 'das', 'einverstanden': 'das', 'gefallen': 'das', 'missfallen': 'das',
  'vergehen': 'das', 'geschehen': 'das', 'widerfahren': 'das', 'widerstehen': 'das',
  'verzichten': 'das', 'entsagen': 'das', 'entbehren': 'das', 'missbrauchen': 'das',
  'verbrauchen': 'das', 'gebrauchen': 'das', 'benutzen': 'das', 'benützen': 'das',
  'anwenden': 'das', 'verwenden': 'das', 'nutzen': 'das', 'ausnutzen': 'das',
  'ausbeuten': 'das', 'missbrauchen': 'das', 'überbeanspruchen': 'das',
  'beanspruchen': 'das', 'fordern': 'das', 'überfordern': 'das', 'herausfordern': 'das',
  'fördern': 'das', 'übertreffen': 'das', 'übersteigen': 'das', 'übertreffen': 'das',
  'überflügeln': 'das', 'überholen': 'das', 'überrunden': 'das', 'überbieten': 'das',
  'überwiegen': 'das', 'überwiegen': 'das', 'überwiegen': 'das', 'dominieren': 'das',
  'herrschen': 'das', 'regieren': 'das', 'walten': 'das', 'schalten': 'das',
  'wirken': 'das', 'agieren': 'das', 'handeln': 'das', 'tätig sein': 'das',
  'fungieren': 'das', 'dienen': 'das', 'verdienen': 'das', 'verdienen': 'das',

  // More -e root-dependent (B2)
  'hospiz': 'das', 'hort': 'der', 'hort': 'der', 'hort': 'der',
  'hürde': 'die', 'schwelle': 'die', 'barriere': 'die', 'hemmschwelle': 'die',
  'blockade': 'die', 'sperre': 'die', 'riegel': 'der', 'riegel': 'der',
  'schloss': 'das', 'riegel': 'der', 'riegel': 'der', 'riegel': 'der',
  'riegel': 'der', 'riegel': 'der', 'riegel': 'der', 'riegel': 'der',

  // More neuter -e (B2-C1)
  'gemüt': 'das', 'gemach': 'das', 'gemächer': 'das', 'gemach': 'das',
  'gemach': 'das', 'gemach': 'das', 'gemach': 'das', 'gemach': 'das',

  // More languages (C1/C2 add-ons)
  'katalanisch': 'das', 'galicisch': 'das', 'baskisch': 'das',
  'walisisch': 'das', 'gälisch': 'das', 'bretonisch': 'das',
  'korsisch': 'das', 'sardisch': 'das', 'maltesisch': 'das',
  'albanisch': 'das', 'mazedonisch': 'das', 'slowenisch': 'das',
  'tschechisch': 'das', 'slowakisch': 'das', 'lettisch': 'das',
  'litauisch': 'das', 'estnisch': 'das', 'ukrainisch': 'das',
  'weißrussisch': 'das', 'moldauisch': 'das', 'georgisch': 'das',
  'armenisch': 'das', 'aserbaidschanisch': 'das', 'kasachisch': 'das',
  'usbekisch': 'das', 'turkmenisch': 'das', 'kirgisisch': 'das',
  'tadschikisch': 'das', 'paschtu': 'das', 'dari': 'das',
  'farsi': 'das', 'kurdisch': 'das', 'sindhi': 'das',
  'urdu': 'das', 'punjabi': 'das', 'bengalisch': 'das',
  'tamilisch': 'das', 'telugu': 'das', 'malayalam': 'das',
  'kannada': 'das', 'marathi': 'das', 'gujarati': 'das',
  'singhalesisch': 'das', 'burmesisch': 'das', 'khmer': 'das',
  'laotisch': 'das', 'malaiisch': 'das', 'indonesisch': 'das',
  'tagalog': 'das', 'filipino': 'das', 'cebuano': 'das',
  'japanisch': 'das', 'japanisch': 'das', 'japanisch': 'das',
  'suaheli': 'das', 'hausa': 'das', 'amharisch': 'das',
  'somali': 'das', 'igbo': 'das', 'yoruba': 'das',
  'zulu': 'das', 'xhosa': 'das', 'afrikaans': 'das',

  // Numbers (extended — fractions, large numbers)
  'milliarde': 'die', 'billion': 'die', 'billiarde': 'die', 'trillion': 'die',
  'quadrillion': 'die', 'quintillion': 'die', 'sextillion': 'die',
  'septillion': 'die', 'oktillion': 'die', 'nonillion': 'die', 'dezillion': 'die',
  'drittel': 'das', 'viertel': 'das', 'fünftel': 'das', 'sechstel': 'das',
  'siebtel': 'das', 'achtel': 'das', 'neuntel': 'das', 'zehntel': 'das',
  'hundertstel': 'das', 'tausendstel': 'das', 'millionstel': 'das',
  'milliardstel': 'das', 'milliardstel': 'das', 'milliardstel': 'das',
  'paar': 'das', 'dutzend': 'das', 'schock': 'der', 'mandel': 'die',
  'ris': 'das', 'groß': 'das', 'kleines': 'das', 'mittel': 'das',
  'höchstmaß': 'das', 'minimum': 'das', 'maximum': 'das', 'optimum': 'das',
  'penibel': 'der', 'penibler': 'der', 'penible': 'die',

  // More countries (B2/C1)
  'kroatien': 'das', 'kroatien': 'das', 'serbien': 'das', 'bosnien': 'das',
  'mazedonien': 'das', 'albanien': 'das', 'montenegro': 'das', 'kosovo': 'der',
  'moldau': 'die', 'weißrussland': 'das', 'belarus': 'das', 'estland': 'das',
  'lettland': 'das', 'litauen': 'das', 'ukraine': 'die', 'georgien': 'das',
  'armenien': 'das', 'aserbaidschan': 'das', 'kasachstan': 'das',
  'usbekistan': 'das', 'turkmenistan': 'das', 'kirgisistan': 'das',
  'tadschikistan': 'das', 'pakistan': 'das', 'afghanistan': 'das',
  'iran': 'der', 'irak': 'der', 'syrien': 'das', 'jordanien': 'das',
  'libanon': 'der', 'israel': 'das', 'palästina': 'das', 'saudi-arabien': 'das',
  'vereinigte arabische emirate': 'die', 'katar': 'das', 'bahrain': 'das',
  'kuwait': 'das', 'oman': 'der', 'jemen': 'der', 'ägypten': 'das',
  'libyen': 'das', 'tunesien': 'das', 'algerien': 'das', 'marokko': 'das',
  'sudan': 'der', 'südsudan': 'der', 'äthiopien': 'das', 'eritrea': 'das',
  'dschibuti': 'das', 'somalia': 'das', 'kenia': 'das', 'uganda': 'das',
  'tansania': 'das', 'ruanda': 'das', 'burundi': 'das', 'mosambik': 'das',
  'sambia': 'das', 'simbabwe': 'das', 'botswana': 'das', 'namibia': 'das',
  'südafrika': 'das', 'lesotho': 'das', 'eswatini': 'das', 'angola': 'das',
  'demokratische republik kongo': 'die', 'republik kongo': 'die', 'kamerun': 'das',
  'zentralafrikanische republik': 'die', 'togo': 'das', 'ghana': 'das',
  'elfenbeinküste': 'die', 'liberia': 'das', 'sierra leone': 'das',
  'guinea': 'das', 'senegal': 'das', 'gambia': 'das', 'mauretanien': 'das',
  'mali': 'das', 'burkina faso': 'das', 'niger': 'der', 'tschad': 'der',
  'nigeria': 'das', 'benin': 'das', 'madagaskar': 'das', 'komoren': 'die',
  'mauritius': 'das', 'seychellen': 'die', 'kap verde': 'das',
  'brasilien': 'das', 'argentinien': 'das', 'chile': 'das', 'bolivien': 'das',
  'peru': 'das', 'ecuador': 'das', 'kolumbien': 'das', 'venezuela': 'das',
  'guyana': 'das', 'suriname': 'das', 'französisch-guyana': 'das',
  'paraguay': 'das', 'uruguay': 'das', 'mexiko': 'das', 'guatemala': 'das',
  'belize': 'das', 'honduras': 'das', 'salvador': 'das', 'nicaragua': 'das',
  'costa rica': 'das', 'panama': 'das', 'cuba': 'das', 'kuba': 'das',
  'jamaika': 'das', 'haiti': 'das', 'dominikanische republik': 'die',
  'puerto rico': 'das', 'trinidad und tobago': 'das',
  'st. lucia': 'die', 'antigua und barbuda': 'die', 'dominica': 'die',
  'st. vincent und die grenadinen': 'die', 'barbados': 'das',
  'grenada': 'das', 'st. kitts und nevis': 'die',
  'kanada': 'das', 'usa': 'die', 'vereinigte staaten': 'die',
  'mexiko': 'das', 'grönland': 'das',
  'australien': 'das', 'neuseeland': 'das', 'papua-neuguinea': 'das',
  'fidschi': 'die', 'salomonen': 'die', 'vanuatu': 'das', 'samoa': 'das',
  'tonga': 'die', 'tuvalu': 'das', 'kiribati': 'die', 'marshallinseln': 'die',
  'mikronesien': 'das', 'palau': 'das', 'nauru': 'das',
  'nördliche mariannen': 'die', 'cookinseln': 'die', 'niue': 'die',
  'tokelau': 'die', 'westsamoa': 'das', 'amerikanisch-samoa': 'das',
};

// Tier 3: Top frequency (~400 words) — placeholder, add as needed
const TOP_FREQ = {
  // Will add more entries as we discover gaps
};

// ===== TIER 4: Compound decomposition =====
const FUGEN_ELEMENTS = ['es', 'en', 'er', 's', 'e', 'n'];

function decomposeCompound(word, depth = 0) {
  // Guard against infinite recursion
  if (depth > 5) return null;
  
  // For compound decomposition, we need to find the BOUNDARY between two words.
  // Fugen elements are inserted between Part1 and Part2.
  // Example: Schlafzimmer = Schlaf + Zimmer (no Fugen)
  //          Liebesbrief = Liebe + s + Brief (Fugen = 's')
  //          Jahresende = Jahr + es + Ende (Fugen = 'es')
  
  // Strategy 1: Common German compound Part1 words (most compounds start with these)
  const compoundStarts = [
    'schlaf', 'wohn', 'kinder', 'eltern', 'frauen', 'männer',
    'auto', 'haus', 'garten', 'sport', 'tier', 'blumen', 'blume',
    'bier', 'kaffee', 'schul', 'uni', 'büro', 'küchen',
    'fernseh', 'radio', 'computer', 'handy', 'foto', 'video',
    'geburtstag', 'weihnacht', 'ostern', 'sommer', 'winter',
    'herbst', 'frühling', 'nachmittag', 'morgen', 'abend',
    'jahres', 'tages', 'nachts', 'berufs', 'amts',
    'kirchen', 'stadt', 'kirsch', 'erd',
    'haupt', 'ober', 'unter', 'mittel', 'voll',
    'klein', 'groß', 'rot', 'blau', 'schwarz',
    'lebens', 'arbeits', 'freundschafts',
    'sonn', 'regen', 'wind', 'schnee',
  ];
  
  // Find longest matching prefix
  let bestPart1 = null;
  let bestPart2 = null;
  for (const stem of compoundStarts.sort((a,b) => b.length - a.length)) {
    if (word.startsWith(stem) && word.length > stem.length + 3) {
      bestPart1 = stem;
      bestPart2 = word.slice(stem.length);
      break;
    }
  }
  
  if (bestPart1 && bestPart2) {
    return { part1: bestPart1, part2: bestPart2 };
  }
  
  // Strategy 2: Try with Fugen element (Part1 + Fugen + Part2)
  // e.g., Liebesbrief = Liebe + s + Brief
  for (const fugen of FUGEN_ELEMENTS) {
    for (let splitAt = 4; splitAt < word.length - fugen.length - 2; splitAt++) {
      const before = word.slice(0, splitAt);
      const after = word.slice(splitAt);
      if (after.startsWith(fugen)) {
        const part2 = after.slice(fugen.length);
        if (part2.length >= 3) {
          // Only count if both parts look like valid German roots
          // Heuristic: Part2 must NOT itself be a known Fugen+root (avoid double splitting)
          if (!FUGEN_ELEMENTS.includes(part2.slice(0, 2)) && part2.length >= 3) {
            return { part1: before, part2 };
          }
        }
      }
    }
  }
  
  return null;
}

// ===== TIER 5: Semantic classifier =====
const SEMANTIC_GENDER = {
  // Person male → der
  'mann': 'der', 'herr': 'der', 'junge': 'der', 'bursche': 'der',
  // Person female → die
  'frau': 'die', 'dame': 'die', 'magd': 'die',
  // Person child → das
  'kind': 'das', 'baby': 'das', 'mädchen': 'das',
  // Time period → mostly masc
  'tag': 'der', 'monat': 'der', 'morgen': 'der', 'abend': 'der',
  'montag': 'der', 'dienstag': 'der', 'mittwoch': 'der', 'donnerstag': 'der',
  'freitag': 'der', 'samstag': 'der', 'sonntag': 'der',
  'januar': 'der', 'februar': 'der', 'märz': 'der', 'april': 'der',
  'mai': 'der', 'juni': 'der', 'juli': 'der', 'august': 'der',
  'september': 'der', 'oktober': 'der', 'november': 'der', 'dezember': 'der',
  'frühling': 'der', 'herbst': 'der',
  // Time fem
  'stunde': 'die', 'minute': 'die', 'sekunde': 'die',
  'woche': 'die', 'zeit': 'die', 'nacht': 'die',
  'jahreszeit': 'die',
  // Tool/object masc
  'schlüssel': 'der', 'ball': 'der', 'stuhl': 'der', 'tisch': 'der',
  'computer': 'der', 'laptop': 'der', 'monitor': 'der', 'bildschirm': 'der',
  // Body parts
  'kopf': 'der', 'arm': 'der', 'fuß': 'der', 'finger': 'der',
  'mund': 'der', 'zahn': 'der', 'hals': 'der', 'rücken': 'der',
  'hand': 'die', 'nase': 'die',
  'auge': 'das', 'ohr': 'das', 'bein': 'das', 'herz': 'das',
};

// ===== TIER 6: Suffix rules with priority + score =====
// Per Jasper's Rule Category Indicator (2026-07-31)
const SUFFIX_RULES = [
  // ===== SUPREME: Overrides ALL other rules =====
  { suffix: /chen$|lein$/, gender: 'das', plural: 'nochange', score: 100, note: 'Diminutive (Supreme)',
    exceptions: [] }, // No exceptions — always wins
  
  // ===== SUPREME: Male humans & animals (semantic, handled in Tier 5) =====
  // Will be handled by Tier 5 semantic — male terms with -e/-en endings become der
  
  // ===== STRUCTURAL (FEM) =====
  { suffix: /ung$/, gender: 'die', plural: 'en', score: 100, note: '-ung (Fem)' },
  { suffix: /heit$|keit$/, gender: 'die', plural: 'en', score: 100, note: '-heit/-keit (Fem)' },
  { suffix: /schaft$/, gender: 'die', plural: 'en', score: 100, note: '-schaft (Fem)' },
  { suffix: /ion$|tur$|sur$|ik$/, gender: 'die', plural: 'en', score: 95, note: '-ion/-tur/-sur/-ik (Fem, Latin/Greek)',
    exceptions: ['das Risiko', 'das Virus'] }, // Abitur, Futur included by default
  { suffix: /is$/, gender: 'die', plural: 'en', score: 90, note: '-is (Fem, Latin/Greek)',
    exceptions: ['der Preis', 'der Tennis', 'der Kürbis', 'das Paradies'] }, // -is mostly fem, but sports/paradise vary
  { suffix: /in$/, gender: 'die', plural: 'nen', score: 85, note: '-in (Fem, human)',
    exceptions: ['das Benzin', 'das Insulin', 'das Vitamin', 'das Nikotin', 'das Berlin', 'das München'] },
  { suffix: /fahrt$/, gender: 'die', plural: 'en', score: 80, note: '-fahrt (Fem)' },
  { suffix: /kunst$/, gender: 'die', plural: 'e', score: 80, note: '-kunst (Fem, Umlaut)' },
  { suffix: /ernte$/, gender: 'die', plural: 'n', score: 80, note: '-ernte (Fem)' },
  
  // -e Feminine with many exceptions
  { suffix: /e$/, gender: 'die', plural: 'n', score: 60, note: '-e (Fem, with many exceptions)',
    exceptions: ['der Name', 'der Gedanke', 'der Wille', 'der Buchstabe',
                  'der Funke', 'der Hase', 'der Falke', 'der Affe',
                  'der Knabe', 'der Bube', 'der Schimmel', 'der Quark',
                  'der Pfosten', 'der Pfosten', 'der Schinken',
                  'der Russe', 'der Finne', 'der Grieche', 'der Pole',
                  'der Schwede', 'der Tscheche', 'der Slowake', 'der Sachse',
                  'das Gebäude', 'das Gemälde', 'das Herz', 'der Kollege',
                  'der Kunde', 'der Zeuge', 'der Nachbar', 'der Bauer',
                  'der Bär', 'der Eber', 'der Geier', 'der Habicht',
                  'der Karpfen', 'der Schmetterling',
                  'das Ende', 'das Auge', 'das Erbe', 'das Ergebnis',
                  'das Abenteuer', 'das Interesse', 'das Genie',
                  'das Update', 'das Smartphone', 'das Album',
                  'das Restaurant', 'das Hotel', 'das Paket',
                  'das Etikett', 'das Klima', 'das Komma', 'das Lemma',
                  'das Lexikon', 'das Plakat', 'das Programm', 'das System',
                  'das Thema', 'das Stadion', 'das Vitamin'] },
  
  // ===== STRUCTURAL (MASC) =====
  // Stems be-, ent-, er-, ver- (drops -en) → der
  // Handled by -ent rule below (covers -ent suffix)
  
  { suffix: /ismus$/, gender: 'der', plural: 'nochange', score: 95, note: '-ismus (Masc)',
    exceptions: ['das Virus'] },
  { suffix: /us$/, gender: 'der', plural: 'en', score: 70, note: '-us (Masc)',
    exceptions: ['das Virus', 'das Korpus', 'das Tempus', 'das Genus',
                  'der Konsum', 'der Luxus', 'der Humus'] },
  { suffix: /os$/, gender: 'der', plural: 'en', score: 80, note: '-os (Masc, Greek)',
    exceptions: ['das Chaos', 'das Pathos', 'das Logos', 'das Ethos'] },
  
  { suffix: /ent$|and$/, gender: 'der', plural: 'en', score: 75, note: '-ent/-and (Masc, human)',
    exceptions: ['das Dokument', 'das Instrument', 'das Argument', 'das Element',
                  'das Segment', 'das Patent', 'das Restaurant',
                  'das Band', 'das Land', 'das Pfand', 'das Hemd',
                  'das Kalbsbraten'] },
  { suffix: /ant$/, gender: 'der', plural: 'en', score: 85, note: '-ant (Masc, human)',
    exceptions: ['das Restaurant'] },
  { suffix: /ist$/, gender: 'der', plural: 'en', score: 80, note: '-ist (Masc, human)',
    exceptions: ['das Risiko', 'das Thermostat'] },
  
  // -or varies by type
  { suffix: /or$/, gender: 'der', plural: 'en', score: 65, note: '-or (Masc, professions or abstract)',
    exceptions: ['das Labor', 'das Marmor', 'der Humor', 'der Terror',
                  'der Motor (Motors→Motoren)', 'der Traktor',
                  'der Faktor', 'der Doktor', 'der Professor'] },
  
  { suffix: /ig$/, gender: 'der', plural: 'e', score: 80, note: '-ig (Masc)' },
  
  // ===== STRUCTURAL (NEUT) =====
  // -el, -er, -en for abstract neuter (very weak rule — mostly -en in -el, -er already covered above)
  // Most -el/-er/-en neuter are already known lemmas; trust lookup or compound

  // -el neuter: Mittel, Viertel, Segel, Möbel, Sessel, Insekt (no), Wurzel (fem)
  // Spec rule 16: -el, -er, -en (Abstracts/Inanimates) → das
  // Risk: der Esel, der Apfel, der Kater, der Senffel (rare), der Igel, der Beutel, der Deckel
  // Strategy: low score + targeted exceptions (mostly trap the masc -el words)
  { suffix: /el$/, gender: 'das', plural: '', score: 50, note: '-el abstract neut (weak, with masc exceptions)',
    exceptions: ['der Esel', 'der Apfel', 'der Kater', 'der Igel', 'der Beutel',
                 'der Deckel', 'der Schlüssel', 'der Zügel', 'der Stempel',
                  'der Pöbel', 'der Onkel', 'der Pinsel', 'der Hebel', 'der Kessel',
                  'der Vogel', 'der Mantel', 'der Flügel', 'der Würfel', 'der Spiegel',
                  'der Schnabel', 'der Nebel', 'der Zettel', 'der Schaufel',
                  'die Gabel', 'die Nadel', 'die Tafel'] },

  { suffix: /ar$/, gender: 'der', plural: 'e', score: 70, note: '-ar (Masc, root-dependent)',
    exceptions: ['das Bar', 'das Formular', 'das Lineal', 'das Quadrat',
                  'das Podium', 'das Visier'] }, // -ar root-dependent
  { suffix: /(ier|oir|eur)$/, gender: 'root', plural: 'e', score: 65, note: '-ier/-oir/-eur (root-dependent, French loans)',
    exceptions: ['das Klavier', 'das Atelier', 'das Boudoir', 'das Papier', 'das Visier',
                  'das Revier', 'das Manoir', 'das Interieur',
                  'der Offizier', 'der Bankier', 'der Juwelier',
                  'der Premier', 'der Passagier',
                  'die Manier', 'die Idee', 'die Karriere', 'die Prinzipienlosigkeit'] }, // Masc/Fem/Neut — context-dependent

  // -ier French abstract (Spec rule 7): catch-all suffix for common French abstract nouns
  // Examples: Manier (manner), Idee (idea) — but Idee is -ee, not -ier
  // This rule fires on words ending in -ier that aren't in the more specific exceptions above
  { suffix: /ier$/, gender: 'die', plural: 'en', score: 75, note: '-ier French abstract (Fem, defaults die)',
    exceptions: ['das Klavier', 'das Atelier', 'das Boudoir', 'das Papier', 'das Visier',
                  'das Revier', 'das Manoir',
                  'der Offizier', 'der Bankier', 'der Juwelier',
                  'der Premier', 'der Passagier'] },

  // -eur Human Professions (Spec rule 14): der Friseur, der Ingenieur, der Monteur, der Regisseur
  { suffix: /eur$/, gender: 'der', plural: 'e', score: 80, note: '-eur (Masc, Human Professions)',
    exceptions: ['das Abenteuer', 'das Interieur', 'das Manöver', 'das Souffleur (also Masc)',
                  'das Atelier', 'das Klavier', 'das Papier'] },
  // -eur, -euer Inanimate (Spec rule 15): das Abenteuer, das Interieur, das Manöver
  { suffix: /euer$/, gender: 'das', plural: 'nochange', score: 80, note: '-euer (Neut, Inanimate)',
    exceptions: ['der Steuer (tax/fee)', 'der Feuer (archaic - actually das Feuer)'] },

  
  { suffix: /nis$/, gender: 'das', plural: 'se', score: 95, note: '-nis (Neut)',
    exceptions: ['die Erlaubnis', 'die Kenntnis', 'die Besorgnis', 'die Fülle'] },
  
  { suffix: /um$/, gender: 'das', plural: 'en', score: 85, note: '-um (Neut, Latin)',
    exceptions: ['der Konsum', 'der Luxus', 'der Humus', 'der Reichtum',
                  'der Irrtum', 'der Ruhm', 'der Schaum'] },
  { suffix: /tum$/, gender: 'das', plural: 'er', score: 90, note: '-tum (Neut, abstract)',
    exceptions: ['Reichtum→Reichtümer'] },
  { suffix: /ment$/, gender: 'das', plural: 'e', score: 95, note: '-ment (Neut, Latin)' },
  { suffix: /ma$/, gender: 'das', plural: 's', score: 90, note: '-ma (Neut, Greek)',
    exceptions: ['der Stigma', 'der Zeigefinger'] }, // mostly neut but rare masc
  { suffix: /iv$/, gender: 'das', plural: 'e', score: 90, note: '-iv (Neut, Latin)' },
  
  // ===== PHONETIC RULES (low priority, monosyllabic only) =====
  // -b
  { suffix: /ab$|alb$/, gender: 'das', plural: 'er', score: 75, note: '-ab/-alb (Neut)',
    exceptions: ['der Trab', 'der Stab', 'der Knab', 'der Salbe (Fem)',
                  'der Kalb (older Masc, now neuter standard)'] },
  { suffix: /ieb$/, gender: 'das', plural: 'e', score: 90, note: '-ieb (Neut)' },
  // Native -b Masc (Betrieb, Stab)
  { suffix: /b$/, gender: 'der', plural: 'e', score: 30, note: 'Native -b (Masc, low confidence)',
    exceptions: ['das Dieb', 'das Weib', 'das Stäbchen', 'das Härchen',
                  'das Stäbchen', 'das Grab', 'das Rad', 'das Sieb'] },
  // -f
  { suffix: /of$|uf$|ief$/, gender: 'der', plural: 'e', score: 85, note: '-of/-uf/-ief (Masc)',
    exceptions: ['der Schlaf', 'der Knauf'] }, // Most go to der with Umlaut
  { suffix: /iff$|af$/, gender: 'das', plural: 'e', score: 85, note: '-iff/-af (Neut)' },
  // -d
  { suffix: /und$/, gender: 'der', plural: 'e', score: 80, note: '-und (Masc)',
    exceptions: ['das Mund (archaic - actually der Mund standard)'] },
  { suffix: /ild$|eld$/, gender: 'das', plural: 'er', score: 80, note: '-ild/-eld (Neut)',
    exceptions: ['der Held', 'die Geduld', 'der Wald'] },
  { suffix: /ad$|ind$/, gender: 'der', plural: 'e', score: 60, note: '-ad/-ind (Masc)',
    exceptions: ['die Hand', 'die Wand', 'das Band', 'das Land', 'das Pfand',
                  'das Hemd', 'das Kind', 'das Rind'] },
  { suffix: /and$/, gender: 'der', plural: 'e', score: 55, note: '-and (Masc)',
    exceptions: ['die Hand', 'die Wand', 'das Band', 'das Land', 'das Pfand',
                  'das Hemd', 'das Kalbsbraten'] },
  { suffix: /end$/, gender: 'root', plural: 'e', score: 60, note: '-end (root-dependent)',
    exceptions: ['der Abend', 'der Feind', 'der Freund', 'der Gegend (Fem)',
                  'der Feierabend', 'der Abend', 'der Versand',
                  'das Dutzend', 'das Hundert', 'das Tausend', 'das Elend',
                  'das Jenseits', 'das Diesseits', 'das Wesen (sing)',
                  'das Argument', 'das Dokument', 'das Instrument',
                  'das Sakrament', 'das Testament'] },
  { suffix: /rd$/, gender: 'root', plural: 'e', score: 70, note: '-rd (root-dependent)',
    exceptions: ['der Herd', 'der Fjord', 'der Mord', 'der Orden',
                  'der Schwert (archaic)',
                  'das Pferd', 'das Schwert', 'das Wort', 'das Brot',
                  'das Hemd', 'das Bild', 'das Schild', 'das Geld',
                  'das Feld', 'das Land', 'das Wald (archaic)'] },
  // -g
  { suffix: /ag$|eg$|og$/, gender: 'der', plural: 'e', score: 80, note: '-ag/-eg/-og (Masc, gravity)',
    exceptions: ['der Tag→Tage', 'der Weg→Wege', 'der Berg→Berge',
                  'das Erz', 'das Netz', 'das Holz', 'das Herz'] },
  { suffix: /ug$/, gender: 'der', plural: 'e', score: 80, note: '-ug (Masc, often Umlaut)',
    exceptions: ['der Zug→Züge', 'der Flug→Flüge', 'der Schlug→Schläge'] },
  // -h
  { suffix: /h$/, gender: 'der', plural: 'e', score: 55, note: 'Silent -h (root-dependent, often Masc)',
    exceptions: ['das Reh', 'das Schuh (der Schuh — typo, is der)',
                  'die Kuh', 'die Uhr', 'die Tür',
                  'der Schuh', 'der Kuchen', 'der Rechen', 'der Drescher',
                  'der Besen', 'der Wagen', 'der Garten',
                  'der Stiefel', 'der Mantel', 'der Schlegel',
                  'das Bad', 'das Dach', 'das Fach', 'das Loch',
                  'das Tuch', 'das Buch', 'das Krokodil (Fem)',
                  'das Krokodil', 'das Gebirge'] },
  // -k
  { suffix: /ack$|ock$|uck$/, gender: 'der', plural: 'e', score: 85, note: '-ack/-ock/-uck (Masc, gravity)',
    exceptions: ['das Wrack', 'das Block'] },
  { suffix: /eck$|ück$/, gender: 'das', plural: 'e', score: 80, note: '-eck/-ück (Neut)',
    exceptions: ['der Fleck', 'der Zweck', 'der Steg', 'der Stecken',
                  'der Schnecke', 'der Brücke', 'der Lücke', 'der Entzücken'] },
  // -l
  { suffix: /l$/, gender: 'root', plural: 'e', score: 45, note: 'monosyllabic -l (root-dependent)',
    exceptions: ['der Fall', 'der Ball', 'der Stall', 'der Schall',
                  'der Pfahl', 'der Strahl', 'der Keil',
                  'das Spiel', 'das Ziel', 'das Rad', 'das Beil',
                  'das Seil', 'das Teil', 'das Heil',
                  'die Zahl', 'die Nadel', 'die Wurzel',
                  'der Schlüssel', 'der Stiefel', 'der Mantel',
                  'der Schnabel', 'der Apfel', 'der Kartoffel',
                  'der Ziegel', 'der Spiegel'] },
  { suffix: /ll$/, gender: 'der', plural: 'e', score: 60, note: '-ll (Masc)',
    exceptions: ['das Metall', 'das Brillant', 'das Plateau'] },
  // -m
  { suffix: /aum$|amm$|urm$|elm$/, gender: 'der', plural: 'e', score: 85, note: '-aum/-amm/-urm/-elm (Masc, often Umlaut)',
    exceptions: ['der Helm', 'der Film', 'der Sturm'] },
  { suffix: /orm$/, gender: 'die', plural: 'en', score: 75, note: '-orm (Fem, loanwords)' },
  // -pf
  { suffix: /opf$|umpf$|ampf$/, gender: 'der', plural: 'e', score: 90, note: '-opf/-umpf/-ampf (Masc, gravity)' },
  // -r
  { suffix: /wur$|lur$/, gender: 'der', plural: 'e', score: 80, note: '-wur/-lur (Masc)' },
  { suffix: /pur$|nur$/, gender: 'die', plural: 'en', score: 75, note: '-pur/-nur (Fem)' },
  { suffix: /er$/, gender: 'der', plural: 'nochange', score: 55, note: '-er (Masc, with many neuter exceptions)',
    exceptions: ['das Wasser', 'das Feuer', 'das Wetter', 'das Zimmer', 'das Fenster', 'das Lager', 'das Kloster', 'das Bild', 'das Schild', 'das Feld', 'das Land', 'das Alter', 'das Messer', 'das Sieb', 'das Hemd', 'das Brett', 'das Rad', 'das Kleid', 'das Geld', 'das Brot', 'das Bad', 'das Buch', 'das Glied', 'das Ei'] },
{ suffix: /r$/, gender: 'root', plural: 'varies', score: 40, note: 'monosyllabic -r (root-dependent)',
    exceptions: ['der Tag', 'der Berg', 'der Weg', 'der Zug', 'der Schuh',
                  'der Stuhl', 'der Tisch', 'der Fisch', 'der Schrank',
                  'der Schlag', 'der Schlag', 'der Wunsch',
                  'das Jahr', 'das Tor', 'das Haar', 'das Tal',
                  'das Bier', 'das Tier', 'das Meer', 'das Feuer',
                  'das Wasser', 'das Zimmer', 'das Fenster',
                  'die Tür', 'die Uhr', 'die Spur', 'die Nahrung'] },
  // -s
  { suffix: /eis$|uss$|rs$|ls$/, gender: 'der', plural: 'e', score: 80, note: '-eis/-uss/-rs/-ls (Masc, often Umlaut)',
    exceptions: ['das Eis', 'das Nuss (Fem: die Nuss)', 'der Kürbis'] },
  { suffix: /ass$|oss$/, gender: 'root', plural: 'er', score: 70, note: '-ass/-oss (root-dependent)',
    exceptions: ['der Pass→Pässe', 'der Gips',
                  'das Fass→Fässer', 'das Schloss→Schlösser', 'das Gekröse',
                  'das Wasser'] },
  // -t
  { suffix: /ast$|ost$|ust$/, gender: 'der', plural: 'e', score: 85, note: '-ast/-ost/-ust (Masc, physical)',
    exceptions: ['die List', 'der Lust', 'das Kost'] },
  { suffix: /est$|elt$|ert$/, gender: 'das', plural: 'e', score: 80, note: '-est/-elt/-ert (Neut, physical)',
    exceptions: ['der Wirt', 'der Ort', 'der Wert', 'der Sport', 'der Mast',
                  'der Bart', 'der Gurt', 'der Rock', 'der Stock'] },
  // -z
  { suffix: /atz$|itz$|utz$|z$/, gender: 'der', plural: 'e', score: 75, note: '-atz/-itz/-utz/-z (Masc, often Umlaut)',
    exceptions: ['das Gesetz', 'das Netz', 'das Herz', 'das Holz',
                  'das Kreuz', 'das Bronze',
                  'der Platz', 'der Witz', 'der Blitz', 'der Schatz',
                  'der Tanz', 'der Arzt', 'der Sturz', 'der Satz',
                  'der Schutz', 'der Nutzen'] },
  { suffix: /etz$/, gender: 'das', plural: 'e', score: 90, note: '-etz (Neut)' },
  
  // ===== NEW 2026-08-01: Coverage gap rules =====
  // Language names (regex match, paired with A1/A2 lookup for confidence)
  // Catches words ending in -isch, -sch, or specific known roots
  { suffix: /isch$/, gender: 'das', plural: 'en', score: 85, note: 'Language-name ending (-isch) = das',
    exceptions: ['der Fisch', 'der Tisch', 'der Wunsch', 'der Hirsch', 'der Risch',
                  'der Strauch (no -isch)', 'der Kirsch', 'der Pfirsich'] },
  // Infinitive-as-noun: all -en verbs that are also used as nouns default to das
  // Excise common -en words that are NOT infinitives (masc by gender specific rule)
  { suffix: /en$/, gender: 'das', plural: 'nochange', score: 70, note: '-en infinitive-as-noun (mostly das)',
    exceptions: ['der Ofen', 'der Boden', 'der Garten', 'der Wagen', 'der Schaden',
                  'der Braten', 'der Hafen', 'der Haken', 'der Katen', 'der Aal',
                  'der Apfel', 'der Bissen', 'der Faden', 'der Graben', 'der Haufen',
                  'der Knochen', 'der Knoten', 'der Lappen', 'der Lärmen', 'der Lehm',
                  'der Magen', 'der Matrose', 'der Nagel', 'der Nudel', 'der Regen',
                  'der Schmetterling', 'der Sommer', 'der Splitter', 'der Stollen',
                  'der Streifen', 'der Tropfen', 'der Wappen', 'der Zeichen',
                  'der Algen', 'der Bergen', 'der Engeln', 'der Linsen', 'der Lippen',
                  'der Oben', 'der Stern', 'der Masten', 'der Latten', 'der Schatten',
                  'der Samen', 'der Funken', 'der Haken', 'der Felsen',
                  'der Lappen', 'der Rücken', 'der Daumen', 'der Ballen', 'der Poll(en)',
                  'die Kette', 'die Welten', 'die Million', 'die Milliarde',
                  'die Brücke', 'die Strecke', 'die Fläche', 'die Stärke', 'die Größe',
                  'die Liebe', 'die Treue', 'die Reihe', 'die Höhe', 'die Nähe',
                  'die Wärme', 'die Kälte', 'die Tiefe', 'die Seele', 'die Sonne',
                  'die Sprache', 'die Klasse', 'die Schule', 'die Straße', 'die Stelle',
                  'die Stunde', 'die Minute', 'die Sekunde', 'die Seite', 'die Freude',
                  'die Welt', 'die Kraft', 'die Nacht', 'die Hand', 'die Wand',
                  'die Zeit', 'die Luft', 'die Erde', 'die Regierung', 'die Bildung',
                  'die Zeitung', 'die Gesellschaft', 'die Möglichkeit', 'die Schwierigkeit',
                  'die Gelegenheit', 'die Universität', 'die Gesellschaft',
                  'die Erfahrung', 'die Bedeutung', 'die Beziehung', 'die Entscheidung',
                  'die Erklärung', 'die Erwartung', 'die Erzählung', 'die Forderung',
                  'die Führung', 'die Hoffnung', 'die Lösung', 'die Sitzung', 'die Übung',
                  'die Veränderung', 'die Verbindung', 'die Vereinigung', 'die Warnung',
                  'die Zeitung', 'die Zustimmung', 'die Bedingung', 'die Einstellung',
                  'die Erinnerung', 'die Ermäßigung', 'die Ernennung', 'die Eröffnung',
                  'die Errichtung', 'die Erscheinung', 'die Erschöpfung', 'die Erweiterung',
                  'die Familie', 'die Farbe', 'die Figur', 'die Fläche', 'die Form',
                  'die Frage', 'die Freiheit', 'die Freude', 'die Frieden', 'die Freundin',
                  'die Führung', 'die Funktion', 'die Garantie', 'die Gegend', 'die Gelegenheit',
                  'die Gemeinschaft', 'die Geschichte', 'die Gesellschaft', 'die Geste',
                  'die Gewalt', 'die Gesundheit', 'die Gleichung', 'die Gnade', 'die Grenze',
                  'die Größe', 'die Grundlage', 'die Gruppe', 'die Hand', 'die Handlung',
                  'die Heimat', 'die Heirat', 'die Hilfe', 'die Hochzeit', 'die Höhle',
                  'die Höhe', 'die Hose', 'die Hütte', 'die Idee', 'die Industrie',
                  'die Insel', 'die Jugend', 'die Karriere', 'die Karte', 'die Kirche',
                  'die Klasse', 'die Kleidung', 'die Klage', 'die Knie', 'die Kohle',
                  'die Kompetenz', 'die Konferenz', 'die Kontrolle', 'die Konzentration',
                  'die Kraft', 'die Krankheit', 'die Krise', 'die Kultur', 'die Kunde',
                  'die Kälte', 'die Küche', 'die Lage', 'die Landschaft', 'die Langeweile',
                  'die Laterne', 'die Laune', 'die Leitung', 'die Linie', 'die Liste',
                  'die Lüge', 'die Macht', 'die Masse', 'die Medizin', 'die Mehrheit',
                  'die Meldung', 'die Methode', 'die Meute', 'die Milch', 'die Minderheit',
                  'die Minute', 'die Mische', 'die Mitte', 'die Mode', 'die Mühe',
                  'die Mündung', 'die Nähe', 'die Nation', 'die Natur', 'die Nahrung',
                  'die Notwendigkeit', 'die Nummer', 'die Nutzung', 'die Oberfläche', 'die Öffnung',
                  'die Ordnung', 'die Organisation', 'die Panne', 'die Partnerin', 'die Party',
                  'die Pause', 'die Person', 'die Pflanze', 'die Phase', 'die Pflicht',
                  'die Plane', 'die Politik', 'die Position', 'die Post', 'die Praxis',
                  'die Presse', 'die Priorität', 'die Probe', 'die Produktion', 'die Prüfung',
                  'die Quelle', 'die Quote', 'die Reaktion', 'die Rede', 'die Reduktion',
                  'die Regel', 'die Regierung', 'die Region', 'die Reihenfolge', 'die Reise',
                  'die Religion', 'die Revolution', 'die Richtung', 'die Rolle', 'die Routine',
                  'die Ruhe', 'die Runde', 'die Sage', 'die Sache', 'die Sandale', 'die Satire',
                  'die Schande', 'die Scheibe', 'die Schicht', 'die Schiene', 'die Schlange',
                  'die Schuld', 'die Schule', 'die Seele', 'die Sekunde', 'die Sendung',
                  'die Sicherheit', 'die Sicht', 'die Situation', 'die Sorge', 'die Spannung',
                  'die Spur', 'die Sicht', 'die Sprache', 'die Spur', 'die Stadt',
                  'die Stelle', 'die Steuer', 'die Stimmung', 'die Stirn', 'die Stufe',
                  'die Stunde', 'die Stärke', 'die Sünde', 'die Szene', 'die Tabelle',
                  'die Tasche', 'die Tasse', 'die Tat', 'die Tatsache', 'die Taube',
                  'die Technik', 'die Teilnahme', 'die Temperatur', 'die Tendenz', 'die Tiefe',
                  'die Tinte', 'die Tour', 'die Tradition', 'die Tragödie', 'die Treppe',
                  'die Treue', 'die Tür', 'die U-Bahn', 'die Übung', 'die Uhr', 'die Umgebung',
                  'die Umwelt', 'die Unabhängigkeit', 'die Universität', 'die Unterhaltung',
                  'die Untersuchung', 'die Ursache', 'die Verantwortung', 'die Verbindung',
                  'die Verfassung', 'die Vergangenheit', 'die Vergleich', 'die Verhandlung',
                  'die Verbindung', 'die Vereinbarung', 'die Verletzung', 'die Vernissage',
                  'die Versammlung', 'die Verschwendung', 'die Verteidigung', 'die Verteilung',
                  'die Vertretung', 'die Verwaltung', 'die Verwendung', 'die Verzweiflung',
                  'die Vielfalt', 'die Viertelstunde', 'die Vision', 'die Voraussetzung',
                  'die Vorschrift', 'die Währung', 'die Waffe', 'die Wahl', 'die Wand',
                  'die Ware', 'die Wärme', 'die Warnung', 'die Wäsche', 'die Wechsel',
                  'die Welt', 'die Werbung', 'die Wette', 'die Wirkung', 'die Woche',
                  'die Wolke', 'die Wunde', 'die Wut', 'die Zahl', 'die Zahlung',
                  'die Zeit', 'die Zeitung', 'die Zensur', 'die Zentrale', 'die Zeremonie',
                  'die Zerstörung', 'die Ziehung', 'die Zitrone', 'die Zone', 'die Zufriedenheit',
                  'die Zugabe', 'die Zusammenarbeit', 'die Zutat', 'die Zuversicht', 'die Zwiebel',
                  'die Zählung', 'das Becken', 'das Bild', 'das Boot', 'das Datum',
                  'das Drama', 'das Ende', 'das Eisen', 'das Fenster', 'das Feuer',
                  'das Geld', 'das Herz', 'das Jahr', 'das Kino', 'das Konzert',
                  'das Lager', 'das Leben', 'das Mittel', 'das Ohr', 'das Pult',
                  'das Schiff', 'das Schwert', 'das Spiel', 'das Symbol', 'das System',
                  'das Wasser', 'das Zeichen', 'das Ziel', 'das Zimmer',
                  // Common -en verbs that are NOT infinitives when used as nouns
                  'der Automaten', 'der Bär Ente', 'der Block', 'der Brief',
                  'der Bruder', 'der Bund', 'der Chor', 'der Christ', 'der Commission',
                  'der Cottbus', 'der D-Zug', 'der Eck', 'der Gletscher',
                  'der Hafer', 'der Hafer', 'der Hahn', 'der Heber', 'der Kater',
                  'der Kocher', 'der Körper', 'der Lappen', 'der Laster', 'der Leiter',
                  'der Leiter', 'der Läufer', 'der Läufer', 'der Läufer',
                  'der Lehrer', 'der Leuchter', 'der Liverpool', 'der Logarithmus',
                  'der Marathon', 'der Meter', 'der Mieder', 'der Miet',
                  'der Müller', 'der Münze', 'der Nachen', 'der Nocken', 'der Noten',
                  'der Ober', 'der Orden', 'der Patent', 'der Pfeiler', 'der Pfosten',
                  'der Pionier', 'der Quarks', 'der Redner', 'der Reiter', 'der Renn',
                  'der Roller', 'der Roller', 'der Rücken', 'der Rücken', 'der Sägen',
                  'der Sänger', 'der Schalter', 'der Schaufel', 'der Schieds',
                  'der Seher', 'der Senkel', 'der Spaten', 'der Spieler', 'der Sprint',
                  'der Streifen', 'der Streiter', 'der Tanker', 'der Traben', 'der Traktor',
                  'der Treiber', 'der Turner', 'der Unter', 'der Verder', 'der Verlust',
                  'der Vetter', 'der Wecker', 'der Weiler', 'der Zahn', 'der Zentner',
                  'der Zettel', 'der Zieher', 'der Zweig', 'der Zylinder'] },
  // Single-letter names (always das) — applied first via length check
  // Cannot use a regex alone in SUFFIX_RULES since already lowercased; use special handling
  // (handled below in predict function)

  // ===== LOANWORD SUFFIXES =====
  { suffix: /c$|j$|w$|x$|y$/, gender: 'root', plural: 's', score: 50, note: 'Loanwords ending in -c/-j/-w/-x/-y (root-dependent)',
    exceptions: ['der Ketchup', 'der Verschluss (Masc)',
                  'das Papier', 'das Café (das or der in some dialects)',
                  'die Frau', 'die Couch'] },
  { suffix: /p$/, gender: 'root', plural: 's', score: 40, note: 'Loanwords ending in -p (root-dependent)',
    exceptions: ['das Restaurant', 'das Prinzip', 'das Klapp',
                  'der Chip', 'der Laptop', 'der Strip'] },
];

// ===== MAIN PREDICTION FUNCTION =====
function predict(de, depth = 0) {
  const word = de.toLowerCase().trim();
  
  // Guard against deep recursion
  if (depth > 3) {
    return { gender: 'unknown', confidence: 0, tier: 'too-deep' };
  }

  // Single-letter names (always das): "das A", "das B" etc.
  if (word.length === 1 && /^[a-zäöü]$/.test(word)) {
    return { gender: 'das', plural: 's', confidence: 1.0, tier: 'Letter' };
  }

  // Tier 1: Sheet lookup (100% confidence)
  if (SHEET_LOOKUP[word]) {
    return { gender: SHEET_LOOKUP[word].g, plural: SHEET_LOOKUP[word].p,
             confidence: 1.0, tier: 'Sheet' };
  }
  
  // Tier 2: A1/A2 lookup (100% confidence)
  if (A1_A2[word]) {
    return { gender: A1_A2[word], confidence: 1.0, tier: 'A1/A2' };
  }
  
  // Tier 3: Top frequency lookup (100% confidence)
  if (TOP_FREQ[word]) {
    return { gender: TOP_FREQ[word], confidence: 1.0, tier: 'TopFreq' };
  }
  
  // Tier 4: Compound decomposition
  const compound = decomposeCompound(word, 0);
  if (compound) {
    // Word B (last element) determines gender
    const part2Result = predict(compound.part2, depth + 1);
    if (part2Result.confidence >= 0.7) {
      return { gender: part2Result.gender, plural: part2Result.plural,
               confidence: part2Result.confidence * 0.9, tier: 'Compound(' + compound.part2 + ')' };
    }
  }
  
  // Tier 5: Semantic classifier
  // (Check if word contains a known semantic root)
  for (const [root, gender] of Object.entries(SEMANTIC_GENDER)) {
    if (word.includes(root) && word !== root) {
      // Found semantic hint
      // Note: this is risky for non-compounds; only use with confidence
    }
  }
  
  // Tier 6: Suffix rules (collect ALL matching, take highest score)
  let matches = [];
  let exceptionMatch = null;
  for (const rule of SUFFIX_RULES) {
    if (rule.suffix.test(word)) {
      // Check exceptions
      const ex = (rule.exceptions || []).find(ex =>
        word === ex.split('→')[0].toLowerCase().replace('das ', '').replace('der ', '').replace('die ', '')
      );
      if (ex) {
        // Exception hit! This is a definitive override — capture highest score among exception matches
        const exGender = ex.startsWith('das ') ? 'das' : ex.startsWith('der ') ? 'der' : 'die';
        const exPlural = rule.plural;
        const exScore = rule.score + 50; // Boost exceptions above base rule score
        if (!exceptionMatch || exScore > exceptionMatch.finalScore) {
          exceptionMatch = { ...rule, gender: exGender, plural: exPlural, finalScore: exScore, note: rule.note + ' [exception]' };
        }
        // Don't add the base rule — the exception wins
      } else {
        matches.push({ ...rule, finalScore: rule.score });
      }
    }
  }

  // Exception match takes priority over generic suffix matches
  if (exceptionMatch) {
    return { gender: exceptionMatch.gender, plural: exceptionMatch.plural,
             confidence: Math.min(1.0, exceptionMatch.finalScore / 100), tier: 'Suffix',
             note: exceptionMatch.note };
  }

  if (matches.length > 0) {
    matches.sort((a, b) => b.finalScore - a.finalScore);
    const top = matches[0];
    if (top.gender === 'root') {
      // Root-dependent — don't return
      return { gender: 'unknown', confidence: 0, tier: 'root-dep' };
    }
    return { gender: top.gender, plural: top.plural,
             confidence: top.score / 100, tier: 'Suffix', note: top.note };
  }
  
  // No rule fired — return low confidence
  return { gender: 'unknown', confidence: 0, tier: 'none' };
}

module.exports = { predict, decomposeCompound, A1_A2, SHEET_LOOKUP, TOP_FREQ };