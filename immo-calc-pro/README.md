# 🏠 ImmoCalc Pro

Eine moderne Webanwendung zur Immobilienkalkulation, die klassische Excel-Tools ersetzt und durch Cloud-Funktionalitäten übertrifft. Entwickelt mit Next.js, TypeScript, Tailwind CSS und Recharts.

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
│   │   └── ScenarioComparison.tsx
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

Die App bietet vier Hauptansichten:

1. **Rechner** - Eingabeformular und Live-Ergebnisse
2. **Charts** - Tilgungsverlauf und Cashflow-Visualisierung
3. **Vergleich** - Bis zu 3 Szenarien nebeneinander
4. **Dashboard** - Portfolio-Übersicht und gespeicherte Immobilien

## 📜 Deutsches Steuerrecht

Die App berücksichtigt das deutsche Steuerrecht (Stand 2024):

- **AfA nach § 7 EStG**: 
  - 2,5% für Altbauten vor 1925
  - 2% für Gebäude ab 1925
  - 3% für Neubauten ab 2023 (mit Voraussetzungen)
  - 9% für denkmalgeschützte Gebäude

- **Grunderwerbsteuer nach Bundesland**: 3,5% (Bayern) bis 6,5% (Brandenburg, NRW, etc.)

- **Werbungskosten**: AfA + Zinsen + nicht umlegbare Kosten

## ⚠️ Haftungsausschluss

Dieses Tool dient nur zu Informationszwecken und ersetzt keine professionelle Finanzberatung. Alle Berechnungen basieren auf vereinfachten Annahmen.

## 📜 Lizenz

MIT License
