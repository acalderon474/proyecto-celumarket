import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsPath = path.join(__dirname, "data", "products.json");

app.use(cors());
app.use(express.json());

// Función para leer los productos desde el archivo JSON
function readProducts() {
    const data = fs.readFileSync(productsPath, "utf8");
    return JSON.parse(data);
}

// Ruta para comprobar que la API funciona
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "API de CeluMarket funcionando correctamente"
    });
});

// Ruta para obtener todos los productos o filtrar por marca
app.get("/api/products", (req, res) => {
    const { brand } = req.query;
    let products = readProducts();

    if (brand && brand !== "todos" && brand !== "all") {
        products = products.filter(
            product =>
                product.brand &&
                product.brand.toLowerCase() === brand.toLowerCase()
        );
    }

    res.json(products);
});

// Ruta para obtener un producto por ID
app.get("/api/products/:id", (req, res) => {
    const products = readProducts();

    const product = products.find(
        item => String(item.id) === String(req.params.id)
    );

    if (!product) {
        return res.status(404).json({
            message: "Producto no encontrado"
        });
    }

    res.json(product);
});

// Ruta para obtener las marcas disponibles
app.get("/api/brands", (req, res) => {
    const products = readProducts();

    const brands = [...new Set(products.map(product => product.brand))];

    res.json(brands);
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`API de CeluMarket ejecutándose en el puerto ${PORT}`);
});