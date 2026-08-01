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