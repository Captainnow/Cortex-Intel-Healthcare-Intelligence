"""
AHIP Free AI Integration
Supports Groq API, Ollama, and HuggingFace (all free tiers)
"""
import os
import requests
import json

class FreeAIIntegration:
    """100% FREE AI integration - no paid APIs"""

    def __init__(self):
        self.groq_api_key = os.getenv("GROQ_API_KEY", "")  # Free tier, no credit card
        self.huggingface_token = os.getenv("HF_TOKEN", "")  # Free tier
        self.ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")  # Local
        self.primary_provider = "groq"  # Default: Groq free tier

    def query_groq(self, prompt, model="llama3-8b-8192"):
        """Query Groq API (FREE tier: 20 req/min, 1M tokens/day)"""
        if not self.groq_api_key:
            return {"error": "GROQ_API_KEY not set. Get free key at https://console.groq.com/"}

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.groq_api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7
        }

        try:
            response = requests.post(url, headers=headers, json=data, timeout=30)
            if response.status_code == 200:
                result = response.json()
                return {
                    "provider": "Groq (FREE)",
                    "model": model,
                    "response": result['choices'][0]['message']['content'],
                    "tokens_used": result.get('usage', {}).get('total_tokens', 0)
                }
        except Exception as e:
            return {"error": str(e)}

        return {"error": f"Groq API error: {response.status_code}"}

    def query_ollama(self, prompt, model="llama3"):
        """Query local Ollama (100% free, offline)"""
        url = f"{self.ollama_url}/api/generate"
        data = {
            "model": model,
            "prompt": prompt,
            "stream": False
        }

        try:
            response = requests.post(url, json=data, timeout=60)
            if response.status_code == 200:
                result = response.json()
                return {
                    "provider": "Ollama (LOCAL/FREE)",
                    "model": model,
                    "response": result.get('response', ''),
                    "local": True
                }
        except Exception as e:
            return {"error": f"Ollama not running. Install: https://ollama.com/ | Error: {e}"}

        return {"error": f"Ollama error: {response.status_code}"}

    def query_huggingface(self, prompt, model="meta-llama/Llama-2-7b-chat-hf"):
        """Query HuggingFace Inference API (FREE tier: 30K chars/month)"""
        if not self.huggingface_token:
            return {"error": "HF_TOKEN not set. Get free token at https://huggingface.co/settings/tokens"}

        url = f"https://api-inference.huggingface.co/models/{model}"
        headers = {"Authorization": f"Bearer {self.huggingface_token}"}
        data = {"inputs": prompt}

        try:
            response = requests.post(url, headers=headers, json=data, timeout=30)
            if response.status_code == 200:
                result = response.json()
                return {
                    "provider": "HuggingFace (FREE)",
                    "model": model,
                    "response": result[0].get('generated_text', '') if isinstance(result, list) else str(result)
                }
        except Exception as e:
            return {"error": str(e)}

        return {"error": f"HuggingFace error: {response.status_code}"}

    def ask(self, prompt, provider=None):
        """Smart routing to free AI providers"""
        provider = provider or self.primary_provider

        if provider == "groq":
            return self.query_groq(prompt)
        elif provider == "ollama":
            return self.query_ollama(prompt)
        elif provider == "huggingface":
            return self.query_huggingface(prompt)
        else:
            # Try all providers in order
            for p in ["groq", "ollama", "huggingface"]:
                result = self.ask(prompt, p)
                if "error" not in result:
                    return result
            return {"error": "All AI providers unavailable. Please configure at least one free provider."}

# Usage
if __name__ == "__main__":
    ai = FreeAIIntegration()

    # Example: Ask about healthcare
    result = ai.ask("What are the top risk factors for cardiovascular device recalls?")
    print(json.dumps(result, indent=2))
