// src/components/DashboardLayout.jsx
import React from "react";

const DashboardLayout = ({ user, onLogout, children }) => {
  return (
    <div
      style={{
        display: "flex",
        padding: "30px",
        gap: "40px",
        justifyContent: "center",
        alignItems: "flex-start",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      {/* 左侧控制台信息区 */}
      <div
        style={{
          flex: "1",
          maxWidth: "280px",
          backgroundColor: "white",
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "20px",
          textAlign: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>🖥️ 控制台</h2>
        {user ? (
          <>
            <p style={{ margin: "10px 0" }}>
              <strong>👤 用户名：</strong>
              {user.username}
            </p>
            <p style={{ margin: "10px 0" }}>
              <strong>🎓 角色：</strong>
              {user.role}
            </p>
          </>
        ) : (
          <p>未登录</p>
        )}

        <button
          onClick={onLogout}
          style={{
            marginTop: "25px",
            padding: "10px 20px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#bb2d3b")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#dc3545")}
        >
          🚪 退出登录
        </button>
      </div>

      {/* 右侧功能区 */}
      <div
        style={{
          flex: "3",
          backgroundColor: "white",
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "30px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          textAlign: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
