'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FONTS, getTheme, CEFR_LEVELS } from '../lib/theme';
import { trackEvent } from '../lib/activity';

// SM-2 Spaced Repetition Algorithm
// Based on SuperMemo SM-2: https://super-memory.com/english/ol/sm2.htm
//
// Each card has:
//   interval (days until next review)
//   repetition (number of successful reviews in a row)
//   easiness factor (starts at 2.5, never drops below 1.3)
//   due date (next review timestamp)
//   lapses (number of times forgotten)
//
// Quality 0-5: 0=total blackout, 5=perfect recall
// <3 = fail (reset to 1 day)
// >=3 = pass

interface VocabCard {
  id: string;
  word: string;
  translation: string;
  pos: string;          // part of speech (noun/verb/adj)
  gender?: string;      // der/die/das for nouns
  level: string;        // CEFR A1/B1/C1 etc.
  example: string;
  exampleEn: string;
  audio?: string;       // optional IPA

  // SM-2 state
  interval: number;     // days
  repetition: number;
  ef: number;           // easiness factor
  due: number;          // next due timestamp
  lapses: number;
  lastReviewed?: number;
  totalReviews: number;
  correctReviews: number;
}

const STORAGE_KEY = 'dein-deutsch-woerter-v2';

// Seed vocab — A1 starter pack (50 words across categories)
const SEED_VOCAB: Omit<VocabCard, 'interval' | 'repetition' | 'ef' | 'due' | 'lapses' | 'totalReviews' | 'correctReviews'>[] = [
  // Greetings & Basics
  { id: 'g1', word: 'Hallo', translation: 'hello', pos: 'interj', level: 'A1', example: 'Hallo, wie geht es dir?', exampleEn: 'Hello, how are you?' },
  { id: 'g2', word: 'Tschüss', translation: 'bye', pos: 'interj', level: 'A1', example: 'Tschüss, bis morgen!', exampleEn: 'Bye, see you tomorrow!' },
  { id: 'g3', word: 'Danke', translation: 'thanks', pos: 'interj', level: 'A1', example: 'Vielen Dank für deine Hilfe.', exampleEn: 'Thanks much for your help.' },
  { id: 'g4', word: 'Bitte', translation: 'please / you\'re welcome', pos: 'interj', level: 'A1', example: 'Einen Kaffee, bitte.', exampleEn: 'One coffee, please.' },
  { id: 'g5', word: 'Ja', translation: 'yes', pos: 'adv', level: 'A1', example: 'Ja, das stimmt.', exampleEn: 'Yes, that\'s correct.' },
  { id: 'g6', word: 'Nein', translation: 'no', pos: 'adv', level: 'A1', example: 'Nein, danke.', exampleEn: 'No, thanks.' },

  // Pronouns
  { id: 'p1', word: 'ich', translation: 'I', pos: 'pron', level: 'A1', example: 'Ich bin Student.', exampleEn: 'I am a student.' },
  { id: 'p2', word: 'du', translation: 'you (informal)', pos: 'pron', level: 'A1', example: 'Wo wohnst du?', exampleEn: 'Where do you live?' },
  { id: 'p3', word: 'er', translation: 'he', pos: 'pron', level: 'A1', example: 'Er kommt aus Berlin.', exampleEn: 'He comes from Berlin.' },
  { id: 'p4', word: 'sie', translation: 'she / they', pos: 'pron', level: 'A1', example: 'Sie arbeitet heute.', exampleEn: 'She works today.' },
  { id: 'p5', word: 'wir', translation: 'we', pos: 'pron', level: 'A1', example: 'Wir lernen Deutsch.', exampleEn: 'We are learning German.' },

  // Common nouns
  { id: 'n1', word: 'der Mann', translation: 'man', pos: 'noun', gender: 'm', level: 'A1', example: 'Der Mann liest ein Buch.', exampleEn: 'The man reads a book.' },
  { id: 'n2', word: 'die Frau', translation: 'woman', pos: 'noun', gender: 'f', level: 'A1', example: 'Die Frau arbeitet hier.', exampleEn: 'The woman works here.' },
  { id: 'n3', word: 'das Kind', translation: 'child', pos: 'noun', gender: 'n', level: 'A1', example: 'Das Kind spielt im Park.', exampleEn: 'The child plays in the park.' },
  { id: 'n4', word: 'das Haus', translation: 'house', pos: 'noun', gender: 'n', level: 'A1', example: 'Das Haus ist groß.', exampleEn: 'The house is big.' },
  { id: 'n5', word: 'das Auto', translation: 'car', pos: 'noun', gender: 'n', level: 'A1', example: 'Das Auto ist rot.', exampleEn: 'The car is red.' },
  { id: 'n6', word: 'die Stadt', translation: 'city', pos: 'noun', gender: 'f', level: 'A1', example: 'Die Stadt ist schön.', exampleEn: 'The city is beautiful.' },
  { id: 'n7', word: 'das Buch', translation: 'book', pos: 'noun', gender: 'n', level: 'A1', example: 'Ich lese ein Buch.', exampleEn: 'I read a book.' },
  { id: 'n8', word: 'die Zeit', translation: 'time', pos: 'noun', gender: 'f', level: 'A1', example: 'Ich habe keine Zeit.', exampleEn: 'I have no time.' },

  // Common verbs
  { id: 'v1', word: 'sein', translation: 'to be', pos: 'verb', level: 'A1', example: 'Ich bin müde.', exampleEn: 'I am tired.' },
  { id: 'v2', word: 'haben', translation: 'to have', pos: 'verb', level: 'A1', example: 'Wir haben Hunger.', exampleEn: 'We are hungry.' },
  { id: 'v3', word: 'gehen', translation: 'to go / walk', pos: 'verb', level: 'A1', example: 'Ich gehe zur Schule.', exampleEn: 'I go to school.' },
  { id: 'v4', word: 'kommen', translation: 'to come', pos: 'verb', level: 'A1', example: 'Er kommt heute Abend.', exampleEn: 'He comes tonight.' },
  { id: 'v5', word: 'machen', translation: 'to do / make', pos: 'verb', level: 'A1', example: 'Was machst du?', exampleEn: 'What are you doing?' },
  { id: 'v6', word: 'wohnen', translation: 'to live (reside)', pos: 'verb', level: 'A1', example: 'Ich wohne in Berlin.', exampleEn: 'I live in Berlin.' },
  { id: 'v7', word: 'arbeiten', translation: 'to work', pos: 'verb', level: 'A1', example: 'Sie arbeitet im Büro.', exampleEn: 'She works in the office.' },
  { id: 'v8', word: 'lernen', translation: 'to learn', pos: 'verb', level: 'A1', example: 'Ich lerne Deutsch.', exampleEn: 'I am learning German.' },
  { id: 'v9', word: 'essen', translation: 'to eat', pos: 'verb', level: 'A1', example: 'Wir essen jetzt.', exampleEn: 'We are eating now.' },
  { id: 'v10', word: 'trinken', translation: 'to drink', pos: 'verb', level: 'A1', example: 'Er trinkt Kaffee.', exampleEn: 'He drinks coffee.' },
  { id: 'v11', word: 'sprechen', translation: 'to speak', pos: 'verb', level: 'A1', example: 'Sprechen Sie Englisch?', exampleEn: 'Do you speak English?' },
  { id: 'v12', word: 'lesen', translation: 'to read', pos: 'verb', level: 'A1', example: 'Ich lese ein Buch.', exampleEn: 'I read a book.' },

  // Key adjectives
  { id: 'a1', word: 'gut', translation: 'good', pos: 'adj', level: 'A1', example: 'Das Essen ist gut.', exampleEn: 'The food is good.' },
  { id: 'a2', word: 'schlecht', translation: 'bad', pos: 'adj', level: 'A1', example: 'Das Wetter ist schlecht.', exampleEn: 'The weather is bad.' },
  { id: 'a3', word: 'groß', translation: 'big / tall', pos: 'adj', level: 'A1', example: 'Mein Bruder ist groß.', exampleEn: 'My brother is tall.' },
  { id: 'a4', word: 'klein', translation: 'small', pos: 'adj', level: 'A1', example: 'Das Haus ist klein.', exampleEn: 'The house is small.' },
  { id: 'a5', word: 'neu', translation: 'new', pos: 'adj', level: 'A1', example: 'Mein Auto ist neu.', exampleEn: 'My car is new.' },
  { id: 'a6', word: 'alt', translation: 'old', pos: 'adj', level: 'A1', example: 'Das Buch ist alt.', exampleEn: 'The book is old.' },
  { id: 'a7', word: 'schön', translation: 'beautiful / nice', pos: 'adj', level: 'A1', example: 'Die Stadt ist schön.', exampleEn: 'The city is beautiful.' },
  { id: 'a8', word: 'müde', translation: 'tired', pos: 'adj', level: 'A1', example: 'Ich bin müde.', exampleEn: 'I am tired.' },

  // Time words
  { id: 't1', word: 'heute', translation: 'today', pos: 'adv', level: 'A1', example: 'Heute ist Montag.', exampleEn: 'Today is Monday.' },
  { id: 't2', word: 'morgen', translation: 'tomorrow', pos: 'adv', level: 'A1', example: 'Morgen komme ich.', exampleEn: 'Tomorrow I come.' },
  { id: 't3', word: 'jetzt', translation: 'now', pos: 'adv', level: 'A1', example: 'Was machst du jetzt?', exampleEn: 'What are you doing now?' },

  // Numbers
  { id: 't4', word: 'eins', translation: 'one', pos: 'num', level: 'A1', example: 'Ich möchte eins.', exampleEn: 'I want one.' },
  { id: 't5', word: 'zwei', translation: 'two', pos: 'num', level: 'A1', example: 'Zwei Kaffee, bitte.', exampleEn: 'Two coffees, please.' },
  { id: 't6', word: 'drei', translation: 'three', pos: 'num', level: 'A1', example: 'Drei Euro bitte.', exampleEn: 'Three euros please.' },

  // Colors
  { id: 'c1', word: 'rot', translation: 'red', pos: 'adj', level: 'A1', example: 'Das Auto ist rot.', exampleEn: 'The car is red.' },
  { id: 'c2', word: 'blau', translation: 'blue', pos: 'adj', level: 'A1', example: 'Der Himmel ist blau.', exampleEn: 'The sky is blue.' },
  { id: 'c3', word: 'grün', translation: 'green', pos: 'adj', level: 'A1', example: 'Das Gras ist grün.', exampleEn: 'The grass is green.' },

  // Food
  { id: 'f1', word: 'das Brot', translation: 'bread', pos: 'noun', gender: 'n', level: 'A1', example: 'Ich esse Brot.', exampleEn: 'I eat bread.' },
  { id: 'f2', word: 'das Wasser', translation: 'water', pos: 'noun', gender: 'n', level: 'A1', example: 'Kann ich Wasser haben?', exampleEn: 'Can I have water?' },
  { id: 'f3', word: 'der Kaffee', translation: 'coffee', pos: 'noun', gender: 'm', level: 'A1', example: 'Ich trinke Kaffee.', exampleEn: 'I drink coffee.' },
  { id: 'f4', word: 'der Tee', translation: 'tea', pos: 'noun', gender: 'm', level: 'A1', example: 'Möchtest du Tee?', exampleEn: 'Would you like tea?' },

  // Family
  { id: 'f5', word: 'die Mutter', translation: 'mother', pos: 'noun', gender: 'f', level: 'A1', example: 'Meine Mutter ist nett.', exampleEn: 'My mother is nice.' },
  { id: 'f6', word: 'der Vater', translation: 'father', pos: 'noun', gender: 'm', level: 'A1', example: 'Mein Vater arbeitet.', exampleEn: 'My father works.' },
  { id: 'f7', word: 'der Bruder', translation: 'brother', pos: 'noun', gender: 'm', level: 'A1', example: 'Mein Bruder ist Student.', exampleEn: 'My brother is a student.' },
  { id: 'f8', word: 'die Schwester', translation: 'sister', pos: 'noun', gender: 'f', level: 'A1', example: 'Meine Schwester lernt.', exampleEn: 'My sister studies.' },

  // ===== A2 — Elementary (50 cards) =====
  // Travel & places
  { id: 'a2-p1', word: 'der Bahnhof', translation: 'train station', pos: 'noun', gender: 'm', level: 'A2', example: 'Der Bahnhof ist in der Stadtmitte.', exampleEn: 'The train station is downtown.' },
  { id: 'a2-p2', word: 'der Flughafen', translation: 'airport', pos: 'noun', gender: 'm', level: 'A2', example: 'Ich fahre zum Flughafen.', exampleEn: 'I am driving to the airport.' },
  { id: 'a2-p3', word: 'das Hotel', translation: 'hotel', pos: 'noun', gender: 'n', level: 'A2', example: 'Das Hotel ist teuer.', exampleEn: 'The hotel is expensive.' },
  { id: 'a2-p4', word: 'die Straße', translation: 'street', pos: 'noun', gender: 'f', level: 'A2', example: 'Die Straße ist breit.', exampleEn: 'The street is wide.' },
  { id: 'a2-p5', word: 'die Brücke', translation: 'bridge', pos: 'noun', gender: 'f', level: 'A2', example: 'Die Brücke ist alt.', exampleEn: 'The bridge is old.' },
  { id: 'a2-p6', word: 'die Kirche', translation: 'church', pos: 'noun', gender: 'f', level: 'A2', example: 'Die Kirche ist im Zentrum.', exampleEn: 'The church is in the center.' },
  { id: 'a2-p7', word: 'der Park', translation: 'park', pos: 'noun', gender: 'm', level: 'A2', example: 'Wir gehen im Park spazieren.', exampleEn: 'We walk in the park.' },
  { id: 'a2-p8', word: 'das Restaurant', translation: 'restaurant', pos: 'noun', gender: 'n', level: 'A2', example: 'Das Restaurant hat gutes Essen.', exampleEn: 'The restaurant has good food.' },
  // Travel verbs
  { id: 'a2-v1', word: 'fliegen', translation: 'to fly', pos: 'verb', level: 'A2', example: 'Ich fliege nach Berlin.', exampleEn: 'I am flying to Berlin.' },
  { id: 'a2-v2', word: 'fahren', translation: 'to drive/travel', pos: 'verb', level: 'A2', example: 'Wir fahren mit dem Zug.', exampleEn: 'We travel by train.' },
  { id: 'a2-v3', word: 'laufen', translation: 'to run/walk', pos: 'verb', level: 'A2', example: 'Ich laufe jeden Morgen.', exampleEn: 'I run every morning.' },
  { id: 'a2-v4', word: 'steigen', translation: 'to climb/get on', pos: 'verb', level: 'A2', example: 'Wir steigen in den Bus.', exampleEn: 'We get on the bus.' },
  { id: 'a2-v5', word: 'umsteigen', translation: 'to transfer', pos: 'verb', level: 'A2', example: 'Ich muss in Köln umsteigen.', exampleEn: 'I have to transfer in Cologne.' },
  { id: 'a2-v6', word: 'buchen', translation: 'to book', pos: 'verb', level: 'A2', example: 'Ich buche ein Hotel.', exampleEn: 'I book a hotel.' },
  { id: 'a2-v7', word: 'reservieren', translation: 'to reserve', pos: 'verb', level: 'A2', example: 'Ich reserviere einen Tisch.', exampleEn: 'I reserve a table.' },
  { id: 'a2-v8', word: 'mitbringen', translation: 'to bring along', pos: 'verb', level: 'A2', example: 'Bring bitte das Buch mit.', exampleEn: 'Please bring the book along.' },
  // Daily life
  { id: 'a2-d1', word: 'der Urlaub', translation: 'vacation', pos: 'noun', gender: 'm', level: 'A2', example: 'Ich brauche Urlaub.', exampleEn: 'I need a vacation.' },
  { id: 'a2-d2', word: 'die Ferien', translation: 'school holidays (pl)', pos: 'noun', gender: 'f', level: 'A2', example: 'Die Ferien beginnen im Juli.', exampleEn: 'The holidays start in July.' },
  { id: 'a2-d3', word: 'die Arbeit', translation: 'work/job', pos: 'noun', gender: 'f', level: 'A2', example: 'Die Arbeit macht Spaß.', exampleEn: 'Work is fun.' },
  { id: 'a2-d4', word: 'das Geld', translation: 'money', pos: 'noun', gender: 'n', level: 'A2', example: 'Ich habe kein Geld.', exampleEn: 'I have no money.' },
  { id: 'a2-d5', word: 'die Rechnung', translation: 'bill/check', pos: 'noun', gender: 'f', level: 'A2', example: 'Die Rechnung, bitte.', exampleEn: 'The check, please.' },
  { id: 'a2-d6', word: 'der Schlüssel', translation: 'key', pos: 'noun', gender: 'm', level: 'A2', example: 'Wo ist mein Schlüssel?', exampleEn: 'Where is my key?' },
  { id: 'a2-d7', word: 'das Handy', translation: 'mobile phone', pos: 'noun', gender: 'n', level: 'A2', example: 'Mein Handy ist kaputt.', exampleEn: 'My phone is broken.' },
  { id: 'a2-d8', word: 'der Computer', translation: 'computer', pos: 'noun', gender: 'm', level: 'A2', example: 'Mein Computer ist neu.', exampleEn: 'My computer is new.' },
  // Health
  { id: 'a2-h1', word: 'der Arzt', translation: 'doctor (m)', pos: 'noun', gender: 'm', level: 'A2', example: 'Ich gehe zum Arzt.', exampleEn: 'I go to the doctor.' },
  { id: 'a2-h2', word: 'die Ärztin', translation: 'doctor (f)', pos: 'noun', gender: 'f', level: 'A2', example: 'Die Ärztin ist nett.', exampleEn: 'The doctor is nice.' },
  { id: 'a2-h3', word: 'das Krankenhaus', translation: 'hospital', pos: 'noun', gender: 'n', level: 'A2', example: 'Das Krankenhaus ist groß.', exampleEn: 'The hospital is big.' },
  { id: 'a2-h4', word: 'die Apotheke', translation: 'pharmacy', pos: 'noun', gender: 'f', level: 'A2', example: 'Die Apotheke ist neben dem Café.', exampleEn: 'The pharmacy is next to the café.' },
  { id: 'a2-h5', word: 'wehtun', translation: 'to hurt', pos: 'verb', level: 'A2', example: 'Mein Kopf tut weh.', exampleEn: 'My head hurts.' },
  { id: 'a2-h6', word: 'husten', translation: 'to cough', pos: 'verb', level: 'A2', example: 'Er hustet viel.', exampleEn: 'He coughs a lot.' },
  { id: 'a2-h7', word: 'fühlen', translation: 'to feel', pos: 'verb', level: 'A2', example: 'Wie fühlst du dich?', exampleEn: 'How do you feel?' },
  // A2 adjectives & adverbs
  { id: 'a2-a1', word: 'teuer', translation: 'expensive', pos: 'adj', level: 'A2', example: 'Das Auto ist teuer.', exampleEn: 'The car is expensive.' },
  { id: 'a2-a2', word: 'billig', translation: 'cheap', pos: 'adj', level: 'A2', example: 'Das Hotel ist billig.', exampleEn: 'The hotel is cheap.' },
  { id: 'a2-a3', word: 'langsam', translation: 'slow', pos: 'adj', level: 'A2', example: 'Der Zug ist langsam.', exampleEn: 'The train is slow.' },
  { id: 'a2-a4', word: 'schnell', translation: 'fast', pos: 'adj', level: 'A2', example: 'Das Auto ist schnell.', exampleEn: 'The car is fast.' },
  { id: 'a2-a5', word: 'leise', translation: 'quiet', pos: 'adj', level: 'A2', example: 'Sei leise!', exampleEn: 'Be quiet!' },
  { id: 'a2-a6', word: 'laut', translation: 'loud', pos: 'adj', level: 'A2', example: 'Die Musik ist laut.', exampleEn: 'The music is loud.' },
  { id: 'a2-a7', word: 'früh', translation: 'early', pos: 'adj', level: 'A2', example: 'Ich stehe früh auf.', exampleEn: 'I get up early.' },
  { id: 'a2-a8', word: 'spät', translation: 'late', pos: 'adj', level: 'A2', example: 'Es ist schon spät.', exampleEn: 'It is already late.' },
  { id: 'a2-a9', word: 'lustig', translation: 'funny', pos: 'adj', level: 'A2', example: 'Der Film ist lustig.', exampleEn: 'The movie is funny.' },
  { id: 'a2-a10', word: 'langweilig', translation: 'boring', pos: 'adj', level: 'A2', example: 'Das Buch ist langweilig.', exampleEn: 'The book is boring.' },
  { id: 'a2-a11', word: 'interessant', translation: 'interesting', pos: 'adj', level: 'A2', example: 'Das Thema ist interessant.', exampleEn: 'The topic is interesting.' },
  { id: 'a2-a12', word: 'wichtig', translation: 'important', pos: 'adj', level: 'A2', example: 'Das ist wichtig.', exampleEn: 'That is important.' },
  // A2 connectors
  { id: 'a2-c1', word: 'weil', translation: 'because', pos: 'conj', level: 'A2', example: 'Ich bleibe, weil es regnet.', exampleEn: 'I stay because it rains.' },
  { id: 'a2-c2', word: 'dass', translation: 'that', pos: 'conj', level: 'A2', example: 'Ich weiß, dass du kommst.', exampleEn: 'I know that you are coming.' },
  { id: 'a2-c3', word: 'wenn', translation: 'when/if', pos: 'conj', level: 'A2', example: 'Wenn ich Zeit habe, komme ich.', exampleEn: 'If I have time, I come.' },
  { id: 'a2-c4', word: 'obwohl', translation: 'although', pos: 'conj', level: 'A2', example: 'Obwohl es regnet, gehe ich.', exampleEn: 'Although it rains, I go.' },
  { id: 'a2-c5', word: 'deshalb', translation: 'therefore', pos: 'conj', level: 'A2', example: 'Ich bin müde, deshalb schlafe ich.', exampleEn: 'I am tired, therefore I sleep.' },
  { id: 'a2-c6', word: 'trotzdem', translation: 'nevertheless', pos: 'conj', level: 'A2', example: 'Es regnet. Trotzdem gehe ich.', exampleEn: 'It rains. Nevertheless I go.' },
  // More food / meals
  { id: 'a2-f1', word: 'das Frühstück', translation: 'breakfast', pos: 'noun', gender: 'n', level: 'A2', example: 'Das Frühstück ist um 8.', exampleEn: 'Breakfast is at 8.' },
  { id: 'a2-f2', word: 'das Mittagessen', translation: 'lunch', pos: 'noun', gender: 'n', level: 'A2', example: 'Das Mittagessen ist um 12.', exampleEn: 'Lunch is at noon.' },
  { id: 'a2-f3', word: 'das Abendessen', translation: 'dinner', pos: 'noun', gender: 'n', level: 'A2', example: 'Das Abendessen ist um 19 Uhr.', exampleEn: 'Dinner is at 7 PM.' },
  { id: 'a2-f4', word: 'der Apfel', translation: 'apple', pos: 'noun', gender: 'm', level: 'A2', example: 'Ich esse einen Apfel.', exampleEn: 'I eat an apple.' },
  { id: 'a2-f5', word: 'die Milch', translation: 'milk', pos: 'noun', gender: 'f', level: 'A2', example: 'Die Milch ist frisch.', exampleEn: 'The milk is fresh.' },

  // ===== B1 — Intermediate (50 cards) =====
  // Abstract nouns
  { id: 'b1-n1', word: 'die Erfahrung', translation: 'experience', pos: 'noun', gender: 'f', level: 'B1', example: 'Ich habe viel Erfahrung.', exampleEn: 'I have a lot of experience.' },
  { id: 'b1-n2', word: 'die Meinung', translation: 'opinion', pos: 'noun', gender: 'f', level: 'B1', example: 'Das ist meine Meinung.', exampleEn: 'That is my opinion.' },
  { id: 'b1-n3', word: 'die Möglichkeit', translation: 'possibility', pos: 'noun', gender: 'f', level: 'B1', example: 'Es gibt viele Möglichkeiten.', exampleEn: 'There are many possibilities.' },
  { id: 'b1-n4', word: 'die Gelegenheit', translation: 'opportunity', pos: 'noun', gender: 'f', level: 'B1', example: 'Das ist eine gute Gelegenheit.', exampleEn: 'This is a good opportunity.' },
  { id: 'b1-n5', word: 'der Unterschied', translation: 'difference', pos: 'noun', gender: 'm', level: 'B1', example: 'Was ist der Unterschied?', exampleEn: 'What is the difference?' },
  { id: 'b1-n6', word: 'die Beziehung', translation: 'relationship', pos: 'noun', gender: 'f', level: 'B1', example: 'Wir haben eine gute Beziehung.', exampleEn: 'We have a good relationship.' },
  { id: 'b1-n7', word: 'die Gesellschaft', translation: 'society', pos: 'noun', gender: 'f', level: 'B1', example: 'Die Gesellschaft verändert sich.', exampleEn: 'Society is changing.' },
  { id: 'b1-n8', word: 'die Zukunft', translation: 'future', pos: 'noun', gender: 'f', level: 'B1', example: 'Die Zukunft ist ungewiss.', exampleEn: 'The future is uncertain.' },
  { id: 'b1-n9', word: 'die Vergangenheit', translation: 'past', pos: 'noun', gender: 'f', level: 'B1', example: 'Die Vergangenheit war anders.', exampleEn: 'The past was different.' },
  { id: 'b1-n10', word: 'die Erinnerung', translation: 'memory', pos: 'noun', gender: 'f', level: 'B1', example: 'Ich habe schöne Erinnerungen.', exampleEn: 'I have beautiful memories.' },
  // B1 verbs (more nuanced)
  { id: 'b1-v1', word: 'erklären', translation: 'to explain', pos: 'verb', level: 'B1', example: 'Kannst du das erklären?', exampleEn: 'Can you explain that?' },
  { id: 'b1-v2', word: 'erzählen', translation: 'to tell/narrate', pos: 'verb', level: 'B1', example: 'Erzähl mir eine Geschichte.', exampleEn: 'Tell me a story.' },
  { id: 'b1-v3', word: 'beschreiben', translation: 'to describe', pos: 'verb', level: 'B1', example: 'Beschreib dein Haus.', exampleEn: 'Describe your house.' },
  { id: 'b1-v4', word: 'vergleichen', translation: 'to compare', pos: 'verb', level: 'B1', example: 'Ich vergleiche die Preise.', exampleEn: 'I am comparing the prices.' },
  { id: 'b1-v5', word: 'entscheiden', translation: 'to decide', pos: 'verb', level: 'B1', example: 'Ich entscheide mich.', exampleEn: 'I decide.' },
  { id: 'b1-v6', word: 'sich bewerben', translation: 'to apply', pos: 'verb', level: 'B1', example: 'Ich bewerbe mich um die Stelle.', exampleEn: 'I am applying for the position.' },
  { id: 'b1-v7', word: 'einladen', translation: 'to invite', pos: 'verb', level: 'B1', example: 'Ich lade dich ein.', exampleEn: 'I invite you.' },
  { id: 'b1-v8', word: 'sich vorstellen', translation: 'to introduce/imagine', pos: 'verb', level: 'B1', example: 'Ich stelle mir das vor.', exampleEn: 'I imagine that.' },
  { id: 'b1-v9', word: 'sich interessieren für', translation: 'to be interested in', pos: 'verb', level: 'B1', example: 'Ich interessiere mich für Kunst.', exampleEn: 'I am interested in art.' },
  { id: 'b1-v10', word: 'sich freuen auf', translation: 'to look forward to', pos: 'verb', level: 'B1', example: 'Ich freue mich auf den Urlaub.', exampleEn: 'I look forward to the vacation.' },
  { id: 'b1-v11', word: 'sich ärgern über', translation: 'to be annoyed about', pos: 'verb', level: 'B1', example: 'Ich ärgere mich über den Lärm.', exampleEn: 'I am annoyed about the noise.' },
  { id: 'b1-v12', word: 'versuchen', translation: 'to try', pos: 'verb', level: 'B1', example: 'Ich versuche es.', exampleEn: 'I try it.' },
  { id: 'b1-v13', word: 'gelingen', translation: 'to succeed', pos: 'verb', level: 'B1', example: 'Es ist mir gelungen.', exampleEn: 'I succeeded.' },
  { id: 'b1-v14', word: 'empfehlen', translation: 'to recommend', pos: 'verb', level: 'B1', example: 'Ich empfehle das Restaurant.', exampleEn: 'I recommend the restaurant.' },
  { id: 'b1-v15', word: 'bedeuten', translation: 'to mean', pos: 'verb', level: 'B1', example: 'Was bedeutet das?', exampleEn: 'What does that mean?' },
  // B1 adjectives
  { id: 'b1-a1', word: 'erfolgreich', translation: 'successful', pos: 'adj', level: 'B1', example: 'Sie ist erfolgreich.', exampleEn: 'She is successful.' },
  { id: 'b1-a2', word: 'zuverlässig', translation: 'reliable', pos: 'adj', level: 'B1', example: 'Er ist zuverlässig.', exampleEn: 'He is reliable.' },
  { id: 'b1-a3', word: 'fleißig', translation: 'hardworking', pos: 'adj', level: 'B1', example: 'Sie ist fleißig.', exampleEn: 'She is hardworking.' },
  { id: 'b1-a4', word: 'faul', translation: 'lazy', pos: 'adj', level: 'B1', example: 'Er ist faul.', exampleEn: 'He is lazy.' },
  { id: 'b1-a5', word: 'höflich', translation: 'polite', pos: 'adj', level: 'B1', example: 'Sei höflich!', exampleEn: 'Be polite!' },
  { id: 'b1-a6', word: 'unhöflich', translation: 'impolite', pos: 'adj', level: 'B1', example: 'Das ist unhöflich.', exampleEn: 'That is impolite.' },
  { id: 'b1-a7', word: 'pünktlich', translation: 'punctual', pos: 'adj', level: 'B1', example: 'Er ist immer pünktlich.', exampleEn: 'He is always punctual.' },
  { id: 'b1-a8', word: 'zufrieden', translation: 'satisfied', pos: 'adj', level: 'B1', example: 'Ich bin zufrieden.', exampleEn: 'I am satisfied.' },
  { id: 'b1-a9', word: 'unzufrieden', translation: 'dissatisfied', pos: 'adj', level: 'B1', example: 'Sie ist unzufrieden.', exampleEn: 'She is dissatisfied.' },
  { id: 'b1-a10', word: 'verrückt', translation: 'crazy', pos: 'adj', level: 'B1', example: 'Das ist verrückt!', exampleEn: 'That is crazy!' },
  // B1 work / education
  { id: 'b1-w1', word: 'die Stelle', translation: 'position/job', pos: 'noun', gender: 'f', level: 'B1', example: 'Ich suche eine Stelle.', exampleEn: 'I am looking for a job.' },
  { id: 'b1-w2', word: 'der Beruf', translation: 'profession', pos: 'noun', gender: 'm', level: 'B1', example: 'Was ist Ihr Beruf?', exampleEn: 'What is your profession?' },
  { id: 'b1-w3', word: 'das Gehalt', translation: 'salary', pos: 'noun', gender: 'n', level: 'B1', example: 'Das Gehalt ist gut.', exampleEn: 'The salary is good.' },
  { id: 'b1-w5', word: 'der Kollege', translation: 'colleague (m)', pos: 'noun', gender: 'm', level: 'B1', example: 'Mein Kollege hilft mir.', exampleEn: 'My colleague helps me.' },
  { id: 'b1-w6', word: 'die Kollegin', translation: 'colleague (f)', pos: 'noun', gender: 'f', level: 'B1', example: 'Meine Kollegin ist nett.', exampleEn: 'My colleague is nice.' },
  { id: 'b1-w7', word: 'das Studium', translation: 'studies', pos: 'noun', gender: 'n', level: 'B1', example: 'Das Studium ist schwer.', exampleEn: 'Studies are hard.' },
  { id: 'b1-w8', word: 'die Universität', translation: 'university', pos: 'noun', gender: 'f', level: 'B1', example: 'Die Universität ist alt.', exampleEn: 'The university is old.' },
  { id: 'b1-w9', word: 'der Abschluss', translation: 'degree/conclusion', pos: 'noun', gender: 'm', level: 'B1', example: 'Ich habe meinen Abschluss.', exampleEn: 'I have my degree.' },
  { id: 'b1-w10', word: 'die Prüfung', translation: 'exam', pos: 'noun', gender: 'f', level: 'B1', example: 'Die Prüfung ist morgen.', exampleEn: 'The exam is tomorrow.' },
  // B1 media & function words
  { id: 'b1-m1', word: 'die Nachricht', translation: 'news/message', pos: 'noun', gender: 'f', level: 'B1', example: 'Ich habe eine Nachricht.', exampleEn: 'I have a message.' },
  { id: 'b1-m2', word: 'die Zeitung', translation: 'newspaper', pos: 'noun', gender: 'f', level: 'B1', example: 'Ich lese die Zeitung.', exampleEn: 'I read the newspaper.' },
  { id: 'b1-m3', word: 'der Film', translation: 'film', pos: 'noun', gender: 'm', level: 'B1', example: 'Der Film ist spannend.', exampleEn: 'The film is exciting.' },
  { id: 'b1-m4', word: 'die Musik', translation: 'music', pos: 'noun', gender: 'f', level: 'B1', example: 'Die Musik ist laut.', exampleEn: 'The music is loud.' },
  { id: 'b1-f1', word: 'außerdem', translation: 'besides/furthermore', pos: 'conj', level: 'B1', example: 'Außerdem habe ich Zeit.', exampleEn: 'Besides, I have time.' },
  { id: 'b1-f2', word: 'allerdings', translation: 'however/indeed', pos: 'conj', level: 'B1', example: 'Allerdings ist es teuer.', exampleEn: 'However, it is expensive.' },
  { id: 'b1-f3', word: 'sogar', translation: 'even', pos: 'adv', level: 'B1', example: 'Sogar ich kann das.', exampleEn: 'Even I can do that.' },
  { id: 'b1-f4', word: 'meistens', translation: 'mostly', pos: 'adv', level: 'B1', example: 'Meistens esse ich zu Hause.', exampleEn: 'I mostly eat at home.' },
  { id: 'b1-f5', word: 'manchmal', translation: 'sometimes', pos: 'adv', level: 'B1', example: 'Manchmal gehe ich ins Kino.', exampleEn: 'Sometimes I go to the cinema.' },

  // ===== B2 — Upper-Intermediate (30 cards) =====
  // Abstract concepts
  { id: 'b2-n1', word: 'die Herausforderung', translation: 'challenge', pos: 'noun', gender: 'f', level: 'B2', example: 'Das ist eine Herausforderung.', exampleEn: 'That is a challenge.' },
  { id: 'b2-n2', word: 'die Voraussetzung', translation: 'prerequisite', pos: 'noun', gender: 'f', level: 'B2', example: 'Das ist eine Voraussetzung.', exampleEn: 'That is a prerequisite.' },
  { id: 'b2-n3', word: 'die Auswirkung', translation: 'consequence/impact', pos: 'noun', gender: 'f', level: 'B2', example: 'Die Auswirkungen sind groß.', exampleEn: 'The consequences are big.' },
  { id: 'b2-n4', word: 'der Zusammenhang', translation: 'connection/context', pos: 'noun', gender: 'm', level: 'B2', example: 'Das hat einen Zusammenhang.', exampleEn: 'That has a connection.' },
  { id: 'b2-n5', word: 'die Einstellung', translation: 'attitude/setting', pos: 'noun', gender: 'f', level: 'B2', example: 'Meine Einstellung hat sich geändert.', exampleEn: 'My attitude has changed.' },
  { id: 'b2-n6', word: 'der Eindruck', translation: 'impression', pos: 'noun', gender: 'm', level: 'B2', example: 'Ich habe einen guten Eindruck.', exampleEn: 'I have a good impression.' },
  { id: 'b2-n7', word: 'die Vermutung', translation: 'assumption', pos: 'noun', gender: 'f', level: 'B2', example: 'Das ist nur eine Vermutung.', exampleEn: 'That is only an assumption.' },
  { id: 'b2-n8', word: 'der Gesichtspunkt', translation: 'point of view', pos: 'noun', gender: 'm', level: 'B2', example: 'Aus meinem Gesichtspunkt...', exampleEn: 'From my point of view...' },
  // B2 verbs
  { id: 'b2-v1', word: 'überzeugen', translation: 'to convince', pos: 'verb', level: 'B2', example: 'Er überzeugt mich.', exampleEn: 'He convinces me.' },
  { id: 'b2-v2', word: 'sich beschäftigen mit', translation: 'to engage with', pos: 'verb', level: 'B2', example: 'Ich beschäftige mich damit.', exampleEn: 'I engage with it.' },
  { id: 'b2-v3', word: 'berücksichtigen', translation: 'to take into account', pos: 'verb', level: 'B2', example: 'Bitte berücksichtigen Sie das.', exampleEn: 'Please take that into account.' },
  { id: 'b2-v4', word: 'sich herausstellen', translation: 'to turn out', pos: 'verb', level: 'B2', example: 'Es stellte sich heraus, dass...', exampleEn: 'It turned out that...' },
  { id: 'b2-v5', word: 'sich lohnen', translation: 'to be worth it', pos: 'verb', level: 'B2', example: 'Das lohnt sich.', exampleEn: 'That is worth it.' },
  { id: 'b2-v6', word: 'missverstehen', translation: 'to misunderstand', pos: 'verb', level: 'B2', example: 'Habe ich dich missverstanden?', exampleEn: 'Did I misunderstand you?' },
  { id: 'b2-v7', word: 'widersprechen', translation: 'to contradict', pos: 'verb', level: 'B2', example: 'Ich muss widersprechen.', exampleEn: 'I must contradict.' },
  // B2 idiomatic / informal adverbs
  { id: 'b2-i1', word: 'eigentlich', translation: 'actually', pos: 'adv', level: 'B2', example: 'Eigentlich habe ich keine Zeit.', exampleEn: 'Actually, I have no time.' },
  { id: 'b2-i2', word: 'jedenfalls', translation: 'in any case', pos: 'adv', level: 'B2', example: 'Jedenfalls komme ich.', exampleEn: 'In any case, I am coming.' },
  { id: 'b2-i3', word: 'womöglich', translation: 'possibly', pos: 'adv', level: 'B2', example: 'Womöglich ist es wahr.', exampleEn: 'It might be true.' },
  { id: 'b2-i4', word: 'nämlich', translation: 'namely/because', pos: 'adv', level: 'B2', example: 'Ich habe keine Zeit, ich muss nämlich arbeiten.', exampleEn: 'I have no time because I must work.' },
  // B2 complex adjectives
  { id: 'b2-a1', word: 'verantwortlich', translation: 'responsible', pos: 'adj', level: 'B2', example: 'Wer ist verantwortlich?', exampleEn: 'Who is responsible?' },
  { id: 'b2-a2', word: 'begeistert von', translation: 'enthusiastic about', pos: 'adj', level: 'B2', example: 'Ich bin begeistert!', exampleEn: 'I am enthusiastic!' },
  { id: 'b2-a3', word: 'skeptisch', translation: 'skeptical', pos: 'adj', level: 'B2', example: 'Ich bin skeptisch.', exampleEn: 'I am skeptical.' },
  { id: 'b2-a4', word: 'deutlich', translation: 'clear/obvious', pos: 'adj', level: 'B2', example: 'Das ist deutlich besser.', exampleEn: 'That is clearly better.' },
  { id: 'b2-a5', word: 'allgemein', translation: 'general', pos: 'adj', level: 'B2', example: 'Im Allgemeinen stimmt das.', exampleEn: 'In general, that is true.' },
  { id: 'b2-a6', word: 'ziemlich', translation: 'quite', pos: 'adv', level: 'B2', example: 'Das ist ziemlich gut.', exampleEn: 'That is quite good.' },

  // ===== C1 — Advanced (20 cards) =====
  { id: 'c1-n1', word: 'die Verantwortung', translation: 'responsibility', pos: 'noun', gender: 'f', level: 'C1', example: 'Ich übernehme die Verantwortung.', exampleEn: 'I take the responsibility.' },
  { id: 'c1-n2', word: 'die Auseinandersetzung', translation: 'confrontation/discussion', pos: 'noun', gender: 'f', level: 'C1', example: 'Die Auseinandersetzung war intensiv.', exampleEn: 'The discussion was intense.' },
  { id: 'c1-n3', word: 'die Berücksichtigung', translation: 'consideration', pos: 'noun', gender: 'f', level: 'C1', example: 'Unter Berücksichtigung von...', exampleEn: 'Taking into consideration...' },
  { id: 'c1-n4', word: 'die Kenntnis', translation: 'knowledge (formal)', pos: 'noun', gender: 'f', level: 'C1', example: 'Ich habe gute Kenntnisse.', exampleEn: 'I have good knowledge.' },
  { id: 'c1-n5', word: 'die Förderung', translation: 'support/promotion', pos: 'noun', gender: 'f', level: 'C1', example: 'Die Förderung der Bildung.', exampleEn: 'The promotion of education.' },
  { id: 'c1-v1', word: 'gewährleisten', translation: 'to ensure', pos: 'verb', level: 'C1', example: 'Wir gewährleisten die Qualität.', exampleEn: 'We ensure the quality.' },
  { id: 'c1-v2', word: 'sich auseinandersetzen mit', translation: 'to engage with/deal with', pos: 'verb', level: 'C1', example: 'Ich setze mich damit auseinander.', exampleEn: 'I engage with it.' },
  { id: 'c1-v3', word: 'in Frage stellen', translation: 'to question', pos: 'verb', level: 'C1', example: 'Ich stelle das in Frage.', exampleEn: 'I question that.' },
  { id: 'c1-v4', word: 'etwas unternehmen', translation: 'to take action', pos: 'verb', level: 'C1', example: 'Wir müssen etwas unternehmen.', exampleEn: 'We must take action.' },
  { id: 'c1-v5', word: 'zur Verfügung stellen', translation: 'to provide', pos: 'verb', level: 'C1', example: 'Ich stelle Ihnen die Daten zur Verfügung.', exampleEn: 'I provide you the data.' },
  // C1 register / advanced adverbs
  { id: 'c1-r1', word: 'folglich', translation: 'consequently', pos: 'adv', level: 'C1', example: 'Folg lich müssen wir handeln.', exampleEn: 'Consequently we must act.' },
  { id: 'c1-r2', word: 'infolgedessen', translation: 'as a result', pos: 'adv', level: 'C1', example: 'Infolgedessen steigen die Preise.', exampleEn: 'As a result, prices rise.' },
  { id: 'c1-r3', word: 'demzufolge', translation: 'accordingly', pos: 'adv', level: 'C1', example: 'Demzufolge ist es richtig.', exampleEn: 'Accordingly, it is correct.' },
  { id: 'c1-r4', word: 'zweifellos', translation: 'undoubtedly', pos: 'adv', level: 'C1', example: 'Zweifellos ist das wichtig.', exampleEn: 'Undoubtedly that is important.' },
  { id: 'c1-r5', word: 'keineswegs', translation: 'by no means', pos: 'adv', level: 'C1', example: 'Das ist keineswegs einfach.', exampleEn: 'That is by no means easy.' },
];

