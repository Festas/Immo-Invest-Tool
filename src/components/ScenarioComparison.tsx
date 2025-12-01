"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useImmoCalcStore } from "@/store";
import { calculatePropertyKPIs } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2, GitCompare } from "lucide-react";

export function ScenarioComparison() {
  const { currentInput, scenarios, addScenario, updateScenario, removeScenario, clearScenarios } =
    useImmoCalcStore();
  const [newScenarioName, setNewScenarioName] = useState("");

  const handleAddScenario = () => {
    if (newScenarioName.trim()) {
      addScenario(newScenarioName.trim());
      setNewScenarioName("");
    } else {
      addScenario(`Szenario ${scenarios.length + 1}`);
    }
  };

  const currentOutput = calculatePropertyKPIs(currentInput);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-blue-600" />
              <span>Szenario-Vergleich</span>
            </div>
            {scenarios.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearScenarios}>
                Alle löschen
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Szenario Name..."
              value={newScenarioName}
              onChange={(e) => setNewScenarioName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddScenario} disabled={scenarios.length >= 3}>
              <Plus className="h-4 w-4 mr-1" />
              Hinzufügen
            </Button>
          </div>

          {scenarios.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Füge bis zu 3 Szenarien hinzu, um verschiedene Finanzierungsoptionen zu vergleichen.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-2 font-medium">Kennzahl</th>
                    <th className="text-right py-3 px-2 font-medium text-blue-600">Aktuell</th>
                    {scenarios.map((scenario) => (
                      <th key={scenario.id} className="text-right py-3 px-2 font-medium">
                        <div className="flex items-center justify-end gap-1">
                          {scenario.name}
                          <button
                            onClick={() => removeScenario(scenario.id)}
                            className="text-red-500 hover:text-red-700 ml-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Eigenkapital Row */}
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-2 text-gray-600 dark:text-gray-400">Eigenkapital</td>
                    <td className="py-2 px-2 text-right font-medium text-blue-600">
                      {formatCurrency(currentInput.equity)}
                    </td>
                    {scenarios.map((scenario) => (
                      <td key={scenario.id} className="py-2 px-2 text-right">
                        <input
                          type="number"
                          value={scenario.input.equity}
                          onChange={(e) =>
                            updateScenario(scenario.id, {
                              equity: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-24 text-right p-1 border rounded text-sm"
                          step={1000}
                        />
                      </td>
                    ))}
                  </tr>

                  {/* Zinssatz Row */}
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-2 text-gray-600 dark:text-gray-400">Zinssatz</td>
                    <td className="py-2 px-2 text-right font-medium text-blue-600">
                      {currentInput.interestRate.toFixed(2)}%
                    </td>
                    {scenarios.map((scenario) => (
                      <td key={scenario.id} className="py-2 px-2 text-right">
                        <input
                          type="number"
                          value={scenario.input.interestRate}
                          onChange={(e) =>
                            updateScenario(scenario.id, {
                              interestRate: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-20 text-right p-1 border rounded text-sm"
                          step={0.1}
                          min={0}
                          max={15}
                        />
                      </td>
                    ))}
                  </tr>

                  {/* Tilgung Row */}
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-2 text-gray-600 dark:text-gray-400">Tilgung</td>
                    <td className="py-2 px-2 text-right font-medium text-blue-600">
                      {currentInput.repaymentRate.toFixed(2)}%
                    </td>
                    {scenarios.map((scenario) => (
                      <td key={scenario.id} className="py-2 px-2 text-right">
                        <input
                          type="number"
                          value={scenario.input.repaymentRate}
                          onChange={(e) =>
                            updateScenario(scenario.id, {
                              repaymentRate: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-20 text-right p-1 border rounded text-sm"
                          step={0.1}
                          min={0.5}
                          max={10}
                        />
                      </td>
                    ))}
                  </tr>

                  {/* Results Section */}
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <td colSpan={scenarios.length + 2} className="py-2 px-2 font-medium">
                      Ergebnisse
                    </td>
                  </tr>

                  {/* Monthly Payment */}
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-2 text-gray-600 dark:text-gray-400">Rate/Monat</td>
                    <td className="py-2 px-2 text-right font-medium text-blue-600">
                      {formatCurrency(currentOutput.financing.monthlyPayment)}
                    </td>
                    {scenarios.map((scenario) => {
                      const output = scenario.output || calculatePropertyKPIs(scenario.input);
                      return (
                        <td key={scenario.id} className="py-2 px-2 text-right">
                          {formatCurrency(output.financing.monthlyPayment)}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Monthly Cashflow */}
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-2 text-gray-600 dark:text-gray-400">Cashflow/Monat</td>
                    <td
                      className={`py-2 px-2 text-right font-medium ${
                        currentOutput.cashflow.monthlyCashflowAfterTax >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(currentOutput.cashflow.monthlyCashflowAfterTax)}
                    </td>
                    {scenarios.map((scenario) => {
                      const output = scenario.output || calculatePropertyKPIs(scenario.input);
                      return (
                        <td
                          key={scenario.id}
                          className={`py-2 px-2 text-right font-medium ${
                            output.cashflow.monthlyCashflowAfterTax >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(output.cashflow.monthlyCashflowAfterTax)}
                        </td>
                      );
                    })}
                  </tr>

                  {/* ROI */}
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-2 text-gray-600 dark:text-gray-400">EK-Rendite</td>
                    <td className="py-2 px-2 text-right font-medium text-blue-600">
                      {currentOutput.yields.returnOnEquity.toFixed(2)}%
                    </td>
                    {scenarios.map((scenario) => {
                      const output = scenario.output || calculatePropertyKPIs(scenario.input);
                      return (
                        <td key={scenario.id} className="py-2 px-2 text-right font-medium">
                          {output.yields.returnOnEquity.toFixed(2)}%
                        </td>
                      );
                    })}
                  </tr>

                  {/* Total Loan */}
                  <tr>
                    <td className="py-2 px-2 text-gray-600 dark:text-gray-400">Darlehen</td>
                    <td className="py-2 px-2 text-right font-medium text-blue-600">
                      {formatCurrency(currentOutput.financing.loanAmount)}
                    </td>
                    {scenarios.map((scenario) => {
                      const output = scenario.output || calculatePropertyKPIs(scenario.input);
                      return (
                        <td key={scenario.id} className="py-2 px-2 text-right">
                          {formatCurrency(output.financing.loanAmount)}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
