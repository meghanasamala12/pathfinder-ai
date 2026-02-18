"""
Resume analysis API endpoints
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import Optional
from pydantic import BaseModel
from app.services.resume.parser import ResumeParser
from app.services.llm.llm_service import LLMService
import os
import uuid
from pathlib import Path
from app.config import settings

try:
    from app.services.embeddings.embedding_service import EmbeddingService
    from app.services.resume.similarity_calculator import SimilarityCalculator
    _embedding_service = EmbeddingService()
    _similarity_calculator = SimilarityCalculator()
except Exception:
    _embedding_service = None
    _similarity_calculator = None

router = APIRouter()

# Initialize services
parser = ResumeParser()
llm_service = LLMService()


class ResumeAnalysisResponse(BaseModel):
    """Response model for resume analysis"""
    resume_id: str
    extracted_text: str
    skills_summary: Optional[str] = None
    embedding: Optional[list] = None


class GapAnalysisRequest(BaseModel):
    """Request model for gap analysis"""
    resume_id: str
    job_description: str


class GapAnalysisResponse(BaseModel):
    """Response model for gap analysis"""
    similarity_score: float
    gap_analysis: str
    missing_skills: Optional[list] = None


@router.post("/resume/upload", response_model=ResumeAnalysisResponse)
async def upload_resume(file: UploadFile = File(...)):
    """
    Upload and parse resume
    
    Args:
        file: Resume file (PDF)
        
    Returns:
        Resume analysis results
    """
    # Validate file type
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not supported. Allowed: {settings.ALLOWED_EXTENSIONS}"
        )
    
    # Generate unique ID
    resume_id = str(uuid.uuid4())
    
    # Save file
    file_path = settings.UPLOAD_DIR / f"{resume_id}{file_ext}"
    with open(file_path, "wb") as f:
        content = await file.read()
        if len(content) > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(status_code=400, detail="File too large")
        f.write(content)
    
    try:
        # Parse resume
        extracted_text = await parser.parse_resume(str(file_path))
        
        # Extract skills using LLM
        skills_summary = await llm_service.extract_skills(extracted_text)
        
        # Generate embedding (optional; skipped if embeddings unavailable)
        embedding = None
        if _embedding_service is not None:
            embedding = await _embedding_service.generate_embedding(extracted_text)
        
        return ResumeAnalysisResponse(
            resume_id=resume_id,
            extracted_text=extracted_text,
            skills_summary=skills_summary,
            embedding=embedding
        )
    except Exception as e:
        # Clean up file on error
        if file_path.exists():
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/resume/gap-analysis", response_model=GapAnalysisResponse)
async def analyze_gap(request: GapAnalysisRequest):
    """
    Analyze gap between resume and job description
    
    Args:
        request: Gap analysis request
        
    Returns:
        Gap analysis results
    """
    if _embedding_service is None or _similarity_calculator is None:
        raise HTTPException(
            status_code=503,
            detail="Gap analysis (embeddings) unavailable on this build. Use full requirements for full features."
        )
    try:
        # Load resume (in production, load from database)
        # For now, we'll need the resume text or embedding
        
        # Generate embeddings
        resume_embedding = await _embedding_service.generate_embedding(
            request.resume_id  # In production, load resume text from DB
        )
        jd_embedding = await _embedding_service.generate_embedding(request.job_description)
        
        # Calculate similarity
        similarity_score = await _similarity_calculator.calculate_similarity(
            resume_embedding,
            jd_embedding
        )
        
        # Generate gap analysis using LLM
        gap_analysis = await llm_service.analyze_gap(
            request.resume_id,  # In production, load resume text
            request.job_description
        )
        
        return GapAnalysisResponse(
            similarity_score=similarity_score,
            gap_analysis=gap_analysis,
            missing_skills=None  # Can be extracted from LLM response
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/resume/{resume_id}")
async def get_resume(resume_id: str):
    """
    Get resume analysis by ID
    
    Args:
        resume_id: Resume ID
        
    Returns:
        Resume analysis data
    """
    # In production, load from database
    raise HTTPException(status_code=501, detail="Not implemented yet")
