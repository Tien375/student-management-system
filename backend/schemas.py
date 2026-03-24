from pydantic import BaseModel, field_validator

class StudentBase(BaseModel):
    """Shared fields used for both create and update."""
    name: str
    birth_year: int
    major: str
    gpa: float

    @field_validator("gpa")
    @classmethod
    def gpa_must_be_valid(cls, v):
        if not (0.0 <= v <= 4.0):
            raise ValueError("GPA must be between 0.0 and 4.0")
        return round(v, 2)

    @field_validator("birth_year")
    @classmethod
    def birth_year_must_be_valid(cls, v):
        if not (1900 <= v <= 2100):
            raise ValueError("Birth year must be between 1900 and 2100")
        return v

    @field_validator("name", "major")
    @classmethod
    def must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Field must not be empty")
        return v.strip()

class StudentCreate(StudentBase):
    """Schema for creating a new student — includes student_id."""
    student_id: str

    @field_validator("student_id")
    @classmethod
    def student_id_must_be_valid(cls, v):
        if not v or not v.strip():
            raise ValueError("Student ID must not be empty")
        return v.strip()

class StudentUpdate(StudentBase):
    """Schema for updating a student — student_id comes from the URL."""
    pass

class StudentResponse(StudentBase):
    """Schema returned to the client."""
    student_id: str

    class Config:
        from_attributes = True