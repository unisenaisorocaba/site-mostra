import api from "@/api/apiClient";

const CriteriaService = {
  listMine: async () => {
    const res = await api.get("/criteria/mine");
    return res.data;
  },
  create: async (data) => {
    const res = await api.post("/criteria", {
      name: data.name,
      description: data.description,
      criteria: data.criteria ?? [],
    });
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/criteria/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/criteria/${id}`);
    return res.data;
  },
  addCriteria: async (list, criteria) => {
    const res = await api.post(`/criteria/${list.id}/items`, criteria);
    return res.data;
  },
  removeCriteria: async (list, index) => {
    const res = await api.delete(`/criteria/${list.id}/items/${index}`);
    return res.data;
  },
  updateCriteria: async (list, index, data) => {
    const res = await api.put(`/criteria/${list.id}/items/${index}`, data);
    return res.data;
  },
};

export default CriteriaService;