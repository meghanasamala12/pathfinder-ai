"""
Embedding service - generates embeddings for text
Adapted from resume-analyzer-main/src/embedding_model.py
Uses sentence_transformers by default to avoid LangChain/Pydantic compatibility issues.
"""
from typing import List, Dict, Optional
import pickle
from pathlib import Path
from sentence_transformers import SentenceTransformer
from app.config import settings


class EmbeddingService:
    """
    Service for generating embeddings using multiple providers.
    Default: sentence_transformers (no external API, no LangChain).
    """
    
    def __init__(self, provider: str = "sentence_transformers"):
        """
        Initialize embedding service
        
        Args:
            provider: 'vertexai', 'sentence_transformers', or 'openai'
        """
        self.provider = provider
        self._vertexai_model = None
        
        if provider == "vertexai" and getattr(settings, "GOOGLE_API_KEY", None):
            # Lazy import to avoid LangChain/Pydantic conflicts at startup
            try:
                from langchain_google_vertexai import VertexAIEmbeddings
                self.embedding_model = VertexAIEmbeddings(
                    model_name=settings.EMBEDDING_MODEL_NAME
                )
            except Exception:
                self.embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL)
                self.provider = "sentence_transformers"
        else:
            self.embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL)
    
    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a list of texts
        
        Args:
            texts: List of text strings
            
        Returns:
            List of embedding vectors
        """
        if self.provider == "vertexai":
            return await self._generate_vertexai_embeddings(texts)
        else:
            return self._generate_sentence_transformer_embeddings(texts)
    
    async def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a single text
        
        Args:
            text: Text string
            
        Returns:
            Embedding vector
        """
        embeddings = await self.generate_embeddings([text])
        return embeddings[0]
    
    async def _generate_vertexai_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings using VertexAI"""
        try:
            embeddings = self.embedding_model.embed_documents(texts)
            return embeddings
        except Exception as e:
            # Fallback to sentence transformers
            return self._generate_sentence_transformer_embeddings(texts)
    
    def _generate_sentence_transformer_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings using Sentence Transformers"""
        embeddings = self.embedding_model.encode(texts, show_progress_bar=False)
        return embeddings.tolist()
    
    @staticmethod
    def save_embeddings(embeddings: Dict, file_path: str):
        """
        Save embeddings to disk
        
        Args:
            embeddings: Dictionary of embeddings
            file_path: Path to save file
        """
        with open(file_path, 'wb') as handle:
            pickle.dump(embeddings, handle, protocol=pickle.HIGHEST_PROTOCOL)
    
    @staticmethod
    def load_embeddings(file_path: str) -> Dict:
        """
        Load embeddings from disk
        
        Args:
            file_path: Path to embeddings file
            
        Returns:
            Dictionary of embeddings
        """
        with open(file_path, 'rb') as handle:
            return pickle.load(handle)
