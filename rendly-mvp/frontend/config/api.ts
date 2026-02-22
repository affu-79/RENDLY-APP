import { getResolvedApiUrl, apiUrlToWsUrl } from "@/lib/resolvedApiUrl";

/** Use getResolvedApiUrl() for runtime base URL (auto-detects 4001 or 80). */
export const apiConfig = {
  getBaseUrl: getResolvedApiUrl,
  getWsUrl: () => getResolvedApiUrl().then(apiUrlToWsUrl),
};
