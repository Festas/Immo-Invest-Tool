"""Finance Engine für Immobilieninvestment-Berechnungen.

Dieses Modul enthält alle finanziellen Berechnungen für:
- Annuitätenberechnung
- Cashflow-Analyse
- ROI-Berechnungen (Eigenkapitalrendite, Gesamtrendite)
- Tilgungsplanberechnung
"""
from dataclasses import dataclass
from typing import Optional

import numpy as np
import pandas as pd


@dataclass
class ImmobilienDaten:
    """Datenklasse für Immobilien-Eingabedaten."""

    kaufpreis: float
    nebenkosten_prozent: float  # Grunderwerbsteuer + Notar + Makler
    eigenkapital: float
    zinssatz_prozent: float
    tilgung_prozent: float
    kaltmiete_monatlich: float
    nicht_umlegbare_kosten_monatlich: float  # Verwaltung, Instandhaltung
    mietausfallwagnis_prozent: float
    laufzeit_jahre: int
    afa_prozent: float = 2.0  # Standard-AfA für Altbauten ab 1925


@dataclass
class FinanzierungErgebnis:
    """Ergebnis der Finanzierungsberechnung."""

    darlehensbetrag: float
    monatliche_rate: float
    jaehrliche_rate: float
    gesamtkosten: float
    zinsen_gesamt: float


@dataclass
class CashflowErgebnis:
    """Ergebnis der Cashflow-Berechnung."""

    brutto_mieteinnahmen: float
    netto_mieteinnahmen: float
    cashflow_vor_steuern: float
    cashflow_nach_steuern: float


@dataclass
class RenditeErgebnis:
    """Ergebnis der Renditeberechnung."""

    brutto_mietrendite: float
    netto_mietrendite: float
    eigenkapitalrendite: float
    objektrendite: float
    cashflow_rendite: float


def berechne_nebenkosten(
    kaufpreis: float,
    grunderwerbsteuer: float = 6.0,
    notar_und_grundbuch: float = 2.0,
    makler: float = 3.57,
) -> dict[str, float]:
    """Berechnet die Kaufnebenkosten.

    Args:
        kaufpreis: Kaufpreis der Immobilie in Euro
        grunderwerbsteuer: Grunderwerbsteuer in Prozent (variiert nach Bundesland)
        notar_und_grundbuch: Notar- und Grundbuchkosten in Prozent
        makler: Maklerprovision in Prozent

    Returns:
        Dictionary mit Nebenkostenaufschlüsselung
    """
    return {
        "grunderwerbsteuer": kaufpreis * grunderwerbsteuer / 100,
        "notar_und_grundbuch": kaufpreis * notar_und_grundbuch / 100,
        "makler": kaufpreis * makler / 100,
        "gesamt": kaufpreis * (grunderwerbsteuer + notar_und_grundbuch + makler) / 100,
    }


def berechne_annuitaet(
    darlehensbetrag: float,
    zinssatz_prozent: float,
    tilgung_prozent: float,
    laufzeit_jahre: int,
) -> FinanzierungErgebnis:
    """Berechnet die Annuität und Finanzierungsdetails.

    Args:
        darlehensbetrag: Höhe des Darlehens in Euro
        zinssatz_prozent: Jahreszinssatz in Prozent
        tilgung_prozent: Anfängliche Tilgung in Prozent
        laufzeit_jahre: Laufzeit des Darlehens in Jahren

    Returns:
        FinanzierungErgebnis mit allen Finanzierungsdetails
    """
    # Berechnung der Annuität
    annuitaet_prozent = zinssatz_prozent + tilgung_prozent
    jaehrliche_rate = darlehensbetrag * annuitaet_prozent / 100
    monatliche_rate = jaehrliche_rate / 12

    # Vereinfachte Gesamtkostenberechnung
    gesamtkosten = jaehrliche_rate * laufzeit_jahre
    zinsen_gesamt = gesamtkosten - darlehensbetrag

    return FinanzierungErgebnis(
        darlehensbetrag=darlehensbetrag,
        monatliche_rate=monatliche_rate,
        jaehrliche_rate=jaehrliche_rate,
        gesamtkosten=max(gesamtkosten, darlehensbetrag),
        zinsen_gesamt=max(zinsen_gesamt, 0),
    )


