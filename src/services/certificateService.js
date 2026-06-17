import api from "@/api/apiClient";

const CertificateService = {
  getRankings: async () => {
    const res = await api.get("/rankings");
    return res.data;
  },
  getMyCertificates: async () => {
    const res = await api.get("/certificates/my");
    return res.data;
  }
};

export default CertificateService;
