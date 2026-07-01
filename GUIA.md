# Guía de trabajo — Punto de Spawn

## ¿Qué es este proyecto?

Punto de Spawn es una revista digital de tecnología y gaming orientada a Argentina. Es un sitio estático (sin servidor, sin base de datos) hecho con HTML, CSS y JavaScript vanilla. Se puede subir a cualquier hosting como Netlify arrastrando la carpeta.

---

## Estructura de archivos

```
punto-de-spawn/
├── index.html                  → Página de inicio (hero + últimas publicaciones)
├── gaming.html                 → Categoría Gaming + Patch Notes
├── tecnologia.html             → Categoría Tecnología
├── comunidad.html              → Categoría Comunidad
├── patch-notes.html            → Categoría Patch Notes (standalone)
├── nosotros.html               → Página "Sobre nosotros"
├── favicon.svg                 → Ícono del sitio
│
├── css/
│   └── style.css               → Todo el CSS del sitio
│
├── js/
│   ├── main.js                 → Funciones UI: menú, temas, scroll, animaciones
│   └── posts.js                → Funciones de renderizado y filtrado de cards
│
├── data/
│   └── posts.js                → Base de datos de posts (array POSTS)
│
├── posts/                      → Archivos HTML de cada artículo
│   ├── valorant-abril-2026.html
│   ├── lol-abril-2026.html
│   ├── marvel-rivals-abril-2026.html
│   ├── monster-hunter-wilds-2026.html
│   ├── crisis-gpus-2026.html
│   ├── ia-abril-2026.html
│   └── juegos-mas-jugados-argentina-2026.html
│
└── images/
    └── posts/                  → Imágenes de portada de posts
        ├── gpus.jpg
        ├── ia.jpg
        ├── lol.png
        └── valorant.svg
```

---

## Cómo agregar un nuevo post (flujo completo)

### Paso 1 — Agregar la entrada en `data/posts.js`

Abrí `data/posts.js` y agregá un objeto nuevo al array `POSTS`. El orden no importa, el sitio los ordena por fecha automáticamente.

```js
{
  id: 'nombre-del-post-2026',           // Debe coincidir con el nombre del archivo HTML
  titulo: 'Título del artículo',
  extracto: 'Descripción corta que aparece en la card (1-2 oraciones).',
  fecha: '2026-04-10',                  // Formato YYYY-MM-DD (se usa para ordenar)
  fechaDisplay: '10 de abril de 2026',  // Formato legible para mostrar
  categoria: 'gaming',                  // Ver categorías más abajo
  tags: ['valorant', 'patch-notes'],    // Array de strings en minúsculas con guiones
  juego: 'valorant',                    // null si no aplica (ej. artículos de tecnología)
  juegoDisplay: 'Valorant',             // null si no aplica. Se muestra como badge
  imagen: 'images/posts/foto.jpg',      // Ruta relativa o URL externa. null si no hay imagen
  logo: true,                           // Solo agregar si la imagen es un logo (PNG). Omitir si no aplica
  archivo: 'posts/nombre-del-post-2026.html'
}
```

### Paso 2 — Crear el archivo HTML del post

Duplicá uno de los posts existentes y editalo. La estructura es siempre la misma:

**Para posts de Gaming:**
```html
<div class="post-badges">
  <span class="badge badge-gaming">Gaming</span>
  <span class="badge badge-game">Nombre del juego</span>
</div>
```

**Para posts de Patch Notes:**
```html
<div class="post-badges">
  <span class="badge badge-patch-notes">Patch Notes</span>
  <span class="badge badge-game">Nombre del juego</span>
</div>
```

**Para posts de Tecnología:**
```html
<div class="post-badges">
  <span class="badge badge-tech">Tecnología</span>
  <span class="badge badge-game">Subtema (ej: Hardware)</span>
</div>
```

**Para posts de Comunidad:**
```html
<div class="post-badges">
  <span class="badge badge-comunidad">Comunidad</span>
</div>
```

Al final del archivo, antes de `</body>`, van siempre estos tres scripts + la llamada a `renderRelatedPosts`:

```html
<script src="../data/posts.js"></script>
<script src="../js/posts.js"></script>
<script src="../js/main.js"></script>
<script>renderRelatedPosts('id-del-post', 'categoria');</script>
```

### Paso 3 — Agregar imagen (opcional)

Si el post tiene imagen de portada, guardala en `images/posts/` y referenciarla en `data/posts.js`. Para imágenes externas (Steam, etc.) se puede poner la URL directa.

