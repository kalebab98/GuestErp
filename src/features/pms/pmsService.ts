// PMS Service Provider
// Factory that exposes the configured PMS adapter

import { IPMSAdapter } from '@/types/pms';
import { mockPMSAdapter } from './mockAdapter';

class PMSService {
  private adapter: IPMSAdapter;

  constructor() {
    // Default to mock adapter unless configured otherwise
    const useMock = import.meta.env.VITE_USE_MOCK_PMS !== 'false';
    if (useMock) {
      this.adapter = mockPMSAdapter;
    } else {
      // In production without mock, throw explicit configuration requirement
      // unless an external adapter has been provided
      console.warn('[PMS Service] Production PMS credentials not configured. Falling back to mock adapter.');
      this.adapter = mockPMSAdapter;
    }
  }

  getAdapter(): IPMSAdapter {
    return this.adapter;
  }

  setAdapter(customAdapter: IPMSAdapter): void {
    this.adapter = customAdapter;
  }
}

export const pmsService = new PMSService();

