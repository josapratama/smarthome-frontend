import { apiFetchBrowser } from "../client/fetch";

export interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl: string | null;
}

export interface DirectConversation {
  id: number;
  user1Id: number;
  user2Id: number;
  createdAt: string;
  updatedAt: string;
  otherUser: User;
  messages: DirectMessage[];
  unreadCount: number;
}

export interface DirectMessage {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  status: "SENT" | "DELIVERED" | "READ";
  readAt: string | null;
  attachmentUrl: string | null;
  attachmentType: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  sender: User;
}

export interface HomeConversation {
  id: number;
  homeId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  home: {
    id: number;
    name: string;
    ownerUserId: number;
  };
  messages: HomeMessage[];
  unreadCount: number;
}

export interface HomeMessage {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  attachmentUrl: string | null;
  attachmentType: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  sender: User;
  readBy: Array<{ readAt: string }>;
}

export interface HomeConversationMember {
  id: number;
  homeId: number;
  userId: number;
  roleInHome: string;
  status: string;
  user: User;
}

// ============ Direct Messages ============

export async function getDMConversations(): Promise<DirectConversation[]> {
  try {
    const response = await apiFetchBrowser(
      "/api/v1/direct-messages/conversations",
    );
    if (!response.ok) {
      // If endpoint doesn't exist (404) or server error, return empty array
      if (response.status === 404 || response.status >= 500) {
        console.warn("DM conversations endpoint not available");
        return [];
      }
      throw new Error("Failed to get conversations");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.warn("DM conversations not available:", error);
    return [];
  }
}

export async function sendDirectMessage(
  recipientId: number,
  content: string,
  attachmentUrl?: string,
  attachmentType?: string,
): Promise<DirectMessage> {
  const response = await apiFetchBrowser("/api/v1/direct-messages/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipientId,
      content,
      attachmentUrl,
      attachmentType,
    }),
  });
  if (!response.ok) throw new Error("Failed to send message");
  const data = await response.json();
  return data.data;
}

export async function getDMMessages(
  conversationId: number,
  options?: { limit?: number; offset?: number; before?: string },
): Promise<DirectMessage[]> {
  const params = new URLSearchParams();
  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.offset) params.append("offset", options.offset.toString());
  if (options?.before) params.append("before", options.before);

  const response = await apiFetchBrowser(
    `/api/v1/direct-messages/${conversationId}/messages?${params.toString()}`,
  );
  if (!response.ok) throw new Error("Failed to get messages");
  const data = await response.json();
  return data.data;
}

export async function markDMAsRead(messageId: number): Promise<void> {
  const response = await apiFetchBrowser("/api/v1/direct-messages/mark-read", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messageId }),
  });
  if (!response.ok) throw new Error("Failed to mark as read");
}

export async function deleteDMMessage(messageId: number): Promise<void> {
  const response = await apiFetchBrowser(
    `/api/v1/direct-messages/${messageId}`,
    {
      method: "DELETE",
    },
  );
  if (!response.ok) throw new Error("Failed to delete message");
}

export async function getDMUnreadCount(): Promise<number> {
  const response = await apiFetchBrowser(
    "/api/v1/direct-messages/unread-count",
  );
  if (!response.ok) throw new Error("Failed to get unread count");
  const data = await response.json();
  return data.data.count;
}

// ============ Home Chat ============

export async function getHomeConversations(): Promise<HomeConversation[]> {
  try {
    const response = await apiFetchBrowser("/api/v1/home-chat/conversations");
    if (!response.ok) {
      // If endpoint doesn't exist (404) or server error, return empty array
      if (response.status === 404 || response.status >= 500) {
        console.warn("Home conversations endpoint not available");
        return [];
      }
      throw new Error("Failed to get home conversations");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.warn("Home conversations not available:", error);
    return [];
  }
}

export async function sendHomeMessage(
  homeId: number,
  content: string,
  attachmentUrl?: string,
  attachmentType?: string,
): Promise<HomeMessage> {
  const response = await apiFetchBrowser("/api/v1/home-chat/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ homeId, content, attachmentUrl, attachmentType }),
  });
  if (!response.ok) throw new Error("Failed to send message");
  const data = await response.json();
  return data.data;
}

export async function getHomeMessages(
  conversationId: number,
  options?: { limit?: number; offset?: number; before?: string },
): Promise<HomeMessage[]> {
  const params = new URLSearchParams();
  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.offset) params.append("offset", options.offset.toString());
  if (options?.before) params.append("before", options.before);

  const response = await apiFetchBrowser(
    `/api/v1/home-chat/${conversationId}/messages?${params.toString()}`,
  );
  if (!response.ok) throw new Error("Failed to get messages");
  const data = await response.json();
  return data.data;
}

export async function markHomeMessageAsRead(messageId: number): Promise<void> {
  const response = await apiFetchBrowser("/api/v1/home-chat/mark-read", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messageId }),
  });
  if (!response.ok) throw new Error("Failed to mark as read");
}

export async function deleteHomeMessage(messageId: number): Promise<void> {
  const response = await apiFetchBrowser(`/api/v1/home-chat/${messageId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete message");
}

export async function getHomeUnreadCount(): Promise<number> {
  const response = await apiFetchBrowser("/api/v1/home-chat/unread-count");
  if (!response.ok) throw new Error("Failed to get unread count");
  const data = await response.json();
  return data.data.count;
}

export async function getHomeMembers(
  conversationId: number,
): Promise<HomeConversationMember[]> {
  const response = await apiFetchBrowser(
    `/api/v1/home-chat/${conversationId}/members`,
  );
  if (!response.ok) throw new Error("Failed to get members");
  const data = await response.json();
  return data.data;
}