- Imágenes JPG/WEBP → se usan como cover en la card y como fondo del hero
- Imágenes PNG o con `logo: true` → se muestran centradas en la card (sin recorte)
- Si no hay imagen → el sitio genera automáticamente un gradiente con el ícono de la categoría

---

## Categorías

| Categoría | Valor en `categoria` | Badge class | Dónde aparece |
|---|---|---|---|
| Tecnología | `tecnologia` | `badge-tech` | tecnologia.html |
| Gaming | `gaming` | `badge-gaming` | gaming.html |
| Patch Notes | `patch-notes` | `badge-patch-notes` | gaming.html + patch-notes.html |
| Comunidad | `comunidad` | `badge-comunidad` | comunidad.html |

> **Nota:** Gaming y Patch Notes comparten la página `gaming.html`. Los artículos de Patch Notes también aparecen en `patch-notes.html` por separado.

---

## Convenciones de tags

Los tags se usan para filtrar artículos dentro de una categoría. Se muestran como links en el post y llevan a la página de categoría con el filtro aplicado.

- Siempre en **minúsculas** y con **guiones** en lugar de espacios: `league-of-legends`, `patch-notes`
- El tag de la categoría (`tecnologia`, `gaming`, `comunidad`) se puede incluir en posts que sean muy generales
- Posts de Patch Notes siempre llevan el tag `patch-notes`
- Los tag-links en el HTML del post deben apuntar a la página correcta:
  - Gaming/Patch Notes → `../gaming.html?tag=xxx` o `../patch-notes.html?tag=xxx`
  - Tecnología → `../tecnologia.html?tag=xxx`
  - Comunidad → `../comunidad.html?tag=xxx`

---

## Cómo funciona el sitio (arquitectura)

El sitio es 100% estático. No hay servidor ni base de datos.

**`data/posts.js`** define el array global `POSTS` con todos los artículos.

**`js/posts.js`** lee ese array y se encarga de:
- Renderizar las cards en las páginas de categoría
- Renderizar el hero en el inicio
- Filtrar por búsqueda, juego o tag
- Mostrar artículos relacionados al pie de cada post

**`js/main.js`** maneja toda la UI:
- Menú hamburger (mobile)
- Toggle de tema oscuro/claro (se guarda en localStorage)
- Botón de scroll al tope
- Barra de progreso de lectura (solo en posts)
- Efecto 3D tilt en las cards (solo desktop)
- Animaciones de fade-in al hacer scroll

Cada página de categoría termina con una llamada a `initCategoryPage('categoria')` o `initCategoryPage(['cat1', 'cat2'])`. La página de inicio llama a `initHomePage()`.

---

## Posts existentes

| Post | Categoría | Fecha |
|---|---|---|
| Monster Hunter Wilds: Beta y Requisitos | Gaming | 6 abr 2026 |
| Novedades del Parche — Valorant 12.06 | Patch Notes | 4 abr 2026 |
| La crisis de GPUs en 2026 | Tecnología | 4 abr 2026 |
| ¿Qué juega Argentina en 2026? | Comunidad | 4 abr 2026 |
| El estado de la IA en 2026 | Tecnología | 4 abr 2026 |
| Novedades del Parche — Marvel Rivals | Patch Notes | 2 abr 2026 |
| Novedades del Parche — League of Legends | Patch Notes | 31 mar 2026 |

---

## Funcionalidades implementadas

- ✅ Diseño dark mode con toggle a light mode (persistido en localStorage)
- ✅ Menú hamburger responsive para mobile
- ✅ Hero dinámico en el inicio (primer post del array, ordenado por fecha)
- ✅ Cards con imagen o gradiente automático por categoría
- ✅ Efecto 3D tilt en cards (desktop)
- ✅ Animaciones fade-in al hacer scroll (Intersection Observer)
- ✅ Búsqueda en tiempo real dentro de cada categoría
- ✅ Filtros por juego en Gaming
- ✅ Botón "Solo Parches" en Gaming para ver solo Patch Notes
- ✅ Filtrado por tag desde URL (`?tag=xxx`)
- ✅ Posts relacionados al pie de cada artículo (misma categoría)
- ✅ Barra de progreso de lectura en artículos
- ✅ Modo lectura (oculta sidebar, centra texto)
- ✅ Botones de compartir (WhatsApp, Twitter/X, copiar link)
- ✅ Scroll al tope
- ✅ Favicon SVG

---

## Pendientes / ideas futuras

- [ ] Agregar más posts
- [ ] Considerar agregar una página de búsqueda global (todos los posts)
- [ ] Agregar autor con foto en los posts cuando haya más redactores
