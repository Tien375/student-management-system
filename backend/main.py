from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
from database import engine, get_db

# Tạo các bảng trong database nếu chưa có
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Student Management API", version="1.0.0")

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/students", response_model=list[schemas.StudentResponse], tags=["Students"])
def get_all_students(db: Session = Depends(get_db)):
    return db.query(models.StudentModel).all()


@app.post("/students", response_model=schemas.StudentResponse, status_code=201, tags=["Students"])
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    existing = db.query(models.StudentModel).filter(models.StudentModel.student_id == student.student_id).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Student ID '{student.student_id}' already exists.")

    db_student = models.StudentModel(**student.model_dump())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student


@app.put("/students/{student_id}", response_model=schemas.StudentResponse, tags=["Students"])
def update_student(student_id: str, student: schemas.StudentUpdate, db: Session = Depends(get_db)):
    db_student = db.query(models.StudentModel).filter(models.StudentModel.student_id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail=f"Student with ID '{student_id}' not found.")

    for field, value in student.model_dump().items():
        setattr(db_student, field, value)

    db.commit()
    db.refresh(db_student)
    return db_student


@app.delete("/students/{student_id}", status_code=204, tags=["Students"])
def delete_student(student_id: str, db: Session = Depends(get_db)):
    db_student = db.query(models.StudentModel).filter(models.StudentModel.student_id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail=f"Student with ID '{student_id}' not found.")

    db.delete(db_student)
    db.commit()
    return None