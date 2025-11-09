import axios from "axios";

export const getStudentGrades = async (studentId) => {
  const token = localStorage.getItem("token"); // 如果需要认证
  const res = await axios.get(`/api/grades?student_id=${studentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data; // 返回成绩数组
};
