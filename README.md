# 🏠 Immo-Invest-Tool

Ein High-End Real Estate Investment Dashboard für den deutschen Immobilienmarkt. Entwickelt mit Streamlit & Plotly.

## ✨ Features

### 1. Finance Engine
- **Annuitätenberechnung** - Echtzeit-Berechnung der monatlichen Rate
- **Cashflow-Analyse** - Vor und nach Steuern
- **ROI-Berechnungen** - Brutto-/Netto-Rendite, Eigenkapitalrendite
- **Tilgungsplan** - Vollständiger Amortisationsplan via Pandas

### 2. Analytics
- **Interaktive Charts** - Vermögensaufbau vs. Restschuld
- **Tilgungsplan-Visualisierung** - Zins- und Tilgungsanteile
- **Rendite-Vergleich** - Verschiedene Renditekennzahlen
- **Steuerliche Übersicht** - Wasserfall-Diagramm für V&V

### 3. UI
- **Professionelles Sidebar-Layout** - Alle Eingaben übersichtlich gruppiert
- **KPI-Metriken** - Yield, Cashflow, EK-Rendite auf einen Blick
- **Tab-Navigation** - Verschiedene Analysebereiche
- **Responsive Design** - Optimiert für alle Bildschirmgrößen

### 4. Deutsches Steuerrecht
- **AfA nach § 7 EStG** - Verschiedene Abschreibungssätze
- **Grunderwerbsteuer** - Nach Bundesland
- **Werbungskosten** - Vollständige Absetzbarkeit
- **Steuervorteil-Berechnung** - Basierend auf Grenzsteuersatz

## 🚀 Installation

```bash
# Repository klonen
git clone https://github.com/Festas/Immo-Invest-Tool.git
cd Immo-Invest-Tool

# Abhängigkeiten installieren
pip install -r requirements.txt

# App starten
streamlit run app.py
```

## 📁 Projektstruktur

```
Immo-Invest-Tool/
├── app.py                 # Hauptanwendung (Streamlit Dashboard)
├── requirements.txt       # Python-Abhängigkeiten
├── README.md             # Diese Datei
└── src/
    ├── __init__.py
    ├── finance_engine.py  # Finanzberechnungen (Annuität, Cashflow, ROI)
    ├── tax_calculator.py  # Deutsches Steuerrecht (AfA, Werbungskosten)
    └── analytics.py       # Plotly-Visualisierungen
```

## 📊 Eingabemöglichkeiten

| Parameter | Eingabetyp | Beschreibung |
|-----------|------------|--------------|
| Kaufpreis | Zahlenfeld | Kaufpreis der Immobilie |
| Bundesland | Dropdown | Für Grunderwerbsteuerberechnung |
| Makler | Checkbox + Slider | Maklerprovision optional |
| Eigenkapital | Zahlenfeld | Eingesetztes Eigenkapital |
| Zinssatz | Zahlenfeld | Jährlicher Sollzinssatz |
| Tilgung | Zahlenfeld | Anfängliche Tilgung |
| Laufzeit | Slider | Betrachtungszeitraum |
| Kaltmiete | Zahlenfeld | Monatliche Kaltmiete |
| AfA-Typ | Dropdown | Abschreibungsart |
| Grenzsteuersatz | Slider | Persönlicher Steuersatz |

## 🧮 Berechnungen

### Annuität
```
Annuität = Darlehensbetrag × (Zinssatz + Tilgung) / 100
```

### Cashflow
```
Cashflow = Netto-Mieteinnahmen - Darlehensrate + Steuervorteil
```

### Eigenkapitalrendite
```
EK-Rendite = Cashflow nach Steuern / Eigenkapital × 100
```

## 📜 Lizenz

MIT License

## ⚠️ Haftungsausschluss

Dieses Tool dient nur zu Informationszwecken und ersetzt keine professionelle Finanzberatung. Alle Berechnungen basieren auf vereinfachten Annahmen.