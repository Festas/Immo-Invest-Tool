"""Analytics-Modul für interaktive Visualisierungen.

Dieses Modul erstellt Plotly-Charts für:
- Vermögensaufbau vs. Restschuld
- Tilgungsplan-Visualisierung
- Cashflow-Entwicklung
- Rendite-Vergleiche
"""
from typing import Optional

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots


# Farbpalette für konsistentes Design
COLORS = {
    "primary": "#1f77b4",
    "secondary": "#ff7f0e",
    "success": "#2ca02c",
    "danger": "#d62728",
    "warning": "#bcbd22",
    "info": "#17becf",
    "dark": "#2c3e50",
    "light": "#ecf0f1",
}


def create_vermoegen_vs_restschuld_chart(
    vermoegen_df: pd.DataFrame,
) -> go.Figure:
    """Erstellt ein interaktives Chart für Vermögensaufbau vs. Restschuld.

    Args:
        vermoegen_df: DataFrame mit Vermögensentwicklung

    Returns:
        Plotly Figure Objekt
    """
    if vermoegen_df.empty:
        return go.Figure()

    fig = make_subplots(specs=[[{"secondary_y": True}]])

    # Immobilienwert
    fig.add_trace(
        go.Scatter(
            x=vermoegen_df["Jahr"],
            y=vermoegen_df["Immobilienwert"],
            name="Immobilienwert",
            line={"color": COLORS["success"], "width": 2},
            fill="tozeroy",
            fillcolor="rgba(44, 160, 44, 0.1)",
            hovertemplate="Jahr %{x}<br>Immobilienwert: €%{y:,.0f}<extra></extra>",
        ),
        secondary_y=False,
    )

    # Restschuld
    fig.add_trace(
        go.Scatter(
            x=vermoegen_df["Jahr"],
            y=vermoegen_df["Restschuld"],
            name="Restschuld",
            line={"color": COLORS["danger"], "width": 2, "dash": "dash"},
            hovertemplate="Jahr %{x}<br>Restschuld: €%{y:,.0f}<extra></extra>",
        ),
        secondary_y=False,
    )

    # Nettovermögen
    fig.add_trace(
        go.Scatter(
            x=vermoegen_df["Jahr"],
            y=vermoegen_df["Nettovermögen"],
            name="Nettovermögen",
            line={"color": COLORS["primary"], "width": 3},
            hovertemplate="Jahr %{x}<br>Nettovermögen: €%{y:,.0f}<extra></extra>",
        ),
        secondary_y=False,
    )

    # Gesamtvermögen
    fig.add_trace(
        go.Scatter(
            x=vermoegen_df["Jahr"],
            y=vermoegen_df["Gesamtvermögen"],
            name="Gesamtvermögen (inkl. Cashflow)",
            line={"color": COLORS["secondary"], "width": 2, "dash": "dot"},
            hovertemplate="Jahr %{x}<br>Gesamtvermögen: €%{y:,.0f}<extra></extra>",
        ),
        secondary_y=False,
    )

    fig.update_layout(
        title={
            "text": "📈 Vermögensaufbau vs. Restschuld",
            "font": {"size": 20},
            "x": 0.5,
            "xanchor": "center",
        },
        xaxis_title="Jahr",
        yaxis_title="Betrag (€)",
        hovermode="x unified",
        legend={
            "orientation": "h",
            "yanchor": "bottom",
            "y": 1.02,
            "xanchor": "center",
            "x": 0.5,
        },
        template="plotly_white",
        height=500,
    )

    fig.update_yaxes(tickformat="€,.0f")

    return fig


