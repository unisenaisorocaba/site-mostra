import { mockBase44 as base44 } from "@/lib/mockClient";

const PhotoService = {
  listAll: () => base44.entities.EventPhoto.list("-created_date"),
  listMine: async () => {
    const user = await base44.auth.me();
    return base44.entities.EventPhoto.filter({ created_by: user.email }, "-created_date");
  },
  upload: async ({ file, caption, category }) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    return base44.entities.EventPhoto.create({ photo_url: file_url, caption, category });
  },
  delete: (id) => base44.entities.EventPhoto.delete(id),
};

export default PhotoService;