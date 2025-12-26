const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const normalizeApiBaseUrl = (baseUrl) => {
  const trimmed = String(baseUrl || "http://localhost:8080").replace(/\/+$/, "");
  if (trimmed.endsWith("/arigatouAirlines")) return trimmed;
  return `${trimmed}/arigatouAirlines`;
};

export const API_BASE_URL = normalizeApiBaseUrl(RAW_API_BASE_URL);

export const getAuthHeader = () => {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const extractBody = (response) => {
  if (response?.data?.body !== undefined) return response.data.body;
  return response?.data;
};
