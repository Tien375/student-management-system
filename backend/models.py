from sqlalchemy import Column, String, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class ClassModel(Base):
    """Database table for Classes."""
    __tablename__ = "classes"

    class_id = Column(String, primary_key=True, index=True)
    class_name = Column(String, nullable=False)
    advisor = Column(String, nullable=False)

    # Mối quan hệ: Một lớp có nhiều sinh viên
    students = relationship("StudentModel", back_populates="student_class")


class StudentModel(Base):
    """Database table definition for students."""
    __tablename__ = "students"

    student_id = Column(String, primary_key=True, index=True)
    
    # KHÓA NGOẠI (Foreign Key) liên kết với bảng classes
    class_id = Column(String, ForeignKey("classes.class_id"), nullable=False) 
    
    name       = Column(String, nullable=False)
    birth_year = Column(Integer, nullable=False)
    major      = Column(String, nullable=False)
    gpa        = Column(Float, nullable=False)

    # Mối quan hệ ngược lại: Sinh viên thuộc về một lớp
    student_class = relationship("ClassModel", back_populates="students")