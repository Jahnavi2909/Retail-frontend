// // src/services/Api.js
// import axios from "axios";
// import { getAuthToken, refreshAuth } from "./AuthService";

// const baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

// const api = axios.create({
//   baseURL,
//   headers: { "Content-Type": "application/json" },
// });

// api.interceptors.request.use((cfg) => {
//   const t = getAuthToken();
//   if (t) cfg.headers.Authorization = `Bearer ${t}`;
//   return cfg;
// });

// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, token = null) => {
//   failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
//   failedQueue = [];
// };

// api.interceptors.response.use(
//   (res) => res,
//   async (err) => {
//     const originalReq = err?.config;
//     if (!originalReq) return Promise.reject(err);

//     if (err.response && err.response.status === 401 && !originalReq._retry) {
//       if (isRefreshing) {
//         return new Promise(function (resolve, reject) {
//           failedQueue.push({ resolve, reject });
//         })
//           .then((token) => {
//             originalReq.headers.Authorization = "Bearer " + token;
//             return axios(originalReq);
//           })
//           .catch((e) => Promise.reject(e));
//       }

//       originalReq._retry = true;
//       isRefreshing = true;

//       try {
//         const newToken = await refreshAuth();
//         processQueue(null, newToken);
//         originalReq.headers.Authorization = "Bearer " + newToken;
//         return api(originalReq);
//       } catch (e) {
//         processQueue(e, null);
//         return Promise.reject(e);
//       } finally {
//         isRefreshing = false;
//       }
//     }
//     return Promise.reject(err);
//   }
// );

// export default api;

import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL, 
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;

