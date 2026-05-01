import { base44 } from "@/api/base44Client";

/**
 * GroupService — operações relacionadas a grupos de alunos.
 */
const GroupService = {
  /** Lista grupos criados pelo usuário logado */
  listMine: async () => {
    const user = await base44.auth.me();
    return base44.entities.Group.filter({ owner_email: user.email }, "-created_date");
  },

  /** Lista grupos onde o usuário logado é membro */
  listAsMember: async () => {
    const user = await base44.auth.me();
    return base44.entities.Group.list("-created_date").then((groups) =>
      groups.filter((g) =>
        (g.members || []).some((m) => m.email === user.email)
      )
    );
  },

  /** Cria um novo grupo */
  create: async (data) => {
    const user = await base44.auth.me();
    return base44.entities.Group.create({ ...data, owner_email: user.email, members: [] });
  },

  /** Atualiza um grupo */
  update: (id, data) => base44.entities.Group.update(id, data),

  /** Exclui um grupo */
  delete: (id) => base44.entities.Group.delete(id),

  /** Convida um membro (adiciona com status pending) */
  inviteMember: (group, email, name = "") =>
    base44.entities.Group.update(group.id, {
      members: [...(group.members || []), { email, name, status: "pending" }],
    }),

  /** Atualiza o status de um membro */
  updateMemberStatus: (group, memberEmail, status) =>
    base44.entities.Group.update(group.id, {
      members: (group.members || []).map((m) =>
        m.email === memberEmail ? { ...m, status } : m
      ),
    }),
};

export default GroupService;