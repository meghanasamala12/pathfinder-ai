"""
Career analytics service
Adapted from AI-Resume-Summarizer---Career-Navigator-main/src/career_analytics.py
"""
import pandas as pd
import re
from typing import Dict, List, Any, Optional
from collections import Counter
from pathlib import Path
from app.config import settings


class CareerAnalytics:
    """Career analytics and insights service"""
    
    def __init__(self, jobs_csv_path: Optional[str] = None):
        """
        Initialize career analytics with job data
        
        Args:
            jobs_csv_path: Path to jobs CSV file
        """
        self.jobs_csv_path = jobs_csv_path or settings.JOBS_CSV_PATH
        self.jobs_df = None
        
        if self.jobs_csv_path and Path(self.jobs_csv_path).exists():
            self.jobs_df = pd.read_csv(self.jobs_csv_path)
            self._preprocess_data()
    
    def _preprocess_data(self):
        """Preprocess job data for analytics"""
        if self.jobs_df is None:
            return
        
        # Clean salary data
        self.jobs_df['salary_clean'] = self.jobs_df.get('Job Salary', pd.Series()).apply(
            self._extract_salary
        )
        
        # Extract experience years
        self.jobs_df['experience_years'] = self.jobs_df.get(
            'Job Experience Required', pd.Series()
        ).apply(self._extract_experience)
        
        # Clean skills data
        self.jobs_df['skills_list'] = self.jobs_df.get('Key Skills', pd.Series()).apply(
            self._extract_skills
        )
    
    @staticmethod
    def _extract_salary(salary_str) -> Optional[float]:
        """Extract numeric salary (handle ranges too)"""
        if pd.isna(salary_str) or 'Not Disclosed' in str(salary_str):
            return None
        
        numbers = re.findall(r'[\d,]+', str(salary_str))
        if numbers:
            try:
                values = [int(num.replace(',', '')) for num in numbers]
                if len(values) >= 2:
                    return sum(values) / len(values)  # Average of range
                return float(values[0])
            except Exception:
                return None
        return None
    
    @staticmethod
    def _extract_experience(exp_str) -> Optional[int]:
        """Extract years of experience (handle ranges too)"""
        if pd.isna(exp_str):
            return None
        
        numbers = re.findall(r'\d+', str(exp_str))
        if numbers:
            values = list(map(int, numbers))
            if len(values) >= 2:
                return sum(values) // len(values)  # Average of range
            return values[0]
        return None
    
    @staticmethod
    def _extract_skills(skills_str) -> List[str]:
        """Extract skills list from skills string"""
        if pd.isna(skills_str):
            return []
        
        skills = re.split(r'[|,;]+', str(skills_str))
        return [skill.strip().lower() for skill in skills if skill.strip()]
    
    def get_salary_insights(
        self,
        user_skills: List[str],
        experience_level: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Get salary insights based on user skills and experience
        
        Args:
            user_skills: List of user skills
            experience_level: Years of experience
            
        Returns:
            Dictionary with salary statistics
        """
        if self.jobs_df is None:
            return {"message": "Job data not available"}
        
        # Filter relevant jobs
        relevant_jobs = self.jobs_df[
            self.jobs_df['skills_list'].apply(
                lambda skills: any(skill.lower() in str(skills).lower() for skill in user_skills)
            )
        ].copy()
        
        if experience_level:
            relevant_jobs = relevant_jobs[
                (relevant_jobs['experience_years'] >= experience_level - 2) &
                (relevant_jobs['experience_years'] <= experience_level + 2)
            ]
        
        salary_data = relevant_jobs['salary_clean'].dropna()
        
        if len(salary_data) == 0:
            return {"message": "No salary data available for your profile"}
        
        salary_stats = {
            'median': float(salary_data.median()),
            'mean': float(salary_data.mean()),
            'min': float(salary_data.min()),
            'max': float(salary_data.max()),
            'percentile_25': float(salary_data.quantile(0.25)),
            'percentile_75': float(salary_data.quantile(0.75)),
            'sample_size': len(salary_data)
        }
        
        return {
            'stats': salary_stats,
            'relevant_jobs_count': len(relevant_jobs)
        }
    
    def get_skill_demand_analysis(self, user_skills: List[str]) -> Dict[str, Any]:
        """
        Analyze demand for user skills in job market
        
        Args:
            user_skills: List of user skills
            
        Returns:
            Dictionary with skill demand analysis
        """
        if self.jobs_df is None:
            return {"message": "Job data not available"}
        
        # Collect all skills from job postings
        all_skills = []
        for skills_list in self.jobs_df['skills_list']:
            if isinstance(skills_list, list):
                all_skills.extend(skills_list)
        
        skill_counts = Counter(all_skills)
        
        # Calculate demand for user skills
        user_skill_demand = {}
        for skill in user_skills:
            skill_lower = skill.lower()
            demand = skill_counts.get(skill_lower, 0)
            user_skill_demand[skill] = demand
        
        # Get top market skills
        top_skills = dict(skill_counts.most_common(20))
        
        return {
            'user_skill_demand': user_skill_demand,
            'top_market_skills': top_skills
        }
    
    def get_industry_insights(self, user_skills: List[str]) -> Dict[str, Any]:
        """
        Get industry insights based on user skills
        
        Args:
            user_skills: List of user skills
            
        Returns:
            Dictionary with industry distribution
        """
        if self.jobs_df is None:
            return {"message": "Job data not available"}
        
        relevant_jobs = self.jobs_df[
            self.jobs_df['skills_list'].apply(
                lambda skills: any(skill.lower() in str(skills).lower() for skill in user_skills)
            )
        ]
        
        industry_counts = relevant_jobs.get('Industry', pd.Series()).value_counts().head(10)
        role_counts = relevant_jobs.get('Role Category', pd.Series()).value_counts().head(10)
        
        return {
            'industry_distribution': industry_counts.to_dict(),
            'role_distribution': role_counts.to_dict()
        }
    
    def get_career_progression_path(
        self,
        current_role: str,
        experience_level: int
    ) -> Dict[str, Any]:
        """
        Suggest career progression paths
        
        Args:
            current_role: Current job role
            experience_level: Years of experience
            
        Returns:
            Dictionary with progression data
        """
        if self.jobs_df is None:
            return {"message": "Job data not available"}
        
        similar_roles = self.jobs_df[
            self.jobs_df.get('Job Title', pd.Series()).str.contains(
                current_role, case=False, na=False
            )
        ]
        
        progression_data = {}
        for exp_range in ['0-2', '3-5', '6-10', '10+']:
            if exp_range == '0-2':
                jobs = similar_roles[similar_roles['experience_years'] <= 2]
            elif exp_range == '3-5':
                jobs = similar_roles[
                    (similar_roles['experience_years'] >= 3) &
                    (similar_roles['experience_years'] <= 5)
                ]
            elif exp_range == '6-10':
                jobs = similar_roles[
                    (similar_roles['experience_years'] >= 6) &
                    (similar_roles['experience_years'] <= 10)
                ]
            else:
                jobs = similar_roles[similar_roles['experience_years'] > 10]
            
            if len(jobs) > 0:
                common_titles = jobs.get('Job Title', pd.Series()).value_counts().head(5).to_dict()
                avg_salary = jobs['salary_clean'].mean() if jobs['salary_clean'].notna().any() else None
                
                all_skills = []
                for skills_list in jobs['skills_list']:
                    if isinstance(skills_list, list):
                        all_skills.extend(skills_list)
                top_skills = Counter(all_skills).most_common(10)
                
                progression_data[exp_range] = {
                    'common_titles': common_titles,
                    'avg_salary': float(avg_salary) if avg_salary else None,
                    'top_skills': top_skills
                }
        
        return progression_data
