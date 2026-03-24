import { useState } from "react";

const EMPTY_FORM = {
  student_id: "",
  class_id: "",     // Thêm ô nhập Mã Lớp
  class_name: "",   // Thêm ô nhập Tên Lớp
  name: "",
  birth_year: "",
  major: "",
  gpa: "",
};

// ── Hàm render ô Input bình thường ──────────────────────────────────────────
function Field({ label, name, type = "text", placeholder, disabled, value, error, onChange }) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`field-input ${error ? "field-input--error" : ""}`}
        step={name === "gpa" ? "0.01" : undefined}
        min={name === "gpa" ? "0" : name === "birth_year" ? "1900" : undefined}
        max={name === "gpa" ? "4" : name === "birth_year" ? "2100" : undefined}
      />
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export default function StudentForm({
  initialValues = EMPTY_FORM,
  onSubmit,
  submitLabel = "Submit",
  lockId = false,
}) {
  const [form, setForm] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const errs = {};
    if (!lockId && !form.student_id.trim()) errs.student_id = "Bắt buộc nhập Mã SV.";
    if (!form.class_id.trim()) errs.class_id = "Bắt buộc nhập Mã Lớp.";
    if (!form.class_name.trim()) errs.class_name = "Bắt buộc nhập Tên Lớp.";
    if (!form.name.trim()) errs.name = "Bắt buộc nhập Tên SV.";
    
    const year = parseInt(form.birth_year, 10);
    if (!form.birth_year || isNaN(year) || year < 1900 || year > 2100)
      errs.birth_year = "Năm sinh không hợp lệ (1900–2100).";

    if (!form.major.trim()) errs.major = "Bắt buộc nhập Chuyên ngành.";

    const gpa = parseFloat(form.gpa);
    if (form.gpa === "" || isNaN(gpa) || gpa < 0 || gpa > 4)
      errs.gpa = "GPA phải từ 0.0 đến 4.0.";

    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setBusy(true);
    try {
      await onSubmit({
        student_id: form.student_id.trim(),
        class_id: form.class_id.trim(),
        class_name: form.class_name.trim(), // Gửi cả tên lớp xuống API
        name: form.name.trim(),
        birth_year: parseInt(form.birth_year, 10),
        major: form.major.trim(),
        gpa: parseFloat(parseFloat(form.gpa).toFixed(2)),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="student-form" noValidate>
      <Field
        label="Student ID"
        name="student_id"
        placeholder="e.g. SV001"
        disabled={lockId}
        value={form.student_id}
        error={errors.student_id}
        onChange={handleChange}
      />
      
      {/* ── 2 Ô NHẬP LỚP BẰNG TAY (Thay thế cho Dropdown cũ) ── */}
      <Field 
        label="Class ID" 
        name="class_id" 
        placeholder="e.g. C01" 
        value={form.class_id} 
        error={errors.class_id} 
        onChange={handleChange} 
      />
      <Field 
        label="Class Name" 
        name="class_name" 
        placeholder="e.g. Khoa học máy tính 1" 
        value={form.class_name} 
        error={errors.class_name} 
        onChange={handleChange} 
      />

      <Field 
        label="Full Name" 
        name="name" 
        placeholder="e.g. Nguyen Van A" 
        value={form.name}
        error={errors.name}
        onChange={handleChange}
      />
      <Field
        label="Birth Year"
        name="birth_year"
        type="number"
        placeholder="e.g. 2003"
        value={form.birth_year}
        error={errors.birth_year}
        onChange={handleChange}
      />
      <Field
        label="Major"
        name="major"
        placeholder="e.g. Computer Science"
        value={form.major}
        error={errors.major}
        onChange={handleChange}
      />
      <Field
        label="GPA (0.0 – 4.0)"
        name="gpa"
        type="number"
        placeholder="e.g. 3.50"
        value={form.gpa}
        error={errors.gpa}
        onChange={handleChange}
      />

      <button type="submit" className="btn btn-primary btn-submit" disabled={busy}>
        {busy ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}