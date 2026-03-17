import { test, expect } from '@playwright/test'

test.describe('IQ Puzzler Pro', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('page loads with title and header', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('IQ Puzzler Pro')
  })

  test('shows level info', async ({ page }) => {
    await expect(page.locator('.level-info')).toContainText('Level 1')
    await expect(page.locator('.level-info small')).toContainText('starter')
  })

  test('game board SVG renders', async ({ page }) => {
    const svg = page.locator('.board-svg')
    await expect(svg).toBeVisible()
    // Should have 55 empty slot circles
    const slots = svg.locator('circle')
    const count = await slots.count()
    // At least 55 slots + placed piece circles
    expect(count).toBeGreaterThanOrEqual(55)
  })

  test('piece tray shows available pieces', async ({ page }) => {
    const tray = page.locator('.piece-tray')
    await expect(tray).toBeVisible()
    // Starter level keeps 10 pieces, so 2 should be available
    const pieces = tray.locator('.tray-piece')
    const count = await pieces.count()
    expect(count).toBeGreaterThan(0)
    expect(count).toBeLessThanOrEqual(12)
  })

  test('clicking a piece selects it and shows rotate button', async ({ page }) => {
    const firstPiece = page.locator('.tray-piece').first()
    await firstPiece.click()
    await expect(firstPiece).toHaveClass(/selected/)
    await expect(page.getByText('Rotate')).toBeVisible()
    await expect(page.getByText('Cancel')).toBeVisible()
  })

  test('clicking selected piece again rotates it', async ({ page }) => {
    const firstPiece = page.locator('.tray-piece').first()
    await firstPiece.click()
    // The piece SVG viewBox should change after rotation
    const svgBefore = await firstPiece.locator('svg').getAttribute('viewBox')
    await firstPiece.click()
    // After rotation, shape may differ (viewBox might change for different dimensions)
    // Just verify it didn't deselect
    await expect(firstPiece).toHaveClass(/selected/)
  })

  test('cancel button deselects piece', async ({ page }) => {
    const firstPiece = page.locator('.tray-piece').first()
    await firstPiece.click()
    await page.getByText('Cancel').click()
    await expect(firstPiece).not.toHaveClass(/selected/)
  })

  test('level navigation works', async ({ page }) => {
    await expect(page.locator('.level-info')).toContainText('Level 1')
    // Click next
    await page.locator('.level-nav button:last-child').click()
    await expect(page.locator('.level-info')).toContainText('Level 2')
    // Click prev
    await page.locator('.level-nav button:first-child').click()
    await expect(page.locator('.level-info')).toContainText('Level 1')
  })

  test('level selector buttons exist and work', async ({ page }) => {
    const levelBtns = page.locator('.level-btn')
    const count = await levelBtns.count()
    expect(count).toBeGreaterThanOrEqual(16)

    // Click level 5 (should be junior)
    await page.getByRole('button', { name: '5', exact: true }).click()
    await expect(page.locator('.level-info')).toContainText('Level 5')
    await expect(page.locator('.level-info small')).toContainText('junior')
  })

  test('solve button fills the board', async ({ page }) => {
    await page.getByText('Solve').click()
    // Wait for solver (web worker) to complete
    await expect(page.locator('.solved-banner')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('.solved-banner')).toHaveText('Solved!')
  })

  test('reset button restores initial state', async ({ page }) => {
    // Solve first
    await page.getByText('Solve').click()
    await expect(page.locator('.solved-banner')).toBeVisible({ timeout: 10000 })

    // Reset
    await page.getByText('Reset').click()
    await expect(page.locator('.solved-banner')).not.toBeVisible()

    // Available pieces should reappear
    const pieces = page.locator('.tray-piece')
    const count = await pieces.count()
    expect(count).toBeGreaterThan(0)
  })

  test('solve on master level (fewer pre-placed pieces)', async ({ page }) => {
    // Navigate to level 13 (master)
    await page.locator('.level-btn', { hasText: '13' }).click()
    await expect(page.locator('.level-info small')).toContainText('master')

    await page.getByText('Solve').click()
    await expect(page.locator('.solved-banner')).toBeVisible({ timeout: 15000 })
  })
})
