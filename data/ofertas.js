// ═══════════════════════════════════════════════════════════════════
// OFERTAS — Fuente de verdad de las ofertas de afiliados
// ═══════════════════════════════════════════════════════════════════
//
// CÓMO CARGAR UNA OFERTA:
// 1. Generá el link de afiliado desde el portal de ML Afiliados
//    (o pedíselo a Claude, que ya sabe usar la API con la sesión abierta).
// 2. Agregá la entrada AL INICIO del array (las nuevas van arriba).
// 3. Cuando una oferta vence o cambia el precio: activa: false
//    (no la borres — sirve de historial para saber qué funcionó).
// 4. Deploy normal: python3 deploy-github.py
//
// Links generados el 12/07/2026 con la cuenta JULIRD24 (tag julird24).
// Verificá precios antes de cada deploy — cambian seguido.
//
// ═══════════════════════════════════════════════════════════════════

const OFERTAS = [
  {
    id: 'samsung-odyssey-g3-24-julio-2026',
    titulo: 'Monitor Samsung Odyssey G3 24" FHD 144Hz 1ms',
    descripcion: 'El monitor gamer más recomendado de la gama media: 144Hz, 1ms, FreeSync. A este precio es compra directa.',
    precio: '$255.303',
    precioAnterior: '$375.999',
    descuento: '-32%',
    imagen: 'https://http2.mlstatic.com/D_NQ_NP_729696-MLA99454394374_112025-O.webp',
    url: 'https://meli.la/11C3ZoH',
    tienda: 'mercadolibre',
    categoria: 'monitores',
    destacada: true,
    fechaAgregada: '2026-07-12',
    activa: true
  },
  {
    id: 'havit-kb903l-teclado-julio-2026',
    titulo: 'Teclado Mecánico Havit KB903L 60% Switch Red',
    descripcion: 'Mecánico compacto 60% con switches red y USB-C. Ideal para escritorios chicos y setups minimalistas.',
    precio: '$49.225',
    precioAnterior: '$74.999',
    descuento: '-34%',
    imagen: 'https://http2.mlstatic.com/D_NQ_NP_601644-MLA113146483305_062026-O.webp',
    url: 'https://meli.la/1KpuPFB',
    tienda: 'mercadolibre',
    categoria: 'perifericos',
    destacada: true,
    fechaAgregada: '2026-07-12',
    activa: true
  },
  {
    id: 'dualsense-ps5-sterling-julio-2026',
    titulo: 'Joystick DualSense PS5 Sterling Silver',
    descripcion: 'El control original de PS5 en color Sterling Silver. Compatible con PC vía Bluetooth o USB-C.',
    precio: '$149.999',
    precioAnterior: '$189.999',
    descuento: '-21%',
    imagen: 'https://http2.mlstatic.com/D_NQ_NP_715920-MLA96137773555_102025-O.webp',
    url: 'https://meli.la/1h7hCDM',
    tienda: 'mercadolibre',
    categoria: 'consolas',
    destacada: false,
    fechaAgregada: '2026-07-12',
    activa: true
  },
  {
    id: 'redragon-griffin-m607-julio-2026',
    titulo: 'Mouse Gamer Redragon Griffin M607',
    descripcion: 'RGB, 7200 DPI y peso liviano por menos de 30 lucas. El mejor punto de entrada al mundo gamer.',
    precio: '$26.899',
    precioAnterior: null,
    descuento: '-23%',
    imagen: 'https://http2.mlstatic.com/D_NQ_NP_887028-MLA96081302505_102025-O.webp',
    url: 'https://meli.la/1twRArs',
    tienda: 'mercadolibre',
    categoria: 'perifericos',
    destacada: false,
    fechaAgregada: '2026-07-12',
    activa: true
  },
  {
    id: 'logitech-g502-hero-julio-2026',
    titulo: 'Mouse Logitech G502 Hero 25K',
    descripcion: 'Un clásico que no falla: sensor HERO 25K, 11 botones programables y pesas ajustables.',
    precio: '$84.989',
    precioAnterior: null,
    descuento: '-9%',
    imagen: 'https://http2.mlstatic.com/D_NQ_NP_923017-MLA99428489296_112025-O.webp',
    url: 'https://meli.la/2XeCLo7',
    tienda: 'mercadolibre',
    categoria: 'perifericos',
    destacada: false,
    fechaAgregada: '2026-07-12',
    activa: true
  },
  {
    id: 'kz-edx-pro-julio-2026',
    titulo: 'Auriculares In-Ear KZ EDX Pro con Micrófono',
    descripcion: 'Los in-ear favoritos de la comunidad audiófila-gamer. Calidad de sonido absurda para lo que salen.',
    precio: '$23.806',
    precioAnterior: null,
    descuento: null,
    imagen: 'https://http2.mlstatic.com/D_NQ_NP_626934-MLA99500879802_112025-O.webp',
    url: 'https://meli.la/156BriZ',
    tienda: 'mercadolibre',
    categoria: 'perifericos',
    destacada: false,
    fechaAgregada: '2026-07-12',
    activa: true
  },
  {
    id: 'kingston-nv3-1tb-julio-2026',
    titulo: 'SSD Kingston NV3 1TB NVMe PCIe 4.0',
    descripcion: '6000MB/s de lectura para revivir cualquier PC. En 3 cuotas sin interés con Mercado Pago.',
    precio: '$499.999',
    precioAnterior: null,
    descuento: null,
    imagen: 'https://http2.mlstatic.com/D_NQ_NP_866595-MLA99871151661_112025-O.webp',
    url: 'https://meli.la/2gNSwu5',
    tienda: 'mercadolibre',
    categoria: 'componentes',
    destacada: false,
    fechaAgregada: '2026-07-12',
    activa: true
  }
];