function newCard(c: Omit<VocabCard, 'interval' | 'repetition' | 'ef' | 'due' | 'lapses' | 'totalReviews' | 'correctReviews'>): VocabCard {
  return {
    ...c,
    interval: 0,
    repetition: 0,
    ef: 2.5,
    due: Date.now(),
    lapses: 0,
    totalReviews: 0,
    correctReviews: 0,
  };
}

// SM-2 quality scale: 0 = Again (failure), 3 = Hard, 4 = Good, 5 = Easy
function applySM2(card: VocabCard, quality: number): VocabCard {
  const q = Math.max(0, Math.min(5, quality));
  const newCard = { ...card };

  newCard.totalReviews += 1;
  if (q >= 3) newCard.correctReviews += 1;

  if (q < 3) {
    // Failed — reset
    newCard.repetition = 0;
    newCard.interval = 1; // 1 day
    newCard.lapses += 1;
  } else {
    // Passed
    if (newCard.repetition === 0) {
      newCard.interval = 1;
    } else if (newCard.repetition === 1) {
      newCard.interval = 6;
    } else {
      newCard.interval = Math.round(newCard.interval * newCard.ef);
    }
    newCard.repetition += 1;
  }

  // Update easiness factor
  newCard.ef = Math.max(1.3, newCard.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  newCard.due = Date.now() + newCard.interval * 24 * 60 * 60 * 1000;
  newCard.lastReviewed = Date.now();

  return newCard;
}

export default function WoerterPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [cards, setCards] = useState<VocabCard[]>([]);
  const [reviewed, setReviewed] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [supportsTTS, setSupportsTTS] = useState(false);
  const [ttsError, setTTSError] = useState<string | null>(null);
  const [germanVoices, setGermanVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [deVoice, setDeVoice] = useState<string>('');
  const [activeLevel, setActiveLevel] = useState<'all' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1'>('all');

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('dein-deutsch-theme');
    if (savedTheme === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupportsTTS(true);
      const loadVoices = () => {
        const all = window.speechSynthesis.getVoices();
        const de = all.filter(v => v.lang && v.lang.toLowerCase().startsWith('de'));
        setGermanVoices(de);
        if (de.length > 0 && !deVoice) {
          const prefer = de.find(v => v.lang === 'de-DE') || de[0];
          setDeVoice(prefer.name);
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Load or seed
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCards(parsed);
      } catch (e) {
        setCards(SEED_VOCAB.map(newCard));
      }
    } else {
      setCards(SEED_VOCAB.map(newCard));
    }
  }, []);

  function save(next: VocabCard[]) {
    setCards(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  // Get due cards, sorted by overdue
  const dueCards = useMemo(() => {
    const now = Date.now();
    return cards
      .filter(c => c.due <= now && (activeLevel === 'all' || c.level === activeLevel))
      .sort((a, b) => a.due - b.due);
  }, [cards, activeLevel]);

  const currentCard = dueCards[0];

  function speak(de: string) {
    if (!supportsTTS) {
      console.error('[TTS] speechSynthesis not supported in this browser');
      setTTSError('Your browser does not support text-to-speech. Try Chrome or Edge.');
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(de);
      u.lang = 'de-DE';
      u.rate = 0.85;
      if (deVoice) {
        const v = window.speechSynthesis.getVoices().find(x => x.name === deVoice);
        if (v) u.voice = v;
      }
      u.onerror = (e: any) => {
        console.error('[TTS] error:', e);
        setTTSError('Could not play audio. Check German voice is installed (see Help).');
      };
      const utterance = u;
      window.speechSynthesis.speak(utterance);
      // Check if voices are loaded yet — sometimes you need to wait
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        setTTSError('Loading voices... try again in a second.');
      }
    } catch (e: any) {
      console.error('[TTS] exception:', e);
      setTTSError('Audio error: ' + (e?.message || 'unknown'));
    }
  }

  function rate(quality: number) {
    if (!currentCard) return;
    const updated = cards.map(c => (c.id === currentCard.id ? applySM2(c, quality) : c));
    save(updated);
    setReviewed(r => r + 1);
    if (quality >= 3) setCorrectCount(c => c + 1);
    setShowAnswer(false);
    if (quality < 3 && updated[0].lapses > 0) {
      // Card will be retested soon
    }
    // After advancing the card, check if more due
    const now = Date.now();
    const stillDue = updated.filter(c => c.due <= now);
    if (stillDue.length === 0) {
      setSessionDone(true);
    }
    trackEvent('vocab');
  }

  function addCustomCard(word: string, translation: string, example: string) {
    const card: Omit<VocabCard, 'interval' | 'repetition' | 'ef' | 'due' | 'lapses' | 'totalReviews' | 'correctReviews'> = {
      id: 'custom-' + Date.now(),
      word,
      translation,
      pos: 'custom',
      level: 'A1',
      example: example || word,
      exampleEn: translation,
    };
    save([...cards, newCard(card)]);
    setShowAddCard(false);
  }

  // Stats
  const stats = useMemo(() => {
    const total = cards.length;
    const learning = cards.filter(c => c.repetition < 3).length;
    const known = cards.filter(c => c.repetition >= 3 && c.interval >= 21).length;
    const mastered = cards.filter(c => c.interval >= 90).length;
    const avgAccuracy = reviewed > 0 ? Math.round((correctCount / reviewed) * 100) : 0;
    return { total, learning, known, mastered, avgAccuracy };
  }, [cards, reviewed, correctCount]);

  if (!mounted) return null;
  const t = getTheme(theme);

  // Empty state
  if (cards.length === 0) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: 760, margin: '0 auto', padding: 40, textAlign: 'center' }}>
        <Link href="/" style={{ color: t.textMuted, textDecoration: 'none', fontFamily: FONTS.reading }}>← zurück</Link>
        <h1 style={{ fontFamily: FONTS.display, fontSize: '2rem', color: t.text, marginTop: 20 }}>Loading vocabulary…</h1>
      </div>
    );
  }

  // Session complete
  if (sessionDone || !currentCard) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: 760, margin: '0 auto' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', color: t.textMuted, textDecoration: 'none', marginBottom: 16, fontFamily: FONTS.reading, fontStyle: 'italic' }}>
          ← zurück zum Haus
        </Link>

        <div style={{
          background: t.accentSoft, border: '1px solid ' + t.accent,
          borderRadius: 12, padding: 40, textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🌿</div>
          <h1 style={{ fontFamily: FONTS.display, fontSize: '2rem', color: t.text, margin: '0 0 8px' }}>
            Session abgeschlossen!
          </h1>
          <p style={{ fontFamily: FONTS.reading, fontSize: '1.1rem', color: t.textMuted, fontStyle: 'italic', margin: '0 0 24px' }}>
            Keine Karten mehr heute. Komm morgen wieder.
          </p>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12,
            maxWidth: 600, margin: '0 auto 24px',
          }}>
            <Metric label="Überprüft" value={reviewed} t={t} />
            <Metric label="Richtig" value={correctCount} t={t} highlight />
            <Metric label="Genauigkeit" value={stats.avgAccuracy + '%'} t={t} />
            <Metric label="Mastered" value={stats.mastered + ' von ' + stats.total} t={t} />
          </div>

          <Link href="/" style={{
            display: 'inline-block', padding: '12px 24px',
            background: t.accent, color: t.onAccent, borderRadius: 8,
            textDecoration: 'none', fontWeight: 600,
            boxShadow: '0 4px 0 ' + t.accentHover,
          }}>
            Zurück zum Haus →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: 760, margin: '0 auto' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', color: t.textMuted, textDecoration: 'none', marginBottom: 16, fontFamily: FONTS.reading, fontStyle: 'italic' }}>
        ← zurück zum Haus
      </Link>

      {/* Header */}
      <div style={{
        background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 12,
        padding: 20, marginBottom: 16, boxShadow: t.shadow,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
              Wörter · Spaced Repetition
            </div>
            <h1 style={{ fontFamily: FONTS.display, fontSize: '1.8rem', fontWeight: 700, color: t.text, margin: 0, letterSpacing: '-0.02em' }}>
              Heute lernen
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setShowAddCard(!showAddCard)} style={{
              padding: '6px 12px', background: t.bg, color: t.text,
              border: '1px solid ' + t.border, borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem',
            }}>
              + Karte
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: '0.85rem', color: t.textMuted, fontFamily: FONTS.reading, flexWrap: 'wrap' }}>
          <span><strong style={{ color: t.text }}>{dueCards.length}</strong> fällig</span>
          <span><strong style={{ color: t.accent }}>{reviewed}</strong> überprüft</span>
          <span>Accuracy: <strong style={{ color: t.success }}>{stats.avgAccuracy}%</strong></span>
          <span>Mastered: <strong style={{ color: t.accent }}>{stats.mastered}/{stats.total}</strong></span>
        </div>

        {/* Level filter chips */}
        <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
          {(['all', 'A1', 'A2', 'B1', 'B2', 'C1'] as const).map(lvl => {
            const count = lvl === 'all' ? cards.length : cards.filter(c => c.level === lvl).length;
            const active = activeLevel === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setActiveLevel(lvl)}
                style={{
                  padding: '5px 12px', borderRadius: 999,
                  border: '1px solid ' + (active ? t.accent : t.border),
                  background: active ? t.accent : t.bg,
                  color: active ? t.onAccent : t.textMuted,
                  fontSize: '0.8rem', fontWeight: active ? 700 : 500,
                  cursor: 'pointer', fontFamily: FONTS.body,
                  letterSpacing: '0.05em',
                }}
              >
                {lvl === 'all' ? 'Alle' : lvl} <span style={{ opacity: 0.7, marginLeft: 4, fontSize: '0.7rem' }}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add custom card form */}
      {showAddCard && (
        <AddCardForm onAdd={addCustomCard} onClose={() => setShowAddCard(false)} t={t} />
      )}

      {/* Active card */}
      <div style={{
        background: t.cardBg, border: '2px solid ' + t.accent,
        borderRadius: 16, padding: 40, marginBottom: 20,
        boxShadow: t.shadowStrong, minHeight: 360,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          padding: '4px 10px', background: t.accentSoft, color: t.accent,
          borderRadius: 4, fontSize: '0.75rem', fontWeight: 700, marginBottom: 12,
        }}>
          {currentCard.level} · {currentCard.pos}
          {currentCard.gender && <span> · {currentCard.gender === 'm' ? 'der' : currentCard.gender === 'f' ? 'die' : 'das'}</span>}
        </div>

        <div style={{
          fontFamily: FONTS.display, fontSize: '3.5rem', fontWeight: 700,
          color: t.text, marginBottom: 8, textAlign: 'center', letterSpacing: '-0.02em',
        }}>
          {currentCard.word}
        </div>

        <button
          onClick={() => speak(currentCard.word)}
          disabled={!supportsTTS || germanVoices.length === 0}
          style={{
            marginTop: 8, padding: '6px 12px', background: 'transparent',
            color: t.accent, border: '1px solid ' + t.accent, borderRadius: 6,
            cursor: supportsTTS && germanVoices.length > 0 ? 'pointer' : 'not-allowed',
            fontSize: '0.85rem',
            fontFamily: FONTS.body,
          }}
          title={germanVoices.length === 0 ? 'No German voice installed' : 'Hear pronunciation'}
        >
          🔊 Anhören
        </button>
        {germanVoices.length === 0 && supportsTTS && (
          <div style={{ fontSize: '0.75rem', color: t.warning, marginTop: 8, fontStyle: 'italic', fontFamily: FONTS.reading }}>
            ⚠️ No German voice detected. Install one in your OS settings.
          </div>
        )}

        {/* Answer */}
        {showAnswer ? (
          <div style={{ marginTop: 24, textAlign: 'center', width: '100%', animation: 'fadeIn 0.3s' }}>
            <div style={{
              fontFamily: FONTS.display, fontSize: '2rem', color: t.accent, fontWeight: 600,
              marginBottom: 16,
            }}>
              {currentCard.translation}
            </div>

            <div style={{
              background: t.bg, border: '1px dashed ' + t.border,
              borderRadius: 8, padding: 16, marginBottom: 16,
            }}>
              <div style={{ fontFamily: FONTS.reading, fontSize: '1rem', color: t.text, marginBottom: 4 }}>
                {currentCard.example}
              </div>
              <div style={{ fontSize: '0.85rem', color: t.textMuted, fontStyle: 'italic', fontFamily: FONTS.reading }}>
                {currentCard.exampleEn}
              </div>
            </div>

            {/* Rating buttons */}
            <div style={{ fontSize: '0.75rem', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Wie gut erinnerst du dich?
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              <RateButton
                quality={0}
                label="Again"
                shortcut="1"
                detail="< 1d"
                color={t.error}
                onClick={() => rate(0)}
                t={t}
              />
              <RateButton
                quality={3}
                label="Hard"
                shortcut="2"
                detail={cardInterval(currentCard, 3)}
                color={t.warning}
                onClick={() => rate(3)}
                t={t}
              />
              <RateButton
                quality={4}
                label="Good"
                shortcut="3"
                detail={cardInterval(currentCard, 4)}
                color={t.accent}
                onClick={() => rate(4)}
                t={t}
              />
              <RateButton
                quality={5}
                label="Easy"
                shortcut="4"
                detail={cardInterval(currentCard, 5)}
                color={t.success}
                onClick={() => rate(5)}
                t={t}
              />
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAnswer(true)}
            style={{
              marginTop: 32, padding: '12px 32px',
              background: t.accent, color: t.onAccent,
              border: 'none', borderRadius: 10,
              fontSize: '1rem', fontWeight: 700,
              fontFamily: FONTS.display, letterSpacing: '0.05em',
              cursor: 'pointer', boxShadow: '0 4px 0 ' + t.accentHover,
            }}
          >
            Antwort zeigen · Space
          </button>
        )}
      </div>

      {/* Mastery progress bar */}
      <div style={{
        background: t.cardBg, border: '1px solid ' + t.border, borderRadius: 10,
        padding: 16, marginBottom: 16,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: '0.85rem', color: t.textMuted }}>
          <span>Mastery Progress</span>
          <span style={{ fontFamily: FONTS.mono }}>{stats.mastered} / {stats.total}</span>
        </div>
        <div style={{ height: 8, background: t.bg, borderRadius: 4, overflow: 'hidden', border: '1px solid ' + t.border }}>
          <div style={{
            height: '100%',
            width: ((stats.mastered / stats.total) * 100) + '%',
            background: 'linear-gradient(90deg, ' + t.accentLight + ', ' + t.accent + ')',
            transition: 'width 0.4s',
          }} />
        </div>
      </div>

      <p style={{ fontSize: '0.8rem', color: t.textFaint, fontFamily: FONTS.reading, fontStyle: 'italic', textAlign: 'center', marginTop: 16 }}>
        💡 Spaced repetition algorithm adjusts intervals based on how well you remembered.
        Buttons: <kbd style={{ background: t.bg, padding: '2px 6px', borderRadius: 3, fontFamily: FONTS.mono }}>1</kbd> Again · <kbd style={{ background: t.bg, padding: '2px 6px', borderRadius: 3, fontFamily: FONTS.mono }}>2</kbd> Hard · <kbd style={{ background: t.bg, padding: '2px 6px', borderRadius: 3, fontFamily: FONTS.mono }}>3</kbd> Good · <kbd style={{ background: t.bg, padding: '2px 6px', borderRadius: 3, fontFamily: FONTS.mono }}>4</kbd> Easy
      </p>
    </div>
  );
}

