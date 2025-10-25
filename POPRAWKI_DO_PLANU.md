# POPRAWKI DO PLANU OPTYMALIZACJI

## ✅ Zatwierdzone przez użytkownika

### 1. Czyszczenie pamięci - TYLKO przy "Nowe porównanie"

**❌ USUŃ** z planu:
- Czyszczenie pamięci przy przełączaniu między parami (`loadPair()`)
- `cleanupPreviousPair()` przy każdej zmianie pary

**✅ DODAJ** do planu:
- Czyszczenie pamięci TYLKO w `resetAndUpload()` (przycisk "🔄 Nowe porównanie")
- Funkcja `cleanupAllMaps()` wywoływana raz, na końcu analizy
- Użytkownik MUSI móc swobodnie przełączać się między 20 parami bez utraty danych

### 2. Pixel Diff - JEDEN canvas z żółtymi plamkami

**❌ USUŃ** z planu:
- Tworzenie 2 canvasów (OLD + NEW) w `prepareCanvasesForPixelDiff()`
- Przechowywanie kopii map w pamięci

**✅ DODAJ** do planu:
- `comparePixels()` pobiera już wyrenderowane canvasy z DOM
- Tworzy TYLKO jeden diffCanvas z żółtymi plamkami
- Żółty jak NEONOWY ZAKREŚLACZ - czarny tekst się przebija spod spodu
- Overlay nakładany na istniejące porównanie

**Oszczędność pamięci:**
- PRZED: 40 stron × 2 canvasy × 17 MB = 1360 MB
- PO: 0 MB (używamy DOM) + ~10 MB diffCanvas na żądanie
- **OSZCZĘDNOŚĆ: ~1350 MB!**

### 3. Frame Detection - POMIŃ

**❌ USUŃ** z planu całą sekcję 4.5:
- Optymalizacja Frame Detection
- Użycie optymalnej skali dla detekcji
- Cleanup canvasów po detekcji

**Powód:** Użytkownik pracuje nad nową, prostszą logiką frame detection.

---

## Zaktualizowana Lista Optymalizacji

### PRIORYTET 1 (Tydzień 1)
1. ✅ **Dynamiczna skala** - A4→200 DPI, A0→384 DPI
2. ✅ **Przycisk "Zwiększ jakość"** - 300 DPI na żądanie
3. ✅ **Pixel Diff - jeden canvas** - żółte plamki jako overlay

### PRIORYTET 2 (Tydzień 2)  
4. ✅ **Czyszczenie przy "Nowe porównanie"** - tylko `resetAndUpload()`
5. ✅ **Fuzzy Matching early exit** - szybsze dopasowywanie

### ~~PRIORYTET 3~~ - USUNIĘTE
- ~~Frame Detection optymalizacja~~ - nie implementować

---

## Oczekiwane Rezultaty Po Zmianach

| Metryka | Przed | Po | Poprawa |
|---------|-------|-----|---------|
| **RAM (20 par A4)** | 2580 MB | ~900 MB | 65% ↓ |
| **RAM (Pixel Diff)** | +1360 MB | +10 MB | 99% ↓ |
| **Ładowanie** | 60 sek | 25-30 sek | 50% ↓ |
| **Swoboda przełączania** | ✅ Tak | ✅ TAK | Zachowane! |

---

## Kluczowe Funkcje Do Implementacji

```javascript
// 1. Dynamiczna skala
function getOptimalScale(pdfPage) {
    // ... kod wykrywania rozmiaru ...
    // A4 → 2.1, A3 → 2.5, A2 → 3.0, A1 → 3.5, A0 → 4.0
}

// 2. Przycisk boost
async function boostCurrentPairQuality() {
    // Przerenderuj tylko aktualną parę do 300 DPI
}

// 3. Pixel Diff z jednym canvasem
async function comparePixels(pair, pageNum) {
    // Pobierz canvasy z DOM
    const oldCanvas = document.querySelector(...);
    const newCanvas = document.querySelector(...);
    
    // Stwórz TYLKO diffCanvas (żółte plamki)
    const diffCanvas = createDiffOverlay(oldData, newData);
    return [{ diffCanvas }];
}

function createDiffOverlay(oldData, newData) {
    // Żółty neonowy zakreślacz
    // Czarny tekst się przebija (luminance < 80 → alpha = 0)
}

// 4. Czyszczenie TYLKO przy reset
function resetAndUpload() {
    cleanupAllMaps(); // <-- TYLKO TU!
    // ... reset state ...
}

// 5. Fuzzy matching early exit
function levenshteinDistance(str1, str2, maxDistance) {
    // Wczesne wyjście jeśli różnica > maxDistance
}
```

---

## Co NIE zmieniać

✅ Zachować możliwość swobodnego przełączania między parami
✅ Nie czyścić pamięci podczas normalnej pracy
✅ Nie dotykać frame detection (nowa logika w przygotowaniu)
✅ Zachować wszystkie tryby porównywania (sidebyside, toggle, overlay)

---

**Status:** ✅ Gotowe do wdrożenia po akceptacji użytkownika
**Następny krok:** Potwierdzenie zmian i rozpoczęcie implementacji

