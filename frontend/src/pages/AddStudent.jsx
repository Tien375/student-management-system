/**
 * AddStudent.jsx
 * Page for adding a new student.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentForm from "../components/StudentForm";
import { createStudent } from "../api/students";

export default function AddStudent() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  async function handleSubmit(data) {
    setServerError("");
    try {
      await createStudent(data);
      // Redirect to list with a success flag in state
      navigate("/", { state: { success: `Student "${data.student_id}" added successfully!` } });
    } catch (err) {
      const detail = err.response?.data?.detail || "Failed to add student.";
      setServerError(detail);
    }
  }

  return (
    <div className="page page--narrow">
      <div className="page-header">
        <div>
          <h1 className="page-title">Add Student</h1>
          <p className="page-sub">Fill in the details below</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate("/")}>
          ← Back
        </button>
      </div>

      {serverError && (
        <div className="alert alert-error">{serverError}</div>
      )}

      <div className="card">
        <StudentForm onSubmit={handleSubmit} submitLabel="Add Student" />
      </div>
    </div>
  );
}
