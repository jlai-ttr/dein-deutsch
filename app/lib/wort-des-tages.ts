// Curated "Wort des Tages" — 30 beautiful, characterful German words
// Each entry has full grammar info: gender/plural for nouns, conjugation for verbs
// Picked for aesthetic, cultural, and "wow I want to use this" qualities
// Day-of-year mod 30 picks which word shows today

export interface WortDesTages {
  word: string;
  pronunciation: string;       // IPA-style pronunciation
  category: 'noun' | 'verb' | 'adjective' | 'expression';
  meaning: string;             // meaning IN German (primary)
  meaningEn?: string;          // meaning in English (when useful)
  example: string;             // example sentence IN German
  exampleEn?: string;          // translation of example

  // NOUN-specific (when category === 'noun')
  gender?: 'm' | 'f' | 'n';    // genus
  plural?: string;             // Pluralform (e.g. "die Sehnsüchte", "-", "Kopfkinos")
  genitive?: string;           // Genitiv singular for m/n nouns (optional, advanced)

  // VERB-specific (when category === 'verb')
  separable?: boolean;         // trennbares Verb
  prefix?: string;             // separable prefix if any
  auxiliary?: 'haben' | 'sein';
  preterite?: string;          // Präteritum 3rd pers sg
  pastParticiple?: string;     // Partizip II
  conjugation?: { ich: string; du: string; er: string; wir: string; ihr: string; sie: string };

  // ADJECTIVE-specific (when category === 'adjective')
  comparative?: string;
  superlative?: string;
}

