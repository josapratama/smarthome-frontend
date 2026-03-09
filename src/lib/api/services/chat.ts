import { apiFetchBrowser } from "../client/fetch";

export interface ChatMessage {
  id: number;
  conversationId: number;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  model: string | null;
  tokens: number | null;
  createdAt: string;
}

export interface ChatConversation {
  id: number;
  userId: number | null;
  sessionId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
}

export interface SendMessageResponse {
  conversation: {
    id: number;
    sessionId: string;
  };
  userMessage: ChatMessage;
  aiMessage: ChatMessage;
}

export async function sendMessage(params: {
  message: string;
  conversationId?: number;
  sessionId?: string;
}): Promise<SendMessageResponse> {
  const response = await apiFetchBrowser<{ data: SendMessageResponse }>(
    "/api/v1/chat/message",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    },
  );
  return response.data;
}

export async function getConversation(
  sessionId: string,
): Promise<ChatConversation> {
  const response = await apiFetchBrowser<{
    data: { conversation: ChatConversation };
  }>(`/api/v1/chat/conversation/${sessionId}`);
  return response.data.conversation;
}

export async function getConversations(): Promise<ChatConversation[]> {
  const response = await apiFetchBrowser<{
    data: { conversations: ChatConversation[] };
  }>("/api/v1/chat/conversations");
  return response.data.conversations;
}

export async function deleteConversation(sessionId: string): Promise<void> {
  await apiFetchBrowser(`/api/v1/chat/conversation/${sessionId}`, {
    method: "DELETE",
  });
}
