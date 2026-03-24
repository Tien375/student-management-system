import sqlite3
import random

def generate_mock_data():
    conn = sqlite3.connect('students.db')
    cursor = conn.cursor()

    # Tạo dữ liệu Lớp học
    classes = [
        ("C01", "Khoa học máy tính 1", "Nguyen Van A"),
        ("DS01", "Khoa học Dữ liệu 1", "Tran Thi B"),
        ("IS01", "Hệ thống thông tin 1", "Le Van C")
    ]
    
    cursor.executemany('''
        INSERT OR IGNORE INTO classes (class_id, class_name, advisor) 
        VALUES (?, ?, ?)
    ''', classes)

    # Tạo dữ liệu Sinh viên
    majors = ["Computer Science", "Data Science", "Information Systems", "Software Engineering"]
    students = []
    
    for i in range(1, 11):
        student_id = f"SV{i:03d}"
        class_id = random.choice(["C01", "DS01", "IS01"])
        name = f"Sinh Vien Test {i}"
        birth_year = random.randint(2002, 2005)
        major = random.choice(majors)
        gpa = round(random.uniform(2.0, 4.0), 2)
        
        students.append((student_id, class_id, name, birth_year, major, gpa))

    cursor.executemany('''
        INSERT OR IGNORE INTO students (student_id, class_id, name, birth_year, major, gpa) 
        VALUES (?, ?, ?, ?, ?, ?)
    ''', students)

    conn.commit()
    conn.close()
    print("Đã sinh dữ liệu mẫu thành công! Bạn có thể mở web lên để kiểm tra.")

if __name__ == "__main__":
    generate_mock_data()