"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { answerInvestmentQuestion, generateInsights, type AIInsight } from "@/lib/ai/analysis";
import type { PropertyInput, PropertyOutput } from "@/types";
import { MessageCircle, Send, Bot, Lightbulb, HelpCircle } from "lucide-react";

interface InvestmentAdvisorProps {
  input: PropertyInput;
  output: PropertyOutput;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function InvestmentAdvisor({ input, output }: InvestmentAdvisorProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showInsights, setShowInsights] = useState(true);

  const insights = generateInsights(input, output);

  const suggestedQuestions = [
    "Wie ist der monatliche Cashflow?",
    "Welche Rendite erzielt die Immobilie?",
    "Wie sind die Finanzierungskonditionen?",
    "Wie wirkt sich die Immobilie steuerlich aus?",
  ];

  const handleSendMessage = (question: string = inputValue) => {
    if (!question.trim()) return;

    const userMessage: Message = { role: "user", content: question };
    const answer = answerInvestmentQuestion(question, { input, output });
    const assistantMessage: Message = { role: "assistant", content: answer };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInputValue("");
    setShowInsights(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
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
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              KI-Einblicke
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight: AIInsight, index: number) => (
                <div
                  key={index}
                  className={`rounded-lg border p-3 ${
                    insight.confidence === "HIGH"
                      ? "border-green-200 bg-green-50"
                      : insight.confidence === "MEDIUM"
                        ? "border-blue-200 bg-blue-50"
                        : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Lightbulb className="mt-0.5 h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">{insight.title}</p>
                      <p className="text-muted-foreground mt-1 text-sm">{insight.content}</p>
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
            <MessageCircle className="h-5 w-5" />
            Investment-Berater
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Messages */}
          <div className="mb-4 max-h-96 space-y-4 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="py-8 text-center">
                <Bot className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
                <p className="text-muted-foreground">Stellen Sie mir Fragen zu Ihrer Immobilie!</p>

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
                      <HelpCircle className="mr-1 h-3 w-3" />
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {message.role === "assistant" && <Bot className="mr-2 inline-block h-4 w-4" />}
                    {message.content}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Questions (shown after first message) */}
          {messages.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
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
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
