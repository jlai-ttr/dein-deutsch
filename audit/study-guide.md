# 📚 German Noun Matrix — Master Study Guide

> **Source**: `German Noun Matrix` tab in Google Sheet (65 rule entries)
> **Engine**: `lib/gender-engine.js` (60 SUFFIX_RULES)
> **Generated**: 2026-07-31 23:00 MYT
> **Purpose**: Master reference for German noun gender + plural practice

---

## 📊 Audit Summary

| Metric | Value |
|---|---|
| Spec rule entries | **65** |
| Engine SUFFIX_RULES | **60** |
| Spec entries mapped to engine rule(s) | 54/65 (83%) |
| Spec entries without engine rule | 11 |
| Spec↔Engine rule mismatches | **6** |
| Example words extracted | 177 |
| Engine agrees with spec on examples | **98/177** (55.4%) |
| Engine disagrees | 79 |

## 🎯 How To Use This Guide

1. **Category** = which tier the rule belongs to (Supreme → Structural → Phonetic → Foreign Loans → Semantic)  
2. **Pattern** = what ending or shape to look for  
3. **Gender** = the article (der/die/das) the pattern dictates  
4. **Plural** = how the plural is formed  
5. **Boundaries** = critical exceptions, traps, and edge cases  
6. **Practice** = example words to drill  
7. **Engine status** = which engine rule covers this (✅ agrees / ⚠️ partial / 🚫 no rule)  

**Legend**:  
- 🔵 der / 🔴 die / 🟢 das — gender of the article  
- ✅ Engine rule agrees with spec  
- ⚠️ Engine rule partially matches or has known weakness  
- 🚫 No direct engine suffix rule — relies on lookup, compound, or semantic tier  

---

## 📂 Supreme Structural

### Rule #1: -chen, -lein (Diminutives)

| Field | Value |
|---|---|
| **Gender** | **das** 🟢 |
| **Plural** | *no change* |
| **Engine Rule(s)** | ✅ Rule 0: `chen$|lein$` → das (score 100) |

**Critical Boundaries & Exceptions:**

> Overrides ALL rules, even biology (das Mädchen).

**📝 Practice examples** (1):

- `Mädchen` <sub>✓ engine: das (A1/A2)</sub>

---

## 📂 Supreme Semantic

### Rule #2: Male Humans & Animals

| Field | Value |
|---|---|
| **Gender** | **der** 🔵 |
| **Plural** | add **-en** |
| **Engine Rule** | 🚫 *no direct suffix rule* — relies on lookup/compound/semantic |

**Critical Boundaries & Exceptions:**

> Overrides all phonetics (Held → Helden).

**📝 Practice examples** (2):

- `Held` → Helden <sub>✓ engine: der (A1/A2)</sub>
- `Helden` <sub>✗ engine: unknown (none)</sub>

---

### Rule #3: Metals & Chemical Elements

| Field | Value |
|---|---|
| **Gender** | **das** 🟢 |
| **Plural** | *uncountable* |
| **Engine Rule** | 🚫 *no direct suffix rule* — relies on lookup/compound/semantic |

**Critical Boundaries & Exceptions:**

> Gold, Silber, Eisen, Blei, Kupfer. Traps: der Stahl (Masc), die Bronze (Fem).

**📝 Practice examples** (7):

- `Gold` <sub>✓ engine: das (A1/A2)</sub>
- `Silber` <sub>✓ engine: das (A1/A2)</sub>
- `Eisen` <sub>✓ engine: das (A1/A2)</sub>
- `Blei` <sub>✗ engine: unknown (none)</sub>
- `Kupfer` <sub>✗ engine: der (Suffix)</sub>
- `Stahl` <sub>✗ engine: unknown (root-dep)</sub>
- `Bronze` <sub>✗ engine: die (Suffix)</sub>

---

## 📂 Structural (Fem)

### Rule #4: -ung, -heit, -keit, -schaft

| Field | Value |
|---|---|
| **Gender** | **die** 🔴 |
| **Plural** | add **-en** |
| **Engine Rule(s)** | ✅ Rule 1: `ung$` → die (score 100)<br>✅ Rule 2: `heit$|keit$` → die (score 100)<br>✅ Rule 3: `schaft$` → die (score 100) |

**Critical Boundaries & Exceptions:**

> 100% consistent.

---

### Rule #5: -ion, -tur, -sur, -ik, -is

| Field | Value |
|---|---|
| **Gender** | **die** 🔴 |
| **Plural** | add **-en** |
| **Engine Rule(s)** | ✅ Rule 4: `ion$|tur$|sur$|ik$` → die (score 95)<br>✅ Rule 5: `is$` → die (score 90) |

**Critical Boundaries & Exceptions:**

> Greek/Latin multi-syllable disciplines (die Musik, die Politik). Traps: Abitur, Futur (Neut). Trap: 1-syllable English loans take Masc (der Streik → Streiks).

**📝 Practice examples** (6):

- `Streik` → Streiks <sub>✓ engine: die (Suffix)</sub>
- `Musik` <sub>✓ engine: die (Suffix)</sub>
- `Politik` <sub>✓ engine: die (Suffix)</sub>
- `Abitur` <sub>✓ engine: die (Suffix)</sub>
- `Futur` <sub>✓ engine: die (Suffix)</sub>
- `Streiks` <sub>✗ engine: unknown (none)</sub>

---

### Rule #6: -ei (Occupations/Places)

| Field | Value |
|---|---|
| **Gender** | **die** 🔴 |
| **Plural** | add **-en** |
| **Engine Rule(s)** | ✅ Rule 10: `e$` → die (score 60) |

**Critical Boundaries & Exceptions:**

> Bäckerei, Druckerei, Sklaverei.

**📝 Practice examples** (3):

