const { expect } = require('@playwright/test');

class BoardPage {
    constructor(page) {
        this.page = page;
    }

    async goto() {
        await this.page.goto('/');
    }

    getColumn(title) {
        return this.page.locator('.column', { hasText: title });
    }

    getCard(text) {
        return this.page.locator('.card', { hasText: text });
    }

    async addCard(columnTitle, text) {
        const column = this.getColumn(columnTitle);
        const input = column.locator('input[type="text"]');
        const addButton = column.locator('button:has-text("Add")');

        await input.fill(text);

        const responsePromise = this.page.waitForResponse(resp =>
            resp.url().includes('/api/cards') && resp.request().method() === 'POST'
        );

        await addButton.click();
        await responsePromise;
    }

    async editCard(oldText, newText) {
        const card = this.getCard(oldText);
        await card.locator('button:has-text("Edit")').click();

        const editInput = this.page.locator('.card-edit input');
        await editInput.fill(newText);

        const responsePromise = this.page.waitForResponse(resp =>
            resp.url().includes('/api/cards/') && resp.request().method() === 'PUT'
        );

        await this.page.locator('.card-edit button:has-text("Save")').click();
        await responsePromise;
    }

    async deleteCard(text) {
        const card = this.getCard(text);

        const responsePromise = this.page.waitForResponse(resp =>
            resp.url().includes('/api/cards/') && resp.request().method() === 'DELETE'
        );

        await card.locator('button:has-text("Delete")').click();
        await responsePromise;
    }

    async dragCard(cardText, targetColumnTitle) {
        const card = this.getCard(cardText);
        const targetColumn = this.getColumn(targetColumnTitle);

        const cardBox = await card.boundingBox();
        const targetBox = await targetColumn.boundingBox();

        const startX = cardBox.x + cardBox.width / 2;
        const startY = cardBox.y + cardBox.height / 2;
        const endX = targetBox.x + targetBox.width / 2;
        const endY = targetBox.y + targetBox.height / 2;

        const responsePromise = this.page.waitForResponse(resp =>
            resp.url().includes('/api/columns/') && resp.request().method() === 'PATCH'
        );

        await this.page.mouse.move(startX, startY);
        await this.page.mouse.down();
        // A small initial move is required to cross the library's internal
        // "this is actually a drag, not a click" threshold
        await this.page.mouse.move(startX + 10, startY + 10, { steps: 5 });
        await this.page.mouse.move(endX, endY, { steps: 10 });
        await this.page.mouse.move(endX, endY, { steps: 5 });
        await this.page.mouse.up();

        await responsePromise;
    }

    async addColumn(title) {
    const input = this.page.locator('.add-column-form input');
    const addButton = this.page.locator('.add-column-form button');

    await expect(async () => {
        await input.fill(title);
        const responsePromise = this.page.waitForResponse(resp =>
            resp.url().includes('/api/columns') &&
            resp.request().method() === 'POST',
            { timeout: 3000 }
        );
        await addButton.click({ force: true });
        await responsePromise;
    }).toPass({ timeout: 20000 });

    await this.getColumn(title).waitFor({ state: 'visible' });

    // Give the app a moment to fully settle after the live re-render this
    // change triggers, before any follow-up interaction touches the page.
    await this.page.waitForTimeout(1000);
}

    async renameColumn(oldTitle, newTitle) {
        // Retry entering edit mode as a unit, in case a live re-render eats a click.
        await expect(async () => {
            const column = this.getColumn(oldTitle);
            await column.locator('button:has-text("Rename")').click({ force: true });
            await expect(this.page.locator('.column-title-edit input')).toBeVisible({ timeout: 2000 });
        }).toPass({ timeout: 20000 });

        const editInput = this.page.locator('.column-title-edit input');
        await editInput.fill(newTitle);

        // Retry saving the same way.
        await expect(async () => {
            const responsePromise = this.page.waitForResponse(resp =>
                resp.url().includes('/api/columns/') &&
                resp.request().method() === 'PUT',
                { timeout: 3000 }
            );
            await this.page.locator('.column-title-edit button:has-text("Save")').click({ force: true });
            await responsePromise;
        }).toPass({ timeout: 20000 });

        await this.getColumn(newTitle).waitFor({ state: 'visible' });
    }

    async deleteColumn(title) {
        await expect(async () => {
            const column = this.getColumn(title);
            const responsePromise = this.page.waitForResponse(resp =>
                resp.url().includes('/api/columns/') &&
                resp.request().method() === 'DELETE',
                { timeout: 3000 }
            );
            await column.locator('button:has-text("Delete")').click({ force: true });
            await responsePromise;
        }).toPass({ timeout: 20000 });

        await this.getColumn(title).waitFor({ state: 'detached' });
    }
}

module.exports = BoardPage;