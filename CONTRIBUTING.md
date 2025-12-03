# Contributing to ImmoCalc Pro

First off, thank you for considering contributing to ImmoCalc Pro! It's people like you that make this project such a great tool for real estate investors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Code Style Guidelines](#code-style-guidelines)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

This project and everyone participating in it is governed by our commitment to maintaining a welcoming and inclusive environment. Please be respectful and considerate in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/Immo-Invest-Tool.git
   cd Immo-Invest-Tool
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/Festas/Immo-Invest-Tool.git
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Environment

### Prerequisites

- Node.js 20.x LTS (see `.nvmrc`)
- npm 10.x or later
- Git

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment file:
   ```bash
   cp .env.example .env.local
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run test` | Run unit tests in watch mode |
| `npm run test:run` | Run unit tests once |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run E2E tests |

## Code Style Guidelines

### General

- Use TypeScript for all new code
- Follow the existing code patterns and conventions
- Use meaningful variable and function names
- Keep functions small and focused
- Add comments only when necessary to explain "why", not "what"

### TypeScript

- Use explicit types instead of `any`
- Prefer interfaces over type aliases for object shapes
- Use enums or const objects for fixed sets of values
- Export types that are used across modules

### React

- Use functional components with hooks
- Keep components focused on a single responsibility
- Use custom hooks for reusable logic
- Prefer controlled components over uncontrolled

### Styling

- Use Tailwind CSS for styling
- Follow the mobile-first responsive design approach
- Use the existing UI components from `src/components/ui/`

### Formatting

This project uses Prettier for code formatting and ESLint for linting. Before committing:

```bash
# Format all files
npm run format

# Check formatting
npm run format:check

# Run linter
npm run lint
```

Pre-commit hooks will automatically format and lint staged files.

## Making Changes

1. **Sync with upstream** before starting work:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** in small, logical commits

3. **Write or update tests** as needed

4. **Ensure all tests pass**:
   ```bash
   npm run test:run
   npm run lint
   npm run build
   ```

5. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

## Pull Request Process

1. **Fill out the PR template** completely
2. **Link any related issues** using keywords like "Fixes #123"
3. **Ensure CI checks pass**
4. **Request review** from maintainers
5. **Address review feedback** promptly
6. **Squash commits** if requested by reviewers

### PR Title Convention

Use conventional commit format for PR titles:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for test changes
- `chore:` for maintenance tasks

Example: `feat: add rent comparison feature`

## Testing Requirements

### Unit Tests

- Write unit tests for all new utility functions and hooks
- Tests are located in `src/__tests__/unit/`
- Use Vitest as the test runner
- Aim for meaningful test coverage, not just high percentages

```bash
# Run unit tests
npm run test:run

# Run with coverage
npm run test:coverage
```

### E2E Tests

- Add E2E tests for new user-facing features
- Tests are located in `src/__tests__/e2e/`
- Use Playwright for E2E testing

```bash
# Run E2E tests
npm run test:e2e
```

### Test Guidelines

- Follow the AAA pattern (Arrange, Act, Assert)
- Use descriptive test names
- Test edge cases and error conditions
- Mock external dependencies appropriately

## Reporting Bugs

When reporting bugs, please include:

1. **A clear title** describing the issue
2. **Steps to reproduce** the problem
3. **Expected behavior** vs actual behavior
4. **Screenshots** if applicable
5. **Environment details** (browser, OS, Node.js version)

## Suggesting Features

Feature suggestions are welcome! Please:

1. **Search existing issues** to avoid duplicates
2. **Describe the use case** and why it's valuable
3. **Provide examples** of how it would work
4. **Consider backwards compatibility**

---

Thank you for contributing to ImmoCalc Pro! 🏠