- `Bäckerei` <sub>✗ engine: unknown (none)</sub>
- `Druckerei` <sub>✗ engine: unknown (none)</sub>
- `Sklaverei` <sub>✗ engine: unknown (none)</sub>

---

### Rule #7: -in

| Field | Value |
|---|---|
| **Gender** | **die** 🔴 |
| **Plural** | add **-nen** |
| **Engine Rule(s)** | ✅ Rule 6: `in$` → die (score 85) |

**Critical Boundaries & Exceptions:**

> Must be human. Scientific -in = Neuter.

**📝 Practice examples** (3):

- `Must` <sub>✗ engine: der (Suffix)</sub>
- `Scientific` <sub>✗ engine: unknown (root-dep)</sub>
- `Neuter` <sub>✗ engine: der (Suffix)</sub>

---

### Rule #8: Action + t / st / ft

| Field | Value |
|---|---|
| **Gender** | **die** 🔴 |
| **Plural** | *varies* |
| **Engine Rule** | 🚫 *no direct suffix rule* — relies on lookup/compound/semantic |

**Critical Boundaries & Exceptions:**

> Derived from verbs. Fahrt → Fahrten, Kunst → Künste.

**📝 Practice examples** (5):

- `Fahrt` → Fahrten <sub>✓ engine: die (Suffix)</sub>
- `Kunst` → Künste <sub>✓ engine: die (Suffix)</sub>
- `Derived` <sub>✗ engine: unknown (none)</sub>
- `Fahrten` <sub>✗ engine: unknown (none)</sub>
- `Künste` <sub>✓ engine: die (Suffix)</sub>

---

### Rule #9: -e

| Field | Value |
|---|---|
| **Gender** | **die** 🔴 |
| **Plural** | Add -n |
| **Engine Rule(s)** | ✅ Rule 10: `e$` → die (score 60) |

**Critical Boundaries & Exceptions:**

> Trap: Masculine weak nouns, Ge- prefix.

**📝 Practice examples** (1):

- `Masculine` <sub>✓ engine: die (Suffix)</sub>

---

## 📂 Structural (Masc)

### Rule #10: be-, ent-, er-, ver- (Stems)

| Field | Value |
|---|---|
| **Gender** | **der** 🔵 |
| **Plural** | add **-e** + Umlaut |
| **Engine Rule(s)** | ✅ Rule 50: `er$` → der (score 55) |

**Critical Boundaries & Exceptions:**

> Drops -en. Traps: -o shift (Verbot = Neut).

**📝 Practice examples** (1):

- `Verbot` <sub>✗ engine: unknown (none)</sub>

---

### Rule #11: -ismus, -us, -os

| Field | Value |
|---|---|
| **Gender** | **der** 🔵 |
| **Plural** | add **-en** |
| **Engine Rule(s)** | ✅ Rule 11: `ismus$` → der (score 95)<br>✅ Rule 12: `us$` → der (score 70)<br>✅ Rule 13: `os$` → der (score 80) |

**Critical Boundaries & Exceptions:**

> Mythos → Mythen. Trap: das Virus.

**📝 Practice examples** (3):

- `Mythos` → Mythen <sub>✓ engine: der (Suffix)</sub>
- `Mythen` <sub>✗ engine: unknown (none)</sub>
- `Virus` <sub>✗ engine: unknown (none)</sub>

---

### Rule #12: -ent, -ant, -ist

| Field | Value |
|---|---|
| **Gender** | **der** 🔵 |
| **Plural** | add **-en** |
| **Engine Rule(s)** | ✅ Rule 14: `ent$|and$` → der (score 75)<br>✅ Rule 15: `ant$` → der (score 85)<br>✅ Rule 16: `ist$` → der (score 80) |

**Critical Boundaries & Exceptions:**

> Must be human. Inanimate = Neuter.

**📝 Practice examples** (3):

- `Must` <sub>✓ engine: der (Suffix)</sub>
- `Inanimate` <sub>✗ engine: die (Suffix)</sub>
- `Neuter` <sub>✓ engine: der (Suffix)</sub>

---

### Rule #13: -or

| Field | Value |
|---|---|
| **Gender** | **der** 🔵 |
| **Plural** | *varies* |
| **Engine Rule(s)** | ✅ Rule 17: `or$` → der (score 65) |

**Critical Boundaries & Exceptions:**

> Professions add -en, Abstract adds -e. Trap: Truncated Latin -atorium loans are Neuter (das Labor → Labors).

**📝 Practice examples** (6):

- `Labor` → Labors <sub>✗ engine: unknown (root-dep)</sub>
- `Professions` <sub>✗ engine: unknown (none)</sub>
- `Abstract` <sub>✗ engine: unknown (none)</sub>
- `Truncated` <sub>✗ engine: unknown (none)</sub>
- `Neuter` <sub>✓ engine: der (Suffix)</sub>
- `Labors` <sub>✓ engine: der (Suffix)</sub>

---

### Rule #14: -ig

| Field | Value |
|---|---|
| **Gender** | **der** 🔵 |
| **Plural** | add **-e** |
| **Engine Rule(s)** | ✅ Rule 18: `ig$` → der (score 80) |

**Critical Boundaries & Exceptions:**

> Structural suffix. König → Könige.

**📝 Practice examples** (3):

- `König` → Könige <sub>✓ engine: der (Suffix)</sub>
- `Structural` <sub>✗ engine: unknown (root-dep)</sub>
- `Könige` <sub>✗ engine: die (Suffix)</sub>

---

### Rule #15: -el, -er, -en (Tools/Birds)

| Field | Value |
|---|---|
| **Gender** | **der** 🔵 |
| **Plural** | *no change* |
| **Engine Rule(s)** | ✅ Rule 50: `er$` → der (score 55) |

**Critical Boundaries & Exceptions:**