def berechne_tilgungsplan(
    darlehensbetrag: float,
    zinssatz_prozent: float,
    tilgung_prozent: float,
    laufzeit_jahre: int,
) -> pd.DataFrame:
    """Erstellt einen detaillierten Tilgungsplan.

    Args:
        darlehensbetrag: Höhe des Darlehens in Euro
        zinssatz_prozent: Jahreszinssatz in Prozent
        tilgung_prozent: Anfängliche Tilgung in Prozent
        laufzeit_jahre: Laufzeit des Darlehens in Jahren

    Returns:
        DataFrame mit dem vollständigen Tilgungsplan
    """
    zinssatz = zinssatz_prozent / 100
    annuitaet = darlehensbetrag * (zinssatz_prozent + tilgung_prozent) / 100

    jahre = []
    restschulden = []
    zinsanteile = []
    tilgungsanteile = []
    gezahlte_zinsen_kumuliert = []
    gezahlte_tilgung_kumuliert = []

    restschuld = darlehensbetrag
    zinsen_kumuliert = 0.0
    tilgung_kumuliert = 0.0

    for jahr in range(1, laufzeit_jahre + 1):
        if restschuld <= 0:
            break

        zinsanteil = restschuld * zinssatz
        tilgungsanteil = min(annuitaet - zinsanteil, restschuld)
        restschuld = max(0, restschuld - tilgungsanteil)

        zinsen_kumuliert += zinsanteil
        tilgung_kumuliert += tilgungsanteil

        jahre.append(jahr)
        restschulden.append(restschuld)
        zinsanteile.append(zinsanteil)
        tilgungsanteile.append(tilgungsanteil)
        gezahlte_zinsen_kumuliert.append(zinsen_kumuliert)
        gezahlte_tilgung_kumuliert.append(tilgung_kumuliert)

    return pd.DataFrame({
        "Jahr": jahre,
        "Zinsanteil": zinsanteile,
        "Tilgungsanteil": tilgungsanteile,
        "Restschuld": restschulden,
        "Zinsen kumuliert": gezahlte_zinsen_kumuliert,
        "Tilgung kumuliert": gezahlte_tilgung_kumuliert,
    })


def berechne_cashflow(
    kaltmiete_monatlich: float,
    nicht_umlegbare_kosten_monatlich: float,
    mietausfallwagnis_prozent: float,
    monatliche_rate: float,
    steuervorteil_monatlich: float = 0.0,
) -> CashflowErgebnis:
    """Berechnet den monatlichen Cashflow.

    Args:
        kaltmiete_monatlich: Monatliche Kaltmiete in Euro
        nicht_umlegbare_kosten_monatlich: Nicht umlegbare Kosten (Verwaltung, Instandhaltung)
        mietausfallwagnis_prozent: Mietausfallwagnis in Prozent
        monatliche_rate: Monatliche Darlehensrate
        steuervorteil_monatlich: Monatlicher Steuervorteil in Euro

    Returns:
        CashflowErgebnis mit allen Cashflow-Details
    """
    brutto_mieteinnahmen = kaltmiete_monatlich * 12
    mietausfall = brutto_mieteinnahmen * mietausfallwagnis_prozent / 100
    netto_mieteinnahmen = brutto_mieteinnahmen - mietausfall - (
        nicht_umlegbare_kosten_monatlich * 12
    )

    jaehrliche_rate = monatliche_rate * 12
    cashflow_vor_steuern = netto_mieteinnahmen - jaehrliche_rate
    cashflow_nach_steuern = cashflow_vor_steuern + (steuervorteil_monatlich * 12)

    return CashflowErgebnis(
        brutto_mieteinnahmen=brutto_mieteinnahmen,
        netto_mieteinnahmen=netto_mieteinnahmen,
        cashflow_vor_steuern=cashflow_vor_steuern,
        cashflow_nach_steuern=cashflow_nach_steuern,
    )


