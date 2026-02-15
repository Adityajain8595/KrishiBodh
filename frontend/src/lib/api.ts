/**
 * Krishibodh API client. Base URL: VITE_API_BASE or same-origin (use Vite proxy in dev).
 */

import { auth } from "./firebase";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

async function parseError(res: Response): Promise<string> {
  try {
    const err = await res.json();
    return (err as { error?: string }).error || `API error: ${res.status}`;
  } catch {
    return res.statusText || `API error: ${res.status}`;
  }
}

function wrapNetworkError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("Load failed")) {
    return "Backend not reachable. Ensure the API is running on port 3000.";
  }
  return msg;
}

async function getAuthToken(): Promise<string | null> {
  if (!auth || !auth.currentUser) return null;
  try {
    return await auth.currentUser.getIdToken();
  } catch {
    return null;
  }
}

export const api = {
  async get<T>(path: string, requireAuth = false): Promise<T> {
    try {
      const headers: HeadersInit = {};
      if (requireAuth) {
        const token = await getAuthToken();
        if (!token) {
          throw new Error("Authentication required. Please log in.");
        }
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE}${path}`, { headers });
      if (!res.ok) {
        const errorMsg = await parseError(res);
        if (res.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        }
        if (res.status === 503) {
          throw new Error("Authentication service unavailable. Please try again later.");
        }
        throw new Error(errorMsg);
      }
      return res.json();
    } catch (e) {
      if (e instanceof Error) {
        throw e;
      }
      throw new Error(wrapNetworkError(e));
    }
  },
  async post<T>(path: string, body: unknown, requireAuth = false): Promise<T> {
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (requireAuth) {
        const token = await getAuthToken();
        if (!token) {
          throw new Error("Authentication required. Please log in.");
        }
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errorMsg = await parseError(res);
        // Handle authentication errors specifically
        if (res.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        }
        if (res.status === 503) {
          throw new Error("Authentication service unavailable. Please try again later.");
        }
        throw new Error(errorMsg);
      }
      return res.json();
    } catch (e) {
      if (e instanceof Error) {
        throw e;
      }
      throw new Error(wrapNetworkError(e));
    }
  },
  async put<T>(path: string, body: unknown, requireAuth = false): Promise<T> {
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (requireAuth) {
        const token = await getAuthToken();
        if (!token) throw new Error("Authentication required. Please log in.");
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE}${path}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errorMsg = await parseError(res);
        if (res.status === 401) throw new Error("Authentication failed. Please log in again.");
        throw new Error(errorMsg);
      }
      return res.json();
    } catch (e) {
      if (e instanceof Error) throw e;
      throw new Error(wrapNetworkError(e));
    }
  },
  async delete<T>(path: string, requireAuth = false): Promise<T> {
    try {
      const headers: HeadersInit = {};
      if (requireAuth) {
        const token = await getAuthToken();
        if (!token) throw new Error("Authentication required. Please log in.");
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE}${path}`, { method: "DELETE", headers });
      if (!res.ok) {
        const errorMsg = await parseError(res);
        if (res.status === 401) throw new Error("Authentication failed. Please log in again.");
        throw new Error(errorMsg);
      }
      return res.json();
    } catch (e) {
      if (e instanceof Error) throw e;
      throw new Error(wrapNetworkError(e));
    }
  },
};

export interface WeatherResponse {
  city: string;
  state: string;
  temperatureC: number;
  humidity: number;
  precipitationMm: number;
}

export interface IrrigationPredictResponse {
  dailyWater: number;
  weeklyWater: number;
  irrigationSchedule: string;
  efficiencyScore: number;
  riskLevel: "Low" | "Medium" | "High";
  recommendations: string[];
  confidence: number;
  weather?: WeatherResponse;
}

export interface CropRecommendItem {
  crop: string;
  suitabilityScore: number;
  expectedYield: number;
  waterRequirement: number;
  riskFactors: string[];
  explanation?: string;
}

export interface CropsRecommendResponse {
  recommendedCrops: CropRecommendItem[];
  confidence: number;
  weather?: WeatherResponse;
}

export interface YieldPredictResponse {
  predictedYield: number;
  yieldPerAcre: number;
  confidence: number;
  riskLevel: "Low" | "Medium" | "High";
  recommendations: string[];
  assumptions?: string[];
  weather?: WeatherResponse;
}

export interface PestAnalyzeResponse {
  pestRisk: "Low" | "Medium" | "High";
  likelyPests: string[];
  preventionMeasures: string[];
  weather?: WeatherResponse;
}

export interface ChatAskResponse {
  answer: string;
  confidence: number;
}

export interface MarketPriceItem {
  commodity: string;
  state: string;
  district: string;
  market: string;
  minPrice: number | null;
  maxPrice: number | null;
  modalPrice: number | null;
  date: string;
}

export interface MarketPricesResponse {
  prices: MarketPriceItem[];
  dataNotAvailable?: boolean;
  source?: string;
}

export const irrigationApi = {
  predict: (params: {
    location: string;
    farmSize: number;
    cropType: string;
    growthStage: string;
    soilType: string;
    irrigationType: string;
  }) => api.post<IrrigationPredictResponse>("/api/irrigation/predict", params),
};

export const cropApi = {
  list: () => api.get<{ crops: string[] }>("/api/crops/list"),
  recommend: (params: {
    location: string;
    soilType: string;
    season: string;
    farmSize: number;
  }) => api.post<CropsRecommendResponse>("/api/crops/recommend", params),
};

