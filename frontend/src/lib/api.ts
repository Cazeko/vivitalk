import axios, { AxiosInstance } from "axios";

export interface OnboardingState {
  embedded?: boolean;
  dismissed?: boolean;
}

export interface User {
  id: string;
  email: string;
  company_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  is_active: boolean;
  is_verified: boolean;
  onboarding?: OnboardingState;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface Chatbot {
  id: string;
  name: string;
  description?: string | null;
  welcome_message: string;
  primary_color: string;
  status: string;
  widget_code?: string | null;
  configuration: Record<string, any>;
  document_count: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface DocumentInfo {
  id: string;
  chatbot_id: string;
  name: string;
  type: string;
  status: "pending" | "processing" | "processed" | "failed";
  chunk_count: number;
  error_message?: string | null;
  metadata: Record<string, any>;
  created_at?: string | null;
}

export interface ChatSource {
  document_id: string;
  document_name?: string | null;
  snippet: string;
  score: number;
}

export interface ChatResponse {
  response: string;
  sources: ChatSource[];
  confidence: number;
  session_id: string;
  response_time_ms: number;
}

const API_BASE =
  (typeof window !== "undefined" && (window as any).__VIVITALK_API__) ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "/api/v1";

class Api {
  private http: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.http = axios.create({ baseURL: API_BASE, timeout: 60000 });
    this.http.interceptors.request.use((c) => {
      if (this.token) c.headers.Authorization = `Bearer ${this.token}`;
      return c;
    });
    this.http.interceptors.response.use(
      (r) => r,
      (err) => {
        if (err.response?.status === 401 && typeof window !== "undefined") {
          // soft handling: callers can decide to redirect
        }
        return Promise.reject(err);
      },
    );
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("vivitalk.token");
      if (t) this.token = t;
    }
  }

  setToken(t: string | null) {
    this.token = t;
    if (typeof window !== "undefined") {
      if (t) localStorage.setItem("vivitalk.token", t);
      else localStorage.removeItem("vivitalk.token");
    }
  }

  getToken(): string | null {
    return this.token;
  }

  // -------- Auth --------
  async signup(data: { email: string; password: string; company_name?: string; first_name?: string; last_name?: string }): Promise<User> {
    const { data: res } = await this.http.post<User>("/auth/signup", data);
    return res;
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const form = new FormData();
    form.append("username", email);
    form.append("password", password);
    const { data } = await this.http.post<AuthTokens>("/auth/login", form);
    this.setToken(data.access_token);
    return data;
  }

  async logout(): Promise<void> {
    try { await this.http.post("/auth/logout"); } catch {}
    this.setToken(null);
  }

  async me(): Promise<User> {
    const { data } = await this.http.get<User>("/auth/me");
    return data;
  }

  async updateOnboarding(partial: OnboardingState): Promise<User> {
    const { data } = await this.http.patch<User>("/auth/onboarding", partial);
    return data;
  }

  // -------- Chatbots --------
  async listChatbots(): Promise<Chatbot[]> {
    const { data } = await this.http.get<Chatbot[]>("/chatbot");
    return data;
  }

  async getChatbot(id: string): Promise<Chatbot> {
    const { data } = await this.http.get<Chatbot>(`/chatbot/${id}`);
    return data;
  }

  async createChatbot(payload: Partial<Chatbot> & { name: string }): Promise<Chatbot> {
    const { data } = await this.http.post<Chatbot>("/chatbot", payload);
    return data;
  }

  async updateChatbot(id: string, payload: Partial<Chatbot>): Promise<Chatbot> {
    const { data } = await this.http.put<Chatbot>(`/chatbot/${id}`, payload);
    return data;
  }

  async deleteChatbot(id: string): Promise<void> {
    await this.http.delete(`/chatbot/${id}`);
  }

  // -------- Documents --------
  async listDocuments(chatbotId: string): Promise<DocumentInfo[]> {
    const { data } = await this.http.get<DocumentInfo[]>(`/chatbot/${chatbotId}/documents`);
    return data;
  }

  async uploadDocument(chatbotId: string, file: File): Promise<DocumentInfo> {
    const form = new FormData();
    form.append("file", file);
    const { data } = await this.http.post<DocumentInfo>(`/chatbot/${chatbotId}/documents`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }

  async deleteDocument(chatbotId: string, documentId: string): Promise<void> {
    await this.http.delete(`/chatbot/${chatbotId}/documents/${documentId}`);
  }

  // -------- Chat --------
  async chat(chatbotId: string, message: string, sessionId?: string, history?: { role: string; content: string }[]): Promise<ChatResponse> {
    const { data } = await this.http.post<ChatResponse>(`/chatbot/${chatbotId}/chat`, {
      message, session_id: sessionId, history,
    });
    return data;
  }
}

export const api = new Api();
