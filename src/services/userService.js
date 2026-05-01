import { mockBase44 as base44 } from "@/lib/mockClient";

const UserService = {
  me: () => base44.auth.me(),
  myProfile: async () => {
    const user = await base44.auth.me();
    const results = await base44.entities.UserProfile.filter({ user_email: user.email }, null, 1);
    return results?.[0] ?? null;
  },
  listAll: () => base44.entities.UserProfile.list("-created_date", 200),
  create: (data) => base44.entities.UserProfile.create(data),
  update: (id, data) => base44.entities.UserProfile.update(id, data),
  delete: (id) => base44.entities.UserProfile.delete(id),
  invite: (email, role = "user") => base44.users.inviteUser(email, role),
  logout: (redirectUrl) => base44.auth.logout(redirectUrl),
};

export default UserService;