> Apfel → Äpfel.

**📝 Practice examples** (1):

- `Apfel` <sub>✓ engine: der (A1/A2)</sub>

---

### Rule #17: -ar, -ier (Masc Roots)

| Field | Value |
|---|---|
| **Gender** | **der** 🔵 |
| **Plural** | add **-e** |
| **Engine Rule(s)** | ✅ Rule 19: `ar$` → der (score 70)<br>✅ Rule 20: `ier$` → root (score 65) |

**Critical Boundaries & Exceptions:**

> Notar → Notare.

**📝 Practice examples** (2):

- `Notar` → Notare <sub>✓ engine: der (Suffix)</sub>
- `Notare` <sub>✗ engine: die (Suffix)</sub>

---

## 📂 Structural (Neut)

### Rule #16: -el, -er, -en (Abstracts)

| Field | Value |
|---|---|
| **Gender** | **das** 🟢 |
| **Plural** | *no change* |
| **Engine Rule(s)** | ⚠️ Rule 50: `er$` → der (score 55) |

**Critical Boundaries & Exceptions:**

> Mittel → Mittel.

**📝 Practice examples** (1):

- `Mittel` → Mittel <sub>✗ engine: unknown (root-dep)</sub>

---

### Rule #18: -ar, -ier (Neut Roots)

| Field | Value |
|---|---|
| **Gender** | **das** 🟢 |
| **Plural** | add **-e** |
| **Engine Rule(s)** | ⚠️ Rule 19: `ar$` → der (score 70)<br>✅ Rule 20: `ier$` → root (score 65) |

**Critical Boundaries & Exceptions:**

> Klavier → Klaviere.

**📝 Practice examples** (2):

- `Klavier` → Klaviere <sub>✗ engine: der (Suffix)</sub>
- `Klaviere` <sub>✗ engine: die (Suffix)</sub>

---

### Rule #19: -nis

| Field | Value |
|---|---|
| **Gender** | **das** 🟢 |
| **Plural** | add **-s** |
| **Engine Rule(s)** | ✅ Rule 21: `nis$` → das (score 95) |

**Critical Boundaries & Exceptions:**

> Geheimnis → Geheimnisse. Trap: Abstract cognitive/deverbal nouns derived from verbs are Feminine (die Erkenntnis, die Erlaubnis, die Empfängnis).

**📝 Practice examples** (7):

- `Geheimnis` → Geheimnisse <sub>✓ engine: das (Suffix)</sub>
- `Geheimnisse` <sub>✗ engine: die (Suffix)</sub>
- `Abstract` <sub>✗ engine: unknown (none)</sub>
- `Feminine` <sub>✗ engine: die (Suffix)</sub>
- `Erkenntnis` <sub>✓ engine: das (Compound(ntnis))</sub>
- `Erlaubnis` <sub>✗ engine: die (Suffix)</sub>
- `Empfängnis` <sub>✓ engine: das (Compound(gnis))</sub>

---

### Rule #20: -um, -tum, -ment, -ma

| Field | Value |
|---|---|
| **Gender** | **das** 🟢 |
| **Plural** | *varies* |
| **Engine Rule(s)** | ✅ Rule 22: `um$` → das (score 85)<br>✅ Rule 23: `tum$` → das (score 90)<br>✅ Rule 24: `ment$` → das (score 95)<br>✅ Rule 25: `ma$` → das (score 90) |

**Critical Boundaries & Exceptions:**

> Drops -um / adds -er / adds -e / adds -men / takes Latin -a or -ien (Praktikum → Praktika, Museum → Museen).

**📝 Practice examples** (4):

- `Praktikum` → Praktika <sub>✓ engine: das (Suffix)</sub>
- `Museum` → Museen <sub>✓ engine: das (Suffix)</sub>
- `Praktika` <sub>✗ engine: unknown (none)</sub>
- `Museen` <sub>✗ engine: unknown (none)</sub>

---

### Rule #21: -iv (Latin Suffix)

| Field | Value |
|---|---|
| **Gender** | **das** 🟢 |
| **Plural** | add **-e** |
| **Engine Rule(s)** | ✅ Rule 26: `iv$` → das (score 90) |

**Critical Boundaries & Exceptions:**

> Motiv → Motive.

**📝 Practice examples** (2):

- `Motiv` → Motive <sub>✓ engine: das (Suffix)</sub>
- `Motive` <sub>✗ engine: die (Suffix)</sub>

---

## 📂 Phonetic (-b, -f)

### Rule #22: -ab, -alb

| Field | Value |
|---|---|
| **Gender** | **das** 🟢 |
| **Plural** | add **-er** + Umlaut |
| **Engine Rule(s)** | ✅ Rule 27: `ab$|alb$` → das (score 75) |

**Critical Boundaries & Exceptions:**

> Grab → Gräber.

**📝 Practice examples** (2):

- `Grab` → Gräber <sub>✓ engine: das (Suffix)</sub>
- `Gräber` <sub>✗ engine: der (Suffix)</sub>

---

### Rule #23: -ieb

| Field | Value |
|---|---|
| **Gender** | **das** 🟢 |
| **Plural** | add **-e** |
| **Engine Rule(s)** | ✅ Rule 28: `ieb$` → das (score 90) |

**Critical Boundaries & Exceptions:**

> Sieb → Siebe.

**📝 Practice examples** (2):

- `Sieb` → Siebe <sub>✓ engine: das (Suffix)</sub>
- `Siebe` <sub>✗ engine: die (Suffix)</sub>

---

### Rule #24: Native -b

| Field | Value |
|---|---|
| **Gender** | **der** 🔵 |
| **Plural** | add **-e** + Umlaut |
| **Engine Rule(s)** | ✅ Rule 29: `b$` → der (score 30) |

