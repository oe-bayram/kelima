# Analyse: Grammatische Formen vervollständigen

Datensatz: **3.026 Stichwörter** (+ 21 Wortgruppen). Aktuell hat jeder Eintrag nur einen Grund‑Formensatz. Diese Analyse zeigt je Wortart die **möglichen** grammatischen Formen und **wie oft sie fehlen**.

## 1. Wortarten‑Übersicht

| Wortart | Anzahl | veränderlich? | Formen je Eintrag heute |
|---|---:|---|---|
| Nomen | 1.581 | ja (Kasus, Numerus, Genus) | Nom. Singular + Nom. Plural (+ weibl. Form bei Personen) |
| Verb | 678 | ja (Person, Tempus, Modus) | Infinitiv, Präs. 3. Sg, Prät. 3. Sg, Perfekt 3. Sg |
| Adjektiv | 453 | ja (Steigerung, Deklination) | nur Grundform |
| Adverb | 173 | meist nein (wenige steigerbar) | Grundform |
| Präposition | 38 | nein (aber feste Rektion) | Grundform |
| Konjunktion | 27 | nein | Grundform |
| Pronomen | 24 | teils (Kasus) | Grundform |
| Partikel | 20 | nein | Grundform |
| Wendung | 22 | nein (Mehrwortausdruck) | Grundform |
| Interjektion | 9 | nein | Grundform |
| Numerale | 1 | teils | Grundform |
| **Summe** | **3.026** | | |

Veränderlich und damit relevant für die Vervollständigung sind vor allem **Nomen, Verben und Adjektive** (zusammen 2.712 Einträge). Die übrigen Wortarten (314) sind grammatisch unveränderlich – hier gibt es nichts zu ergänzen (Ausnahmen: einige steigerbare Adverbien, Präpositions‑Rektion, Personalpronomen‑Deklination; siehe unten).

---

## 2. Mögliche Formen je Wortart + Fehl‑Statistik

### 2.1 Nomen (1.581)

Vollständige Deklination = **4 Kasus × 2 Numeri = 8 Formen** (jeweils mit Artikel). Bei Personenbezeichnungen zusätzlich die weibliche Entsprechung.

| Grammatische Form | Beispiel (der Tisch) | fehlt bei … |
|---|---|---:|
| Nominativ Singular | der Tisch | 3 |
| Genitiv Singular | des Tisch**es** | **1.561** |
| Dativ Singular | dem Tisch | **1.561** |
| Akkusativ Singular | den Tisch | **1.561** |
| Nominativ Plural | die Tische | 281\* |
| Genitiv Plural | der Tische | **1.581** |
| Dativ Plural | den Tische**n** | **1.581** |
| Akkusativ Plural | die Tische | **1.581** |

\* Die 281 „fehlenden" Plurale sind ganz überwiegend **unzählbare Nomen** (z. B. *die Milch, das Obst, der Schnee*) und die 20 **Nur‑Plural‑Wörter** – dort ist kein Plural bzw. kein Singular möglich. Echte Extraktionslücken sind nur eine Handvoll.

Zusatz: 84 Personenbezeichnungen haben bereits die weibliche Form (Nom.); deren Kasus‑Deklination fehlt ebenfalls noch.

### 2.2 Verb (678)

Vorhanden sind 4 Kernformen. Ein vollständiges (B1‑relevantes) Paradigma umfasst deutlich mehr:

