import { promises as fs } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { Octokit } from '@octokit/rest';

interface GitHubAppConfig {
  appId: string;
  privateKey: string;
  installationId?: string;
}

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function readConfig(): Promise<GitHubAppConfig> {
  const envAppId = process.env.GITHUB_APP_ID;
  let envPrivateKey = process.env.GITHUB_PRIVATE_KEY;
  const envPrivateKeyPath = process.env.GITHUB_PRIVATE_KEY_PATH;
  const envInstallationId = process.env.GITHUB_INSTALLATION_ID;

  if (!envPrivateKey && envPrivateKeyPath) {
    envPrivateKey = await fs.readFile(envPrivateKeyPath, 'utf8');
  }

  if (envAppId && envPrivateKey) {
    return {
      appId: envAppId,
      privateKey: envPrivateKey,
      installationId: envInstallationId,
    };
  }

  const filePath = path.join(__dirname, '..', 'config', 'github-app.json');
  const raw = await fs.readFile(filePath, 'utf8');
  const data = JSON.parse(raw);
  return {
    appId: data.appId,
    privateKey: data.privateKey,
    installationId: data.installationId,
  };
}

function generateAppJWT(config: GitHubAppConfig): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now,
    exp: now + 9 * 60,
    iss: config.appId,
  };
  return jwt.sign(payload, config.privateKey, { algorithm: 'RS256' });
}

async function createInstallationToken(config: GitHubAppConfig): Promise<{ token: string; expiresAt: string }> {
  const appOctokit = new Octokit({ auth: generateAppJWT(config) });
  const res = await appOctokit.rest.apps.createInstallationAccessToken({
    installation_id: Number(config.installationId),
  });
  return { token: res.data.token, expiresAt: res.data.expires_at };
}

async function createInstallationTokenWithRetry(config: GitHubAppConfig, retries = 2): Promise<{ token: string; expiresAt: string }> {
  let lastError: any;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await createInstallationToken(config);
    } catch (err: any) {
      lastError = err;
      if (err.status === 401 || err.status === 403) {
        await new Promise(r => setTimeout(r, (attempt + 1) * 1000));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

export async function refreshGitHubAuth(): Promise<void> {
  const config = await readConfig();
  if (!config.installationId) {
    throw new Error('Missing installation id');
  }
  const { token, expiresAt } = await createInstallationTokenWithRetry(config);
  cachedToken = token;
  tokenExpiresAt = new Date(expiresAt).getTime();
}

export async function getInstallationToken(): Promise<string> {
  if (!cachedToken || Date.now() >= tokenExpiresAt - 60 * 1000) {
    await refreshGitHubAuth();
  }
  if (!cachedToken) {
    throw new Error('Failed to acquire GitHub installation token');
  }
  return cachedToken;
}