**Critical Boundaries & Exceptions:**

> Betrieb → Betriebe, Stab → Stäbe.

**📝 Practice examples** (4):

- `Betrieb` → Betriebe <sub>✓ engine: der (Sheet)</sub>
- `Stab` → Stäbe <sub>✓ engine: der (Suffix)</sub>
- `Betriebe` <sub>✗ engine: die (Suffix)</sub>
- `Stäbe` <sub>✗ engine: die (Suffix)</sub>

---

## 📂 Phonetic (-ee)

### Rule #35: -ee (Substances/Plants)

| Field | Value |
|---|---|
| **Gender** | **der** 🔵 |
| **Plural** | add **-s** |
| **Engine Rule** | 🚫 *no direct suffix rule* — relies on lookup/compound/semantic |

**Critical Boundaries & Exceptions:**

> Imported raw goods. Kaffee, Tee.

**📝 Practice examples** (2):

- `Imported` <sub>✗ engine: unknown (none)</sub>
- `Kaffee` <sub>✓ engine: der (A1/A2)</sub>

---

### Rule #36: -ee (Abstract/French)

| Field | Value |
|---|---|
| **Gender** | **die** 🔴 |
| **Plural** | Add -n |
| **Engine Rule** | 🚫 *no direct suffix rule* — relies on lookup/compound/semantic |

**Critical Boundaries & Exceptions:**

> French historical loans. Idee, Allee.

**📝 Practice examples** (2):

- `Idee` <sub>✓ engine: die (A1/A2)</sub>
- `Allee` <sub>✓ engine: die (Suffix)</sub>

---

## 📂 Phonetic (-d)

### Rule #27: -und

| Field | Value |
|---|---|
| **Gender** | **der** 🔵 |
| **Plural** | add **-e** + Umlaut |
| **Engine Rule(s)** | ✅ Rule 32: `und$` → der (score 80) |

**Critical Boundaries & Exceptions:**

> Hund, Mund, Grund.

**📝 Practice examples** (3):

- `Hund` <sub>✓ engine: der (A1/A2)</sub>
- `Mund` <sub>✓ engine: der (A1/A2)</sub>
- `Grund` <sub>✓ engine: der (Suffix)</sub>

---

### Rule #28: -ild, -eld

| Field | Value |
|---|---|
| **Gender** | **das** 🟢 |
| **Plural** | add **-er** |
| **Engine Rule(s)** | ✅ Rule 33: `ild$|eld$` → das (score 80) |

**Critical Boundaries & Exceptions:**

> Bild, Schild. Trap: Held (Masc).

**📝 Practice examples** (3):

- `Bild` <sub>✓ engine: das (A1/A2)</sub>
- `Schild` <sub>✓ engine: das (Suffix)</sub>
- `Held` <sub>✗ engine: der (A1/A2)</sub>

---

### Rule #29: -and, -ind, -ad (Masc)

| Field | Value |
|---|---|
| **Gender** | **der** 🔵 |
| **Plural** | add **-e** |
| **Engine Rule(s)** | ✅ Rule 34: `ad$|ind$` → der (score 60)<br>✅ Rule 35: `and$` → der (score 55) |

**Critical Boundaries & Exceptions:**

> Pfad → Pfade. Trap: Hand (Fem).

**📝 Practice examples** (3):

- `Pfad` → Pfade <sub>✓ engine: der (Suffix)</sub>
- `Pfade` <sub>✗ engine: die (Suffix)</sub>
- `Hand` <sub>✗ engine: die (A1/A2)</sub>

---

### Rule #30: -and, -ind, -ad (Neut)

| Field | Value |
|---|---|
| **Gender** | **das** 🟢 |
| **Plural** | add **-er** |
| **Engine Rule(s)** | ⚠️ Rule 34: `ad$|ind$` → der (score 60)<br>⚠️ Rule 35: `and$` → der (score 55) |

**Critical Boundaries & Exceptions:**

> Rad → Räder, Band → Bänder.

**📝 Practice examples** (4):

- `Rad` → Räder <sub>✓ engine: das (A1/A2)</sub>
- `Band` → Bänder <sub>✓ engine: das (A1/A2)</sub>
- `Räder` <sub>✗ engine: der (Suffix)</sub>
- `Bänder` <sub>✗ engine: der (Suffix)</sub>

---

### Rule #31: -end (Masc)

| Field | Value |
|---|---|
| **Gender** | **der** 🔵 |
| **Plural** | add **-e** |
| **Engine Rule(s)** | ✅ Rule 36: `end$` → root (score 60) |

**Critical Boundaries & Exceptions:**

> Abend → Abende.

**📝 Practice examples** (2):

- `Abend` → Abende <sub>✓ engine: der (Sheet)</sub>
- `Abende` <sub>✗ engine: die (Suffix)</sub>

---

### Rule #32: -end (Neut)

| Field | Value |
|---|---|
| **Gender** | **das** 🟢 |
| **Plural** | add **-e** |
| **Engine Rule(s)** | ✅ Rule 36: `end$` → root (score 60) |

**Critical Boundaries & Exceptions:**

> Dutzend → Dutzende.

**📝 Practice examples** (2):

- `Dutzend` → Dutzende <sub>✓ engine: das (A1/A2)</sub>
- `Dutzende` <sub>✗ engine: die (Suffix)</sub>

---

### Rule #33: -rd (Masc)

| Field | Value |
|---|---|
| **Gender** | **der** 🔵 |
| **Plural** | add **-e** |
| **Engine Rule(s)** | ✅ Rule 37: `rd$` → root (score 70) |

**Critical Boundaries & Exceptions:**

> Herd → Herde.

**📝 Practice examples** (2):

- `Herd` → Herde <sub>✓ engine: der (A1/A2)</sub>
- `Herde` <sub>✗ engine: die (Suffix)</sub>