function cardInterval(card: VocabCard, q: number): string {
  const next = applySM2(card, q);
  const days = next.interval;
  if (days < 1) return '< 1d';
  if (days < 30) return days + 'd';
  if (days < 365) return Math.round(days / 30) + 'mo';
  return Math.round(days / 365) + 'y';
}

function RateButton({ label, shortcut, detail, color, onClick, t }: any) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: 12,
        background: hover ? color : 'transparent',
        color: hover ? '#FFF' : color,
        border: '2px solid ' + color,
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'all 0.15s',
        fontFamily: FONTS.body,
      }}
    >
      <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.2rem', fontWeight: 700, margin: '2px 0', fontFamily: FONTS.display }}>
        {shortcut}
      </div>
      <div style={{ fontSize: '0.7rem', opacity: 0.8, fontFamily: FONTS.mono }}>
        {detail}
      </div>
    </button>
  );
}

function Metric({ label, value, t, highlight }: any) {
  return (
    <div style={{
      background: highlight ? t.accentSoft : t.bg,
      border: '1px solid ' + (highlight ? t.accent : t.border),
      borderRadius: 8, padding: 12, textAlign: 'center',
    }}>
      <div style={{ fontSize: '0.65rem', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: FONTS.display, fontSize: '1.4rem', fontWeight: 700, color: highlight ? t.accent : t.text }}>{value}</div>
    </div>
  );
}

