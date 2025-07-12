import { getInstallationToken, refreshGitHubAuth } from './auth';

const API_BASE = 'https://api.github.com/copilot/v1';

interface RequestOptions {
  retries?: number;
}

interface CacheEntry<T> {
  expires: number;
  value: T;
}

interface CompletionOptions extends RequestOptions {
  cache?: boolean;
  cacheTTL?: number; // milliseconds
}

const completionCache = new Map<string, CacheEntry<any>>();

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function requestCopilot<T>(endpoint: string, body: any, options: RequestOptions = {}): Promise<T> {
  const retries = options.retries ?? 2;
  let attempt = 0;

  while (true) {
    const token = await getInstallationToken();
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'copilot-mcp'
      },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      return (await res.json()) as T;
    }

    // handle auth errors
    if ((res.status === 401 || res.status === 403) && attempt < retries) {
      await refreshGitHubAuth();
      attempt++;
      continue;
    }

    // rate limit handling
    if (res.status === 429 && attempt < retries) {
      const retryAfter = Number(res.headers.get('retry-after')) || Math.pow(2, attempt);
      await delay(retryAfter * 1000);
      attempt++;
      continue;
    }

    // server errors
    if (res.status >= 500 && attempt < retries) {
      await delay(Math.pow(2, attempt) * 1000);
      attempt++;
      continue;
    }

    const text = await res.text();
    throw new Error(`GitHub Copilot API error: ${res.status} ${text}`);
  }
}

export async function getCompletions(params: any, options: CompletionOptions = {}): Promise<any> {
  const useCache = options.cache !== false;
  const ttl = options.cacheTTL ?? 5 * 60 * 1000; // default 5 minutes
  const key = JSON.stringify(params);
  const now = Date.now();

  if (useCache) {
    const cached = completionCache.get(key);
    if (cached && cached.expires > now) {
      return cached.value;
    }
  }

  const result = await requestCopilot<any>('completions', params, options);
  if (useCache) {
    completionCache.set(key, { value: result, expires: now + ttl });
  }
  return result;
}

export async function getReview(params: any, options: RequestOptions = {}): Promise<any> {
  return requestCopilot('review', params, options);
}

export async function getExplanation(params: any, options: RequestOptions = {}): Promise<any> {
  return requestCopilot('explain', params, options);
}
