import { test, expect } from '@playwright/test';

test.describe('GuestCare E2E Application Flows', () => {
  test('Landing Gateway renders luxury brand presentation and navigation targets', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/GuestCare/i);
    await expect(page.locator('h1')).toContainText(/Resolve Guest Dissatisfaction/i);
    await expect(page.getByText('Guest Mobile Portal', { exact: false })).toBeVisible();
    await expect(page.getByText('Staff Command Center', { exact: false })).toBeVisible();
  });

  test('Guest Mobile Portal loads verified stay passport and allows detailed request submission', async ({ page }) => {
    await page.goto('/portal');

    // Verified Stay Passport Card
    await expect(page.getByText('Verified In-Stay Pass')).toBeVisible();
    await expect(page.getByText('Sarah Jenkins', { exact: false })).toBeVisible();
    await expect(page.getByText('Wi-Fi: GrandMarina-5G')).toBeVisible();

    // Verify Service Category Cards
    await expect(page.getByText('How May We Assist You?')).toBeVisible();
    await expect(page.getByText('Maintenance & Repairs')).toBeVisible();
    await expect(page.getByText('Housekeeping & Supplies')).toBeVisible();
    await expect(page.getByText('Comfort & Room Conditions')).toBeVisible();
    await expect(page.getByText('Internet & Technology')).toBeVisible();
    await expect(page.getByText('Concierge & Guest Services')).toBeVisible();
    await expect(page.getByText('Noise & Disturbances')).toBeVisible();

    // Open Housekeeping modal
    await page.getByText('Housekeeping & Supplies').click();
    await expect(page.getByText('Select Items & Quantities')).toBeVisible();

    // Close modal
    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  test('Staff Command Center displays KPI metrics, requests table, and guest health board', async ({ page }) => {
    await page.goto('/staff');

    await expect(page.getByText('Operational Command')).toBeVisible();
    await expect(page.getByText('Active Requests')).toBeVisible();
    await expect(page.getByText('Priority Action Queue')).toBeVisible();
    await expect(page.getByText('Guest Health Watch')).toBeVisible();

    // Navigate to All Requests
    await page.goto('/staff/requests');
    await expect(page.getByText('All Service Requests')).toBeVisible();
    await expect(page.getByPlaceholder('Search by ticket #')).toBeVisible();

    // Navigate to Guest Health Engine
    await page.goto('/staff/health');
    await expect(page.getByText('Guest Experience Health Engine')).toBeVisible();
    await expect(page.getByText('Rule-Based Health Logic')).toBeVisible();

    // Navigate to Reports & Analytics
    await page.goto('/staff/reports');
    await expect(page.getByText('Operations & Service Reports')).toBeVisible();
    await expect(page.getByText('Requests by Service Category')).toBeVisible();
    await expect(page.getByText('Workload by Department')).toBeVisible();
  });
});

