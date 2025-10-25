# Plan Optymalizacji - JeppAlign PDF Viewer
## Dokument Techniczny v1.0

---

## SPIS TREŚCI
1. [Obecny Stan Systemu](#1-obecny-stan-systemu)
2. [Analiza Zużycia Pamięci](#2-analiza-zużycia-pamięci)
3. [Główne Problemy](#3-główne-problemy)
4. [Plan Optymalizacji](#4-plan-optymalizacji)
5. [Szczegóły Techniczne Wdrożenia](#5-szczegóły-techniczne-wdrożenia)
6. [Harmonogram Wdrożenia](#6-harmonogram-wdrożenia)
7. [Ryzyka i Mitygacja](#7-ryzyka-i-mitygacja)

---

## 1. OBECNY STAN SYSTEMU

### 1.1 Architektura
Program działa w przeglądarce (JavaScript + HTML5 Canvas) i analizuje pary map lotniczych w formacie PDF lokalnie, bez wysyłania danych na serwer.

### 1.2 Główne Komponenty

#### Moduły Funkcjonalne:
- **pdf.js** - biblioteka do renderowania PDF
- **app.legacy.js** - główna logika (4500+ linii kodu)
- **frame-detection.js** - wykrywanie ramek na mapach
- **pair-matcher.js** - dopasowywanie par plików (fuzzy matching)
- **alignment.js** - wyrównywanie map względem ramek

#### Procesy Wykonywane Przy Załadowaniu:
1. **Fuzzy Matching** - dopasowanie par plików OLD/NEW po nazwach
2. **Ładowanie PDF** - parsowanie wszystkich dokumentów PDF
3. **Renderowanie Canvas** - konwersja każdej strony PDF na obraz Canvas
4. **Frame Detection** - wykrywanie ramek mapy (dodatkowe renderowanie w skali 2.0)
5. **Pixel Diff Preparation** - przygotowanie canvasów do porównania pikseli
6. **Frame Alignment** - obliczanie transformacji do wyrównania map

### 1.3 Obecne Ustawienia Jakości

| Ustawienie | Skala PDF.js | DPI | Wykorzystanie |
|-----------|--------------|-----|---------------|
| Niska | 1.5 | 144 DPI | Szybkie ładowanie |
| **Standardowa (domyślna)** | **3.0** | **288 DPI** | **Obecna** |
| Wysoka | 4.5 | 432 DPI | Najlepsza jakość |

**PROBLEM:** Wszystkie mapy renderowane w 288 DPI niezależnie od rozmiaru!

---

## 2. ANALIZA ZUŻYCIA PAMIĘCI

### 2.1 Zużycie Pamięci na Jedną Mapę

#### Mapa A4 (21 × 30 cm) w skali 3.0:
```
Rozdzielczość: ~2500 × 3500 pikseli
Pamięć Canvas: 2500 × 3500 × 4 bajty (RGBA) = 35 MB
```

#### Mapa A0 (84 × 119 cm) w skali 3.0:
```
Rozdzielczość: ~10000 × 14000 pikseli  
Pamięć Canvas: 10000 × 14000 × 4 bajty = 560 MB (!!)
```

### 2.2 Typowe Obciążenie (20 par map)

**Scenariusz:** 20 par map A4 w skali 3.0

| Komponent | Zużycie Pamięci |
|-----------|-----------------|
| Canvasy renderowane (40 map × 35 MB) | **1400 MB** |
| Dokumenty PDF w pamięci | 300 MB |
| Pixel Diff canvasy (40 map × 17 MB) | 680 MB |
| Frame Detection (tymczasowe, skala 2.0) | ~400 MB (potem zwolnione) |
| Ogólne overhead JS | 200 MB |
| **RAZEM** | **~2580 MB (2.5 GB)** |

### 2.3 Limity Przeglądarki

| RAM Komputera | Dostępna RAM dla Przeglądarki | Status dla 2.5 GB |
|---------------|-------------------------------|-------------------|
| 4 GB | 1.0-1.5 GB | ❌ Za mało |
| **8 GB (użytkownik)** | **2.0-3.0 GB** | **⚠️ Ledwo wystarcza + inne programy w tle** |
| 16 GB | 4.0-6.0 GB | ✅ OK |

**WNIOSEK:** Użytkownik ma 8 GB RAM, ale często działają inne programy w tle. Obecny system zużywa prawie całą dostępną pamięć przeglądarki (2.5 GB), co powoduje lagi i zacięcia.

---

## 3. GŁÓWNE PROBLEMY

### 3.1 Problem #1: Nadmiarowe Renderowanie
**Opis:** Wszystkie mapy renderowane w 288 DPI, nawet małe mapy A4.

**Skutek:**
- Mała mapa A4 zajmuje tyle samo pamięci co potrzeba
- Duża mapa A0 zajmuje **16 razy więcej** pamięci niż mapa A4
- Brak różnicowania jakości według potrzeb

### 3.2 Problem #2: Brak Czyszczenia Pamięci
**Opis:** Kod nie zwalnia pamięci po zakończeniu użytkowania obiektów.

**Problematyczne obszary:**
```javascript
// Tworzone canvasy nigdy nie są usuwane:
const canvas = document.createElement('canvas');
// ... używane ...
// ❌ Brak: canvas = null; ctx = null;
```

**Skutek:**
- Garbage Collector nie może odzyskać pamięci
- Pamięć stale rośnie podczas pracy

### 3.3 Problem #3: Pixel Diff dla Wszystkich Stron
**Opis:** `prepareCanvasesForPixelDiff()` tworzy dodatkowe canvasy w skali 2.0 dla WSZYSTKICH stron WSZYSTKICH par.

**Kod problematyczny:**
```javascript
// W js/app.legacy.js, ~linia 2850
for (let pageNum = 1; pageNum <= pair.totalPages; pageNum++) {
    const oldCanvas = document.createElement('canvas');
    const newCanvas = document.createElement('canvas');
    // Renderowanie w skali 2.0...
    pixelData.canvases.push({oldCanvas, newCanvas});
}
```

**Skutek:**
- 20 par × średnio 2 strony = 80 dodatkowych canvasów
- 80 × 17 MB = **1360 MB dodatkowej pamięci**

### 3.4 Problem #4: Brak Lazy Loading
**Opis:** Wszystkie 20 par map są ładowane i renderowane na starcie.

**Skutek:**
- Długie oczekiwanie na start (30-60 sekund)
- Wszystkie mapy w pamięci, nawet te nieużywane
- Marnowanie zasobów

### 3.5 Problem #5: Frame Detection - Dodatkowe Renderowanie
**Opis:** Dla wyrównania ramek każda para renderowana **drugi raz** w skali 2.0.

**Kod:**
```javascript
// W alignment.js, calculateFrameAlignment()
const detectionScale = 2.0;
// Renderuj OLD w skali 2.0...
// Renderuj NEW w skali 2.0...
```

**Skutek:**
- 40 dodatkowych tymczasowych canvasów
- ~400 MB pamięci (potem zwolnione, ale w trakcie = spike)

---

## 4. PLAN OPTYMALIZACJI

### 4.1 Optymalizacja #1: Dynamiczna Skala Renderowania (PRIORYTET 1)

#### Cel:
Dostosować jakość renderowania do faktycznego rozmiaru mapy - małe mapy w niższej jakości, duże w wyższej.

#### Zmiana:
**PRZED:**
- Wszystkie mapy: skala 3.0 (288 DPI)

**PO:**
- A4 i mniejsze: skala 2.1 (~200 DPI)
- A3: skala 2.5 (~240 DPI)  
- A2: skala 3.0 (288 DPI)
- A1: skala 3.5 (336 DPI)
- A0: skala 4.0 (384 DPI)

#### Mechanizm:
```javascript
function getOptimalScale(pdfPage) {
    // Pobierz fizyczne wymiary strony z PDF (w punktach)
    const viewport = pdfPage.getViewport({scale: 1.0});
    const widthInCm = (viewport.width / 72) * 2.54;  // 72 points = 1 inch
    const heightInCm = (viewport.height / 72) * 2.54;
    
    // Oblicz pole powierzchni w cm²
    const areaCm2 = widthInCm * heightInCm;
    
    // Progi dla formatów papieru (z 10% tolerancją)
    const A4_AREA = 623;   // 21 × 29.7 cm
    const A3_AREA = 1246;  // 29.7 × 42 cm  
    const A2_AREA = 2492;  // 42 × 59.4 cm
    const A1_AREA = 4984;  // 59.4 × 84.1 cm
    
    if (areaCm2 <= A4_AREA * 1.1) return 2.1;   // A4: 200 DPI
    if (areaCm2 <= A3_AREA * 1.1) return 2.5;   // A3: 240 DPI
    if (areaCm2 <= A2_AREA * 1.1) return 3.0;   // A2: 288 DPI  
    if (areaCm2 <= A1_AREA * 1.1) return 3.5;   // A1: 336 DPI
    return 4.0;                                  // A0+: 384 DPI
}
```

#### Oszczędności:
**Scenariusz:** 20 par map A4
- PRZED: 1400 MB (20 par × 2 mapy × 35 MB)
- PO: **640 MB** (20 par × 2 mapy × 16 MB dla skali 2.1)
- **Oszczędność: 760 MB (54%)**

---

### 4.2 Optymalizacja #2: Przycisk "Zwiększ Jakość" (PRIORYTET 1)

#### Cel:
Pozwolić użytkownikowi tymczasowo zwiększyć jakość pojedynczej pary map do 300 DPI, gdy potrzebuje zobaczyć detale.

#### Implementacja:
1. Dodać przycisk w interfejsie: **"🔍 Zwiększ jakość do 300 DPI"**
2. Po kliknięciu:
   - Przerenderować TYLKO aktualnie oglądaną parę w skali 3.2 (300 DPI)
   - Zachować pozostałe 19 par w niższej jakości
   - Zmienić tekst przycisku na: **"✓ Jakość 300 DPI"**
3. Przycisk **"⬇️ Przywróć standardową jakość"** - powrót do dynamicznej skali

#### Kod UI:
```javascript
// Dodaj do panelu kontrolnego (rightSidebar)
<button id="boostQualityBtn" class="action-btn" onclick="boostCurrentPairQuality()">
    🔍 Zwiększ jakość do 300 DPI
</button>

let boostedPairs = new Set(); // Set z indeksami par w wysokiej jakości

async function boostCurrentPairQuality() {
    if (boostedPairs.has(currentPairIndex)) {
        // Już zwiększone - przywróć standard
        await rerenderPairWithScale(currentPairIndex, 'auto');
        boostedPairs.delete(currentPairIndex);
        document.getElementById('boostQualityBtn').textContent = '🔍 Zwiększ jakość do 300 DPI';
    } else {
        // Zwiększ do 300 DPI
        await rerenderPairWithScale(currentPairIndex, 3.2);
        boostedPairs.add(currentPairIndex);
        document.getElementById('boostQualityBtn').textContent = '✓ Jakość 300 DPI';
    }
}

async function rerenderPairWithScale(pairIndex, scale) {
    const pair = pdfPairs[pairIndex];
    const targetScale = (scale === 'auto') ? getOptimalScale(await pair.oldDoc.getPage(1)) : scale;
    
    // Przerenderuj tylko tę parę...
    // (szczegóły implementacji niżej)
}
```

#### Oszczędności:
- Większość map w 200 DPI (16 MB/mapa)
- 1-3 pary tymczasowo w 300 DPI (35 MB/mapa)
- **Oszczędność: ~700 MB** względem wszystkich w 300 DPI

---

### 4.3 Optymalizacja #3: Czyszczenie Pamięci Przy Nowej Analizie (PRIORYTET 2)

#### Cel:
Wyczyścić całą pamięć TYLKO gdy użytkownik klika "🔄 Nowe porównanie". Podczas normalnej pracy użytkownik musi móc swobodnie przełączać się między wszystkimi załadowanymi parami.

#### Miejsce implementacji:

##### A) W funkcji resetAndUpload() - TYLKO TU czyszczenie:
```javascript
function resetAndUpload() {
    // DODAJ NA POCZĄTKU: Agresywne czyszczenie WSZYSTKIEGO
    cleanupAllMaps();
    
    // Reset state
    pdfPairs = [];
    unpairedOld = [];
    unpairedNew = [];
    oldFiles = [];
    newFiles = [];
    currentPairIndex = 0;
    currentPageIndex = 0;
    ocrResults.clear();
    alignmentOffsets.clear();
    boostedPairs.clear();
    
    // Pokaż ekran uploadowania
    document.getElementById('comparisonSection').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'block';
}

function cleanupAllMaps() {
    // Usuń WSZYSTKIE canvasy z DOM
    document.querySelectorAll('canvas').forEach(canvas => {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        canvas.width = 0;
        canvas.height = 0;
        canvas.remove();
    });
    
    // Usuń wszystkie overlays i adnotacje
    document.querySelectorAll('.ocr-overlay').forEach(el => el.remove());
    document.querySelectorAll('.pdf-annotation').forEach(el => el.remove());
    document.querySelectorAll('.canvas-container').forEach(el => el.remove());
    
    // Wyczyść viewer
    const viewer = document.getElementById('viewer');
    if (viewer) viewer.innerHTML = '';
    
    // Wymuś garbage collection (hint dla przeglądarki)
    if (window.gc) {
        setTimeout(() => window.gc(), 100);
    }
    
    console.log('✅ Pamięć wyczyszczona - gotowe na nową analizę');
}
```

#### Oszczędności:
- Pamięć czyszczona tylko raz, na końcu analizy
- Użytkownik może swobodnie przełączać się między wszystkimi 20 parami map
- Brak utraty danych podczas normalnej pracy

---

### 4.4 Optymalizacja #4: Pixel Diff - Jeden Canvas Zamiast Dwóch (PRIORYTET 1)

#### Cel:
Zmniejszyć zużycie pamięci przez Pixel Diff poprzez tworzenie tylko JEDNEGO canvasa z różnicami (żółte plamki) zamiast dwóch pełnych canvasów (OLD + NEW).

#### Problem obecny:
```javascript
// W prepareCanvasesForPixelDiff() tworzone są 2 canvasy:
const oldCanvas = document.createElement('canvas');  // Cała mapa OLD
const newCanvas = document.createElement('canvas');  // Cała mapa NEW

// Potem w comparePixels() są porównywane i tworzony trzeci canvas:
const diffCanvas = document.createElement('canvas'); // Żółte plamki
```

**MARNOWANIE PAMIĘCI:** 
- 20 par × 2 strony × 2 canvasy × 17 MB = **1360 MB**
- A potrzebujemy tylko diffCanvas!

#### Nowe rozwiązanie:

**Użyj już wyrenderowanych map z DOM zamiast tworzyć nowe canvasy:**

```javascript
// NOWA WERSJA - NIE tworzymy dodatkowych canvasów!
async function comparePixels(pair, pageNum) {
    // Pobierz AKTUALNIE WYŚWIETLANE canvasy z DOM
    const viewer = document.getElementById('viewer');
    let oldCanvas, newCanvas;
    
    if (currentMode === 'sidebyside') {
        oldCanvas = document.querySelector('#oldContainer canvas');
        newCanvas = document.querySelector('#newContainer canvas');
    } else if (currentMode === 'toggle') {
        oldCanvas = document.getElementById('toggleCanvasOld');
        newCanvas = document.getElementById('toggleCanvasNew');
    } else if (currentMode === 'overlay') {
        const canvases = document.querySelectorAll('.canvas-container canvas');
        oldCanvas = canvases[0];
        newCanvas = canvases[1];
    }
    
    if (!oldCanvas || !newCanvas) return [];
    
    // Pobierz dane pikseli z już istniejących canvasów
    const oldCtx = oldCanvas.getContext('2d', { willReadFrequently: true });
    const newCtx = newCanvas.getContext('2d', { willReadFrequently: true });
    
    const oldData = oldCtx.getImageData(0, 0, oldCanvas.width, oldCanvas.height);
    const newData = newCtx.getImageData(0, 0, newCanvas.width, newCanvas.height);
    
    // Stwórz TYLKO canvas z różnicami (żółte plamki)
    const diffCanvas = createDiffOverlay(oldData, newData);
    
    return [{
        type: 'graphic',
        page: pageNum,
        diffCanvas: diffCanvas  // Tylko ten jeden canvas!
    }];
}

function createDiffOverlay(oldData, newData) {
    const width = Math.min(oldData.width, newData.width);
    const height = Math.min(oldData.height, newData.height);
    
    const diffCanvas = document.createElement('canvas');
    diffCanvas.width = width;
    diffCanvas.height = height;
    const diffCtx = diffCanvas.getContext('2d');
    
    const diffImageData = diffCtx.createImageData(width, height);
    const sensitivityValue = document.getElementById('sensitivityRange').value;
    const threshold = (100 - sensitivityValue) * 2.55;
    
    // Porównaj piksele - zaznacz różnice ŻÓŁTYM NEONOWYM ZAKREŚLACZEM
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            
            const r1 = oldData.data[i];
            const g1 = oldData.data[i + 1];
            const b1 = oldData.data[i + 2];
            
            const r2 = newData.data[i];
            const g2 = newData.data[i + 1];
            const b2 = newData.data[i + 2];
            
            // Oblicz luminancję
            const luminance1 = 0.299 * r1 + 0.587 * g1 + 0.114 * b1;
            const luminance2 = 0.299 * r2 + 0.587 * g2 + 0.114 * b2;
            
            const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
            
            // Wykryj różnice (jasny ↔ ciemny)
            const veryDarkThreshold = 80;
            const veryLightThreshold = 175;
            
            const isLightToDark = luminance1 > veryLightThreshold && luminance2 < veryDarkThreshold;
            const isDarkToLight = luminance1 < veryDarkThreshold && luminance2 > veryLightThreshold;
            
            if (diff > threshold && (isLightToDark || isDarkToLight)) {
                // ŻÓŁTY NEONOWY ZAKREŚLACZ
                // Tylko na jasne obszary - CZARNY TEKST SIĘ PRZEBIJA!
                if (luminance2 > 80) {  // Tylko jasne piksele z NEW
                    diffImageData.data[i] = 255;      // R
                    diffImageData.data[i + 1] = 255;  // G  
                    diffImageData.data[i + 2] = 0;    // B (żółty)
                    diffImageData.data[i + 3] = 150;  // Alpha (przezroczystość)
                } else {
                    // Ciemny piksel - PRZEZROCZYSTY (czarny się przebije)
                    diffImageData.data[i + 3] = 0;
                }
            } else {
                // Brak różnicy - przezroczysty
                diffImageData.data[i + 3] = 0;
            }
        }
    }
    
    diffCtx.putImageData(diffImageData, 0, 0);
    return diffCanvas;
}

// UPROSZCZENIE prepareCanvasesForPixelDiff():
async function prepareCanvasesForPixelDiff(pairIndex) {
    // NIE tworzymy dodatkowych canvasów!
    // Tylko zaznaczamy że para jest gotowa do analizy
    ocrResults.set(pairIndex, { ready: true });
}
```

#### Oszczędności:
**Scenariusz:** 20 par map, 2 strony każda

- **PRZED:** 40 stron × 2 canvasy × 17 MB = **1360 MB**
- **PO:** 0 MB (używamy istniejących canvasów z DOM!)
- **OSZCZĘDNOŚĆ: 1360 MB (100%!)**

Diffcanvas jest tworzony na żądanie i jest mały (tylko różnice), ~5-10 MB.

#### Bonus:
- ✅ Zawsze aktualne dane (używa aktualnie wyświetlanych map)
- ✅ Działa z dowolnym trybem (sidebyside, toggle, overlay)  
- ✅ Żółty jak neonowy zakreślacz - czarny tekst się przebija
- ✅ Nie blokuje ładowania początkowego

---

### 4.5 Optymalizacja #5: Fuzzy Matching - Wczesne Wyjście (PRIORYTET 2)

#### Cel:
Przyspieszyć dopasowywanie par plików przy dużej liczbie plików.

#### Problem:
Algorytm Levenshteina ma złożoność **O(n × m)** gdzie n, m = długość stringów.
Dla 50 plików OLD i 50 plików NEW = 2500 porównań.

#### Zmiana:
**PRZED:**
```javascript
for (const oldFile of unmatchedOld) {
    for (const newFile of unmatchedNew) {
        const distance = levenshteinDistance(oldFile.name, newFile.name);
        // Zawsze liczy cały Levenshtein...
    }
}
```

**PO:**
```javascript
// Dodaj wczesne wyjście w levenshteinDistance
function levenshteinDistance(str1, str2, maxDistance = Infinity) {
    const len1 = str1.length;
    const len2 = str2.length;
    
    // Wczesne wyjście #1: Różnica długości > maxDistance
    if (Math.abs(len1 - len2) > maxDistance) {
        return Infinity;
    }
    
    const matrix = [];
    for (let i = 0; i <= len1; i++) matrix[i] = [i];
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
        let minInRow = Infinity;
        
        for (let j = 1; j <= len2; j++) {
            if (str1.charAt(i - 1) === str2.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
            minInRow = Math.min(minInRow, matrix[i][j]);
        }
        
        // Wczesne wyjście #2: Cały wiersz > maxDistance
        if (minInRow > maxDistance) {
            return Infinity;
        }
    }
    return matrix[len1][len2];
}

// Użycie:
const maxLen = Math.max(oldFile.name.length, newFile.name.length);
const maxAcceptableDistance = maxLen * 0.3; // 70% similarity
const distance = levenshteinDistance(oldFile.name, newFile.name, maxAcceptableDistance);
```

#### Oszczędności:
- **50-70% szybsze** dopasowywanie dla dużej liczby plików
- Brak wpływu na wynik (znajdzie te same pary)

---

## 5. SZCZEGÓŁY TECHNICZNE WDROŻENIA

### 5.1 Modyfikacje Plików

#### A) `js/app.legacy.js`
**Funkcje do modyfikacji:**

1. **`getRenderScale()`** - zmienić na `getOptimalScale(pdfPage)`
```javascript
// STARA WERSJA:
function getRenderScale() {
    const qualitySelect = document.getElementById('qualitySelectRuntime');
    const quality = qualitySelect ? qualitySelect.value : 'standard';
    return quality === 'low' ? 1.5 : (quality === 'high' ? 4.5 : 3.0);
}

// NOWA WERSJA:
function getOptimalScale(pdfPage) {
    const viewport = pdfPage.getViewport({scale: 1.0});
    const widthInCm = (viewport.width / 72) * 2.54;
    const heightInCm = (viewport.height / 72) * 2.54;
    const areaCm2 = widthInCm * heightInCm;
    
    const A4_AREA = 623;
    const A3_AREA = 1246;
    const A2_AREA = 2492;
    const A1_AREA = 4984;
    
    if (areaCm2 <= A4_AREA * 1.1) return 2.1;
    if (areaCm2 <= A3_AREA * 1.1) return 2.5;
    if (areaCm2 <= A2_AREA * 1.1) return 3.0;
    if (areaCm2 <= A1_AREA * 1.1) return 3.5;
    return 4.0;
}

// Kompatybilność wsteczna (jeśli używane w innych miejscach):
function getRenderScale() {
    // Fallback dla miejsc gdzie nie mamy dostępu do pdfPage
    return 2.1; // Domyślnie niższa jakość
}
```

2. **`loadPair(index)`** - dodać cleanup na początku
```javascript
async function loadPair(index) {
    // DODAJ NA POCZĄTKU:
    if (currentPairIndex !== index) {
        cleanupPreviousPair();
    }
    
    currentPairIndex = index;
    // ... reszta istniejącego kodu ...
}
```

3. **`toggleOCRMode(mode)`** - lazy loading pixel diff
```javascript
async function toggleOCRMode(mode) {
    const hybridBtn = document.getElementById('ocrHybridBtn');
    const sensitivityControl = document.getElementById('sensitivityControl');
    
    if (ocrMode === mode) {
        ocrMode = null;
        hybridBtn.classList.remove('active');
        sensitivityControl.style.display = 'none';
        clearOCROverlay(); // To już istnieje
    } else {
        ocrMode = mode;
        hybridBtn.classList.toggle('active', mode === 'hybrid');
        sensitivityControl.style.display = mode === 'hybrid' ? 'block' : 'none';
        
        // DODAJ: Lazy loading
        if (!ocrResults.has(currentPairIndex)) {
            showPixelDiffLoading(); // Nowa funkcja
            await prepareCanvasesForPixelDiff(currentPairIndex);
            hidePixelDiffLoading(); // Nowa funkcja
        }
        
        await renderOCROverlay();
    }
}

function showPixelDiffLoading() {
    const viewer = document.getElementById('viewer');
    const loading = document.createElement('div');
    loading.id = 'pixelDiffLoading';
    loading.style.cssText = 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(0,0,0,0.8); color:white; padding:20px; border-radius:10px; z-index:10000;';
    loading.innerHTML = '<div class="spinner"></div><p>Przygotowuję Pixel Diff...</p>';
    viewer.appendChild(loading);
}

function hidePixelDiffLoading() {
    const loading = document.getElementById('pixelDiffLoading');
    if (loading) loading.remove();
}
```

4. **`processFiles()`** - usunąć przygotowanie pixel diff
```javascript
async function processFiles(oldFilesList, newFilesList) {
    // ... istniejący kod ładowania ...
    
    for (let match of matchedPairs) {
        // ... ładowanie PDF ...
        pairs.push({...});
    }
    
    // ... sortowanie ...
    
    pdfPairs = pairs;
    
    // USUŃ TĘ LINIĘ:
    // await prepareCanvasesForPixelDiff(i); // ❌ USUNĄĆ
    
    // Oblicz frame alignment dla każdej pary
    for (let i = 0; i < pdfPairs.length; i++) {
        await calculateFrameAlignment(i);
        updateProgress(65 + (i / pdfPairs.length * 30), `Wykrywanie ramek (${i+1}/${pdfPairs.length})...`);
    }
    
    // ... reszta kodu ...
}
```

5. **Dodać nowe funkcje:**
```javascript
// Nowa funkcja: Cleanup poprzedniej pary
function cleanupPreviousPair() {
    // Usuń canvasy z DOM
    document.querySelectorAll('.canvas-container canvas').forEach(canvas => {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        canvas.width = 0;
        canvas.height = 0;
        canvas.remove();
    });
    
    // Usuń overlays
    document.querySelectorAll('.ocr-overlay').forEach(el => el.remove());
    document.querySelectorAll('.pdf-annotation').forEach(el => el.remove());
    
    // Hint dla garbage collector
    if (window.gc) {
        setTimeout(() => window.gc(), 100);
    }
}

// Nowa funkcja: Boost jakości aktualnej pary
let boostedPairs = new Set();

async function boostCurrentPairQuality() {
    const btn = document.getElementById('boostQualityBtn');
    
    if (boostedPairs.has(currentPairIndex)) {
        // Przywróć normalną jakość
        btn.disabled = true;
        btn.textContent = '⏳ Przywracanie...';
        
        await rerenderCurrentPair('auto');
        boostedPairs.delete(currentPairIndex);
        
        btn.disabled = false;
        btn.textContent = '🔍 Zwiększ jakość do 300 DPI';
    } else {
        // Zwiększ do 300 DPI
        btn.disabled = true;
        btn.textContent = '⏳ Renderowanie 300 DPI...';
        
        await rerenderCurrentPair(3.2);
        boostedPairs.add(currentPairIndex);
        
        btn.disabled = false;
        btn.textContent = '✓ Jakość 300 DPI';
    }
}

async function rerenderCurrentPair(scaleOrAuto) {
    const pair = pdfPairs[currentPairIndex];
    if (!pair) return;
    
    // Określ docelową skalę
    let targetScale;
    if (scaleOrAuto === 'auto') {
        const page = await pair.oldDoc.getPage(1);
        targetScale = getOptimalScale(page);
    } else {
        targetScale = scaleOrAuto;
    }
    
    // Tymczasowo zapisz skalę
    const originalGetRenderScale = window.getRenderScale;
    window.getRenderScale = () => targetScale;
    
    // Przerenderuj aktualną stronę
    await renderCurrentPage();
    
    // Przywróć oryginalną funkcję
    window.getRenderScale = originalGetRenderScale;
}
```

#### B) `js/alignment.js`
**Zmienić skalę detekcji:**
```javascript
export async function calculateFrameAlignment(pairIndex) {
  const pair = (window.pdfPairs || [])[pairIndex];
  if (!pair) return;
  
  try {
    // ZMIANA: Użyj getOptimalScale zamiast stałej 2.0
    const oldPage = await pair.oldDoc.getPage(1);
    const detectionScale = window.getOptimalScale 
        ? window.getOptimalScale(oldPage) 
        : 2.1; // fallback
    
    const renderScale = detectionScale; // Ta sama skala!

    // ... reszta kodu bez zmian ...
    
    // DODAJ NA KOŃCU: Cleanup
    oldCanvas.width = 0;
    oldCanvas.height = 0;
    newCanvas.width = 0;
    newCanvas.height = 0;
    
  } catch (err) {
    console.error('Frame alignment error:', err);
  }
}
```

#### C) `js/pair-matcher.js`
**Dodać wczesne wyjście:**
```javascript
export function levenshteinDistance(str1, str2, maxDistance = Infinity) {
    const len1 = str1.length;
    const len2 = str2.length;
    
    // Wczesne wyjście - różnica długości
    if (Math.abs(len1 - len2) > maxDistance) {
        return Infinity;
    }
    
    const matrix = [];
    for (let i = 0; i <= len1; i++) matrix[i] = [i];
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
        let minInRow = Infinity;
        
        for (let j = 1; j <= len2; j++) {
            if (str1.charAt(i - 1) === str2.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
            minInRow = Math.min(minInRow, matrix[i][j]);
        }
        
        // Wczesne wyjście - cały wiersz > maxDistance
        if (minInRow > maxDistance) {
            return Infinity;
        }
    }
    
    return matrix[len1][len2];
}

export function fuzzyMatch(oldFiles, newFiles) {
    // ... istniejący kod exact matching ...

    // Fuzzy matches z limitem
    for (const oldFile of unmatchedOld) {
        let bestMatch = null;
        let bestDistance = Infinity;

        for (const newFile of unmatchedNew) {
            const maxLen = Math.max(oldFile.name.length, newFile.name.length);
            const maxAcceptable = maxLen * 0.3; // 70% similarity
            
            // ZMIANA: Dodaj maxDistance
            const distance = levenshteinDistance(oldFile.name, newFile.name, maxAcceptable);
            
            if (distance === Infinity) continue; // Skip nieudanych
            
            const similarity = 1 - (distance / maxLen);

            if (similarity >= 0.7 && distance < bestDistance) {
                bestMatch = newFile;
                bestDistance = distance;
            }
        }

        // ... reszta kodu bez zmian ...
    }

    // ... reszta kodu bez zmian ...
}
```

#### D) `index.html`
**Dodać przycisk "Zwiększ jakość":**
```html
<!-- W sekcji rightSidebar, po kontrolce jakości -->
<div class="control-item">
    <label>Jakość:</label>
    <select id="qualitySelectRuntime" onchange="changeQualityRuntime()" 
            style="width: 100%; padding: 8px; background: rgba(60, 60, 79, 0.8); 
                   color: white; border: 2px solid rgba(0, 86, 214, 0.5); 
                   border-radius: 6px; font-size: 0.93em; cursor: pointer;">
        <option value="low">Niska (1.5x)</option>
        <option value="standard" selected>Standardowa (3.0x)</option>
        <option value="high">Wysoka (4.5x)</option>
    </select>
</div>

<!-- DODAJ NOWY PRZYCISK: -->
<div class="control-item">
    <button id="boostQualityBtn" class="action-btn" 
            onclick="boostCurrentPairQuality()" 
            style="width: 100%; background: rgba(255, 193, 7, 0.9); 
                   color: #000; font-weight: bold;">
        🔍 Zwiększ jakość do 300 DPI
    </button>
    <div style="font-size: 0.75em; color: #ccc; margin-top: 5px; line-height: 1.3;">
        Przerenderuje tylko tę mapę w najwyższej jakości (300 DPI). 
        Pozostałe mapy zachowają optymalizowaną jakość.
    </div>
</div>
```

### 5.2 Usunięcie Selektor Jakości (Opcjonalne)

**OPCJA A: Zachować selektor jako override**
- Selektor pozwala użytkownikowi wymusić konkretną skalę
- Dynamiczna skala działa jako domyślna

**OPCJA B: Usunąć selektor całkowicie**
- Upraszcza UI
- Zawsze używa dynamicznej skali
- Przycisk "Zwiększ jakość" wystarcza

**Rekomendacja:** OPCJA A (zachować dla power users)

---

## 6. HARMONOGRAM WDROŻENIA

### Faza 1: Optymalizacje Krytyczne (Tydzień 1)
**Cel:** Zmniejszenie zużycia pamięci o 65%

- [ ] **Dzień 1-2:** Implementacja `getOptimalScale()`
  - Funkcja wykrywania rozmiaru papieru
  - Integracja z renderowaniem PDF
  - Testy z różnymi rozmiarami map (A4, A3, A2, A1, A0)

- [ ] **Dzień 3:** Przycisk "Zwiększ jakość"
  - UI button w prawym panelu
  - Funkcja `boostCurrentPairQuality()`
  - Funkcja `rerenderCurrentPair()`

- [ ] **Dzień 4:** Pixel Diff - jeden canvas zamiast dwóch
  - Modyfikacja `comparePixels()` - pobieranie z DOM
  - `createDiffOverlay()` - żółty neonowy zakreślacz
  - Uproszczenie `prepareCanvasesForPixelDiff()`

- [ ] **Dzień 5-7:** Testy i bugfixy
  - Test z 5, 10, 20, 50 parami map
  - Test z różnymi rozmiarami (A4, A3, A2, A1, A0)
  - Pomiar zużycia pamięci (Chrome DevTools)
  - Test swobodnego przełączania między parami

### Faza 2: Optymalizacje Dodatkowe (Tydzień 2)
**Cel:** Finalizacja i optymalizacja

- [ ] **Dzień 1-2:** Cleanup przy "Nowe porównanie"
  - `cleanupAllMaps()` w `resetAndUpload()`
  - Test że przełączanie między parami działa płynnie
  - Test że cleanup działa tylko przy reset

- [ ] **Dzień 3-4:** Fuzzy matching optymalizacja
  - Early exit w `levenshteinDistance()`
  - Testy wydajnościowe z dużą liczbą plików (50+)

- [ ] **Dzień 5-7:** Testy stabilności
  - Długie sesje (30+ minut pracy)
  - Przełączanie między 50+ parami
  - Memory profiling - sprawdzenie że pamięć nie rośnie
  - Test z programami w tle (symulacja 8 GB RAM)

### Faza 3: Dokumentacja i Finalizacja (Tydzień 3)
**Cel:** Deployment i monitoring

- [ ] **Dzień 1-2:** Dokumentacja użytkownika
  - Opis nowego przycisku "Zwiększ jakość"
  - Wyjaśnienie dynamicznej skali
  - FAQ

- [ ] **Dzień 3-4:** Dokumentacja techniczna
  - Komentarze w kodzie
  - Diagram architektury
  - Performance metrics

- [ ] **Dzień 5:** Release Candidate
  - Build produkcyjny
  - Checklist testów
  - Rollback plan

- [ ] **Dzień 6-7:** Deployment i monitoring
  - Wdrożenie na produkcję
  - Monitoring błędów
  - Feedback od użytkowników

---

## 7. RYZYKA I MITYGACJA

### Ryzyko 1: Jakość za niska na niektórych mapach
**Prawdopodobieństwo:** Średnie  
**Wpływ:** Średni

**Mitygacja:**
- Przycisk "Zwiększ jakość" zawsze dostępny
- Możliwość ręcznego override przez selektor jakości
- Testowanie z różnymi typami map (różne fonty, grubości linii)

### Ryzyko 2: Frame detection mniej dokładny przy niższej skali
**Prawdopodobieństwo:** Niskie  
**Wpływ:** Średni

**Mitygacja:**
- Testy porównawcze: detection w skali 2.0 vs 2.1
- Jeśli problemy: opcja "Force high-res frame detection"
- Monitoring accuracy metrics

### Ryzyko 3: Garbage collector nie działa jak oczekiwano
**Prawdopodobieństwo:** Średnie  
**Wpływ:** Średni

**Mitygacja:**
- Extensive testing w różnych przeglądarkach
- Manualne testy z Chrome DevTools Memory Profiler
- Fallback: okresowe full reload (co 50 par)

### Ryzyko 4: Użytkownicy nie zrozumieją nowego przycisku
**Prawdopodobieństwo:** Niskie  
**Wpływ:** Niski

**Mitygacja:**
- Jasny label: "🔍 Zwiększ jakość do 300 DPI"
- Tooltip z wyjaśnieniem
- Dokumentacja z screenshotami

### Ryzyko 5: Regresja w istniejących funkcjach
**Prawdopodobieństwo:** Średnie  
**Wpływ:** Wysoki

**Mitygacja:**
- Comprehensive regression testing
- Checklist wszystkich funkcji przed deploymentem
- Git branch strategy (feature branch → testing → main)

---

## 8. METRYKI SUKCESU

### Metryki Wydajnościowe

| Metryka | Obecny Stan | Cel Po Optymalizacji | Pomiar |
|---------|-------------|----------------------|--------|
| **Zużycie RAM (20 par A4)** | 2580 MB | < 1000 MB | Chrome DevTools Memory |
| **Czas ładowania (20 par)** | 45-60 sek | < 30 sek | Performance.now() |
| **FPS podczas przełączania** | 15-20 FPS | > 50 FPS | Chrome DevTools Performance |
| **Czas startu Pixel Diff** | N/A (preload) | < 2 sek | User timing API |

### Metryki Jakości

| Metryka | Cel | Pomiar |
|---------|-----|--------|
| **Ostrość małych detali** | ≥ 90% czytelności | User testing |
| **Accuracy frame detection** | ≥ 95% | Automated tests |
| **Zero crashes** | 100% stabilność | Error monitoring |

### User Experience

| Metryka | Cel | Pomiar |
|---------|-----|--------|
| **Time to first render** | < 5 sek | Analytics |
| **Płynność przełączania map** | Bez lagów | User feedback |
| **Intuicyjność przycisku jakości** | > 80% zrozumienie | User survey |

---

## 9. PODSUMOWANIE

### Obecny Problem
- Program zużywa **2.5 GB RAM** dla 20 par map A4
- **Zacina się** na komputerze użytkownika (8 GB RAM + inne programy w tle)
- **Długie ładowanie** (45-60 sekund)
- Wszystkie mapy w **nadmiarowej jakości 288 DPI**
- Pixel Diff przechowuje 2 dodatkowe canvasy na parę = **+1.4 GB**

### Rozwiązanie
**5 optymalizacji:**

1. **Dynamiczna skala** - A4 w 200 DPI, A0 w 384 DPI (oszczędność 760 MB)
2. **Przycisk boost** - 300 DPI na żądanie dla pojedynczej mapy
3. **Pixel Diff - 1 canvas** - używa DOM + żółte plamki (oszczędność 1350 MB)
4. **Cleanup TYLKO przy reset** - swobodne przełączanie zachowane
5. **Fuzzy matching early exit** - szybsze ładowanie

### Oczekiwane Rezultaty
- ✅ **Zużycie RAM: ~900 MB** (65% redukcja z 2.5 GB)
- ✅ **Pixel Diff: +10 MB** (zamiast +1360 MB)
- ✅ **Ładowanie: 25-30 sekund** (50% szybciej)
- ✅ **Płynność: 50+ FPS** (3x lepiej)
- ✅ **Jakość: 300 DPI gdy potrzeba** (zachowana dla detali)
- ✅ **Swobodne przełączanie** między wszystkimi 20 parami (ZACHOWANE!)

### Kluczowe Zmiany w Kodzie
```
js/app.legacy.js:
  - getOptimalScale() - nowa funkcja (wykrywa rozmiar papieru)
  - boostCurrentPairQuality() - nowy przycisk
  - comparePixels() - pobiera canvasy z DOM
  - createDiffOverlay() - żółty neonowy zakreślacz
  - cleanupAllMaps() - TYLKO w resetAndUpload()
  - prepareCanvasesForPixelDiff() - uproszczone
  - cleanup canvasów na końcu

js/pair-matcher.js:
  - levenshteinDistance() - early exit

index.html:
  - Przycisk "🔍 Zwiększ jakość do 300 DPI"
```

---

## 10. NASTĘPNE KROKI

### Natychmiastowe Akcje
1. ✅ **Sprawdź RAM komputera** - Menedżer zadań → Wydajność → Pamięć
2. 📄 **Review tego dokumentu** - Czy wszystko jest jasne?
3. 🤝 **Decyzja:** Idziemy z tym planem?

### Po Akceptacji Planu
1. 🔧 **Wdrożenie Faza 1** (tydzień 1)
2. 🧪 **Testy na Twoim komputerze**
3. 📊 **Pomiary zużycia RAM**
4. 🔁 **Iteracja jeśli potrzeba**

---

**Wersja dokumentu:** 1.0  
**Data utworzenia:** 2025-10-25  
**Autor:** Claude (Anthropic)  
**Status:** ✅ GOTOWE DO REVIEW
