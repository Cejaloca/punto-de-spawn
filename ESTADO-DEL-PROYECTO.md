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
- CF Site Tag (Cloudflare Analytics)
- CF API Token
- GSC OAuth Token
- GA4 OAuth Token
- GSC Property: `sc-domain:puntodespawn.com`

**CRÍTICO — truncación de admin.html:** El archivo tiene ~1160 líneas. El Edit tool puede truncarlo. Siempre verificar con `tail -8` después de editar. Si falta el cierre, restaurar con:
```python
with open('admin.html', 'r') as f: content = f.read()
idx = content.rfind('\nwindow.onload')
content = content[:idx]
content += '\nwindow.onload = () => { checkFirstRun(); init(); };\n</script>\n</body>\n</html>\n'
with open('admin.html', 'w') as f: f.write(content)
```

---

## 7. Cloudflare Workers

### pds-analytics-proxy (proxy de Cloudflare Analytics)
- **URL:** `https://pds-analytics-proxy.nicolasguazzotti.workers.dev`
- Proxy para la API GraphQL de Cloudflare Analytics (maneja CORS y auth)
- Campo GraphQL correcto: `rumPageloadEventsAdaptiveGroups` con `count` (no `sum`)

### puntodespawnbot (formulario de contacto → Telegram)
- **URL:** `https://puntodespawnbot.nicolasguazzotti.workers.dev`
- Recibe POST de `contacto.html` y reenvía el mensaje al bot de Telegram
- Código de referencia: `pds-contact-worker.js` (con placeholders — NO commitear tokens reales)
- Bot token y Chat ID solo van en el editor de Cloudflare Workers (no en el repo)

---

## 8. Formulario de contacto

- Archivo: `contacto.html`
- Campos: nombre (requerido), email (opcional), mensaje (requerido)
- Envía a `puntodespawnbot.nicolasguazzotti.workers.dev`
- El mensaje llega al Telegram de Nico como bot de PuntoDeSpawn
- Link en la sección Contacto de `nosotros.html` (botón "✉️ Escribinos")
- Link en el nav de `contacto.html` (class="active")

---

## 9. SEO

### Estado actual (11 de julio de 2026)
- **Sitemap:** `https://puntodespawn.com/sitemap.xml` — 127 URLs — enviado a GSC ✅
- **GSC:** sitemap aceptado, estado "Correcto", 127 páginas descubiertas
- **Indexación:** en proceso — Google empezó a rastrear el sitio hoy
- **RSS:** `https://puntodespawn.com/feed.xml` — últimos 30 posts — funcionando en Feedly ✅
- **Open Graph + JSON-LD:** aplicado a los 119 posts existentes ✅
- **Autodiscovery RSS:** tag `<link rel="alternate">` en todas las páginas principales ✅

### Qué monitorear en GSC
- **Sitemaps** → estado "Correcto" y páginas descubiertas creciendo
- **Indexación → Páginas** → páginas indexadas vs. con errores (en 1-2 semanas)
- **Rendimiento → Resultados de búsqueda** → primeras impresiones y clicks (en 2-4 semanas)
- **Señal definitiva:** `site:puntodespawn.com` en Google muestra páginas

### Herramientas de generación
- `generate-sitemap.py` → regenera `sitemap.xml` automáticamente en cada deploy
- `generate-rss.py` → regenera `feed.xml` automáticamente en cada deploy

---

## 10. Google Analytics 4

- **Property ID:** `545099933`
- **Measurement ID:** `G-JGPHS744ZY`
- **Snippet:** en el `<head>` de todos los HTMLs del sitio
- **API:** `analyticsdata.googleapis.com/v1beta` (usada en admin.html)

---

## 11. Google AdSense

- **Publisher ID:** `ca-pub-5515559999355995`
- **Estado:** en revisión (solicitado el 6 de julio de 2026)
- **ads.txt:** `google.com, pub-5515559999355995, DIRECT, f08c47fec0942fa0`
- **Cobro futuro:** ARQ (wire transfer USD) — configurar en Pagos cuando aprueben

---

## 12. Seguridad — reglas críticas

- **NUNCA commitear** tokens, API keys ni bot tokens al repo de GitHub
- Si GitHub secret scanning bloquea un push, reemplazar el token con un placeholder y nunca re-commitear el valor real
- `deploy-secrets.py` tiene el GitHub token — está en `.gitignore`, no va al repo
- `pds-contact-worker.js` tiene placeholders: `'TU_BOT_TOKEN_AQUI'` y `'TU_CHAT_ID_AQUI'`
- `admin.html` tiene `noindex, nofollow` y no está linkeado desde páginas públicas
- Cloudflare Access protege `/admin.html` específicamente (path = `admin.html`)

---

## 13. Monetización pendiente

**Afiliados (no implementado aún):**
- Mercado Libre Afiliados: 1-4% en ARS
- Amazon Associates: 1-4% en USD (cobro por wire con ARQ)
- Plan: sección "Dónde comprarlo" en posts de periféricos + posts tipo "los mejores X"

**Push notifications (OneSignal):** evaluado, pospuesto
**Newsletter:** evaluado, pospuesto

---

## 14. Cuentas vinculadas

| Servicio | Cuenta / ID |
|---|---|
| GitHub | Cejaloca |
| Google (AdSense, GSC, GA4) | nicolasguazzotti@gmail.com |
| Cloudflare | nicolasguazzotti@gmail.com |
| Instagram | @puntodespawn.ok |
| Telegram bot | @puntodespawnbot |
| ARQ (cobro) | pendiente de configurar en AdSense |
