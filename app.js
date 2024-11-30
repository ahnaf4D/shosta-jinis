const http = require("http");
const fs = require("fs");
const path = require("path");
const pug = require("pug");
require('dotenv').config()
// Load product data
const products = require("./data/product.js");
const { cart, addToCart } = require('./data/cart.js');
const ITEMS_PER_PAGE = 2;
// Helper function to serve static files
function serveStaticFile(res, filePath, contentType) {
    const fullPath = path.join(__dirname, "public", filePath);
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("404 Not Found");
        } else {
            res.writeHead(200, { "Content-Type": contentType });
            res.end(data);
        }
    });
}

// Server creation
const server = http.createServer((req, res) => {
    const url = req.url;

    if (url === "/") {
        // Home page
        const html = pug.renderFile(path.join(__dirname, "views", "index.pug"), {
            title: "Mini E-commerce",
            products,
        });
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
    }
    // Update the home route to handle search queries
    else if (url.startsWith('/?search')) {
        const query = new URLSearchParams(url.split('?')[1]).get('search');
        const filteredProducts = products.filter(product =>
            product.title.toLowerCase().includes(query.toLowerCase())
        );
        const html = pug.renderFile(path.join(__dirname, 'views', 'index.pug'), {
            title: 'Search Results',
            products: filteredProducts,
        });
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
    }


    // Add to cart route
    else if (url.startsWith('/cart/add')) {
        const productId = parseInt(url.split('/').pop());
        const product = products.find((p) => p.id === productId);
        if (product) {
            addToCart(product);
            res.writeHead(302, { Location: '/cart' });
            res.end();
        } else {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Product not found!");
        }
    }

    // View cart route
    else if (url === '/cart') {
        const html = pug.renderFile(path.join(__dirname, 'views', 'cart.pug'), {
            title: 'Shopping Cart',
            cart,
        });
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
    }
    // Paginated route
    else if (url.startsWith('/page/')) {
        const page = parseInt(url.split('/').pop()) || 1;
        const start = (page - 1) * ITEMS_PER_PAGE;
        const paginatedProducts = products.slice(start, start + ITEMS_PER_PAGE);
        const html = pug.renderFile(path.join(__dirname, 'views', 'index.pug'), {
            title: `Page ${page}`,
            products: paginatedProducts,
            currentPage: page,
            hasNextPage: start + ITEMS_PER_PAGE < products.length,
            hasPrevPage: page > 1,
        });
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
    }

    else if (url.startsWith("/product/")) {
        // Product detail page
        const productId = parseInt(url.split("/")[2]);
        const product = products.find((p) => p.id === productId);
        if (!product) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Product not found!");
            return;
        }
        const html = pug.renderFile(
            path.join(__dirname, "views", "product.pug"),
            { title: product.name, product }
        );
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
    } else if (url.startsWith("/public/")) {
        // Serve static files
        const ext = path.extname(url);
        const contentType =
            ext === ".css"
                ? "text/css"
                : ext === ".js"
                    ? "application/javascript"
                    : "image/jpeg";
        serveStaticFile(res, url.replace("/public/", ""), contentType);
    } else {
        // 404 for unknown routes
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Not Found");
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
