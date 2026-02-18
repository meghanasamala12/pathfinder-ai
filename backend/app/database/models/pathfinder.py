"""PathFinder profile and jobs models"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from app.database.base import Base


class PathfinderUser(Base):
    __tablename__ = "pathfinder_users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255))
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())


class PathfinderUserProfile(Base):
    __tablename__ = "pathfinder_user_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("pathfinder_users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255))
    academic_title = Column(String(500))
    resume_text = Column(Text)
    technical_skills = Column(JSONB, default=[])
    soft_skills = Column(JSONB, default=[])
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())


class PathfinderUserDocument(Base):
    __tablename__ = "pathfinder_user_documents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("pathfinder_users.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(50), nullable=False)
    filename = Column(String(500), nullable=False)
    file_path = Column(String(1000))
    extracted_text = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())


class PathfinderUserCoursework(Base):
    __tablename__ = "pathfinder_user_coursework"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("pathfinder_users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    term = Column(String(100))
    grade = Column(String(50))
    tags = Column(JSONB, default=[])
    created_at = Column(TIMESTAMP, server_default=func.now())


class PathfinderUserProject(Base):
    __tablename__ = "pathfinder_user_projects"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("pathfinder_users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text)
    technologies = Column(JSONB, default=[])
    date = Column(String(100))
    created_at = Column(TIMESTAMP, server_default=func.now())


class PathfinderUserCareerInterest(Base):
    __tablename__ = "pathfinder_user_career_interests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("pathfinder_users.id", ondelete="CASCADE"), nullable=False)
    interest = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())


class PathfinderJob(Base):
    __tablename__ = "pathfinder_jobs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(500), nullable=False)
    company = Column(String(255))
    description = Column(Text)
    required_skills = Column(Text)
    location = Column(String(255))
    job_type = Column(String(100))
    industry = Column(String(255))
    salary = Column(String(255))
    created_at = Column(TIMESTAMP, server_default=func.now())
