#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
add-seo-tags.py — Agrega Open Graph, Twitter Card, canonical y JSON-LD
(schema.org) a todas las páginas del sitio.

Es idempotente: si una página ya tiene <meta property="og:title" ...>
no la vuelve a tocar. Se puede correr las veces que haga falta, y
conviene correrlo en cada deploy para que los posts nuevos salgan con
las etiquetas puestas automáticamente.

Uso:
    python3 add-seo-tags.py
"""

import re
import sys
from pathlib import Path

DOMINIO = "https://puntodespawn.com"
IMG_DEFAULT = f"{DOMINIO}/images/og-social.jpg"

# Páginas estáticas: (archivo, tipo_og)
PAGINAS_ESTATICAS = [
    "index.html",
    "tecnologia.html",
    "gaming.html",
    "ofertas.html",
    "comunidad.html",
    "esports.html",
    "nosotros.html",
    "contacto.html",
    "privacidad.html",
    "buscar.html",
    "foro/post.html",
]


def raiz_proyecto() -> Path:
    return Path(__file__).resolve().parent


def parsear_posts(posts_js: str):
    """Extrae los campos relevantes de cada entrada del array POSTS,
    tolerante al orden de los campos (mismo enfoque que generate-sitemap.py)."""
    posts = {}
    bloques = re.split(r"\},\s*\{", posts_js)
    for bloque in bloques:
        m_archivo = re.search(r"archivo\s*:\s*['\"](posts/[^'\"]+\.html)['\"]", bloque)
        if not m_archivo:
            continue
        archivo = m_archivo.group(1)

        def campo(nombre, default=None):
            m = re.search(nombre + r"\s*:\s*'((?:[^'\\]|\\.)*)'", bloque)
            if not m:
                m = re.search(nombre + r'\s*:\s*"((?:[^"\\]|\\.)*)"', bloque)
            if not m:
                return default
            return m.group(1).replace("\\'", "'").replace('\\"', '"')

        posts[archivo] = {
            "titulo": campo("titulo", ""),
            "extracto": campo("extracto", ""),
            "imagen": campo("imagen", ""),
            "fecha": campo("fecha", ""),
            "categoria": campo("categoria", ""),
        }
    return posts


def url_absoluta_imagen(imagen: str) -> str:
    if not imagen:
        return IMG_DEFAULT
    if imagen.startswith("http://") or imagen.startswith("https://"):
        return imagen
    return f"{DOMINIO}/{imagen.lstrip('/')}"


def canonical_de(ruta_relativa: str) -> str:
    if ruta_relativa in ("index.html",):
        return f"{DOMINIO}/"
    return f"{DOMINIO}/{ruta_relativa}"


def extraer(patron, contenido, default=""):
    m = re.search(patron, contenido)
    return m.group(1).strip() if m else default


def escapar_html_attr(s: str) -> str:
    return (s.replace("&", "&amp;").replace('"', "&quot;")
             .replace("<", "&lt;").replace(">", "&gt;"))


def bloque_meta(og_title, og_desc, canonical, imagen_abs, tipo, es_default_img,
                 fecha_iso=None, categoria=None):
    ot = escapar_html_attr(og_title)
    od = escapar_html_attr(og_desc)
    lineas = [
        f'  <link rel="canonical" href="{canonical}">',
        f'  <meta property="og:type" content="{tipo}">',
        '  <meta property="og:site_name" content="PuntoDeSpawn">',
        '  <meta property="og:locale" content="es_AR">',
        f'  <meta property="og:title" content="{ot}">',
        f'  <meta property="og:description" content="{od}">',
        f'  <meta property="og:url" content="{canonical}">',
        f'  <meta property="og:image" content="{imagen_abs}">',
    ]
    if es_default_img:
        lineas.append('  <meta property="og:image:width" content="1200">')
        lineas.append('  <meta property="og:image:height" content="630">')
    if fecha_iso:
        lineas.append(f'  <meta property="article:published_time" content="{fecha_iso}T12:00:00-03:00">')
    if categoria:
        lineas.append(f'  <meta property="article:section" content="{escapar_html_attr(categoria)}">')
    lineas += [
        '  <meta name="twitter:card" content="summary_large_image">',
        f'  <meta name="twitter:title" content="{ot}">',
        f'  <meta name="twitter:description" content="{od}">',
        f'  <meta name="twitter:image" content="{imagen_abs}">',
    ]
    return "\n".join(lineas) + "\n"


def bloque_jsonld(titulo, extracto, imagen_abs, canonical, fecha_iso):
    import json
    data = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": titulo,
        "description": extracto,
        "image": [imagen_abs],
        "datePublished": f"{fecha_iso}T12:00:00-03:00",
        "dateModified": f"{fecha_iso}T12:00:00-03:00",
        "author": {"@type": "Organization", "name": "PuntoDeSpawn"},
        "publisher": {
            "@type": "Organization",
            "name": "PuntoDeSpawn",
            "logo": {"@type": "ImageObject", "url": IMG_DEFAULT},
        },
        "mainEntityOfPage": {"@type": "WebPage", "@id": canonical},
    }
    return f'  <script type="application/ld+json">{json.dumps(data, ensure_ascii=False)}</script>\n'


def backfill_canonical(path: Path, canonical: str) -> bool:
    """Para páginas que ya tienen og:title (de una versión anterior del
    template) pero les falta <link rel="canonical">. Devuelve True si agregó algo."""
    contenido = path.read_text(encoding="utf-8", errors="replace")
    if 'rel="canonical"' in contenido:
        return False
    m = re.search(r'(<meta property="og:type"[^>]*>\n)', contenido)
    if not m:
        m = re.search(r'(<meta name="description"[^>]*>\n)', contenido)
    if not m:
        return False
    nuevo = contenido[:m.start()] + f'  <link rel="canonical" href="{canonical}">\n' + contenido[m.start():]
    path.write_text(nuevo, encoding="utf-8")
    return True


def inyectar(path: Path, bloque: str, jsonld: str = "", canonical: str = None):
    contenido = path.read_text(encoding="utf-8", errors="replace")
    if 'property="og:title"' in contenido:
        if canonical and backfill_canonical(path, canonical):
            return "canonical-agregado"
        return "ya-tiene"

    m = re.search(r'(<meta name="description"[^>]*>\n)', contenido)
    if not m:
        return "sin-description"

    insercion = bloque + (jsonld if jsonld else "")
    nuevo = contenido[:m.end()] + insercion + contenido[m.end():]
    path.write_text(nuevo, encoding="utf-8")
    return "ok"


def main():
    raiz = raiz_proyecto()
    posts_js_path = raiz / "data" / "posts.js"
    posts = parsear_posts(posts_js_path.read_text(encoding="utf-8", errors="replace"))

    stats = {"ok": 0, "ya-tiene": 0, "sin-description": 0, "no-existe": 0}

    # ── Posts ──────────────────────────────────────────────────
    for archivo, datos in posts.items():
        path = raiz / archivo
        if not path.exists():
            stats["no-existe"] += 1
            continue

        canonical = canonical_de(archivo)
        imagen_abs = url_absoluta_imagen(datos["imagen"])
        es_default = imagen_abs == IMG_DEFAULT
        titulo = datos["titulo"] or extraer(r"<title>(.*?)</title>", path.read_text(encoding="utf-8"))
        extracto = datos["extracto"] or extraer(r'<meta name="description" content="([^"]*)"', path.read_text(encoding="utf-8"))
        fecha_iso = datos["fecha"] or None

        bloque = bloque_meta(titulo, extracto, canonical, imagen_abs, "article",
                              es_default, fecha_iso=fecha_iso, categoria=datos["categoria"])
        jsonld = bloque_jsonld(titulo, extracto, imagen_abs, canonical, fecha_iso) if fecha_iso else ""

        resultado = inyectar(path, bloque, jsonld, canonical=canonical)
        stats[resultado] = stats.get(resultado, 0) + 1

    # ── Páginas estáticas ──────────────────────────────────────
    for ruta in PAGINAS_ESTATICAS:
        path = raiz / ruta
        if not path.exists():
            stats["no-existe"] += 1
            continue

        contenido = path.read_text(encoding="utf-8", errors="replace")
        titulo = extraer(r"<title>(.*?)</title>", contenido)
        extracto = extraer(r'<meta name="description" content="([^"]*)"', contenido)
        canonical = canonical_de(ruta)

        bloque = bloque_meta(titulo, extracto, canonical, IMG_DEFAULT, "website", True)
        resultado = inyectar(path, bloque, canonical=canonical)
        stats[resultado] = stats.get(resultado, 0) + 1

    print(f"SEO tags — nuevas: {stats.get('ok',0)}, ya tenían todo: {stats.get('ya-tiene',0)}, "
          f"solo canonical agregado: {stats.get('canonical-agregado',0)}, "
          f"sin <meta description> (no tocadas): {stats.get('sin-description',0)}, "
          f"archivo no encontrado: {stats.get('no-existe',0)}")


if __name__ == "__main__":
    main()
