import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 1. NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#7F00B2] to-[#BC4ED8] rounded-lg flex items-center justify-center text-white font-bold text-sm">K</div>
              <span className="text-xl font-bold text-[#1B004B]">KODA POS</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#caracteristicas" className="text-sm text-slate-600 hover:text-[#7F00B2] transition-colors">Características</a>
              <a href="#modulos" className="text-sm text-slate-600 hover:text-[#7F00B2] transition-colors">Módulos</a>
              <a href="#planes" className="text-sm text-slate-600 hover:text-[#7F00B2] transition-colors">Precios</a>
              <a href="#recursos" className="text-sm text-slate-600 hover:text-[#7F00B2] transition-colors">Recursos</a>
              <a href="#contacto" className="text-sm text-slate-600 hover:text-[#7F00B2] transition-colors">Contacto</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-slate-600 hover:text-[#1B004B] px-3 py-2 font-medium">
                Iniciar sesión
              </Link>
              <Link href="/register" className="text-sm bg-[#7F00B2] hover:bg-[#4C007D] text-white px-5 py-2.5 rounded-lg font-medium transition-colors">
                Prueba gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1B004B] via-[#4C007D] to-[#7F00B2] pt-16 pb-24">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#BC4ED8] rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#F988FF] rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-white/10 text-[#F988FF] text-sm font-medium rounded-full mb-6 backdrop-blur-sm border border-white/10">
                14 días gratis. Sin tarjeta de crédito.
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
                KODA POS:<br />
                <span className="text-[#F988FF]">Todo tu negocio</span><br />
                en un solo lugar.
              </h1>
              <p className="text-lg text-slate-300 mb-8 max-w-lg">
                Controla ventas, inventario, compras, clientes y reportes desde una plataforma moderna, rápida y fácil de usar.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
                <Link href="/register" className="w-full sm:w-auto px-8 py-3.5 bg-[#7F00B2] hover:bg-[#BC4ED8] text-white rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2">
                  Prueba gratis <span>→</span>
                </Link>
                <a href="#demo" className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2">
                  ▷ Ver demo
                </a>
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">✓ Fácil de usar</span>
                <span className="flex items-center gap-1.5">✓ Sin instalación</span>
                <span className="flex items-center gap-1.5">✓ Soporte 24/7</span>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-[#1B004B] px-4 py-3 flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-xs text-slate-400 ml-2">KODA POS Dashboard</span>
                </div>
                <div className="p-4 bg-slate-50">
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                      { label: "Ventas Hoy", value: "$4.250.000", color: "from-[#7F00B2] to-[#BC4ED8]" },
                      { label: "Órdenes", value: "156", color: "from-[#4C007D] to-[#7F00B2]" },
                      { label: "Productos", value: "1.250", color: "from-[#BC4ED8] to-[#F988FF]" },
                      { label: "Clientes", value: "530", color: "from-[#1B004B] to-[#4C007D]" },
                    ].map((item) => (
                      <div key={item.label} className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-[10px] text-slate-500">{item.label}</p>
                        <p className="text-sm font-bold text-[#1B004B]">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-700">Ventas</span>
                    </div>
                    <div className="flex items-end gap-1 h-16">
                      {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                        <div key={i} className="flex-1 bg-gradient-to-t from-[#7F00B2] to-[#BC4ED8] rounded-sm" style={{ height: `${h}%` }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROBLEMAS QUE RESUELVE */}
      <section className="py-20 bg-white" id="caracteristicas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-[#1B004B] mb-12">
            ¿Te identificas con estos problemas?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Pérdida de control de inventario", desc: "No sabes qué tienes, qué falta o qué se está vendiendo.", icon: "📦" },
              { title: "Errores en ventas y facturación", desc: "Ventas manuales, cálculos incorrectos y pérdida de dinero.", icon: "💸" },
              { title: "Falta de reportes y análisis", desc: "No tienes datos claros para tomar decisiones inteligentes.", icon: "📊" },
              { title: "Varias sucursales difíciles de controlar", desc: "No puedes supervisar tu negocio desde un solo lugar.", icon: "🏪" },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-xl border border-slate-100 hover:border-[#BC4ED8]/30 hover:shadow-lg transition-all bg-white">
                <div className="w-12 h-12 bg-gradient-to-br from-[#7F00B2] to-[#BC4ED8] rounded-xl flex items-center justify-center text-xl mb-4 text-white">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-[#1B004B] mb-2 text-sm">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SOLUCIÓN + MÓDULOS */}
      <section className="py-20 bg-slate-50" id="modulos">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
            <div>
              <h2 className="text-3xl font-bold text-[#1B004B] mb-4">
                KODA POS simplifica toda tu operación.
              </h2>
              <ul className="space-y-3">
                {[
                  "Todo integrado en una sola plataforma.",
                  "Información en tiempo real.",
                  "Fácil de usar, rápido de implementar.",
                  "Diseñado para crecer contigo.",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-[#7F00B2]">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "Ventas", desc: "Rápidas y seguras", icon: "🛒" },
                { name: "Inventario", desc: "Siempre actualizado", icon: "📦" },
                { name: "Compras", desc: "Control total", icon: "📥" },
                { name: "Gastos", desc: "Bajo control", icon: "💸" },
                { name: "Clientes", desc: "Fideliza y crece", icon: "👥" },
                { name: "Proveedores", desc: "Relaciones sólidas", icon: "🚚" },
                { name: "Cajas", desc: "Control de efectivo", icon: "🏦" },
                { name: "Reportes", desc: "Decisiones inteligentes", icon: "📈" },
              ].map((mod) => (
                <div key={mod.name} className="bg-white p-4 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                  <span className="text-xl mb-2 block">{mod.icon}</span>
                  <h3 className="font-semibold text-[#1B004B] text-sm">{mod.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{mod.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <h3 className="text-xl font-bold text-center text-[#1B004B] mb-8">
            Módulos principales
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-4">
            {[
              "Dashboard", "Ventas", "Inventario", "Compras", "Gastos", "Clientes",
              "Proveedores", "Cajas", "Reportes", "Sucursales", "Usuarios", "Ajustes",
              "Impresión", "Integraciones",
            ].map((mod) => (
              <div key={mod} className="text-center p-3 bg-white rounded-xl border border-slate-100 hover:border-[#BC4ED8]/30 transition-all">
                <div className="w-8 h-8 bg-gradient-to-br from-[#7F00B2]/10 to-[#BC4ED8]/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-[#7F00B2] text-xs">◆</span>
                </div>
                <p className="text-xs text-slate-600">{mod}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <a href="#" className="text-sm text-[#7F00B2] hover:text-[#4C007D] font-medium">Ver todos los módulos →</a>
          </div>
        </div>
      </section>

      {/* 5. BENEFICIOS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-[#1B004B] mb-12">
            Beneficios clave
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Acceso remoto", desc: "Accede desde cualquier lugar, en cualquier dispositivo.", icon: "🌐" },
              { title: "Modo offline", desc: "Vende sin internet. Sincroniza automáticamente.", icon: "📡" },
              { title: "Sincronización automática", desc: "Tus datos siempre actualizados en la nube.", icon: "🔄" },
              { title: "Seguridad empresarial", desc: "Tus datos protegidos con los más altos estándares.", icon: "🔒" },
            ].map((item) => (
              <div key={item.title} className="text-center p-6">
                <div className="w-14 h-14 bg-gradient-to-br from-[#7F00B2]/10 to-[#BC4ED8]/10 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 border border-[#7F00B2]/10">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-[#1B004B] mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. OFFLINE + TICKETS + SECTORES */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <span className="inline-block px-3 py-1 bg-[#F3E8FF] text-[#7F00B2] text-xs font-medium rounded-full mb-4">Modo offline</span>
              <h3 className="text-xl font-bold text-[#1B004B] mb-2">Tu negocio nunca se detiene.</h3>
              <p className="text-sm text-slate-500 mb-4">KODA POS funciona sin internet. Cuando vuelve la conexión, todo se sincroniza automáticamente.</p>
              <div className="flex items-center justify-center gap-4 py-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#1B004B] to-[#4C007D] rounded-xl flex items-center justify-center text-xl">💻</div>
                </div>
                <div className="text-[#7F00B2] text-2xl">↻</div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#7F00B2] to-[#BC4ED8] rounded-xl flex items-center justify-center text-xl">☁️</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <span className="inline-block px-3 py-1 bg-[#F3E8FF] text-[#7F00B2] text-xs font-medium rounded-full mb-4">Impresión profesional</span>
              <h3 className="text-xl font-bold text-[#1B004B] mb-2">Tickets y etiquetas al instante.</h3>
              <p className="text-sm text-slate-500 mb-4">Imprime tickets térmicos, facturas y etiquetas con códigos de barras.</p>
              <div className="bg-gradient-to-br from-[#1B004B] to-[#4C007D] rounded-xl p-4 text-white text-center">
                <div className="bg-white/10 rounded-lg p-3 mb-2">
                  <p className="text-xs text-slate-300">KODA POS</p>
                  <p className="text-lg font-bold">$8.700</p>
                </div>
                <div className="h-2 bg-white/20 rounded w-3/4 mx-auto"></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <span className="inline-block px-3 py-1 bg-[#F3E8FF] text-[#7F00B2] text-xs font-medium rounded-full mb-4">Ideal para todo tipo de negocio</span>
              <h3 className="text-xl font-bold text-[#1B004B] mb-2">Diseñado para tu industria.</h3>
              <div className="grid grid-cols-2 gap-2">
                {["Minimercados", "Restaurantes", "Papelerías", "Ferreterías", "Tiendas de ropa", "Farmacias", "Salones de belleza", "Y muchos más..."].map((s) => (
                  <div key={s} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span className="text-[#7F00B2]">◆</span> {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. REPORTES + SEGURIDAD */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-[#1B004B] mb-4">
                Toma mejores decisiones con datos reales.
              </h2>
              <p className="text-slate-500 mb-6">Visualiza tus ventas, productos, clientes y más con reportes claros y en tiempo real.</p>
              <ul className="space-y-3 mb-6">
                {["Gráficos interactivos", "KPIs en tiempo real", "Filtros avanzados", "Exporta tus reportes"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-[#7F00B2]">✓</span> {item}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="inline-block px-6 py-2.5 bg-gradient-to-r from-[#7F00B2] to-[#BC4ED8] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                Ver demo en vivo
              </Link>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-[#1B004B] mb-4">
                Tu información está segura
              </h2>
              <div className="space-y-3">
                {[
                  { title: "Login con Google", icon: "🔍" },
                  { title: "Arquitectura Multi-Tenant", icon: "🏗️" },
                  { title: "Backups automáticos diarios", icon: "💾" },
                  { title: "Cifrado de datos avanzado", icon: "🔐" },
                  { title: "Infraestructura en la nube (AWS)", icon: "☁️" },
                ].map((item) => (
                  <div key={item.title} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#7F00B2]/10 to-[#BC4ED8]/10 rounded-lg flex items-center justify-center text-sm">{item.icon}</div>
                    <span className="text-sm text-slate-700">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. PLANES */}
      <section className="py-20 bg-slate-50" id="planes">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-[#1B004B] mb-2">
            Planes simples y transparentes
          </h2>
          <p className="text-center text-slate-500 mb-12">Elige el plan que mejor POS adapte a tu negocio.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Básico",
                desc: "Para pequeños negocios",
                price: "$29.000",
                features: ["1 Sucursal", "Usuarios limitados", "Módulos básicos", "Soporte por chat"],
                popular: false,
              },
              {
                name: "Profesional",
                desc: "Para negocios en crecimiento",
                price: "$59.000",
                features: ["Sucursales limitadas", "Usuarios limitados", "Todos los módulos incluidos", "Reportes avanzados", "Soporte prioritario"],
                popular: true,
              },
              {
                name: "Empresarial",
                desc: "Para grandes empresas",
                price: "$99.000",
                features: ["Sucursales ilimitadas", "Permisos avanzados", "Integraciones API", "Gerente de cuenta dedicado", "Soporte 24/7"],
                popular: false,
              },
            ].map((plan) => (
              <div key={plan.name} className={`bg-white rounded-2xl p-6 border ${plan.popular ? 'border-[#7F00B2] ring-1 ring-[#7F00B2]/20' : 'border-slate-200'} relative`}>
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#7F00B2] to-[#BC4ED8] text-white text-xs font-medium rounded-full">
                    Más popular
                  </span>
                )}
                <h3 className="text-lg font-bold text-[#1B004B] mb-1">{plan.name}</h3>
                <p className="text-xs text-slate-500 mb-4">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-[#1B004B]">{plan.price}</span>
                  <span className="text-slate-500 text-sm">/mes</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="text-[#7F00B2]">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`block w-full text-center py-2.5 rounded-xl font-medium text-sm transition-colors ${plan.popular ? 'bg-gradient-to-r from-[#7F00B2] to-[#BC4ED8] text-white hover:opacity-90' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                  Comenzar gratis
                </Link>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-xs text-slate-500">
            <span className="flex items-center gap-1">◆ 14 días gratis</span>
            <span className="flex items-center gap-1">◆ Sin tarjeta de crédito</span>
            <span className="flex items-center gap-1">◆ Cancela cuando quieras</span>
          </div>
        </div>
      </section>

      {/* 9. TESTIMONIOS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-[#1B004B] mb-12">
            Lo que dicen nuestros clientes
          </h2>
          <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="text-yellow-400 text-sm">★</span>
                ))}
              </div>
              <span className="text-xs text-slate-400">4.9 de 5</span>
            </div>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
              "KODA POS cambió la forma en que administramos nuestro negocio. Es rápido, fácil y muy completo."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#7F00B2] to-[#BC4ED8] rounded-full flex items-center justify-center text-white font-bold text-sm">
                L
              </div>
              <div>
                <p className="font-medium text-[#1B004B] text-sm">Laura Martínez</p>
                <p className="text-xs text-slate-500">Dueña de Minimercado El Ahorro</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FAQ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-[#1B004B] mb-12">
            Preguntas frecuentes
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { q: "¿Necesito internet para usar KODA POS?", a: "No obligatoriamente. Funciona en modo offline y sincroniza automáticamente." },
              { q: "¿Cómo funciona el modo offline?", a: "Puedes vender sin conexión. Los datos se guardan localmente y se sincronizan al recuperar internet." },
              { q: "¿Es difícil implementar KODA POS?", a: "No, es muy fácil. Solo necesitas un navegador web. La configuración inicial toma menos de 10 minutos." },
              { q: "¿Puedo usar KODA POS en varios dispositivos?", a: "Sí, puedes acceder desde cualquier computador, tablet o celular con navegador web." },
              { q: "¿Puedo manejar varias sucursales?", a: "Sí, el plan Business te permite administrar múltiples sucursales desde una sola cuenta." },
              { q: "¿Cómo funciona la prueba gratis?", a: "Tienes 14 días de acceso completo sin necesidad de tarjeta de crédito." },
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-slate-100 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-[#1B004B] text-sm mb-1">{faq.q}</h3>
                  <p className="text-xs text-slate-500">{faq.a}</p>
                </div>
                <span className="text-slate-300 text-lg">+</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. CTA FINAL */}
      <section className="py-20 bg-gradient-to-r from-[#1B004B] via-[#4C007D] to-[#7F00B2]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Empieza a transformar tu negocio hoy
          </h2>
          <p className="text-slate-300 mb-8">
            Únete a cientos de negocios que ya usan KODA POS para crecer y vender más.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#7F00B2] to-[#BC4ED8] text-white rounded-xl font-semibold transition-opacity hover:opacity-90">
              Prueba gratis 14 días
            </Link>
            <a href="#demo" className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-semibold transition-colors">
              ▷ Ver demo
            </a>
          </div>
        </div>
      </section>

      {/* 12. FOOTER */}
      <footer className="bg-[#1B004B] py-12" id="contacto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-white mb-4">Producto</h4>
              <ul className="space-y-2">
                {["Características", "Módulos", "Precios", "Demo"].map((item) => (
                  <li key={item}><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Recursos</h4>
              <ul className="space-y-2">
                {["Blog", "Documentación", "Soporte", "Estado del sistema"].map((item) => (
                  <li key={item}><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Compañía</h4>
              <ul className="space-y-2">
                {["Nosotros", "Contacto", "Políticas", "Términos y condiciones"].map((item) => (
                  <li key={item}><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">¿Necesitas ayuda?</h4>
              <ul className="space-y-2">
                <li className="text-sm text-slate-400">soporte@kodapos.com</li>
                <li className="text-sm text-slate-400">+57 300 123 4567</li>
                <li className="text-sm text-slate-400">Lun - Vie, 8:00 AM - 6:00 PM</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-[#7F00B2] to-[#BC4ED8] rounded-lg flex items-center justify-center text-white font-bold text-sm">K</div>
              <span className="text-white font-bold">KODA POS</span>
            </div>
            <p className="text-sm text-slate-500">
              © 2024 KODA POS. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