---

### Rule #34: -rd (Neut)

| Field | Value |
|---|---|
| **Gender** | **das** 🟢 |
| **Plural** | add **-e** |
| **Engine Rule(s)** | ✅ Rule 37: `rd$` → root (score 70) |

**Critical Boundaries & Exceptions:**

> Pferd → Pferde.

**📝 Practice examples** (2):

- `Pferd` → Pferde <sub>✓ engine: das (A1/A2)</sub>
- `Pferde` <sub>✗ engine: die (Suffix)</sub>

---

## 📂 Phonetic (-g)

### Rule #37: -ag, -eg, -og, -ug

| Field | Value |
|---|---|
| **Gender** | **der** 🔵 |
| **Plural** | add **-e** + Umlaut |
| **Engine Rule(s)** | ✅ Rule 38: `ag$|eg$|og$` → der (score 80)<br>✅ Rule 39: `ug$` → der (score 80) |

**Critical Boundaries & Exceptions:**

> Absolute Masc gravity. Tag, Weg, Zug.

**📝 Practice examples** (1):

- `Absolute` <sub>✗ engine: die (Suffix)</sub>

---

## 📂 Phonetic (-h)

### Rule #38: Silent -h (Masc)

| Field | Value |
|---|---|
| **Gender** | **der** 🔵 |
| **Plural** | add **-e** |
| **Engine Rule(s)** | ✅ Rule 40: `h$` → der (score 55) |

**Critical Boundaries & Exceptions:**

> Schuh → Schuhe.

**📝 Practice examples** (2):

- `Schuh` → Schuhe <sub>✓ engine: der (A1/A2)</sub>
- `Schuhe` <sub>✗ engine: die (Suffix)</sub>

---

### Rule #39: Silent -h (Neut)

| Field | Value |
|---|---|
| **Gender** | **das** 🟢 |
| **Plural** | add **-e** |
| **Engine Rule(s)** | ⚠️ Rule 40: `h$` → der (score 55) |

**Critical Boundaries & Exceptions:**

> Reh → Rehe.

**📝 Practice examples** (2):

- `Reh` → Rehe <sub>✓ engine: das (A1/A2)</sub>
- `Rehe` <sub>✗ engine: die (Suffix)</sub>

---

### Rule #40: Silent -h (Fem)

| Field | Value |
|---|---|
| **Gender** | **die** 🔴 |
| **Plural** | add **-e** + Umlaut |
| **Engine Rule(s)** | ⚠️ Rule 40: `h$` → der (score 55) |

**Critical Boundaries & Exceptions:**

> Kuh → Kühe.

**📝 Practice examples** (2):

- `Kuh` → Kühe <sub>✓ engine: die (A1/A2)</sub>
- `Kühe` <sub>✓ engine: die (Suffix)</sub>

---

## 📂 Phonetic (-k)

### Rule #41: -ack, -ock, -uck

| Field | Value |
|---|---|
| **Gender** | **der** 🔵 |
| **Plural** | add **-e** + Umlaut |
| **Engine Rule(s)** | ✅ Rule 41: `ack$|ock$|uck$` → der (score 85) |

**Critical Boundaries & Exceptions:**

> Sack, Stock, Druck.

**📝 Practice examples** (3):

- `Sack` <sub>✓ engine: der (Suffix)</sub>
- `Stock` <sub>✓ engine: der (Suffix)</sub>
- `Druck` <sub>✓ engine: der (Suffix)</sub>

---

### Rule #42: -eck, -ück

| Field | Value |
|---|---|
| **Gender** | **das** 🟢 |
| **Plural** | add **-e** |
| **Engine Rule(s)** | ✅ Rule 42: `eck$|ück$` → das (score 80) |

**Critical Boundaries & Exceptions:**

> Versteck, Stück.

**📝 Practice examples** (2):

- `Versteck` <sub>✓ engine: das (Suffix)</sub>
- `Stück` <sub>✓ engine: das (Suffix)</sub>

---

## 📂 Phonetic (-l)

### Rule #43: -l, -ll (Masc)

| Field | Value |
|---|---|
| **Gender** | **der** 🔵 |
| **Plural** | add **-e** + Umlaut |
| **Engine Rule(s)** | ✅ Rule 43: `l$` → root (score 45)<br>✅ Rule 44: `ll$` → der (score 60) |

**Critical Boundaries & Exceptions:**

> Fall → Fälle.

**📝 Practice examples** (2):

- `Fall` → Fälle <sub>✓ engine: der (Suffix)</sub>
- `Fälle` <sub>✗ engine: die (Suffix)</sub>

---

### Rule #44: -l, -ll (Neut)

| Field | Value |
|---|---|
| **Gender** | **das** 🟢 |
| **Plural** | add **-e** |
| **Engine Rule(s)** | ✅ Rule 43: `l$` → root (score 45)<br>⚠️ Rule 44: `ll$` → der (score 60) |

**Critical Boundaries & Exceptions:**

> Spiel → Spiele. Trap: Tal → Täler.

**📝 Practice examples** (4):

- `Spiel` → Spiele <sub>✓ engine: das (A1/A2)</sub>
- `Tal` → Täler <sub>✓ engine: das (A1/A2)</sub>
- `Spiele` <sub>✗ engine: die (Suffix)</sub>
- `Täler` <sub>✗ engine: der (Suffix)</sub>

---

## 📂 Phonetic (-m)

### Rule #45: -aum, -amm, -urm, -elm

| Field | Value |
|---|---|
| **Gender** | **der** 🔵 |
| **Plural** | add **-e** + Umlaut |
| **Engine Rule(s)** | ✅ Rule 45: `aum$|amm$|urm$|elm$` → der (score 85) |

**Critical Boundaries & Exceptions:**

