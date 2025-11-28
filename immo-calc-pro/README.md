# 🏠 ImmoCalc Pro

Das **All-in-One Immobilien Investment Tool** - eine moderne Webanwendung zur Immobilienkalkulation, die klassische Excel-Tools ersetzt und durch Cloud-Funktionalitäten übertrifft. Entwickelt mit Next.js, TypeScript, Tailwind CSS und Recharts.

## ✨ Features

### 1. Kernberechnungen (Das "Excel"-Fundament)

Die App führt folgende Berechnungen dynamisch und in Echtzeit durch:

#### Eingabedaten (Input)
- **Kaufpreis & Nebenkosten**: Kaufpreis, Makler (%), Notar (%), Grunderwerbsteuer (%), Renovierungskosten
- **Finanzierung**: Eigenkapital, Darlehenssumme, Zinssatz (Sollzins), Tilgungssatz (%), Zinsbindung (Jahre)
- **Bewirtschaftung**: Kaltmiete (IST/SOLL), nicht umlagefähige Nebenkosten, Instandhaltungsrücklage
- **Steuer**: Persönlicher Steuersatz, Gebäudeanteil, AfA (linear/degressiv)

#### Ausgabedaten (Output/Berechnung)
- **Investitionsvolumen**: Gesamtkosten inkl. Kaufnebenkosten
- **Renditekennzahlen**: Bruttomietrendite (%), Nettomietrendite (%), Eigenkapitalrendite (ROI)
- **Cashflow**: Monatlicher Cashflow vor Steuern und nach Steuern
- **Steuerliche Auswirkung**: Zu versteuerndes Ergebnis aus Vermietung & Verpachtung

### 2. Verbesserungen ("Besser als Excel")

- **📊 Dashboard**: Übersicht aller gespeicherten Immobilien mit aggregiertem Portfolio-Cashflow
- **🔄 Szenario-Vergleich**: Side-by-Side Vergleich von bis zu 3 verschiedenen Finanzierungsangeboten
- **📈 Interaktive Charts**:
  - Tilgungsverlauf (Balkendiagramm: Restschuld vs. getilgter Betrag)
  - Kumulierter Cashflow & Vermögensentwicklung (Liniendiagramm)
- **📱 Responsiveness**: Mobile-first Design, perfekt auf dem Smartphone bedienbar
- **💾 Lokale Speicherung**: Immobilien werden im Browser gespeichert

### 3. 🆕 Erweiterte Funktionen (Differenzierungsmerkmale)

Diese neuen Funktionen heben ImmoCalc Pro von der Konkurrenz ab:

#### 📍 Mietpreisspiegel / Marktmieten-Vergleich
- Vergleich der aktuellen Miete mit lokalen Marktmieten
- Unterstützung für alle deutschen Großstädte
- Berücksichtigung von Baujahr, Zustand, Ausstattung, Etage
- Berechnung des Mieterhöhungspotenzials in € und %

#### 🎯 Break-Even Analyse
- Berechnung der Amortisationszeit durch Cashflow
- Berechnung inkl. Wertsteigerung
- Renditeprognose für 5, 10 und 15 Jahre
- Visualisierung der langfristigen Vermögensentwicklung

#### 🔧 Renovierungs-ROI Rechner
- ROI-Berechnung für verschiedene Renovierungsmaßnahmen
- Richtwerte für typische Kosten und Mietsteigerungen
- Amortisationsberechnung
- Empfehlungen basierend auf Kosten-Nutzen-Analyse

#### 🚪 Exit-Strategie / Verkaufsrechner
- Berechnung des Nettogewinns beim Verkauf
- Berücksichtigung der Spekulationssteuer (< 10 Jahre)
- Annualisierte Renditeberechnung
- Empfehlungen für optimalen Verkaufszeitpunkt

#### 📍 Standortanalyse
- Bewertung von Standorten nach verschiedenen Kriterien
- A/B/C/D-Lage Klassifizierung
- Stärken-/Schwächen-Analyse
- Investitionsempfehlung und Risikobewertung

#### ✅ Due Diligence Checkliste
- Umfassende Checkliste für die Immobilienprüfung
- 29 Prüfpunkte in 5 Kategorien
- Pflicht- und optionale Punkte markiert
- Notizen und Fortschrittsverfolgung
- Lokale Speicherung des Fortschritts

## 🚀 Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Custom UI Components (Shadcn/UI-inspired)
- **Charts**: Recharts
- **State Management**: Zustand mit Persist-Middleware
- **Database**: Supabase-ready Schema (PostgreSQL)

## 📁 Projektstruktur

