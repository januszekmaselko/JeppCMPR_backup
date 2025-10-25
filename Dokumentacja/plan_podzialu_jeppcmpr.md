# Plan Podziału i Optymalizacji JeppCMPR v2.5.0

## 1. ANALIZA OBECNEJ STRUKTURY

**Rozmiar obecnego pliku:** 251KB, ~6000 linii kodu
**Główne problemy:**
- Za duży kontekst do edycji z AI
- Trudność w lokalizacji błędów
- Niska wydajność (długi kod, brak optymalizacji)
- Niemożliwość równoległej pracy nad różnymi funkcjami

---

## 2. PROPONOWANY PODZIAŁ NA MODUŁY

### 2.1 Główny plik: `jeppcmpr.html` (ok. 500 linii)
**Zawartość:**
- Podstawowa struktura HTML
- Import wszystkich modułów JS i CSS
- Inicjalizacja aplikacji
- Minimalna logika łącząca moduły

**Przykładowa struktura:**
```html
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>JeppCMPR v2.5.0</title>
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/viewer.css">
    <link rel="stylesheet" href="css/controls.css">
</head>
<body>
    <!-- Minimalna struktura HTML -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <script src="js/config.js"></script>
    <script src="js/pdfLoader.js"></script>
    <script src="js/alignment.js"></script>
    <script src="js/rendering.js"></script>
    <script src="js/ui.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
```

---

### 2.2 Moduł CSS

#### `css/main.css` (ok. 300 linii)
- Style podstawowe, reset, zmienne CSS
- Layout główny, header, container
- Style przycisków i formularzy
- Motywy kolorystyczne

#### `css/viewer.css` (ok. 400 linii)
- Style canvas i viewera
- Style drop-zone
- Style porównań (toggle, overlay, split)
- Fullscreen i zoom

#### `css/controls.css` (ok. 300 linii)
- Panel sterowania
- Suwaki, checkboxy
- Status i notyfikacje
- Tryby manualne

---

### 2.3 Moduły JavaScript

#### `js/config.js` (ok. 50 linii)
**Rola:** Centralna konfiguracja
**Zawartość:**
```javascript
const AppConfig = {
    VERSION: '2.5.0',
    DEFAULT_QUALITY: 2,
    MAX_CANVAS_SIZE: 16384,
    RENDER_TIMEOUT: 30000,
    ALIGNMENT: {
        CORNER_THRESHOLD: 0.85,
        LINE_CONTINUITY_HIGH: 0.98,
        LINE_CONTINUITY_LOW: 0.95,
        EDGE_THRESHOLD: 50
    }
};
```

#### `js/pdfLoader.js` (ok. 400 linii)
**Rola:** Obsługa ładowania i konwersji PDF
**Funkcje:**
- `loadPDF(file)` - ładowanie pliku PDF
- `convertToImages(pdf, quality)` - konwersja stron na obrazy
- `compressImage(canvas)` - kompresja obrazów
- `getPageDimensions(pdf, pageNum)`
- Obsługa drag & drop
- Progress bar dla długich operacji

#### `js/alignment.js` (ok. 800 linii)
**Rola:** Auto-alignment i wykrywanie ramek
**Funkcje do optymalizacji:**
- `detectFrame(imageData)` - wykrywanie ramki (obecnie za długa!)
- `detectCorners(edges)` - detekcja rogów
- `detectLines(edges)` - detekcja linii
- `calculateTransform(srcPoints, dstPoints)` - transformacja
- `applyTransform(canvas, transform)`

**UWAGA:** Ten moduł wymaga największej optymalizacji!

#### `js/manualAlignment.js` (ok. 300 linii)
**Rola:** Ręczne dopasowanie map
**Funkcje:**
- `enterManualMode()`
- `handleClick(event)`
- `calculateManualTransform()`
- `drawAlignmentPoints()`

#### `js/rendering.js` (ok. 600 linii)
**Rola:** Renderowanie porównań
**Funkcje:**
- `renderToggleMode(oldImg, newImg)`
- `renderOverlayMode(oldImg, newImg, opacity)`
- `renderSplitMode(oldImg, newImg, splitPos)`
- `renderCanvas(canvas, imageData, transform)`
- Cache obrazów dla szybszego przełączania

#### `js/ui.js` (ok. 400 linii)
**Rola:** Obsługa interfejsu użytkownika
**Funkcje:**
- `updateControls()`
- `handleKeyboard(event)`
- `showNotification(message)`
- `toggleFullscreen()`
- Navigation (prev/next page)
- Zoom controls

#### `js/app.js` (ok. 200 linii)
**Rola:** Główna logika aplikacji - orkiestrator
**Funkcje:**
- Inicjalizacja wszystkich modułów
- Zarządzanie stanem aplikacji
- Koordynacja między modułami
- Event dispatcher

---

