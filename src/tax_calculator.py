"""Steuerrechner für Immobilieninvestments nach deutschem Steuerrecht.

Dieses Modul berechnet:
- Abschreibung (AfA) nach § 7 EStG
- Steuerliche Absetzbarkeit von Zinsen
- Werbungskosten
- Zu versteuerndes Einkommen aus Vermietung und Verpachtung
"""
from dataclasses import dataclass
from enum import Enum
from typing import Optional


class AfATyp(Enum):
    """AfA-Typen nach deutschem Steuerrecht."""

    ALTBAU_VOR_1925 = 2.5  # 2,5% AfA für Altbauten vor 1925
    ALTBAU_AB_1925 = 2.0  # 2% AfA für Gebäude ab 1925
    NEUBAU_AB_2023 = 3.0  # 3% AfA für Neubauten ab 2023 (§ 7 Abs. 5a EStG)
    DENKMALSCHUTZ = 9.0  # Erhöhte AfA für denkmalgeschützte Gebäude


class Bundesland(Enum):
    """Bundesländer mit Grunderwerbsteuersätzen (Stand 2024)."""

    BADEN_WUERTTEMBERG = ("Baden-Württemberg", 5.0)
    BAYERN = ("Bayern", 3.5)
    BERLIN = ("Berlin", 6.0)
    BRANDENBURG = ("Brandenburg", 6.5)
    BREMEN = ("Bremen", 5.0)
    HAMBURG = ("Hamburg", 5.5)
    HESSEN = ("Hessen", 6.0)
    MECKLENBURG_VORPOMMERN = ("Mecklenburg-Vorpommern", 6.0)
    NIEDERSACHSEN = ("Niedersachsen", 5.0)
    NORDRHEIN_WESTFALEN = ("Nordrhein-Westfalen", 6.5)
    RHEINLAND_PFALZ = ("Rheinland-Pfalz", 5.0)
    SAARLAND = ("Saarland", 6.5)
    SACHSEN = ("Sachsen", 5.5)
    SACHSEN_ANHALT = ("Sachsen-Anhalt", 5.0)
    SCHLESWIG_HOLSTEIN = ("Schleswig-Holstein", 6.5)
    THUERINGEN = ("Thüringen", 5.0)

    def __init__(self, display_name: str, steuersatz: float) -> None:
        self.display_name = display_name
        self.steuersatz = steuersatz


@dataclass
class SteuerlicheAbsetzbarkeit:
    """Ergebnis der steuerlichen Absetzbarkeitsberechnung."""

    afa_betrag: float
    absetzbare_zinsen: float
    werbungskosten: float
    einkuenfte_aus_vv: float  # Einkünfte aus Vermietung und Verpachtung
    steuervorteil: float
    steuervorteil_monatlich: float


@dataclass
class Steuerdaten:
    """Eingabedaten für die Steuerberechnung."""

    kaufpreis: float
    gebaeude_anteil_prozent: float  # Typisch 70-80% des Kaufpreises
    afa_typ: AfATyp
    zinsen_jaehrlich: float
    mieteinnahmen_jaehrlich: float
    nicht_umlegbare_kosten_jaehrlich: float
    grenzsteuersatz_prozent: float  # Persönlicher Grenzsteuersatz
    sonstige_werbungskosten: float = 0.0  # Z.B. Fahrtkosten, Kontoführung


def get_grunderwerbsteuer_satz(bundesland: Bundesland) -> float:
    """Gibt den Grunderwerbsteuersatz für ein Bundesland zurück.

    Args:
        bundesland: Das Bundesland als Enum

    Returns:
        Grunderwerbsteuersatz in Prozent
    """
    return bundesland.steuersatz


def berechne_afa(
    kaufpreis: float,
    gebaeude_anteil_prozent: float,
    afa_typ: AfATyp,
) -> float:
    """Berechnet die jährliche Abschreibung (AfA).

    Nach deutschem Steuerrecht kann nur der Gebäudeanteil abgeschrieben werden,
    nicht der Grundstücksanteil.

    Args:
        kaufpreis: Kaufpreis der Immobilie
        gebaeude_anteil_prozent: Anteil des Gebäudes am Kaufpreis (typisch 70-80%)
        afa_typ: Art der Abschreibung

    Returns:
        Jährlicher AfA-Betrag in Euro
    """
    gebaeudewert = kaufpreis * gebaeude_anteil_prozent / 100
    return gebaeudewert * afa_typ.value / 100


