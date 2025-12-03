'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { answerInvestmentQuestion, generateInsights, type AIInsight } from '@/lib/ai/analysis';
import type { PropertyInput, PropertyOutput } from '@/types';
import { MessageCircle, Send, Bot, Lightbulb, HelpCircle } from 'lucide-react';

interface InvestmentAdvisorProps {
  input: PropertyInput;
  output: PropertyOutput;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function InvestmentAdvisor({ input, output }: InvestmentAdvisorProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showInsights, setShowInsights] = useState(true);

  const insights = generateInsights(input, output);

  const suggestedQuestions = [
    'Wie ist der monatliche Cashflow?',
    'Welche Rendite erzielt die Immobilie?',
    'Wie sind die Finanzierungskonditionen?',
    'Wie wirkt sich die Immobilie steuerlich aus?',
  ];

  const handleSendMessage = (question: string = inputValue) => {
    if (!question.trim()) return;

    const userMessage: Message = { role: 'user', content: question };
    const answer = answerInvestmentQuestion(question, { input, output });
    const assistantMessage: Message = { role: 'assistant', content: answer };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInputValue('');
    setShowInsights(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-4">
      {/* Insights Card */}
      {showInsights && insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              KI-Einblicke
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight: AIInsight, index: number) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    insight.confidence === 'HIGH'
                      ? 'border-green-200 bg-green-50'
                      : insight.confidence === 'MEDIUM'
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 mt-0.5 text-yellow-500" />
                    <div>
                      <p className="font-medium text-sm">{insight.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{insight.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Investment-Berater
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Messages */}
          <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  Stellen Sie mir Fragen zu Ihrer Immobilie!
                </p>
                
                {/* Suggested Questions */}
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendMessage(question)}
                      className="text-xs"
                    >
                      <HelpCircle className="w-3 h-3 mr-1" />
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <Bot className="w-4 h-4 inline-block mr-2" />
                    )}
                    {message.content}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Questions (shown after first message) */}
          {messages.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {suggestedQuestions.slice(0, 3).map((question, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSendMessage(question)}
                  className="text-xs"
                >
                  {question}
                </Button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Stellen Sie eine Frage..."
              className="flex-1"
            />
            <Button onClick={() => handleSendMessage()} disabled={!inputValue.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
