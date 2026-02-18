"""
RAG Engine service for job matching
Adapted from AI-Resume-Summarizer---Career-Navigator-main/src/rag_engine.py
"""
import chromadb
import pandas as pd
from typing import List, Dict, Any, Optional
from pathlib import Path
from sentence_transformers import SentenceTransformer
from app.config import settings
from app.services.llm.llm_service import LLMService


class RAGEngine:
    """RAG engine for job matching and career insights"""
    
    def __init__(self, data_sources: Optional[List[str]] = None):
        """
        Initialize RAG engine
        
        Args:
            data_sources: List of data source paths (CSV files)
        """
        self.data_sources = data_sources or []
        self.client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)
        self.collection = None
        self.encoder = SentenceTransformer(settings.EMBEDDING_MODEL)
        self.jobs_df = None
        self.llm_service = LLMService()
        
        self._initialize_vector_store()
    
    def _load_multiple_files(self) -> pd.DataFrame:
        """Load and combine multiple CSV files"""
        dataframes = []
        
        for file_path in self.data_sources:
            try:
                if file_path.endswith('.csv') and Path(file_path).exists():
                    df = pd.read_csv(file_path)
                    df['source_file'] = file_path
                    dataframes.append(df)
            except Exception as e:
                print(f"Error loading {file_path}: {e}")
        
        if not dataframes:
            return pd.DataFrame()  # Return empty DataFrame if no files
        
        return pd.concat(dataframes, ignore_index=True, sort=False)
    
    def _initialize_vector_store(self):
        """Initialize or load the vector store with job data"""
        try:
            # Try to get existing collection
            self.collection = self.client.get_collection(settings.VECTOR_DB_COLLECTION)
            print("Loaded existing job database")
        except:
            # Create new collection if it doesn't exist
            if self.data_sources or settings.JOBS_CSV_PATH:
                self._create_vector_store()
    
    def _create_vector_store(self):
        """Create vector store from data sources"""
        print("Creating new job database...")
        
        # Load jobs data
        if settings.JOBS_CSV_PATH and Path(settings.JOBS_CSV_PATH).exists():
            self.data_sources.append(settings.JOBS_CSV_PATH)
        
        self.jobs_df = self._load_multiple_files()
        
        if self.jobs_df.empty:
            print("No job data available. Vector store not created.")
            return
        
        # Create collection
        self.collection = self.client.create_collection(
            name=settings.VECTOR_DB_COLLECTION,
            metadata={"description": "Job listings with skills and requirements"}
        )
        
        # Process jobs in batches
        batch_size = settings.RAG_BATCH_SIZE
        for i in range(0, len(self.jobs_df), batch_size):
            batch = self.jobs_df.iloc[i:i+batch_size]
            
            documents = []
            metadatas = []
            ids = []
            
            for idx, row in batch.iterrows():
                # Create document text combining job info
                doc_text = f"""
                Job Title: {row.get('Job Title', 'N/A')}
                Key Skills: {row.get('Key Skills', 'N/A')}
                Experience Required: {row.get('Job Experience Required', 'N/A')}
                Role Category: {row.get('Role Category', 'N/A')}
                Functional Area: {row.get('Functional Area', 'N/A')}
                Industry: {row.get('Industry', 'N/A')}
                Salary: {row.get('Job Salary', 'N/A')}
                """
                
                documents.append(doc_text.strip())
                metadatas.append({
                    'job_title': str(row.get('Job Title', 'N/A')),
                    'skills': str(row.get('Key Skills', 'N/A')),
                    'experience': str(row.get('Job Experience Required', 'N/A')),
                    'role_category': str(row.get('Role Category', 'N/A')),
                    'industry': str(row.get('Industry', 'N/A')),
                    'salary': str(row.get('Job Salary', 'N/A'))
                })
                ids.append(f"job_{idx}")
            
            # Add to collection
            self.collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
            
            print(f"Processed {min(i+batch_size, len(self.jobs_df))}/{len(self.jobs_df)} jobs")
        
        print("Job database created successfully!")
    
    def search_relevant_jobs(self, query: str, n_results: int = 10) -> List[Dict]:
        """
        Search for relevant jobs based on query
        
        Args:
            query: Search query
            n_results: Number of results to return
            
        Returns:
            List of relevant jobs
        """
        if self.collection is None:
            return []
        
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results
            )
            
            relevant_jobs = []
            for i, metadata in enumerate(results['metadatas'][0]):
                relevant_jobs.append({
                    'job_title': metadata['job_title'],
                    'skills': metadata['skills'],
                    'experience': metadata['experience'],
                    'role_category': metadata['role_category'],
                    'industry': metadata['industry'],
                    'salary': metadata['salary'],
                    'relevance_score': 1 - results['distances'][0][i]  # Convert distance to similarity
                })
            
            return relevant_jobs
        except Exception as e:
            print(f"Error searching jobs: {e}")
            return []
    
    async def get_career_insights(
        self,
        resume_text: str,
        user_query: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate comprehensive career insights using RAG
        
        Args:
            resume_text: Resume text content
            user_query: Optional user query
            
        Returns:
            Dictionary with career insights
        """
        # Extract key skills and experience from resume
        skills_analysis = await self.llm_service.extract_skills(resume_text)
        
        # Search for relevant jobs
        search_query = f"{skills_analysis} {user_query or ''}"
        relevant_jobs = self.search_relevant_jobs(search_query, n_results=15)
        
        # Generate insights based on relevant jobs
        jobs_context = "\n".join([
            f"Job: {job['job_title']} | Skills: {job['skills']} | Experience: {job['experience']} | Industry: {job['industry']}"
            for job in relevant_jobs[:10]
        ])
        
        insights_prompt = f"""
        Based on the resume analysis and current job market data, provide comprehensive career insights:
        
        Resume Analysis: {skills_analysis}
        
        Relevant Job Market Data:
        {jobs_context}
        
        User Query: {user_query or "General career guidance"}
        
        Provide insights on:
        1. Career progression opportunities
        2. Skill gaps and recommendations
        3. Salary expectations
        4. Industry trends
        5. Next career steps
        
        Be specific and actionable.
        """
        
        insights = await self.llm_service.generate_response(
            insights_prompt,
            max_tokens=800
        )
        
        return {
            'insights': insights,
            'relevant_jobs': relevant_jobs,
            'skills_analysis': skills_analysis
        }
