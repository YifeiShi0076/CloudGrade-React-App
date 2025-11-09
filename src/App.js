import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";

// 判断是否登录
const isLoggedIn = () => {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("userData");
  const loggedIn = !!(token && userData);
  console.log("检测登录状态：", loggedIn ? "✅ 已登录" : "❌ 未登录");
  return loggedIn;
};

// 获取用户角色
const getUserRole = () => {
  const userData = localStorage.getItem("userData");
  if (!userData) return null;
  try {
    return JSON.parse(userData).role;
  } catch {
    return null;
  }
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 学生控制台 */}
        <Route
          path="/dashboard/student"
          element={
            isLoggedIn() && getUserRole() === "STUDENT" ? (
              <StudentDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* 教师控制台 */}
        <Route
          path="/dashboard/teacher"
          element={
            isLoggedIn() && getUserRole() === "TEACHER" ? (
              <TeacherDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* 管理员控制台 */}
        <Route
          path="/dashboard/admin"
          element={
            isLoggedIn() && getUserRole() === "ADMIN" ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* 默认重定向 */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
