import os
import sqlite3
import pandas as pd
import requests
import re
import json

class HealthcareAIAgent:
    def __init__(self, db_path="ahip_warehouse.db"):
        self.db_path = db_path
        
    def _call_llm(self, prompt, api_key=None, provider="gemini"):
        """Call LLM API (Gemini or Groq)"""
        # Resolve keys: argument -> environment variable
        gemini_key = api_key if provider == "gemini" else os.environ.get("GEMINI_API_KEY")
        groq_key = api_key if provider == "groq" else os.environ.get("GROQ_API_KEY")
        
        # If the user specified groq but has no key, or gemini has no key, try switching
        if provider == "gemini" and not gemini_key:
            if groq_key:
                provider = "groq"
            else:
                raise ValueError("No API Key found. Please configure a Gemini API Key or Groq API Key.")
        elif provider == "groq" and not groq_key:
            if gemini_key:
                provider = "gemini"
            else:
                raise ValueError("No API Key found. Please configure a Gemini API Key or Groq API Key.")

        if provider == "gemini":
            key = gemini_key or os.environ.get("GEMINI_API_KEY")
            if not key:
                raise ValueError("Missing Gemini API Key.")
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={key}"
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": prompt}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.1
                }
            }
            try:
                resp = requests.post(url, json=payload, headers=headers, timeout=30)
                resp.raise_for_status()
                data = resp.json()
                return data['candidates'][0]['content']['parts'][0]['text']
            except Exception as e:
                err_detail = ""
                try:
                    err_detail = resp.text
                except:
                    pass
                raise Exception(f"Gemini API error: {e}. Details: {err_detail}")
                
        elif provider == "groq":
            key = groq_key or os.environ.get("GROQ_API_KEY")
            if not key:
                raise ValueError("Missing Groq API Key.")
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {key}"
            }
            payload = {
                "model": "llama-3.1-70b-versatile",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.1
            }
            try:
                resp = requests.post(url, json=payload, headers=headers, timeout=30)
                resp.raise_for_status()
                data = resp.json()
                return data['choices'][0]['message']['content']
            except Exception as e:
                err_detail = ""
                try:
                    err_detail = resp.text
                except:
                    pass
                raise Exception(f"Groq API error: {e}. Details: {err_detail}")
                
        raise ValueError("Invalid LLM provider specified.")

    def run_query(self, user_question, api_key=None, provider="gemini"):
        """Run text-to-SQL RAG loop"""
        db_schema = """
DATABASE SCHEMA DESCRIPTION:
We have three tables in a SQLite database:

1. Table: fact_patient_risk
   Columns:
     - patient_id (TEXT): Unique ID of the patient
     - disease_type (TEXT): Type of disease (e.g. 'heart', 'diabetes')
     - age (TEXT): Patient age
     - gender (TEXT): Patient gender (e.g. 'Male', 'Female')
     - risk_factors (TEXT): Specific clinical measurements (e.g. cholesterol, blood sugar, glucose, chest pain cp)
     - outcome (TEXT): Binary risk classification (e.g. '1' for high risk, '0' for low risk)
     - source (TEXT): Data provenance (e.g. 'UCI Machine Learning Repository')

2. Table: fact_device_recalls
   Columns:
     - recall_id (TEXT): Unique FDA recall identifier
     - product_description (TEXT): Description of the medical device
     - product_type (TEXT): Category/Specialty of device (e.g. 'Cardiovascular', 'Gastroenterology', 'Orthopedic')
     - recall_class (TEXT): Safety classification (e.g. 'Class I' for critical, 'Class II' for medium, 'Class III' for low)
     - reason_for_recall (TEXT): Detailed explanation of safety issue
     - firm_name (TEXT): Manufacturing company name
     - status (TEXT): Current recall status (e.g. 'Ongoing', 'Completed')
     - quantity (TEXT): Volume of units distributed
     - date_initiated (TEXT): Recall announcement date (e.g. '2026-05-12')
     - state (TEXT): US state code (if applicable)
     - country (TEXT): Country of origin
     - source (TEXT): 'openFDA API'

3. Table: fact_health_indicators
   Columns:
     - indicator_code (TEXT): WHO indicator code (e.g. 'WHOSIS_000001' for life expectancy, 'GHED_CHEGDP_SHA2011' for GDP spending)
     - indicator_name (TEXT): Full indicator name
     - country (TEXT): Country name or abbreviation
     - year (TEXT): Recording year
     - value (TEXT): Numeric value (stored as TEXT, can be cast to REAL for aggregations)
     - source (TEXT): 'WHO Global Health Observatory'
"""
        
        # Step 1: Generate SQL query
        sql_generation_prompt = f"""You are a professional database translator. Your job is to convert natural language questions into clean, valid SQLite SQL queries.

{db_schema}

INSTRUCTIONS:
1. Return ONLY the raw SQL query inside a markdown code block: ```sql <your sql query> ```
2. Do NOT write any conversational text, explanations, or introductory text. Just output the code block.
3. Make sure to use SELECT queries only. DO NOT write modifying queries (INSERT, UPDATE, DELETE, DROP).
4. Use standard SQLite syntax. For casting, use `CAST(value as REAL)` or `CAST(outcome as INTEGER)`.
5. Keep the queries highly efficient. Always limit the return count to 15 or fewer rows to prevent database bloat in responses, UNLESS doing aggregate counts (e.g. COUNT(*), AVG(), SUM()).
6. If the question does not require database records, generate a simple query like `SELECT 'general_inquiry' as type;`.

User Question: {user_question}
SQL Query:"""

        try:
            llm_response = self._call_llm(sql_generation_prompt, api_key=api_key, provider=provider)
        except Exception as e:
            return {
                "insight": f"### API Configuration Required\nIt looks like the free AI API is not configured yet or failed to respond.\n\n**Error:** {str(e)}\n\n**How to resolve this:**\n1. Paste your **Gemini API Key** in the settings input box at the top right of the Cortex Gemini Model panel.\n2. You can get a 100% free Gemini API key from [Google AI Studio](https://aistudio.google.com/).\n3. Alternatively, set the `GEMINI_API_KEY` environment variable in your backend `.env` file.",
                "data": []
            }

        # Extract SQL query from LLM response
        sql_match = re.search(r"```sql\s*(.*?)\s*```", llm_response, re.DOTALL | re.IGNORECASE)
        sql_query = sql_match.group(1).strip() if sql_match else None
        
        if not sql_query:
            sql_match_backup = re.search(r"(SELECT\s+.*?;)", llm_response, re.DOTALL | re.IGNORECASE)
            sql_query = sql_match_backup.group(1).strip() if sql_match_backup else None

        # Execute query if found
        data_records = []
        sql_error = None
        if sql_query:
            sql_query = sql_query.rstrip(';').strip() + ';'
            try:
                conn = sqlite3.connect(self.db_path)
                df = pd.read_sql_query(sql_query, conn)
                data_records = df.to_dict('records')
                conn.close()
            except Exception as e:
                sql_error = str(e)
                data_records = []
        
        # Step 2: Generate natural language explanation/answer
        final_answer_prompt = f"""You are Cortex Intel's lead medical AI and healthcare intelligence officer.
Provide a clear, detailed, and professional analysis answering the user's question.

User Question: {user_question}
SQL Query Used: {sql_query if sql_query else 'None (General Inquiry)'}
Database Query Results (JSON): {json.dumps(data_records[:15]) if data_records else 'No database records fetched.'}
Database Query Error (if any): {sql_error if sql_error else 'None'}

INSTRUCTIONS:
1. Provide a comprehensive, professional, and data-driven healthcare analyst report.
2. If data is present, explicitly analyze it, citing figures, percentages, company names, or averages.
3. Structure your response beautifully using markdown:
   - Use bold words for emphasis.
   - Use headings (`###` and `##`) to separate sections.
   - Use bullet points (`-`) or numbered lists for key takeaways.
   - Provide a brief summary conclusion.
4. If a Database Query Error or No records are found:
   - Politely explain that you couldn't query the database records, but provide a highly detailed general healthcare intelligence response about that topic.
   - Do not mention database internals like SQLite or python variables to the user; keep it professional and dashboard-focused.

Analysis Report:"""

        try:
            final_insight = self._call_llm(final_answer_prompt, api_key=api_key, provider=provider)
            return {
                "insight": final_insight,
                "data": data_records,
                "sql_query": sql_query
            }
        except Exception as e:
            return {
                "insight": f"Failed to generate final report: {str(e)}",
                "data": data_records,
                "sql_query": sql_query
            }
