#!/usr/bin/env python3
"""Fix generate_alumni in llm_service.py to add linkedin_username parameter"""
import re

path = '/home/linux1/pathfinder-ai/backend/app/services/llm/llm_service.py'
with open(path, 'r') as f:
    content = f.read()

# Find and replace the generate_alumni function signature and prompt
# Find the function start
idx = content.find('    async def generate_alumni(')
if idx == -1:
    print("ERROR: generate_alumni function not found!")
    exit(1)

# Find the end of the function (next method or end of class)
end_idx = content.find('\n    async def ', idx + 1)
if end_idx == -1:
    end_idx = len(content)

old_func = content[idx:end_idx]
print("Found function, length:", len(old_func))

new_func = '''    async def generate_alumni(
        self,
        university: str,
        career_interests: list,
        technical_skills: list,
        linkedin_username: str = "",
    ) -> list:
        """Generate realistic alumni profiles based on user\'s university and interests."""
        interests_str = ", ".join(career_interests) if career_interests else "technology, software engineering"
        skills_str = ", ".join([s.get("name", s) if isinstance(s, dict) else str(s) for s in technical_skills]) if technical_skills else "Python, SQL"
        linkedin_context = f"The user\'s LinkedIn username is {linkedin_username}. Generate alumni who would likely be in their network. " if linkedin_username else ""

        prompt = f"""Generate 6 realistic alumni profiles for graduates from {university}.
{linkedin_context}These alumni should be working in roles related to: {interests_str}.
Their backgrounds should align with skills like: {skills_str}.

Return ONLY a JSON array with exactly 6 objects. Each object must have:
- name: full name (string)
- role: current job title (string)
- company: well-known company name (string)
- location: city, state (string)
- degree: their degree field (string)
- class_year: graduation year between 2015-2023 (integer)
- bio: 1-2 sentences about their work and willingness to help students (string)
- expertise: array of 2-4 expertise areas (array of strings)
- linkedin_search: their name formatted for LinkedIn search (string)

Make profiles diverse in gender, background, and companies. Return ONLY the JSON array."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=2000,
            )
            raw = response.choices[0].message.content.strip()
            if "```" in raw:
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            raw = raw.strip().rstrip("```").strip()
            result = json.loads(raw)
            if isinstance(result, list):
                return result[:6]
        except Exception as e:
            print(f"generate_alumni error: {e}")
        return []
'''

content = content[:idx] + new_func + content[end_idx:]

with open(path, 'w') as f:
    f.write(content)

print("Fixed successfully!")
print("New function preview:")
print(content[idx:idx+200])
