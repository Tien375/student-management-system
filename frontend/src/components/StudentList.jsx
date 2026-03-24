import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { deleteStudent } from "../api/students"; 

export default function StudentList() {
  const [students, setStudents] = useState([]);
  // State lưu trữ dữ liệu Thống kê (Yêu cầu 4)
  const [stats, setStats] = useState({ total_students: 0, average_gpa: 0, by_major: [] });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  // State lưu từ khóa tìm kiếm (Yêu cầu 3)
  const [searchTerm, setSearchTerm] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.success) {
      showMessage("success", location.state.success);
      window.history.replaceState({}, "");
    }
  }, []);

  // Gọi API lấy dữ liệu khi vừa mở trang
  useEffect(() => {
    loadStudents();
    loadStats();
  }, []);

  // ── YÊU CẦU 3: Lấy danh sách (Có hỗ trợ Tìm kiếm) ─────────────────────────
  async function loadStudents(query = "") {
    try {
      setLoading(true);
      // Nếu có chữ tìm kiếm thì nối thêm ?name=... vào URL
      const url = query 
        ? `http://localhost:8000/students?name=${encodeURIComponent(query)}` 
        : "http://localhost:8000/students";
      const res = await fetch(url);
      const data = await res.json();
      setStudents(data);
    } catch {
      showMessage("error", "Lỗi tải dữ liệu. Backend đã chạy chưa?");
    } finally {
      setLoading(false);
    }
  }

  // ── YÊU CẦU 4: Lấy dữ liệu Thống kê ───────────────────────────────────────
  async function loadStats() {
    try {
      const res = await fetch("http://localhost:8000/students/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Lỗi tải thống kê:", err);
    }
  }

  // Xử lý khi ấn nút Tìm kiếm
  function handleSearch(e) {
    e.preventDefault();
    loadStudents(searchTerm);
  }

  // Xử lý khi ấn nút Xóa Lọc
  function handleResetSearch() {
    setSearchTerm("");
    loadStudents("");
  }

  async function handleDelete(student_id) {
    if (!window.confirm(`Xóa sinh viên "${student_id}"?`)) return;
    try {
      await deleteStudent(student_id);
      setStudents((prev) => prev.filter((s) => s.student_id !== student_id));
      loadStats(); // Xóa xong thì load lại Dashboard thống kê
      showMessage("success", `Đã xóa sinh viên "${student_id}".`);
    } catch (err) {
      const detail = err?.response?.data?.detail || "Lỗi khi xóa.";
      showMessage("error", detail);
    }
  }

  // ── YÊU CẦU 5: Hàm xuất file CSV ──────────────────────────────────────────
  function exportToCSV() {
    if (students.length === 0) {
      alert("Không có dữ liệu để xuất!");
      return;
    }
    
    // Tạo tiêu đề cột
    const headers = ["Student ID", "Class ID", "Class Name", "Name", "Birth Year", "Major", "GPA"];
    
    // Tạo từng dòng dữ liệu
    const rows = students.map(s => [
      s.student_id, 
      s.class_id, 
      s.class_name || "Chưa có tên", 
      `"${s.name}"`, // Cho vào ngoặc kép để tránh lỗi nếu tên có chứa dấu phẩy
      s.birth_year, 
      `"${s.major}"`, 
      s.gpa.toFixed(2)
    ]);
    
    // Nối lại thành định dạng chuẩn CSV (Có uFEFF để hỗ trợ tiếng Việt UTF-8)
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    // Trình duyệt tự động tải file xuống
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "danh_sach_sinh_vien.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function showMessage(type, text) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  }

  function gpaBadgeClass(gpa) {
    if (gpa >= 3.5) return "badge badge-high";
    if (gpa >= 2.5) return "badge badge-mid";
    return "badge badge-low";
  }

  return (
    <div className="page">
      {/* ── HEADER VÀ NÚT EXPORT ── */}
      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <h1 className="page-title">Students</h1>
          <p className="page-sub">Quản lý danh sách sinh viên</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={exportToCSV} style={{ backgroundColor: '#28a745', color: 'white', borderColor: '#28a745' }}>
            📥 Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => navigate("/add")}>
            + Add Student
          </button>
        </div>
      </div>

      {/* ── DASHBOARD THỐNG KÊ ── */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1', padding: '15px', backgroundColor: '#f4f6f8', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#555' }}>Tổng Sinh Viên</h3>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.total_students}</p>
        </div>
        <div className="card" style={{ flex: '1', padding: '15px', backgroundColor: '#f4f6f8', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#555' }}>GPA Trung Bình</h3>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff' }}>{stats.average_gpa}</p>
        </div>
        <div className="card" style={{ flex: '2', padding: '15px', backgroundColor: '#f4f6f8' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#555' }}>Theo Ngành</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {stats.by_major.length > 0 ? stats.by_major.map((m, idx) => (
              <span key={idx} style={{ background: '#e2e8f0', padding: '5px 10px', borderRadius: '15px', fontSize: '0.9rem' }}>
                {m.major}: <b>{m.count}</b>
              </span>
            )) : <span style={{ color: '#888' }}>Chưa có dữ liệu</span>}
          </div>
        </div>
      </div>

      {/* ── THANH TÌM KIẾM ── */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Tìm kiếm sinh viên theo tên..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="field-input"
          style={{ flex: 1, padding: '10px' }}
        />
        <button type="submit" className="btn btn-primary">🔍 Search</button>
        {searchTerm && (
          <button type="button" className="btn btn-ghost" onClick={handleResetSearch}>
            Xóa Lọc
          </button>
        )}
      </form>

      {/* ── FLASH MESSAGE ── */}
      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {/* ── BẢNG DANH SÁCH ── */}
      {loading ? (
        <div className="loading-state">Loading students…</div>
      ) : students.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🎓</span>
          <p>Không tìm thấy sinh viên nào!</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Class</th>
                <th>Name</th>
                <th>Birth Year</th>
                <th>Major</th>
                <th>GPA</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.student_id}>
                  <td className="mono">{s.student_id}</td>
                  <td className="bold" style={{ color: "#007bff" }}>
                    {s.class_id} <br/> 
                    <span style={{ fontSize: "0.85em", color: "#666" }}>
                      ({s.class_name || "Chưa có tên"})
                    </span>
                  </td>
                  <td className="bold">{s.name}</td>
                  <td>{s.birth_year}</td>
                  <td>{s.major}</td>
                  <td>
                    <span className={gpaBadgeClass(s.gpa)}>
                      {s.gpa.toFixed(2)}
                    </span>
                  </td>
                  <td className="actions">
                    <button
                      className="btn btn-edit"
                      onClick={() => navigate(`/edit/${s.student_id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => handleDelete(s.student_id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}