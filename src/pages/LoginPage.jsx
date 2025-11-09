import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 根据用户角色跳转到对应控制台
  const redirectToDashboard = useCallback(
    (role) => {
      switch (role) {
        case "STUDENT":
          navigate("/dashboard/student");
          break;
        case "TEACHER":
          navigate("/dashboard/teacher");
          break;
        case "ADMIN":
          navigate("/dashboard/admin");
          break;
        default:
          navigate("/dashboard");
          break;
      }
    },
    [navigate]
  );

  // 页面加载时检查是否已登录
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userData");
    if (token && userData) {
      const user = JSON.parse(userData);
      redirectToDashboard(user.role);
    }
  }, [redirectToDashboard]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await login(username, password);
      // 保存 token 和用户信息
      localStorage.setItem("token", res.data.token);

      const userData = {
        id: res.data.id,
        username: res.data.username,
        role: res.data.role,
      };
      localStorage.setItem("userData", JSON.stringify(userData));

      // 在新标签页打开控制台页面
      window.open(window.location.origin + "/dashboard", "_blank");

      // 可选：当前标签页显示提示或跳转首页
      // navigate("/"); // 或者保留当前页
    } catch (err) {
      setError(
        "登录失败：" + (err.response?.data?.message || "无效的凭证")
      );
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

  const errorStyle = {
    color: "red",
    fontSize: "14px",
  };

  const linkStyle = {
    color: "#007bff",
    textDecoration: "none",
  };

  return (
    <div style={containerStyle}>
      {/* 顶部欢迎标题 */}
      <h1 style={titleStyle}>欢迎使用云上成绩簿 CloudGrade！</h1>
      <form style={formStyle} onSubmit={handleLogin}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>登录</h2>
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
        <button style={buttonStyle} type="submit">
          登录
        </button>
        {error && <p style={errorStyle}>{error}</p>}
        <p style={{ textAlign: "center", marginTop: "10px" }}>
          没有账号？ <a style={linkStyle} href="/register">注册</a>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;