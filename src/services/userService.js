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
  listMyGuests: async () => {
    const res = await api.get("/users/me/guests");
    return res.data;
  },
  createGuest: async (data) => {
    const res = await api.post("/users/me/guests", data);
    return res.data;
  },
  deleteGuest: async (id) => {
    const res = await api.delete(`/users/me/guests/${id}`);
    return res.data;
  },
  listAllGuests: async () => {
    const res = await api.get("/users/guests");
    return res.data;
  },
  updateMe: async (data) => {
    const res = await api.put("/users/me/update", data);
    return res.data;
  },
  listTeachers: async () => {
    const res = await api.get("/users/teachers");
    return res.data;
  },
  listStudents: async () => {
    const res = await api.get("/users/students");
    return res.data;
  },
  resetPassword: async (id, newPassword) => {
    const res = await api.put(`/users/profiles/${id}/reset-password`, { newPassword });
    return res.data;
  },
};

export default UserService;