export const yieldApi = {
  predict: (params: {
    cropType: string;
    variety: string;
    farmSize: number;
    growthStage: string;
    soilType: string;
    irrigationType: string;
    location?: string;
  }) => api.post<YieldPredictResponse>("/api/yield/predict", params),
};

export const pestApi = {
  analyze: (params: { cropType: string; growthStage: string; location: string }) =>
    api.post<PestAnalyzeResponse>("/api/pests/analyze", params),
};

export const chatApi = {
  ask: (params: { module: "AquaFarm" | "AgriSmart" | "CropGuard"; question: string }) =>
    api.post<ChatAskResponse>("/api/chat/ask", params),
};

export const weatherApi = {
  get: (location: string) =>
    api.get<WeatherResponse>(`/api/weather?location=${encodeURIComponent(location)}`),
};

export const marketApi = {
  getPrices: (params?: { crop?: string; state?: string; mandi?: string }) => {
    const sp = new URLSearchParams();
    if (params?.crop) sp.set("crop", params.crop);
    if (params?.state) sp.set("state", params.state);
    if (params?.mandi) sp.set("mandi", params.mandi);
    const q = sp.toString();
    return api.get<MarketPricesResponse>(`/api/market/prices${q ? `?${q}` : ""}`);
  },
};

export interface AssistanceAskResponse {
  answer: string;
}

export interface AssistanceContext {
  crop?: string;
  location?: string;
  weather?: {
    temperatureC: number;
    humidity: number;
    precipitationMm: number;
  };
  irrigation?: {
    dailyWater: number;
    riskLevel: string;
    efficiencyScore: number;
  };
  yield?: {
    predictedYield: number;
    riskLevel: string;
  };
  market?: {
    prices: Array<{ modalPrice: number | null }>;
  };
}

export const assistanceApi = {
  ask: (params: {
    question: string;
    context?: AssistanceContext;
    language?: string;
    history?: Array<{ role: "user" | "assistant"; content: string }>;
  }) => api.post<AssistanceAskResponse>("/api/assistant/ask", params, true),
};

export interface TTSResponse {
  // MP3 audio blob
}

export interface STTResponse {
  transcription: string;
}

/**
 * Text-to-Speech API
 */
export const ttsApi = {
  synthesize: async (params: {
    text: string;
    lang: "en" | "hi";
    voice: "male" | "female";
  }): Promise<Blob> => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Authentication required. Please log in.");
    }

    const res = await fetch(`${API_BASE}/api/assistant/tts`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: params.text,
        lang: params.lang,
        voice: params.voice,
      }),
    });

    if (!res.ok) {
      const errorMsg = await parseError(res);
      if (res.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      }
      throw new Error(errorMsg);
    }

    return res.blob();
  },
};

/**
 * Speech-to-Text API
 */
export const sttApi = {
  transcribe: async (params: {
    audioBlob: Blob;
    language: "en" | "hi";
  }): Promise<STTResponse> => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Authentication required. Please log in.");
    }

    const formData = new FormData();
    formData.append("file", params.audioBlob, "audio.webm");
    formData.append("language", params.language);

    const res = await fetch(`${API_BASE}/api/assistant/transcribe`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errorMsg = await parseError(res);
      if (res.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      }
      throw new Error(errorMsg);
    }

    return res.json();
  },
};

export interface SchemeEligibleItem {
  scheme: {
    id: string;
    name: string;
    name_hi?: string;
    description: string;
    description_hi?: string;
    benefits: string;
    benefits_hi?: string;
    eligibility_text: string;
    eligibility_text_hi?: string;
    application_process: string;
    application_process_hi?: string;
    application_mode: string;
    start_date: string | null;
    end_date: string | null;
    deadline: string | null;
    source_url: string;
    last_verified_date: string | null;
    scheme_level?: string;
    benefit_tags?: string;
    needs_admin_review?: boolean;
    external_link?: string | null;
  };
  eligibility_reason: string;
  eligibility_reason_hi?: string;
  application_mode: string[];
}

export interface SchemesEligibleResponse {
  schemes: SchemeEligibleItem[];
}

export const schemesApi = {
  getEligible: (params: {
    state: string;
    district?: string;
    crop?: string;
    season?: string;
    farmer_type?: string;
  }) => {
    const sp = new URLSearchParams();
    sp.set("state", params.state);
    if (params.district) sp.set("district", params.district);
    if (params.crop) sp.set("crop", params.crop);
    if (params.season) sp.set("season", params.season);
    if (params.farmer_type) sp.set("farmer_type", params.farmer_type);
    return api.get<SchemesEligibleResponse>(`/api/schemes/eligible?${sp.toString()}`);
  },
  list: (all?: boolean) =>
    api.get<{ schemes: Array<Record<string, unknown>> }>(
      all ? "/api/schemes?all=true" : "/api/schemes"
    ),
  getById: (id: string) =>
    api.get<{ scheme: Record<string, unknown> }>(`/api/schemes/${id}`),
  create: (body: Record<string, unknown>) =>
    api.post<{ scheme: Record<string, unknown> }>("/api/schemes", body, true),
  update: (id: string, body: Record<string, unknown>) =>
    api.put<{ scheme: Record<string, unknown> }>(`/api/schemes/${id}`, body, true),
  deactivate: (id: string) =>
    api.delete<{ scheme: Record<string, unknown> }>(`/api/schemes/${id}`, true),
};
