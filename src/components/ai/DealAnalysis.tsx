'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { analyzeDeal, type DealAnalysis } from '@/lib/ai/analysis';
import type { PropertyInput, PropertyOutput } from '@/types';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Lightbulb,
  Shield,
  Target
} from 'lucide-react';

interface DealAnalysisProps {
  input: PropertyInput;
  output: PropertyOutput;
}

export function DealAnalysis({ input, output }: DealAnalysisProps) {
  const analysis: DealAnalysis = useMemo(() => {
    return analyzeDeal(input, output);
  }, [input, output]);

  const getRatingColor = () => {
    switch (analysis.score.rating) {
      case 'EXCELLENT': return 'text-green-600 bg-green-100';
      case 'GOOD': return 'text-blue-600 bg-blue-100';
      case 'FAIR': return 'text-yellow-600 bg-yellow-100';
      case 'POOR': return 'text-red-600 bg-red-100';
    }
  };

  const getRecommendationColor = () => {
    switch (analysis.score.recommendation) {
      case 'STRONG_BUY': return 'text-green-700 bg-green-50 border-green-200';
      case 'BUY': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'HOLD': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'AVOID': return 'text-red-700 bg-red-50 border-red-200';
    }
  };

  const getRecommendationLabel = () => {
    switch (analysis.score.recommendation) {
      case 'STRONG_BUY': return '🟢 Stark empfohlen';
      case 'BUY': return '🔵 Empfohlen';
      case 'HOLD': return '🟡 Abwarten';
      case 'AVOID': return '🔴 Nicht empfohlen';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Deal-Analyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Score Circle */}
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${analysis.score.overall * 3.52} 352`}
                  className={
                    analysis.score.overall >= 75 ? 'text-green-500' :
                    analysis.score.overall >= 50 ? 'text-blue-500' :
                    analysis.score.overall >= 25 ? 'text-yellow-500' :
                    'text-red-500'
                  }
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{analysis.score.overall}</span>
                <span className="text-xs text-muted-foreground">von 100</span>
              </div>
            </div>

            {/* Rating & Recommendation */}
            <div className="flex-1 space-y-3">
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRatingColor()}`}>
                {analysis.score.rating === 'EXCELLENT' && 'Ausgezeichnet'}
                {analysis.score.rating === 'GOOD' && 'Gut'}
                {analysis.score.rating === 'FAIR' && 'Durchschnitt'}
                {analysis.score.rating === 'POOR' && 'Schwach'}
              </div>
              
              <div className={`p-3 rounded-lg border ${getRecommendationColor()}`}>
                <p className="font-semibold">{getRecommendationLabel()}</p>
                <p className="mt-1 text-sm">{analysis.summary}</p>
              </div>
            </div>
          </div>

          {/* Category Scores */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries({
              cashflow: 'Cashflow',
              yield: 'Rendite',
              financing: 'Finanzierung',
              location: 'Standort',
              potential: 'Potenzial',
            }).map(([key, label]) => (
              <div key={key} className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className={`text-lg font-semibold ${
                  analysis.score.categories[key as keyof typeof analysis.score.categories] >= 70 ? 'text-green-600' :
                  analysis.score.categories[key as keyof typeof analysis.score.categories] >= 50 ? 'text-blue-600' :
                  'text-yellow-600'
                }`}>
                  {analysis.score.categories[key as keyof typeof analysis.score.categories]}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risks */}
      {analysis.risks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Risikoanalyse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.risks.map((risk, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    risk.type === 'CRITICAL' ? 'border-red-200 bg-red-50' :
                    risk.type === 'WARNING' ? 'border-yellow-200 bg-yellow-50' :
                    'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {risk.type === 'CRITICAL' && <XCircle className="w-5 h-5 text-red-500 mt-0.5" />}
                    {risk.type === 'WARNING' && <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />}
                    {risk.type === 'INFO' && <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5" />}
                    <div>
                      <p className="font-medium">{risk.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{risk.description}</p>
                      {risk.mitigation && (
                        <p className="text-sm text-green-600 mt-2">
                          💡 {risk.mitigation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="w-5 h-5" />
              Stärken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{strength}</span>
                </li>
              ))}
              {analysis.strengths.length === 0 && (
                <p className="text-muted-foreground text-sm">Keine besonderen Stärken identifiziert.</p>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <TrendingDown className="w-5 h-5" />
              Schwächen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span>{weakness}</span>
                </li>
              ))}
              {analysis.weaknesses.length === 0 && (
                <p className="text-muted-foreground text-sm">Keine besonderen Schwächen identifiziert.</p>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
