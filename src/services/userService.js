import api from "@/api/apiClient";

const UserService = {
  me: async () => {
    const res = await api.get("/users/me");
    return res.data;
  },
  myProfile: async () => {
    const res = await api.get("/users/profile");
    return res.data;
  },
  listAll: async () => {
    const res = await api.get("/users/profiles");
    return res.data;
  },
  create: async (data) => {
    const res = await api.post("/users/profiles", data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/users/profiles/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/users/profiles/${id}`);
    return res.data;
  },
  invite: async (email, role = "user") => {
    const res = await api.post("/users/invite", { email, role });
    return res.data;
  },
  importBatch: async (users, defaultPassword) => {
    const res = await api.post("/users/batch", { users, defaultPassword });
    return res.data;
  },
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.warn("Signout request failed on server side", e.message);
    }
    localStorage.removeItem("token");
    window.location.href = "/";
  },
};

export default UserService;