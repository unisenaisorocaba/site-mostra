import api from "@/api/apiClient";

const GroupService = {
  listMine: async () => {
    const res = await api.get("/groups/mine");
    return res.data;
  },
  listAsMember: async () => {
    const res = await api.get("/groups/member");
    return res.data;
  },
  create: async (data) => {
    const res = await api.post("/groups", {
      name: data.name,
      description: data.description || "",
    });
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/groups/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/groups/${id}`);
    return res.data;
  },
  inviteMember: async (group, email, name = "") => {
    const res = await api.post(`/groups/${group.id}/invite`, { email, name });
    return res.data;
  },
  updateMemberStatus: async (group, memberEmail, status) => {
    const res = await api.put(`/groups/${group.id}/members/${memberEmail}`, { status });
    return res.data;
  },
};

export default GroupService;