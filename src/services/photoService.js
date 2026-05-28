import api from "@/api/apiClient";

const PhotoService = {
  listAll: async () => {
    const res = await api.get("/photos");
    return res.data;
  },
  listMine: async () => {
    const res = await api.get("/photos/mine");
    return res.data;
  },
  upload: async ({ file, caption, category }) => {
    // 1. Gera URL pré-assinada do S3 e cadastra no banco
    const res = await api.post("/photos/upload-url", {
      fileName: file.name,
      contentType: file.type,
      caption: caption || "",
      category: category || "geral",
    });
    const { uploadUrl, fileUrl, photo } = res.data;

    // 2. Faz o upload direto do arquivo bruto para o S3
    const axios = await import("axios").then((m) => m.default);
    await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
    });

    return photo;
  },
  delete: async (id) => {
    const res = await api.delete(`/photos/${id}`);
    return res.data;
  },
};

export default PhotoService;