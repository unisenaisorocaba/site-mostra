import api from "@/api/apiClient";

export const CATEGORY_LABELS = {
  mecatronica: "Mecatrônica",
  software: "Software",
  gestao: "Gestão",
  logistica: "Logística",
  energia: "Energia",
  quimica: "Química",
  automacao: "Automação",
  outros: "Outros",
};

export const CATEGORY_IMAGES = {
  mecatronica: "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=1200&q=80",
  software: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80",
  gestao: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
  logistica: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80",
  energia: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80",
  quimica: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&q=80",
  automacao: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80",
  outros: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80",
};

export const getCategoryImage = (category, size = 1200) => {
  const url = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.outros;
  return url.replace("w=1200", `w=${size}`);
};

const ProjectService = {
  listFeatured: async () => {
    const res = await api.get("/projects/featured");
    return res.data;
  },
  listApproved: async () => {
    const res = await api.get("/projects/approved");
    return res.data;
  },
  listApprovedAll: async () => {
    const res = await api.get("/projects/approved-all");
    return res.data;
  },
  listOral: async () => {
    const res = await api.get("/projects/oral");
    return res.data;
  },
  listMine: async () => {
    const res = await api.get("/projects/mine");
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post("/projects", data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/projects/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  },
  submit: async (id) => {
    const res = await api.post(`/projects/${id}/submit`);
    return res.data;
  },
  uploadFile: async (projectId, field, file) => {
    // 1. Generate presigned URL and update database
    const res = await api.post(`/projects/${projectId}/upload-url`, {
      fileName: file.name,
      contentType: file.type,
      field,
    });
    const { uploadUrl, fileUrl } = res.data;

    // 2. Upload raw file directly to S3 via PUT
    const axios = await import("axios").then((m) => m.default);
    await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
    });

    return fileUrl;
  },
  getPublicStats: async () => {
    const res = await api.get("/public/stats");
    return res.data;
  },
};

export default ProjectService;