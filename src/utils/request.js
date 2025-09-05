import axios from "axios";
import { ElNotification } from "element-plus";

const apiBaseUrl = import.meta.env.VITE_APP_BASE_API;

// 防止多次重複跳轉的標誌
let isRedirecting = false;

const service = axios.create({
  baseURL: apiBaseUrl,
  timeout: 50000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// 請求攔截器
service.interceptors.request.use(
  (config) => {
    if (config.params) {
      config.params = Object.fromEntries(
        Object.entries(config.params).filter(([_, v]) => v !== "" && v != null)
      );
    }

    const accessToken = localStorage.getItem("adminAccessToken");
    if (accessToken) {
      config.headers["Authorization"] = "Bearer " + accessToken;
    }
    return config;
  },
  (error) => {
    console.log("請求錯誤:", error);
    return Promise.reject(error);
  }
);

// 響應攔截器
service.interceptors.response.use(
  (response) => {
    // 新增：當 responseType 是 blob（下載檔案）時，回傳整個 response，
    // 這樣才能拿得到 response.data（Blob）和 response.headers 獲取 headers 中的文件名稱
    if (response.config.responseType === "blob") {
      return response;
    }
    return response.data;
  },
  (error) => {
    if (!error.response) {
      if (error.message.includes("Unsupported protocol wss:")) {
        ElNotification({
          title: "協議錯誤",
          message: "不支持的協議：wss，請檢查配置。",
          type: "error",
          duration: 5000,
        });
        return Promise.reject(error);
      }
      return Promise.reject(error);
    }

    const status = error.response.status;

    if (status === 401) {
      handleUnauthorized();
    } else if (status === 500) {
      ElNotification({
        title: "伺服器錯誤",
        message: "內部伺服器錯誤，請重試。",
        type: "error",
        duration: 5000,
      });
    }

    return Promise.reject(error);
  }
);

/**
 * 處理未授權錯誤 (401)
 */
async function handleUnauthorized() {
  if (isRedirecting) return;
  isRedirecting = true;

  ElNotification({
    title: "未授權",
    message: "登入已過期，請重新登入。",
    type: "warning",
    duration: 5000,
  });
}

export default service;
