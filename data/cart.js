const cart = [];

module.exports = {
    cart,
    addToCart: (product) => {
        const existing = cart.find((item) => item.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
    },
};