function AddCardForm({ onAdd, onClose, t }: any) {
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [example, setExample] = useState('');

  return (
    <div style={{
      background: t.bg, border: '1px solid ' + t.border,
      borderRadius: 10, padding: 16, marginBottom: 16,
    }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: t.text, marginBottom: 12 }}>
        Add custom card
      </div>
      <input
        type="text"
        placeholder="Deutsches Wort (e.g., die Tasche)"
        value={word}
        onChange={e => setWord(e.target.value)}
        style={{ width: '100%', marginBottom: 8, padding: 8, background: t.cardBg, color: t.text, border: '1px solid ' + t.border, borderRadius: 4 }}
      />
      <input
        type="text"
        placeholder="English translation"
        value={translation}
        onChange={e => setTranslation(e.target.value)}
        style={{ width: '100%', marginBottom: 8, padding: 8, background: t.cardBg, color: t.text, border: '1px solid ' + t.border, borderRadius: 4 }}
      />
      <textarea
        placeholder="Example sentence (optional)"
        value={example}
        onChange={e => setExample(e.target.value)}
        rows={2}
        style={{ width: '100%', marginBottom: 12, padding: 8, background: t.cardBg, color: t.text, border: '1px solid ' + t.border, borderRadius: 4, resize: 'vertical' }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => word.trim() && translation.trim() && onAdd(word.trim(), translation.trim(), example.trim())}
          style={{ padding: '8px 16px', background: t.accent, color: t.onAccent, border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
        >
          Save
        </button>
        <button onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', color: t.textMuted, border: '1px solid ' + t.border, borderRadius: 6, cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