def create_tilgungsplan_chart(tilgungsplan_df: pd.DataFrame) -> go.Figure:
    """Erstellt ein Chart für den Tilgungsplan.

    Args:
        tilgungsplan_df: DataFrame mit Tilgungsplan

    Returns:
        Plotly Figure Objekt
    """
    if tilgungsplan_df.empty:
        return go.Figure()

    fig = go.Figure()

    # Gestapelte Balken für Zins- und Tilgungsanteil
    fig.add_trace(
        go.Bar(
            x=tilgungsplan_df["Jahr"],
            y=tilgungsplan_df["Zinsanteil"],
            name="Zinsanteil",
            marker_color=COLORS["danger"],
            hovertemplate="Jahr %{x}<br>Zinsen: €%{y:,.0f}<extra></extra>",
        )
    )

    fig.add_trace(
        go.Bar(
            x=tilgungsplan_df["Jahr"],
            y=tilgungsplan_df["Tilgungsanteil"],
            name="Tilgungsanteil",
            marker_color=COLORS["success"],
            hovertemplate="Jahr %{x}<br>Tilgung: €%{y:,.0f}<extra></extra>",
        )
    )

    # Restschuld als Linie
    fig.add_trace(
        go.Scatter(
            x=tilgungsplan_df["Jahr"],
            y=tilgungsplan_df["Restschuld"],
            name="Restschuld",
            line={"color": COLORS["primary"], "width": 3},
            yaxis="y2",
            hovertemplate="Jahr %{x}<br>Restschuld: €%{y:,.0f}<extra></extra>",
        )
    )

    fig.update_layout(
        title={
            "text": "📊 Tilgungsplan - Zins- und Tilgungsanteile",
            "font": {"size": 20},
            "x": 0.5,
            "xanchor": "center",
        },
        xaxis_title="Jahr",
        yaxis_title="Jährliche Rate (€)",
        yaxis2={
            "title": "Restschuld (€)",
            "overlaying": "y",
            "side": "right",
            "tickformat": "€,.0f",
        },
        barmode="stack",
        hovermode="x unified",
        legend={
            "orientation": "h",
            "yanchor": "bottom",
            "y": 1.02,
            "xanchor": "center",
            "x": 0.5,
        },
        template="plotly_white",
        height=500,
    )

    return fig


def create_cashflow_gauge(
    cashflow_monatlich: float,
    min_value: float = -1000,
    max_value: float = 1000,
) -> go.Figure:
    """Erstellt ein Gauge-Chart für den monatlichen Cashflow.

    Args:
        cashflow_monatlich: Monatlicher Cashflow in Euro
        min_value: Minimaler Wert für die Skala
        max_value: Maximaler Wert für die Skala

    Returns:
        Plotly Figure Objekt
    """
    # Farbe basierend auf Cashflow-Wert
    if cashflow_monatlich >= 0:
        color = COLORS["success"]
    else:
        color = COLORS["danger"]

    fig = go.Figure(
        go.Indicator(
            mode="gauge+number+delta",
            value=cashflow_monatlich,
            number={"prefix": "€", "font": {"size": 40}},
            delta={"reference": 0, "position": "bottom"},
            gauge={
                "axis": {
                    "range": [min_value, max_value],
                    "tickformat": "€,.0f",
                },
                "bar": {"color": color},
                "bgcolor": "white",
                "borderwidth": 2,
                "bordercolor": "gray",
                "steps": [
                    {"range": [min_value, 0], "color": "rgba(214, 39, 40, 0.3)"},
                    {"range": [0, max_value], "color": "rgba(44, 160, 44, 0.3)"},
                ],
                "threshold": {
                    "line": {"color": "black", "width": 4},
                    "thickness": 0.75,
                    "value": 0,
                },
            },
            title={"text": "Monatlicher Cashflow", "font": {"size": 20}},
        )
    )

    fig.update_layout(
        height=300,
        margin={"t": 80, "b": 20, "l": 30, "r": 30},
    )

    return fig


def create_rendite_vergleich_chart(
    brutto_rendite: float,
    netto_rendite: float,
    eigenkapitalrendite: float,
    cashflow_rendite: float,
) -> go.Figure:
    """Erstellt ein Balkendiagramm für den Rendite-Vergleich.

    Args:
        brutto_rendite: Brutto-Mietrendite in Prozent
        netto_rendite: Netto-Mietrendite in Prozent
        eigenkapitalrendite: Eigenkapitalrendite in Prozent
        cashflow_rendite: Cashflow-Rendite in Prozent

    Returns:
        Plotly Figure Objekt
    """
    renditen = [
        "Brutto-Mietrendite",
        "Netto-Mietrendite",
        "Eigenkapitalrendite",
        "Cashflow-Rendite",
    ]
    werte = [brutto_rendite, netto_rendite, eigenkapitalrendite, cashflow_rendite]
    farben = [COLORS["info"], COLORS["primary"], COLORS["success"], COLORS["secondary"]]

    fig = go.Figure()

    fig.add_trace(
        go.Bar(
            x=renditen,
            y=werte,
            marker_color=farben,
            text=[f"{w:.2f}%" for w in werte],
            textposition="outside",
            hovertemplate="%{x}: %{y:.2f}%<extra></extra>",
        )
    )

    fig.update_layout(
        title={
            "text": "📊 Rendite-Vergleich",
            "font": {"size": 20},
            "x": 0.5,
            "xanchor": "center",
        },
        yaxis_title="Rendite (%)",
        template="plotly_white",
        height=400,
        showlegend=False,
    )

    # Horizontale Linie bei 0%
    fig.add_hline(y=0, line_dash="dash", line_color="gray", line_width=1)

    return fig


