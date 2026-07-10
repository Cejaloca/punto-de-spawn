# Panel Admin — Credenciales y Configuración

## Cloudflare Web Analytics
- **Account ID:** `efc3e23e525dcda26212c8e06548dfbe`
- **Site Tag:** `f8b7d66ad6bd480a90b084e861db3d91`
- **API Token:** *(guardado en Cloudflare Worker — no almacenar aquí)*

## Google Analytics 4
- **Measurement ID:** `G-JGPHS744ZY`
- **Property ID:** `15236077275`
- **Snippet:** instalado en todas las páginas del sitio (127 archivos HTML) el 10/07/2026

## Google Cloud — Proyecto: Puntodespawn
- **Project ID:** `puntodespawn`
- **APIs habilitadas:**
  - Google Analytics Data API
  - Google Search Console API
- **OAuth Client ID:** `696116811813-98lj5qo9o8rg1nffsqbhi1dc63im6cep.apps.googleusercontent.com`
- **Tipo:** Web Application
- **JavaScript origin autorizado:** `https://puntodespawn.com`
- **Usuario de prueba:** `nicolasguazzotti@gmail.com`

## Panel Admin
- **URL:** `https://puntodespawn.com/admin.html`
- **Tabs:** Visitas (Cloudflare), Búsquedas (GSC), Comportamiento (GA4), Contenido, Ajustes
- **Credenciales guardadas en:** localStorage del browser

## Notas
- GA4 puede tardar 24-48hs en mostrar datos (snippet instalado hoy 10/07/2026)
- El OAuth Client ID sirve tanto para GSC como para GA4 (mismo Client ID, distintos scopes)
- Para GSC: necesitás verificar propiedad en Search Console con la misma cuenta de Google
