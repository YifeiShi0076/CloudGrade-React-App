import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import axios from "axios";
import api from "../api/axiosConfig";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [grades, setGrades] = useState([]);
  const [queryAllowed, setQueryAllowed] = useState(true);
  const [queryMessage, setQueryMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userData");
    if (!token || !userData) {
      if (window.location.pathname !== "/login") navigate("/login");
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const checkQueryPeriod = useCallback(async () => {
    try {
      const res = await api.get("/queryPeriod/isOpen");
      if (res.data.open) {
        setQueryAllowed(true);
        setQueryMessage("");
        return true;
      } else {
        setQueryAllowed(false);
        setQueryMessage("当前不在成绩查询时间内，请联系教师！");
        return false;
      }
    } catch (err) {
      console.error("检查查询时段失败:", err);
      setQueryAllowed(false);
      setQueryMessage("无法获取查询时间状态，请稍后再试。");
      return false;
    }
  }, []);

  const fetchGrades = useCallback(async () => {
    if (!user) return;

    const canQuery = await checkQueryPeriod();
    if (!canQuery) {
      setGrades([]);
      return;
    }

    try {
      // ✅ 使用封装好的 api 实例，不再需要手动加 token 或写完整 URL
      const res = await api.get(`/grades/searchByUserId`, {
        params: { userId: user.id }, // ✅ axios 支持 params 参数自动拼接
      });

      setGrades(res.data);
    } catch (err) {
      console.error("获取成绩失败:", err);
      setQueryMessage("获取成绩失败：" + (err.response?.data?.message || "未知错误"));
    }
  }, [user, checkQueryPeriod]);
  
  useEffect(() => {
    if (activeTab === "grades" && user) fetchGrades();
  }, [activeTab, user, fetchGrades]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    navigate("/login");
  };

  const tabButtonStyle = (isActive) => ({
    marginRight: "10px",
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 500,
    backgroundColor: isActive ? "#007bff" : "#f0f0f0",
    color: isActive ? "#fff" : "#333",
    transition: "all 0.2s",
    boxShadow: isActive ? "0 2px 6px rgba(0,123,255,0.3)" : "none",
  });

  const panelStyle = {
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    border: "1px solid #e0e0e0",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
  };

  const thStyle = {
    backgroundColor: "#f8f9fa",
    padding: "10px",
    textAlign: "center",
    borderBottom: "2px solid #e0e0e0",
  };

  const tdStyle = {
    padding: "10px",
    textAlign: "center",
    borderBottom: "1px solid #e0e0e0",
  };

  const rowHoverStyle = {
    backgroundColor: "#f1f7ff",
  };

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      {/* 标签栏 */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setActiveTab("home")} style={tabButtonStyle(activeTab === "home")}>
          首页
        </button>
        <button onClick={() => setActiveTab("grades")} style={tabButtonStyle(activeTab === "grades")}>
          查询成绩
        </button>
      </div>

      {/* 标签页内容 */}
      <div style={panelStyle}>
        {activeTab === "home" && (
          <p style={{ fontSize: "18px", color: "#333", textAlign: "center" }}>
            欢迎来到学生控制台！
          </p>
        )}

        {activeTab === "grades" && (
          <div>
            {!queryAllowed ? (
              <p style={{ color: "red", fontWeight: "bold", textAlign: "center", fontSize: "16px" }}>
                {queryMessage}
              </p>
            ) : (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>学生ID</th>
                    <th style={thStyle}>学生姓名</th>
                    <th style={thStyle}>课程名称</th>
                    <th style={thStyle}>成绩</th>
                    <th style={thStyle}>学期</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.length > 0 ? (
                    grades.map((item, index) => (
                      <tr
                        key={item.id}
                        style={index % 2 === 0 ? {} : rowHoverStyle}
                      >
                        <td style={tdStyle}>{item.studentId}</td>
                        <td style={tdStyle}>{item.studentName}</td>
                        <td style={tdStyle}>{item.courseName}</td>
                        <td style={tdStyle}>{item.score}</td>
                        <td style={tdStyle}>{item.semester}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ ...tdStyle, textAlign: "center", color: "gray" }}>
                        暂无成绩
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
