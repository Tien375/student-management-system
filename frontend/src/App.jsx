/**
 * App.jsx
 * Root component. Sets up React Router and the global layout.
 */

import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import StudentList  from "./components/StudentList";
import AddStudent   from "./pages/AddStudent";
import EditStudent  from "./pages/EditStudent";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      {/* ── Top navigation bar ──────────────────────────────────────────── */}
      <nav className="navbar">
        <div className="navbar-inner">
          <span className="navbar-brand">🎓 StudentHub</span>
          <div className="navbar-links">
            <NavLink to="/"    className={({ isActive }) => isActive ? "nav-link nav-link--active" : "nav-link"} end>
              Students
            </NavLink>
            <NavLink to="/add" className={({ isActive }) => isActive ? "nav-link nav-link--active" : "nav-link"}>
              + Add
            </NavLink>
          </div>
        </div>
      </nav>

      {/* ── Page content ────────────────────────────────────────────────── */}
      <main className="main-content">
        <Routes>
          <Route path="/"              element={<StudentList />} />
          <Route path="/add"           element={<AddStudent />} />
          <Route path="/edit/:student_id" element={<EditStudent />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
