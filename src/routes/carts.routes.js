import { Router } from "express";
import fs from 'fs';

const cartsRoutes = Router();

// Función para leer el archivo de carritos
const getCarts = async () => {
    try {
        const carts = await fs.promises.readFile('src/db/carrito.json', 'utf-8');
        return JSON.parse(carts);
    } catch (error) {
        return [];
    }
};

// Función para guardar los carritos en el archivo
const saveCarts = async (carts) => {
    try {
        const parsedCarts = JSON.stringify(carts);
        await fs.promises.writeFile('src/db/carrito.json', parsedCarts, 'utf-8');
        return true;
    } catch (error) {
        return false;
    }
};

// Crear un nuevo carrito
cartsRoutes.post('/', async (req, res) => {
    const carts = await getCarts();
    const newCart = {
        id: Math.floor(Math.random() * 10000), // Generar ID único
        products: []
    };
    carts.push(newCart);
    const isOk = await saveCarts(carts);
    if (!isOk) {
        return res.status(500).send({ status: 'Error', message: 'No se pudo crear el carrito' });
    }
    res.status(201).send({ status: 'Ok', message: 'Carrito creado', cart: newCart });
});

// Obtener los productos de un carrito por su ID
cartsRoutes.get('/:cid', async (req, res) => {
    const cid = +req.params.cid;
    const carts = await getCarts();
    const cart = carts.find(c => c.id === cid);
    if (!cart) {
        return res.status(404).send({ status: 'Error', message: 'Carrito no encontrado' });
    }
    res.send({ cart });
});

// Agregar un producto a un carrito
cartsRoutes.post('/:cid/product/:pid', async (req, res) => {
    const cid = +req.params.cid;
    const pid = +req.params.pid;

    const carts = await getCarts();
    const cart = carts.find(c => c.id === cid);
    if (!cart) {
        return res.status(404).send({ status: 'Error', message: 'Carrito no encontrado' });
    }

    // Buscar si el producto ya existe en el carrito
    const productIndex = cart.products.findIndex(p => p.product === pid);
    if (productIndex !== -1) {
        // Si el producto ya está en el carrito, incrementar la cantidad
        cart.products[productIndex].quantity += 1;
    } else {
        // Si el producto no está, agregarlo con cantidad 1
        cart.products.push({ product: pid, quantity: 1 });
    }

    const isOk = await saveCarts(carts);
    if (!isOk) {
        return res.status(500).send({ status: 'Error', message: 'No se pudo agregar el producto al carrito' });
    }

    res.send({ status: 'Ok', message: 'Producto agregado al carrito', cart });
});

export default cartsRoutes;
