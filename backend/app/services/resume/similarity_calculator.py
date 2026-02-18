"""
Similarity calculator for gap analysis
Adapted from resume-analyzer-main/src/resume_scorer.py
"""
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Tuple
from app.services.embeddings.embedding_service import EmbeddingService


class SimilarityCalculator:
    """
    Calculate similarity between resumes and job descriptions
    """
    
    def __init__(self):
        self.embedding_service = EmbeddingService()
    
    async def calculate_similarity(
        self,
        resume_embedding: List[float],
        jd_embedding: List[float]
    ) -> float:
        """
        Calculate cosine similarity between resume and job description embeddings
        
        Args:
            resume_embedding: Resume embedding vector
            jd_embedding: Job description embedding vector
            
        Returns:
            Similarity score (0.0 to 1.0)
        """
        try:
            # Reshape to 2D arrays for sklearn
            resume_array = np.array(resume_embedding).reshape(1, -1)
            jd_array = np.array(jd_embedding).reshape(1, -1)
            
            # Calculate cosine similarity
            similarity = cosine_similarity(resume_array, jd_array)[0][0]
            
            # Ensure value is between 0 and 1
            return max(0.0, min(1.0, float(similarity)))
        except Exception as e:
            raise Exception(f"Error calculating similarity: {str(e)}")
    
    async def calculate_similarity_batch(
        self,
        resume_embedding: List[float],
        jd_embeddings: Dict[str, List[float]]
    ) -> Dict[str, float]:
        """
        Calculate similarity between one resume and multiple job descriptions
        
        Args:
            resume_embedding: Resume embedding vector
            jd_embeddings: Dictionary of job description embeddings
            
        Returns:
            Dictionary mapping JD IDs to similarity scores
        """
        results = {}
        resume_array = np.array(resume_embedding).reshape(1, -1)
        
        for jd_id, jd_embedding in jd_embeddings.items():
            try:
                jd_array = np.array(jd_embedding).reshape(1, -1)
                similarity = cosine_similarity(resume_array, jd_array)[0][0]
                results[jd_id] = max(0.0, min(1.0, float(similarity)))
            except Exception as e:
                results[jd_id] = 0.0
        
        return results
    
    async def get_top_matches(
        self,
        resume_embedding: List[float],
        jd_embeddings: Dict[str, List[float]],
        top_k: int = 5
    ) -> List[Tuple[str, float]]:
        """
        Get top K matching job descriptions
        
        Args:
            resume_embedding: Resume embedding vector
            jd_embeddings: Dictionary of job description embeddings
            top_k: Number of top matches to return
            
        Returns:
            List of tuples (jd_id, similarity_score) sorted by score
        """
        similarities = await self.calculate_similarity_batch(resume_embedding, jd_embeddings)
        
        # Sort by similarity score (descending)
        sorted_matches = sorted(
            similarities.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        return sorted_matches[:top_k]
