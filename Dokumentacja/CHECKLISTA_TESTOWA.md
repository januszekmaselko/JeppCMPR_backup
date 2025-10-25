# CHECKLISTA TESTOWA - JeppCMPR

**Cel:** Po każdej zmianie w kodzie, przejdź przez tę checklistę i odhacz wszystkie punkty.  
**Zasada:** Jeśli choć JEDEN punkt nie działa - cofnij zmiany i zgłoś problem.

---

## 🧪 TEST PODSTAWOWY (po każdym kroku)

### 1. Wygląd aplikacji
- [ ] Strona ładuje się bez błędów w konsoli (F12 → Console)
- [ ] Header jest widoczny z napisem "JeppCMPR v2.5.0"
- [ ] Tło jest ciemne z efektem przezroczystości
- [ ] Drop zone jest widoczna z niebieską ramką
- [ ] Wszystkie przyciski są widoczne i dobrze wyglądają

### 2. Ładowanie plików
- [ ] Można kliknąć drop zone i wybrać pliki
- [ ] Można przeciągnąć i upuścić (drag & drop) pliki PDF
- [ ] Pojawia się komunikat o ładowaniu
- [ ] Ładują się oba pliki (OLD i NEW)
- [ ] Nie ma błędów w konsoli podczas ładowania

### 3. Podstawowe porównanie
- [ ] Po załadowaniu pojawia się widok porównania
- [ ] Widać mapę na ekranie
- [ ] Przyciski zmiany trybu są aktywne

---

## 🎮 TEST FUNKCJONALNOŚCI (szczegółowy)

### 4. Tryby porównania
- [ ] **Toggle Mode** - mapy migają na przemian (spacja)
- [ ] **Overlay Mode** - mapy są nałożone jedna na drugą
- [ ] **Split Mode** - mapy podzielone pionową linią
- [ ] Przełączanie między trybami działa płynnie

### 5. Kontrolki Overlay Mode
- [ ] Suwak Opacity działa (zmienia przezroczystość)
- [ ] Suwak Red/Cyan działa (zmienia kolory)
- [ ] Checkbox "Inverse Colors" działa
- [ ] Zmiany są widoczne natychmiast

### 6. Kontrolki Split Mode
- [ ] Suwak Split Position działa (przesuwa linię podziału)
- [ ] Można przeciągać linię myszką
- [ ] Split działa w obu orientacjach (pionowo/poziomo)

### 7. Auto-Alignment
- [ ] Przycisk "Auto-Align" jest widoczny
- [ ] Po kliknięciu pojawia się komunikat o przetwarzaniu
- [ ] Alignment się wykonuje (może trwać kilka sekund)
- [ ] Po alignment mapy są dopasowane
- [ ] Przycisk "Reset Alignment" działa

### 8. Manual Alignment
- [ ] Przycisk "Manual Align" jest widoczny
- [ ] Po kliknięciu tryb manualny się włącza
- [ ] Można kliknąć 4 punkty na pierwszej mapie
- [ ] Mapy się przełączają automatycznie
- [ ] Można kliknąć 4 punkty na drugiej mapie
- [ ] Transformacja jest obliczana i zastosowana
- [ ] Przycisk "Reset" w trybie manualnym działa
- [ ] Przycisk "Exit" wychodzi z trybu manualnego

### 9. Nawigacja
- [ ] Przyciski Prev/Next działają (zmiana stron)
- [ ] Suwak Page Number działa
- [ ] Numer strony wyświetla się poprawnie
- [ ] Można przejść do każdej strony

### 10. Zoom i Pan
- [ ] Scroll myszką zoomuje (przybliża/oddala)
- [ ] Można przeciągać obraz myszką (pan)
- [ ] Przycisk "Reset Zoom" działa
- [ ] Zoom działa we wszystkich trybach

