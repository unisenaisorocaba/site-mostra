import { mockBase44 as base44 } from "@/lib/mockClient";

const EvaluationService = {
  listMine: async () => {
    const user = await base44.auth.me();
    return base44.entities.Evaluation.filter({ created_by: user.email }, "-created_date");
  },
  listByProject: (projectId) =>
    base44.entities.Evaluation.filter({ project_id: projectId }),
  create: async (data) => {
    const user = await base44.auth.me();
    return base44.entities.Evaluation.create({
      ...data,
      evaluator_name: user.full_name || user.email,
    });
  },
  average: (evaluation) => {
    if (evaluation.evaluation_type === "professor" && evaluation.criteria_scores?.length > 0) {
      const sum = evaluation.criteria_scores.reduce((a, b) => a + (b.score || 0), 0);
      return (sum / evaluation.criteria_scores.length).toFixed(1);
    }
    const fields = ["criteria_innovation", "criteria_technical", "criteria_presentation", "criteria_relevance"];
    const vals = fields.map((k) => evaluation[k] || 0).filter((v) => v > 0);
    return vals.length === 0 ? "—" : (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  },
};

export default EvaluationService;