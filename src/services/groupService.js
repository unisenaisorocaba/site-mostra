import { mockBase44 as base44 } from "@/lib/mockClient";

const GroupService = {
  listMine: async () => {
    const user = await base44.auth.me();
    return base44.entities.Group.filter({ owner_email: user.email }, "-created_date");
  },
  listAsMember: async () => {
    const user = await base44.auth.me();
    return base44.entities.Group.list("-created_date").then((groups) =>
      groups.filter((g) => (g.members || []).some((m) => m.email === user.email))
    );
  },
  create: async (data) => {
    const user = await base44.auth.me();
    return base44.entities.Group.create({ ...data, owner_email: user.email, members: [] });
  },
  update: (id, data) => base44.entities.Group.update(id, data),
  delete: (id) => base44.entities.Group.delete(id),
  inviteMember: (group, email, name = "") =>
    base44.entities.Group.update(group.id, {
      members: [...(group.members || []), { email, name, status: "pending" }],
    }),
  updateMemberStatus: (group, memberEmail, status) =>
    base44.entities.Group.update(group.id, {
      members: (group.members || []).map((m) =>
        m.email === memberEmail ? { ...m, status } : m
      ),
    }),
};

export default GroupService;