| Grammatische Form | Beispiel (gehen) | Status |
|---|---|---|
| Infinitiv | gehen | ✅ vorhanden (678) |
| Präsens 3. Sg | geht | ✅ vorhanden (678) |
| Präteritum 3. Sg | ging | ✅ vorhanden (678) |
| Perfekt 3. Sg | ist gegangen | ✅ vorhanden (678) |
| Präsens – übrige 5 Personen | ich gehe, du gehst, wir/ihr/sie … | ❌ fehlt bei 678 |
| Präteritum – übrige 5 Personen | ich ging, du gingst … | ❌ fehlt bei 678 |
| Perfekt – übrige 5 Personen | ich bin gegangen … | ❌ fehlt bei 678 |
| Imperativ (du / ihr / Sie) | geh! / geht! / gehen Sie! | ❌ fehlt bei 678 |
| Partizip II (einzeln) | gegangen | ❌ fehlt bei 678 |
| Konjunktiv II 3. Sg | ginge / würde gehen | ❌ fehlt bei 678 |
| Futur I 3. Sg | wird gehen | ❌ fehlt bei 678 |
| (optional) Partizip I, zu‑Infinitiv, Plusquamperfekt, Futur II, Konjunktiv I, Passiv | gehend, zu gehen … | ❌ fehlt bei 678 |

Das Hilfsverb (haben/sein), Trennbarkeit und Reflexivität sind pro Verb bereits als Attribute gespeichert – die Konjugation kann daraus regelbasiert erzeugt werden.

### 2.3 Adjektiv (453)

| Grammatische Form | Beispiel (schnell) | fehlt bei … |
|---|---|---:|
| Positiv (Grundform) | schnell | ✅ vorhanden |
| Komparativ | schneller | **453** |
| Superlativ | am schnellsten | **453** |
| (optional) Deklinationsendungen (stark/schwach/gemischt × Kasus × Genus) | schnelle, schnellen … | fehlt bei allen |

Hinweis: einige Adjektive sind nicht steigerbar (z. B. *tot, schwanger, ganz*) – diese bleiben ohne Komparativ/Superlativ.

### 2.4 Unveränderliche Wortarten (314)

- **Adverb (173)**: grundsätzlich keine Formen. Ausnahme: wenige steigerbare Adverbien (*gern → lieber → am liebsten*, *oft → öfter*, *bald → eher*). Betrifft nur eine Handvoll.
- **Präposition (38)**: keine Formen, aber feste **Rektion** (regierter Kasus, z. B. *mit + Dativ*) könnte als Attribut ergänzt werden.
- **Pronomen (24)**: Personalpronomen wären deklinierbar (ich/mich/mir …) – Sonderfälle.
- **Konjunktion (27), Partikel (20), Interjektion (9), Wendung (22), Numerale (1)**: keine zu ergänzenden Formen.

---

## 3. Zusammenfassung – zu ergänzende Formen

| Bereich | Neue Formen (ca.) |
|---|---:|
| Nomen – Kasus Singular (Gen/Dat/Akk) | ~4.700 |
| Nomen – Kasus Plural (Gen/Dat/Akk) | ~3.900 |
| Verb – volle Konjugation (Präsens/Präteritum/Perfekt je 6, Imperativ, Partizip II, Konjunktiv II, Futur I) | ~13.000 |
| Adjektiv – Komparativ + Superlativ | ~900 |
| **Gesamt (Richtwert)** | **~22.000 zusätzliche Formen** |

Die Menge ist groß, aber deutsche Deklination/Konjugation ist weitgehend **regelbasiert**. Der effiziente Weg ist ein **Morphologie‑Generator** (Regeln + Liste der unregelmäßigen Verben/Steigerungen), nicht das Abtippen von 22.000 Formen. So bleiben Konsistenz und Qualität hoch.

---

## 4. Offene Entscheidungen (für den nächsten Schritt)

1. **Verb‑Tiefe**: Kernparadigma (Präsens + Präteritum + Perfekt je 6 Personen, Imperativ, Partizip II) – oder zusätzlich Konjunktiv II / Futur I / weitere?
2. **Nomen**: volle 4‑Kasus‑Tabelle (Sg + Pl) – ja/nein?
3. **Adjektiv**: Komparativ + Superlativ (empfohlen) – Deklinationsendungen eher nicht (Explosion an Formen).
4. **Übersetzung**: Sollen die neuen Formen ebenfalls türkische Entsprechungen bekommen (bei Verben sinnvoll: *gehe = gidiyorum*; bei Nomen‑Kasus eher die Kasus‑Endung: Dativ *-e*, Akkusativ *-i*)?
