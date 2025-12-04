"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useImmoCalcStore } from "@/store";
import { formatCurrency } from "@/lib/utils";
import {
  Building2,
  Wallet,
  TrendingUp,
  PiggyBank,
  Plus,
  Trash2,
  LayoutDashboard,
} from "lucide-react";

export function PortfolioDashboard() {
  const {
    properties,
    getPortfolioSummary,
    saveProperty,
    loadProperty,
    deleteProperty,
    selectedPropertyId,
  } = useImmoCalcStore();

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [propertyName, setPropertyName] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");

  const summary = getPortfolioSummary();

  const handleSave = () => {
    if (propertyName.trim()) {
      saveProperty(propertyName.trim(), propertyAddress.trim() || undefined);
      setPropertyName("");
      setPropertyAddress("");
      setShowSaveModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <Card className="bg-slate-700 dark:bg-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-white">
            <LayoutDashboard className="h-5 w-5" />
            Portfolio-Übersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-white md:grid-cols-4">
            <div>
              <p className="text-sm opacity-80">Immobilien</p>
              <p className="text-2xl font-bold">{summary.totalProperties}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Gesamtinvestition</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalInvestment)}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Monatl. Cashflow</p>
              <p
                className={`text-2xl font-bold ${
                  summary.totalMonthlyCashflow >= 0 ? "text-green-300" : "text-red-300"
                }`}
              >
                {formatCurrency(summary.totalMonthlyCashflow)}
              </p>
            </div>
            <div>
              <p className="text-sm opacity-80">Ø Rendite</p>
              <p className="text-2xl font-bold">{summary.averageYield.toFixed(2)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Meine Immobilien</h3>
        <Button onClick={() => setShowSaveModal(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Aktuelle speichern
        </Button>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <Input
                label="Name der Immobilie"
                placeholder="z.B. Wohnung Schwabing"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
              />
              <Input
                label="Adresse (optional)"
                placeholder="z.B. Musterstraße 1, 80333 München"
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSaveModal(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleSave} disabled={!propertyName.trim()}>
                  Speichern
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property List */}
      {properties.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-slate-400 dark:text-slate-500" />
            <p className="text-slate-500 dark:text-slate-400">Noch keine Immobilien gespeichert.</p>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
              Speichere deine aktuelle Berechnung, um sie später wieder aufzurufen.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {properties.map((property) => {
            const isSelected = selectedPropertyId === property.id;
            return (
              <Card
                key={property.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? "bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-950/50" : ""
                }`}
                onClick={() => loadProperty(property.id)}
              >
                <CardContent className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">
                          {property.name}
                        </h4>
                        {isSelected && (
                          <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            Aktiv
                          </span>
                        )}
                      </div>
                      {property.address && (
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {property.address}
                        </p>
                      )}
                      <div className="mt-2 flex gap-4 text-sm">
                        <span className="text-slate-600 dark:text-slate-400">
                          <Wallet className="mr-1 inline h-3 w-3" />
                          {formatCurrency(property.output?.investmentVolume.totalInvestment || 0)}
                        </span>
                        <span
                          className={
                            (property.output?.cashflow.monthlyCashflowAfterTax || 0) >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }
                        >
                          <TrendingUp className="mr-1 inline h-3 w-3" />
                          {formatCurrency(property.output?.cashflow.monthlyCashflowAfterTax || 0)}
                          /Monat
                        </span>
                        <span className="text-purple-600 dark:text-purple-400">
                          <PiggyBank className="mr-1 inline h-3 w-3" />
                          {(property.output?.yields.returnOnEquity || 0).toFixed(2)}% ROI
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProperty(property.id);
                        }}
                        className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Portfolio Statistics */}
      {properties.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Portfolio-Statistik</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 dark:text-slate-400">Gesamt-Eigenkapital</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(summary.totalEquity)}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Gesamt-Schulden</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(summary.totalDebt)}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Jährlicher Cashflow</p>
                <p
                  className={`text-lg font-bold ${
                    summary.totalAnnualCashflow >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(summary.totalAnnualCashflow)}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Eigenkapitalquote</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {summary.totalInvestment > 0
                    ? ((summary.totalEquity / summary.totalInvestment) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
