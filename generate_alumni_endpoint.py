

class GenerateAlumniRequest(BaseModel):
    email: str


@router.post("/career/generate-alumni")
async def generate_alumni_endpoint(request: GenerateAlumniRequest, db: AsyncSession = Depends(get_db)):
    """Generate AI alumni profiles based on user's university and career interests."""
    email = (request.email or "").strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email required.")
    try:
        r = await db.execute(select(PathfinderUser).where(PathfinderUser.email == email))
        user = r.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        r = await db.execute(select(PathfinderUserProfile).where(PathfinderUserProfile.user_id == user.id))
        profile = r.scalar_one_or_none()

        r = await db.execute(select(PathfinderUserCareerInterest).where(PathfinderUserCareerInterest.user_id == user.id))
        interests = [i.interest for i in r.scalars().all()]

        academic_title = profile.academic_title if profile else ""
        technical_skills = profile.technical_skills if profile else []

        # Extract university name from academic_title (e.g. "Master of Science in CS • SFBU • 2024-2025")
        parts = academic_title.split("•")
        university = parts[1].strip() if len(parts) > 1 else parts[0].strip() if parts else "a university"
        if not university:
            university = "a university"

        alumni = await llm_service.generate_alumni(
            university=university,
            career_interests=interests,
            technical_skills=technical_skills,
        )
        return {"alumni": alumni}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
