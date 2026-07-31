let SUFFIX_RULES;
SUFFIX_RULES = [
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
  
  { suffix: /ar$/, gender: 'der', plural: 'e', score: 70, note: '-ar (Masc, root-dependent)',
    exceptions: ['das Bar', 'das Formular', 'das Lineal', 'das Quadrat',
                  'das Podium', 'das Visier'] }, // -ar root-dependent
  { suffix: /ier$/, gender: 'root', plural: 'e', score: 65, note: '-ier (root-dependent)',
    exceptions: ['das Klavier', 'das Manier', 'das Boudoir', 'das Atelier',
                  'das Visier', 'das Revier',
                  'der Offizier', 'der Bankier', 'der Juwelier',
                  'der Premier', 'der Passagier'] }, // Masc/Fem/Neut — context-dependent
  
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
module.exports = { SUFFIX_RULES };