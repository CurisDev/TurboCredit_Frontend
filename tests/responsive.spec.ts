import { test, expect } from '@playwright/test';

test.describe('Responsive Layout', () => {
  test('App should load and not have horizontal overflow on both desktop and mobile', async ({ page, isMobile }) => {
    // Navigate to the simulator page since the dashboard redirects there if no token?
    // Let's just navigate to root and see.
    await page.goto('/');
    
    // Wait for the main container to load
    await page.waitForLoadState('networkidle');

    // Check that body does not have horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalOverflow).toBe(false);
  });
});
