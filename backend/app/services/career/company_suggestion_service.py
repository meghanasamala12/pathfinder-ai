"""
Company suggestion service: analyze coursework, projects, interests
and suggest specific companies that match the student's profile.
"""
import json
import re
from typing import List, Optional
from app.services.llm.llm_service import LLMService


class CompanySuggestionService:
    """
    Analyzes student profile (coursework, projects, interests)
    and suggests specific companies that fit their background.
    """

    def __init__(self):
        self.llm = LLMService()

    async def suggest_companies(
        self,
        coursework: Optional[List[str]] = None,
        projects: Optional[List[str]] = None,
        interests: Optional[List[str]] = None,
        target_role: Optional[str] = None,
        limit: int = 10,
    ) -> dict:
        """
        Analyze profile and return suggested companies with reasoning.

        Args:
            coursework: List of courses or course names
            projects: List of projects (name + brief description)
            interests: List of interests or career interests
            target_role: Optional target job role (e.g. "Software Engineer")
            limit: Max number of companies to suggest

        Returns:
            {
                "summary": str,
                "companies": [{"name": str, "reason": str, "roles": List[str]}],
                "profile_summary": str
            }
        """
        coursework = coursework or []
        projects = projects or []
        interests = interests or []

        coursework_text = "\n".join(f"- {c}" for c in coursework) if coursework else "Not provided"
        projects_text = "\n".join(f"- {p}" for p in projects) if projects else "Not provided"
        interests_text = "\n".join(f"- {i}" for i in interests) if interests else "Not provided"
        role_hint = f" They are especially interested in roles like: {target_role}." if target_role else ""

        prompt = f"""You are a career advisor. Based on the following student profile, suggest specific real companies (startups, mid-size, and large) that would be a good fit for internships or full-time roles. Focus on companies that hire for the skills and interests shown.

STUDENT PROFILE:

Coursework:
{coursework_text}

Projects:
{projects_text}

Interests:
{interests_text}
{role_hint}

Respond in this exact JSON format only (no other text before or after):
{{
  "profile_summary": "One sentence summary of the student's profile and strengths.",
  "companies": [
    {{
      "name": "Company Name",
      "reason": "One sentence why this company fits (refer to their coursework/projects/interests).",
      "roles": ["Role 1", "Role 2"]
    }}
  ]
}}

Suggest exactly {limit} companies. Use real, well-known companies. Be specific and actionable."""

        try:
            response = await self.llm.generate_response(
                prompt,
                max_tokens=1200,
                temperature=0.6,
            )
            return self._parse_response(response, coursework_text, projects_text, interests_text)
        except Exception as e:
            return {
                "error": str(e),
                "profile_summary": "",
                "companies": [],
                "summary": "Unable to generate suggestions. Please try again.",
            }

    def _parse_response(
        self,
        response: str,
        coursework_text: str,
        projects_text: str,
        interests_text: str,
    ) -> dict:
        """Parse LLM response into structured format."""
        # Try to extract JSON from response (in case there's extra text)
        response = response.strip()
        json_match = re.search(r"\{[\s\S]*\}", response)
        if json_match:
            try:
                data = json.loads(json_match.group())
                companies = data.get("companies", [])
                if not isinstance(companies, list):
                    companies = []
                for c in companies:
                    if not isinstance(c, dict):
                        continue
                    c.setdefault("name", "Unknown")
                    c.setdefault("reason", "")
                    c.setdefault("roles", [])
                return {
                    "profile_summary": data.get("profile_summary", ""),
                    "companies": companies[:15],
                    "summary": data.get("profile_summary", "") or "Here are companies that match your profile.",
                }
            except json.JSONDecodeError:
                pass

        # Fallback: return raw response as summary, empty companies
        return {
            "profile_summary": response[:500],
            "companies": [],
            "summary": "See profile summary below. Could not parse company list.",
        }
