const { test, expect } = require('@playwright/test');
const BoardPage = require('../pages/BoardPage.cjs');
const { createTestCardText } = require('./helpers/test-data.cjs');

test('adding a card shows it in the correct column', async ({ page }) => {
    const boardPage = new BoardPage(page);
    await boardPage.goto();

    const cardText = createTestCardText('Design homepage');
    await boardPage.addCard('To Do', cardText);

    const column = boardPage.getColumn('To Do');
    await expect(column).toContainText(cardText);

    // ------------------------------------------------
    // CLEAN UP TEST CARD
    // ------------------------------------------------
    await boardPage.deleteCard(cardText);
    await expect(page.locator('.card', { hasText: cardText })).toHaveCount(0);
});

test('editing a card updates its text', async ({ page }) => {
    const boardPage = new BoardPage(page);
    await boardPage.goto();

    const originalText = createTestCardText('Draft wireframes');
    const updatedText = createTestCardText('Finalize wireframes');

    await boardPage.addCard('To Do', originalText);
    await boardPage.editCard(originalText, updatedText);

    await expect(page.locator('.card', { hasText: updatedText })).toBeVisible();
    await expect(page.locator('.card', { hasText: originalText })).toHaveCount(0);

    // ------------------------------------------------
    // CLEAN UP TEST CARD
    // ------------------------------------------------
    await boardPage.deleteCard(updatedText);
});

test('deleting a card removes it from the board', async ({ page }) => {
    const boardPage = new BoardPage(page);
    await boardPage.goto();

    const cardText = createTestCardText('Temporary task');
    await boardPage.addCard('In Progress', cardText);
    await expect(page.locator('.card', { hasText: cardText })).toBeVisible();

    await boardPage.deleteCard(cardText);
    await expect(page.locator('.card', { hasText: cardText })).toHaveCount(0);
});

test('adding a card in one browser tab appears in another automatically', async ({ browser }) => {
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    const boardPageA = new BoardPage(pageA);
    const boardPageB = new BoardPage(pageB);

    await boardPageA.goto();
    await boardPageB.goto();

    const cardText = createTestCardText('Realtime test card');
    await boardPageA.addCard('Done', cardText);

    // pageB never called addCard or reloaded - this only passes if the
    // Socket.io broadcast actually pushed the update to it live
    await expect(pageB.locator('.card', { hasText: cardText })).toBeVisible();

    // ------------------------------------------------
    // CLEAN UP TEST CARD
    // ------------------------------------------------
    await boardPageA.deleteCard(cardText);

    await contextA.close();
    await contextB.close();
});

test('dragging a card to another column moves it there', async ({ page }) => {
    const boardPage = new BoardPage(page);
    await boardPage.goto();

    const cardText = createTestCardText('Move me');
    await boardPage.addCard('To Do', cardText);

    await boardPage.dragCard(cardText, 'In Progress');

    const inProgressColumn = boardPage.getColumn('In Progress');
    await expect(inProgressColumn).toContainText(cardText);

    const toDoColumn = boardPage.getColumn('To Do');
    await expect(toDoColumn).not.toContainText(cardText);

    // ------------------------------------------------
    // CLEAN UP TEST CARD
    // ------------------------------------------------
    await boardPage.deleteCard(cardText);
});