"""
Alumni network API endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel
from app.database.base import get_db
from app.database.models.alumni import Alumni, Mentorship, JobOpening, Event

router = APIRouter()


class AlumniMatchRequest(BaseModel):
    """Request model for alumni matching"""
    student_id: int
    target_role: Optional[str] = None
    skills: Optional[List[str]] = None


@router.get("/alumni")
async def list_alumni(
    skip: int = 0,
    limit: int = 100,
    mentorship_available: Optional[bool] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    List alumni with optional filters
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records
        mentorship_available: Filter by mentorship availability
        db: Database session
        
    Returns:
        List of alumni
    """
    try:
        from sqlalchemy import select
        query = select(Alumni)
        
        if mentorship_available is not None:
            query = query.where(Alumni.mentorship_availability == mentorship_available)
        
        result = await db.execute(query.offset(skip).limit(limit))
        alumni = result.scalars().all()
        return {"alumni": [{"id": a.id, "name": a.name, "email": a.email} for a in alumni]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/alumni/{alumni_id}")
async def get_alumni(alumni_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get alumni by ID
    
    Args:
        alumni_id: Alumni ID
        db: Database session
        
    Returns:
        Alumni data
    """
    try:
        alumni = await db.get(Alumni, alumni_id)
        if not alumni:
            raise HTTPException(status_code=404, detail="Alumni not found")
        return alumni
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/alumni/match")
async def match_alumni(request: AlumniMatchRequest, db: AsyncSession = Depends(get_db)):
    """
    Match students with relevant alumni
    
    Args:
        request: Matching request
        db: Database session
        
    Returns:
        List of matched alumni
    """
    try:
        from sqlalchemy import select
        query = select(Alumni).where(Alumni.mentorship_availability == True)
        
        if request.skills:
            # Filter by skills (simplified - can be enhanced with similarity)
            skills_filter = ",".join(request.skills)
            query = query.where(Alumni.skills.contains(skills_filter))
        
        result = await db.execute(query.limit(10))
        matched_alumni = result.scalars().all()
        
        return {
            "matches": [
                {
                    "alumni_id": a.id,
                    "name": a.name,
                    "current_job": a.current_job,
                    "company": a.company_name,
                    "industry": a.industry,
                    "skills": a.skills
                }
                for a in matched_alumni
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/alumni/{alumni_id}/mentorships")
async def get_mentorships(alumni_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get mentorships for an alumni
    
    Args:
        alumni_id: Alumni ID
        db: Database session
        
    Returns:
        List of mentorships
    """
    try:
        from sqlalchemy import select
        query = select(Mentorship).where(Mentorship.mentor_id == alumni_id)
        result = await db.execute(query)
        mentorships = result.scalars().all()
        return {"mentorships": [{"id": m.id, "student_id": m.student_id, "status": m.status} for m in mentorships]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/alumni/job-openings")
async def list_job_openings(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """
    List job openings posted by alumni
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records
        db: Database session
        
    Returns:
        List of job openings
    """
    try:
        from sqlalchemy import select
        query = select(JobOpening).where(JobOpening.is_active == True).offset(skip).limit(limit)
        result = await db.execute(query)
        jobs = result.scalars().all()
        return {"jobs": [{"id": j.id, "title": j.title, "company_name": j.company_name} for j in jobs]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
