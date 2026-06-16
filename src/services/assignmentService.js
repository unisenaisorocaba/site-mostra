import api from "./userService"; // the userService exports the configured axios instance

class AssignmentService {
  static async listAll() {
    const res = await api.get("/assignments");
    return res.data;
  }

  static async listMine() {
    const res = await api.get("/assignments/my");
    return res.data;
  }

  static async create(data) {
    const res = await api.post("/assignments", data);
    return res.data;
  }

  static async delete(id) {
    const res = await api.delete(`/assignments/${id}`);
    return res.data;
  }
}

export default AssignmentService;