```
immo-calc-pro/
├── src/
│   ├── app/
│   │   ├── globals.css        # Tailwind + Custom Styles
│   │   ├── layout.tsx         # Root Layout
│   │   └── page.tsx           # Haupt-Dashboard
│   ├── components/
│   │   ├── ui/                # UI Basis-Komponenten
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── slider.tsx
│   │   │   └── tabs.tsx
│   │   ├── Charts.tsx         # Recharts Visualisierungen
│   │   ├── PortfolioDashboard.tsx
│   │   ├── PropertyCalculatorForm.tsx
│   │   ├── ResultsPanel.tsx
│   │   ├── ScenarioComparison.tsx
│   │   ├── RentIndexCalculator.tsx    # 🆕 Mietpreisspiegel
│   │   ├── BreakEvenCalculator.tsx    # 🆕 Break-Even Analyse
│   │   ├── RenovationCalculator.tsx   # 🆕 Renovierungs-ROI
│   │   ├── ExitStrategyCalculator.tsx # 🆕 Exit-Strategie
│   │   ├── LocationAnalysis.tsx       # 🆕 Standortanalyse
│   │   └── DueDiligenceChecklist.tsx  # 🆕 Due Diligence
│   ├── lib/
│   │   ├── calculations.ts    # Zentrale Berechnungslogik
│   │   └── utils.ts           # Hilfsfunktionen
│   ├── store/
│   │   └── index.ts           # Zustand Store
│   └── types/
│       └── index.ts           # TypeScript Types
├── database/
│   └── schema.sql             # PostgreSQL Schema
└── package.json
```

## 🧮 Berechnungslogik

### TypeScript Calculation Engine

Die zentrale Berechnungsfunktion `calculatePropertyKPIs()` nimmt ein `PropertyInput`-Objekt an und gibt alle relevanten KPIs zurück:

```typescript
import { calculatePropertyKPIs, getDefaultPropertyInput } from "@/lib/calculations";

const input = getDefaultPropertyInput();
const output = calculatePropertyKPIs(input);

console.log(output.yields.returnOnEquity); // EK-Rendite
console.log(output.cashflow.monthlyCashflowAfterTax); // Monatlicher Cashflow
```

### Neue Berechnungsfunktionen

```typescript
import { 
  calculateRentIndex, 
  calculateBreakEven, 
  calculateRenovationROI, 
  calculateExitStrategy, 
  calculateLocationAnalysis 
} from "@/lib/calculations";

// Mietpreisspiegel
const rentResult = calculateRentIndex({
  city: "MUENCHEN",
  livingArea: 75,
  currentRent: 1000,
  // ... weitere Parameter
});

// Break-Even
const breakEvenResult = calculateBreakEven({
  totalInvestment: 327210,
  annualCashflow: -3994,
  annualAppreciation: 2.0,
  sellingCostsPercent: 6.0,
});

// Standortanalyse
const locationResult = calculateLocationAnalysis({
  populationTrend: "WACHSEND",
  employmentRate: "HOCH",
  // ... weitere Parameter
});
```

### Annuitätenberechnung
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

## 🗃️ Datenbankschema

Das PostgreSQL-Schema für Supabase befindet sich in `database/schema.sql` und enthält:

- `properties` - Haupttabelle für Immobiliendaten
- `scenarios` - Szenarien für Vergleiche
- `amortization_schedules` - Tilgungspläne
- Row Level Security (RLS) für Benutzer-Datentrennung

## 🚀 Installation & Entwicklung

```bash
# In das Projektverzeichnis wechseln
cd immo-calc-pro

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Für Produktion bauen
npm run build

# Produktionsserver starten
npm start
```

## 📱 Ansichten

Die App bietet zehn Hauptansichten in zwei Navigationsebenen:

### Primäre Funktionen:
1. **Rechner** - Eingabeformular und Live-Ergebnisse
2. **Charts** - Tilgungsverlauf und Cashflow-Visualisierung
3. **Vergleich** - Bis zu 3 Szenarien nebeneinander
4. **Dashboard** - Portfolio-Übersicht und gespeicherte Immobilien

### Erweiterte Funktionen:
5. **Mietspiegel** - Marktmieten-Vergleich
6. **Break-Even** - Amortisationsberechnung
7. **Renovierung** - ROI für Renovierungsmaßnahmen
8. **Exit** - Verkaufs- und Exit-Strategie
9. **Standort** - Standortanalyse und -bewertung
10. **Checkliste** - Due Diligence Prüfliste

## 📜 Deutsches Steuerrecht

Die App berücksichtigt das deutsche Steuerrecht (Stand 2024):

- **AfA nach § 7 EStG**: 
  - 2,5% für Altbauten vor 1925
  - 2% für Gebäude ab 1925
  - 3% für Neubauten ab 2023 (mit Voraussetzungen)
  - 9% für denkmalgeschützte Gebäude

- **Grunderwerbsteuer nach Bundesland**: 3,5% (Bayern) bis 6,5% (Brandenburg, NRW, etc.)

- **Werbungskosten**: AfA + Zinsen + nicht umlegbare Kosten

- **Spekulationssteuer**: Berücksichtigung bei Verkauf innerhalb von 10 Jahren

## ⚠️ Haftungsausschluss

Dieses Tool dient nur zu Informationszwecken und ersetzt keine professionelle Finanzberatung. Alle Berechnungen basieren auf vereinfachten Annahmen.

## 📜 Lizenz

MIT License
