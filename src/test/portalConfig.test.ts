import { describe, it, expect, beforeEach } from 'vitest';
import { portalConfigService } from '../features/config/portalConfigService';
import { requestService } from '../features/requests/requestService';

describe('Staff Portal Content & Catalog Configuration Service', () => {
  beforeEach(() => {
    portalConfigService.resetDefaults();
  });

  it('provides editable FAQs and reflects staff additions, updates, and deletions', () => {
    const initialCount = portalConfigService.getFaqs().length;
    expect(initialCount).toBeGreaterThan(0);

    const added = portalConfigService.addFaq('Is breakfast available?', 'Yes, order via Local Shops & Delivery.');
    expect(portalConfigService.getFaqs().length).toBe(initialCount + 1);

    portalConfigService.updateFaq(added.id, { isActive: false });
    expect(portalConfigService.getFaqs(true).some(f => f.id === added.id)).toBe(false);

    portalConfigService.deleteFaq(added.id);
    expect(portalConfigService.getFaqs().length).toBe(initialCount);
  });

  it('syncs staff-edited deliverable items directly into guest service categories', () => {
    const addedItem = portalConfigService.addDeliverableItem({
      categoryCode: 'shop_delivery',
      name: 'Prepaid Data SIM Card',
      unit: 'cards',
      maxQty: 3,
      isActive: true,
    });

    const shopCategory = requestService.getCategoryById('shop_delivery');
    expect(shopCategory).toBeDefined();
    expect(shopCategory?.presetItems?.some(i => i.id === addedItem.id && i.name === 'Prepaid Data SIM Card')).toBe(true);
  });

  it('includes Laundry, Shop & Delivery, and Front Desk categories without AC support', () => {
    const categories = requestService.getCategories();
    const codes = categories.map(c => c.code);

    expect(codes).toContain('laundry');
    expect(codes).toContain('shop_delivery');
    expect(codes).not.toContain('noise');

    const frontDesk = categories.find(c => c.code === 'guest_services');
    expect(frontDesk?.shortName).toBe('Front Desk');

    const maint = categories.find(c => c.code === 'maintenance');
    const maintText = `${maint?.name} ${maint?.description} ${(maint?.commonIssues || []).join(' ')}`.toLowerCase();
    expect(maintText).not.toContain('air condition');
    expect(maintText).not.toContain('ac blowing');
  });

  it('manages local service providers for cards, cigarettes, coffee, tea, and food', () => {
    const providers = portalConfigService.getProviders(true);
    expect(providers.length).toBeGreaterThanOrEqual(3);

    const newVendor = portalConfigService.addProvider({
      name: 'Express Tea & Snacks',
      category: 'Tea & Snacks',
      description: 'Hot spiced tea and local pastries',
      itemsOffered: ['Spiced Tea', 'Samosas'],
      phone: '+15551112222',
      hours: '7 AM - 11 PM',
      isActive: true,
    });

    expect(portalConfigService.getProviders(true).some(p => p.id === newVendor.id)).toBe(true);
    portalConfigService.deleteProvider(newVendor.id);
    expect(portalConfigService.getProviders().some(p => p.id === newVendor.id)).toBe(false);
  });

  it('allows staff to edit portal branding, popular cards, category labels, and presets', () => {
    portalConfigService.updateBranding({
      portalBrandName: 'Stadium Residences',
      heroHeadline: 'WELCOME HOME!',
      noticeBanner: 'Elevator check at 3 PM',
    });
    const branding = portalConfigService.getBranding();
    expect(branding.portalBrandName).toBe('Stadium Residences');
    expect(branding.heroHeadline).toBe('WELCOME HOME!');
    expect(branding.noticeBanner).toBe('Elevator check at 3 PM');

    portalConfigService.updateCategoryOverride('laundry', {
      shortName: 'Express Laundry',
      slaMinutes: 20,
    });
    const laundry = requestService.getCategoryById('laundry');
    expect(laundry?.shortName).toBe('Express Laundry');
    expect(laundry?.slaMinutes).toBe(20);

    const addedPop = portalConfigService.addPopularService({
      title: 'Airport Pickup',
      subtitle: 'Front Desk',
      eta: '~15 min',
      categoryCode: 'guest_services',
      presetText: 'Airport taxi / ride booking',
      imageUrl: 'https://example.com/taxi.jpg',
      isActive: true,
    });
    expect(portalConfigService.getPopularServices(true).some(p => p.id === addedPop.id)).toBe(true);

    const preset = portalConfigService.addPreset('maintenance', 'Check balcony lock');
    portalConfigService.updatePreset(preset.id, { label: 'Check main door lock' });
    expect(portalConfigService.getPresets('maintenance').some(p => p.label === 'Check main door lock')).toBe(true);
  });
});

