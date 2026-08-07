import api from "./api";

export const getBranding = async () => {
  const response = await api.get("/branding/");
  return response.data;
};

export const updateBranding = async (brandingData) => {
  const response = await api.put("/branding/", brandingData);
  return response.data;
};