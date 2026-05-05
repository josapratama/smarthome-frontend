import { apiFetchBrowser } from "../client/fetch";

export interface HomeMember {
  id: number;
  userId: number;
  homeId: number;
  roleInHome: "OWNER" | "MEMBER" | "GUEST";
  status: "INVITED" | "ACTIVE";
  invitedAt: string;
  joinedAt?: string;
  user?: { id: number; email: string; name?: string };
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
    const res = await apiFetchBrowser<{ data: HomeMember[] }>(
      `/api/v1/homes/${homeId}/members`,
    );
    return res.data;
  },

  invite: async (homeId: number, input: InviteMemberInput) => {
    const res = await apiFetchBrowser<{ data: HomeMember }>(
      `/api/v1/homes/${homeId}/members`,
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
    return res.data;
  },

  updateRole: async (
    homeId: number,
    userId: number,
    input: UpdateMemberRoleInput,
  ) => {
    const res = await apiFetchBrowser<{ data: HomeMember }>(
      `/api/v1/homes/${homeId}/members/${userId}`,
      { method: "PATCH", body: JSON.stringify(input) },
    );
    return res.data;
  },

  remove: async (homeId: number, userId: number) => {
    await apiFetchBrowser(`/api/v1/homes/${homeId}/members/${userId}`, {
      method: "DELETE",
    });
  },

  resendInvite: async (homeId: number, userId: number) => {
    const res = await apiFetchBrowser<{ data: HomeMember }>(
      `/api/v1/homes/${homeId}/members/${userId}/resend-invite`,
      { method: "POST" },
    );
    return res.data;
  },
};