## 3. ARCHITEKTURA KOMUNIKACJI MIĘDZY MODUŁAMI

### 3.1 Wzorzec Event Bus (Prosty PubSub)
```javascript
// Event Bus w app.js
const EventBus = {
    events: {},
    
    on(event, callback) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(callback);
    },
    
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(cb => cb(data));
        }
    }
};
```

### 3.2 Przykład komunikacji:
```javascript
// pdfLoader.js emituje event po załadowaniu
EventBus.emit('pdf:loaded', { oldPdf, newPdf });

// rendering.js nasłuchuje i reaguje
EventBus.on('pdf:loaded', (data) => {
    renderComparison(data.oldPdf, data.newPdf);
});
```

---

## 4. STRATEGIA OPTYMALIZACJI WYDAJNOŚCI

### 4.1 Problemy do naprawienia w `alignment.js`:

#### Problem 1: Zbyt częste przetwarzanie pełnego obrazu
**Obecny kod:** Przetwarza cały obraz wielokrotnie
**Rozwiązanie:** Cache pośrednich wyników
```javascript
// Zamiast przetwarzać za każdym razem:
const cachedEdges = new Map();
function getEdges(imageData) {
    const key = hashImageData(imageData);
    if (!cachedEdges.has(key)) {
        cachedEdges.set(key, detectEdges(imageData));
    }
    return cachedEdges.get(key);
}
```

#### Problem 2: Niepotrzebne kopie canvas
**Rozwiązanie:** Używaj ImageData zamiast klonowania canvas
```javascript
// Zamiast:
const tempCanvas = canvas.cloneNode();
// Użyj:
const imageData = ctx.getImageData(0, 0, w, h);
```

#### Problem 3: Brak Web Workers dla ciężkich operacji
**Rozwiązanie:** Przenieś wykrywanie ramek do Web Worker
```javascript
// W alignment.js
const alignmentWorker = new Worker('js/workers/alignmentWorker.js');
alignmentWorker.postMessage({ imageData, config });
alignmentWorker.onmessage = (e) => {
    const { frameCorners, transform } = e.data;
    applyAlignment(transform);
};
```

#### Problem 4: Za duże rozmiary canvas
**Rozwiązanie:** 
- Skaluj obrazy do maksymalnej rozdzielczości (np. 3000px)
- Przywracaj oryginalne wymiary dopiero przy eksporcie

### 4.2 Optymalizacja renderowania:

#### Użyj requestAnimationFrame dla płynnego toggle:
```javascript
function toggleView() {
    requestAnimationFrame(() => {
        if (showingOld) {
            ctx.drawImage(oldImage, 0, 0);
        } else {
            ctx.drawImage(newImage, 0, 0);
        }
    });
}
```

#### Implementuj progressive loading:
```javascript
// Najpierw pokaż low-res preview
renderLowQuality(image).then(() => {
    // Potem załaduj pełną jakość
    renderHighQuality(image);
});
```

---

## 5. PROCEDURA TESTOWANIA MODUŁÓW

### 5.1 Tworzenie środowiska testowego:
```
project/
├── jeppcmpr.html (główny plik)
├── jeppcmpr-test.html (wersja testowa)
├── css/
├── js/
└── tests/
    ├── test-pdfLoader.html
    ├── test-alignment.html
    ├── test-rendering.html
    └── test-data/ (przykładowe PDFy)
```

### 5.2 Test izolowany dla modułu:
```html
<!-- test-alignment.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Test Alignment Module</title>
</head>
<body>
    <canvas id="testCanvas"></canvas>
    <script src="../js/config.js"></script>
    <script src="../js/alignment.js"></script>
    <script>
        // Test konkretnej funkcji
        const testImage = loadTestImage();
        const frame = detectFrame(testImage);
        console.log('Frame detected:', frame);
    </script>
</body>
</html>
```

### 5.3 Test integracyjny:
- Użyj `jeppcmpr-test.html` z logowaniem do konsoli
- Porównuj wyniki z oryginalnym plikiem
- Automatyczne testy regresji (sprawdzaj czy nowa wersja daje te same wyniki)

---

## 6. ETAPY WDROŻENIA (KROK PO KROKU)

### ETAP 1: Przygotowanie (1 sesja)
1. Utwórz strukturę folderów
2. Skopiuj obecny plik jako backup
3. Stwórz puste pliki modułów

### ETAP 2: Wydzielenie CSS (1 sesja)
1. Przenieś style do osobnych plików CSS
2. Przetestuj czy aplikacja wygląda tak samo
3. Commit/zapisz zmiany

### ETAP 3: Wydzielenie Config i UI (1 sesja)
1. Utwórz config.js
2. Utwórz ui.js z funkcjami UI
3. Przetestuj podstawowe interakcje