export const WORTE_DES_TAGES: WortDesTages[] = [
  {
    word: 'Wanderlust',
    pronunciation: '/ˈvandɐˌlʊst/',
    category: 'noun',
    gender: 'f',
    plural: '(keine Plural)',
    meaning: 'die Sehnsucht nach fernen Orten und Reisen',
    meaningEn: 'wanderlust — the deep desire to travel',
    example: 'Wanderlust treibt Reisende seit Jahrhunderten an, neue Horizonte zu entdecken.',
    exampleEn: 'Wanderlust has driven travelers for centuries to discover new horizons.',
  },
  {
    word: 'Sehnsucht',
    pronunciation: '/ˈzeːnˌzʊxt/',
    category: 'noun',
    gender: 'f',
    plural: 'die Sehnsüchte',
    genitive: 'der Sehnsucht',
    meaning: 'tiefes, schmerzliches Verlangen nach etwas (oft Unerreichbarem)',
    meaningEn: 'longing, yearning',
    example: 'Die Sehnsucht nach seiner Heimat wurde mit jedem Tag stärker.',
    exampleEn: 'The longing for his homeland grew stronger with each day.',
  },
  {
    word: 'Fernweh',
    pronunciation: '/ˈfɛʁnˌveː/',
    category: 'noun',
    gender: 'n',
    plural: '(keine Plural)',
    meaning: 'das Gefühl, in die Ferne reisen zu wollen',
    meaningEn: 'wanderlust, the itch to travel far',
    example: 'Wenn ich am Fenster sitze und die Weltkarte anschaue, packt mich sofort das Fernweh.',
    exampleEn: 'When I sit at the window looking at the world map, wanderlust immediately grabs me.',
  },
  {
    word: 'Heimat',
    pronunciation: '/ˈhaɪ̯mat/',
    category: 'noun',
    gender: 'f',
    plural: 'die Heimaten (selten)',
    meaning: 'der Ort, an dem man zu Hause ist; Land oder Stadt der Herkunft',
    meaningEn: 'home, homeland',
    example: 'Berlin ist meine Heimat geworden, obwohl ich ursprünglich aus München komme.',
    exampleEn: 'Berlin has become my home, even though I originally come from Munich.',
  },
  {
    word: 'Gemütlichkeit',
    pronunciation: '/ɡəˈmyːtlɪçkaɪ̯t/',
    category: 'noun',
    gender: 'f',
    plural: '(keine Plural)',
    meaning: 'warme, behagliche, freundliche Atmosphäre; Geborgenheit',
    meaningEn: 'coziness, snugness',
    example: 'Die Gemütlichkeit des kleinen Cafés erinnerte mich an meine Großmutter.',
    exampleEn: 'The coziness of the little café reminded me of my grandmother.',
  },
  {
    word: 'Vergänglichkeit',
    pronunciation: '/fɛɐ̯ˈɡɛŋlɪçkaɪ̯t/',
    category: 'noun',
    gender: 'f',
    plural: '(selten)',
    meaning: 'die Tatsache, dass alles Irdische nur vorübergehend ist',
    meaningEn: 'transience, impermanence',
    example: 'Die Vergänglichkeit der Kirschblüte macht sie umso schöner.',
    exampleEn: 'The transience of cherry blossoms makes them all the more beautiful.',
  },
  {
    word: 'Glücksmoment',
    pronunciation: '/ˈɡlʏksmoˌmɛnt/',
    category: 'noun',
    gender: 'm',
    plural: 'die Glücksmomente',
    genitive: 'des Glücksmoments',
    meaning: 'ein kurzer, aber intensiver Augenblick des Glücks',
    meaningEn: 'a happy moment, a flash of joy',
    example: 'Der Sonnenstrahl durch das Wolkenloch war ein echter Glücksmoment.',
    exampleEn: 'The sunbeam through the hole in the clouds was a real happy moment.',
  },
  {
    word: 'Feierabend',
    pronunciation: '/ˈfaɪ̯ɐˌʔaːbənt/',
    category: 'noun',
    gender: 'm',
    plural: 'die Feierabende',
    meaning: 'der Abend nach der Arbeit; die freie Zeit danach',
    meaningEn: 'end of the workday, leisure time',
    example: 'Endlich Feierabend! Heute Abend gehe ich noch joggen.',
    exampleEn: 'Finally, time to relax! Tonight I am still going for a jog.',
  },
  {
    word: 'Morgenrot',
    pronunciation: '/ˈmɔʁɡn̩ˌʁoːt/',
    category: 'noun',
    gender: 'n',
    plural: '(keine Plural)',
    meaning: 'die rötliche Färbung des Himmels bei Sonnenaufgang',
    meaningEn: 'red sky at sunrise',
    example: 'Das Morgenrot kündigte einen wunderschönen Tag an.',
    exampleEn: 'The red sunrise sky heralded a beautiful day.',
  },
  {
    word: 'Abendrot',
    pronunciation: '/ˈaːbn̩tˌʁoːt/',
    category: 'noun',
    gender: 'n',
    plural: '(keine Plural)',
    meaning: 'die rötliche Färbung des Himmels bei Sonnenuntergang',
    meaningEn: 'red sky at sunset',
    example: 'Bei Sonnenuntergang leuchtete das Meer im goldenen Abendrot.',
    exampleEn: 'At sunset, the sea glowed in golden red.',
  },
  {
    word: 'Zweisamkeit',
    pronunciation: '/ˈtsvaɪ̯ˌzaːmkaɪ̯t/',
    category: 'noun',
    gender: 'f',
    plural: '(selten)',
    meaning: 'das Beisammensein zu zweit; Intimität',
    meaningEn: 'togetherness (of two)',
    example: 'Sie genossen die Zweisamkeit bei einem Glas Wein auf der Terrasse.',
    exampleEn: 'They enjoyed the togetherness over a glass of wine on the terrace.',
  },
  {
    word: 'Geborgenheit',
    pronunciation: '/ɡəˈbɔʁɡn̩haɪ̯t/',
    category: 'noun',
    gender: 'f',
    plural: '(selten)',
    meaning: 'ein Gefühl von Schutz, Sicherheit und Aufgehobensein',
    meaningEn: 'a sense of safety and being cared for',
    example: 'In den Armen seiner Mutter fand er endlich wieder Geborgenheit.',
    exampleEn: 'In his mother\'s arms he finally found safety again.',
  },
  {
    word: 'Liebestrank',
    pronunciation: '/ˈliːbəsˌtʁaŋk/',
    category: 'noun',
    gender: 'm',
    plural: 'die Liebestränke',
    genitive: 'des Liebestranks',
    meaning: 'ein Getränk, das Liebe hervorrufen soll (auch übertragen)',
    meaningEn: 'love potion, love elixir',
    example: 'Ihr Lächeln wirkte wie ein Liebestrank.',
    exampleEn: 'Her smile worked like a love potion.',
  },
  {
    word: 'Augenblick',
    pronunciation: '/ˈaʊɡn̩ˌblɪk/',
    category: 'noun',
    gender: 'm',
    plural: 'die Augenblicke',
    meaning: 'ein sehr kurzer Zeitraum; ein Moment',
    meaningEn: 'moment, instant',
    example: 'Im Augenblick verstehe ich nicht, was du meinst.',
    exampleEn: 'At the moment I don\'t understand what you mean.',
  },
  {
    word: 'Bilderbuch',
    pronunciation: '/ˈbɪldɐˌbuːx/',
    category: 'noun',
    gender: 'n',
    plural: 'die Bilderbücher',
    genitive: 'des Bilderbuchs',
    meaning: 'Buch mit vielen Bildern für Kinder; auch: idealtypisch, makellos',
    meaningEn: 'picture book; picture-perfect',
    example: 'Das kleine Dorf war ein Bilderbuch — wie aus dem 18. Jahrhundert.',
    exampleEn: 'The small village was picture-perfect — like from the 18th century.',
  },
  {
    word: 'sturmfrei',
    pronunciation: '/ˈʃtʊʁmˌfʁaɪ̯/',
    category: 'adjective',
    meaning: 'ohne Aufsicht (besonders: Eltern nicht zu Hause)',
    meaningEn: 'having the house to oneself',
    example: 'Endlich sturmfrei — die Party kann beginnen!',
    exampleEn: 'Finally, parents gone — the party can begin!',
    comparative: 'sturmfreier',
    superlative: 'am sturmfreisten',
  },
  {
    word: 'Ohrwurm',
    pronunciation: '/ˈoːɐ̯ˌvʊʁm/',
    category: 'noun',
    gender: 'm',
    plural: 'die Ohrwürmer',
    genitive: 'des Ohrwurms',
    meaning: 'ein Lied, das man nicht mehr aus dem Kopf bekommt',
    meaningEn: 'an earworm — a song stuck in your head',
    example: 'Dieser Song ist ein echter Ohrwurm — er geht mir nicht mehr aus dem Kopf.',
    exampleEn: 'This song is a real earworm — I cannot get it out of my head.',
  },
  {
    word: 'Glühwein',
    pronunciation: '/ˈɡlyːˌvaɪ̯n/',
    category: 'noun',
    gender: 'm',
    plural: 'die Glühweine',
    meaning: 'heißes Getränk mit Rotwein und Gewürzen, typisch auf Weihnachtsmärkten',
    meaningEn: 'mulled wine',
    example: 'Auf dem Weihnachtsmarkt riecht es überall nach Glühwein und gebrannten Mandeln.',
    exampleEn: 'At the Christmas market everything smells of mulled wine and roasted almonds.',
  },
  {
    word: 'Frühlingserwachen',
    pronunciation: '/ˈfʁyːlɪŋsɛɐ̯ˌvaxn̩/',
    category: 'noun',
    gender: 'n',
    plural: '(keine Plural)',
    meaning: 'das Erwachen der Natur im Frühling',
    meaningEn: 'spring awakening',
    example: 'Das Frühlingserwachen im April bringt die ersten Blumen hervor.',
    exampleEn: 'The spring awakening in April brings out the first flowers.',
  },
  {
    word: 'Kopfkino',
    pronunciation: '/ˈkɔpfˌkiːno/',
    category: 'noun',
    gender: 'n',
    plural: 'die Kopfkinos',
    meaning: 'gedankliches Visualisieren von Szenarien (wörtlich: Kopf-Kino)',
    meaningEn: 'mental movie, daydream',
    example: 'Bei diesem Song geht sofort mein Kopfkino an.',
    exampleEn: 'When I hear this song, my mental movie starts immediately.',
  },
  {
    word: 'Lieblingsplatz',
    pronunciation: '/ˈliːplɪŋsˌplats/',
    category: 'noun',
    gender: 'm',
    plural: 'die Lieblingsplätze',
    genitive: 'des Lieblingsplatzes',
    meaning: 'der Ort, an dem man sich am wohlsten fühlt',
    meaningEn: 'favorite spot',
    example: 'Mein Lieblingsplatz ist die alte Bank unter dem Apfelbaum.',
    exampleEn: 'My favorite spot is the old bench under the apple tree.',
  },
  {
    word: 'Wohlgefühl',
    pronunciation: '/ˈvoːlɡəˌfyːl/',
    category: 'noun',
    gender: 'n',
    plural: 'die Wohlgefühle',
    meaning: 'ein angenehmes Gefühl von Wohlbefinden und Zufriedenheit',
    meaningEn: 'a sense of well-being',
    example: 'Die warme Dusche nach einem langen Tag ist ein echtes Wohlgefühl.',
    exampleEn: 'The warm shower after a long day is a real sense of well-being.',
  },
  {
    word: 'Schlafzimmerblick',
    pronunciation: '/ˈʃlaːftsɪmɐˌblɪk/',
    category: 'noun',
    gender: 'm',
    plural: 'die Schlafzimmerblicke',
    meaning: 'verschlafener, leicht verträumter Blick beim Aufwachen',
    meaningEn: 'bedroom eyes, sleepy look',
    example: 'Mit seinem Schlafzimmerblick und den zerzausten Haaren sah er bezaubernd aus.',
    exampleEn: 'With his sleepy eyes and tousled hair, he looked enchanting.',
  },
  {
    word: 'Verwandlung',
    pronunciation: '/fɛɐ̯ˈvantlʊŋ/',
    category: 'noun',
    gender: 'f',
    plural: 'die Verwandlungen',
    meaning: 'die Umwandlung von einer Form in eine andere',
    meaningEn: 'transformation',
    example: 'Die Verwandlung der Raupe zum Schmetterling fasziniert mich jedes Mal.',
    exampleEn: 'The transformation of caterpillar to butterfly fascinates me every time.',
  },
  {
    word: 'Kraftort',
    pronunciation: '/ˈkʁaftˌʔɔʁt/',
    category: 'noun',
    gender: 'm',
    plural: 'die Kraftorte',
    genitive: 'des Kraftorts',
    meaning: 'ein Ort, an dem man neue Energie tankt',
    meaningEn: 'place of power, energy spot',
    example: 'Der alte Leuchtturm am Meer ist mein persönlicher Kraftort.',
    exampleEn: 'The old lighthouse by the sea is my personal place of power.',
  },
  {
    word: 'Tageslicht',
    pronunciation: '/ˈtaːɡəsˌlɪçt/',
    category: 'noun',
    gender: 'n',
    plural: '(keine Plural)',
    meaning: 'das natürliche Licht am Tag',
    meaningEn: 'daylight',
    example: 'Endlich wieder Tageslicht! Die dunklen Wintertage haben lange genug gedauert.',
    exampleEn: 'Daylight again at last! The dark winter days have lasted long enough.',
  },
  {
    word: 'Lebenskünstler',
    pronunciation: '/ˈleːbn̩sˌkʏnstlɐ/',
    category: 'noun',
    gender: 'm',
    plural: 'die Lebenskünstler',
    genitive: 'des Lebenskünstlers',
    meaning: 'jemand, der das Leben mit Leichtigkeit und Freude genießt',
    meaningEn: 'artist of life, bon vivant',
    example: 'Mein Onkel ist ein echter Lebenskünstler — er reist, kocht, lacht, lebt.',
    exampleEn: 'My uncle is a real artist of life — he travels, cooks, laughs, lives.',
  },
  {
    word: 'Augenweide',
    pronunciation: '/ˈaʊɡn̩ˌvaɪ̯də/',
    category: 'noun',
    gender: 'f',
    plural: 'die Augenweiden',
    meaning: 'etwas Schönes zum Anschauen',
    meaningEn: 'a feast for the eyes',
    example: 'Die blühenden Wiesen im Mai sind eine wahre Augenweide.',
    exampleEn: 'The blooming meadows in May are a true feast for the eyes.',
  },
  {
    word: 'Sternschnuppe',
    pronunciation: '/ˈʃtɛʁnˌʃnʊpə/',
    category: 'noun',
    gender: 'f',
    plural: 'die Sternschnuppen',
    meaning: 'ein Meteor, der als leuchtender Punkt am Himmel zu sehen ist',
    meaningEn: 'shooting star',
    example: 'Als ich klein war, durfte ich mir beim Anblick einer Sternschnuppe etwas wünschen.',
    exampleEn: 'When I was little, I was allowed to make a wish upon seeing a shooting star.',
  },
  {
    word: 'Wundertüte',
    pronunciation: '/ˈvʊndɐˌtyːtə/',
    category: 'noun',
    gender: 'f',
    plural: 'die Wundertüten',
    meaning: 'eine Tüte mit unbekanntem, oft spannendem Inhalt',
    meaningEn: 'a bag of surprises',
    example: 'Mein Adventskalender ist wie eine kleine Wundertüte jeden Tag im Dezember.',
    exampleEn: 'My advent calendar is like a little bag of surprises every day in December.',
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

// Helper to derive the article ("der", "die", "das") from gender
export function getArticle(gender?: 'm' | 'f' | 'n'): string {
  if (gender === 'm') return 'der';
  if (gender === 'f') return 'die';
  if (gender === 'n') return 'das';
  return '';
}

// Helper to format "die Sehnsüchte" or "die Sehnsucht, -" patterns
export function formatNounDeclension(entry: WortDesTages): string | null {
  if (entry.category !== 'noun' || !entry.gender) return null;
  const article = getArticle(entry.gender);
  const plural = entry.plural || '';
  return `${article} ${entry.word}${plural ? `, ${plural}` : ''}`;
}