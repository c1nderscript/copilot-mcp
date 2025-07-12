import { getCompletions } from '../src/github-client';
import * as auth from '../src/auth';

describe('github client caching', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('caches completion results', async () => {
    const tokenSpy = jest.spyOn(auth, 'getInstallationToken').mockResolvedValue('token');
    jest.spyOn(auth, 'refreshGitHubAuth').mockResolvedValue();
    const responseData = { completion: 'result' };
    const fetchMock = jest.fn().mockResolvedValue(
      new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      })
    );
    // @ts-ignore
    global.fetch = fetchMock;

    const first = await getCompletions({ code: 'a', language: 'ts' }, { cache: true, cacheTTL: 1000, retries: 0 });
    const second = await getCompletions({ code: 'a', language: 'ts' }, { cache: true, cacheTTL: 1000, retries: 0 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first).toEqual(second);
    expect(tokenSpy).toHaveBeenCalled();
  });
});
