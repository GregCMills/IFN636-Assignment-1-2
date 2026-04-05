import axiosInstance from './axiosConfig';

describe('axiosConfig', () => {
  it('uses a relative baseURL so requests go to the current host', () => {
    const baseURL = axiosInstance.defaults.baseURL ?? '';
    expect(baseURL).not.toMatch(/^https?:\/\//);
  });

  it('does not include /api in the baseURL (paths already contain /api)', () => {
    expect(axiosInstance.defaults.baseURL).not.toContain('/api');
  });

  it('sets Content-Type to application/json', () => {
    const headers = axiosInstance.defaults.headers as Record<string, unknown>;
    expect(headers['Content-Type']).toBe('application/json');
  });
});
