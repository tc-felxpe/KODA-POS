# KODA POS

Sistema punto de venta (POS) moderno, multi-tenant y adaptable a cualquier tipo de comercio. Diseñado para ser rápido, intuitivo y completo.

---

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Backend** | NestJS + TypeScript + Prisma ORM + PostgreSQL |
| **Frontend** | Next.js 16 + TypeScript + Tailwind CSS |
| **Estado** | Zustand + persist |
| **Auth** | JWT + Passport |
| **DB** | PostgreSQL 14 |

---

## 📦 Módulos Implementados

### ✅ POS (Punto de Venta)
- Búsqueda por nombre, SKU y código de barras
- Escáner USB/Bluetooth y cámara (`html5-qrcode`)
- Carrito con cantidades, descuentos por producto y global
- Clientes: general por defecto, selección rápida, creación en línea
- **Métodos de pago**: Efectivo (con cambio), Débito, Crédito, Transferencia, Mercado Pago, **pago mixto**
- **Cotizaciones** (`QUOTATION`): guarda sin descontar stock ni registrar pagos
- **Apartados** (`LAYAWAY`): separa inventario con abono inicial
- Devoluciones parciales/totales con regreso de stock
- Anulación (solo ADMIN/SUPERVISOR) con motivo obligatorio
- Impresión de tickets térmicos (58mm/80mm) con QR y barcode
- Envío digital: PDF, WhatsApp, Email
- Promociones: combos 2x1/3x2/4x3, precios especiales, descuento por cantidad
- Ventas suspendidas (localStorage)

### ✅ Inventario / Productos
- **Productos**: CRUD completo con información básica, comercial e inventario
- **Categorías**: CRUD con categorías anidadas (subcategorías)
- **Marcas**: CRUD con descripción
- **Campos dinámicos según tipo de negocio**:
  - Tienda de ropa → Talla, Color, Género, Material
  - Tienda deportiva → Talla, Color, Deporte
  - Papelería → Referencia, Unidad
  - Minimercado → Peso, Unidad, Vencimiento, Lote
  - Tecnología → Modelo, Serie, Garantía
  - Mascotas → Tipo, Peso, Edad recomendada
  - Belleza → Tipo, Vencimiento, Lote
- Stock inicial al crear producto con registro de movimiento
- Control de stock por bodega/sucursal
- Indicadores de stock bajo/agotado en tiempo real

### ✅ Dashboard
- Sidebar flotante tipo cápsula minimalista
- Diseño responsive con drawer en móvil

---

## 🎨 Paleta de Colores

| Color | Hex |
|-------|-----|
| Primary Dark | `#1B004B` |
| Primary | `#4C007D` |
| Primary Light | `#7F00B2` |
| Secondary | `#BC4ED8` |
| Accent | `#F988FF` |

---

## 🛠️ Ejecución Local

### Requisitos
- Node.js 20+
- PostgreSQL 14+ (puerto 5434)

### Backend
```bash
cd backend
npm install
npx prisma migrate dev
npx prisma generate
npm run start:dev
# http://localhost:3001/api
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

### Variables de entorno (backend/.env)
```
DATABASE_URL=postgresql://postgres:Feli310554@localhost:5434/koda_pos
JWT_SECRET=tu_secreto_jwt
```

---

## 🗄️ Estructura de Base de Datos (Prisma)

- `Tenant` — Multi-tenant
- `User` — Usuarios con roles (ADMIN, SUPERVISOR, CASHIER)
- `Branch` — Sucursales/Bodegas
- `Category` — Categorías anidadas
- `Brand` — Marcas
- `Product` — Productos con campos dinámicos (`attributes` JSON)
- `ProductVariant` — Variantes de producto
- `Inventory` — Stock por producto y sucursal
- `InventoryMovement` — Kardex/movimientos
- `Customer` — Clientes
- `Supplier` — Proveedores
- `Sale` — Ventas con estados: COMPLETED, CANCELLED, REFUNDED, QUOTATION, LAYAWAY
- `SaleDetail`, `SalePayment`, `SaleReturn`, `SaleReturnDetail`
- `AuditLog` — Auditoría

---

## 📁 Estructura del Proyecto

```
KODA-POS/
├── backend/              # NestJS API
│   ├── prisma/           # Schema y migraciones
│   ├── src/
│   │   ├── auth/         # JWT + Login/Register
│   │   ├── branches/     # Sucursales/Bodegas
│   │   ├── brands/       # Marcas
│   │   ├── categories/   # Categorías
│   │   ├── common/       # Guards, Decorators, Config
│   │   ├── customers/    # Clientes
│   │   ├── products/     # Productos
│   │   ├── sales/        # Ventas, Cotizaciones, Apartados
│   │   ├── suppliers/    # Proveedores
│   │   ├── tenants/      # Configuración multi-tenant
│   │   └── users/        # Usuarios
├── frontend/             # Next.js App
│   ├── src/
│   │   ├── app/          # Páginas (App Router)
│   │   ├── components/   # Modales reutilizables
│   │   └── hooks/        # Zustand stores
└── data.base.sql         # Backup SQL
```

---

## 📄 Licencia

Proyecto privado — KODA POS.
