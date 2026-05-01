import { base44 } from "@/api/base44Client";

/**
 * UserService — operações relacionadas a usuários e perfis.
 */
const UserService = {
  /** Retorna o usuário autenticado */
  me: () => base44.auth.me(),

  /** Retorna o perfil (UserProfile) do usuário logado */
  myProfile: async () => {
    const user = await base44.auth.me();
    const results = await base44.entities.UserProfile.filter({ user_email: user.email }, null, 1);
    return results?.[0] ?? null;
  },

  /** Lista todos os perfis (admin) */
  listAll: () => base44.entities.UserProfile.list("-created_date"),

  /** Cria um perfil */
  create: (data) => base44.entities.UserProfile.create(data),

  /** Atualiza um perfil */
  update: (id, data) => base44.entities.UserProfile.update(id, data),

  /** Exclui um perfil */
  delete: (id) => base44.entities.UserProfile.delete(id),

  /** Convida um usuário para a plataforma */
  invite: (email, role = "user") => base44.users.inviteUser(email, role),

  /** Faz logout */
  logout: (redirectUrl) => base44.auth.logout(redirectUrl),
};

export default UserService;