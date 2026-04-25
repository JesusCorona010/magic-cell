// NAVEGACIÓN

const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();

        navItems.forEach(n => n.classList.remove('active'));
        pages.forEach(p => p.classList.remove('active'));

        item.classList.add('active');
        const page = item.dataset.page;
        document.getElementById(page).classList.add('active');
    });
});

// Llamar funciones al cambiar de página
navItems.forEach(item => {
    item.addEventListener('click', () => {
        const page = item.dataset.page;
        if(page === 'productos') cargarProductos();
        if(page === 'dashboard') cargarDashboard();
        if(page === 'categorias') cargarCategorias();
        if(page === 'ventas') cargarVentas();
        if(page === 'historial') cargarHistorial();
    });
});

// URL BASE

const URL = 'https://magic-cell-production.up.railway.app';

// NOTIFICACIONES

function mostrarNotificacion(mensaje, tipo = 'exito') {
    const iconos = {
        exito: 'fa-circle-check',
        error: 'fa-circle-xmark',
        advertencia: 'fa-triangle-exclamation'
    };

    const notif = document.createElement('div');
    notif.classList.add('notificacion', tipo);
    notif.innerHTML = `
        <i class="fa-solid ${iconos[tipo]}"></i>
        <span>${mensaje}</span>
    `;

    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3500);
}

// MODAL DE CONFIRMACIÓN

function mostrarConfirmacion(titulo, mensaje) {
    return new Promise((resolve) => {
        const modalConf = document.getElementById('modalConfirmacion');
        document.getElementById('confirmacionTitulo').textContent = titulo;
        document.getElementById('confirmacionMensaje').textContent = mensaje;
        modalConf.classList.add('active');

        document.getElementById('confirmacionAceptar').onclick = () => {
            modalConf.classList.remove('active');
            resolve(true);
        };

        document.getElementById('confirmacionCancelar').onclick = () => {
            modalConf.classList.remove('active');
            resolve(false);
        };
    });
}

// ALERTA DE STOCK BAJO

async function verificarStockBajo() {
    try {
        const res = await fetch(`${URL}/productos`);
        const data = await res.json();

        const productosBajos = data.data.filter(p => p.stock <= p.stock_minimo);

        if(productosBajos.length === 0) return;

        mostrarNotificacion(`⚠️ ${productosBajos.length} producto(s) con stock bajo`, 'advertencia');

    } catch (error) {
        console.log('Hubo un error: ', error);
    }
}

// DASHBOARD

async function cargarDashboard() {
    try {
        const [resProductos, resVentas] = await Promise.all([
            fetch(`${URL}/productos`),
            fetch(`${URL}/ventas`)
        ]);

        const dataProductos = await resProductos.json();
        const dataVentas = await resVentas.json();

        const productos = dataProductos.data;
        const ventas = dataVentas.data;

        // Total inventario
        document.getElementById('totalInventario').textContent = productos.length;

        // Stock bajo
        const bajos = productos.filter(p => p.stock <= p.stock_minimo);
        document.getElementById('stockBajo').textContent = bajos.length;

        // Ventas de hoy
        const hoy = new Date().toLocaleDateString();
        const ventasHoy = ventas.filter(v => new Date(v.fecha_venta).toLocaleDateString() === hoy);
        const totalHoy = ventasHoy.reduce((acc, v) => acc + parseFloat(v.total), 0);
        document.getElementById('ventasHoy').textContent = `$${totalHoy.toFixed(2)}`;

        // Productos vendidos hoy
        document.getElementById('productosVendidos').textContent = ventasHoy.length;

        // Historial de ventas en dashboard
        const historial = document.getElementById('historialVentas');
        historial.innerHTML = '';

        if(ventas.length === 0) {
            historial.innerHTML = '<p style="color: var(--text-light)">No hay ventas registradas</p>';
            return;
        }

        const ventasHoyAgrupadas = {};
        ventasHoy.forEach(v => {
            if(!ventasHoyAgrupadas[v.id]) {
                ventasHoyAgrupadas[v.id] = {
                    id: v.id,
                    total: v.total,
                    fecha: v.fecha_venta,
                    metodoPago: v.metodo_pago,
                    productos: []
                };
            }
            ventasHoyAgrupadas[v.id].productos.push(`${v.producto} x${v.cantidad}`);
        });

        // Si no hay ventas en el dia
        if(Object.keys(ventasHoyAgrupadas).length === 0) {
            historial.innerHTML = '<p style="color: var(--text-light)">No hay ventas hoy</p>';
            return;
        }

        Object.values(ventasHoyAgrupadas).forEach(v => {
            const div = document.createElement('div');
            div.classList.add('venta-item');
            div.innerHTML = `
                <div class="venta-item-header">
                    <span>Venta #${v.id}</span>
                    <span>$${parseFloat(v.total).toFixed(2)}</span>
                </div>
                <div class="venta-item-fecha">
                    ${new Date(v.fecha).toLocaleString()} · 
                    <span>${v.metodoPago === 'tarjeta' ? '💳 Tarjeta' : '💵 Efectivo'}</span>
                </div>
                <div class="venta-item-detalle">${v.productos.join(', ')}</div>
            `;
            historial.appendChild(div);
        });

    } catch (error) {
        console.log('Hubo un error: ', error);
    }
}

