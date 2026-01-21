import { apiUrl } from "@/lib/api";
export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || """").replace(/\/$/, """");

export function apiUrl(path: string) {
  const p = path.startsWith(""/"") ? path : /;
  return ${API_BASE};
}

