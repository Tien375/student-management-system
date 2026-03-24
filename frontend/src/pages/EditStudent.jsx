/**
 * EditStudent.jsx
 * Page for editing an existing student.
 * The student_id is locked and comes from the URL param.
 */

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StudentForm from "../components/StudentForm";
import { fetchStudents, updateStudent } from "../api/students";

export default function EditStudent() {
  const { student_id }        = useParams();
  const navigate              = useNavigate();
  const [student, setStudent]  = useState(null);
  const [loading, setLoading]  = useState(true);
  const [notFound, setNotFound]= useState(false);
  const [serverError, setServerError] = useState("");

  // ── Load the student to prefill the form ───────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const res = await fetchStudents();
        const found = res.data.find((s) => s.student_id === student_id);
        if (!found) {
          setNotFound(true);
        } else {
          setStudent(found);
        }
      } catch {
        setServerError("Failed to load student data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [student_id]);

  // ── Submit updated data ─────────────────────────────────────────────────────
  async function handleSubmit(data) {
    setServerError("");
    try {
      // Bỏ student_id (vì đã khóa) và class_name (vì Backend chỉ cần lưu class_id vào bảng Sinh viên)
      const { student_id: _id, class_name: _cname, ...updateData } = data;
      
      await updateStudent(student_id, updateData);
      navigate("/", { state: { success: `Student "${student_id}" updated successfully!` } });
    } catch (err) {
      const detail = err.response?.data?.detail || "Failed to update student.";
      setServerError(detail);
    }
  }

  if (loading) return <div className="page loading-state">Loading…</div>;
  if (notFound)
    return (
      <div className="page">
        <div className="alert alert-error">
          Student "{student_id}" not found.{" "}
          <button className="btn-link" onClick={() => navigate("/")}>
            Go back
          </button>
        </div>
      </div>
    );

  return (
    <div className="page page--narrow">
      <div className="page-header">
        <div>
          <h1 className="page-title">Edit Student</h1>
          <p className="page-sub">Updating record for {student.name}</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate("/")}>
          ← Back
        </button>
      </div>

      {serverError && (
        <div className="alert alert-error">{serverError}</div>
      )}

      <div className="card">
        <StudentForm
          initialValues={{
            student_id: student.student_id,
            class_id: student.class_id || "",       // 👈 Đã thêm class_id
            class_name: student.class_name || "",   // 👈 Đã thêm class_name
            name: student.name,
            birth_year: String(student.birth_year),
            major: student.major,
            gpa: String(student.gpa),
          }}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          lockId={true}
        />
      </div>
    </div>
  );
}