def create_zins_tilgung_pie(zinsanteil: float, tilgungsanteil: float) -> go.Figure:
    """Erstellt ein Tortendiagramm für Zins- vs. Tilgungsanteil.

    Args:
        zinsanteil: Jährlicher Zinsanteil in Euro
        tilgungsanteil: Jährlicher Tilgungsanteil in Euro

    Returns:
        Plotly Figure Objekt
    """
    fig = go.Figure(
        go.Pie(
            labels=["Zinsen", "Tilgung"],
            values=[zinsanteil, tilgungsanteil],
            hole=0.4,
            marker_colors=[COLORS["danger"], COLORS["success"]],
            textinfo="label+percent",
            hovertemplate="%{label}: €%{value:,.0f} (%{percent})<extra></extra>",
        )
    )

    fig.update_layout(
        title={
            "text": "🏦 Ratenaufteilung (1. Jahr)",
            "font": {"size": 18},
            "x": 0.5,
            "xanchor": "center",
        },
        height=350,
        annotations=[{
            "text": f"€{zinsanteil + tilgungsanteil:,.0f}",
            "x": 0.5,
            "y": 0.5,
            "font_size": 16,
            "showarrow": False,
        }],
    )

    return fig


def create_steuer_uebersicht(
    afa: float,
    zinsen: float,
    sonstige_werbungskosten: float,
    mieteinnahmen: float,
) -> go.Figure:
    """Erstellt eine Übersicht der steuerlichen Situation.

    Args:
        afa: Jährliche AfA in Euro
        zinsen: Jährliche Zinsen in Euro
        sonstige_werbungskosten: Sonstige Werbungskosten in Euro
        mieteinnahmen: Jährliche Mieteinnahmen in Euro

    Returns:
        Plotly Figure Objekt
    """
    werbungskosten_gesamt = afa + zinsen + sonstige_werbungskosten
    einkuenfte = mieteinnahmen - werbungskosten_gesamt

    fig = go.Figure()

    # Wasserfall-Diagramm
    fig.add_trace(
        go.Waterfall(
            name="Steuerberechnung",
            orientation="v",
            x=[
                "Mieteinnahmen",
                "AfA",
                "Zinsen",
                "Sonstige WK",
                "Einkünfte aus V&V",
            ],
            y=[
                mieteinnahmen,
                -afa,
                -zinsen,
                -sonstige_werbungskosten,
                0,  # Total
            ],
            measure=["absolute", "relative", "relative", "relative", "total"],
            text=[
                f"€{mieteinnahmen:,.0f}",
                f"-€{afa:,.0f}",
                f"-€{zinsen:,.0f}",
                f"-€{sonstige_werbungskosten:,.0f}",
                f"€{einkuenfte:,.0f}",
            ],
            textposition="outside",
            connector={"line": {"color": "rgb(63, 63, 63)"}},
            increasing={"marker": {"color": COLORS["success"]}},
            decreasing={"marker": {"color": COLORS["danger"]}},
            totals={"marker": {"color": COLORS["primary"]}},
        )
    )

    fig.update_layout(
        title={
            "text": "📋 Steuerliche Übersicht (Einkünfte aus V&V)",
            "font": {"size": 18},
            "x": 0.5,
            "xanchor": "center",
        },
        yaxis_title="Betrag (€)",
        template="plotly_white",
        height=450,
        showlegend=False,
    )

    return fig
