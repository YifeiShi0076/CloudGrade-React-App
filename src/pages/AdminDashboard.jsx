import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import api from "../api/axiosConfig";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("user");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editRowData, setEditRowData] = useState({});

  // 登录验证
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userData");
    if (!token || !userData) {
      navigate("/login");
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    navigate("/login");
  };

  const tableNames = {
    user: "用户账号表（user_account）",
    student: "学生信息表（student_info）",
    course: "课程信息表（course_info）",
    grade: "成绩记录表（grade_record）"
  };

  // 获取表数据
  const fetchData = useCallback(
    async (tableName) => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/${tableName}/all`);
        setData(res.data);
      } catch (err) {
        console.error("获取数据失败:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);

  // 删除记录
  const handleDelete = async (id) => {
    if (!window.confirm("确认删除该记录？")) return;
    try {
      await api.delete(`/admin/delete/${activeTab}/${id}`);
      fetchData(activeTab);
    } catch (err) {
      console.error("删除失败:", err);
      alert("删除失败，请检查后端日志。");
    }
  };

  // 开始编辑
  const handleEdit = (row) => {
    setEditingId(row.id);
    setEditRowData({ ...row });
  };

  // 编辑中修改字段
  const handleEditChange = (key, value) => {
    setEditRowData((prev) => ({ ...prev, [key]: value }));
  };

  // 提交编辑完成
  const handleSaveEdit = async () => {
    try {
      await api.put(`/admin/update/${activeTab}/${editingId}`, editRowData);
      setEditingId(null);
      setEditRowData({});
      fetchData(activeTab);
    } catch (err) {
      console.error("更新失败:", err);
      alert("更新失败，请检查后端日志。");
    }
  };

  // ---------- 样式 ----------
  const layoutStyle = {
    display: "flex",
    gap: "24px",
    padding: "20px",
    backgroundColor: "#f0f2f5",
    minHeight: "90vh",
    borderRadius: "10px",
  };

  const sidebarStyle = {
    width: "220px",
    background: "white",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    padding: "20px",
    textAlign: "center",
  };

  const buttonStyle = (isActive) => ({
    display: "block",
    width: "100%",
    marginBottom: "12px",
    padding: "10px 12px",
    border: "none",
    borderRadius: "6px",
    background: isActive ? "#007bff" : "#e9ecef",
    color: isActive ? "#fff" : "#333",
    fontWeight: isActive ? "bold" : "normal",
    cursor: "pointer",
    transition: "all 0.2s ease",
  });

  const contentStyle = {
    flex: 1,
    background: "white",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    padding: "24px",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    border: "1px solid #dee2e6",
  };

  const thStyle = {
    padding: "12px",
    border: "1px solid #dee2e6",
    background: "#007bff",
    color: "white",
    textAlign: "center",
  };

  const tdStyle = {
    padding: "10px",
    border: "1px solid #dee2e6",
    textAlign: "center",
  };

  const actionButton = (bgColor) => ({
    padding: "6px 12px",
    backgroundColor: bgColor,
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "0.2s",
  });

  // ---------- 渲染 ----------
  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <div style={layoutStyle}>
        {/* 左侧菜单 */}
        <div style={sidebarStyle}>
          <h3 style={{ color: "#007bff", marginBottom: "20px" }}>数据表管理</h3>
          {Object.entries(tableNames).map(([key, name]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={buttonStyle(activeTab === key)}
            >
              {name.includes("用户") ? "👤" :
               name.includes("学生") ? "🎓" :
               name.includes("课程") ? "📘" : "📝"} {name.split("（")[0]}
            </button>
          ))}
        </div>

        {/* 右侧内容 */}
        <div style={contentStyle}>
          <h2 style={{ color: "#007bff", textAlign: "center", marginBottom: "20px" }}>
            当前表：{tableNames[activeTab] || ""}
          </h2>

          {loading ? (
            <p style={{ textAlign: "center" }}>⏳ 数据加载中...</p>
          ) : data.length === 0 ? (
            <p style={{ textAlign: "center", color: "gray" }}>暂无数据</p>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th key={key} style={thStyle}>{key}</th>
                  ))}
                  <th style={thStyle}>操作</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id}>
                    {Object.entries(row).map(([key, val]) => (
                      <td key={key} style={tdStyle}>
                        {editingId === row.id && key !== "id" ? (
                          <input
                            type="text"
                            value={editRowData[key] ?? ""}
                            onChange={(e) => handleEditChange(key, e.target.value)}
                            style={{ width: "90%" }}
                          />
                        ) : (
                          val ?? "-"
                        )}
                      </td>
                    ))}
                    <td style={tdStyle}>
                      {editingId === row.id ? (
                        <button
                          onClick={handleSaveEdit}
                          style={{ ...actionButton("#17a2b8") }}
                        >
                          完成编辑
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(row)}
                            style={{ ...actionButton("#28a745"), marginRight: "8px" }}
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDelete(row.id)}
                            style={actionButton("#dc3545")}
                          >
                            删除
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
