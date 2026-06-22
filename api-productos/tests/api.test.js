import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function obtenerProductos() {
    const filePath = path.join(__dirname, '..', 'data', 'products.json');
    const content = await readFile(filePath, 'utf8');
    return JSON.parse(content);
}

test('El archivo de productos existe y contiene un arreglo válido', async () => {
    const products = await obtenerProductos();

    assert.ok(Array.isArray(products), 'products.json debe contener un arreglo');
    assert.ok(products.length > 0, 'El arreglo de productos no debe estar vacío');
});

test('Cada producto debe tener todos los campos requeridos', async () => {
    const products = await obtenerProductos();

    for (const product of products) {
        assert.ok('id' in product, 'Cada producto debe tener id');
        assert.ok('brand' in product, 'Cada producto debe tener brand');
        assert.ok('model' in product, 'Cada producto debe tener model');
        assert.ok('price' in product, 'Cada producto debe tener price');
        assert.ok('image' in product, 'Cada producto debe tener image');
        assert.ok('description' in product, 'Cada producto debe tener description');
        assert.ok('screen' in product, 'Cada producto debe tener screen');
        assert.ok('processor' in product, 'Cada producto debe tener processor');
        assert.ok('ram' in product, 'Cada producto debe tener ram');
        assert.ok('storage' in product, 'Cada producto debe tener storage');
        assert.ok('camera' in product, 'Cada producto debe tener camera');
        assert.ok('battery' in product, 'Cada producto debe tener battery');
        assert.ok('colors' in product, 'Cada producto debe tener colors');
        assert.ok('stock' in product, 'Cada producto debe tener stock');
        assert.ok('featured' in product, 'Cada producto debe tener featured');
        assert.ok('favorite' in product, 'Cada producto debe tener favorite');
    }
});

test('Cada producto debe tener tipos de datos válidos', async () => {
    const products = await obtenerProductos();

    for (const product of products) {
        assert.equal(typeof product.id, 'number', 'id debe ser numérico');
        assert.equal(typeof product.brand, 'string', 'brand debe ser texto');
        assert.equal(typeof product.model, 'string', 'model debe ser texto');
        assert.equal(typeof product.price, 'number', 'price debe ser numérico');
        assert.equal(typeof product.image, 'string', 'image debe ser texto');
        assert.equal(typeof product.description, 'string', 'description debe ser texto');
        assert.equal(typeof product.screen, 'string', 'screen debe ser texto');
        assert.equal(typeof product.processor, 'string', 'processor debe ser texto');
        assert.equal(typeof product.ram, 'string', 'ram debe ser texto');
        assert.equal(typeof product.storage, 'string', 'storage debe ser texto');
        assert.equal(typeof product.camera, 'string', 'camera debe ser texto');
        assert.equal(typeof product.battery, 'string', 'battery debe ser texto');
        assert.ok(Array.isArray(product.colors), 'colors debe ser un arreglo');
        assert.equal(typeof product.stock, 'number', 'stock debe ser numérico');
        assert.equal(typeof product.featured, 'boolean', 'featured debe ser booleano');
        assert.equal(typeof product.favorite, 'boolean', 'favorite debe ser booleano');
    }
});

test('Los campos de texto no deben estar vacíos', async () => {
    const products = await obtenerProductos();

    for (const product of products) {
        assert.ok(product.brand.trim().length > 0, 'brand no debe estar vacío');
        assert.ok(product.model.trim().length > 0, 'model no debe estar vacío');
        assert.ok(product.image.trim().length > 0, 'image no debe estar vacío');
        assert.ok(product.description.trim().length > 0, 'description no debe estar vacío');
        assert.ok(product.screen.trim().length > 0, 'screen no debe estar vacío');
        assert.ok(product.processor.trim().length > 0, 'processor no debe estar vacío');
        assert.ok(product.ram.trim().length > 0, 'ram no debe estar vacío');
        assert.ok(product.storage.trim().length > 0, 'storage no debe estar vacío');
        assert.ok(product.camera.trim().length > 0, 'camera no debe estar vacío');
        assert.ok(product.battery.trim().length > 0, 'battery no debe estar vacío');
    }
});

test('El precio, stock y colores deben tener valores válidos', async () => {
    const products = await obtenerProductos();

    for (const product of products) {
        assert.ok(product.id > 0, 'id debe ser mayor que cero');
        assert.ok(product.price > 0, 'price debe ser mayor que cero');
        assert.ok(product.stock >= 0, 'stock no debe ser negativo');
        assert.ok(product.colors.length > 0, 'colors debe tener al menos un color');

        for (const color of product.colors) {
            assert.equal(typeof color, 'string', 'Cada color debe ser texto');
            assert.ok(color.trim().length > 0, 'Cada color no debe estar vacío');
        }
    }
});