> Baum, Stamm, Turm, Helm.

**📝 Practice examples** (4):

- `Baum` <sub>✓ engine: der (A1/A2)</sub>
- `Stamm` <sub>✓ engine: der (Suffix)</sub>
- `Turm` <sub>✓ engine: der (A1/A2)</sub>
- `Helm` <sub>✓ engine: der (A1/A2)</sub>

---

### Rule #46: -m (Neut Roots)

| Field | Value |
|---|---|
| **Gender** | **das** 🟢 |
| **Plural** | add **-er** + Umlaut |
| **Engine Rule** | 🚫 *no direct suffix rule* — relies on lookup/compound/semantic |

**Critical Boundaries & Exceptions:**

> Rare native roots. Lamm → Lämmer.

**📝 Practice examples** (2):

- `Lamm` → Lämmer <sub>✓ engine: das (A1/A2)</sub>
- `Lämmer` <sub>✗ engine: der (Suffix)</sub>

---

### Rule #47: -orm (Loanwords)

| Field | Value |
|---|---|
| **Gender** | **die** 🔴 |
| **Plural** | add **-en** |
| **Engine Rule(s)** | ✅ Rule 46: `orm$` → die (score 75) |

**Critical Boundaries & Exceptions:**

> Form, Norm.

**📝 Practice examples** (2):

- `Form` <sub>✓ engine: die (Suffix)</sub>
- `Norm` <sub>✓ engine: die (Suffix)</sub>

---

## 📂 Phonetic (-pf)

### Rule #48: -opf, -umpf, -ampf

| Field | Value |
|---|---|
| **Gender** | **der** 🔵 |
| **Plural** | add **-e** + Umlaut |
| **Engine Rule(s)** | ✅ Rule 47: `opf$|umpf$|ampf$` → der (score 90) |

**Critical Boundaries & Exceptions:**

> 100% Masc gravity. Kopf, Kampf.

**📝 Practice examples** (2):

- `Kopf` <sub>✓ engine: der (A1/A2)</sub>
- `Kampf` <sub>✓ engine: der (Suffix)</sub>

---

## 📂 Phonetic (-r)

### Rule #49: -wur, -lur (Native)

| Field | Value |
|---|---|
| **Gender** | **der** 🔵 |
| **Plural** | add **-e** + Umlaut |
| **Engine Rule(s)** | ✅ Rule 48: `wur$|lur$` → der (score 80) |

**Critical Boundaries & Exceptions:**

> Schwur → Schwüre, Flur → Flure.

**📝 Practice examples** (4):

- `Schwur` → Schwüre <sub>✓ engine: der (Suffix)</sub>
- `Flur` → Flure <sub>✓ engine: der (Suffix)</sub>
- `Schwüre` <sub>✗ engine: die (Suffix)</sub>
- `Flure` <sub>✗ engine: die (Suffix)</sub>

---

### Rule #50: -pur, -nur (Native)

| Field | Value |
|---|---|
| **Gender** | **die** 🔴 |
| **Plural** | *varies* |
| **Engine Rule(s)** | ✅ Rule 49: `pur$|nur$` → die (score 75) |

**Critical Boundaries & Exceptions:**

> Spur → Spuren.

**📝 Practice examples** (2):

- `Spur` → Spuren <sub>✓ engine: die (Suffix)</sub>
- `Spuren` <sub>✗ engine: unknown (none)</sub>

---

### Rule #51: 1-Syllable -r (Neut)

| Field | Value |
|---|---|
| **Gender** | **das** 🟢 |
| **Plural** | add **-e** |
| **Engine Rule(s)** | ✅ Rule 51: `r$` → root (score 40) |

**Critical Boundaries & Exceptions:**

> Jahr, Tor.

**📝 Practice examples** (1):

- `Jahr` <sub>✓ engine: das (Sheet)</sub>

---

### Rule #52: 1-Syllable -r (Fem)

| Field | Value |
|---|---|
| **Gender** | **die** 🔴 |
| **Plural** | add **-en** |
| **Engine Rule(s)** | ✅ Rule 51: `r$` → root (score 40) |

**Critical Boundaries & Exceptions:**

> Tür, Uhr.

---

## 📂 Phonetic (-s)

### Rule #53: -eis, -uss, -ess, -rs, -ls

| Field | Value |
|---|---|
| **Gender** | **der** 🔵 |
| **Plural** | add **-e** + Umlaut |
| **Engine Rule(s)** | ✅ Rule 52: `eis$|uss$|rs$|ls$` → der (score 80) |

**Critical Boundaries & Exceptions:**

> Preis, Fluss, Kuss, Prozess, Kurs, Hals. Traps: Eis, Nuss.

**📝 Practice examples** (7):

- `Preis` <sub>✓ engine: der (Suffix)</sub>
- `Fluss` <sub>✓ engine: der (A1/A2)</sub>
- `Kuss` <sub>✓ engine: der (Suffix)</sub>
- `Prozess` <sub>✓ engine: der (Sheet)</sub>
- `Kurs` <sub>✓ engine: der (Suffix)</sub>
- `Hals` <sub>✓ engine: der (A1/A2)</sub>
- `Nuss` <sub>✗ engine: die (A1/A2)</sub>

---

### Rule #54: -ass, -oss (Masc)

| Field | Value |
|---|---|
| **Gender** | **der** 🔵 |
| **Plural** | add **-e** |
| **Engine Rule(s)** | ✅ Rule 53: `ass$|oss$` → root (score 70) |

**Critical Boundaries & Exceptions:**

> Pass → Pässe.

**📝 Practice examples** (2):

- `Pass` → Pässe <sub>✓ engine: der (A1/A2)</sub>
- `Pässe` <sub>✗ engine: die (Suffix)</sub>

---

