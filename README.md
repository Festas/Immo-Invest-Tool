# 🏠 ImmoCalc Pro

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-20.x-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://reactjs.org/)

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

#### 🤖 KI-gestützte Analyse (NEU)

- Deal-Scoring mit Kategorieauswertung (Cashflow, Rendite, Finanzierung, Standort, Potenzial)
- Automatische Risikoerkennung und Empfehlungen
- Investment-Berater Chatbot für Fragen zur Immobilie
- Stärken-/Schwächen-Analyse

#### 📊 Erweiterte Analysen (NEU)

- Monte-Carlo-Simulation für probabilistische Renditeprognosen
- Infrastruktur-Scoring für Standorte
- API-Struktur für Hypothekenzinsen und Marktdaten

## 🚀 Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Custom UI Components (Shadcn/UI-inspired)
- **Charts**: Recharts
- **State Management**: Zustand mit Persist-Middleware
- **Testing**: Vitest (Unit Tests), Playwright (E2E Tests)
- **Database**: Supabase-ready Schema (PostgreSQL)
- **PWA**: Service Worker für Offline-Unterstützung

## 📁 Projektstruktur

```
/
├── src/
│   ├── app/
│   │   ├── globals.css        # Tailwind + Custom Styles
│   │   ├── layout.tsx         # Root Layout
│   │   └── page.tsx           # Haupt-Dashboard
│   ├── components/
│   │   ├── ui/                # UI Basis-Komponenten
│   │   ├── auth/              # 🆕 Authentifizierung
│   │   ├── ai/                # 🆕 KI-Komponenten
│   │   ├── analytics/         # 🆕 Analysekomponenten
│   │   ├── export/            # 🆕 Export-Komponenten
│   │   └── ...                # Feature-Komponenten
│   ├── lib/
│   │   ├── calculations.ts    # Zentrale Berechnungslogik
│   │   ├── api/               # 🆕 API-Integrationen
│   │   ├── supabase/          # 🆕 Supabase Client & Auth
│   │   ├── ai/                # 🆕 KI-Analyse
│   │   ├── analytics/         # 🆕 Monte Carlo etc.
│   │   ├── export/            # 🆕 PDF/Excel Export
│   │   └── location/          # 🆕 Standort-Analyse
│   ├── locales/               # 🆕 i18n (DE/EN)
│   ├── store/
│   │   └── index.ts           # Zustand Store
│   └── types/
│       └── index.ts           # TypeScript Types
├── src/__tests__/             # 🆕 Tests
│   ├── unit/                  # Unit Tests (Vitest)
│   └── e2e/                   # E2E Tests (Playwright)
├── .github/workflows/         # 🆕 CI/CD
│   ├── ci.yml                 # Lint, Test, Build
│   └── deploy.yml             # Vercel Deployment
├── public/
│   ├── manifest.json          # 🆕 PWA Manifest
│   └── sw.js                  # 🆕 Service Worker
└── package.json
```

## 🧪 Tests

### Unit Tests ausführen

```bash
# Interaktiver Modus
npm run test

# Einmaliger Durchlauf
npm run test:run

# Mit Coverage
npm run test:coverage
```

### E2E Tests ausführen

```bash
# E2E Tests
npm run test:e2e

# Mit UI
npm run test:e2e:ui
```

## 🔧 Umgebungsvariablen

Kopieren Sie `.env.example` nach `.env.local` und füllen Sie die Werte aus:

```bash
cp .env.example .env.local
```

| Variable                        | Beschreibung         | Erforderlich          |
| ------------------------------- | -------------------- | --------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase Projekt-URL | Nein (für Cloud-Sync) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key    | Nein (für Cloud-Sync) |
| `OPENAI_API_KEY`                | OpenAI API Key       | Nein (für KI)         |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY`   | Google Maps API Key  | Nein (für Karten)     |

> **Hinweis**: Alle Features funktionieren offline ohne externe APIs (Graceful Degradation).

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
  calculateLocationAnalysis,
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

### KI-Analyse

```typescript
import { analyzeDeal, generateInsights } from "@/lib/ai/analysis";

const analysis = analyzeDeal(input, output);
console.log(analysis.score.overall); // Deal-Score 0-100
console.log(analysis.risks); // Identifizierte Risiken
console.log(analysis.recommendation); // STRONG_BUY | BUY | HOLD | AVOID
```

### Monte Carlo Simulation

```typescript
import { runMonteCarloSimulation } from "@/lib/analytics/monte-carlo";

const result = runMonteCarloSimulation({
  initialInvestment: 300000,
  annualCashflow: 5000,
  cashflowVariability: 10,
  annualAppreciation: 2.0,
  appreciationVariability: 5,
  yearsToSimulate: 15,
  numberOfSimulations: 1000,
});

