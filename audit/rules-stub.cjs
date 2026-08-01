// Auto-generated stub for audit/rules-stub.cjs
module.exports = { SUFFIX_RULES: [
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
] };
