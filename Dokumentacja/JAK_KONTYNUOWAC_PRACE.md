# JAK KONTYNUOWAĆ PRACĘ - Przewodnik krok po kroku

## 📥 NA KONIEC KAŻDEJ ROZMOWY (PRZED ZAMKNIĘCIEM)

### Krok 1: Pobierz wszystkie pliki
Kliknij linki do plików które Claude stworzył w rozmowie. Będą wyglądać tak:
```
[View STATUS_PROJEKTU.md](computer:///mnt/user-data/outputs/STATUS_PROJEKTU.md)
[View CHECKLISTA_TESTOWA.md](computer:///mnt/user-data/outputs/CHECKLISTA_TESTOWA.md)
```

**MUSISZ POBRAĆ:**
- STATUS_PROJEKTU.md (najważniejszy!)
- PROMPT_DLA_NOWEJ_ROZMOWY.txt
- CHECKLISTA_TESTOWA.md
- plan_podzialu_jeppcmpr.md
- Wszystkie pliki które powstały w tej sesji (HTML, CSS, JS)

### Krok 2: Zapisz w folderze na komputerze
Stwórz folder np. `JeppCMPR_Projekt` i zapisz tam wszystkie pliki.

### Krok 3: Przeczytaj STATUS_PROJEKTU.md
Otwórz STATUS_PROJEKTU.md w notatniku i zobacz:
- Co zostało zrobione (✅)
- Co jest do zrobienia (⬜)

---

## 🔄 NA POCZĄTKU NOWEJ ROZMOWY

### Krok 1: Prześlij pliki do Claude
Przeciągnij do nowego czatu:
1. **STATUS_PROJEKTU.md** ← najważniejszy!
2. PROMPT_DLA_NOWEJ_ROZMOWY.txt
3. Inne pliki które powstały (jeśli są)

**Przykład:** Jeśli w poprzedniej rozmowie stworzyliśmy `css/main.css`, to też go prześlij.

### Krok 2: Skopiuj i wklej prompt
Otwórz plik `PROMPT_DLA_NOWEJ_ROZMOWY.txt` w notatniku.
Skopiuj całą treść (Ctrl+A, Ctrl+C).
Wklej do czatu (Ctrl+V).

### Krok 3: Wymień pliki które masz
W miejscu gdzie w promptcie jest:
```
PLIKI KTÓRE MAM ZAŁĄCZONE:
- STATUS_PROJEKTU.md (główny dokument statusu)
- plan_podzialu_jeppcmpr.md (plan podziału)
- [tu wymienię inne pliki jeśli są]
```

Dopisz wszystkie pliki które przesłałeś, np.:
```
PLIKI KTÓRE MAM ZAŁĄCZONE:
- STATUS_PROJEKTU.md (główny dokument statusu)
- plan_podzialu_jeppcmpr.md (plan podziału)
- CHECKLISTA_TESTOWA.md (testy)
- css/main.css (plik CSS który powstał)
```

### Krok 4: Wyślij wiadomość
Claude przeczyta STATUS_PROJEKTU.md i powie Ci:
- Na jakim etapie jesteś
- Co jest do zrobienia
- Czy czegoś mu brakuje

---

## 🎯 JAK PRACOWAĆ W NOWEJ ROZMOWIE

### Po każdym mikro-kroku Claude:
1. Zrobi zmianę w kodzie (użyje str_replace)
2. **ZAKTUALIZUJE STATUS_PROJEKTU.md** ← ważne!
3. Poda Ci link do pobrania zaktualizowanego pliku
4. Poprosi Cię o test

### Ty po każdym mikro-kroku:
1. **POBIERZ zaktualizowany STATUS_PROJEKTU.md**
2. Otwórz zmieniony plik HTML w przeglądarce
3. Przejdź przez CHECKLISTA_TESTOWA.md (TEST PODSTAWOWY)
4. Napisz Claude czy działa: "✅ Działa" lub "❌ Nie działa, błąd: [opis]"

### Jeśli rozmowa się kończy w środku kroku:
1. Pobierz wszystkie pliki (zwłaszcza STATUS_PROJEKTU.md)
2. W STATUS_PROJEKTU.md będzie napisane co było robione
3. W nowej rozmowie Claude doczyta status i będzie wiedział co dalej

---

