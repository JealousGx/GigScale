import "server-only";

import { GoogleGenAI } from "@google/genai";

import { env } from "@/lib/env";

export const gemini = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export const MODEL = "gemini-3.1-flash-lite-preview";
