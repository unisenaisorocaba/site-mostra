import api from "@/api/apiClient";

const EvaluationService = {
  listMine: async () => {
    const res = await api.get("/evaluations/mine");
    return res.data;
  },
  listByProject: async (projectId) => {
    const res = await api.get(`/projects/${projectId}/evaluations`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post("/evaluations", data);
    return res.data;
  },
  average: (evaluation) => {
    if (evaluation.evaluation_type === "professor" && evaluation.criteria_scores?.length > 0) {
      const sum = evaluation.criteria_scores.reduce((a, b) => a + (b.score || 0), 0);
      return (sum / evaluation.criteria_scores.length).toFixed(1);
    }
    const newFields = ["criteria_organization", "criteria_clarity", "criteria_design", "criteria_objectivity", "criteria_impact"];
    const hasNewFields = newFields.some(k => evaluation[k] !== undefined && evaluation[k] !== null);
    const fields = hasNewFields 
      ? newFields 
      : ["criteria_innovation", "criteria_technical", "criteria_presentation", "criteria_relevance"];
    const vals = fields.map((k) => evaluation[k] || 0).filter((v) => v > 0);
    return vals.length === 0 ? "—" : (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  },
};

export default EvaluationService;