import { getInstallationToken, refreshGitHubAuth } from '../src/auth';
import { Octokit } from '@octokit/rest';
import fs from 'fs';

jest.mock('fs');
jest.mock('@octokit/rest');

describe('auth', () => {
  const mockedFs = fs as unknown as jest.Mocked<typeof fs>;
  const mockOctokit = {
    rest: {
      apps: {
        createInstallationAccessToken: jest.fn()
      }
    }
  } as any;

  beforeEach(() => {
    jest.resetAllMocks();
    (Octokit as unknown as jest.Mock).mockImplementation(() => mockOctokit);
    mockedFs.promises = {
      readFile: jest.fn().mockResolvedValue('mock-key') as any
    } as any;
    process.env.GITHUB_APP_ID = '1';
    process.env.GITHUB_PRIVATE_KEY = 'key';
    process.env.GITHUB_INSTALLATION_ID = '2';
  });

  it('refreshes and caches token', async () => {
    const tokenData = {
      data: { token: 'abc', expires_at: new Date(Date.now() + 60000).toISOString() }
    };
    mockOctokit.rest.apps.createInstallationAccessToken.mockResolvedValue(tokenData);

    const token = await getInstallationToken();
    expect(token).toBe('abc');
    expect(mockOctokit.rest.apps.createInstallationAccessToken).toHaveBeenCalledTimes(1);

    const token2 = await getInstallationToken();
    expect(token2).toBe('abc');
    expect(mockOctokit.rest.apps.createInstallationAccessToken).toHaveBeenCalledTimes(1);
  });

  it('throws when installation id missing', async () => {
    delete process.env.GITHUB_INSTALLATION_ID;
    await expect(refreshGitHubAuth()).rejects.toThrow('Missing installation id');
  });
});