### 11. Fullscreen
- [ ] Przycisk Fullscreen działa (F11 lub przycisk)
- [ ] W fullscreen wszystkie kontrolki są widoczne
- [ ] Wyjście z fullscreen działa (ESC lub przycisk)
- [ ] Instrukcje klawiszowe są widoczne w fullscreen

### 12. Skróty klawiszowe
- [ ] **Spacja** - przełącza toggle mode
- [ ] **CTRL** - przytrzymanie zmienia tryb tymczasowo
- [ ] **Strzałki** - nawigacja między stronami
- [ ] **+/-** - zoom in/out
- [ ] **ESC** - wyjście z fullscreen

### 13. Quality Selection
- [ ] Wybór jakości LOW/MEDIUM/HIGH działa
- [ ] Po zmianie jakości pliki są ponownie przetwarzane
- [ ] Wyższa jakość = wyraźniejszy obraz (ale wolniej)

---

## ⚡ TEST WYDAJNOŚCI (opcjonalny)

### 14. Szybkość działania
- [ ] Toggle mode przełącza się płynnie (<200ms)
- [ ] Overlay mode reaguje na suwaki natychmiast
- [ ] Nawigacja między stronami jest szybka (<1s)
- [ ] Auto-alignment kończy się w rozsądnym czasie (<15s)

### 15. Stabilność
- [ ] Aplikacja nie zawiesza się podczas użytkowania
- [ ] Nie ma wycieków pamięci (długie użytkowanie OK)
- [ ] Konsola nie pokazuje błędów (F12 → Console czysta)

---

## 📋 JAK UŻYWAĆ TEJ CHECKLISTY

**Po każdym mikro-kroku:**
1. Otwórz plik HTML w przeglądarce (Chrome lub Firefox)
2. Przejdź przez TEST PODSTAWOWY (punkty 1-3)
3. Jeśli wszystko OK - kontynuuj
4. Jeśli coś nie działa - STOP, zgłoś problem

**Po zakończeniu całego etapu (np. Etap 1 - CSS):**
1. Przejdź przez cały TEST FUNKCJONALNOŚCI (punkty 4-13)
2. Odhacz każdy punkt
3. Jeśli wszystko działa - etap zakończony ✅
4. Jeśli coś nie działa - cofnij zmiany i napraw

**Przed przejściem do następnego etapu:**
1. Zrób backup obecnej wersji
2. Aktualizuj STATUS_PROJEKTU.md
3. Upewnij się że masz wszystkie pliki pobrane

---

## 🚨 CO ZROBIĆ GDY TEST NIE PRZECHODZI

**Krok 1:** Sprawdź konsolę przeglądarki (F12 → Console)
- Czy są błędy? Skopiuj treść błędu

**Krok 2:** Porównaj z poprzednią wersją
- Otwórz backup (poprzednią wersję)
- Czy tam działa?

**Krok 3:** Cofnij zmiany
- Przywróć plik z backupu
- Sprawdź czy znów działa

**Krok 4:** Zgłoś problem
- W nowej rozmowie napisz:
  "Test nie przeszedł - problem w [nazwa testu]"
  "Błąd w konsoli: [treść błędu]"
  "Ostatni wykonany krok: [opis kroku]"

---

## ✅ SZABLON RAPORTU Z TESTÓW

Po każdym etapie możesz zapisać wynik:

```
ETAP: [numer etapu]
DATA: [data testu]
WERSJA: [nazwa pliku]

TEST PODSTAWOWY: ✅ PASS / ❌ FAIL
TEST FUNKCJONALNOŚCI: ✅ PASS / ❌ FAIL

PROBLEMY WYKRYTE:
- [opis problemu 1]
- [opis problemu 2]

NOTATKI:
[inne uwagi]
```

---

**PAMIĘTAJ:** 
- Im częściej testujesz = tym łatwiej znaleźć co się zepsuło
- Test po każdym mikro-kroku = maksymalne bezpieczeństwo
- Zawsze miej backup przed testami

**KONIEC CHECKLISTY**