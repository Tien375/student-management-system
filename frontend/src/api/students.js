/**
 * api/students.js
 * Centralized Axios calls for the Student API.
 */

import axios from "axios";

const BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/** Fetch all students */
export const fetchStudents = () => api.get("/students");

/** Create a new student */
export const createStudent = (data) => api.post("/students", data);

/** Update a student by ID */
export const updateStudent = (student_id, data) =>
  api.put(`/students/${student_id}`, data);

/** Delete a student by ID */
export const deleteStudent = (student_id) =>
  api.delete(`/students/${student_id}`);
