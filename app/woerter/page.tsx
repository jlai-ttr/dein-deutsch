'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FONTS, getTheme, CEFR_LEVELS } from '../lib/theme';
import { trackEvent } from '../lib/activity';
import { TOPIC_BUSINESS } from '../lib/topic-business';
import { useSheetVocab, mergeSheetIntoLocal } from '../lib/use-sheet-vocab';

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

const STORAGE_KEY = 'dein-deutsch-woerter-v3';

// Seed vocab — A1 starter pack (50 words across categories)
const SEED_VOCAB: Omit<VocabCard, 'interval' | 'repetition' | 'ef' | 'due' | 'lapses' | 'totalReviews' | 'correctReviews'>[] = [
  ...TOPIC_BUSINESS,
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

// ===== AUTO-GENERATED FREQUENCY DECK — Top 1000 German (OpenSubtitles 2018, hermitdave/FrequencyWords) =====
// Total: 902 cards. Rank 1-902. CEFR level assigned by rank.
// Levels: A1 (rank 1-100), A2 (101-300), B1 (301-600), B2 (601-850), C1 (851-1000).
  { id: 'freq-3', word: 'das', translation: 'the', pos: 'art', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-4', word: 'ist', translation: 'is', pos: 'verb', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-6', word: 'nicht', translation: 'not', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-7', word: 'die', translation: 'the', pos: 'art', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-8', word: 'es', translation: 'it', pos: 'pron', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-9', word: 'und', translation: 'and', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-10', word: 'der', translation: 'the', pos: 'art', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-12', word: 'was', translation: 'what', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-13', word: 'zu', translation: 'to', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-15', word: 'ein', translation: 'a', pos: 'art', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-18', word: 'mir', translation: 'me', pos: 'pron', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-19', word: 'mit', translation: 'with', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-20', word: 'wie', translation: 'how', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-21', word: 'den', translation: 'the', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-22', word: 'mich', translation: 'me', pos: 'pron', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-23', word: 'auf', translation: 'on', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-25', word: 'aber', translation: 'but', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-26', word: 'eine', translation: 'a', pos: 'art', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-27', word: 'so', translation: 'so', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-28', word: 'hat', translation: 'has', pos: 'verb', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-29', word: 'hier', translation: 'here', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-31', word: 'sind', translation: 'are', pos: 'verb', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-32', word: 'war', translation: 'was', pos: 'verb', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-33', word: 'von', translation: 'from', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-35', word: 'dich', translation: 'you', pos: 'pron', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-36', word: 'ihr', translation: 'you-pl', pos: 'pron', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-38', word: 'habe', translation: 'have', pos: 'verb', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-40', word: 'bin', translation: 'am', pos: 'verb', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-41', word: 'noch', translation: 'still/yet', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-42', word: 'nur', translation: 'only', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-43', word: 'da', translation: 'since', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-44', word: 'dir', translation: 'you', pos: 'pron', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-45', word: 'sich', translation: 'oneself', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-46', word: 'einen', translation: 'a', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-47', word: 'uns', translation: 'us', pos: 'pron', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-48', word: 'hast', translation: 'have', pos: 'verb', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-49', word: 'dem', translation: 'the', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-50', word: 'kann', translation: 'can', pos: 'verb', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-52', word: 'auch', translation: 'also', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-53', word: 'schon', translation: 'already', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-54', word: 'als', translation: 'when/as', pos: 'conj', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-56', word: 'mal', translation: 'time', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-58', word: 'ihn', translation: 'him', pos: 'pron', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-59', word: 'dann', translation: 'then', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-60', word: 'aus', translation: 'from', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-61', word: 'meine', translation: 'my', pos: 'noun', gender: 'f', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-62', word: 'um', translation: 'around', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-63', word: 'im', translation: 'in-the', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-64', word: 'wird', translation: 'becomes', pos: 'verb', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-65', word: 'mein', translation: 'my', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-66', word: 'bist', translation: 'are', pos: 'verb', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-67', word: 'doch', translation: 'but', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-68', word: 'alles', translation: 'everything', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-69', word: 'keine', translation: 'no', pos: 'noun', gender: 'f', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-70', word: 'oder', translation: 'or', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-71', word: 'nach', translation: 'after', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-73', word: 'nichts', translation: 'nothing', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-74', word: 'man', translation: 'one', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-75', word: 'muss', translation: 'must', pos: 'verb', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-76', word: 'werden', translation: 'to-become', pos: 'verb', level: 'A1', example: 'Ich werde müde.', exampleEn: 'I am getting tired.' },
  { id: 'freq-77', word: 'will', translation: 'wants', pos: 'verb', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-78', word: 'ihnen', translation: 'them', pos: 'pron', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-79', word: 'geht', translation: 'goes', pos: 'verb', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-80', word: 'wo', translation: 'where', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-81', word: 'etwas', translation: 'something', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-82', word: 'oh', translation: 'oh', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-83', word: 'mehr', translation: 'more', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-84', word: 'bei', translation: 'at', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-85', word: 'also', translation: 'so', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-87', word: 'immer', translation: 'always', pos: 'noun', gender: 'm', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-88', word: 'hab', translation: 'have', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-89', word: 'warum', translation: 'why', pos: 'noun', gender: 'n', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-90', word: 'vor', translation: 'before', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-91', word: 'los', translation: 'go', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-92', word: 'wieder', translation: 'again', pos: 'noun', gender: 'm', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-93', word: 'sagen', translation: 'say', pos: 'verb', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-96', word: 'sehr', translation: 'very', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-97', word: 'alle', translation: 'all', pos: 'noun', gender: 'f', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-98', word: 'denn', translation: 'because', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-99', word: 'mann', translation: 'man', pos: 'noun', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-100', word: 'tun', translation: 'do', pos: 'verb', level: 'A1', example: '', exampleEn: '' },
  { id: 'freq-101', word: 'ihm', translation: 'him', pos: 'pron', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-102', word: 'zum', translation: 'to-the', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-104', word: 'sehen', translation: 'see', pos: 'verb', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-105', word: 'vielleicht', translation: 'maybe', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-106', word: 'einem', translation: 'one', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-107', word: 'wer', translation: 'who', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-108', word: 'ihre', translation: 'her', pos: 'noun', gender: 'f', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-109', word: 'diese', translation: 'this', pos: 'noun', gender: 'f', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-110', word: 'euch', translation: 'you', pos: 'pron', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-111', word: 'einer', translation: 'one', pos: 'noun', gender: 'm', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-112', word: 'komm', translation: 'come', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-113', word: 'gibt', translation: 'gives', pos: 'verb', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-114', word: 'okay', translation: 'okay', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-115', word: 'wissen', translation: 'know', pos: 'verb', level: 'A2', example: 'Ich weiß es nicht.', exampleEn: 'I don\'t know it.' },
  { id: 'freq-116', word: 'deine', translation: 'your', pos: 'noun', gender: 'f', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-117', word: 'soll', translation: 'should', pos: 'verb', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-118', word: 'werde', translation: 'become', pos: 'verb', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-119', word: 'nie', translation: 'never', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-120', word: 'wirklich', translation: 'really', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-121', word: 'hey', translation: 'hey', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-122', word: 'kein', translation: 'no', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-123', word: 'viel', translation: 'much', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-124', word: 'weg', translation: 'way', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-125', word: 'tut', translation: 'does', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-126', word: 'am', translation: 'on-the', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-127', word: 'des', translation: 'of-the', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-128', word: 'einfach', translation: 'simply', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-129', word: 'leben', translation: 'life', pos: 'verb', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-130', word: 'hatte', translation: 'had', pos: 'verb', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-131', word: 'zeit', translation: 'time', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-133', word: 'willst', translation: 'want', pos: 'verb', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-135', word: 'dein', translation: 'your', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-137', word: 'kommt', translation: 'comes', pos: 'verb', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-138', word: 'wollen', translation: 'want', pos: 'verb', level: 'A2', example: 'Ich will nach Hause.', exampleEn: 'I want to go home.' },
  { id: 'freq-139', word: 'damit', translation: 'so-that', pos: 'conj', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-140', word: 'ganz', translation: 'completely', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-141', word: 'wollte', translation: 'wanted', pos: 'verb', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-142', word: 'ok', translation: 'ok', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-143', word: 'sicher', translation: 'sure', pos: 'noun', gender: 'm', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-144', word: 'gesagt', translation: 'said', pos: 'verb', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-145', word: 'frau', translation: 'woman', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-146', word: 'nun', translation: 'now', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-147', word: 'bis', translation: 'until', pos: 'conj', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-148', word: 'wurde', translation: 'was', pos: 'verb', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-149', word: 'leid', translation: 'sorry', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-150', word: 'na', translation: 'well', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-151', word: 'kannst', translation: 'can', pos: 'verb', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-152', word: 'macht', translation: 'makes', pos: 'verb', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-153', word: 'dieser', translation: 'this', pos: 'noun', gender: 'm', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-154', word: 'lassen', translation: 'let', pos: 'noun', level: 'A2', example: 'Lass mich in Ruhe!', exampleEn: 'Leave me alone!' },
  { id: 'freq-156', word: 'meinen', translation: 'my', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-157', word: 'gott', translation: 'god', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-158', word: 'seine', translation: 'his', pos: 'noun', gender: 'f', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-160', word: 'genau', translation: 'exactly', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-161', word: 'waren', translation: 'were', pos: 'verb', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-162', word: 'zur', translation: 'to-the', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-163', word: 'lass', translation: 'let', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-164', word: 'klar', translation: 'clear', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-166', word: 'leute', translation: 'people', pos: 'noun', gender: 'f', level: 'A2', example: 'Die Leute sind freundlich.', exampleEn: 'The people are friendly.' },
  { id: 'freq-167', word: 'vater', translation: 'father', pos: 'noun', gender: 'm', level: 'A2', example: 'Mein Vater arbeitet in Berlin.', exampleEn: 'My father works in Berlin.' },
  { id: 'freq-168', word: 'glaube', translation: 'believe', pos: 'noun', gender: 'f', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-169', word: 'ab', translation: 'from', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-170', word: 'gerade', translation: 'just', pos: 'noun', gender: 'f', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-171', word: 'tag', translation: 'day', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-172', word: 'gesehen', translation: 'seen', pos: 'verb', level: 'A2', example: 'Ich habe dich gesehen.', exampleEn: 'I saw you.' },
  { id: 'freq-173', word: 'reden', translation: 'talk', pos: 'verb', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-174', word: 'wohl', translation: 'well', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-175', word: 'liebe', translation: 'love', pos: 'noun', gender: 'f', level: 'A2', example: 'Liebe ist alles.', exampleEn: 'Love is everything.' },
  { id: 'freq-176', word: 'sollte', translation: 'should', pos: 'verb', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-177', word: 'sagte', translation: 'said', pos: 'verb', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-178', word: 'unsere', translation: 'our', pos: 'noun', gender: 'f', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-179', word: 'jemand', translation: 'someone', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-180', word: 'geld', translation: 'money', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-181', word: 'durch', translation: 'through', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-182', word: 'ob', translation: 'whether', pos: 'conj', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-183', word: 'keinen', translation: 'no', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-184', word: 'mutter', translation: 'mother', pos: 'noun', gender: 'm', level: 'A2', example: 'Meine Mutter kocht gut.', exampleEn: 'My mother cooks well.' },
  { id: 'freq-185', word: 'raus', translation: 'out', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-186', word: 'gemacht', translation: 'made', pos: 'verb', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-187', word: 'paar', translation: 'couple', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-188', word: 'mach', translation: 'make', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-189', word: 'passiert', translation: 'happened', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-190', word: 'dachte', translation: 'thought', pos: 'verb', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-191', word: 'besser', translation: 'better', pos: 'noun', gender: 'm', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-192', word: 'musst', translation: 'must', pos: 'verb', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-193', word: 'wieso', translation: 'why', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-195', word: 'dieses', translation: 'this', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-196', word: 'selbst', translation: 'self', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-197', word: 'ohne', translation: 'without', pos: 'noun', gender: 'f', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-198', word: 'her', translation: 'here', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-199', word: 'sag', translation: 'say', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-200', word: 'meiner', translation: 'my', pos: 'noun', gender: 'm', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-201', word: 'anderen', translation: 'other', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-202', word: 'helfen', translation: 'help', pos: 'verb', level: 'A2', example: 'Kannst du mir helfen?', exampleEn: 'Can you help me?' },
  { id: 'freq-203', word: 'nacht', translation: 'night', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-204', word: 'finden', translation: 'find', pos: 'verb', level: 'A2', example: 'Ich finde den Schlüssel nicht.', exampleEn: 'I can\'t find the key.' },
  { id: 'freq-205', word: 'diesen', translation: 'this', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-206', word: 'gute', translation: 'good', pos: 'noun', gender: 'f', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-207', word: 'wirst', translation: 'will', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-208', word: 'lange', translation: 'long', pos: 'noun', gender: 'f', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-209', word: 'ach', translation: 'oh', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-210', word: 'meinem', translation: 'my', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-211', word: 'gar', translation: 'at-all', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-212', word: 'ins', translation: 'in-the', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-213', word: 'sei', translation: 'be', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-214', word: 'dort', translation: 'there', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-215', word: 'weiter', translation: 'further', pos: 'noun', gender: 'm', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-216', word: 'geben', translation: 'give', pos: 'verb', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-217', word: 'seit', translation: 'since', pos: 'conj', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-218', word: 'gleich', translation: 'equal/right-away', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-219', word: 'sagt', translation: 'says', pos: 'verb', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-220', word: 'recht', translation: 'right', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-221', word: 'ihren', translation: 'their', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-222', word: 'richtig', translation: 'right', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-223', word: 'ordnung', translation: 'order', pos: 'noun', gender: 'f', level: 'A2', example: 'Räum dein Zimmer in Ordnung!', exampleEn: 'Tidy your room!' },
  { id: 'freq-224', word: 'vom', translation: 'from-the', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-225', word: 'sieht', translation: 'sees', pos: 'verb', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-226', word: 'davon', translation: 'of-it', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-227', word: 'geh', translation: 'go', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-228', word: 'diesem', translation: 'this', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-229', word: 'wegen', translation: 'because-of', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-230', word: 'hause', translation: 'home', pos: 'noun', gender: 'f', level: 'A2', example: 'Ich gehe nach Hause.', exampleEn: 'I go home.' },
  { id: 'freq-231', word: 'sollten', translation: 'should', pos: 'verb', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-232', word: 'hin', translation: 'there', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-233', word: 'sollen', translation: 'should', pos: 'verb', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-234', word: 'abend', translation: 'evening', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-235', word: 'haus', translation: 'house', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-236', word: 'denke', translation: 'think', pos: 'noun', gender: 'f', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-237', word: 'viele', translation: 'many', pos: 'noun', gender: 'f', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-239', word: 'deinen', translation: 'your', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-240', word: 'freund', translation: 'friend', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-241', word: 'guten', translation: 'good', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-242', word: 'unser', translation: 'our', pos: 'noun', gender: 'm', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-243', word: 'warte', translation: 'wait', pos: 'noun', gender: 'f', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-244', word: 'machst', translation: 'do', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-245', word: 'menschen', translation: 'people', pos: 'noun', gender: 'n', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-247', word: 'angst', translation: 'fear', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-248', word: 'bleiben', translation: 'stay', pos: 'verb', level: 'A2', example: 'Bleib bitte hier.', exampleEn: 'Please stay here.' },
  { id: 'freq-249', word: 'zusammen', translation: 'together', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-250', word: 'welt', translation: 'world', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-251', word: 'unter', translation: 'under', pos: 'noun', gender: 'm', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-252', word: 'habt', translation: 'have', pos: 'verb', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-254', word: 'andere', translation: 'other', pos: 'noun', gender: 'f', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-255', word: 'tot', translation: 'dead', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-256', word: 'getan', translation: 'done', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-257', word: 'darf', translation: 'may', pos: 'verb', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-258', word: 'erst', translation: 'first', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-259', word: 'rein', translation: 'in', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-260', word: 'stimmt', translation: 'correct', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-261', word: 'nehmen', translation: 'take', pos: 'verb', level: 'A2', example: 'Ich nehme den Zug.', exampleEn: 'I\'ll take the train.' },
  { id: 'freq-262', word: 'kinder', translation: 'children', pos: 'noun', gender: 'm', level: 'A2', example: 'Die Kinder spielen im Park.', exampleEn: 'The children play in the park.' },
  { id: 'freq-263', word: 'eines', translation: 'a', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-264', word: 'glauben', translation: 'believe', pos: 'verb', level: 'A2', example: 'Ich glaube dir.', exampleEn: 'I believe you.' },
  { id: 'freq-265', word: 'bringen', translation: 'bring', pos: 'verb', level: 'A2', example: 'Bring mir bitte ein Glas Wasser.', exampleEn: 'Please bring me a glass of water.' },
  { id: 'freq-266', word: 'ganze', translation: 'whole', pos: 'noun', gender: 'f', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-267', word: 'genug', translation: 'enough', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-268', word: 'brauchen', translation: 'need', pos: 'verb', level: 'A2', example: 'Ich brauche Hilfe.', exampleEn: 'I need help.' },
  { id: 'freq-269', word: 'gegen', translation: 'against', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-270', word: 'moment', translation: 'moment', pos: 'noun', gender: 'n', level: 'A2', example: 'Einen Moment bitte.', exampleEn: 'One moment please.' },
  { id: 'freq-271', word: 'junge', translation: 'boy', pos: 'noun', gender: 'f', level: 'A2', example: 'Der Junge liest ein Buch.', exampleEn: 'The boy is reading a book.' },
  { id: 'freq-272', word: 'steht', translation: 'stands', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-273', word: 'sonst', translation: 'else', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-274', word: 'musik', translation: 'music', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-275', word: 'arbeit', translation: 'work', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-276', word: 'seid', translation: 'are', pos: 'verb', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-277', word: 'ihrer', translation: 'her', pos: 'noun', gender: 'm', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-278', word: 'fragen', translation: 'ask', pos: 'verb', level: 'A2', example: 'Ich habe eine Frage.', exampleEn: 'I have a question.' },
  { id: 'freq-279', word: 'herr', translation: 'gentleman', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-280', word: 'dabei', translation: 'thereby', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-281', word: 'familie', translation: 'family', pos: 'noun', gender: 'f', level: 'A2', example: 'Meine Familie ist groß.', exampleEn: 'My family is big.' },
  { id: 'freq-282', word: 'warten', translation: 'wait', pos: 'verb', level: 'A2', example: 'Warte bitte einen Moment.', exampleEn: 'Please wait a moment.' },
  { id: 'freq-283', word: 'niemand', translation: 'nobody', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-284', word: 'sofort', translation: 'immediately', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-285', word: 'bevor', translation: 'before', pos: 'conj', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-286', word: 'jahre', translation: 'years', pos: 'noun', gender: 'f', level: 'A2', example: 'Drei Jahre sind lang.', exampleEn: 'Three years is a long time.' },
  { id: 'freq-287', word: 'einmal', translation: 'once', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-288', word: 'problem', translation: 'problem', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-289', word: 'sohn', translation: 'son', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-290', word: 'wann', translation: 'when', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-291', word: 'brauche', translation: 'need', pos: 'noun', gender: 'f', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-292', word: 'fertig', translation: 'ready', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-293', word: 'halt', translation: 'just/simply', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-294', word: 'allein', translation: 'alone', pos: 'noun', gender: 'n', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-295', word: 'beim', translation: 'at-the', pos: 'noun', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-297', word: 'beide', translation: 'both', pos: 'noun', gender: 'f', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-298', word: 'gefunden', translation: 'found', pos: 'verb', level: 'A2', example: 'Ich habe den Weg gefunden.', exampleEn: 'I found the way.' },
  { id: 'freq-299', word: 'hatten', translation: 'had', pos: 'verb', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-300', word: 'sache', translation: 'sache', pos: 'noun', gender: 'f', level: 'A2', example: '', exampleEn: '' },
  { id: 'freq-301', word: 'hilfe', translation: 'help', pos: 'noun', gender: 'f', level: 'B1', example: 'Ich brauche deine Hilfe.', exampleEn: 'I need your help.' },
  { id: 'freq-302', word: 'verdammt', translation: 'verdammt', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-303', word: 'ne', translation: 'ne', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-304', word: 'jeder', translation: 'every', pos: 'noun', gender: 'm', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-305', word: 'warst', translation: 'warst', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-306', word: 'gern', translation: 'gladly', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-307', word: 'konnte', translation: 'could', pos: 'verb', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-308', word: 'halten', translation: 'hold', pos: 'noun', level: 'B1', example: 'Halt den Ball fest!', exampleEn: 'Hold the ball tight!' },
  { id: 'freq-309', word: 'siehst', translation: 'see', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-310', word: 'verstehe', translation: 'verstehe', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-311', word: 'jahren', translation: 'years', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-312', word: 'kam', translation: 'came', pos: 'verb', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-313', word: 'kind', translation: 'child', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-314', word: 'wusste', translation: 'knew', pos: 'verb', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-315', word: 'wahr', translation: 'true', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-316', word: 'seinen', translation: 'his', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-317', word: 'dazu', translation: 'to-that', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-318', word: 'bruder', translation: 'brother', pos: 'noun', gender: 'm', level: 'B1', example: 'Mein Bruder heißt Tom.', exampleEn: 'My brother is called Tom.' },
  { id: 'freq-319', word: 'daran', translation: 'on-that', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-320', word: 'ihrem', translation: 'her', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-321', word: 'denken', translation: 'think', pos: 'verb', level: 'B1', example: 'Ich denke an dich.', exampleEn: 'I\'m thinking of you.' },
  { id: 'freq-322', word: 'dank', translation: 'dank', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-323', word: 'lieber', translation: 'rather', pos: 'noun', gender: 'm', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-324', word: 'fall', translation: 'fall', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-325', word: 'deiner', translation: 'your', pos: 'noun', gender: 'm', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-326', word: 'sehe', translation: 'see', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-327', word: 'egal', translation: 'egal', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-328', word: 'kennen', translation: 'know', pos: 'verb', level: 'B1', example: 'Kennst du ihn?', exampleEn: 'Do you know him?' },
  { id: 'freq-329', word: 'deinem', translation: 'your', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-330', word: 'vergessen', translation: 'forget', pos: 'verb', level: 'B1', example: 'Vergiss es nicht!', exampleEn: 'Don\'t forget it!' },
  { id: 'freq-331', word: 'frage', translation: 'question', pos: 'noun', gender: 'f', level: 'B1', example: 'Hast du eine Frage?', exampleEn: 'Do you have a question?' },
  { id: 'freq-332', word: 'mache', translation: 'do', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-333', word: 'komme', translation: 'come', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-334', word: 'sage', translation: 'say', pos: 'noun', gender: 'f', level: 'B1', example: 'Ich lerne Deutsch.', exampleEn: 'I\'m learning German.' },
  { id: 'freq-335', word: 'mag', translation: 'like', pos: 'verb', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-336', word: 'sieh', translation: 'sieh', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-337', word: 'echt', translation: 'real', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-338', word: 'gib', translation: 'give', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-340', word: 'jeden', translation: 'every', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-342', word: 'gab', translation: 'gave', pos: 'verb', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-343', word: 'uhr', translation: 'watch', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-344', word: 'stadt', translation: 'city', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-345', word: 'baby', translation: 'baby', pos: 'noun', level: 'B1', example: 'Meine Schwester ist zwanzig.', exampleEn: 'My sister is twenty.' },
  { id: 'freq-347', word: 'namen', translation: 'namen', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-348', word: 'bekommen', translation: 'get', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-349', word: 'kopf', translation: 'head', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-350', word: 'hi', translation: 'hi', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-351', word: 'gehe', translation: 'gehe', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-352', word: 'kleine', translation: 'kleine', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-353', word: 'letzte', translation: 'last', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-354', word: 'freunde', translation: 'freunde', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-356', word: 'all', translation: 'all', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-357', word: 'darauf', translation: 'on-that', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-358', word: 'ende', translation: 'end', pos: 'noun', gender: 'f', level: 'B1', example: 'Mein Freund kommt morgen.', exampleEn: 'My friend comes tomorrow.' },
  { id: 'freq-359', word: 'bald', translation: 'soon', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-360', word: 'dinge', translation: 'dinge', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-361', word: 'meinst', translation: 'meinst', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-362', word: 'toll', translation: 'great', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-364', word: 'minuten', translation: 'minutes', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-365', word: 'vielen', translation: 'vielen', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-366', word: 'bereit', translation: 'ready', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-367', word: 'weit', translation: 'far', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-368', word: 'ahnung', translation: 'ahnung', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-369', word: 'seiner', translation: 'his', pos: 'noun', gender: 'm', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-370', word: 'bisschen', translation: 'bisschen', pos: 'noun', gender: 'n', level: 'B1', example: 'Trinkst du einen Kaffee?', exampleEn: 'Do you drink a coffee?' },
  { id: 'freq-371', word: 'auto', translation: 'car', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-372', word: 'jungs', translation: 'jungs', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-373', word: 'eure', translation: 'your', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-374', word: 'augen', translation: 'eyes', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-375', word: 'polizei', translation: 'police', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-376', word: 'stehen', translation: 'stand', pos: 'verb', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-377', word: 'sterben', translation: 'die', pos: 'verb', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-378', word: 'kenne', translation: 'kenne', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-379', word: 'fast', translation: 'almost', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-380', word: 'runter', translation: 'down', pos: 'noun', gender: 'm', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-381', word: 'vorbei', translation: 'vorbei', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-382', word: 'treffen', translation: 'meet', pos: 'verb', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-383', word: 'gerne', translation: 'gladly', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-384', word: 'dran', translation: 'dran', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-385', word: 'wurden', translation: 'were', pos: 'verb', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-388', word: 'neue', translation: 'new', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-389', word: 'ging', translation: 'went', pos: 'verb', level: 'B1', example: 'Ich höre Musik.', exampleEn: 'I\'m listening to music.' },
  { id: 'freq-390', word: 'hinter', translation: 'behind', pos: 'noun', gender: 'm', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-391', word: 'sorgen', translation: 'sorgen', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-392', word: 'einzige', translation: 'einzige', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-393', word: 'jemanden', translation: 'someone', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-394', word: 'darum', translation: 'therefore', pos: 'noun', gender: 'n', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-395', word: 'tochter', translation: 'daughter', pos: 'noun', gender: 'm', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-396', word: 'braucht', translation: 'need', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-397', word: 'idee', translation: 'idea', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-398', word: 'schwester', translation: 'sister', pos: 'noun', gender: 'm', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-399', word: 'drin', translation: 'inside', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-400', word: 'ruhig', translation: 'calm', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-401', word: 'sah', translation: 'saw', pos: 'verb', level: 'B1', example: 'Ich gehe zur Schule.', exampleEn: 'I go to school.' },
  { id: 'freq-402', word: 'ganzen', translation: 'whole', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-405', word: 'name', translation: 'name', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-407', word: 'kurz', translation: 'short', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-408', word: 'kerl', translation: 'kerl', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-409', word: 'frauen', translation: 'frauen', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-410', word: 'liegt', translation: 'lies', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-411', word: 'suchen', translation: 'search', pos: 'verb', level: 'B1', example: 'Lerne jeden Tag ein Wort.', exampleEn: 'Learn one word every day.' },
  { id: 'freq-412', word: 'finde', translation: 'find', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-413', word: 'je', translation: 'je', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-414', word: 'woher', translation: 'where-from', pos: 'noun', gender: 'm', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-415', word: 'lang', translation: 'long', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-416', word: 'job', translation: 'job', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-417', word: 'keiner', translation: 'no', pos: 'noun', gender: 'm', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-418', word: 'seinem', translation: 'his', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-419', word: 'verstehen', translation: 'understand', pos: 'verb', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-420', word: 'spielen', translation: 'play', pos: 'verb', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-421', word: 'teufel', translation: 'teufel', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-422', word: 'verstanden', translation: 'verstanden', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-423', word: 'verloren', translation: 'lost', pos: 'noun', level: 'B1', example: 'Ich spiele Fußball.', exampleEn: 'I play football.' },
  { id: 'freq-424', word: 'hand', translation: 'hand', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-425', word: 'grund', translation: 'reason', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-426', word: 'jahr', translation: 'year', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-427', word: 'kommst', translation: 'kommst', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-429', word: 'ruhe', translation: 'ruhe', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-430', word: 'gewesen', translation: 'been', pos: 'verb', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-431', word: 'tod', translation: 'death', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-432', word: 'stunden', translation: 'stunden', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-433', word: 'hoffe', translation: 'hoffe', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-434', word: 'denkst', translation: 'denkst', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-435', word: 'oben', translation: 'oben', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-436', word: 'gestern', translation: 'yesterday', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-438', word: 'art', translation: 'kind', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-439', word: 'letzten', translation: 'last', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-440', word: 'schatz', translation: 'schatz', pos: 'noun', level: 'B1', example: 'Ich esse gern Pizza.', exampleEn: 'I like eating pizza.' },
  { id: 'freq-441', word: 'endlich', translation: 'finally', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-442', word: 'he', translation: 'he', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-443', word: 'nimm', translation: 'nimm', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-444', word: 'etwa', translation: 'etwa', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-445', word: 'schwer', translation: 'heavy', pos: 'noun', gender: 'm', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-446', word: 'anders', translation: 'anders', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-447', word: 'miss', translation: 'miss', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-448', word: 'musste', translation: 'had-to', pos: 'verb', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-449', word: 'wasser', translation: 'water', pos: 'noun', gender: 'm', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-450', word: 'erste', translation: 'first', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-451', word: 'versucht', translation: 'versucht', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-452', word: 'gekommen', translation: 'came', pos: 'verb', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-453', word: 'geschichte', translation: 'story', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-454', word: 'wenig', translation: 'little', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-455', word: 'holen', translation: 'to-fetch', pos: 'verb', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-456', word: 'bedeutet', translation: 'means', pos: 'noun', level: 'B1', example: 'Ich öffne die Tür.', exampleEn: 'I open the door.' },
  { id: 'freq-457', word: 'nett', translation: 'nice', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-458', word: 'wahrheit', translation: 'wahrheit', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-459', word: 'woche', translation: 'week', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-460', word: 'bringt', translation: 'brings', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-462', word: 'welche', translation: 'which', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-463', word: 'bestimmt', translation: 'certainly', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-464', word: 'hoch', translation: 'high', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-465', word: 'alter', translation: 'age', pos: 'noun', gender: 'm', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-466', word: 'sagst', translation: 'say', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-467', word: 'schau', translation: 'schau', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-468', word: 'ah', translation: 'ah', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-469', word: 'land', translation: 'country', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-470', word: 'zimmer', translation: 'room', pos: 'noun', gender: 'm', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-471', word: 'wagen', translation: 'wagen', pos: 'noun', level: 'B1', example: 'Schließe das Fenster!', exampleEn: 'Close the window!' },
  { id: 'freq-472', word: 'vier', translation: 'four', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-473', word: 'gefallen', translation: 'pleased', pos: 'verb', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-474', word: 'niemals', translation: 'never', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-475', word: 'schuld', translation: 'debt', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-476', word: 'wollten', translation: 'wanted', pos: 'verb', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-477', word: 'verlassen', translation: 'leave', pos: 'verb', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-478', word: 'zeigen', translation: 'show', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-479', word: 'beste', translation: 'best', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-480', word: 'ernst', translation: 'serious', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-481', word: 'unserer', translation: 'our', pos: 'noun', gender: 'm', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-482', word: 'denen', translation: 'denen', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-483', word: 'ort', translation: 'place', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-484', word: 'bleibt', translation: 'bleibt', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-486', word: 'glaubst', translation: 'glaubst', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-487', word: 'seite', translation: 'page', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-488', word: 'lasst', translation: 'lasst', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-489', word: 'zwischen', translation: 'between', pos: 'noun', gender: 'n', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-490', word: 'eben', translation: 'eben', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-491', word: 'spiel', translation: 'spiel', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-492', word: 'nehme', translation: 'nehme', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-493', word: 'ersten', translation: 'first', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-494', word: 'guter', translation: 'good', pos: 'noun', gender: 'm', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-495', word: 'chance', translation: 'chance', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-496', word: 'freundin', translation: 'girlfriend', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-497', word: 'krieg', translation: 'war', pos: 'noun', level: 'B1', example: 'Ich wohne in München.', exampleEn: 'I live in Munich.' },
  { id: 'freq-498', word: 'kleinen', translation: 'small', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-499', word: 'anderes', translation: 'anderes', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-500', word: 'tage', translation: 'days', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-501', word: 'entschuldigen', translation: 'entschuldigen', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-503', word: 'gehst', translation: 'go', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-504', word: 'allen', translation: 'all', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-505', word: 'bett', translation: 'bed', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-506', word: 'sachen', translation: 'sachen', pos: 'noun', gender: 'n', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-509', word: 'schule', translation: 'school', pos: 'noun', gender: 'f', level: 'B1', example: 'Ich fahre nach Berlin.', exampleEn: 'I\'m driving to Berlin.' },
  { id: 'freq-510', word: 'entschuldigung', translation: 'entschuldigung', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-511', word: 'wort', translation: 'word', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-513', word: 'typ', translation: 'type', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-514', word: 'schlafen', translation: 'sleep', pos: 'verb', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-515', word: 'tu', translation: 'tu', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-516', word: 'euer', translation: 'your', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-518', word: 'gesicht', translation: 'face', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-519', word: 'falls', translation: 'in-case', pos: 'conj', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-520', word: 'neuen', translation: 'neuen', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-521', word: 'unten', translation: 'unten', pos: 'noun', level: 'B1', example: 'Ich gehe ins Kino.', exampleEn: 'I\'m going to the cinema.' },
  { id: 'freq-522', word: 'teil', translation: 'teil', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-523', word: 'beiden', translation: 'both', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-524', word: 'mensch', translation: 'person', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-525', word: 'kleiner', translation: 'kleiner', pos: 'noun', gender: 'm', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-526', word: 'stellen', translation: 'stellen', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-527', word: 'oft', translation: 'often', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-528', word: 'sorge', translation: 'sorge', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-529', word: 'gedacht', translation: 'thought', pos: 'verb', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-530', word: 'tust', translation: 'do', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-532', word: 'einige', translation: 'some', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-533', word: 'dies', translation: 'dies', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-534', word: 'ding', translation: 'thing', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-535', word: 'unseren', translation: 'our', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-536', word: 'kriegen', translation: 'get', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-537', word: 'blut', translation: 'blood', pos: 'noun', level: 'B1', example: 'Mein Name ist Anna.', exampleEn: 'My name is Anna.' },
  { id: 'freq-538', word: 'ehrlich', translation: 'honest', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-539', word: 'eltern', translation: 'parents', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-540', word: 'scheint', translation: 'seems', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-541', word: 'herz', translation: 'heart', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-543', word: 'alte', translation: 'old', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-545', word: 'bleib', translation: 'stay', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-546', word: 'wiedersehen', translation: 'wiedersehen', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-547', word: 'frei', translation: 'free', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-548', word: 'wen', translation: 'wen', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-549', word: 'drauf', translation: 'drauf', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-550', word: 'irgendwie', translation: 'somehow', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-551', word: 'reicht', translation: 'reicht', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-552', word: 'fest', translation: 'firm', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-553', word: 'besten', translation: 'best', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-554', word: 'waffe', translation: 'weapon', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-555', word: 'kaum', translation: 'hardly', pos: 'noun', gender: 'n', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-556', word: 'irgendwas', translation: 'irgendwas', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-557', word: 'klingt', translation: 'sounds', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-558', word: 'platz', translation: 'place', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-559', word: 'brauchst', translation: 'brauchst', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-560', word: 'rede', translation: 'rede', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-562', word: 'falsch', translation: 'wrong', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-563', word: 'sondern', translation: 'but-rather', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-564', word: 'alten', translation: 'alten', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-565', word: 'nummer', translation: 'number', pos: 'noun', gender: 'm', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-566', word: 'jungen', translation: 'jungen', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-567', word: 'wohin', translation: 'where-to', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-568', word: 'setzen', translation: 'sit', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-569', word: 'zuerst', translation: 'first', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-570', word: 'wahrscheinlich', translation: 'probably', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-571', word: 'jede', translation: 'every', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-572', word: 'arsch', translation: 'arsch', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-573', word: 'telefon', translation: 'phone', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-574', word: 'tue', translation: 'tue', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-575', word: 'kennst', translation: 'kennst', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-576', word: 'willkommen', translation: 'willkommen', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-577', word: 'plan', translation: 'plan', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-578', word: 'retten', translation: 'save', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-579', word: 'hierher', translation: 'here', pos: 'noun', gender: 'm', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-580', word: 'bring', translation: 'bring', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-581', word: 'fehler', translation: 'fehler', pos: 'noun', gender: 'm', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-582', word: 'wollt', translation: 'wollt', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-583', word: 'dollar', translation: 'dollar', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-584', word: 'zehn', translation: 'ten', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-585', word: 'allem', translation: 'all', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-587', word: 'stunde', translation: 'hour', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-588', word: 'gegeben', translation: 'gegeben', pos: 'verb', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-589', word: 'menge', translation: 'menge', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-591', word: 'bereits', translation: 'bereits', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-592', word: 'wartet', translation: 'wartet', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-593', word: 'sechs', translation: 'six', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-594', word: 'lieben', translation: 'love', pos: 'verb', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-595', word: 'meines', translation: 'my', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-596', word: 'gebe', translation: 'gebe', pos: 'noun', gender: 'f', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-597', word: 'wochen', translation: 'weeks', pos: 'noun', gender: 'n', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-598', word: 'ruf', translation: 'reputation', pos: 'noun', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-599', word: 'schaffen', translation: 'to-manage', pos: 'verb', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-600', word: 'leider', translation: 'unfortunately', pos: 'noun', gender: 'm', level: 'B1', example: '', exampleEn: '' },
  { id: 'freq-602', word: 'doktor', translation: 'doctor', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-603', word: 'tja', translation: 'well', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-605', word: 'voll', translation: 'full', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-607', word: 'hund', translation: 'dog', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-608', word: 'geworden', translation: 'geworden', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-609', word: 'direkt', translation: 'directly', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-610', word: 'wolltest', translation: 'wanted', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-611', word: 'tat', translation: 'tat', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-612', word: 'denkt', translation: 'thinks', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-613', word: 'schiff', translation: 'ship', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-614', word: 'neues', translation: 'neues', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-615', word: 'wem', translation: 'wem', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-616', word: 'danach', translation: 'afterwards', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-617', word: 'funktioniert', translation: 'funktioniert', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-618', word: 'hattest', translation: 'hattest', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-620', word: 'deswegen', translation: 'therefore', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-621', word: 'wow', translation: 'wow', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-622', word: 'nennen', translation: 'nennen', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-623', word: 'hm', translation: 'hm', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-624', word: 'feuer', translation: 'fire', pos: 'noun', gender: 'm', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-626', word: 'alleine', translation: 'alone', pos: 'noun', gender: 'f', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-627', word: 'erinnern', translation: 'remember', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-628', word: 'kleines', translation: 'kleines', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-629', word: 'stelle', translation: 'place', pos: 'noun', gender: 'f', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-630', word: 'kumpel', translation: 'kumpel', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-631', word: 'verlieren', translation: 'lose', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-632', word: 'probleme', translation: 'probleme', pos: 'noun', gender: 'f', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-633', word: 'spricht', translation: 'speaks', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-634', word: 'kaffee', translation: 'coffee', pos: 'noun', gender: 'f', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-635', word: 'luft', translation: 'air', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-636', word: 'fand', translation: 'found', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-638', word: 'entschuldige', translation: 'entschuldige', pos: 'noun', gender: 'f', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-639', word: 'ziehen', translation: 'pull', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-640', word: 'verschwinden', translation: 'to-disappear', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-641', word: 'seht', translation: 'seht', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-642', word: 'eigenen', translation: 'eigenen', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-643', word: 'richtige', translation: 'richtige', pos: 'noun', gender: 'f', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-644', word: 'unserem', translation: 'our', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-645', word: 'suche', translation: 'search', pos: 'noun', gender: 'f', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-646', word: 'zwar', translation: 'indeed', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-647', word: 'hol', translation: 'hol', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-648', word: 'buch', translation: 'book', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-649', word: 'krank', translation: 'sick', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-650', word: 'jedes', translation: 'every', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-651', word: 'verstehst', translation: 'verstehst', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-652', word: 'wert', translation: 'value', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-653', word: 'arzt', translation: 'doctor', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-654', word: 'froh', translation: 'froh', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-655', word: 'versuche', translation: 'try', pos: 'noun', gender: 'f', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-656', word: 'rufen', translation: 'call', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-657', word: 'heiraten', translation: 'heiraten', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-658', word: 'super', translation: 'super', pos: 'noun', gender: 'm', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-660', word: 'lebt', translation: 'lebt', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-661', word: 'gutes', translation: 'good', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-662', word: 'lasse', translation: 'lasse', pos: 'noun', gender: 'f', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-663', word: 'onkel', translation: 'uncle', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-664', word: 'total', translation: 'totally', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-665', word: 'gebracht', translation: 'brought', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-666', word: 'party', translation: 'party', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-667', word: 'spielt', translation: 'plays', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-668', word: 'wahl', translation: 'election', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-669', word: 'vertrauen', translation: 'trust', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-670', word: 'damals', translation: 'damals', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-671', word: 'tagen', translation: 'tagen', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-672', word: 'leicht', translation: 'easy', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-673', word: 'nachdem', translation: 'after', pos: 'conj', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-674', word: 'gegangen', translation: 'gone', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-675', word: 'kaufen', translation: 'buy', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-676', word: 'geschafft', translation: 'geschafft', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-677', word: 'typen', translation: 'typen', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-678', word: 'interessiert', translation: 'interested', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-679', word: 'halte', translation: 'halte', pos: 'noun', gender: 'f', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-680', word: 'glaub', translation: 'glaub', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-681', word: 'irgendwo', translation: 'irgendwo', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-682', word: 'genauso', translation: 'just-as', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-683', word: 'kennt', translation: 'knows', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-684', word: 'genommen', translation: 'taken', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-685', word: 'zukunft', translation: 'future', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-686', word: 'weniger', translation: 'less', pos: 'noun', gender: 'm', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-687', word: 'cool', translation: 'cool', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-688', word: 'licht', translation: 'licht', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-689', word: 'getroffen', translation: 'met', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-690', word: 'himmel', translation: 'sky', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-691', word: 'nachricht', translation: 'message', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-692', word: 'passt', translation: 'fits', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-693', word: 'sagten', translation: 'said', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-695', word: 'vergiss', translation: 'forget', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-696', word: 'angerufen', translation: 'angerufen', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-697', word: 'sitzen', translation: 'sit', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-698', word: 'erde', translation: 'earth', pos: 'noun', gender: 'f', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-699', word: 'rest', translation: 'rest', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-700', word: 'passieren', translation: 'happen', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-701', word: 'eher', translation: 'eher', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-702', word: 'gefragt', translation: 'asked', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-703', word: 'opfer', translation: 'victim', pos: 'noun', gender: 'm', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-704', word: 'solche', translation: 'such', pos: 'noun', gender: 'f', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-705', word: 'mist', translation: 'mist', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-707', word: 'findet', translation: 'finds', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-708', word: 'schreiben', translation: 'write', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-709', word: 'gesprochen', translation: 'spoken', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-710', word: 'versuch', translation: 'versuch', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-711', word: 'vorstellen', translation: 'introduce', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-712', word: 'wovon', translation: 'wovon', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-713', word: 'sobald', translation: 'as-soon-as', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-714', word: 'nochmal', translation: 'nochmal', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-715', word: 'herren', translation: 'herren', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-716', word: 'sex', translation: 'sex', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-717', word: 'waffen', translation: 'waffen', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-718', word: 'wohnung', translation: 'apartment', pos: 'noun', gender: 'f', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-719', word: 'weh', translation: 'weh', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-720', word: 'krankenhaus', translation: 'hospital', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-721', word: 'bringe', translation: 'bringe', pos: 'noun', gender: 'f', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-722', word: 'millionen', translation: 'millionen', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-723', word: 'klasse', translation: 'class', pos: 'noun', gender: 'f', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-724', word: 'hart', translation: 'hard', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-725', word: 'worden', translation: 'become', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-726', word: 'sinn', translation: 'sinn', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-727', word: 'verletzt', translation: 'injured', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-728', word: 'erfahren', translation: 'erfahren', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-729', word: 'tragen', translation: 'carry', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-730', word: 'wenigstens', translation: 'at-least', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-731', word: 'vorsichtig', translation: 'vorsichtig', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-732', word: 'daddy', translation: 'daddy', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-733', word: 'stolz', translation: 'proud', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-734', word: 'stark', translation: 'strong', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-735', word: 'leuten', translation: 'leuten', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-736', word: 'besonders', translation: 'special', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-737', word: 'schicken', translation: 'send', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-738', word: 'person', translation: 'person', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-739', word: 'solange', translation: 'as-long-as', pos: 'noun', gender: 'f', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-740', word: 'lacht', translation: 'lacht', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-741', word: 'anrufen', translation: 'call', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-742', word: 'stand', translation: 'stand', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-743', word: 'redest', translation: 'redest', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-744', word: 'erwartet', translation: 'erwartet', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-745', word: 'boden', translation: 'floor', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-747', word: 'stimme', translation: 'voice', pos: 'noun', gender: 'f', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-748', word: 'glaubt', translation: 'glaubt', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-749', word: 'still', translation: 'still', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-750', word: 'sicherheit', translation: 'sicherheit', pos: 'noun', gender: 'f', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-751', word: 'setz', translation: 'setz', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-753', word: 'mund', translation: 'mouth', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-754', word: 'wisst', translation: 'wisst', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-755', word: 'lachen', translation: 'laugh', pos: 'noun', gender: 'n', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-756', word: 'zeug', translation: 'zeug', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-758', word: 'umbringen', translation: 'umbringen', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-759', word: 'sollst', translation: 'should', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-760', word: 'hasse', translation: 'hate', pos: 'noun', gender: 'f', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-761', word: 'schlimm', translation: 'bad', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-763', word: 'unglaublich', translation: 'unglaublich', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-764', word: 'laden', translation: 'shop', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-765', word: 'gestorben', translation: 'died', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-766', word: 'schauen', translation: 'look', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-767', word: 'meinung', translation: 'opinion', pos: 'noun', gender: 'f', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-770', word: 'geschehen', translation: 'happen', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-771', word: 'idiot', translation: 'idiot', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-772', word: 'verzeihung', translation: 'verzeihung', pos: 'noun', gender: 'f', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-774', word: 'zeig', translation: 'zeig', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-778', word: 'aufs', translation: 'aufs', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-780', word: 'vorher', translation: 'before', pos: 'noun', gender: 'm', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-781', word: 'schluss', translation: 'schluss', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-782', word: 'schneller', translation: 'schneller', pos: 'noun', gender: 'm', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-783', word: 'liebt', translation: 'loves', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-784', word: 'verdient', translation: 'verdient', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-785', word: 'meisten', translation: 'most', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-786', word: 'denk', translation: 'denk', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-787', word: 'umgebracht', translation: 'umgebracht', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-788', word: 'perfekt', translation: 'perfect', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-789', word: 'versprochen', translation: 'versprochen', pos: 'noun', gender: 'n', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-790', word: 'handy', translation: 'mobile', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-791', word: 'hinten', translation: 'hinten', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-792', word: 'monate', translation: 'months', pos: 'noun', gender: 'f', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-793', word: 'erinnere', translation: 'erinnere', pos: 'noun', gender: 'f', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-794', word: 'acht', translation: 'eight', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-795', word: 'arbeitet', translation: 'works', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-796', word: 'fallen', translation: 'fall', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-797', word: 'rufe', translation: 'rufe', pos: 'noun', gender: 'f', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-799', word: 'mord', translation: 'murder', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-800', word: 'heraus', translation: 'heraus', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-801', word: 'tages', translation: 'tages', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-802', word: 'liebling', translation: 'darling', pos: 'noun', gender: 'm', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-804', word: 'folgen', translation: 'follow', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-805', word: 'bitten', translation: 'ask', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-806', word: 'behalten', translation: 'behalten', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-807', word: 'arbeite', translation: 'work', pos: 'noun', gender: 'f', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-809', word: 'verdammte', translation: 'verdammte', pos: 'noun', gender: 'f', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-810', word: 'lebens', translation: 'lebens', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-811', word: 'hole', translation: 'hole', pos: 'noun', gender: 'f', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-812', word: 'tisch', translation: 'table', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-813', word: 'michael', translation: 'michael', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-814', word: 'jemals', translation: 'ever', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-815', word: 'liegen', translation: 'to-lie', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-816', word: 'verkaufen', translation: 'sell', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-817', word: 'anfangen', translation: 'start', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-818', word: 'bekommt', translation: 'bekommt', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-819', word: 'machte', translation: 'made', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-820', word: 'ha', translation: 'ha', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-821', word: 'hotel', translation: 'hotel', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-822', word: 'hilft', translation: 'helps', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-823', word: 'werdet', translation: 'will', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-824', word: 'meister', translation: 'meister', pos: 'noun', gender: 'm', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-825', word: 'kampf', translation: 'fight', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-826', word: 'antwort', translation: 'answer', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-827', word: 'konnten', translation: 'could', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-828', word: 'geschickt', translation: 'geschickt', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-829', word: 'jedem', translation: 'every', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-831', word: 'sieben', translation: 'seven', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-832', word: 'komisch', translation: 'komisch', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-833', word: 'gewinnen', translation: 'win', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-834', word: 'ihres', translation: 'her', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-835', word: 'bezahlt', translation: 'bezahlt', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-837', word: 'voller', translation: 'voller', pos: 'noun', gender: 'm', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-838', word: 'unterwegs', translation: 'unterwegs', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-839', word: 'dumm', translation: 'stupid', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-840', word: 'bild', translation: 'picture', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-843', word: 'bezahlen', translation: 'pay', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-844', word: 'dagegen', translation: 'dagegen', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-845', word: 'seien', translation: 'seien', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-846', word: 'starb', translation: 'died', pos: 'verb', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-848', word: 'monaten', translation: 'monaten', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-849', word: 'leiche', translation: 'leiche', pos: 'noun', gender: 'f', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-850', word: 'niemanden', translation: 'niemanden', pos: 'noun', level: 'B2', example: '', exampleEn: '' },
  { id: 'freq-851', word: 'auge', translation: 'eye', pos: 'noun', gender: 'f', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-852', word: 'arschloch', translation: 'arschloch', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-853', word: 'verheiratet', translation: 'married', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-855', word: 'zieh', translation: 'zieh', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-856', word: 'nimmt', translation: 'takes', pos: 'verb', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-857', word: 'gerettet', translation: 'saved', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-859', word: 'traum', translation: 'dream', pos: 'noun', gender: 'n', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-860', word: 'entscheidung', translation: 'entscheidung', pos: 'noun', gender: 'f', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-861', word: 'schlimmer', translation: 'schlimmer', pos: 'noun', gender: 'm', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-862', word: 'regeln', translation: 'rules', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-863', word: 'fenster', translation: 'window', pos: 'noun', gender: 'm', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-864', word: 'fangen', translation: 'catch', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-865', word: 'fort', translation: 'fort', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-866', word: 'findest', translation: 'find', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-867', word: 'gefahr', translation: 'danger', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-868', word: 'absolut', translation: 'absolutely', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-870', word: 'augenblick', translation: 'moment', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-871', word: 'bescheid', translation: 'bescheid', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-872', word: 'rum', translation: 'rum', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-873', word: 'gedanken', translation: 'thoughts', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-874', word: 'werd', translation: 'will', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-875', word: 'ziel', translation: 'goal', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-876', word: 'benutzt', translation: 'used', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-877', word: 'bewegung', translation: 'bewegung', pos: 'noun', gender: 'f', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-878', word: 'jemandem', translation: 'jemandem', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-879', word: 'worte', translation: 'words', pos: 'noun', gender: 'f', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-880', word: 'kamen', translation: 'came', pos: 'verb', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-881', word: 'welcher', translation: 'which', pos: 'noun', gender: 'm', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-882', word: 'zahlen', translation: 'zahlen', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-883', word: 'anfang', translation: 'beginning', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-884', word: 'legen', translation: 'put', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-885', word: 'erinnerst', translation: 'erinnerst', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-886', word: 'anwalt', translation: 'lawyer', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-887', word: 'fahr', translation: 'fahr', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-888', word: 'sitzt', translation: 'sitzt', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-889', word: 'hilf', translation: 'hilf', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-890', word: 'offen', translation: 'open', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-891', word: 'monsieur', translation: 'sir', pos: 'noun', gender: 'f', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-892', word: 'arme', translation: 'arme', pos: 'noun', gender: 'f', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-893', word: 'bier', translation: 'beer', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-897', word: 'klappe', translation: 'klappe', pos: 'noun', gender: 'f', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-898', word: 'herum', translation: 'herum', pos: 'noun', gender: 'n', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-899', word: 'finger', translation: 'finger', pos: 'noun', gender: 'm', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-900', word: 'ehe', translation: 'marriage', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-901', word: 'rolle', translation: 'rolle', pos: 'noun', gender: 'f', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-902', word: 'gleiche', translation: 'gleiche', pos: 'noun', gender: 'f', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-903', word: 'monat', translation: 'month', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-904', word: 'hochzeit', translation: 'wedding', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-907', word: 'wach', translation: 'awake', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-908', word: 'wozu', translation: 'wozu', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-909', word: 'arm', translation: 'arm', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-910', word: 'geschrieben', translation: 'geschrieben', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-911', word: 'chef', translation: 'boss', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-912', word: 'benutzen', translation: 'to-use', pos: 'verb', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-913', word: 'informationen', translation: 'informationen', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-914', word: 'erledigt', translation: 'erledigt', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-915', word: 'hoffentlich', translation: 'hoffentlich', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-916', word: 'tanzen', translation: 'dance', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-917', word: 'ansehen', translation: 'ansehen', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-918', word: 'darfst', translation: 'may', pos: 'verb', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-919', word: 'zuhause', translation: 'at-home', pos: 'noun', gender: 'f', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-920', word: 'wunderbar', translation: 'wunderbar', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-921', word: 'reise', translation: 'trip', pos: 'noun', gender: 'f', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-922', word: 'gewonnen', translation: 'gewonnen', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-923', word: 'dame', translation: 'lady', pos: 'noun', gender: 'f', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-924', word: 'irgendwann', translation: 'sometime', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-927', word: 'steckt', translation: 'steckt', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-929', word: 'schreit', translation: 'schreit', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-930', word: 'tolle', translation: 'tolle', pos: 'noun', gender: 'f', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-931', word: 'nennt', translation: 'nennt', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-932', word: 'raum', translation: 'room', pos: 'noun', gender: 'n', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-933', word: 'foto', translation: 'photo', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-934', word: 'kalt', translation: 'cold', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-936', word: 'irgendetwas', translation: 'irgendetwas', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-937', word: 'weile', translation: 'weile', pos: 'noun', gender: 'f', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-938', word: 'bisher', translation: 'bisher', pos: 'noun', gender: 'm', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-939', word: 'minute', translation: 'minute', pos: 'noun', gender: 'f', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-940', word: 'unbedingt', translation: 'absolutely', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-941', word: 'zug', translation: 'train', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-942', word: 'sekunden', translation: 'seconds', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-943', word: 'nen', translation: 'nen', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-944', word: 'beweise', translation: 'beweise', pos: 'noun', gender: 'f', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-945', word: 'nahm', translation: 'took', pos: 'verb', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-946', word: 'aller', translation: 'all', pos: 'noun', gender: 'm', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-947', word: 'freut', translation: 'freut', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-948', word: 'seele', translation: 'seele', pos: 'noun', gender: 'f', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-949', word: 'dauert', translation: 'lasts', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-950', word: 'magst', translation: 'like', pos: 'verb', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-952', word: 'brief', translation: 'letter', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-953', word: 'gelernt', translation: 'learned', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-954', word: 'sucht', translation: 'sucht', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-955', word: 'bekannt', translation: 'known', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-956', word: 'weitere', translation: 'weitere', pos: 'noun', gender: 'f', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-957', word: 'unfall', translation: 'accident', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-958', word: 'dahin', translation: 'there', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-959', word: 'kontrolle', translation: 'kontrolle', pos: 'noun', gender: 'f', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-960', word: 'beispiel', translation: 'example', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-961', word: 'lady', translation: 'lady', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-962', word: 'dasselbe', translation: 'dasselbe', pos: 'noun', gender: 'f', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-963', word: 'herzen', translation: 'herzen', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-964', word: 'schlagen', translation: 'schlagen', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-965', word: 'weise', translation: 'wise', pos: 'noun', gender: 'f', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-966', word: 'damen', translation: 'damen', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-967', word: 'darin', translation: 'in-that', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-968', word: 'gottes', translation: 'gottes', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-969', word: 'holt', translation: 'holt', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-970', word: 'fehlt', translation: 'missing', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-971', word: 'vorsicht', translation: 'vorsicht', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-972', word: 'beweisen', translation: 'prove', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-973', word: 'gehabt', translation: 'had', pos: 'verb', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-974', word: 'zumindest', translation: 'zumindest', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-975', word: 'vermisst', translation: 'miss', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-976', word: 'kriegt', translation: 'gets', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-977', word: 'verbindung', translation: 'verbindung', pos: 'noun', gender: 'f', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-978', word: 'tief', translation: 'deep', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-979', word: 'richtung', translation: 'richtung', pos: 'noun', gender: 'f', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-980', word: 'lage', translation: 'lage', pos: 'noun', gender: 'f', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-981', word: 'sowieso', translation: 'anyway', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-982', word: 'kraft', translation: 'power', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-983', word: 'normal', translation: 'normal', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-984', word: 'lauf', translation: 'lauf', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-985', word: 'ehre', translation: 'ehre', pos: 'noun', gender: 'f', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-986', word: 'stell', translation: 'stell', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-987', word: 'geschenk', translation: 'geschenk', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-988', word: 'bar', translation: 'bar', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-989', word: 'tasche', translation: 'tasche', pos: 'noun', gender: 'f', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-990', word: 'gelesen', translation: 'read', pos: 'verb', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-991', word: 'gekauft', translation: 'gekauft', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-992', word: 'wussten', translation: 'knew', pos: 'verb', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-993', word: 'gestohlen', translation: 'gestohlen', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-994', word: 'hunger', translation: 'hunger', pos: 'noun', gender: 'm', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-995', word: 'leg', translation: 'leg', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-996', word: 'beziehung', translation: 'beziehung', pos: 'noun', gender: 'f', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-998', word: 'verschwunden', translation: 'verschwunden', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-999', word: 'steh', translation: 'steh', pos: 'noun', level: 'C1', example: '', exampleEn: '' },
  { id: 'freq-1000', word: 'gearbeitet', translation: 'gearbeitet', pos: 'noun', level: 'C1', example: '', exampleEn: '' },

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
  const [activeTopic, setActiveTopic] = useState<'all' | 'freq' | 'business'>('all');
  const [viewMode, setViewMode] = useState<'study' | 'browse'>('study');

  // Load Sheet vocab (returns rows from /api/vocab when Sheet is configured)
  const { sheetCards } = useSheetVocab();

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

  // Merge Sheet-supplied cards into localStorage (only adds new ids, keeps SRS state)
  useEffect(() => {
    if (sheetCards.length === 0) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    let baseCards: VocabCard[] = saved ? JSON.parse(saved) : SEED_VOCAB.map(newCard);
    const merged = mergeSheetIntoLocal(baseCards, sheetCards);
    if (merged.length > baseCards.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      setCards(merged);
    }
  }, [sheetCards]);

  function save(next: VocabCard[]) {
    setCards(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  // Get due cards, sorted by overdue
  const dueCards = useMemo(() => {
    const now = Date.now();
    return cards
      .filter(c => c.due <= now && (activeLevel === 'all' || c.level === activeLevel) && (activeTopic === 'all' || c.id.startsWith(activeTopic + '-')))
      .sort((a, b) => a.due - b.due);
  }, [cards, activeLevel, activeTopic]);

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
            <button
              onClick={() => setViewMode(viewMode === 'study' ? 'browse' : 'study')}
              title={viewMode === 'study' ? 'Browse all words with meanings & examples' : 'Back to flashcard study mode'}
              style={{
                padding: '6px 12px',
                background: viewMode === 'browse' ? t.accent : t.bg,
                color: viewMode === 'browse' ? t.onAccent : t.text,
                border: '1px solid ' + (viewMode === 'browse' ? t.accent : t.border),
                borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem',
                fontWeight: viewMode === 'browse' ? 700 : 500,
              }}
            >
              {viewMode === 'study' ? '📖 Browse' : '🎴 Study'}
            </button>
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

        {/* Topic deck chips */}
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: t.textFaint, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: 4 }}>
            Topic:
          </span>
          {[
            { id: 'all' as const, label: 'Alle' },
            { id: 'freq' as const, label: 'Frequency' },
            { id: 'business' as const, label: '💼 Business' },
          ].map(tp => {
            const count = tp.id === 'all' ? cards.length : cards.filter(c => c.id.startsWith(tp.id + '-')).length;
            const active = activeTopic === tp.id;
            return (
              <button
                key={tp.id}
                onClick={() => setActiveTopic(tp.id)}
                style={{
                  padding: '4px 10px', borderRadius: 999,
                  border: '1px solid ' + (active ? t.accent : t.border),
                  background: active ? t.accent : t.bg,
                  color: active ? t.onAccent : t.textMuted,
                  fontSize: '0.75rem', fontWeight: active ? 700 : 500,
                  cursor: 'pointer', fontFamily: FONTS.body,
                }}
              >
                {tp.label} <span style={{ opacity: 0.7, marginLeft: 3, fontSize: '0.65rem' }}>{count}</span>
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

            {currentCard.example && currentCard.exampleEn && (
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
            )}

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

      {/* Browse mode grid (shows all words with meaning + example sentence) */}
      {viewMode === 'browse' && (
        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: '0.75rem', color: t.textMuted, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10,
          }}>
            📖 Browse {cards.filter(c => (activeLevel === 'all' || c.level === activeLevel) && (activeTopic === 'all' || c.id.startsWith(activeTopic + '-'))).length} words
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 12,
          }}>
            {cards
              .filter(c => (activeLevel === 'all' || c.level === activeLevel) && (activeTopic === 'all' || c.id.startsWith(activeTopic + '-')))
              .sort((a, b) => a.word.localeCompare(b.word, 'de'))
              .map(c => (
                <div
                  key={c.id}
                  style={{
                    background: t.cardBg,
                    border: '1px solid ' + t.border,
                    borderRadius: 10,
                    padding: 14,
                    boxShadow: t.shadow,
                    display: 'flex', flexDirection: 'column', gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{
                      fontFamily: FONTS.display, fontSize: '1.25rem', fontWeight: 700,
                      color: t.text, letterSpacing: '-0.01em', lineHeight: 1.2,
                    }}>
                      {c.word}
                    </div>
                    <button
                      onClick={() => speak(c.word)}
                      disabled={!supportsTTS || germanVoices.length === 0}
                      title={germanVoices.length === 0 ? 'No German voice installed' : 'Hear pronunciation'}
                      style={{
                        padding: '4px 8px', background: 'transparent',
                        color: t.accent, border: '1px solid ' + t.accent,
                        borderRadius: 6, cursor: supportsTTS && germanVoices.length > 0 ? 'pointer' : 'not-allowed',
                        fontSize: '0.85rem', flexShrink: 0,
                      }}
                    >
                      🔊
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{
                      padding: '2px 8px', background: t.accentSoft, color: t.accent,
                      borderRadius: 4, fontSize: '0.7rem', fontWeight: 700,
                    }}>
                      {c.level}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: t.textMuted, fontFamily: FONTS.mono }}>
                      {c.pos}{c.gender ? ' · ' + (c.gender === 'm' ? 'der' : c.gender === 'f' ? 'die' : 'das') : ''}
                    </span>
                  </div>

                  <div style={{
                    fontFamily: FONTS.display, fontSize: '1rem', fontWeight: 600,
                    color: t.accent, fontStyle: 'italic',
                  }}>
                    {c.translation}
                  </div>

                  {c.example && c.example.trim() !== '' && (
                    <div style={{
                      background: t.bg, border: '1px dashed ' + t.border,
                      borderRadius: 6, padding: '8px 10px', marginTop: 2,
                    }}>
                      <div style={{
                        fontFamily: FONTS.reading, fontSize: '0.9rem',
                        color: t.text, lineHeight: 1.4, marginBottom: 2,
                      }}>
                        {c.example}
                      </div>
                      {c.exampleEn && (
                        <div style={{
                          fontSize: '0.78rem', color: t.textMuted, fontStyle: 'italic',
                          fontFamily: FONTS.reading, lineHeight: 1.3,
                        }}>
                          {c.exampleEn}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

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
