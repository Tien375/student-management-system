from pydantic import BaseModel, field_validator

# ─── Schemas cho CLASS (Lớp học) ─────────────────────────────────────────────

class ClassBase(BaseModel):
    class_name: str
    advisor: str

    @field_validator("class_name", "advisor")
    @classmethod
    def must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Field must not be empty")
        return v.strip()

class ClassCreate(ClassBase):
    class_id: str

class ClassResponse(ClassBase):
    class_id: str
    class Config:
        from_attributes = True


# ─── Schemas cho STUDENT (Sinh viên) ─────────────────────────────────────────

class StudentBase(BaseModel):
    class_id: str  # Bắt buộc phải có mã lớp
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

    @field_validator("name", "major", "class_id")
    @classmethod
    def must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Field must not be empty")
        return v.strip()


class StudentCreate(StudentBase):
    student_id: str
    # 👇 THÊM DÒNG NÀY: Khai báo class_name (có thể có hoặc không) để nhận từ Frontend
    class_name: str | None = None 


class StudentUpdate(StudentBase):
    pass

class StudentResponse(StudentBase):
    student_id: str
    class_name: str | None = None 

    class Config:
        from_attributes = True