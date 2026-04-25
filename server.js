import express, { json } from 'express';
import cors from 'cors';
import { pool } from './config/db.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.static(join(__dirname, 'public')));
app.use(cors());
app.use(json());

const PORT = 3000;

// CATEGORÍAS
// Obtener todas las categorías
app.get('/categorias', async (req, res) =>{
    try {
        const [rows] = await pool.query('SELECT * FROM categorias');
        return res.status(200).json({
            success: true,
            message: 'Categorias obtenidas',
            data: rows
        });
    } catch (error) {
        console.log('Hubo un error: ', error);
        return res.status(500).json({
            success: false,
            message: 'Hubo un error'
        });
    }
});

// Crear una categoría
app.post('/categorias', async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        const sql = `INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)`;
        const [result] = await pool.query(sql, [nombre, descripcion]);

        return res.status(201).json({
            success: true,
            message: 'Categoria creada',
            id: result.insertId
        });
    } catch (error) {
        console.log('Hubo un error: ', error);
        return res.status(500).json({
            success: false,
            message: 'Hubo un error'
        });
    }
});

// Actualizar categoría
app.put('/categorias/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;

        const [existe] = await pool.query('SELECT id FROM categorias WHERE id = ?', [id]);

        if(existe.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        await pool.query(
            'UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?',
            [nombre, descripcion, id]
        );

        return res.status(200).json({
            success: true,
            message: 'Categoría actualizada correctamente'
        });

    } catch (error) {
        console.log('Hubo un error: ', error);
        return res.status(500).json({
            success: false,
            message: 'Hubo un error'
        });
    }
});

// PRODUCTOS
// Obtener todos los productos
app.get('/productos', async (req, res) => {
    try {
        const sql = `
            SELECT p.*, c.nombre AS categoria
            FROM productos p
            LEFT JOIN categorias c ON p.id_categoria = c.id
        `;
        const [rows] = await pool.query(sql);
        return res.status(200).json({
            success: true,
            message: 'Productos obtenidos',
            data: rows
        });
    } catch (error) {
        console.log('Hubo un error: ', error);
        return res.status(500).json({
            success: false,
            message: 'Hubo un error'
        });
    }
});

// Obtener producto por ID
app.get('/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const sql = `
            SELECT p.*, c.nombre AS categoria
            FROM productos p
            LEFT JOIN categorias c ON p.id_categoria = c.id
            WHERE p.id = ?
        `;
        const [rows] = await pool.query(sql, [id]);

        if(rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Producto encontrado',
            data: rows[0]
        });
    } catch (error) {
        console.log('Hubo un error: ', error);
        return res.status(500).json({
            success: false,
            message: 'Hubo un error'
        });
    }
});

// Crear producto
app.post('/productos', async (req, res) => {
    try {
        const { nombre, descripcion, precioCompra, precioVenta, stock, stockMinimo, idCategoria } = req.body;

        const sql = `
            INSERT INTO productos (nombre, descripcion, precio_compra, precio_venta, stock, stock_minimo, id_categoria)
            VALUES(?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [nombre, descripcion, precioCompra, precioVenta, stock, stockMinimo, idCategoria];
        const [result] = await pool.query(sql, values);

        return res.status(201).json({
            success: true,
            message: 'Producto creado',
            id: result.insertId
        });
    } catch (error) {
        console.log('Hubo un error: ', error);
        return res.status(500).json({
            success: false,
            message: 'Hubo un error'
        });
    }
});

// Actualizar producto
app.put('/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precioCompra, precioVenta, stock, stockMinimo, idCategoria } = req.body;

        const [existe] = await pool.query('SELECT id FROM productos WHERE id = ?', [id]);

        if(existe.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        const sql = `
            UPDATE productos SET nombre = ?,
                                 descripcion = ?,
                                 precio_compra = ?,
                                 precio_venta = ?,
                                 stock = ?,
                                 stock_minimo = ?,
                                 id_categoria = ?
                             WHERE id = ?
        `;
        const values = [nombre, descripcion, precioCompra, precioVenta, stock, stockMinimo, idCategoria, id];
        await pool.query(sql, values);

        return res.status(200).json({
            success: true,
            message: 'Producto actualizado correctamente'
        });
    } catch (error) {
        console.log('Hubo un error: ', error);
        return res.status(500).json({
            success: false,
            message: 'Hubo un error'
        });
    }
});

// Eliminar producto
app.delete('/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [existe] = await pool.query('SELECT id FROM productos WHERE id = ?', [id]);

        if(existe.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        await pool.query('DELETE FROM productos WHERE id = ?', [id]);

        return res.status(200).json({
            success: true,
            message: 'Producto eliminado correctamente'
        });
    } catch (error) {
        console.log('Hubo un error: ', error);
        return res.status(500).json({
            success: false,
            message: 'Hubo un error'
        });
    }
});

// VENTAS
// Registrar una venta
app.post('/ventas', async (req, res) => {
    const con = await pool.getConnection();
    try {
        const { productos, metodoPago } = req.body;

        await con.beginTransaction();

        const total = productos.reduce((acc, p) => acc + (p.cantidad * p.precioUnitario), 0);

        const [venta] = await con.query(
            'INSERT INTO ventas(total, metodo_pago) VALUES(?, ?)',
            [total, metodoPago]
        );

        for(const p of productos) {
            const subtotal = p.cantidad * p.precioUnitario;

            await con.query(
                'INSERT INTO detalle_ventas(id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES(?,?,?,?,?)',
                [venta.insertId, p.idProducto, p.cantidad, p.precioUnitario, subtotal]
            );

            await con.query(
                'UPDATE productos SET stock = stock - ? WHERE id = ?',
                [p.cantidad, p.idProducto]
            );
        }

        await con.commit();

        return res.status(201).json({
            success: true,
            message: 'Venta registrada correctamente',
            id: venta.insertId,
            total
        });
    } catch (error) {
        await con.rollback();
        console.log('Hubo un error: ', error);
        return res.status(500).json({
            success: false,
            message: 'Hubo un error'
        });
    } finally {
        con.release();
    }
});

// Obtener todas las ventas
app.get('/ventas', async (req, res) => {
    try {
        const sql = `
            SELECT v.id, v.total, v.fecha_venta, v.metodo_pago,
                   dv.cantidad, dv.precio_unitario, dv.subtotal,
                   p.nombre AS producto
            FROM ventas v
            LEFT JOIN detalle_ventas dv ON v.id = dv.id_venta
            LEFT JOIN productos p ON dv.id_producto = p.id
            ORDER BY v.fecha_venta DESC
        `;
        const [rows] = await pool.query(sql);

        return res.status(200).json({
            success: true,
            message: 'Ventas obtenidas',
            data: rows
        });
    } catch (error) {
        console.log('Hubo un error: ', error);
        return res.status(500).json({
            success: false,
            message: 'Hubo un error'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});