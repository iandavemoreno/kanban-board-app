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
            resp.url().includes('/api/cards') &&
            resp.request().method() === 'POST'
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
            resp.url().includes('/api/cards/') &&
            resp.request().method() === 'PUT'
        );

        await this.page.locator('.card-edit button:has-text("Save")').click();
        await responsePromise;
    }

    async deleteCard(text) {
        const card = this.getCard(text);

        const responsePromise = this.page.waitForResponse(resp =>
            resp.url().includes('/api/cards/') &&
            resp.request().method() === 'DELETE'
        );

        await card.locator('button:has-text("Delete")').click();
        await responsePromise;
    }
}

module.exports = BoardPage;