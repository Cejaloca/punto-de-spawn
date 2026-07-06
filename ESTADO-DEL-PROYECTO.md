# Estado del proyecto — Punto de Spawn
*Actualizado: 6 de julio de 2026*

---

## 1. Qué es el proyecto

**Punto de Spawn** es una revista digital de gaming y tecnología orientada a Argentina.

- **URL en producción:** https://puntodespawn.com
- **Repositorio GitHub:** cejaloca/punto-de-spawn (rama `main`)
- **Hosting:** GitHub Pages + dominio custom configurado en Cloudflare
- **Carpeta local:** `C:\Users\Nico\Proyectos-claude\punto-de-spawn\`

---

## 2. Estructura del proyecto

```
punto-de-spawn/
├── index.html              # Página principal
├── gaming.html             # Categoría Gaming
├── tecnologia.html         # Categoría Tecnología
├── comunidad.html          # Categoría Comunidad
├── nosotros.html           # Página Nosotros
├── ads.txt                 # Archivo de autorización AdSense
├── favicon.svg
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   └── posts.js            # Lógica de renderizado de cards y posts relacionados
├── data/
│   └── posts.js            # Array POSTS — fuente de verdad de todos los posts
├── posts/
│   └── [slug].html         # Un archivo HTML por post
├── deploy-github.py        # Script de deploy a GitHub Pages
└── NEWSLETTER-PENDIENTE.md # Resumen de la última corrida automática
```

---

## 3. Cómo se publican posts

### Flujo manual
1. Agregar entrada al inicio del array `POSTS` en `data/posts.js`
2. Crear el archivo HTML en `posts/[slug].html`
3. Ejecutar `python3 deploy-github.py` desde la carpeta del proyecto

### Flujo automático (tarea programada)
- Una tarea de Cowork llamada `newsletter-gaming-tech` corre automáticamente **lunes, miércoles y viernes a las 10 AM**
- Busca novedades de gaming, IA y periféricos
- Crea 2-3 posts nuevos, actualiza `posts.js` y hace deploy
- Deja un resumen en `NEWSLETTER-PENDIENTE.md`

### Deploy
El script `deploy-github.py`:
- Clona el repo en `/tmp`
- Sincroniza archivos locales (excluye `NEWSLETTER-PENDIENTE.md` y el propio script)
- Commitea y pushea a `main`
- GitHub Pages publica en ~2 minutos en https://puntodespawn.com

---

## 4. Formato de un post en posts.js

```js
{
  id: 'slug-del-post-fecha',
  titulo: 'Título del artículo',
  extracto: 'Descripción de 1-2 oraciones para la card.',
  fecha: 'YYYY-MM-DD',
  fechaDisplay: 'DD de mes de YYYY',
  categoria: 'gaming',        // gaming | patch-notes | tecnologia | comunidad
  tags: ['tag1', 'tag2'],
  juego: 'nombre-del-juego',  // null si no aplica
  juegoDisplay: 'Nombre',     // null si no aplica
  imagen: 'https://...',      // URL pública de imagen verificada
  archivo: 'posts/slug-del-post-fecha.html'
}
```

---

## 5. Template HTML de posts

Todo post nuevo debe seguir esta estructura base:

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
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5515559999355995" crossorigin="anonymous"></script>
</head>
<body>
  <!-- header, main con .post-article, footer -->
  <!-- Al final: -->
  <script src="../data/posts.js"></script>
  <script src="../js/posts.js"></script>
  <script src="../js/main.js"></script>
  <script>renderRelatedPosts('[ID-DEL-POST]', '[CATEGORIA]');</script>
  <button class="scroll-top" id="scroll-top" aria-label="Volver arriba">↑</button>
</body>
</html>
```

El script de AdSense **debe estar en el `<head>` de todos los HTMLs** (ya insertado en los 116 archivos existentes).

---

## 6. Google AdSense

- **Publisher ID:** `ca-pub-5515559999355995`
- **Estado:** en revisión (solicitado el 6 de julio de 2026)
- **Script insertado en:** los 116 HTMLs del proyecto
- **ads.txt:** creado en la raíz del proyecto con la línea:
  ```
  google.com, pub-5515559999355995, DIRECT, f08c47fec0942fa0
  ```
- **CMP (banner de cookies europeo):** configurado con la CMP de Google (3 opciones)
- **Método de pago:** pendiente de configurar — se desbloquea cuando AdSense aprueba la cuenta. Configurarlo en Pagos → Gestionar configuración → agregar transferencia wire con datos de ARQ (routing number + account number desde la app de ARQ).
- **Umbral de pago:** USD 100 acumulados → transferencia automática mensual

---

## 7. Monetización pendiente — Afiliados

Pendiente de implementar. Opciones evaluadas:

**Mercado Libre Afiliados** (`afiliados.mercadolibre.com.ar`)
- Comisión: 1-4% por venta
- Cobro en ARS, directo a cuenta bancaria argentina
- Ideal para productos con disponibilidad local

**Amazon Associates**
- Comisión: 1-4% en USD
- Cobro por wire (compatible con ARQ)
- Ideal para periféricos importados sin disponibilidad local

**Integración planificada:**
- Sección "Dónde comprarlo" al final de posts de periféricos
- Posts tipo "los mejores X por menos de USD Y" con links afiliados
- Posible sección fija en sidebar/footer con recomendaciones

---

## 8. Reglas de contenido (para la tarea automática y posts manuales)

- **Imagen obligatoria** en todos los posts (prioridad: press kit oficial → Wikimedia Commons → og:image de artículo de prensa)
- **Verificación antes de deploy:** campos completos en posts.js, imagen accesible, HTML con `</html>` cerrado
- **Tono:** informal, argentino, sin corporativismos
- **Longitud ideal:** 300-500 palabras por post
- **No inventar** specs, precios, fechas ni nombres
- **Diversidad de categorías:** evitar dos patch-notes seguidos si hay variedad disponible
- Posts de **periféricos** deben incluir: precio USD, specs clave, para quién es, comparación con competidor
- Posts de **IA** deben incluir: qué cambió, qué podés hacer ahora, si es gratis/pago, restricciones geográficas para Argentina

---

## 9. Último deploy

**Fecha:** 6 de julio de 2026  
**Posts en producción (últimos):**
- Marvel Rivals Season 9 — Jubilee y The Hood (patch-notes)
- OpenAI GPT-5.6: Sol, Terra y Luna (tecnologia)
- Epic gratis 9 de julio: Nova Lands y Tattoo Tycoon (gaming)

**Próximas fechas a cubrir:**
- 7 julio: Reveal oficial Season 9 Marvel Rivals
- 8 julio: Embargo reviews AC Black Flag Resynced
- 9 julio: Lanzamiento AC Black Flag Resynced + nuevo ciclo Epic gratis
- 10 julio: Lanzamiento Marvel Rivals Season 9
- 15 julio: Parche 26.14 LoL + Xbox Game Pass pierde 12 juegos
- Mediados julio: GPT-5.6 disponible para todos los usuarios

---

## 10. Contacto y cuentas vinculadas

- **GitHub:** cejaloca
- **Instagram:** @puntodespawn.ok
- **Google AdSense:** nicolasguazzotti@gmail.com (no exponer en el sitio)
- **Cobro AdSense futuro:** ARQ (wire transfer USD)
