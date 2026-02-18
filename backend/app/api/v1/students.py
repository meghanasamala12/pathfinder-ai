"""
Students API endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from pydantic import BaseModel
from app.database.base import get_db
from app.database.models.alumni import Student, Mentorship

router = APIRouter()


class MentorshipRequest(BaseModel):
    """Request model for mentorship"""
    student_id: int
    mentor_id: int
    notes: Optional[str] = None


@router.get("/students/{student_id}")
async def get_student(student_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get student by ID
    
    Args:
        student_id: Student ID
        db: Database session
        
    Returns:
        Student data
    """
    try:
        student = await db.get(Student, student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        return student
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/students/mentorship/request")
async def request_mentorship(
    request: MentorshipRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Request mentorship from an alumni
    
    Args:
        request: Mentorship request
        db: Database session
        
    Returns:
        Created mentorship
    """
    try:
        from sqlalchemy import select
        query = select(Mentorship).where(
            Mentorship.student_id == request.student_id,
            Mentorship.mentor_id == request.mentor_id
        )
        result = await db.execute(query)
        existing = result.scalar_one_or_none()
        
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Mentorship request already exists"
            )
        
        # Create new mentorship request
        mentorship = Mentorship(
            student_id=request.student_id,
            mentor_id=request.mentor_id,
            status="pending",
            notes=request.notes
        )
        
        db.add(mentorship)
        await db.commit()
        await db.refresh(mentorship)
        
        return mentorship
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/students/{student_id}/mentorships")
async def get_student_mentorships(
    student_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get mentorships for a student
    
    Args:
        student_id: Student ID
        db: Database session
        
    Returns:
        List of mentorships
    """
    try:
        from sqlalchemy import select
        query = select(Mentorship).where(Mentorship.student_id == student_id)
        result = await db.execute(query)
        mentorships = result.scalars().all()
        return {"mentorships": [{"id": m.id, "mentor_id": m.mentor_id, "status": m.status} for m in mentorships]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
