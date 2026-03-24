# StudentHub — Hệ Thống Quản Lý Sinh Viên

Dự án quản lý sinh viên được xây dựng với kiến trúc Backend-Frontend tách biệt, hỗ trợ quản lý lớp học và thống kê dữ liệu.

---

## Thông tin cá nhân
- **Họ và tên:** Trần Nhật Tiến
- **MSSV:** 23673681
- **Lớp:** KHDL19A
- **Trường:** Đại học Công nghiệp TP.HCM (IUH)

---

## Tech Stack & Tools
- **Tech Stack:** - Backend: FastAPI (Python), SQLAlchemy (ORM), SQLite (Database).
  - Frontend: React JS (Vite), Axios, React Router.
- **Tools sử dụng:** ChatGPT, Gemini, Claude.

---

## Log: Quá trình thực hiện

### Phần 1: Xây dựng nền tảng (MVP)
- **Thiết kế cơ sở dữ liệu:** Tạo bảng `Student` đơn giản với các trường ID, Name, Major, GPA.
- **Phát triển Backend:** Viết các API CRUD (Thêm, Xóa, Sửa, Liệt kê) cơ bản bằng FastAPI.
- **Xây dựng giao diện:** Thiết kế Form nhập liệu và Bảng hiển thị danh sách bằng React. Kết nối Frontend với Backend qua Axios.

### Phần 2: Thay đổi nghiệp vụ & Mở rộng chức năng
- **Cấu trúc lại Database:** Thêm bảng `Class` (Lớp học). Thiết lập quan hệ Khóa ngoại (Foreign Key) để mỗi sinh viên thuộc về một lớp.
- **Nâng cấp logic Backend:** - Tích hợp logic tự động tạo Lớp học mới khi người dùng nhập mã lớp chưa có trong hệ thống.
  - Xây dựng API Thống kê (`/students/stats`) sử dụng các hàm tính toán của SQLAlchemy.
  - Cập nhật API lấy danh sách có kèm tham số `name` để phục vụ chức năng tìm kiếm.
- **Nâng cấp giao diện:**
  - Cải tiến `StudentForm`: Cho phép nhập trực tiếp Mã lớp và Tên lớp.
  - Thêm Dashboard thống kê trực quan ở đầu trang.
  - Tích hợp thanh tìm kiếm thời gian thực.
  - Xây dựng chức năng **Export CSV** để xuất dữ liệu trực tiếp từ trình duyệt.

---

## Hướng dẫn khởi chạy

### 1. Sinh dữ liệu mẫu (Yêu cầu bắt buộc để chấm bài)
Trước khi chạy ứng dụng, hãy chạy file này để hệ thống có dữ liệu mẫu:
```bash
cd backend
python generate_data.py
```

### 2. Chạy Backend
```bash
python main.py
```

### 3. Chạy Frontend
```bash
cd frontend
npm install
npm run dev
```

---