// PRODUCTOS

async function cargarProductos() {
    try {
        const res = await fetch(`${URL}/productos`);
        const data = await res.json();

        const tbody = document.getElementById('tablaProductos');
        tbody.innerHTML = '';

        if(data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">No hay productos registrados</td></tr>';
            return;
        }

        data.data.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.id}</td>
                <td>${p.nombre}</td>
                <td>${p.categoria || 'Sin categoría'}</td>
                <td>$${parseFloat(p.precio_compra).toFixed(2)}</td>
                <td>$${parseFloat(p.precio_venta).toFixed(2)}</td>
                <td class="${p.stock <= p.stock_minimo ? 'stock-bajo' : ''}">${p.stock}</td>
                <td>
                    <button class="btn-edit" onclick="editarProducto(${p.id})">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-danger" onclick="eliminarProducto(${p.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.log('Hubo un error: ', error);
    }
}

// MODAL PRODUCTOS

const modal = document.getElementById('modalProducto');
const btnAgregarProducto = document.getElementById('btnAgregarProducto');
const cerrarModal = document.getElementById('cerrarModal');
const cancelarModal = document.getElementById('cancelarModal');

btnAgregarProducto.addEventListener('click', async () => {
    document.getElementById('modalTitulo').textContent = 'Agregar Producto';
    document.getElementById('productoId').value = '';
    document.getElementById('inputNombre').value = '';
    document.getElementById('inputDescripcion').value = '';
    document.getElementById('inputPrecioCompra').value = '';
    document.getElementById('inputPrecioVenta').value = '';
    document.getElementById('inputStock').value = '';
    document.getElementById('inputStockMinimo').value = '';
    await cargarCategoriasSelect();
    modal.classList.add('active');
});

cerrarModal.addEventListener('click', () => modal.classList.remove('active'));
cancelarModal.addEventListener('click', () => modal.classList.remove('active'));

async function cargarCategoriasSelect() {
    const res = await fetch(`${URL}/categorias`);
    const data = await res.json();
    const select = document.getElementById('inputCategoria');
    select.innerHTML = '';
    data.data.forEach(c => {
        const option = document.createElement('option');
        option.value = c.id;
        option.textContent = c.nombre;
        select.appendChild(option);
    });
}

document.getElementById('guardarProducto').addEventListener('click', async () => {
    const id = document.getElementById('productoId').value;
    const nombre = document.getElementById('inputNombre').value.trim();
    const descripcion = document.getElementById('inputDescripcion').value.trim();
    const precioCompra = document.getElementById('inputPrecioCompra').value;
    const precioVenta = document.getElementById('inputPrecioVenta').value;
    const stock = document.getElementById('inputStock').value;
    const stockMinimo = document.getElementById('inputStockMinimo').value;
    const idCategoria = document.getElementById('inputCategoria').value;

    if(!nombre) {
        mostrarNotificacion('El nombre del producto es obligatorio', 'error');
        return;
    }
    if(!precioCompra || precioCompra <= 0) {
        mostrarNotificacion('El precio de compra debe ser mayor a 0', 'error');
        return;
    }
    if(!precioVenta || precioVenta <= 0) {
        mostrarNotificacion('El precio de venta debe ser mayor a 0', 'error');
        return;
    }
    if(parseFloat(precioVenta) < parseFloat(precioCompra)) {
        mostrarNotificacion('El precio de venta no puede ser menor al precio de compra', 'error');
        return;
    }
    if(stock < 0) {
        mostrarNotificacion('El stock no puede ser negativo', 'error');
        return;
    }
    if(stockMinimo < 0) {
        mostrarNotificacion('El stock mínimo no puede ser negativo', 'error');
        return;
    }

    const data = { nombre, descripcion, precioCompra, precioVenta, stock, stockMinimo, idCategoria };
    const metodo = id ? 'PUT' : 'POST';
    const endpoint = id ? `${URL}/productos/${id}` : `${URL}/productos`;

    try {
        const res = await fetch(endpoint, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const resultado = await res.json();

        if(resultado.success) {
            mostrarNotificacion(id ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
            modal.classList.remove('active');
            cargarProductos();
            cargarDashboard();
        }
    } catch (error) {
        console.log('Hubo un error: ', error);
        mostrarNotificacion('Hubo un error al guardar el producto', 'error');
    }
});

async function editarProducto(id) {
    const res = await fetch(`${URL}/productos/${id}`);
    const data = await res.json();
    const p = data.data;

    document.getElementById('modalTitulo').textContent = 'Editar Producto';
    document.getElementById('productoId').value = p.id;
    document.getElementById('inputNombre').value = p.nombre;
    document.getElementById('inputDescripcion').value = p.descripcion;
    document.getElementById('inputPrecioCompra').value = p.precio_compra;
    document.getElementById('inputPrecioVenta').value = p.precio_venta;
    document.getElementById('inputStock').value = p.stock;
    document.getElementById('inputStockMinimo').value = p.stock_minimo;
    await cargarCategoriasSelect();
    document.getElementById('inputCategoria').value = p.id_categoria;
    modal.classList.add('active');
}

async function eliminarProducto(id) {
    const confirmado = await mostrarConfirmacion(
        '¿Eliminar producto?',
        'Esta acción no se puede deshacer'
    );
    if(!confirmado) return;

    try {
        const res = await fetch(`${URL}/productos/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if(data.success) {
            mostrarNotificacion('Producto eliminado correctamente');
            cargarProductos();
            cargarDashboard();
        }
    } catch (error) {
        console.log('Hubo un error: ', error);
        mostrarNotificacion('Hubo un error al eliminar', 'error');
    }
}

// CATEGORÍAS

// CATEGORÍAS

const modalCategoria = document.getElementById('modalCategoria');
const cerrarModalCategoria = document.getElementById('cerrarModalCategoria');
const cancelarModalCategoria = document.getElementById('cancelarModalCategoria');

cerrarModalCategoria.addEventListener('click', () => modalCategoria.classList.remove('active'));
cancelarModalCategoria.addEventListener('click', () => modalCategoria.classList.remove('active'));

async function cargarCategorias() {
    try {
        const res = await fetch(`${URL}/categorias`);
        const data = await res.json();

        const tbody = document.getElementById('tablaCategorias');
        tbody.innerHTML = '';

        if(data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No hay categorías registradas</td></tr>';
            return;
        }

        data.data.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${c.id}</td>
                <td>${c.nombre}</td>
                <td>${c.descripcion || 'Sin descripción'}</td>
                <td>${new Date(c.fecha_registro).toLocaleDateString()}</td>
                <td>
                    <button class="btn-edit" onclick="editarCategoria(${c.id}, '${c.nombre}', '${c.descripcion || ''}')">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.log('Hubo un error: ', error);
    }
}

document.getElementById('btnAgregarCategoria').addEventListener('click', () => {
    document.getElementById('modalTituloCategoria').textContent = 'Agregar Categoría';
    document.getElementById('categoriaId').value = '';
    document.getElementById('inputNombreCategoria').value = '';
    document.getElementById('inputDescripcionCategoria').value = '';
    modalCategoria.classList.add('active');
});

function editarCategoria(id, nombre, descripcion) {
    document.getElementById('modalTituloCategoria').textContent = 'Editar Categoría';
    document.getElementById('categoriaId').value = id;
    document.getElementById('inputNombreCategoria').value = nombre;
    document.getElementById('inputDescripcionCategoria').value = descripcion;
    modalCategoria.classList.add('active');
}

document.getElementById('guardarCategoria').addEventListener('click', async () => {
    const id = document.getElementById('categoriaId').value;
    const nombre = document.getElementById('inputNombreCategoria').value.trim();
    const descripcion = document.getElementById('inputDescripcionCategoria').value.trim();

    if(!nombre) {
        mostrarNotificacion('El nombre de la categoría es obligatorio', 'error');
        return;
    }

    const metodo = id ? 'PUT' : 'POST';
    const endpoint = id ? `${URL}/categorias/${id}` : `${URL}/categorias`;

    try {
        const res = await fetch(endpoint, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, descripcion })
        });
        const data = await res.json();
        if(data.success) {
            mostrarNotificacion(id ? 'Categoría actualizada correctamente' : 'Categoría creada correctamente');
            modalCategoria.classList.remove('active');
            cargarCategorias();
        }
    } catch (error) {
        console.log('Hubo un error: ', error);
        mostrarNotificacion('Hubo un error al guardar la categoría', 'error');
    }
});

// VENTAS

// VENTAS

let productosDisponibles = [];
let carrito = [];
let metodoPago = 'efectivo';

function seleccionarMetodo(metodo) {
    metodoPago = metodo;
    document.getElementById('btnEfectivo').classList.toggle('active', metodo === 'efectivo');
    document.getElementById('btnTarjeta').classList.toggle('active', metodo === 'tarjeta');
}

async function cargarVentas() {
    try {
        const res = await fetch(`${URL}/productos`);
        const data = await res.json();
        productosDisponibles = data.data;
        carrito = [];
        metodoPago = 'efectivo';
        document.getElementById('btnEfectivo').classList.add('active');
        document.getElementById('btnTarjeta').classList.remove('active');
        renderizarGrid(productosDisponibles);
        renderizarCarrito();

        // Buscador
        document.getElementById('buscadorProducto').value = '';
        document.getElementById('buscadorProducto').addEventListener('input', (e) => {
            const busqueda = e.target.value.toLowerCase();
            const filtrados = productosDisponibles.filter(p =>
                p.nombre.toLowerCase().includes(busqueda)
            );
            renderizarGrid(filtrados);
        });

    } catch (error) {
        console.log('Hubo un error: ', error);
    }
}

function renderizarGrid(productos) {
    const grid = document.getElementById('gridProductos');
    grid.innerHTML = '';

    productos.forEach(p => {
        const div = document.createElement('div');
        div.classList.add('producto-card');
        if(p.stock === 0) div.classList.add('agotado');

        div.innerHTML = `
            <span class="producto-card-nombre">${p.nombre}</span>
            <span class="producto-card-precio">$${parseFloat(p.precio_venta).toFixed(2)}</span>
            <span class="producto-card-stock ${p.stock === 0 ? 'agotado' : ''}">
                ${p.stock === 0 ? 'AGOTADO' : `Stock: ${p.stock}`}
            </span>
        `;

        if(p.stock > 0) {
            div.addEventListener('click', () => agregarAlCarrito(p));
        }

        grid.appendChild(div);
    });
}

function agregarAlCarrito(producto) {
    const existente = carrito.find(item => item.id === producto.id);

    if(existente) {
        if(existente.cantidad >= producto.stock) {
            mostrarNotificacion('No hay más stock disponible', 'advertencia');
            return;
        }
        existente.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    renderizarCarrito();
}

function renderizarCarrito() {
    const contenedor = document.getElementById('carritoItems');
    contenedor.innerHTML = '';

    if(carrito.length === 0) {
        contenedor.innerHTML = '<p class="carrito-vacio">Selecciona productos para agregar al carrito</p>';
        document.getElementById('totalVenta').textContent = '$0.00';
        return;
    }

    let total = 0;

    carrito.forEach(item => {
        const subtotal = item.precio_venta * item.cantidad;
        total += subtotal;

        const div = document.createElement('div');
        div.classList.add('carrito-item');
        div.innerHTML = `
            <div class="carrito-item-info">
                <span class="carrito-item-nombre">${item.nombre}</span>
                <span class="carrito-item-precio">$${parseFloat(item.precio_venta).toFixed(2)} x ${item.cantidad} = $${subtotal.toFixed(2)}</span>
            </div>
            <div class="carrito-item-controles">
                <button class="btn-cantidad" onclick="cambiarCantidad(${item.id}, -1)">-</button>
                <span class="carrito-item-cantidad">${item.cantidad}</span>
                <button class="btn-cantidad" onclick="cambiarCantidad(${item.id}, 1)">+</button>
                <button class="btn-quitar" onclick="quitarDelCarrito(${item.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        contenedor.appendChild(div);
    });

    document.getElementById('totalVenta').textContent = `$${total.toFixed(2)}`;
}

function cambiarCantidad(id, cambio) {
    const item = carrito.find(i => i.id === id);
    const producto = productosDisponibles.find(p => p.id === id);

    if(!item) return;

    item.cantidad += cambio;

    if(item.cantidad > producto.stock) {
        item.cantidad = producto.stock;
        mostrarNotificacion('No hay más stock disponible', 'advertencia');
    }

    if(item.cantidad <= 0) {
        quitarDelCarrito(id);
        return;
    }

    renderizarCarrito();
}

function quitarDelCarrito(id) {
    carrito = carrito.filter(i => i.id !== id);
    renderizarCarrito();
}

document.getElementById('btnRegistrarVenta').addEventListener('click', async () => {
    if(carrito.length === 0) {
        mostrarNotificacion('Agrega al menos un producto al carrito', 'error');
        return;
    }

    const productos = carrito.map(item => ({
        idProducto: item.id,
        cantidad: item.cantidad,
        precioUnitario: item.precio_venta
    }));

    try {
        const res = await fetch(`${URL}/ventas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productos, metodoPago })
        });
        const data = await res.json();

        if(data.success) {
            mostrarNotificacion(`Venta registrada! Total: $${data.total} | ${metodoPago === 'efectivo' ? '💵 Efectivo' : '💳 Tarjeta'}`);
            carrito = [];
            await cargarVentas();
            cargarDashboard();
        }
    } catch (error) {
        console.log('Hubo un error: ', error);
        mostrarNotificacion('Hubo un error al registrar la venta', 'error');
    }
});

// HISTORIAL POR DÍA

// HISTORIAL POR DÍA

let offsetSemana = 0;

function calcularSemana(offset) {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const diasDesdeJueves = (diaSemana + 3) % 7;

    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - diasDesdeJueves + (offset * 7));
    inicioSemana.setHours(0, 0, 0, 0);

    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);
    finSemana.setHours(23, 59, 59, 999);

    return { inicioSemana, finSemana };
}

async function cargarHistorial() {
    try {
        const res = await fetch(`${URL}/ventas`);
        const data = await res.json();
        const ventas = data.data;

        const { inicioSemana, finSemana } = calcularSemana(offsetSemana);

        const opciones = { day: 'numeric', month: 'long' };
        document.getElementById('semanaActual').textContent =
            `${inicioSemana.toLocaleDateString('es-MX', opciones)} - ${finSemana.toLocaleDateString('es-MX', opciones)}`;

        // Deshabilitar botón siguiente si estamos en la semana actual
        document.getElementById('btnSemanaSiguiente').disabled = offsetSemana >= 0;
        document.getElementById('btnSemanaSiguiente').style.opacity = offsetSemana >= 0 ? '0.4' : '1';

        const ventasPorDia = {};

        ventas.forEach(v => {
            const fechaVenta = new Date(v.fecha_venta);
            if(fechaVenta >= inicioSemana && fechaVenta <= finSemana) {
                const diaKey = fechaVenta.toLocaleDateString('es-MX', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                });

                if(!ventasPorDia[diaKey]) {
                    ventasPorDia[diaKey] = { ventas: {}, totalDia: 0 };
                }

                if(!ventasPorDia[diaKey].ventas[v.id]) {
                    ventasPorDia[diaKey].ventas[v.id] = {
                        id: v.id,
                        total: parseFloat(v.total),
                        metodoPago: v.metodo_pago,
                        productos: []
                    };
                    ventasPorDia[diaKey].totalDia += parseFloat(v.total);
                }

                if(v.producto) {
                    ventasPorDia[diaKey].ventas[v.id].productos.push(
                        `${v.producto} x${v.cantidad} - $${parseFloat(v.precio_unitario).toFixed(2)} c/u`
                    );
                }
            }
        });

        const totalSemana = Object.values(ventasPorDia).reduce((acc, dia) => acc + dia.totalDia, 0);
        document.getElementById('totalSemana').textContent = `$${totalSemana.toFixed(2)}`;

        const contenedor = document.getElementById('historialPorDia');
        contenedor.innerHTML = '';

        if(Object.keys(ventasPorDia).length === 0) {
            contenedor.innerHTML = '<p style="color: var(--text-light)">No hay ventas esta semana</p>';
            return;
        }

        Object.entries(ventasPorDia).forEach(([dia, info]) => {
            const card = document.createElement('div');
            card.classList.add('dia-card');

            const ventasHTML = Object.values(info.ventas).map(v => `
                <div class="venta-row">
                    <div class="venta-row-info">
                        <span class="venta-row-titulo">Venta #${v.id} · ${v.metodoPago === 'tarjeta' ? '💳 Tarjeta' : '💵 Efectivo'}</span>
                        <span class="venta-row-detalle">${v.productos.join(' | ')}</span>
                    </div>
                    <span class="venta-row-precio">$${v.total.toFixed(2)}</span>
                </div>
            `).join('');

            card.innerHTML = `
                <div class="dia-header">
                    <h3>${dia}</h3>
                    <div class="dia-header-right">
                        <span class="dia-total">$${info.totalDia.toFixed(2)}</span>
                        <i class="fa-solid fa-chevron-down dia-chevron"></i>
                    </div>
                </div>
                <div class="dia-body">
                    ${ventasHTML}
                </div>
            `;

            card.querySelector('.dia-header').addEventListener('click', () => {
                card.classList.toggle('abierto');
            });

            contenedor.appendChild(card);
        });

    } catch (error) {
        console.log('Hubo un error: ', error);
    }
}

document.getElementById('btnSemanaAnterior').addEventListener('click', () => {
    offsetSemana--;
    cargarHistorial();
});

document.getElementById('btnSemanaSiguiente').addEventListener('click', () => {
    if(offsetSemana >= 0) return;
    offsetSemana++;
    cargarHistorial();
});

// INICIALIZAR

verificarStockBajo();
cargarDashboard();