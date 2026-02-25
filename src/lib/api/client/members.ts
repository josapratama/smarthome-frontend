import { api } from "../client";

export interface HomeMember {
  id: number;
  userId: number;
  homeId: number;
  roleInHome: "OWNER" | "MEMBER" | "GUEST";
  status: "INVITED" | "ACTIVE";
  invitedAt: string;
  joinedAt?: string;
  user?: {
    id: number;
    email: string;
    name?: string;
  };
}

export interface InviteMemberInput {
  email: string;
  roleInHome: "MEMBER" | "GUEST";
}

export interface UpdateMemberRoleInput {
  roleInHome: "MEMBER" | "GUEST";
}

export const membersApi = {
  listByHome: async (homeId: number) => {
    const res = await api.get<{ data: HomeMember[] }>(
      `/homes/${homeId}/members`,
    );
    return res.data.data;
  },

  invite: async (homeId: number, input: InviteMemberInput) => {
    const res = await api.post<{ data: HomeMember }>(
      `/homes/${homeId}/members`,
      input,
    );
    return res.data.data;
  },

  updateRole: async (
    homeId: number,
    userId: number,
    input: UpdateMemberRoleInput,
  ) => {
    const res = await api.patch<{ data: HomeMember }>(
      `/homes/${homeId}/members/${userId}`,
      input,
    );
    return res.data.data;
  },

  remove: async (homeId: number, userId: number) => {
    await api.delete(`/homes/${homeId}/members/${userId}`);
  },

  resendInvite: async (homeId: number, userId: number) => {
    const res = await api.post<{ data: HomeMember }>(
      `/homes/${homeId}/members/${userId}/resend-invite`,
    );
    return res.data.data;
  },
};
