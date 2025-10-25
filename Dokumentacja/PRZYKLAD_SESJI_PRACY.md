# PRZYKŁAD SESJI PRACY - Jak to wygląda w praktyce

Ten dokument pokazuje DOKŁADNIE jak będzie wyglądała jedna sesja pracy z Claude.

---

## 📅 PRZYKŁADOWA SESJA 1: Przygotowanie i backup

### TY piszesz (start nowej rozmowy):
```
Cześć Claude! Kontynuujemy podział JeppCMPR.

[Przesyłasz pliki jako załączniki]
- STATUS_PROJEKTU.md
- PROMPT_DLA_NOWEJ_ROZMOWY.txt
- plan_podzialu_jeppcmpr.md

[Wklejasz treść z PROMPT_DLA_NOWEJ_ROZMOWY.txt]
```

### CLAUDE odpowiada:
```
Cześć! Przeczytałem STATUS_PROJEKTU.md.

Obecny stan:
- Etap: PRZYGOTOWANIE (przed rozpoczęciem)
- Postęp: 0/12 sesji (0%)

Następny krok: Krok 1.1 - Utworzenie backupu

Propozycja mikro-kroku:
Skopiuję plik jeppcmpr_v2_5_1_aligned.html jako backup
do lokalizacji /mnt/user-data/outputs/jeppcmpr_BACKUP_przed_podzialem.html

Czy mogę rozpocząć?
```

### TY odpowiadasz:
```
Tak, zaczynaj
```

### CLAUDE wykonuje:
```
Wykonuję Krok 1.1...

[Claude używa bash_tool aby skopiować plik]

✅ Backup utworzony!
- Nazwa: jeppcmpr_BACKUP_przed_podzialem.html
- Rozmiar: 251KB (identyczny jak oryginał)
- Lokalizacja: /mnt/user-data/outputs/

Aktualizuję STATUS_PROJEKTU.md...

✅ STATUS_PROJEKTU.md zaktualizowany!

[Link do pobrania]
[View jeppcmpr_BACKUP_przed_podzialem.html](computer:///...)
[View STATUS_PROJEKTU.md - ZAKTUALIZOWANY](computer:///...)

Teraz proszę:
1. Pobierz oba pliki (zwłaszcza STATUS_PROJEKTU.md)
2. Otwórz backup w przeglądarce - sprawdź czy działa
3. Potwierdź: "✅ Backup działa" lub "❌ Problem: [opis]"
```

### TY testujesz i odpowiadasz:
```
✅ Backup działa - otworzyłem w przeglądarce, załadowałem mapy, wszystko OK
```

### CLAUDE kontynuuje:
```
Świetnie! Przechodzimy do Kroku 1.2 - Utworzenie struktury folderów.

Propozycja:
Stworzę folder jeppcmpr-modular/ z podfolderami:
- css/ (tu będą pliki CSS)
- js/ (tu będą pliki JavaScript)  
- backup/ (tu będą kolejne backupy podczas pracy)

Oraz stworzę pusty plik index.html (będzie głównym plikiem aplikacji).

Czy mogę kontynuować?
```

### TY:
```
Tak
```

### CLAUDE:
```
Tworzę strukturę folderów...

✅ Struktura utworzona:
/mnt/user-data/outputs/jeppcmpr-modular/
├── index.html (pusty, narazie)
├── css/ (folder pusty)
├── js/ (folder pusty)
└── backup/ (folder pusty)

Aktualizuję STATUS_PROJEKTU.md...

[View STATUS_PROJEKTU.md - ZAKTUALIZOWANY](computer:///...)

UWAGA: Teraz musisz pobrać cały folder jeppcmpr-modular/
W nowej rozmowie będziesz go przesyłać z powrotem.

Krok 1.2 zakończony!

Status:
✅ Krok 1.1 - Backup utworzony
✅ Krok 1.2 - Struktura folderów utworzona
⬜ Krok 1.3 - Weryfikacja (do zrobienia)

Czy kontynuujemy z Krokiem 1.3 (Weryfikacja)?
```

### TY:
```
Tak, ale najpierw powiedz mi co mam sprawdzić w weryfikacji
```

### CLAUDE:
```
W Kroku 1.3 sprawdzasz czy wszystko jest OK przed rozpoczęciem właściwej pracy:

CHECKLISTA WERYFIKACJI:
□ Backup istnieje i ma 251KB (taki sam jak oryginał)
□ Struktura folderów jeppcmpr-modular/ istnieje
□ Foldery css/, js/, backup/ są puste (to OK)
□ Plik index.html istnieje (pusty to OK)
□ Oryginalny plik jeppcmpr_v2_5_1_aligned.html NIE ZMIENIONY

Jak sprawdzić:
1. Otwórz folder gdzie pobrałeś pliki
2. Sprawdź czy są tam wszystkie rzeczy z listy
3. Kliknij prawym na backup → Właściwości → sprawdź rozmiar
4. Otwórz oryginał i backup w notatniku → porównaj (powinny być identyczne)

Napisz mi wynik: "✅ Wszystko OK" lub "❌ Problem: [co nie działa]"
```

### TY:
```
✅ Wszystko OK - backup ma 251KB, foldery istnieją, oryginał niezmieniony
```

