import axios from "axios";

const api = axios.create({
  baseURL: "/api",          // Nginx 프록시 경로
  withCredentials: true,    // 세션/쿠키 쓰면 유지
});

export default api;