### Rule #55: -ass, -oss (Neut)

| Field | Value |
|---|---|
| **Gender** | **das** 🟢 |
| **Plural** | add **-er** + Umlaut |
| **Engine Rule(s)** | ✅ Rule 53: `ass$|oss$` → root (score 70) |

**Critical Boundaries & Exceptions:**

> Fass → Fässer, Schloss → Schlösser.

**📝 Practice examples** (4):

- `Fass` → Fässer <sub>✓ engine: das (A1/A2)</sub>
- `Schloss` → Schlösser <sub>✓ engine: das (A1/A2)</sub>
- `Fässer` <sub>✗ engine: der (Suffix)</sub>
- `Schlösser` <sub>✗ engine: der (Suffix)</sub>

---

## 📂 Phonetic (-t)

### Rule #56: -ast, -ost, -ust

| Field | Value |
|---|---|
| **Gender** | **der** 🔵 |
| **Plural** | add **-e** + Umlaut |
| **Engine Rule(s)** | ✅ Rule 54: `ast$|ost$|ust$` → der (score 85) |

**Critical Boundaries & Exceptions:**

> Physical roots. Ast, Rost, Verlust.

**📝 Practice examples** (3):

- `Physical` <sub>✗ engine: unknown (root-dep)</sub>
- `Rost` <sub>✓ engine: der (Suffix)</sub>
- `Verlust` <sub>✓ engine: der (Suffix)</sub>

---

### Rule #57: -est, -elt, -ert

| Field | Value |
|---|---|
| **Gender** | **das** 🟢 |
| **Plural** | add **-e** |
| **Engine Rule(s)** | ✅ Rule 55: `est$|elt$|ert$` → das (score 80) |

**Critical Boundaries & Exceptions:**

> Physical roots. Fest, Zelt, Schwert.

**📝 Practice examples** (4):

- `Physical` <sub>✗ engine: unknown (root-dep)</sub>
- `Fest` <sub>✓ engine: das (Suffix)</sub>
- `Zelt` <sub>✓ engine: das (Suffix)</sub>
- `Schwert` <sub>✓ engine: das (Suffix)</sub>

---

## 📂 Phonetic (-ort)

### Rule #58: -port, -ort (Loans)

| Field | Value |
|---|---|
| **Gender** | **der** 🔵 |
| **Plural** | add **-e** |
| **Engine Rule** | 🚫 *no direct suffix rule* — relies on lookup/compound/semantic |

**Critical Boundaries & Exceptions:**

> Transport, Export, Import.

**📝 Practice examples** (3):

- `Transport` <sub>✗ engine: unknown (none)</sub>
- `Export` <sub>✗ engine: unknown (none)</sub>
- `Import` <sub>✗ engine: unknown (none)</sub>

---

### Rule #59: Native -ort (Masc)

| Field | Value |
|---|---|
| **Gender** | **der** 🔵 |
| **Plural** | add **-e** |
| **Engine Rule** | 🚫 *no direct suffix rule* — relies on lookup/compound/semantic |

**Critical Boundaries & Exceptions:**

> der Ort → Orte.

**📝 Practice examples** (2):

- `Ort` → Orte <sub>✓ engine: der (A1/A2)</sub>
- `Orte` <sub>✗ engine: die (Suffix)</sub>

---

### Rule #60: Native -ort (Neut)

| Field | Value |
|---|---|
| **Gender** | **das** 🟢 |
| **Plural** | add **-er** + Umlaut |
| **Engine Rule** | 🚫 *no direct suffix rule* — relies on lookup/compound/semantic |

**Critical Boundaries & Exceptions:**

> das Wort → Wörter.

**📝 Practice examples** (2):

- `Wort` → Wörter <sub>✓ engine: das (Sheet)</sub>
- `Wörter` <sub>✗ engine: der (Suffix)</sub>

---

### Rule #61: Antwort (Compound)

| Field | Value |
|---|---|
| **Gender** | **die** 🔴 |
| **Plural** | add **-en** |
| **Engine Rule** | 🚫 *no direct suffix rule* — relies on lookup/compound/semantic |

**Critical Boundaries & Exceptions:**

> die Antwort → Antworten.

**📝 Practice examples** (2):

- `Antwort` → Antworten <sub>✓ engine: die (A1/A2)</sub>
- `Antworten` <sub>✗ engine: unknown (none)</sub>

---

## 📂 Phonetic (-z)

### Rule #62: -atz, -itz, -utz, -z

| Field | Value |
|---|---|
| **Gender** | **der** 🔵 |
| **Plural** | add **-e** + Umlaut |
| **Engine Rule(s)** | ✅ Rule 56: `atz$|itz$|utz$|z$` → der (score 75) |

**Critical Boundaries & Exceptions:**

> Platz, Witz, Blitz, Schatz.

**📝 Practice examples** (4):

- `Platz` <sub>✓ engine: der (A1/A2)</sub>
- `Witz` <sub>✓ engine: der (A1/A2)</sub>
- `Blitz` <sub>✓ engine: der (A1/A2)</sub>
- `Schatz` <sub>✓ engine: der (A1/A2)</sub>

---

### Rule #63: -etz

| Field | Value |
|---|---|
| **Gender** | **das** 🟢 |
| **Plural** | add **-e** |
| **Engine Rule(s)** | ✅ Rule 57: `etz$` → das (score 90) |

**Critical Boundaries & Exceptions:**

> Netz, Gesetz.

**📝 Practice examples** (2):

- `Netz` <sub>✓ engine: das (A1/A2)</sub>
- `Gesetz` <sub>✓ engine: das (Sheet)</sub>

---

## 📂 Foreign Loans

### Rule #64: -c, -j, -w, -x, -y, -p