### CLAUDE:
```
Doskonale! ✅

Etap 1A (Przygotowanie) ZAKOŃCZONY!

Aktualizuję STATUS_PROJEKTU.md...

✅ ETAP 1A ukończony (1/12 sesji)
Postęp: 8.3%

[View STATUS_PROJEKTU.md - ZAKTUALIZOWANY](computer:///...)

══════════════════════════════════════════

PODSUMOWANIE SESJI:

CO ZROBILIŚMY:
✅ Utworzony backup przed rozpoczęciem prac
✅ Utworzona struktura folderów dla modułów
✅ Weryfikacja - wszystko działa poprawnie

PLIKI DO POBRANIA (przed zamknięciem rozmowy):
1. STATUS_PROJEKTU.md (ZAWSZE!)
2. jeppcmpr_BACKUP_przed_podzialem.html
3. Folder jeppcmpr-modular/ (cały)

NASTĘPNA SESJA:
Etap 1B - Wydzielenie CSS (około 30-45 minut)
- Skopiujemy style do plików CSS
- Połączymy je z głównym plikiem
- Przetestujemy czy wygląd się nie zmienił

══════════════════════════════════════════

Masz jakieś pytania przed zakończeniem tej sesji?
```

---

## 📅 PRZYKŁADOWA SESJA 2: Wydzielenie CSS (nowa rozmowa)

### TY piszesz (nowa rozmowa):
```
Cześć Claude! Kontynuujemy podział JeppCMPR.

[Przesyłasz pliki]
- STATUS_PROJEKTU.md
- PROMPT_DLA_NOWEJ_ROZMOWY.txt  
- jeppcmpr_BACKUP_przed_podzialem.html
- folder jeppcmpr-modular/ (wszystkie pliki z środka)

[Wklejasz prompt i piszesz]
Sprawdź status i kontynuuj od miejsca gdzie przerwaliśmy.
```

### CLAUDE odpowiada:
```
Cześć! Przeczytałem STATUS_PROJEKTU.md.

Obecny stan:
- Etap: 1B - Wydzielenie CSS  
- Ostatni ukończony: Etap 1A (Przygotowanie)
- Postęp: 8.3% (1/12 sesji)

Mam wszystkie potrzebne pliki ✅

Następny krok: Wydzielenie stylów CSS z pliku głównego

Plan:
1. Skopiuję style (linie 9-2700) do css/main.css
2. Dodam link do CSS w index.html  
3. Style POZOSTANĄ w oryginale (duplikat dla bezpieczeństwa)
4. Przetestujemy
5. Jak działa - usuniemy style z oryginału
6. Przetestujemy ponownie

Mikro-krok 1: Skopiować style do css/main.css
Czy mogę rozpocząć?
```

### TY:
```
Tak
```

### CLAUDE:
```
[Mikro-krok 1 - Kopiowanie CSS]

Kopiuję style z linii 9-2700 do css/main.css...

[Claude używa view żeby odczytać style]
[Claude używa create_file żeby stworzyć css/main.css]

✅ Plik css/main.css utworzony (około 100KB)

[Link do pobrania]
[View css/main.css](computer:///...)

Aktualizuję STATUS_PROJEKTU.md...
[View STATUS_PROJEKTU.md - ZAKTUALIZOWANY](computer:///...)

Mikro-krok 2: Dodanie linku do CSS w index.html
Czy kontynuować?
```

### TY:
```
Tak
```

### (i tak dalej... praca krok po kroku)

---

## 🔍 CO WAŻNE W TYM PRZYKŁADZIE:

1. **Claude zawsze czyta STATUS_PROJEKTU.md** na początku
   - Wie gdzie przerwaliście
   - Wie co już jest zrobione
   - Wie co jest dalej

2. **Każdy mikro-krok ma weryfikację**
   - Claude robi → prosi o test → czeka na potwierdzenie

3. **STATUS_PROJEKTU.md aktualizowany po KAŻDYM kroku**
   - Zawsze masz najnowszy status
   - Jak rozmowa się przerwie - nic nie ginie

4. **Musisz pobierać pliki przed zamknięciem rozmowy**
   - Claude nie pamięta między rozmowami
   - Pliki w /mnt/user-data/outputs/ mogą zniknąć
   - Dlatego pobierasz i przesyłasz z powrotem

5. **Praca jest bezpieczna**
   - Zawsze backup przed zmianami
   - Najpierw kopiuj (nie usuwaj)
   - Test po każdej zmianie

---

## 💬 PRZYKŁADOWE KOMUNIKATY KTÓRE ZOBACZYSZ

### ✅ Gdy wszystko OK:
```
✅ Mikro-krok X zakończony
✅ Testy przeszły pomyślnie  
✅ STATUS_PROJEKTU.md zaktualizowany
Następny krok: [opis]
```

### 🔧 Gdy Claude czeka na Ciebie:
```
Proszę o test:
1. Pobierz plik [nazwa]
2. Otwórz w przeglądarce
3. Sprawdź [co sprawdzić]
4. Odpowiedz: ✅ Działa / ❌ Nie działa
```

### ⚠️ Gdy jest problem:
```
❌ Test wykrył problem
Problem: [opis]
Rozwiązanie: Przywracam poprzednią wersję z backupu
[Claude cofa zmiany]
Sprawdź czy teraz działa.
```

---

## 📊 JAK WYGLĄDA POSTĘP

Po każdej sesji w STATUS_PROJEKTU.md zobaczysz:

```
CAŁKOWITY POSTĘP: 2/12 sesji (16.6%)

Etapy:
✅ Etap 1A (Przygotowanie) - UKOŃCZONY
✅ Etap 1B (CSS) - UKOŃCZONY  
⬜ Etap 2 (Config+UI) - DO ZROBIENIA
⬜ Etap 3 (PDF Loader) - DO ZROBIENIA
... i tak dalej
```

---

**KONIEC PRZYKŁADU**

To pokazuje jak będzie wyglądała praca - małymi, bezpiecznymi krokami, z testami po drodze i możliwością przerwania w dowolnym momencie bez utraty postępu.