### ETAP 4: Wydzielenie PDF Loader (1-2 sesje)
1. Przenieś funkcje ładowania PDF
2. Dodaj Event Bus
3. Przetestuj ładowanie plików

### ETAP 5: Wydzielenie Rendering (1-2 sesje)
1. Przenieś funkcje renderowania
2. Dodaj cache obrazów
3. Przetestuj wszystkie tryby porównania

### ETAP 6: Wydzielenie Alignment (2-3 sesje) - NAJTRUDNIEJSZY
1. Przenieś funkcje auto-alignment
2. **OPTYMALIZUJ** - usuń duplikaty, uprość kod
3. Dodaj Web Worker jeśli potrzeba
4. Dokładnie przetestuj z różnymi mapami

### ETAP 7: Wydzielenie Manual Alignment (1 sesja)
1. Przenieś funkcje manualnego dopasowania
2. Przetestuj

### ETAP 8: Finalizacja (1 sesja)
1. Stwórz app.js jako orkiestrator
2. Pełne testy integracyjne
3. Optymalizacja ładowania (minifikacja, kompresja)

**CAŁKOWITY CZAS: 10-15 sesji pracy**

---

## 7. SYSTEM WERSJONOWANIA I ROZWOJU

### 7.1 Konwencja nazewnictwa:
```
jeppcmpr-v2.5.0.html (obecna wersja monolityczna)
jeppcmpr-v2.6.0/ (katalog z modułami)
  ├── index.html
  ├── css/
  ├── js/
  └── README.md
```

### 7.2 Praca nad nową funkcjonalnością:
1. Stwórz branch/kopię modułu, np. `alignment-v2.js`
2. Pracuj na kopii, testuj w `jeppcmpr-test.html`
3. Gdy działa - zamień w głównej aplikacji
4. Zachowaj starą wersję jako `alignment-v1.js` (backup)

### 7.3 Changelog dla każdego modułu:
```javascript
// Na początku każdego pliku JS:
/**
 * alignment.js v1.2.0
 * 
 * CHANGELOG:
 * v1.2.0 - Dodano cache dla wykrywania krawędzi
 * v1.1.0 - Optymalizacja wykrywania rogów (2x szybciej)
 * v1.0.0 - Początkowa wersja po wydzieleniu z monolitu
 */
```

---

## 8. NARZĘDZIA DO ROZWOJU

### 8.1 Live Server (dla testowania)
- Visual Studio Code + Live Server extension
- Automatyczne odświeżanie przy zmianach

### 8.2 Chrome DevTools
- Performance tab - profilowanie wydajności
- Console - debugowanie
- Network tab - sprawdzanie czasu ładowania modułów

### 8.3 Minifikacja (do produkcji)
- Użyj: https://jscompress.com/ dla JS
- Użyj: https://cssminifier.com/ dla CSS
- Stwórz wersję `-min.js` każdego modułu

---

## 9. PRIORYTETY OPTYMALIZACJI

### PRIORYTET 1 (Największy wpływ na wydajność):
- **Alignment.js - detectFrame()**
  - Obecnie: ~2000 linii, przetwarza obraz 5-10 razy
  - Cel: ~500 linii, cache wyników, 3x szybciej
  
### PRIORYTET 2:
- **Rendering.js - cache obrazów**
  - Przechowuj przetworzone obrazy w pamięci
  - Nie renderuj ponownie jeśli się nie zmieniło

### PRIORYTET 3:
- **Progressive loading**
  - Najpierw pokaż niską jakość (szybko)
  - Potem załaduj pełną rozdzielczość

### PRIORYTET 4:
- **Web Worker dla alignment**
  - Ciężkie obliczenia w tle
  - UI pozostaje responsywne

---

## 10. METRYKI SUKCESU

### Obecne (szacowane):
- Czas ładowania pierwszej strony: ~3-5 sekund
- Czas auto-alignment: ~5-10 sekund
- Czas przełączenia toggle: ~200-500ms
- Rozmiar pliku: 251KB

### Cel po optymalizacji:
- Czas ładowania pierwszej strony: **~1-2 sekundy**
- Czas auto-alignment: **~2-4 sekundy**
- Czas przełączenia toggle: **~50-100ms**
- Rozmiar wszystkich plików (zminifikowanych): **~150KB**

---

## PODSUMOWANIE

Podział na moduły to **inwestycja**, która wymaga około 10-15 sesji pracy, ale przyniesie:
✅ Możliwość rozwoju z AI (moduły mieszczą się w kontekście)
✅ Łatwiejsze testowanie i debugowanie
✅ 2-3x lepszą wydajność po optymalizacji
✅ Możliwość równoległej pracy nad funkcjami
✅ Łatwiejsze utrzymanie kodu

**Zalecam rozpocząć od Etapów 1-3** (przygotowanie + CSS + Config/UI), które są proste i dadzą Ci poczucie jak działa nowa struktura.