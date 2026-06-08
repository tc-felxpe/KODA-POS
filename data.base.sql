CREATE TABLE dashboard_preferences (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,

    widgets JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

//----------------MODULO DE VENTAS POS----------------//


------------Tabla Ventas------------------
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    sale_number VARCHAR(50) UNIQUE NOT NULL,
    branch_id UUID NOT NULL,
    customer_id UUID,
    cashier_id UUID NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    discount DECIMAL(12,2) DEFAULT 0,
    tax DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'paid',
    sale_status VARCHAR(20) DEFAULT 'completed',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-------------------------Detalle de Venta-------------------------

CREATE TABLE sale_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    sale_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity DECIMAL(12,2) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    discount DECIMAL(12,2) DEFAULT 0,
    subtotal DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (sale_id)
    REFERENCES sales(id)
);
------------------------Metodos de Pago-------------------------
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

--------------------------Pagos de Venta-------------------------
CREATE TABLE sale_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    sale_id UUID NOT NULL,
    payment_method_id UUID NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (sale_id)
    REFERENCES sales(id),
    FOREIGN KEY (payment_method_id)
    REFERENCES payment_methods(id)
);

--------------------------Ventas Suspendidas-------------------------   

CREATE TABLE suspended_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    cashier_id UUID NOT NULL,
    customer_id UUID,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
---------------------------Devoluciones de Venta-------------------------

CREATE TABLE sale_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    sale_id UUID NOT NULL,
    customer_id UUID,
    total_returned DECIMAL(12,2),
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (sale_id)
    REFERENCES sales(id)
);

--------------------------Detalle de Devoluciones de Venta-------------------------
CREATE TABLE sale_return_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (return_id)
    REFERENCES sale_returns(id)
);
---------------------------Historial de Impresión-------------------------

CREATE TABLE sale_prints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    sale_id UUID NOT NULL,
    printed_by UUID NOT NULL,
    printed_at TIMESTAMP DEFAULT NOW()
);

----------
users
customers
products
inventory_movements
cash_registers
cash_movements
sales
sale_details
sale_payments
accounts_receivable
audit_logs
---------------------------Fin Modulo de Ventas POS-------------------------


---------------------------------Modulo de Inventario-------------------------

CREATE TABLE productos (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    codigo VARCHAR(100),
    codigo_barras VARCHAR(100),
    categoria_id UUID,
    marca_id UUID,
    precio_compra DECIMAL(12,2),
    precio_venta DECIMAL(12,2),
    stock_actual DECIMAL(12,2),
    stock_minimo DECIMAL(12,2),
    stock_maximo DECIMAL(12,2),
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT NOW(),
    actualizado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE categorias (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    categoria_padre_id UUID,
    creado_en TIMESTAMP DEFAULT NOW()
);
-----------------------Tabla Marcas------------------

CREATE TABLE marcas (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE variantes_producto (
    id UUID PRIMARY KEY,
    producto_id UUID NOT NULL,
    nombre VARCHAR(100),
    precio_venta DECIMAL(12,2),
    stock_actual DECIMAL(12,2),
    codigo_barras VARCHAR(100)
);

CREATE TABLE inventario (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    producto_id UUID NOT NULL,
    sucursal_id UUID,
    bodega_id UUID,
    stock DECIMAL(12,2),
    actualizado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE movimientos_inventario (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    producto_id UUID NOT NULL,
    tipo_movimiento VARCHAR(50),
    cantidad DECIMAL(12,2),
    stock_anterior DECIMAL(12,2),
    stock_nuevo DECIMAL(12,2),
    observacion TEXT,
    usuario_id UUID,
    creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ventas (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    numero_venta VARCHAR(100),
    cliente_id UUID,
    usuario_id UUID,
    subtotal DECIMAL(12,2),
    descuento DECIMAL(12,2),
    impuesto DECIMAL(12,2),
    total DECIMAL(12,2),
    estado VARCHAR(50),
    creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE detalle_ventas (
    id UUID PRIMARY KEY,
    venta_id UUID NOT NULL,
    producto_id UUID NOT NULL,
    cantidad DECIMAL(12,2),
    precio_unitario DECIMAL(12,2),
    descuento DECIMAL(12,2),
    subtotal DECIMAL(12,2)
);

CREATE TABLE metodos_pago (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    nombre VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE pagos_venta (
    id UUID PRIMARY KEY,
    venta_id UUID NOT NULL,
    metodo_pago_id UUID NOT NULL,
    valor DECIMAL(12,2),
    referencia VARCHAR(100),
    creado_en TIMESTAMP DEFAULT NOW()
);

