"""
Immo-Invest-Tool - High-End Real Estate Investment Dashboard

Ein professionelles Immobilieninvestment-Dashboard für den deutschen Markt
mit Echtzeit-Berechnungen für Annuität, Cashflow und ROI.

Entwickelt mit Streamlit & Plotly.
"""
import streamlit as st
import pandas as pd

from src.finance_engine import (
    berechne_annuitaet,
    berechne_cashflow,
    berechne_renditen,
    berechne_tilgungsplan,
    berechne_vermoegensaufbau,
)
from src.tax_calculator import (
    AfATyp,
    Bundesland,
    Steuerdaten,
    berechne_nebenkosten_nach_bundesland,
    berechne_steuerliche_absetzbarkeit,
)
from src.analytics import (
    create_vermoegen_vs_restschuld_chart,
    create_tilgungsplan_chart,
    create_cashflow_gauge,
    create_rendite_vergleich_chart,
    create_zins_tilgung_pie,
    create_steuer_uebersicht,
)

# Page Configuration
st.set_page_config(
    page_title="🏠 Immo-Invest-Tool",
    page_icon="🏠",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom CSS für professionelles Design
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: 700;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 2rem;
    }
    .kpi-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 1.5rem;
        border-radius: 10px;
        color: white;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .kpi-value {
        font-size: 2rem;
        font-weight: bold;
    }
    .kpi-label {
        font-size: 0.9rem;
        opacity: 0.9;
    }
    .sidebar-section {
        background-color: #f8f9fa;
        padding: 1rem;
        border-radius: 5px;
        margin-bottom: 1rem;
    }
    .positive {
        color: #2ca02c;
    }
    .negative {
        color: #d62728;
    }
    .stMetric {
        background-color: #f8f9fa;
        padding: 1rem;
        border-radius: 10px;
    }
