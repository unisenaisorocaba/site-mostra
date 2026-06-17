import api from "@/api/apiClient";

const SettingService = {
  get: async () => {
    const res = await api.get("/settings");
    return res.data;
  },
  update: async (evaluations_open) => {
    const res = await api.put("/settings", { evaluations_open });
    return res.data;
  }
};

export default SettingService;