def berechne_renditen(
    kaufpreis: float,
    nebenkosten: float,
    eigenkapital: float,
    brutto_mieteinnahmen: float,
    netto_mieteinnahmen: float,
    cashflow_nach_steuern: float,
) -> RenditeErgebnis:
    """Berechnet verschiedene Renditekennzahlen.

    Args:
        kaufpreis: Kaufpreis der Immobilie
        nebenkosten: Kaufnebenkosten
        eigenkapital: Eingesetztes Eigenkapital
        brutto_mieteinnahmen: Jährliche Bruttomieteinnahmen
        netto_mieteinnahmen: Jährliche Nettomieteinnahmen
        cashflow_nach_steuern: Jährlicher Cashflow nach Steuern

    Returns:
        RenditeErgebnis mit allen Renditekennzahlen
    """
    gesamtinvestition = kaufpreis + nebenkosten

    # Brutto-Mietrendite: Jahresmiete / Kaufpreis
    brutto_mietrendite = (brutto_mieteinnahmen / kaufpreis) * 100 if kaufpreis > 0 else 0

    # Netto-Mietrendite: Netto-Jahresmiete / Gesamtinvestition
    netto_mietrendite = (
        (netto_mieteinnahmen / gesamtinvestition) * 100
        if gesamtinvestition > 0
        else 0
    )

    # Eigenkapitalrendite: Cashflow / Eigenkapital
    eigenkapitalrendite = (
        (cashflow_nach_steuern / eigenkapital) * 100 if eigenkapital > 0 else 0
    )

    # Objektrendite: Netto-Mieteinnahmen / Gesamtinvestition
    objektrendite = netto_mietrendite

    # Cashflow-Rendite: Cashflow / Gesamtinvestition
    cashflow_rendite = (
        (cashflow_nach_steuern / gesamtinvestition) * 100
        if gesamtinvestition > 0
        else 0
    )

    return RenditeErgebnis(
        brutto_mietrendite=brutto_mietrendite,
        netto_mietrendite=netto_mietrendite,
        eigenkapitalrendite=eigenkapitalrendite,
        objektrendite=objektrendite,
        cashflow_rendite=cashflow_rendite,
    )


def berechne_vermoegensaufbau(
    eigenkapital: float,
    tilgungsplan: pd.DataFrame,
    cashflow_jaehrlich: float,
    wertsteigerung_prozent: float = 1.0,
    kaufpreis: float = 0.0,
) -> pd.DataFrame:
    """Berechnet den Vermögensaufbau über die Laufzeit.

    Args:
        eigenkapital: Anfängliches Eigenkapital
        tilgungsplan: Tilgungsplan als DataFrame
        cashflow_jaehrlich: Jährlicher Cashflow
        wertsteigerung_prozent: Jährliche Wertsteigerung der Immobilie
        kaufpreis: Kaufpreis für Wertsteigerungsberechnung

    Returns:
        DataFrame mit Vermögensentwicklung
    """
    if tilgungsplan.empty:
        return pd.DataFrame()

    jahre = tilgungsplan["Jahr"].tolist()
    restschulden = tilgungsplan["Restschuld"].tolist()
    darlehensbetrag = tilgungsplan["Restschuld"].iloc[0] + tilgungsplan["Tilgung kumuliert"].iloc[0] - tilgungsplan["Tilgungsanteil"].iloc[0]

    immobilienwerte = []
    nettovermoegen = []
    cashflow_kumuliert = []
    gesamt_vermoegen = []

    immobilienwert = kaufpreis if kaufpreis > 0 else darlehensbetrag + eigenkapital
    cf_kumuliert = 0.0

    for i, jahr in enumerate(jahre):
        # Wertsteigerung
        immobilienwert *= 1 + wertsteigerung_prozent / 100
        immobilienwerte.append(immobilienwert)

        # Nettovermögen = Immobilienwert - Restschuld
        netto = immobilienwert - restschulden[i]
        nettovermoegen.append(netto)

        # Kumulierter Cashflow
        cf_kumuliert += cashflow_jaehrlich
        cashflow_kumuliert.append(cf_kumuliert)

        # Gesamtvermögen = Nettovermögen + kumulierter Cashflow
        gesamt_vermoegen.append(netto + cf_kumuliert)

    return pd.DataFrame({
        "Jahr": jahre,
        "Immobilienwert": immobilienwerte,
        "Restschuld": restschulden,
        "Nettovermögen": nettovermoegen,
        "Cashflow kumuliert": cashflow_kumuliert,
        "Gesamtvermögen": gesamt_vermoegen,
    })
