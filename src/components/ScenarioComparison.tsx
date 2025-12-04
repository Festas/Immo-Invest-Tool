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
    <div className="space-y-6">
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
          <div className="mb-4 flex gap-2">
            <Input
              placeholder="Szenario Name..."
              value={newScenarioName}
              onChange={(e) => setNewScenarioName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddScenario} disabled={scenarios.length >= 3}>
              <Plus className="mr-1 h-4 w-4" />
              Hinzufügen
            </Button>
          </div>

          {scenarios.length === 0 ? (
            <p className="py-8 text-center text-slate-500 dark:text-slate-400">
              Füge bis zu 3 Szenarien hinzu, um verschiedene Finanzierungsoptionen zu vergleichen.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-2 py-3 text-left font-medium text-slate-900 dark:text-slate-100">
                      Kennzahl
                    </th>
                    <th className="px-2 py-3 text-right font-medium text-blue-600 dark:text-blue-400">
                      Aktuell
                    </th>
                    {scenarios.map((scenario) => (
                      <th
                        key={scenario.id}
                        className="px-2 py-3 text-right font-medium text-slate-900 dark:text-slate-100"
                      >
                        <div className="flex items-center justify-end gap-1">
                          {scenario.name}
                          <button
                            onClick={() => removeScenario(scenario.id)}
                            className="ml-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-2 py-2 text-slate-600 dark:text-slate-400">Eigenkapital</td>
                    <td className="px-2 py-2 text-right font-medium text-blue-600 dark:text-blue-400">
                      {formatCurrency(currentInput.equity)}
                    </td>
                    {scenarios.map((scenario) => (
                      <td key={scenario.id} className="px-2 py-2 text-right">
                        <input
                          type="number"
                          value={scenario.input.equity}
                          onChange={(e) =>
                            updateScenario(scenario.id, {
                              equity: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-24 rounded border border-slate-200 bg-white p-1 text-right text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                          step={1000}
                        />
                      </td>
                    ))}
                  </tr>

                  {/* Zinssatz Row */}
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-2 py-2 text-slate-600 dark:text-slate-400">Zinssatz</td>
                    <td className="px-2 py-2 text-right font-medium text-blue-600 dark:text-blue-400">
                      {currentInput.interestRate.toFixed(2)}%
                    </td>
                    {scenarios.map((scenario) => (
                      <td key={scenario.id} className="px-2 py-2 text-right">
                        <input
                          type="number"
                          value={scenario.input.interestRate}
                          onChange={(e) =>
                            updateScenario(scenario.id, {
                              interestRate: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-20 rounded border border-slate-200 bg-white p-1 text-right text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                          step={0.1}
                          min={0}
                          max={15}
                        />
                      </td>
                    ))}
                  </tr>

                  {/* Tilgung Row */}
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-2 py-2 text-slate-600 dark:text-slate-400">Tilgung</td>
                    <td className="px-2 py-2 text-right font-medium text-blue-600 dark:text-blue-400">
                      {currentInput.repaymentRate.toFixed(2)}%
                    </td>
                    {scenarios.map((scenario) => (
                      <td key={scenario.id} className="px-2 py-2 text-right">
                        <input
                          type="number"
                          value={scenario.input.repaymentRate}
                          onChange={(e) =>
                            updateScenario(scenario.id, {
                              repaymentRate: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-20 rounded border border-slate-200 bg-white p-1 text-right text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                          step={0.1}
                          min={0.5}
                          max={10}
                        />
                      </td>
                    ))}
                  </tr>

                  {/* Results Section */}
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <td
                      colSpan={scenarios.length + 2}
                      className="px-2 py-2 font-medium text-slate-900 dark:text-slate-100"
                    >
                      Ergebnisse
                    </td>
                  </tr>

                  {/* Monthly Payment */}
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-2 py-2 text-slate-600 dark:text-slate-400">Rate/Monat</td>
                    <td className="px-2 py-2 text-right font-medium text-blue-600 dark:text-blue-400">
                      {formatCurrency(currentOutput.financing.monthlyPayment)}
                    </td>
                    {scenarios.map((scenario) => {
                      const output = scenario.output || calculatePropertyKPIs(scenario.input);
                      return (
                        <td
                          key={scenario.id}
                          className="px-2 py-2 text-right text-slate-900 dark:text-slate-100"
                        >
                          {formatCurrency(output.financing.monthlyPayment)}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Monthly Cashflow */}
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-2 py-2 text-slate-600 dark:text-slate-400">Cashflow/Monat</td>
                    <td
                      className={`px-2 py-2 text-right font-medium ${
                        currentOutput.cashflow.monthlyCashflowAfterTax >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatCurrency(currentOutput.cashflow.monthlyCashflowAfterTax)}
                    </td>
                    {scenarios.map((scenario) => {
                      const output = scenario.output || calculatePropertyKPIs(scenario.input);
                      return (
                        <td
                          key={scenario.id}
                          className={`px-2 py-2 text-right font-medium ${
                            output.cashflow.monthlyCashflowAfterTax >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {formatCurrency(output.cashflow.monthlyCashflowAfterTax)}
                        </td>
                      );
                    })}
                  </tr>

                  {/* ROI */}
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-2 py-2 text-slate-600 dark:text-slate-400">EK-Rendite</td>
                    <td className="px-2 py-2 text-right font-medium text-blue-600 dark:text-blue-400">
                      {currentOutput.yields.returnOnEquity.toFixed(2)}%
                    </td>
                    {scenarios.map((scenario) => {
                      const output = scenario.output || calculatePropertyKPIs(scenario.input);
                      return (
                        <td
                          key={scenario.id}
                          className="px-2 py-2 text-right font-medium text-slate-900 dark:text-slate-100"
                        >
                          {output.yields.returnOnEquity.toFixed(2)}%
                        </td>
                      );
                    })}
                  </tr>

                  {/* Total Loan */}
                  <tr>
                    <td className="px-2 py-2 text-slate-600 dark:text-slate-400">Darlehen</td>
                    <td className="px-2 py-2 text-right font-medium text-blue-600 dark:text-blue-400">
                      {formatCurrency(currentOutput.financing.loanAmount)}
                    </td>
                    {scenarios.map((scenario) => {
                      const output = scenario.output || calculatePropertyKPIs(scenario.input);
                      return (
                        <td
                          key={scenario.id}
                          className="px-2 py-2 text-right text-slate-900 dark:text-slate-100"
                        >
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
