# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-01-01

### Added

- **Core Calculations**
  - Property investment calculator with real-time KPI updates
  - Support for purchase price, ancillary costs, and renovation expenses
  - Financing calculations with loan amount, interest rate, and amortization
  - Operating cost and maintenance reserve tracking
  - Tax calculations including personal tax rate, building share, and depreciation (AfA)

- **Yield Metrics**
  - Gross rental yield calculation
  - Net rental yield calculation
  - Return on equity (ROI) calculation
  - Monthly and annual cashflow (before and after taxes)

- **Advanced Features**
  - Scenario comparison (up to 3 financing scenarios side-by-side)
  - Rent index comparison with local market rents
  - Break-even analysis with payback period calculation
  - Renovation ROI calculator with recommendations
  - Exit strategy and sale calculator with speculation tax
  - Location analysis with A/B/C/D rating
  - Due diligence checklist with 29 items across 5 categories

- **AI-Powered Analysis**
  - Deal scoring with category breakdown
  - Automatic risk detection and recommendations
  - Investment advisor chatbot
  - Strengths and weaknesses analysis

- **Charts & Visualization**
  - Amortization schedule visualization
  - Cumulative cashflow chart
  - Asset development over time
  - Monte Carlo simulation for probabilistic forecasts

- **Technical Features**
  - Progressive Web App (PWA) support with offline capability
  - Local storage persistence with Zustand
  - Internationalization (German/English)
  - Mobile-first responsive design
  - Supabase-ready database schema

- **Developer Experience**
  - Unit tests with Vitest
  - E2E tests with Playwright
  - ESLint configuration
  - TypeScript strict mode
  - CI/CD with GitHub Actions

### Security

- Row Level Security (RLS) for user data separation in database schema

[unreleased]: https://github.com/Festas/Immo-Invest-Tool/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Festas/Immo-Invest-Tool/releases/tag/v0.1.0
