from typing import Optional
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func  # Thêm thư viện này để tính toán Thống kê

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

# ─── API cho LỚP HỌC (Classes) ────────────────────────────────────────────────

@app.get("/classes", response_model=list[schemas.ClassResponse], tags=["Classes"])
def get_all_classes(db: Session = Depends(get_db)):
    """Lấy danh sách tất cả các lớp."""
    return db.query(models.ClassModel).all()

@app.post("/classes", response_model=schemas.ClassResponse, status_code=201, tags=["Classes"])
def create_class(class_data: schemas.ClassCreate, db: Session = Depends(get_db)):
    """Tạo một lớp học mới."""
    existing = db.query(models.ClassModel).filter(models.ClassModel.class_id == class_data.class_id).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Class ID '{class_data.class_id}' already exists.")
    
    db_class = models.ClassModel(**class_data.model_dump())
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class


# ─── API cho SINH VIÊN (Students) ─────────────────────────────────────────────

@app.get("/students", response_model=list[schemas.StudentResponse], tags=["Students"])
def get_all_students(name: Optional[str] = None, db: Session = Depends(get_db)):
    """Lấy danh sách sinh viên. Có tích hợp tìm kiếm theo tên."""
    # Kết nối (join) bảng Student với bảng Class
    query = db.query(
        models.StudentModel.student_id,
        models.StudentModel.class_id,
        models.ClassModel.class_name, # Lấy thêm tên lớp
        models.StudentModel.name,
        models.StudentModel.birth_year,
        models.StudentModel.major,
        models.StudentModel.gpa
    ).outerjoin(models.ClassModel, models.StudentModel.class_id == models.ClassModel.class_id)

    if name:
        query = query.filter(models.StudentModel.name.ilike(f"%{name}%"))
    
    # Chuyển kết quả thô thành dạng danh sách Dictionary để khớp với Schema
    results = query.all()
    return [
        {
            "student_id": r.student_id,
            "class_id": r.class_id,
            "class_name": r.class_name, # Nhét tên lớp vào kết quả trả về
            "name": r.name,
            "birth_year": r.birth_year,
            "major": r.major,
            "gpa": r.gpa
        } for r in results
    ]


@app.get("/students/stats", tags=["Students"])
def get_student_stats(db: Session = Depends(get_db)):
    """Thống kê: Tổng số, GPA trung bình và số lượng theo ngành."""
    total_students = db.query(models.StudentModel).count()
    avg_gpa = db.query(func.avg(models.StudentModel.gpa)).scalar() or 0.0
    
    majors_count = db.query(
        models.StudentModel.major, 
        func.count(models.StudentModel.student_id)
    ).group_by(models.StudentModel.major).all()
    
    return {
        "total_students": total_students,
        "average_gpa": round(avg_gpa, 2),
        "by_major": [{"major": m[0], "count": m[1]} for m in majors_count]
    }


@app.post("/students", response_model=schemas.StudentResponse, status_code=201, tags=["Students"])
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    # 1. TỰ ĐỘNG TẠO LỚP nếu người dùng gõ lớp mới
    class_exists = db.query(models.ClassModel).filter(models.ClassModel.class_id == student.class_id).first()
    if not class_exists:
        new_class = models.ClassModel(
            class_id=student.class_id,
            class_name=student.class_name or "Chưa có tên",
            advisor="Chưa phân công"
        )
        db.add(new_class)
        db.commit()

    # 2. Kiểm tra sinh viên đã tồn tại chưa
    existing = db.query(models.StudentModel).filter(models.StudentModel.student_id == student.student_id).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Student ID '{student.student_id}' already exists.")

    # 3. Tạo sinh viên (loại bỏ class_name vì bảng Student chỉ nhận class_id)
    student_data = student.model_dump(exclude={"class_name"})
    db_student = models.StudentModel(**student_data)
    
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