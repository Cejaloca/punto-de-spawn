# Estado del proyecto — PuntoDeSpawn
*Actualizado: 11 de julio de 2026*

---

## 1. Qué es el proyecto

**PuntoDeSpawn** es una revista digital de gaming y tecnología orientada a Argentina.

- **URL en producción:** https://puntodespawn.com
- **Repositorio GitHub:** Cejaloca/punto-de-spawn (rama `main`)
- **Hosting:** GitHub Pages + dominio custom en Cloudflare
- **Carpeta local:** `C:\Users\Nico\Proyectos-claude\punto-de-spawn\`

---

## 2. Estructura del proyecto

```
punto-de-spawn/
├── index.html              # Página principal
├── gaming.html             # Categoría Gaming
├── tecnologia.html         # Categoría Tecnología
├── ofertas.html            # Categoría Ofertas
├── comunidad.html          # Categoría Comunidad
├── nosotros.html           # Página Nosotros
├── contacto.html           # Formulario de contacto → Telegram
├── admin.html              # Dashboard de métricas (protegido, no indexado)
├── sitemap.xml             # 127 URLs — regenerado automáticamente en deploy
├── feed.xml                # RSS 2.0 — últimos 30 posts — regenerado en deploy
├── robots.txt
├── ads.txt
├── favicon.svg
├── css/style.css
├── js/
│   ├── main.js
│   └── posts.js
├── data/posts.js           # Array POSTS — fuente de verdad de todos los posts
├── posts/                  # Un archivo HTML por post (119 posts)
├── deploy-github.py        # Script de deploy a GitHub Pages
├── generate-sitemap.py     # Genera sitemap.xml desde posts.js
├── generate-rss.py         # Genera feed.xml desde posts.js
├── pds-contact-worker.js   # Código de referencia del Worker (con PLACEHOLDERS)
└── deploy-secrets.py       # Token de GitHub (NO commitear — está en .gitignore)
```

---

## 3. Cómo se publican posts

### Flujo manual
1. Agregar entrada al inicio del array `POSTS` en `data/posts.js`
2. Crear el archivo HTML en `posts/[slug].html` con Open Graph + JSON-LD
3. Ejecutar `python3 deploy-github.py` desde la carpeta del proyecto

El deploy:
- Valida `posts.js`
- Regenera `feed.xml` (últimos 30 posts)
- Regenera `sitemap.xml` (127+ URLs)
- Clona el repo en `/tmp`, sincroniza y pushea a `main`
- GitHub Pages publica en ~2 minutos

### Flujo automático (tarea programada)
- Tarea `newsletter-gaming-tech` corre **lunes, miércoles y viernes a las 10 AM**
- Busca novedades de gaming, IA y periféricos, crea 2-3 posts y hace deploy automático

---

## 4. Formato de un post en posts.js

```js
{
  id: 'slug-del-post-fecha',
  titulo: 'Título del artículo',
  extracto: 'Descripción de 1-2 oraciones para la card.',
  fecha: 'YYYY-MM-DD',
  fechaDisplay: 'DD de mes de YYYY',
  categoria: 'gaming',        // gaming | patch-notes | tecnologia | comunidad | ofertas
  tags: ['tag1', 'tag2'],
  juego: 'nombre-del-juego',  // null si no aplica
  juegoDisplay: 'Nombre',     // null si no aplica
  imagen: 'https://...',      // URL pública de imagen verificada
  archivo: 'posts/slug-del-post-fecha.html'
}
```

---

## 5. Template HTML de posts

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[TÍTULO] — PuntoDeSpawn</title>
  <meta name="description" content="[EXTRACTO]">
  <link rel="stylesheet" href="../css/style.css">
  <link rel='icon' href='../favicon.svg' type='image/svg+xml'>
  <link rel="alternate" type="application/rss+xml" title="PuntoDeSpawn RSS" href="https://puntodespawn.com/feed.xml">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5515559999355995" crossorigin="anonymous"></script>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-JGPHS744ZY"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-JGPHS744ZY');
  </script>
  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="PuntoDeSpawn">
  <meta property="og:locale" content="es_AR">
  <meta property="og:title" content="[TÍTULO] — PuntoDeSpawn">
  <meta property="og:description" content="[EXTRACTO]">
  <meta property="og:url" content="https://puntodespawn.com/posts/[ARCHIVO]">
  <meta property="og:image" content="[IMAGEN]">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="[TÍTULO] — PuntoDeSpawn">
  <meta name="twitter:description" content="[EXTRACTO]">
  <meta name="twitter:image" content="[IMAGEN]">
  <!-- JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": "[TÍTULO]",
    "description": "[EXTRACTO]",
    "image": "[IMAGEN]",
    "datePublished": "[FECHA ISO]",
    "dateModified": "[FECHA ISO]",
    "url": "https://puntodespawn.com/posts/[ARCHIVO]",
    "publisher": {
      "@type": "Organization",
      "name": "PuntoDeSpawn",
      "url": "https://puntodespawn.com",
      "logo": { "@type": "ImageObject", "url": "https://puntodespawn.com/favicon.svg" }
    },
    "author": { "@type": "Organization", "name": "PuntoDeSpawn" }
  }
  </script>
</head>
<body>
  <!-- header, main con .post-article, footer -->
  <script src="../data/posts.js"></script>
  <script src="../js/posts.js"></script>
  <script src="../js/main.js"></script>
  <script>renderRelatedPosts('[ID-DEL-POST]', '[CATEGORIA]');</script>
  <button class="scroll-top" id="scroll-top" aria-label="Volver arriba">↑</button>
</body>
</html>
```

---

## 6. Admin Dashboard (admin.html)

Panel de control interno en `https://puntodespawn.com/admin.html`.

**Acceso:** protegido con Cloudflare Access / Zero Trust
- Solo `nicolasguazzotti@gmail.com` puede acceder
- El path protegido es `/admin.html` (no el dominio completo — el resto del sitio es público)
- `<meta name="robots" content="noindex, nofollow">` — no indexable por Google
- No está linkeado desde ninguna página pública

**Tabs del dashboard:**
- **Visitas** → Cloudflare Web Analytics (Worker proxy: `pds-analytics-proxy.nicolasguazzotti.workers.dev`)
- **Búsquedas** → Google Search Console API
- **Comportamiento** → Google Analytics 4 API
- **Contenido** → lista de posts con vistas cruzadas desde Cloudflare
- **Ajustes** → configuración de credenciales (guardadas en localStorage)

**Constantes clave en admin.html:**
```javascript
const CF_GQL      = 'https://pds-analytics-proxy.nicolasguazzotti.workers.dev';
const GSC_API     = 'https://www.googleapis.com/webmasters/v3';
const GA4_API     = 'https://analyticsdata.googleapis.com/v1beta';
const GA4_PROPERTY = '545099933';
```

**Credenciales que se ingresan por el modal de Ajustes (no en el código):**
- C