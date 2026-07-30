// Curated "Wort des Tages" — 30 beautiful, characterful German words
// Each entry: word + IPA pronunciation hint + grammatical hint + meaning + example sentence
// Picked for aesthetic, cultural, and "wow I want to use this" qualities
// Day-of-year mod 30 picks which word shows today

export interface WortDesTages {
  word: string;
  pos: string;          // part-of-speech hint (m./f./n. + type)
  pronunciation: string; // IPA or phonetic hint
  meaning: string;
  example: string;
}

export const WORTE_DES_TAGES: WortDesTages[] = [
  {
    word: 'Wanderlust',
    pos: 'f.',
    pronunciation: 'VAHN-der-loost',
    meaning: 'die Sehnsucht nach fernen Orten',
    example: 'Wanderlust treibt Reisende seit Jahrhunderten an, neue Horizonte zu entdecken.',
  },
  {
    word: 'Sehnsucht',
    pos: 'f.',
    pronunciation: 'ZANE-zookt',
    meaning: 'tiefes, sehnsuchtsvolles Verlangen (oft nach etwas Unerreichbarem)',
    example: 'Die Sehnsucht nach seiner Heimat wurde mit jedem Tag stärker.',
  },
  {
    word: 'Fernweh',
    pos: 'n.',
    pronunciation: 'FAIRN-vay',
    meaning: 'das Gefühl, in die Ferne reisen zu wollen',
    example: 'Wenn ich am Fenster sitze und die Weltkarte anschaue, packt mich sofort das Fernweh.',
  },
  {
    word: 'Heimat',
    pos: 'f.',
    pronunciation: 'HAI-maht',
    meaning: 'Ort, an dem man sich zu Hause fühlt; Heimatland oder -stadt',
    example: 'Berlin ist meine Heimat geworden, obwohl ich ursprünglich aus München komme.',
  },
  {
    word: 'Gemütlichkeit',
    pos: 'f.',
    pronunciation: 'geh-MYUT-lich-kite',
    meaning: 'warme, behagliche, freundliche Atmosphäre',
    example: 'Die Gemütlichkeit des kleinen Cafés erinnerte mich an meine Großmutter.',
  },
  {
    word: 'Vergänglichkeit',
    pos: 'f.',
    pronunciation: 'fer-GENG-lich-kite',
    meaning: 'die Tatsache, dass alles Irdische nur vorübergehend ist',
    example: 'Die Vergänglichkeit der Kirschblüte macht sie umso schöner.',
  },
  {
    word: 'Glücksmoment',
    pos: 'm.',
    pronunciation: 'GLUES-mow-ment',
    meaning: 'ein kurzer, aber intensiver Augenblick des Glücks',
    example: 'Der Sonnenstrahl durch das Wolkenloch war ein echter Glücksmoment.',
  },
  {
    word: 'Feierabend',
    pos: 'm.',
    pronunciation: 'FAI-er-AH-bent',
    meaning: 'der Abend nach der Arbeit; auch: Ruhezeit, freie Zeit',
    example: 'Endlich Feierabend! Heute Abend gehe ich noch joggen.',
  },
  {
    word: 'Morgenrot',
    pos: 'n.',
    pronunciation: 'MOR-gen-roht',
    meaning: 'die rötliche Färbung des Himmels bei Sonnenaufgang',
    example: 'Das Morgenrot kündigte einen wunderschönen Tag an.',
  },
  {
    word: 'Abendrot',
    pos: 'n.',
    pronunciation: 'AH-bent-roht',
    meaning: 'die rötliche Färbung des Himmels bei Sonnenuntergang',
    example: 'Bei Sonnenuntergang leuchtete das Meer im goldenen Abendrot.',
  },
  {
    word: 'Zweisamkeit',
    pos: 'f.',
    pronunciation: 'TSVAI-zahm-kite',
    meaning: 'das Beisammensein zu zweit; Intimität',
    example: 'Sie genossen die Zweisamkeit bei einem Glas Wein auf der Terrasse.',
  },
  {
    word: 'Geborgenheit',
    pos: 'f.',
    pronunciation: 'geh-BOR-gen-hite',
    meaning: 'ein Gefühl von Schutz, Sicherheit und Geborgensein',
    example: 'In den Armen seiner Mutter fand er endlich wieder Geborgenheit.',
  },
  {
    word: 'Liebestrank',
    pos: 'm.',
    pronunciation: 'LEE-bes-trank',
    meaning: 'ein Getränk, das Liebe hervorrufen soll (auch übertragen: starkes Gefühl)',
    example: 'Ihr Lächeln wirkte wie ein Liebestrank.',
  },
  {
    word: 'Augenblick',
    pos: 'm.',
    pronunciation: 'OW-gen-blick',
    meaning: 'ein sehr kurzer Zeitraum; ein Moment',
    example: 'Im Augenblick verstehe ich nicht, was du meinst.',
  },
  {
    word: 'Bilderbuch',
    pos: 'n.',
    pronunciation: 'BIL-der-bookh',
    meaning: 'Buch mit vielen Bildern für Kinder; auch: idealtypisch, makellos',
    example: 'Das kleine Dorf war ein Bilderbuch — wie aus dem 18. Jahrhundert.',
  },
  {
    word: 'Sturmfrei',
    pos: 'adj.',
    pronunciation: 'shtoorm-FRAY',
    meaning: 'ohne Aufsicht (besonders: Eltern nicht zu Hause)',
    example: 'Endlich sturmfrei — die Party kann beginnen!',
  },
  {
    word: 'Ohrwurm',
    pos: 'm.',
    pronunciation: 'OHR-voorm',
    meaning: 'ein Lied, das man nicht mehr aus dem Kopf bekommt',
    example: 'Dieser Song ist ein echter Ohrwurm — er geht mir nicht mehr aus dem Kopf.',
  },
  {
    word: 'Glühwein',
    pos: 'm.',
    pronunciation: 'GLUE-vayn',
    meaning: 'heißes Getränk mit Rotwein und Gewürzen, typisch auf Weihnachtsmärkten',
    example: 'Auf dem Weihnachtsmarkt riecht es überall nach Glühwein und gebrannten Mandeln.',
  },
  {
    word: 'Frühlingserwachen',
    pos: 'n.',
    pronunciation: 'FROO-lings-er-VAH-ken',
    meaning: 'das Erwachen der Natur im Frühling',
    example: 'Das Frühlingserwachen im April bringt die ersten Blumen hervor.',
  },
  {
    word: 'Kopfkino',
    pos: 'n.',
    pronunciation: 'KOPF-kee-no',
    meaning: 'gedankliches Visualisieren von Szenarien (wörtlich: Kopfkino = Kopf-Kino)',
    example: 'Bei diesem Song geht sofort mein Kopfkino an.',
  },
  {
    word: 'Lieblingsplatz',
    pos: 'm.',
    pronunciation: 'LEEB-lings-plats',
    meaning: 'der Ort, an dem man sich am wohlsten fühlt',
    example: 'Mein Lieblingsplatz ist die alte Bank unter dem Apfelbaum.',
  },
  {
    word: 'Wohlgefühl',
    pos: 'n.',
    pronunciation: 'VOAL-geh-fool',
    meaning: 'ein angenehmes Gefühl von Wohlbefinden und Zufriedenheit',
    example: 'Die warme Dusche nach einem langen Tag ist ein echtes Wohlgefühl.',
  },
  {
    word: 'Schlafzimmerblick',
    pos: 'm.',
    pronunciation: 'SHLAHF-tsim-mer-blick',
    meaning: 'verschlafener, leicht verträumter Blick beim Aufwachen',
    example: 'Mit seinem Schlafzimmerblick und den zerzausten Haaren sah er bezaubernd aus.',
  },
  {
    word: 'Verwandlung',
    pos: 'f.',
    pronunciation: 'fer-VANT-loong',
    meaning: 'die Umwandlung von einer Form in eine andere',
    example: 'Die Verwandlung der Raupe zum Schmetterling fasziniert mich jedes Mal.',
  },
  {
    word: 'Kraftort',
    pos: 'm.',
    pronunciation: 'KRAFT-ort',
    meaning: 'ein Ort, an dem man neue Energie tankt',
    example: 'Der alte Leuchtturm am Meer ist mein persönlicher Kraftort.',
  },
  {
    word: 'Tageslicht',
    pos: 'n.',
    pronunciation: 'TAH-ges-licht',
    meaning: 'das natürliche Licht am Tag',
    example: 'Endlich wieder Tageslicht! Die dunklen Wintertage haben lange genug gedauert.',
  },
  {
    word: 'Lebenskünstler',
    pos: 'm.',
    pronunciation: 'LAY-bens-koonst-ler',
    meaning: 'jemand, der das Leben mit Leichtigkeit und Freude genießt',
    example: 'Mein Onkel ist ein echter Lebenskünstler — er reist, kocht, lacht, lebt.',
  },
  {
    word: 'Augenweide',
    pos: 'f.',
    pronunciation: 'OW-gen-VAI-deh',
    meaning: 'etwas Schönes zum Anschauen',
    example: 'Die blühenden Wiesen im Mai sind eine wahre Augenweide.',
  },
  {
    word: 'Sternschnuppe',
    pos: 'f.',
    pronunciation: 'shtairn-SHNOOP-eh',
    meaning: 'ein Meteor, der als leuchtender Punkt am Himmel zu sehen ist',
    example: 'Als ich klein war, durfte ich mir beim Anblick einer Sternschnuppe etwas wünschen.',
  },
  {
    word: 'Wundertüte',
    pos: 'f.',
    pronunciation: 'VOON-der-too-teh',
    meaning: 'eine Tüte mit unbekanntem, oft spannendem Inhalt',
    example: 'Mein Adventskalender ist wie eine kleine Wundertüte jeden Tag im Dezember.',
  },
];

// Pick the word for today. Uses day-of-year modulo count so each day shows a different word.
export function getWortDesTages(): WortDesTages {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return WORTE_DES_TAGES[dayOfYear % WORTE_DES_TAGES.length];
}