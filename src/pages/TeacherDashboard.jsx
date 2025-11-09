import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import api from "../api/axiosConfig";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");

  // 上传
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // 成绩编辑
  const [studentIdQuery, setStudentIdQuery] = useState("");
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 25;
  const totalPages = Math.ceil(records.length / recordsPerPage);

  // 查询时段
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [periodMessage, setPeriodMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userData");

    if (!token || !userData) {
      navigate("/login");
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    navigate("/login");
  };

  // 上传逻辑
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  // 成绩文件上传
  const handleUpload = async () => {
    if (!file) {
      setUploadMessage("请先选择一个文件！");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/grades/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadMessage("✅ 上传成功：" + (res.data.message || "文件已上传"));
    } catch (error) {
      setUploadMessage("❌ 上传失败：" + (error.response?.data?.message || "未知错误"));
    }
  };


  // 成绩查询与修改
  const handleSearch = async () => {
    if (!studentIdQuery.trim()) {
      alert("请输入学生ID再查询！");
      return;
    }
    try {
      const res = await api.get(`/grades/search?studentId=${studentIdQuery}`);
      setRecords(res.data);
      setCurrentPage(1);
    } catch (error) {
      alert("查询失败：" + (error.response?.data?.message || "未知错误"));
    }
  };


  const handleDelete = async (id) => {
    if (!window.confirm("确定要删除这条成绩记录吗？")) return;
    try {
      await api.delete(`/grades/delete/${id}`);
      // 删除成功后更新本地状态
      setRecords(records.filter((r) => r.id !== id));
    } catch (error) {
      alert("删除失败：" + (error.response?.data?.message || "未知错误"));
    }
  };

  // 成绩记录编辑
  const handleEdit = (record) => {
    setEditingId(record.id);
    setEditValues({ ...record });
  };

  const handleEditChange = (field, value) => setEditValues({ ...editValues, [field]: value });

  // 成绩记录修改
  const handleSave = async () => {
    try {
      await api.put(`/grades/update/${editValues.id}`, {
        score: editValues.score,
        semester: editValues.semester
      });

      // 本地状态更新
      setRecords(records.map((r) =>
        r.id === editValues.id ? { ...editValues } : r
      ));
      setEditingId(null);
    } catch (error) {
      alert("修改失败：" + (error.response?.data?.message || "未知错误"));
    }
  };

  const indexOfLast = currentPage * recordsPerPage;
  const currentRecords = records.slice(indexOfLast - recordsPerPage, indexOfLast);

  // 查询时段逻辑
  const fetchCurrentPeriod = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/queryPeriod/current`);

      const period = res.data?.data || res.data;
      setCurrentPeriod(period);
    } catch (error) {
      console.warn("未能获取查询时段：", error.response?.data || error.message);
      setCurrentPeriod(null);
    }
  };

  useEffect(() => {
    if (activeTab === "period") {
      fetchCurrentPeriod();
    }
  }, [activeTab]);

  const fromInputDateTime = (localValue) => {
    if (!localValue) return null;
    const d = new Date(localValue);
    return d.toISOString();
  };

  const handleSetPeriod = async () => {
    if (!editStart || !editEnd) {
      setPeriodMessage("请填写完整的开始与结束时间！");
      return;
    }

    if (editStart >= editEnd) {
      setPeriodMessage("查询结束时间必须大于等于开始时间！");
      return;
    }

    const startISO = new Date(editStart).toISOString().slice(0, 19);
    const endISO = new Date(editEnd).toISOString().slice(0, 19);

    try {
      const token = localStorage.getItem("token");
      const res = await api.post(`/queryPeriod/set`, {
        startDate: startISO,
        endDate: endISO,
      });
      if (res.data.success) {
        setPeriodMessage("✅ 查询时段设置成功！");
        await fetchCurrentPeriod();
        setEditStart("");
        setEditEnd("");
      } else {
        setPeriodMessage("❌ 设置失败：" + (res.data.message || "未知错误"));
      }
    } catch (error) {
      console.error("设置查询时段失败：", error);
      setPeriodMessage("❌ 设置失败：" + (error.response?.data?.message || "服务器错误"));
    }
  };

  // UI 渲染
  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      {/* 顶部标签栏 */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("upload")}
          style={tabButtonStyle(activeTab === "upload")}
        >
          批量成绩上传
        </button>
        <button
          onClick={() => setActiveTab("edit")}
          style={tabButtonStyle(activeTab === "edit")}
        >
          修改成绩信息
        </button>
        <button
          onClick={() => setActiveTab("period")}
          style={tabButtonStyle(activeTab === "period")}
        >
          设置查询时段
        </button>
      </div>

      {/* 面板 */}
      <div style={panelStyle}>
        {activeTab === "upload" && (
          <div>
            <h3 style={sectionTitleStyle}>成绩记录文件上传</h3>
            <div
              style={{
                border: "2px dashed #007bff",
                padding: "20px",
                borderRadius: "8px",
                backgroundColor: dragOver ? "#e9f7fe" : "#f8f9fa",
                textAlign: "center",
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {file ? (
                <p>已选择文件：{file.name}</p>
              ) : (
                <p style={{ color: "#007bff", fontWeight: "bold" }}>
                  拖动文件到此处或点击下方按钮上传（仅支持 .csv 和 .xlsx 格式）
                </p>
              )}
            </div>
            <input type="file" accept=".csv,.xlsx" onChange={handleFileChange} />
            <button onClick={handleUpload} style={btnPrimary}>
              上传
            </button>
            {uploadMessage && <p>{uploadMessage}</p>}
          </div>
        )}

        {activeTab === "edit" && (
          <div>
            <h3 style={sectionTitleStyle}>修改成绩信息</h3>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                type="text"
                placeholder="请输入学生ID（不是学号也不是用户ID）"
                value={studentIdQuery}
                onChange={(e) => setStudentIdQuery(e.target.value)}
                style={{ ...inputStyle, width: "300px" }}
              />
              <button onClick={handleSearch} style={btnPrimary}>
                查询
              </button>
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>学生ID</th>
                  <th style={thStyle}>学生姓名</th>
                  <th style={thStyle}>课程名称</th>
                  <th style={thStyle}>成绩</th>
                  <th style={thStyle}>学期</th>
                  <th style={thStyle}>操作</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={tdStyle}>
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  currentRecords.map((r) => (
                    <tr key={r.id}>
                      <td style={tdStyle}>{r.studentId}</td>
                      <td style={tdStyle}>{r.studentName}</td>
                      <td style={tdStyle}>{r.courseName}</td>
                      <td style={tdStyle}>
                        {editingId === r.id ? (
                          <input
                            value={editValues.score}
                            onChange={(e) => handleEditChange("score", e.target.value)}
                            style={{ ...inputStyle, width: "100px" }}
                          />
                        ) : (
                          r.score
                        )}
                      </td>
                      <td style={tdStyle}>
                        {editingId === r.id ? (
                          <input
                            value={editValues.semester}
                            onChange={(e) => handleEditChange("semester", e.target.value)}
                            style={{ ...inputStyle, width: "100px" }}
                          />
                        ) : (
                          r.semester
                        )}
                      </td>
                      <td style={tdStyle}>
                        {editingId === r.id ? (
                          <button onClick={handleSave} style={btnPrimary}>
                            保存
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(r)}
                              style={btnSecondary}
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleDelete(r.id)}
                              style={btnDanger}
                            >
                              删除
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "period" && (
          <div>
            <h3 style={sectionTitleStyle}>设置查询时段</h3>
            <p style={infoTextStyle}>
              学生只能在设置的时间范围内查询成绩
            </p>
            <div>
              <strong>当前有效查询时段：</strong>
              {currentPeriod && currentPeriod.startTime && currentPeriod.endTime ? (
                <p style={periodTextStyle}>
                  {new Date(currentPeriod.startTime).toLocaleString()} —{" "}
                  {new Date(currentPeriod.endTime).toLocaleString()}
                </p>
              ) : (
                <p style={noPeriodTextStyle}>当前暂未设置有效的查询时段</p>
              )}
            </div>

            <div style={{ marginTop: "20px" }}>
              <label>开始时间：</label>
              <input
                type="datetime-local"
                value={editStart}
                onChange={(e) => setEditStart(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ marginTop: "10px" }}>
              <label>结束时间：</label>
              <input
                type="datetime-local"
                value={editEnd}
                onChange={(e) => setEditEnd(e.target.value)}
                style={inputStyle}
              />
            </div>

            <button onClick={handleSetPeriod} style={{ ...btnPrimary, marginTop: "20px" }}>
              保存查询时段
            </button>

            {periodMessage && (
              <p
                style={{
                  marginTop: "10px",
                  color: periodMessage.includes("失败") ? "red" : "green",
                }}
              >
                {periodMessage}
              </p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

const tabButtonStyle = (isActive) => ({
  padding: "10px 20px",
  backgroundColor: isActive ? "#007bff" : "#f0f0f0",
  color: isActive ? "#fff" : "#333",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
  marginRight: "10px",
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
  marginTop: "20px",
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

const inputStyle = {
  padding: "6px 12px",
  border: "1px solid #ddd",
  borderRadius: "4px",
  marginTop: "10px",
};

const btnPrimary = {
  padding: "8px 16px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
};

const btnSecondary = {
  ...btnPrimary,
  backgroundColor: "#6c757d",
};

const btnDanger = {
  ...btnPrimary,
  backgroundColor: "#dc3545",
};

const sectionTitleStyle = {
  fontSize: "18px",
  fontWeight: "bold",
  marginBottom: "10px",
};

const infoTextStyle = {
  fontSize: "14px",
  color: "#555",
};

const periodTextStyle = {
  color: "#007bff",
  fontWeight: "bold",
};

const noPeriodTextStyle = {
  color: "gray",
};

export default TeacherDashboard;