"""
LLM service for AI interactions
Adapted from AI-Resume-Summarizer---Career-Navigator-main/src/helper.py
"""
import os
from typing import Optional
from groq import Groq
from openai import OpenAI
from app.config import settings


class LLMService:
    """Service for interacting with LLM providers"""
    
    def __init__(self, provider: str = "groq"):
        """
        Initialize LLM service
        
        Args:
            provider: 'groq', 'openai', or 'vertexai'
        """
        self.provider = provider
        
        if provider == "groq" and settings.GROQ_API_KEY:
            self.client = Groq(api_key=settings.GROQ_API_KEY)
            self.model = settings.GROQ_MODEL
        elif provider == "openai" and settings.OPENAI_API_KEY:
            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
            self.model = settings.OPENAI_MODEL
        else:
            # Default to Groq if available
            if settings.GROQ_API_KEY:
                self.client = Groq(api_key=settings.GROQ_API_KEY)
                self.model = settings.GROQ_MODEL
            else:
                raise ValueError("No LLM API key configured")
    
    async def generate_response(
        self,
        prompt: str,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        system_prompt: Optional[str] = None
    ) -> str:
        """
        Generate response from LLM
        
        Args:
            prompt: User prompt
            max_tokens: Maximum tokens in response
            temperature: Temperature for generation
            system_prompt: System prompt for context
            
        Returns:
            Generated response text
        """
        max_tokens = max_tokens or settings.MAX_TOKENS_DEFAULT
        temperature = temperature or settings.TEMPERATURE_DEFAULT
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        try:
            if isinstance(self.client, Groq):
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    max_tokens=max_tokens,
                    temperature=temperature,
                )
            else:  # OpenAI
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    max_tokens=max_tokens,
                    temperature=temperature,
                )
            
            return response.choices[0].message.content.strip()
        except Exception as e:
            raise Exception(f"LLM API error: {str(e)}")
    
    async def extract_skills(self, resume_text: str) -> str:
        """
        Extract skills from resume text
        
        Args:
            resume_text: Resume text content
            
        Returns:
            Extracted skills summary
        """
        prompt = f"""
        Extract the key skills, technologies, and experience level from this resume.
        Return as a structured summary:
        
        Resume: {resume_text[:2000]}...
        
        Format:
        Skills: [list of skills]
        Experience Level: [junior/mid/senior]
        Domain: [primary domain/field]
        """
        
        return await self.generate_response(prompt, max_tokens=500)
    
    async def analyze_gap(
        self,
        resume_text: str,
        job_description: str
    ) -> str:
        """
        Analyze gap between resume and job description
        
        Args:
            resume_text: Resume text
            job_description: Job description text
            
        Returns:
            Gap analysis text
        """
        prompt = f"""
        Compare the skills and experience detailed in this resume: 
        <RESUME STARTS HERE> {resume_text[:1500]} <RESUME ENDS HERE> 
        
        with the requirements listed in the job description: 
        <JOB DESCRIPTION STARTS HERE> {job_description[:1500]} <JOB DESCRIPTION ENDS HERE> 
        
        Identify any gaps or mismatches. Be specific and actionable.
        """
        
        return await self.generate_response(prompt, max_tokens=600)
    
    async def generate_career_roadmap(
        self,
        resume_text: str,
        target_role: Optional[str] = None
    ) -> str:
        """
        Generate career roadmap
        
        Args:
            resume_text: Resume text
            target_role: Target role (optional)
            
        Returns:
            Career roadmap text
        """
        role_context = f" for the role of {target_role}" if target_role else ""
        
        prompt = f"""
        Create a detailed 6-month and 1-year career roadmap{role_context} for this person 
        including specific skills to learn, certifications to pursue, and career moves to consider:
        
        Resume: {resume_text[:2000]}...
        """
        
        return await self.generate_response(prompt, max_tokens=800)

    async def extract_courses_from_text(self, raw_text: str) -> list:
        """
        Extract course names from pasted text or transcript PDF (any university/student).
        Returns a list of course names.
        """
        if not raw_text or not raw_text.strip():
            return []
        # Use enough text for long transcripts (many courses)
        text_slice = raw_text[:12000]
        prompt = f"""You are given raw text from a student's course grades or transcript (from any university or portal).
Extract EVERY course name (or course title) listed. Do not skip any. Ignore column headers, grades, dates, and page footers.
Return a JSON array of strings only. Example: ["Data Structures", "Machine Learning", "Web Development"]

Text to parse:
{text_slice}

Return only the JSON array, e.g. ["Course One", "Course Two"]"""
        try:
            response = await self.generate_response(prompt, max_tokens=2000)
            response = response.strip()
            import json
            import re
            match = re.search(r'\[[\s\S]*?\]', response)
            if match:
                arr = json.loads(match.group())
                return [str(x).strip() for x in arr if x][:120]
        except Exception:
            pass
        return []

    async def extract_course_grades_from_text(self, raw_text: str) -> list:
        """
        Extract course name, grade, and credits from pasted text or transcript PDF.
        Returns list of dicts: [{"course": str, "grade": str or null, "credits": str or null}]
        """
        if not raw_text or not raw_text.strip():
            return []
        text_slice = raw_text[:12000]
        prompt = f"""You are given raw text from a student's course grades or transcript (from any university or portal).
The text often has a table with: course name, credits (e.g. 3, 1), and grade (letter like A/B+/C or IP for In Progress).

Extract EVERY course row. For each row return a JSON object with exactly these keys:
- "course": full course name or title (string)
- "credits": credit hours/units for that course (e.g. "3", "1"). Use null if not in the document.
- "grade": the grade for that course (letter like A, B+, A-, or IP). Use null if not in the document.

Return a JSON array of objects only. No other text.
Example: [{{"course": "DS512 - Data Engineering", "credits": "3", "grade": "A"}}, {{"course": "CS521 - Software Project Management", "credits": "3", "grade": "B+"}}]

Text to parse:
{text_slice}

Return only the JSON array. Use null only when a value is truly missing."""
        try:
            import json
            import re
            response = await self.generate_response(prompt, max_tokens=2500)
            response = response.strip()
            match = re.search(r'\[[\s\S]*\]', response)
            if match:
                arr = json.loads(match.group())
                out = []
                for item in arr[:120]:
                    if isinstance(item, dict):
                        c = item.get("course") or item.get("Course") or ""
                        g = item.get("grade") or item.get("Grade") or item.get("score") or item.get("Score")
                        cr = item.get("credits") or item.get("Credits") or item.get("units") or item.get("Units")
                        out.append({
                            "course": str(c).strip() or "Unknown",
                            "grade": str(g).strip() if g is not None and str(g).strip() else None,
                            "credits": str(cr).strip() if cr is not None and str(cr).strip() else None,
                        })
                    elif isinstance(item, str):
                        out.append({"course": str(item).strip(), "grade": None, "credits": None})
                return out
        except Exception:
            pass
        return []

    def fill_grades_credits_from_text(self, course_grades: list, raw_text: str) -> list:
        """Fill missing grade and/or credits from raw_text by matching lines that contain the course and parsing grade (letter/IP) and credits (digit)."""
        if not course_grades or not raw_text:
            return course_grades
        import re
        letter_grade_re = re.compile(r"(?:^|[\s,])([A-F][+-]?|IP)(?:[\s,]|$)", re.IGNORECASE)
        credits_re = re.compile(r"\b(\d{1,2}(?:\.\d+)?)\b")
        lines = [ln.strip() for ln in raw_text.splitlines() if ln.strip()]
        filled = []
        for row in course_grades:
            course = (row.get("course") or "").strip()
            grade = row.get("grade") if row.get("grade") else None
            credits = row.get("credits") if row.get("credits") else None
            if course and (not grade or not credits):
                parts = course.split()
                key = (parts[0] if parts else course).upper()
                for ln in lines:
                    if key not in ln.upper() and not (parts and parts[0] in ln):
                        continue
                    if not grade:
                        g_match = letter_grade_re.search(ln)
                        if g_match:
                            grade = g_match.group(1)
                    if not credits:
                        for m in reversed(credits_re.findall(ln)):
                            try:
                                v = float(m)
                                if 0.5 <= v <= 15:
                                    credits = m
                                    break
                            except ValueError:
                                pass
                    if grade and credits:
                        break
            filled.append({
                "course": course or "Unknown",
                "grade": (str(grade).strip() if grade else None),
                "credits": (str(credits).strip() if credits else None),
            })
        return filled

    async def analyze_coursework(
        self,
        course_grades: list,
        resume_text: Optional[str] = None,
        projects: Optional[list] = None,
        job_area_interest: Optional[str] = None,
    ) -> dict:
        """
        Analyze coursework, resume, and projects. Optionally focus on student's job area interest.
        Returns summary, suitable roles, strengths, areas_to_improve, etc.
        """
        has_courses = bool(course_grades)
        has_resume = bool(resume_text and resume_text.strip())
        has_projects = bool(projects and len(projects) > 0)
        if not has_courses and not has_resume and not has_projects:
            return {
                "summary": "No coursework, resume, or projects to analyze.",
                "suitable_roles": [],
                "strengths": [],
                "suggested_roles": [],
                "skills_to_highlight": [],
                "recommendations": [],
                "areas_to_improve": [],
            }
        import json
        courses_str = json.dumps(course_grades[:40], indent=2) if course_grades else "[]"
        resume_slice = (resume_text[:6000].strip()) if resume_text and resume_text.strip() else ""
        projects_list = projects[:30] if projects else []
        projects_str = "\n".join(f"- {p}" for p in projects_list) if projects_list else "(none)"
        interest_line = ""
        if job_area_interest and job_area_interest.strip():
            interest_line = f"\nThe student's stated job role interest: \"{job_area_interest.strip()}\"\nIMPORTANT: Put the role that best matches this interest FIRST in suitable_roles (e.g. if they said Python Developer, list Python Developer as the #1 role). Then list other related roles. Also identify specific areas they need to improve for this target role.\n"
        prompt = f"""You are a career advisor. Analyze this profile (coursework, resume, and projects) and identify which job roles are most suitable and why.
Use their coursework (and grades if provided), resume (if provided), and projects (if provided) to give a combined, specific analysis.{interest_line}

Coursework data:
{courses_str}
"""
        if resume_slice:
            prompt += f"""
Resume (extracted text):
{resume_slice}
"""
        prompt += f"""
Projects they have done:
{projects_str}
"""
        prompt += """
Respond with ONLY a single JSON object (no other text) with these exact keys:
- "summary": 2-3 sentences summarizing their profile and why certain roles fit them. If they stated a job area interest, mention how their profile aligns with it.
- "suitable_roles": array of 3-5 objects, each with "role" (job title) and "reason" (1 sentence why this role fits). If the student stated a job interest, the FIRST role in this array MUST be the one that matches their interest (e.g. Python Developer if they said python developer). Then add other related roles.
- "strengths": array of 3-6 strength areas (e.g. "Data & Analytics", "Software Development").
- "suggested_roles": array of 4-8 job role titles that fit this profile.
- "skills_to_highlight": array of 5-10 skills they can claim on resume/LinkedIn (from courses, resume, and projects).
- "recommendations": array of 2-4 short recommendations (e.g. "Highlight X in applications", "Consider adding a course in Y").
- "areas_to_improve": array of 2-5 specific areas or skills they should improve to be stronger for their target role/interest (e.g. "Deep learning frameworks", "System design", "Cloud certifications"). Be concrete and actionable.

Use only the keys above. Be specific and actionable. suitable_roles must be an array of objects with "role" and "reason"."""
        try:
            import re
            response = await self.generate_response(prompt, max_tokens=1200)
            response = response.strip()
            match = re.search(r'\{[\s\S]*\}', response)
            if match:
                data = json.loads(match.group())
                suitable = data.get("suitable_roles") or []
                if not isinstance(suitable, list):
                    suitable = []
                suitable = [
                    {"role": str(s.get("role", "")).strip(), "reason": str(s.get("reason", "")).strip()}
                    for s in suitable
                    if isinstance(s, dict) and s.get("role")
                ][:5]
                if job_area_interest and job_area_interest.strip() and suitable:
                    interest_lower = job_area_interest.strip().lower()
                    match_idx = next(
                        (i for i, s in enumerate(suitable) if interest_lower in s["role"].lower()),
                        None,
                    )
                    if match_idx is not None and match_idx > 0:
                        suitable = [suitable[match_idx]] + [s for i, s in enumerate(suitable) if i != match_idx]
                areas = data.get("areas_to_improve") or []
                if not isinstance(areas, list):
                    areas = []
                areas = [str(x).strip() for x in areas if x][:5]
                return {
                    "summary": data.get("summary", ""),
                    "suitable_roles": suitable,
                    "strengths": data.get("strengths") or [],
                    "suggested_roles": data.get("suggested_roles") or [],
                    "skills_to_highlight": data.get("skills_to_highlight") or [],
                    "recommendations": data.get("recommendations") or [],
                    "areas_to_improve": areas,
                }
        except Exception:
            pass
        return {
            "summary": "Analysis could not be generated.",
            "suitable_roles": [],
            "strengths": [],
            "suggested_roles": [],
            "skills_to_highlight": [],
            "recommendations": [],
            "areas_to_improve": [],
        }

    async def extract_profile(
        self,
        resume_text: Optional[str] = None,
        course_grades: Optional[list] = None,
        coursework_raw_text: Optional[str] = None,
        projects: Optional[list] = None,
    ) -> dict:
        """
        Extract profile (name, academic title, skills, courses with term and tags) from resume, coursework, and projects.
        Returns profile data for dashboard display.
        """
        has_resume = bool(resume_text and resume_text.strip())
        has_courses = bool(course_grades)
        has_projects = bool(projects and len(projects) > 0)
        if not has_resume and not has_courses and not has_projects:
            return {
                "name": None,
                "academic_title": None,
                "technical_skills": [],
                "soft_skills": [],
                "courses": [],
                "profile_projects": [],
            }
        import json
        courses_str = json.dumps(course_grades[:40], indent=2) if course_grades else "[]"
        coursework_text = (coursework_raw_text or "")[:6000]
        resume_slice = (resume_text[:6000].strip()) if resume_text and resume_text.strip() else ""
        projects_str = "\n".join(f"- {p}" for p in (projects[:30] or [])) if projects else "(none)"
        prompt = """You are extracting a student's profile for a dashboard. Based on the resume, coursework, and projects provided, extract:
1. Full name (from resume - typically at top)
2. Academic title (e.g. "Computer Science • Junior" or "Data Science • Senior" - degree/major and year from resume or coursework)
3. Technical skills with proficiency 50-95: PRIMARY SOURCE is the RESUME. Extract skills explicitly listed (programming languages, tools, frameworks). Assign proficiency based on years of experience, project depth, or how prominently each skill appears. Supplement with coursework/projects only if resume lacks detail.
4. Soft skills with proficiency 50-95: PRIMARY SOURCE is the RESUME. Extract soft skills mentioned (leadership, communication, teamwork, problem solving). Assign proficiency based on evidence (e.g. "led team" -> Leadership 85). Supplement with projects if resume lacks detail.
5. courses: array of objects for each course in the coursework data. Each object has:
   - "title": full course name
   - "term": semester (e.g. "Fall 2025", "Spring 2025") - infer from coursework transcript text if present, else use "—"
   - "grade": letter grade from the data
   - "tags": 2-4 skill/keyword tags inferred from the course (e.g. "Data Structures" -> ["Algorithms", "Problem Solving", "Python"])

6. profile_projects: array of project objects. Use BOTH sources:
   a) PROJECT DOCUMENTS (uploaded files): Each uploaded project file MUST produce at least one entry. Parse title, description, technologies, date from content. If content says "[Content could not be extracted... infer from the filename]", use the filename to create a title and a brief generic description (e.g. "Presentation" or "Project document").
   b) RESUME: Include ONLY ACADEMIC projects (e.g. course projects, capstone, thesis, class assignments, university/campus projects). EXCLUDE work experience, internships, or professional projects.
   For each project: "title", "description" (1-2 sentences), "technologies" (3-5 items or empty if unknown), "date" (Mon YYYY or "—"). Avoid duplicates.

Return ONLY a JSON object with these exact keys:
- "name": string or null
- "academic_title": string or null
- "technical_skills": array of {"name": string, "percent": number 50-95}
- "soft_skills": array of {"name": string, "percent": number 50-95}
- "courses": array of {"title": string, "term": string, "grade": string, "tags": array of strings}
- "profile_projects": array of {"title": string, "description": string, "technologies": array of strings, "date": string}

Limit technical_skills to 6-8. Limit soft_skills to 3-5. Include all courses from the coursework data. Include all projects from the resume and project documents.
"""
        if resume_slice:
            prompt += f"\nResume:\n{resume_slice}\n"
        prompt += f"\nCoursework (parsed):\n{courses_str}\n"
        if coursework_text:
            prompt += f"\nCoursework (raw transcript excerpt for term/semester context):\n{coursework_text}\n"
        prompt += f"\nProjects:\n{projects_str}\n"
        prompt += "\nReturn only the JSON object, no other text."
        try:
            import re
            response = await self.generate_response(prompt, max_tokens=2000)
            response = response.strip()
            match = re.search(r'\{[\s\S]*\}', response)
            if match:
                data = json.loads(match.group())
                tech = data.get("technical_skills") or []
                tech = [
                    {"name": str(s.get("name", "")).strip(), "percent": int(s.get("percent", 70))}
                    for s in tech
                    if isinstance(s, dict) and s.get("name")
                ][:10]
                soft = data.get("soft_skills") or []
                soft = [
                    {"name": str(s.get("name", "")).strip(), "percent": int(s.get("percent", 70))}
                    for s in soft
                    if isinstance(s, dict) and s.get("name")
                ][:6]
                raw_courses = data.get("courses") or []
                courses = []
                for c in raw_courses[:30]:
                    if isinstance(c, dict) and c.get("title"):
                        tags = c.get("tags") or []
                        if not isinstance(tags, list):
                            tags = []
                        tags = [str(t).strip() for t in tags[:5] if t]
                        courses.append({
                            "title": str(c.get("title", "")).strip(),
                            "term": str(c.get("term", "—")).strip() or "—",
                            "grade": str(c.get("grade", "—")).strip() or "—",
                            "tags": tags,
                        })
                # If LLM did not return courses, build from course_grades
                if not courses and course_grades:
                    for cg in course_grades[:30]:
                        c = cg if isinstance(cg, dict) else {}
                        course_name = (c.get("course") or "").strip()
                        if course_name:
                            courses.append({
                                "title": course_name,
                                "term": "—",
                                "grade": str(c.get("grade") or "—").strip() or "—",
                                "tags": [],
                            })
                raw_projects = data.get("profile_projects") or data.get("projects") or []
                profile_projects = []
                for p in raw_projects[:20]:
                    if isinstance(p, dict) and p.get("title"):
                        techs = p.get("technologies") or p.get("technologies_used") or []
                        if not isinstance(techs, list):
                            techs = []
                        techs = [str(t).strip() for t in techs[:6] if t]
                        profile_projects.append({
                            "title": str(p.get("title", "")).strip(),
                            "description": str(p.get("description", "")).strip() or "—",
                            "technologies": techs,
                            "date": str(p.get("date", "—")).strip() or "—",
                        })
                return {
                    "name": (data.get("name") or "").strip() or None,
                    "academic_title": (data.get("academic_title") or "").strip() or None,
                    "technical_skills": tech,
                    "soft_skills": soft,
                    "courses": courses,
                    "profile_projects": profile_projects,
                }
        except Exception:
            pass
        # Fallback: build courses from course_grades only
        courses = []
        if course_grades:
            for cg in course_grades[:30]:
                c = cg if isinstance(cg, dict) else {}
                course_name = (c.get("course") or "").strip()
                if course_name:
                    courses.append({
                        "title": course_name,
                        "term": "—",
                        "grade": str(c.get("grade") or "—").strip() or "—",
                        "tags": [],
                    })
        return {
            "name": None,
            "academic_title": None,
            "technical_skills": [],
            "soft_skills": [],
            "courses": courses,
            "profile_projects": [],
        }
