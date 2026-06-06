"""
Healthcare Intelligence Platform (HIP) - Real-Time Data Connector
Fetches LIVE data from free APIs (openFDA and WHO) and populates the local SQLite database.
"""
import requests
import pandas as pd
import sqlite3
from datetime import datetime

class RealTimeConnector:
    """Connects to free APIs and fetches real-time healthcare data"""

    def __init__(self, db_path="ahip_warehouse.db"):
        self.db_path = db_path
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': 'Healthcare-Intelligence-Platform-Connector/2.1'})
        self.target_countries = [
            'USA', 'GBR', 'DEU', 'FRA', 'JPN', 'IND', 'BRA', 'CHN', 'CAN', 'AUS',
            'ITA', 'ESP', 'NLD', 'SWE', 'CHE', 'NOR', 'DNK', 'AUT', 'BEL', 'FIN'
        ]

    def classify_product_type(self, desc):
        """Helper to classify product type based on keywords in product description"""
        if not desc:
            return "General Hospital"
        desc_lower = str(desc).lower()
        if any(w in desc_lower for w in ["cardio", "heart", "vascular", "defibrillator", "pacemaker", "ecg"]):
            return "Cardiovascular"
        if any(w in desc_lower for w in ["radiology", "x-ray", "mri", "scan", "ultrasound", "tomography"]):
            return "Radiology"
        if any(w in desc_lower for w in ["dental", "tooth", "teeth", "implants", "orthodontic"]):
            return "Dental"
        if any(w in desc_lower for w in ["surgical", "suture", "knife", "scalpel", "forceps", "endoscope"]):
            return "Surgical"
        if any(w in desc_lower for w in ["neurology", "brain", "nerve", "eeg", "neuro"]):
            return "Neurological"
        if any(w in desc_lower for w in ["orthopedic", "bone", "joint", "knee", "prosthesis"]):
            return "Orthopedic"
        if any(w in desc_lower for w in ["implant", "implantable"]):
            return "Implantable"
        if any(w in desc_lower for w in ["ivd", "in vitro", "test kit", "assay", "reagent", "analyzer"]):
            return "IVD"
        return "General Hospital"

    def fetch_fda_recalls(self, limit=100):
        """Fetch real-time FDA device recalls"""
        url = f"https://api.fda.gov/device/recall.json?limit={limit}"
        try:
            response = self.session.get(url, timeout=15)
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                mapped_recalls = []
                for idx, r in enumerate(results):
                    desc = r.get('product_description', 'Unknown Device')
                    mapped_recalls.append({
                        'recall_id': r.get('recall_number', f'REC-{datetime.now().year}-{idx+1:06d}'),
                        'product_description': desc[:200] + ('...' if len(desc) > 200 else ''),
                        'product_type': self.classify_product_type(desc),
                        'recall_class': r.get('classification', 'Class II'),
                        'reason_for_recall': r.get('reason_for_recall', 'Quality concerns'),
                        'firm_name': r.get('recalling_firm', 'Unknown Manufacturer'),
                        'status': r.get('status', 'Ongoing'),
                        'quantity': r.get('quantity_in_commerce', 'Unknown quantity'),
                        'date_initiated': r.get('event_date_initiated', datetime.now().strftime('%Y-%m-%d')),
                        'state': r.get('state', ''),
                        'country': r.get('country', 'United States'),
                        'source': 'openFDA API (Real-time)',
                        'api_endpoint': 'https://api.fda.gov/device/recall.json',
                        'last_updated': datetime.now().strftime('%Y-%m-%d')
                    })
                print(f"Fetched {len(mapped_recalls)} live FDA recalls")
                return mapped_recalls
        except Exception as e:
            print(f"FDA API error: {e}")
        return []

    def fetch_who_indicator(self, indicator_code, map_code=None, display_name="Indicator"):
        """Fetch WHO indicator and format it"""
        url = f"https://ghoapi.azureedge.net/api/{indicator_code}"
        try:
            response = self.session.get(url, timeout=15)
            if response.status_code == 200:
                data = response.json()
                raw_values = data.get('value', [])
                mapped_values = []
                for val in raw_values:
                    # Filter for our target countries
                    country_code = val.get('SpatialDim')
                    if country_code not in self.target_countries:
                        continue
                    # Filter out sex stratification if applicable
                    dim1 = val.get('Dim1')
                    if dim1 and dim1 not in ['SEX_BTSX']:
                        continue

                    val_num = val.get('NumericValue')
                    if val_num is None:
                        continue
                    mapped_values.append({
                        'indicator_code': map_code or indicator_code,
                        'indicator_name': display_name,
                        'country': country_code,
                        'year': str(val.get('TimeDim', datetime.now().year)),
                        'value': str(round(float(val_num), 2)),
                        'source': 'WHO GHO API (Real-time)',
                        'api_endpoint': url,
                        'last_updated': datetime.now().strftime('%Y-%m-%d')
                    })
                print(f"Fetched {len(mapped_values)} WHO indicators for {indicator_code} ({display_name})")
                return mapped_values
        except Exception as e:
            print(f"WHO API error for {indicator_code}: {e}")
        return []

    def update_database(self):
        """Update SQLite database with real-time data from WHO and openFDA"""
        conn = sqlite3.connect(self.db_path)
        
        # 1. Update FDA Recalls
        recalls = self.fetch_fda_recalls(100)
        if recalls:
            df_recalls = pd.DataFrame(recalls)
            df_recalls.to_sql('fact_device_recalls', conn, if_exists='replace', index=False)
            print(f"SQLite updated: 'fact_device_recalls' has {len(df_recalls)} live records")
        else:
            print("Skipped recalls database update (FDA API failed/empty)")

        # 2. Update WHO Health Indicators
        indicators_to_fetch = [
            ('WHOSIS_000001', 'WHOSIS_000001', 'Life expectancy at birth (years)'),
            ('GHED_CHEGDP_SHA2011', 'WHS9_93', 'Health expenditure (% of GDP)'),
            ('SDGSUICIDE', 'SDGSUIC', 'Suicide mortality rate (per 100 000)'),
            ('SDGPM25', 'SDGPM25', 'PM2.5 air pollution (mg/m3)'),
            ('WHS4_100', 'WHS4_100', 'Vaccination coverage (%)'),
            ('MORT_100', 'MORT_100', 'Under-5 mortality rate (per 1000)')
        ]

        all_indicator_records = []
        for orig_code, map_code, disp_name in indicators_to_fetch:
            records = self.fetch_who_indicator(orig_code, map_code, disp_name)
            if records:
                all_indicator_records.extend(records)

        if all_indicator_records:
            df_indicators = pd.DataFrame(all_indicator_records)
            # Deduplicate by indicator, country, and year
            df_indicators = df_indicators.drop_duplicates(subset=['indicator_code', 'country', 'year'])
            df_indicators.to_sql('fact_health_indicators', conn, if_exists='replace', index=False)
            print(f"SQLite updated: 'fact_health_indicators' has {len(df_indicators)} live records")
        else:
            print("Skipped indicators database update (WHO API failed/empty)")

        conn.close()
        print("Real-time data sync complete!")

if __name__ == "__main__":
    import os
    db_file = "ahip_warehouse.db" if os.path.exists("ahip_warehouse.db") else "../../ahip_warehouse.db"
    connector = RealTimeConnector(db_file)
    connector.update_database()