</style>
""", unsafe_allow_html=True)


def main() -> None:
    """Hauptfunktion des Dashboards."""
    # Header
    st.markdown(
        '<h1 class="main-header">🏠 Immo-Invest-Tool</h1>',
        unsafe_allow_html=True,
    )
    st.markdown(
        '<p style="text-align: center; color: #666;">Professionelle Immobilieninvestment-Analyse nach deutschem Steuerrecht</p>',
        unsafe_allow_html=True,
    )

    # Sidebar für Eingaben
    with st.sidebar:
        st.header("⚙️ Eingabeparameter")

        # Objektdaten
        st.subheader("🏘️ Objektdaten")

        kaufpreis = st.number_input(
            "Kaufpreis (€)",
            min_value=10000,
            max_value=10000000,
            value=300000,
            step=10000,
            help="Der Kaufpreis der Immobilie ohne Nebenkosten",
        )

        # Bundesland für Grunderwerbsteuer
        bundesland_options = {bl.display_name: bl for bl in Bundesland}
        selected_bundesland_name = st.selectbox(
            "Bundesland",
            options=list(bundesland_options.keys()),
            index=list(bundesland_options.keys()).index("Bayern"),
            help="Das Bundesland bestimmt den Grunderwerbsteuersatz",
        )
        bundesland = bundesland_options[selected_bundesland_name]

        # Makler-Option
        mit_makler = st.checkbox("Mit Makler?", value=True)
        makler_prozent = 3.57
        if mit_makler:
            makler_prozent = st.slider(
                "Maklerprovision (%)",
                min_value=0.0,
                max_value=7.14,
                value=3.57,
                step=0.01,
                help="Maklerprovision (Käuferanteil)",
            )

        # Nebenkosten berechnen
        nebenkosten_dict = berechne_nebenkosten_nach_bundesland(
            kaufpreis=kaufpreis,
            bundesland=bundesland,
            mit_makler=mit_makler,
            makler_prozent=makler_prozent,
        )
        nebenkosten = nebenkosten_dict["gesamt"]
        gesamtinvestition = kaufpreis + nebenkosten

        st.info(f"💰 Nebenkosten: €{nebenkosten:,.0f} ({nebenkosten_dict['gesamt_prozent']:.2f}%)")

        st.divider()

        # Finanzierung
        st.subheader("🏦 Finanzierung")

        eigenkapital = st.number_input(
            "Eigenkapital (€)",
            min_value=0,
            max_value=int(gesamtinvestition),
            value=min(60000, int(gesamtinvestition)),
            step=5000,
            help="Ihr eingesetztes Eigenkapital",
        )

        darlehensbetrag = gesamtinvestition - eigenkapital

        col1, col2 = st.columns(2)
        with col1:
            zinssatz = st.number_input(
                "Zinssatz (%)",
                min_value=0.1,
                max_value=15.0,
                value=3.5,
                step=0.1,
                help="Jährlicher Sollzinssatz",
            )
        with col2:
            tilgung = st.number_input(
                "Tilgung (%)",
                min_value=0.5,
                max_value=10.0,
                value=2.0,
                step=0.1,
                help="Anfängliche Tilgung",
            )

        laufzeit = st.slider(
            "Laufzeit (Jahre)",
            min_value=5,
            max_value=40,
            value=30,
            help="Betrachtungszeitraum",
        )

        st.divider()

        # Mieteinnahmen
        st.subheader("🏠 Mieteinnahmen")

        kaltmiete = st.number_input(
            "Kaltmiete monatlich (€)",
            min_value=100,
            max_value=50000,
            value=1000,
            step=50,
            help="Monatliche Kaltmiete ohne Nebenkosten",
        )

        nicht_umlegbare_kosten = st.number_input(
            "Nicht umlegbare Kosten mtl. (€)",
            min_value=0,
            max_value=5000,
            value=100,
            step=10,
            help="Verwaltungskosten, Instandhaltungsrücklage etc.",
        )

        mietausfallwagnis = st.slider(
            "Mietausfallwagnis (%)",
            min_value=0.0,
            max_value=10.0,
            value=2.0,
            step=0.5,
            help="Rückstellung für Leerstand und Mietausfall",
        )

        st.divider()

        # Steuerliche Parameter
        st.subheader("📋 Steuerliche Parameter")

        afa_options = {
            "Altbau vor 1925 (2,5%)": AfATyp.ALTBAU_VOR_1925,
            "Altbau ab 1925 (2%)": AfATyp.ALTBAU_AB_1925,
            "Neubau ab 2023 (3%)": AfATyp.NEUBAU_AB_2023,
            "Denkmalschutz (9%)": AfATyp.DENKMALSCHUTZ,
        }
        selected_afa = st.selectbox(
            "AfA-Typ",
            options=list(afa_options.keys()),
            index=1,
            help="Abschreibungssatz nach § 7 EStG",
        )
        afa_typ = afa_options[selected_afa]

        gebaeude_anteil = st.slider(
            "Gebäudeanteil (%)",
            min_value=50.0,
            max_value=95.0,
            value=75.0,
            step=1.0,
            help="Anteil des Gebäudes am Kaufpreis (für AfA-Berechnung)",
        )

        grenzsteuersatz = st.slider(
            "Persönlicher Grenzsteuersatz (%)",
            min_value=0.0,
            max_value=45.0,
            value=35.0,
            step=1.0,
            help="Ihr persönlicher Grenzsteuersatz (inkl. Soli)",
        )

        wertsteigerung = st.slider(
            "Wertsteigerung p.a. (%)",
            min_value=-2.0,
            max_value=5.0,
            value=1.5,
            step=0.1,
            help="Erwartete jährliche Wertsteigerung der Immobilie",
        )

    # Berechnungen durchführen
    # 1. Finanzierung
    finanzierung = berechne_annuitaet(
        darlehensbetrag=darlehensbetrag,
        zinssatz_prozent=zinssatz,
        tilgung_prozent=tilgung,
        laufzeit_jahre=laufzeit,
    )

    # 2. Tilgungsplan
    tilgungsplan = berechne_tilgungsplan(
        darlehensbetrag=darlehensbetrag,
        zinssatz_prozent=zinssatz,
        tilgung_prozent=tilgung,
        laufzeit_jahre=laufzeit,
    )

    # 3. Steuerliche Absetzbarkeit (Durchschnitt über gesamte Laufzeit für realistischere Darstellung)
    # Die Zinsen sinken über die Laufzeit, daher berechnen wir den Durchschnitt
    durchschnittliche_zinsen = (
        tilgungsplan["Zinsanteil"].mean()
        if not tilgungsplan.empty
        else 0
    )
    steuerdaten = Steuerdaten(
        kaufpreis=kaufpreis,
        gebaeude_anteil_prozent=gebaeude_anteil,
        afa_typ=afa_typ,
        zinsen_jaehrlich=durchschnittliche_zinsen,
        mieteinnahmen_jaehrlich=kaltmiete * 12,
        nicht_umlegbare_kosten_jaehrlich=nicht_umlegbare_kosten * 12,
        grenzsteuersatz_prozent=grenzsteuersatz,
    )
    steuer_ergebnis = berechne_steuerliche_absetzbarkeit(steuerdaten)

    # Für die Detailansicht: Steuerberechnung mit Zinsen des 1. Jahres
    steuerdaten_jahr1 = Steuerdaten(
        kaufpreis=kaufpreis,
        gebaeude_anteil_prozent=gebaeude_anteil,
        afa_typ=afa_typ,
        zinsen_jaehrlich=tilgungsplan["Zinsanteil"].iloc[0] if not tilgungsplan.empty else 0,
        mieteinnahmen_jaehrlich=kaltmiete * 12,
        nicht_umlegbare_kosten_jaehrlich=nicht_umlegbare_kosten * 12,
        grenzsteuersatz_prozent=grenzsteuersatz,
    )
    steuer_ergebnis_jahr1 = berechne_steuerliche_absetzbarkeit(steuerdaten_jahr1)

    # 4. Cashflow
    cashflow = berechne_cashflow(
        kaltmiete_monatlich=kaltmiete,
        nicht_umlegbare_kosten_monatlich=nicht_umlegbare_kosten,
        mietausfallwagnis_prozent=mietausfallwagnis,
        monatliche_rate=finanzierung.monatliche_rate,
        steuervorteil_monatlich=steuer_ergebnis.steuervorteil_monatlich,
    )

    # 5. Renditen
    renditen = berechne_renditen(
        kaufpreis=kaufpreis,
        nebenkosten=nebenkosten,
        eigenkapital=eigenkapital,
        brutto_mieteinnahmen=cashflow.brutto_mieteinnahmen,
        netto_mieteinnahmen=cashflow.netto_mieteinnahmen,
        cashflow_nach_steuern=cashflow.cashflow_nach_steuern,
    )

    # 6. Vermögensaufbau
    vermoegen = berechne_vermoegensaufbau(
        eigenkapital=eigenkapital,
        tilgungsplan=tilgungsplan,
        cashflow_jaehrlich=cashflow.cashflow_nach_steuern,
        wertsteigerung_prozent=wertsteigerung,
        kaufpreis=kaufpreis,
    )

    # Dashboard Layout
    # KPI-Metriken oben
    st.subheader("📊 Wichtige Kennzahlen")

    kpi_col1, kpi_col2, kpi_col3, kpi_col4, kpi_col5 = st.columns(5)

    with kpi_col1:
        st.metric(
            label="💰 Gesamtinvestition",
            value=f"€{gesamtinvestition:,.0f}",
            delta=f"EK: €{eigenkapital:,.0f}",
        )

    with kpi_col2:
        st.metric(
            label="📈 Brutto-Rendite",
            value=f"{renditen.brutto_mietrendite:.2f}%",
            delta=f"Netto: {renditen.netto_mietrendite:.2f}%",
        )

    with kpi_col3:
        cashflow_monatlich = cashflow.cashflow_nach_steuern / 12
        delta_color = "normal" if cashflow_monatlich >= 0 else "inverse"
        st.metric(
            label="💵 Cashflow/Monat",
            value=f"€{cashflow_monatlich:,.0f}",
            delta=f"€{cashflow.cashflow_nach_steuern:,.0f}/Jahr",
            delta_color=delta_color,
        )

    with kpi_col4:
        st.metric(
            label="📊 EK-Rendite",
            value=f"{renditen.eigenkapitalrendite:.2f}%",
            delta="p.a.",
        )

    with kpi_col5:
        st.metric(
            label="🏦 Rate/Monat",
            value=f"€{finanzierung.monatliche_rate:,.0f}",
            delta=f"Darlehen: €{darlehensbetrag:,.0f}",
        )

    st.divider()

    # Hauptbereich mit Charts
    tab1, tab2, tab3, tab4 = st.tabs([
        "📈 Vermögensaufbau",
        "📊 Tilgungsplan",
        "💰 Cashflow & Rendite",
        "📋 Steuerliche Analyse",
    ])

    with tab1:
        st.plotly_chart(
            create_vermoegen_vs_restschuld_chart(vermoegen),
            use_container_width=True,
        )

        if not vermoegen.empty:
            col1, col2 = st.columns(2)
            with col1:
                st.info(f"🎯 **Nettovermögen nach {laufzeit} Jahren:** €{vermoegen['Nettovermögen'].iloc[-1]:,.0f}")
            with col2:
                restschuld_end = vermoegen['Restschuld'].iloc[-1]
                st.info(f"🏦 **Restschuld nach {laufzeit} Jahren:** €{restschuld_end:,.0f}")

    with tab2:
        st.plotly_chart(
            create_tilgungsplan_chart(tilgungsplan),
            use_container_width=True,
        )

        if not tilgungsplan.empty:
            col1, col2 = st.columns(2)
            with col1:
                st.plotly_chart(
                    create_zins_tilgung_pie(
                        tilgungsplan["Zinsanteil"].iloc[0],
                        tilgungsplan["Tilgungsanteil"].iloc[0],
                    ),
                    use_container_width=True,
                )
            with col2:
                st.info(f"💰 **Gezahlte Zinsen gesamt:** €{tilgungsplan['Zinsen kumuliert'].iloc[-1]:,.0f}")
                st.info(f"📈 **Getilgter Betrag:** €{tilgungsplan['Tilgung kumuliert'].iloc[-1]:,.0f}")

    with tab3:
        col1, col2 = st.columns([1, 2])

        with col1:
            st.plotly_chart(
                create_cashflow_gauge(cashflow.cashflow_nach_steuern / 12),
                use_container_width=True,
            )

            st.markdown("#### 💵 Cashflow-Details")
            st.write(f"**Brutto-Mieteinnahmen:** €{cashflow.brutto_mieteinnahmen:,.0f}/Jahr")
            st.write(f"**Netto-Mieteinnahmen:** €{cashflow.netto_mieteinnahmen:,.0f}/Jahr")
            st.write(f"**Cashflow vor Steuern:** €{cashflow.cashflow_vor_steuern:,.0f}/Jahr")
            st.write(f"**Steuervorteil:** €{steuer_ergebnis.steuervorteil:,.0f}/Jahr")
            st.write(f"**Cashflow nach Steuern:** €{cashflow.cashflow_nach_steuern:,.0f}/Jahr")

        with col2:
            st.plotly_chart(
                create_rendite_vergleich_chart(
                    renditen.brutto_mietrendite,
                    renditen.netto_mietrendite,
                    renditen.eigenkapitalrendite,
                    renditen.cashflow_rendite,
                ),
                use_container_width=True,
            )

    with tab4:
        # Verwende Jahr 1 Daten für die Steuerübersicht
        zinsen_jahr1 = tilgungsplan["Zinsanteil"].iloc[0] if not tilgungsplan.empty else 0
        st.plotly_chart(
            create_steuer_uebersicht(
                afa=steuer_ergebnis_jahr1.afa_betrag,
                zinsen=zinsen_jahr1,
                sonstige_werbungskosten=nicht_umlegbare_kosten * 12,
                mieteinnahmen=kaltmiete * 12,
            ),
            use_container_width=True,
        )
        st.caption("📌 Darstellung basiert auf Jahr 1 der Finanzierung. Zinsen sinken über die Laufzeit.")

        col1, col2 = st.columns(2)
        with col1:
            st.markdown("#### 📋 Steuerliche Kennzahlen (Jahr 1)")
            st.write(f"**AfA ({afa_typ.name.replace('_', ' ')}):** €{steuer_ergebnis_jahr1.afa_betrag:,.0f}/Jahr")
            st.write(f"**Absetzbare Zinsen:** €{zinsen_jahr1:,.0f}/Jahr")
            st.write(f"**Nicht umlegbare Kosten:** €{nicht_umlegbare_kosten * 12:,.0f}/Jahr")
            st.write(f"**Werbungskosten gesamt:** €{steuer_ergebnis_jahr1.werbungskosten:,.0f}/Jahr")

        with col2:
            st.markdown("#### 📊 Steuerliche Auswirkung (Jahr 1)")
            einkuenfte_vv = steuer_ergebnis_jahr1.einkuenfte_aus_vv
            if einkuenfte_vv < 0:
                st.success(f"**Verlust aus V&V:** €{abs(einkuenfte_vv):,.0f}/Jahr")
                st.success(f"**Steuervorteil:** €{steuer_ergebnis_jahr1.steuervorteil:,.0f}/Jahr")
            else:
                st.warning(f"**Gewinn aus V&V:** €{einkuenfte_vv:,.0f}/Jahr")
                st.warning(f"**Steuerlast:** €{abs(steuer_ergebnis_jahr1.steuervorteil):,.0f}/Jahr")

    # Detailtabellen
    st.divider()
    st.subheader("📋 Detaillierte Übersichten")

    with st.expander("📊 Tilgungsplan anzeigen"):
        if not tilgungsplan.empty:
            formatted_df = tilgungsplan.copy()
            for col in ["Zinsanteil", "Tilgungsanteil", "Restschuld", "Zinsen kumuliert", "Tilgung kumuliert"]:
                formatted_df[col] = formatted_df[col].apply(lambda x: f"€{x:,.0f}")
            st.dataframe(formatted_df, use_container_width=True, hide_index=True)

    with st.expander("📈 Vermögensentwicklung anzeigen"):
        if not vermoegen.empty:
            formatted_df = vermoegen.copy()
            for col in ["Immobilienwert", "Restschuld", "Nettovermögen", "Cashflow kumuliert", "Gesamtvermögen"]:
                formatted_df[col] = formatted_df[col].apply(lambda x: f"€{x:,.0f}")
            st.dataframe(formatted_df, use_container_width=True, hide_index=True)

    with st.expander("ℹ️ Nebenkostenaufschlüsselung"):
        st.write(f"**Grunderwerbsteuer ({bundesland.steuersatz}%):** €{nebenkosten_dict['grunderwerbsteuer']:,.0f}")
        st.write(f"**Notar & Grundbuch (2%):** €{nebenkosten_dict['notar_und_grundbuch']:,.0f}")
        if mit_makler:
            st.write(f"**Makler ({makler_prozent}%):** €{nebenkosten_dict['makler']:,.0f}")
        st.write(f"**Nebenkosten gesamt:** €{nebenkosten:,.0f}")

    # Footer
    st.divider()
    st.markdown(
        """
        <div style="text-align: center; color: #888; font-size: 0.8rem;">
            <p>⚠️ Dieses Tool dient nur zu Informationszwecken und ersetzt keine professionelle Finanzberatung.</p>
            <p>Entwickelt mit ❤️ | Streamlit & Plotly | Deutsches Steuerrecht (Stand 2024)</p>
        </div>
        """,
        unsafe_allow_html=True,
    )


if __name__ == "__main__":
    main()
