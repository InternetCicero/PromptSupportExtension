# 📚 Prompt Saver

**Prompt Saver** ist ein einfaches, elegantes Tool zum Speichern, Verwalten und Durchsuchen von Prompts – ideal für ChatGPT, Midjourney, und andere KI-Tools. Organisiere deine Prompts nach Namen oder Tags, exportiere oder importiere sie, und schalte den Dark Mode nach Wunsch ein.

## 🔧 Features

- 💾 Prompts speichern mit Name, Tags und Text
- 🔍 Suche nach Name oder #Tags
- ✏️ Prompts bearbeiten und löschen
- 📋 Prompt kopieren in die Zwischenablage
- 📥 Import / 📤 Export von Prompts als JSON-Datei
- 🌙 Dark Mode umschaltbar
- ⚙️ Einstellungen-Seite mit Theme-Toggle

## 📂 Projektstruktur

📁 prompt-saver/

├── popup.html # Haupt-UI

├── settings.html # Einstellungsseite für Dark Mode

├── styles.css # Hauptstyles inklusive Dark Theme

├── settings.css # Styles nur für die Einstellungen

├── popup.js # Logik zum Speichern, Anzeigen und Filtern

├── README.md # (Du bist hier!)

└── manifest.json # (Für Browser Extension falls gewünscht)


## 💡 Vorschläge für Erweiterungen

- KI-gestützte Prompt-Optimierung
- Favoriten-System
- Kategorien statt nur Tags
- Export/Sync mit Google Drive oder GitHub Gists
- Unterstützung mehrerer Sprachen

## ⚙️ Installation (als Browser Extension)

1. Dieses Repository herunterladen oder klonen:
   ```bash
   git clone https://github.com/dein-benutzername/prompt-saver.git

2. Öffne deinen Browser (z. B. Chrome) und gehe zu chrome://extensions/

3. Aktiviere den Entwicklermodus und klicke auf Entpackte Erweiterung laden

4. Wähle den Ordner prompt-saver aus

🛠️ Technologien
HTML, CSS, JavaScript

chrome.storage API für persistente Speicherung

Klassisches DOM-Rendering (kein Framework notwendig)

📝 Lizenz
MIT License – frei nutzbar, auch für eigene Erweiterungen.