def berechne_steuerliche_absetzbarkeit(daten: Steuerdaten) -> SteuerlicheAbsetzbarkeit:
    """Berechnet die steuerlichen Auswirkungen einer Immobilieninvestition.

    Args:
        daten: Steuerdaten für die Berechnung

    Returns:
        SteuerlicheAbsetzbarkeit mit allen steuerrelevanten Beträgen
    """
    # AfA-Berechnung
    afa_betrag = berechne_afa(
        daten.kaufpreis,
        daten.gebaeude_anteil_prozent,
        daten.afa_typ,
    )

    # Zinsen sind vollständig absetzbar
    absetzbare_zinsen = daten.zinsen_jaehrlich

    # Werbungskosten = AfA + Zinsen + nicht umlegbare Kosten + sonstige
    werbungskosten = (
        afa_betrag
        + absetzbare_zinsen
        + daten.nicht_umlegbare_kosten_jaehrlich
        + daten.sonstige_werbungskosten
    )

    # Einkünfte aus Vermietung und Verpachtung
    einkuenfte_aus_vv = daten.mieteinnahmen_jaehrlich - werbungskosten

    # Steuervorteil/-nachteil
    # Negativer Wert = Verlust = Steuervorteil
    # Positiver Wert = Gewinn = Steuerlast
    steuerliche_auswirkung = einkuenfte_aus_vv * daten.grenzsteuersatz_prozent / 100

    # Bei negativen Einkünften ist der Steuervorteil positiv
    steuervorteil = -steuerliche_auswirkung
    steuervorteil_monatlich = steuervorteil / 12

    return SteuerlicheAbsetzbarkeit(
        afa_betrag=afa_betrag,
        absetzbare_zinsen=absetzbare_zinsen,
        werbungskosten=werbungskosten,
        einkuenfte_aus_vv=einkuenfte_aus_vv,
        steuervorteil=steuervorteil,
        steuervorteil_monatlich=steuervorteil_monatlich,
    )


def berechne_nebenkosten_nach_bundesland(
    kaufpreis: float,
    bundesland: Bundesland,
    mit_makler: bool = True,
    makler_prozent: float = 3.57,
    notar_und_grundbuch_prozent: float = 2.0,
) -> dict[str, float]:
    """Berechnet die Kaufnebenkosten basierend auf dem Bundesland.

    Args:
        kaufpreis: Kaufpreis der Immobilie
        bundesland: Bundesland für Grunderwerbsteuerberechnung
        mit_makler: Ob Maklerprovision anfällt
        makler_prozent: Maklerprovision in Prozent
        notar_und_grundbuch_prozent: Notar- und Grundbuchkosten in Prozent

    Returns:
        Dictionary mit Nebenkostenaufschlüsselung
    """
    grunderwerbsteuer_satz = bundesland.steuersatz
    makler = makler_prozent if mit_makler else 0.0

    grunderwerbsteuer = kaufpreis * grunderwerbsteuer_satz / 100
    notar_und_grundbuch = kaufpreis * notar_und_grundbuch_prozent / 100
    maklerkosten = kaufpreis * makler / 100

    return {
        "grunderwerbsteuer": grunderwerbsteuer,
        "grunderwerbsteuer_satz": grunderwerbsteuer_satz,
        "notar_und_grundbuch": notar_und_grundbuch,
        "makler": maklerkosten,
        "gesamt": grunderwerbsteuer + notar_und_grundbuch + maklerkosten,
        "gesamt_prozent": grunderwerbsteuer_satz + notar_und_grundbuch_prozent + makler,
    }


def berechne_effektive_rendite_nach_steuern(
    brutto_rendite_prozent: float,
    grenzsteuersatz_prozent: float,
) -> float:
    """Berechnet die effektive Rendite nach Steuern.

    Args:
        brutto_rendite_prozent: Bruttorendite in Prozent
        grenzsteuersatz_prozent: Persönlicher Grenzsteuersatz in Prozent

    Returns:
        Effektive Rendite nach Steuern in Prozent
    """
    return brutto_rendite_prozent * (1 - grenzsteuersatz_prozent / 100)
