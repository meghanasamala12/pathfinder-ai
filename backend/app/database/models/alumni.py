"""
Alumni database models
"""
from sqlalchemy import Column, Integer, String, Boolean, Text, Date, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base


class Alumni(Base):
    """Alumni profile model"""
    __tablename__ = "alumni"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    roll_no = Column(String(255), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    batch = Column(String(50))
    degree = Column(String(255))
    department = Column(String(255))
    
    # Extended fields
    contact_no = Column(String(20))
    date_of_birth = Column(Date)
    specialization = Column(String(255))
    current_job = Column(String(255))
    company_name = Column(String(255))
    industry = Column(String(255), index=True)
    experience = Column(String(50))
    skills = Column(Text)  # JSON array or comma-separated
    linkedin_profile = Column(String(500))
    github_profile = Column(String(500))
    mentorship_availability = Column(Boolean, default=True, index=True)
    area_of_interest = Column(Text)
    webinars_participation = Column(Boolean, default=True)
    current_city = Column(String(255))
    current_country = Column(String(255))
    
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    mentorships = relationship("Mentorship", back_populates="mentor")
    job_openings = relationship("JobOpening", back_populates="posted_by")
    events = relationship("Event", back_populates="hosted_by")


class Student(Base):
    """Student profile model"""
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    google_id = Column(String(255))
    avatar = Column(String(500))
    date_of_birth = Column(Date)
    contact_number = Column(String(20))
    address = Column(Text)
    roll_number = Column(String(255))
    batch = Column(String(50))
    degree = Column(String(255))
    department = Column(String(255))
    current_semester = Column(Integer)
    cgpa = Column(String(10))
    interests = Column(Text)  # JSON array
    skills = Column(Text)  # JSON array
    programming_languages = Column(Text)  # JSON array
    linkedin_profile = Column(String(500))
    github_profile = Column(String(500))
    personal_website = Column(String(500))
    certifications = Column(Text)  # JSON array
    internships_status = Column(String(50))
    internships_experience = Column(Text)
    
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    mentorships = relationship("Mentorship", back_populates="student")
    event_registrations = relationship("EventRegistration", back_populates="student")


class Mentorship(Base):
    """Mentorship relationship model"""
    __tablename__ = "mentorships"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    mentor_id = Column(Integer, ForeignKey("alumni.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="pending", index=True)  # pending, accepted, rejected, active, completed
    requested_at = Column(TIMESTAMP, server_default=func.now())
    accepted_at = Column(TIMESTAMP)
    notes = Column(Text)
    
    # Relationships
    student = relationship("Student", back_populates="mentorships")
    mentor = relationship("Alumni", back_populates="mentorships")
    tasks = relationship("Task", back_populates="mentorship")


class JobOpening(Base):
    """Job openings posted by alumni"""
    __tablename__ = "job_openings"
    
    id = Column(Integer, primary_key=True, index=True)
    posted_by_alumni_id = Column(Integer, ForeignKey("alumni.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    company_name = Column(String(255))
    description = Column(Text)
    required_skills = Column(Text)  # JSON array
    experience_required = Column(String(50))
    location = Column(String(255))
    job_type = Column(String(50))  # full-time, part-time, internship
    salary_range = Column(String(100))
    application_deadline = Column(Date)
    is_active = Column(Boolean, default=True, index=True)
    
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    posted_by = relationship("Alumni", back_populates="job_openings")


class Event(Base):
    """Events/webinars/seminars"""
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    event_type = Column(String(50))  # webinar, seminar, workshop
    hosted_by_alumni_id = Column(Integer, ForeignKey("alumni.id"))
    scheduled_at = Column(TIMESTAMP, index=True)
    duration_minutes = Column(Integer)
    meeting_link = Column(String(500))
    max_participants = Column(Integer)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    hosted_by = relationship("Alumni", back_populates="events")
    registrations = relationship("EventRegistration", back_populates="event")


class EventRegistration(Base):
    """Event registrations by students"""
    __tablename__ = "event_registrations"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    registered_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    event = relationship("Event", back_populates="registrations")
    student = relationship("Student", back_populates="event_registrations")


class Post(Base):
    """News feed posts"""
    __tablename__ = "posts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    user_type = Column(String(20))  # 'alumni' or 'admin'
    caption = Column(Text)
    photo1 = Column(String(500))
    photo2 = Column(String(500))
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    
    created_at = Column(TIMESTAMP, server_default=func.now(), index=True)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())


class Task(Base):
    """Mentorship tasks"""
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    mentorship_id = Column(Integer, ForeignKey("mentorships.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    assigned_by_alumni_id = Column(Integer, ForeignKey("alumni.id"))
    assigned_to_student_id = Column(Integer, ForeignKey("students.id"))
    due_date = Column(Date)
    status = Column(String(50), default="pending", index=True)  # pending, in_progress, completed, overdue
    completion_notes = Column(Text)
    completed_at = Column(TIMESTAMP)
    
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    mentorship = relationship("Mentorship", back_populates="tasks")
