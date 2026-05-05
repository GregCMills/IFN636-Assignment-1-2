import axiosInstance from './axiosConfig';

describe('axiosConfig', () => {
  it('uses a relative baseURL so requests go to the current host', () => {
    const baseURL = axiosInstance.defaults.baseURL ?? '';
    expect(baseURL).not.toMatch(/^https?:\/\//);
  });

  it('does not include /api in the baseURL (paths already contain /api)', () => {
    expect(axiosInstance.defaults.baseURL).not.toContain('/api');
  });

  it('does not set Content-Type as a default header (axios auto-detects per request)', () => {
    const headers = axiosInstance.defaults.headers as Record<string, unknown>;
    expect(headers['Content-Type']).toBeUndefined();
  });
});
