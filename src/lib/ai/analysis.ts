/**
 * AI Analysis Service
 * 
 * AI-powered deal analysis and scoring.
 * Uses rule-based analysis by default, with structure for AI API integration.
 */

import type { PropertyInput, PropertyOutput, LocationAnalysisInput, LocationAnalysisResult } from '@/types';

export interface DealScore {
  overall: number; // 0-100
  categories: {
    cashflow: number;
    yield: number;
    financing: number;
    location: number;
    potential: number;
  };
  rating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'AVOID';
}

export interface RiskFactor {
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  category: string;
  title: string;
  description: string;
  mitigation?: string;
}

export interface DealAnalysis {
  score: DealScore;
  risks: RiskFactor[];
  strengths: string[];
  weaknesses: string[];
  summary: string;
  detailedAnalysis: string;
}

export interface AIInsight {
  title: string;
  content: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Analyze a property deal using rule-based scoring
 */
export function analyzeDeal(
  input: PropertyInput,
  output: PropertyOutput,
  locationData?: LocationAnalysisResult
): DealAnalysis {
  const scores = calculateCategoryScores(input, output, locationData);
  const overallScore = calculateOverallScore(scores);
  const risks = identifyRisks(input, output, locationData);
  const { strengths, weaknesses } = identifyStrengthsWeaknesses(input, output, scores);
  
  const rating = getScoreRating(overallScore);
  const recommendation = getRecommendation(overallScore, risks);
  
  return {
    score: {
      overall: overallScore,
      categories: scores,
      rating,
      recommendation,
    },
    risks,
    strengths,
    weaknesses,
    summary: generateSummary(overallScore, rating, recommendation),
    detailedAnalysis: generateDetailedAnalysis(input, output, scores, risks),
  };
}

function calculateCategoryScores(
  input: PropertyInput,
  output: PropertyOutput,
  locationData?: LocationAnalysisResult
): DealScore['categories'] {
  // Cashflow score (0-100)
  let cashflowScore = 50;
  const monthlyCashflow = output.cashflow.monthlyCashflowAfterTax;
  if (monthlyCashflow >= 200) cashflowScore = 90;
  else if (monthlyCashflow >= 100) cashflowScore = 75;
  else if (monthlyCashflow >= 0) cashflowScore = 60;
  else if (monthlyCashflow >= -100) cashflowScore = 40;
  else if (monthlyCashflow >= -200) cashflowScore = 25;
  else cashflowScore = 10;
  
  // Yield score (0-100)
  let yieldScore = 50;
  const grossYield = output.yields.grossRentalYield;
  if (grossYield >= 8) yieldScore = 95;
  else if (grossYield >= 6) yieldScore = 80;
  else if (grossYield >= 5) yieldScore = 65;
  else if (grossYield >= 4) yieldScore = 50;
  else if (grossYield >= 3) yieldScore = 35;
  else yieldScore = 20;
  
  // Financing score (0-100)
  let financingScore = 50;
  const equityRatio = input.equity / output.investmentVolume.totalInvestment * 100;
  const interestRate = input.interestRate;
  
  if (equityRatio >= 30 && interestRate <= 3.0) financingScore = 90;
  else if (equityRatio >= 20 && interestRate <= 4.0) financingScore = 70;
  else if (equityRatio >= 15) financingScore = 55;
  else if (equityRatio >= 10) financingScore = 40;
  else financingScore = 25;
  
  // Location score (use provided data or default)
  const locationScore = locationData?.overallScore || 50;
  
  // Potential score (rent increase potential, appreciation)
  let potentialScore = 50;
  const rentDiff = ((input.coldRentTarget - input.coldRentActual) / input.coldRentActual) * 100;
  if (rentDiff >= 20) potentialScore = 85;
  else if (rentDiff >= 10) potentialScore = 70;
  else if (rentDiff >= 5) potentialScore = 55;
  else potentialScore = 40;
  
  return {
    cashflow: Math.round(cashflowScore),
    yield: Math.round(yieldScore),
    financing: Math.round(financingScore),
    location: Math.round(locationScore),
    potential: Math.round(potentialScore),
  };
}

function calculateOverallScore(scores: DealScore['categories']): number {
  // Weighted average with emphasis on cashflow and yield
  const weights = {
    cashflow: 0.25,
    yield: 0.25,
    financing: 0.15,
    location: 0.20,
    potential: 0.15,
  };
  
  const weightedSum = 
    scores.cashflow * weights.cashflow +
    scores.yield * weights.yield +
    scores.financing * weights.financing +
    scores.location * weights.location +
    scores.potential * weights.potential;
  
  return Math.round(weightedSum);
}

function identifyRisks(
  input: PropertyInput,
  output: PropertyOutput,
  locationData?: LocationAnalysisResult
): RiskFactor[] {
  const risks: RiskFactor[] = [];
  
  // Negative cashflow risk
  if (output.cashflow.monthlyCashflowAfterTax < -300) {
    risks.push({
      type: 'CRITICAL',
      category: 'Cashflow',
      title: 'Stark negativer Cashflow',
      description: `Die Immobilie generiert einen monatlichen Verlust von ${Math.abs(output.cashflow.monthlyCashflowAfterTax).toFixed(0)}€.`,
      mitigation: 'Prüfen Sie Mieterhöhungspotenzial, niedrigere Finanzierungskosten oder höheres Eigenkapital.',
    });
  } else if (output.cashflow.monthlyCashflowAfterTax < 0) {
    risks.push({
      type: 'WARNING',
      category: 'Cashflow',
      title: 'Negativer Cashflow',
      description: 'Die Immobilie trägt sich nicht selbst und erfordert monatliche Zuzahlungen.',
      mitigation: 'Langfristig durch Mietsteigerungen und Tilgung sollte sich dies verbessern.',
    });
  }
  
  // Low equity ratio risk
  const equityRatio = input.equity / output.investmentVolume.totalInvestment * 100;
  if (equityRatio < 10) {
    risks.push({
      type: 'CRITICAL',
      category: 'Finanzierung',
      title: 'Sehr niedriges Eigenkapital',
      description: `Nur ${equityRatio.toFixed(1)}% Eigenkapital erhöht das Finanzierungsrisiko erheblich.`,
      mitigation: 'Erhöhen Sie das Eigenkapital oder verhandeln Sie den Kaufpreis.',
    });
  } else if (equityRatio < 20) {
    risks.push({
      type: 'WARNING',
      category: 'Finanzierung',
      title: 'Niedriges Eigenkapital',
      description: `${equityRatio.toFixed(1)}% Eigenkapital bedeutet höhere Zinsbelastung.`,
    });
  }
  
  // High interest rate risk
  if (input.interestRate >= 5) {
    risks.push({
      type: 'WARNING',
      category: 'Finanzierung',
      title: 'Hoher Zinssatz',
      description: `${input.interestRate}% ist überdurchschnittlich hoch.`,
      mitigation: 'Vergleichen Sie Angebote verschiedener Banken.',
    });
  }
  
  // Low yield risk
  if (output.yields.grossRentalYield < 3.5) {
    risks.push({
      type: 'WARNING',
      category: 'Rendite',
      title: 'Niedrige Bruttorendite',
      description: `${output.yields.grossRentalYield.toFixed(1)}% ist unter dem empfohlenen Minimum von 4%.`,
    });
  }
  
  // Location risks
  if (locationData) {
    if (locationData.riskLevel === 'HOCH') {
      risks.push({
        type: 'CRITICAL',
        category: 'Standort',
        title: 'Hohe Standortrisiken',
        description: 'Der Standort zeigt erhebliche Schwächen.',
        mitigation: locationData.weaknesses.join(', '),
      });
    }
    
    if (locationData.weaknesses.includes('Schrumpfende Bevölkerung')) {
      risks.push({
        type: 'WARNING',
        category: 'Standort',
        title: 'Schrumpfende Bevölkerung',
        description: 'Langfristig könnte die Nachfrage sinken.',
      });
    }
  }
  
  // High vacancy risk
  if (input.vacancyRiskPercent >= 5) {
    risks.push({
      type: 'INFO',
      category: 'Betrieb',
      title: 'Erhöhtes Leerstandsrisiko',
      description: `${input.vacancyRiskPercent}% Leerstandsreserve einkalkuliert.`,
    });
  }
  
  return risks;
}

function identifyStrengthsWeaknesses(
  input: PropertyInput,
  output: PropertyOutput,
  scores: DealScore['categories']
): { strengths: string[]; weaknesses: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  // Cashflow
  if (scores.cashflow >= 70) {
    strengths.push('Starker positiver Cashflow');
  } else if (scores.cashflow <= 40) {
    weaknesses.push('Negativer oder schwacher Cashflow');
  }
  
  // Yield
  if (scores.yield >= 70) {
    strengths.push('Attraktive Mietrendite');
  } else if (scores.yield <= 40) {
    weaknesses.push('Unterdurchschnittliche Rendite');
  }
  
  // Financing
  if (scores.financing >= 70) {
    strengths.push('Solide Finanzierungsstruktur');
  } else if (scores.financing <= 40) {
    weaknesses.push('Riskante Finanzierungsstruktur');
  }
  
  // Location
  if (scores.location >= 70) {
    strengths.push('Guter Standort');
  } else if (scores.location <= 40) {
    weaknesses.push('Problematischer Standort');
  }
  
  // Potential
  if (scores.potential >= 70) {
    strengths.push('Hohes Wertsteigerungspotenzial');
  }
  
  // Additional analysis
  const equityRatio = input.equity / output.investmentVolume.totalInvestment * 100;
  if (equityRatio >= 30) {
    strengths.push('Hoher Eigenkapitalanteil');
  }
  
  if (input.interestRate <= 3.0) {
    strengths.push('Günstige Zinskonditionen');
  }
  
  if (output.yields.returnOnEquity >= 5) {
    strengths.push('Gute Eigenkapitalrendite');
  }
  
  return { strengths, weaknesses };
}

function getScoreRating(score: number): DealScore['rating'] {
  if (score >= 75) return 'EXCELLENT';
  if (score >= 60) return 'GOOD';
  if (score >= 45) return 'FAIR';
  return 'POOR';
}

function getRecommendation(score: number, risks: RiskFactor[]): DealScore['recommendation'] {
  const criticalRisks = risks.filter(r => r.type === 'CRITICAL').length;
  
  if (criticalRisks >= 2) return 'AVOID';
  if (criticalRisks >= 1 && score < 60) return 'AVOID';
  if (score >= 75 && criticalRisks === 0) return 'STRONG_BUY';
  if (score >= 60) return 'BUY';
  if (score >= 45) return 'HOLD';
  return 'AVOID';
}

function generateSummary(
  score: number,
  rating: DealScore['rating'],
  recommendation: DealScore['recommendation']
): string {
  const ratingText = {
    EXCELLENT: 'ausgezeichnetes',
    GOOD: 'gutes',
    FAIR: 'durchschnittliches',
    POOR: 'schwaches',
  }[rating];
  
  const recText = {
    STRONG_BUY: 'Diese Immobilie ist eine starke Investitionsmöglichkeit.',
    BUY: 'Diese Immobilie ist eine empfehlenswerte Investition.',
    HOLD: 'Diese Immobilie erfordert weitere Prüfung vor einer Entscheidung.',
    AVOID: 'Von dieser Immobilie wird aufgrund erheblicher Risiken abgeraten.',
  }[recommendation];
  
  return `Mit einem Score von ${score}/100 zeigt diese Immobilie ein ${ratingText} Investitionsprofil. ${recText}`;
}

function generateDetailedAnalysis(
  input: PropertyInput,
  output: PropertyOutput,
  scores: DealScore['categories'],
  risks: RiskFactor[]
): string {
  const sections: string[] = [];
  
  // Cashflow analysis
  sections.push(`**Cashflow (${scores.cashflow}/100)**
Die Immobilie generiert einen monatlichen Cashflow von ${output.cashflow.monthlyCashflowAfterTax.toFixed(0)}€ nach Steuern.
Bei einer Jahresmiete von ${output.cashflow.grossRentalIncome.toFixed(0)}€ und jährlichen Finanzierungskosten von ${output.cashflow.annualDebtService.toFixed(0)}€.`);
  
  // Yield analysis
  sections.push(`**Rendite (${scores.yield}/100)**
Bruttomietrendite: ${output.yields.grossRentalYield.toFixed(2)}%
Nettomietrendite: ${output.yields.netRentalYield.toFixed(2)}%
Eigenkapitalrendite: ${output.yields.returnOnEquity.toFixed(2)}%`);
  
  // Financing analysis
  const equityRatio = input.equity / output.investmentVolume.totalInvestment * 100;
  sections.push(`**Finanzierung (${scores.financing}/100)**
Eigenkapitalquote: ${equityRatio.toFixed(1)}%
Zinssatz: ${input.interestRate}%
Tilgungsrate: ${input.repaymentRate}%`);
  
  // Risk summary
  const criticalCount = risks.filter(r => r.type === 'CRITICAL').length;
  const warningCount = risks.filter(r => r.type === 'WARNING').length;
  sections.push(`**Risikobewertung**
${criticalCount} kritische Risiken, ${warningCount} Warnungen identifiziert.`);
  
  return sections.join('\n\n');
}

/**
 * Generate AI insights for a property
 * In production, this could call an AI API for more sophisticated analysis
 */
export function generateInsights(input: PropertyInput, output: PropertyOutput): AIInsight[] {
  const insights: AIInsight[] = [];
  
  // Cashflow insight
  if (output.cashflow.monthlyCashflowAfterTax < 0) {
    insights.push({
      title: 'Cashflow-Optimierung',
      content: `Um einen neutralen Cashflow zu erreichen, müsste die Miete um ca. ${Math.abs(output.cashflow.monthlyCashflowAfterTax).toFixed(0)}€/Monat erhöht werden oder die Finanzierungskosten entsprechend gesenkt werden.`,
      confidence: 'HIGH',
    });
  }
  
  // Interest rate insight
  if (input.interestRate > 3.5) {
    insights.push({
      title: 'Zinsoptimierung',
      content: 'Bei aktuellem Marktniveau könnten günstigere Konditionen möglich sein. Ein Vergleich verschiedener Finanzierungsanbieter wird empfohlen.',
      confidence: 'MEDIUM',
    });
  }
  
  // Equity optimization
  const equityRatio = input.equity / output.investmentVolume.totalInvestment * 100;
  if (equityRatio > 40) {
    insights.push({
      title: 'Kapitaleffizienz',
      content: 'Mit dem hohen Eigenkapitalanteil könnte alternativ ein weiteres Objekt finanziert werden, um die Rendite zu hebeln.',
      confidence: 'MEDIUM',
    });
  }
  
  // Tax optimization
  if (output.tax.taxEffect > 0) {
    insights.push({
      title: 'Steuerlicher Vorteil',
      content: `Die Immobilie generiert einen Steuervorteil von ca. ${output.tax.taxEffect.toFixed(0)}€ pro Jahr durch Werbungskosten und AfA.`,
      confidence: 'HIGH',
    });
  }
  
  return insights;
}

/**
 * Simple Q&A function for investment questions
 * In production, this would use an AI model
 */
export function answerInvestmentQuestion(
  question: string,
  context: { input: PropertyInput; output: PropertyOutput }
): string {
  const q = question.toLowerCase();
  
  if (q.includes('cashflow') || q.includes('monatlich')) {
    return `Der monatliche Cashflow nach Steuern beträgt ${context.output.cashflow.monthlyCashflowAfterTax.toFixed(0)}€. ` +
      `Dies ergibt sich aus der Jahresmiete von ${context.output.cashflow.grossRentalIncome.toFixed(0)}€ ` +
      `abzüglich Finanzierungskosten und unter Berücksichtigung der steuerlichen Effekte.`;
  }
  
  if (q.includes('rendite') || q.includes('yield')) {
    return `Die Bruttomietrendite liegt bei ${context.output.yields.grossRentalYield.toFixed(2)}%, ` +
      `die Nettomietrendite bei ${context.output.yields.netRentalYield.toFixed(2)}% und ` +
      `die Eigenkapitalrendite bei ${context.output.yields.returnOnEquity.toFixed(2)}%.`;
  }
  
  if (q.includes('finanzierung') || q.includes('kredit')) {
    return `Die Finanzierung läuft über ${context.output.financing.loanAmount.toFixed(0)}€ bei ` +
      `${context.input.interestRate}% Zinsen und ${context.input.repaymentRate}% Tilgung. ` +
      `Die monatliche Rate beträgt ${context.output.financing.monthlyPayment.toFixed(0)}€.`;
  }
  
  if (q.includes('steuer') || q.includes('afa')) {
    return `Jährliche Steuerersparnis durch AfA: ${context.output.tax.afaAmount.toFixed(0)}€. ` +
      `Gesamte Werbungskosten: ${context.output.tax.totalDeductions.toFixed(0)}€. ` +
      `Steuerlicher Effekt: ${context.output.tax.taxEffect.toFixed(0)}€/Jahr.`;
  }
  
  return 'Für diese Frage benötige ich mehr Kontext. Fragen Sie mich zu Cashflow, Rendite, Finanzierung oder Steuern.';
}