| Field | Value |
|---|---|
| **Gender** | *root-dep* ⚪ |
| **Plural** | add **-s** |
| **Engine Rule(s)** | ✅ Rule 58: `c$|j$|w$|x$|y$` → root (score 50)<br>✅ Rule 59: `p$` → root (score 40) |

**Critical Boundaries & Exceptions:**

> Macs, Shows, Partys, Babys, Shops.

**📝 Practice examples** (5):

- `Macs` <sub>✗ engine: unknown (none)</sub>
- `Shows` <sub>✗ engine: unknown (none)</sub>
- `Partys` <sub>✗ engine: unknown (none)</sub>
- `Babys` <sub>✗ engine: unknown (none)</sub>
- `Shops` <sub>✗ engine: unknown (none)</sub>

---

## 📂 Semantic

### Rule #65: Komposita (Compounds)

| Field | Value |
|---|---|
| **Gender** | null |
| **Plural** | Dictated by Word B |
| **Engine Rule** | 🚫 *no direct suffix rule* — relies on lookup/compound/semantic |

**Critical Boundaries & Exceptions:**

> The last word governs everything.

---

## 📂 Phonetic (-f)

### Rule #25: -of, -uf, -ief

| Field | Value |
|---|---|
| **Gender** | **der** 🔵 |
| **Plural** | add **-e** |
| **Engine Rule(s)** | ✅ Rule 30: `of$|uf$|ief$` → der (score 85) |

**Critical Boundaries & Exceptions:**

> Hof → Höfe, Brief → Briefe.

**📝 Practice examples** (4):

- `Hof` → Höfe <sub>✓ engine: der (Suffix)</sub>
- `Brief` → Briefe <sub>✓ engine: der (A1/A2)</sub>
- `Höfe` <sub>✗ engine: die (Suffix)</sub>
- `Briefe` <sub>✗ engine: die (Suffix)</sub>

---

### Rule #26: -iff, -af

| Field | Value |
|---|---|
| **Gender** | **das** 🟢 |
| **Plural** | add **-e** |
| **Engine Rule(s)** | ✅ Rule 31: `iff$|af$` → das (score 85) |

**Critical Boundaries & Exceptions:**

> Schiff → Schiffe.

**📝 Practice examples** (2):

- `Schiff` → Schiffe <sub>✓ engine: das (A1/A2)</sub>
- `Schiffe` <sub>✗ engine: die (Suffix)</sub>

---

## ⚠️ Rule Mismatches (spec says X, engine rule says Y)

These are places where the engine's suffix rule disagrees with the spec. Often the engine is correct via lookup, but the rule itself is fragile:

| Spec Rule | Indicator | Spec Gender | Conflicting Engine Rules |
|---|---|---|---|
| #16 | -el, -er, -en (Abstracts) | **das** 🟢 | Rule 50: `er$` → der (score 55) |
| #18 | -ar, -ier (Neut Roots) | **das** 🟢 | Rule 19: `ar$` → der (score 70) |
| #30 | -and, -ind, -ad (Neut) | **das** 🟢 | Rule 34: `ad$|ind$` → der (score 60)<br>Rule 35: `and$` → der (score 55) |
| #39 | Silent -h (Neut) | **das** 🟢 | Rule 40: `h$` → der (score 55) |
| #40 | Silent -h (Fem) | **die** 🔴 | Rule 40: `h$` → der (score 55) |
| #44 | -l, -ll (Neut) | **das** 🟢 | Rule 44: `ll$` → der (score 60) |

## 🚫 Spec Rules Without Direct Engine Suffix Rule (11)

These rely on lookup tables (A1/A2, TopFreq, Sheet) or compound decomposition. Engine can still get them right via memory, but won't generalize:

| # | Category | Indicator | Gender |
|---|---|---|---|
| 2 | Supreme Semantic | Male Humans & Animals | **der** 🔵 |
| 3 | Supreme Semantic | Metals & Chemical Elements | **das** 🟢 |
| 8 | Structural (Fem) | Action + t / st / ft | **die** 🔴 |
| 35 | Phonetic (-ee) | -ee (Substances/Plants) | **der** 🔵 |
| 36 | Phonetic (-ee) | -ee (Abstract/French) | **die** 🔴 |
| 46 | Phonetic (-m) | -m (Neut Roots) | **das** 🟢 |
| 58 | Phonetic (-ort) | -port, -ort (Loans) | **der** 🔵 |
| 59 | Phonetic (-ort) | Native -ort (Masc) | **der** 🔵 |
| 60 | Phonetic (-ort) | Native -ort (Neut) | **das** 🟢 |
| 61 | Phonetic (-ort) | Antwort (Compound) | **die** 🔴 |
| 65 | Semantic | Komposita (Compounds) | null |

## 🎓 Practice Order Recommendation

Based on the rule reliability (high score + low exceptions), study in this order:

1. **Supreme Structural** (1 rule): `-chen, -lein` → always das  
2. **Supreme Semantic** (2 rules): male humans/animals → der; metals → das  
3. **Structural Fem** (high reliability): `-ung, -heit, -keit, -schaft, -ion, -tur, -ik, -in, -ei`  
4. **Structural Masc** (high reliability): `-ismus, -ent, -ant, -ist, -ig`  
5. **Structural Neut** (high reliability): `-nis, -um, -tum, -ment, -ma`  
6. **Phonetic** (medium reliability, study patterns one letter at a time)  
7. **Foreign Loans** (root-dependent, learn by exposure)  
8. **Compounds** (last word governs)  

## 🔁 Drill Strategy

For each rule:
1. Read the indicator and dictated gender  
2. Make up 3 example words matching the pattern  
3. Try to remember 1 trap from the exceptions  
4. Move to next rule only after you can produce 5 correct words in 30 seconds  

---

*Generated by rule-audit-v3.cjs · For Jasper's noun practice*