console.log(result.percentiles.p50); // Median-Ergebnis
console.log(result.probabilityOfLoss); // Verlustwahrscheinlichkeit
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

# Tests ausführen
npm run test:run

# Linting
npm run lint
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

## 🔌 API-Integrationen

Die App ist vorbereitet für folgende API-Integrationen:

| API              | Datei                           | Status     |
| ---------------- | ------------------------------- | ---------- |
| Hypothekenzinsen | `src/lib/api/mortgage-rates.ts` | Mock-Daten |
| Marktdaten       | `src/lib/api/market-data.ts`    | Mock-Daten |
| Mietpreisspiegel | `src/lib/api/rent-index.ts`     | Mock-Daten |

> Bei fehlender API-Konfiguration werden automatisch Mock-Daten verwendet.

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

## 🌐 Internationalisierung

Die App unterstützt Deutsch und Englisch. Übersetzungsdateien befinden sich in:

- `src/locales/de.json` - Deutsche Übersetzungen
- `src/locales/en.json` - Englische Übersetzungen

## 📱 PWA-Unterstützung

ImmoCalc Pro kann als Progressive Web App installiert werden:

- Offline-Unterstützung via Service Worker
- Installierbar auf Desktop und Mobile
- App-Icon und Splash Screen

## 🐳 Docker

ImmoCalc Pro kann mit Docker ausgeführt werden:

### Production Build

```bash
# Mit Docker Compose bauen und starten
docker compose up --build

# Oder manuell mit Docker
docker build -t immo-calc-pro .
docker run -p 3000:3000 immo-calc-pro
```

### Development Mode

```bash
# Entwicklungsumgebung mit Hot Reload
docker compose --profile dev up dev
```

Die App ist dann unter [http://localhost:3000](http://localhost:3000) erreichbar.

## 🤝 Contributing

Wir freuen uns über Beiträge! Bitte lesen Sie unsere [Contributing Guidelines](CONTRIBUTING.md) für Details zu:

- Wie Sie die Entwicklungsumgebung einrichten
- Code-Style Guidelines
- Pull Request Prozess
- Testing Anforderungen

Für Sicherheitsprobleme lesen Sie bitte unsere [Security Policy](SECURITY.md).

## ⚠️ Haftungsausschluss

Dieses Tool dient nur zu Informationszwecken und ersetzt keine professionelle Finanzberatung. Alle Berechnungen basieren auf vereinfachten Annahmen.

## 📜 Lizenz

MIT License

## 🔍 CoachMark Debug-Modus

Die Onboarding CoachMark-Komponente verfügt über einen Debug-Modus, der bei Problemen mit der Positionierung oder Sichtbarkeit hilft:

### Aktivierung des Debug-Modus

Es gibt drei Möglichkeiten, den Debug-Modus zu aktivieren:

1. **Über Umgebungsvariablen** (empfohlen für Entwicklung):

   ```bash
   # In .env.local
   NEXT_PUBLIC_COACHMARK_DEBUG=true
   ```

2. **Über Props** (für spezifische Komponenten):

   ```tsx
   <CoachMark debugMode={true} {...otherProps} />
   ```

3. **Force Fallback Mode** (für Testing):
   ```bash
   # In .env.local
   NEXT_PUBLIC_COACHMARK_FORCE_FALLBACK=true
   ```

### Debug-Informationen

Im Debug-Modus werden folgende Informationen angezeigt:

- **Target**: Der verwendete CSS-Selektor
- **Found**: Ob das Zielelement gefunden wurde (✓ Yes / ✗ No)
- **Partially Visible**: Ob das Element teilweise sichtbar ist
- **Fully Visible**: Ob das Element vollständig im Viewport ist
- **Rect**: Bounding-Rechteck (top, left, width, height)
- **Fallback Reason**: Grund für die Verwendung des Fallback-Modals

### Automatische Fallback-Logik

Die CoachMark-Komponente wechselt automatisch zu einem zentrierten Modal, wenn:

- Das Zielelement nicht gefunden wird
- Das Element außerhalb des Viewports liegt
- Das Element verborgen ist (display: none, visibility: hidden)
- Force-Fallback-Modus aktiviert ist

### Garantien

Die Implementierung stellt sicher:

- ✅ Der "Weiter"-Button ist niemals außerhalb des Bildschirms oder nicht klickbar
- ✅ Das Onboarding hängt niemals oder blockiert permanent die Benutzeroberfläche
- ✅ Scroll-Locks, Z-Index-Overlays und Event-Listener werden bei jedem Schritt-Übergang bereinigt
- ✅ Debug-Informationen unterstützen die Fehlerbehebung
