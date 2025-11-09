import React, { useState } from "react";
import { register } from "../api/auth";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(username, password, role);
      setMessage("✅ 注册成功，正在跳转登录页...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage("❌ 注册失败：" + (err.response?.data?.message || "未知错误"));
    }
  };

  // 样式定义
  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f0f2f5",
    flexDirection: "column",
    textAlign: "center",
  };

  const titleStyle = {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: "20px",
  };

  const formStyle = {
    padding: "40px",
    borderRadius: "10px",
    backgroundColor: "white",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    minWidth: "300px",
  };

  const inputStyle = {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px",
  };

  const selectStyle = {
    ...inputStyle,
    cursor: "pointer",
  };

  const buttonStyle = {
    padding: "10px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#007bff",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "bold",
  };

  const messageStyle = {
    fontSize: "14px",
    marginTop: "10px",
    color: message.startsWith("✅") ? "green" : "red",
  };

  const linkStyle = {
    color: "#007bff",
    textDecoration: "none",
  };

  return (
    <div style={containerStyle}>
      {/* 顶部欢迎标题 */}
      <h1 style={titleStyle}>欢迎注册云上成绩簿 CloudGrade！</h1>
      <form style={formStyle} onSubmit={handleRegister}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>注册</h2>
        <input
          style={inputStyle}
          placeholder="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          style={inputStyle}
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select
          style={selectStyle}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="STUDENT">学生</option>
          <option value="TEACHER">教师</option>
        </select>
        <button style={buttonStyle} type="submit">
          注册
        </button>
        {message && <p style={messageStyle}>{message}</p>}
        <p style={{ textAlign: "center", marginTop: "10px" }}>
          已有账号？ <a style={linkStyle} href="/login">登录</a>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;