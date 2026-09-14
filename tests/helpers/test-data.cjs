function uniqueSuffix() {
    return Date.now() + '' + Math.floor(Math.random() * 1000000);
}

function createTestCardText(prefix) {
    return (prefix || 'Test Card') + ' ' + uniqueSuffix();
}

module.exports = { createTestCardText };