## 🔍 JAK SPRAWDZIĆ POSTĘP

Otwórz STATUS_PROJEKTU.md i zobacz:

**Sekcja "✅ CO ZOSTAŁO ZROBIONE"**
- Tu są odhaczone rzeczy które już działają

**Sekcja "🎯 OBECNY STAN"**  
- Tu widzisz które pliki istnieją

**Sekcja "📋 NASTĘPNE KROKI"**
- Tu jest lista tego co teraz robicie

**Sekcja "📊 POSTĘP OGÓLNY"**
- Tu widzisz ile % projektu jest zrobione

---

## 📂 ORGANIZACJA PLIKÓW NA TWOIM KOMPUTERZE

Zalecam taką strukturę:

```
JeppCMPR_Projekt/
├── Dokumentacja/
│   ├── STATUS_PROJEKTU.md (zawsze najnowszy!)
│   ├── PROMPT_DLA_NOWEJ_ROZMOWY.txt
│   ├── CHECKLISTA_TESTOWA.md
│   └── plan_podzialu_jeppcmpr.md
│
├── Pliki_Robocze/
│   ├── jeppcmpr-modular/ (folder z modułami)
│   │   ├── index.html
│   │   ├── css/
│   │   └── js/
│   └── (inne pliki które powstają)
│
└── Backupy/
    ├── jeppcmpr_BACKUP_przed_podzialem.html
    ├── jeppcmpr_BACKUP_po_etapie1.html
    └── (kolejne backupy)
```

---

## ⚠️ NAJCZĘSTSZE PROBLEMY

### Problem: "Nie wiem co wkleić do nowej rozmowy"
**Rozwiązanie:** Zawsze wklej cały tekst z `PROMPT_DLA_NOWEJ_ROZMOWY.txt`

### Problem: "Claude nie wie na jakim etapie jesteśmy"
**Rozwiązanie:** Upewnij się że przesłałeś `STATUS_PROJEKTU.md` jako załącznik

### Problem: "Plik który był w poprzedniej rozmowie zniknął"
**Rozwiązanie:** Pliki w `/mnt/user-data/outputs/` mogą zniknąć między rozmowami. Dlatego musisz je POBIERAĆ i przesyłać z powrotem.

### Problem: "Nie wiem czy mam wszystkie potrzebne pliki"
**Rozwiązanie:** W STATUS_PROJEKTU.md w sekcji "OBECNY STAN" jest lista plików które powinny istnieć

### Problem: "Test nie przechodzi ale nie wiem co jest źle"
**Rozwiązanie:** 
1. Otwórz przeglądarkę (Chrome/Firefox)
2. Wciśnij F12 (otwiera narzędzia deweloperskie)
3. Kliknij zakładkę "Console"
4. Zobacz czy są czerwone błędy
5. Skopiuj treść błędu i wyślij Claude

---

## 💡 WSKAZÓWKI

✅ **Rób częste backupy** - przed każdą większą zmianą

✅ **Testuj często** - po każdym mikro-kroku, nie na końcu

✅ **Zapisuj STATUS_PROJEKTU.md** - to Twoja mapa postępu

✅ **Nie edytuj plików ręcznie** - wszystkie zmiany przez Claude (str_replace)

✅ **Pytaj jak czegoś nie rozumiesz** - lepiej zapytać niż zgadywać

---

## 📞 SZYBKIE PODPOWIEDZI

**Jak zacząć nową rozmowę?**
→ Prześlij STATUS_PROJEKTU.md + wklej PROMPT_DLA_NOWEJ_ROZMOWY.txt

**Jak sprawdzić postęp?**
→ Otwórz STATUS_PROJEKTU.md, sekcja "POSTĘP OGÓLNY"

**Co robić jak test nie przechodzi?**
→ Przywróć backup i napisz Claude jaki był błąd

**Gdzie są moje pliki?**
→ Pobrane z Claude: w folderze Downloads
→ Claude tworzy je w: /mnt/user-data/outputs/
→ Oryginał projektu: /mnt/project/

**Jak wrócić do poprzedniej wersji?**
→ Użyj pliku z folderu Backupy/

---

**KONIEC PRZEWODNIKA**

Jeśli coś jest niejasne - pytaj! To jest Twój projekt i musisz czuć się komfortowo z tym systemem.