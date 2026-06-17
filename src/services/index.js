/**
 * Barrel export — importe os serviços de um único lugar:
 *
 * import { ProjectService, EvaluationService } from "@/services";
 */
export { default as ProjectService, CATEGORY_LABELS, CATEGORY_IMAGES, getCategoryImage } from "./projectService";
export { default as EvaluationService } from "./evaluationService";
export { default as CriteriaService } from "./criteriaService";
export { default as UserService } from "./userService";
export { default as GroupService } from "./groupService";
export { default as AssignmentService } from "./assignmentService";
export { default as PhotoService } from "./photoService";
export { default as CategoryService } from "./categoryService";
export { default as SettingService } from "./settingService";