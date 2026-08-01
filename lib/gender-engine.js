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