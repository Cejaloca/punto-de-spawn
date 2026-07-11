#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generate-rss.py — Genera feed.xml (RSS 2.0) para PuntoDeSpawn
Lee data/posts.js y arma el feed con los últimos MAX_POSTS posts.

Uso:
    python3 generate-rss.py
"""

import re
import sys
from datetime import date, datetime
from email.utils import formatdate
from pathlib import Path

DOMINIO    = "https://puntodespawn.com"
FEED_URL   = f"{DOMINIO}/feed.xml"
MAX_POSTS  = 30   # cantidad de posts en el feed


def encontrar_raiz() -> Path:
    return Path(__file__).resolve().parent


def parsear_posts(js: str):
    """Extrae dicts con titulo/extracto/fecha/archivo/imagen de posts.js."""
    posts = []
    for bloque in re.split(r"\},\s*\{", js):
        def campo(name):
            # busca campo: 'valor' o campo: "valor" o campo: null
            m = re.search(rf"{name}\s*:\s*'((?:[^'\\]|\\.)*)'", bloque)
            if m: return m.group(1).replace("\\'", "'")
            m = re.search(rf'{name}\s*:\s*"((?:[^"\\]|\\.)*)"', bloque)
            if m: return m.group(1).replace('\\"', '"')
            return None

        archivo = campo('archivo')
        if not archivo:
            continue
        posts.append({
            'titulo':   campo('titulo')   or 'Sin título',
            'extracto': campo('extracto') or '',
            'fecha':    campo('fecha')    or date.today().isoformat(),
            'archivo':  archivo,
            'imagen':   campo('imagen'),
        })
    return posts


def fecha_rfc822(iso: str) -> str:
    """Convierte '2026-07-10' a RFC 822 que espera RSS."""
    try:
        dt = datetime.strptime(iso, '%Y-%m-%d')
        return formatdate(dt.timestamp(), usegmt=True)
    except Exception:
        return formatdate(usegmt=True)


def escape_xml(s: str) -> str:
    return (s.replace('&', '&amp;')
             .replace('<', '&lt;')
             .replace('>', '&gt;')
             .replace('"', '&quot;'))


def main():
    raiz = encontrar_raiz()
    posts_js_path = raiz / "data" / "posts.js"

    if not posts_js_path.exists():
        print(f"ERROR: no se encontró {posts_js_path}")
        sys.exit(1)

    contenido = posts_js_path.read_text(encoding='utf-8', errors='replace')
    posts = parsear_posts(contenido)

    if not posts:
        print("ERROR: no se pudo extraer ningún post de data/posts.js")
        sys.exit(1)

    # Tomar los últimos MAX_POSTS (posts.js ya está ordenado de más nuevo a más viejo)
    posts = posts[:MAX_POSTS]
    last_build = fecha_rfc822(posts[0]['fecha']) if posts else formatdate(usegmt=True)

    lines = []
    lines.append('<?xml version="1.0" encoding="UTF-8"?>')
    lines.append('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">')
    lines.append('  <channel>')
    lines.append(f'    <title>PuntoDeSpawn</title>')
    lines.append(f'    <link>{DOMINIO}</link>')
    lines.append(f'    <description>Revista digital de tecnología y gaming hecha en Argentina.</description>')
    lines.append(f'    <language>es-ar</language>')
    lines.append(f'    <lastBuildDate>{last_build}</lastBuildDate>')
    lines.append(f'    <atom:link href="{FEED_URL}" rel="self" type="application/rss+xml"/>')
    lines.append(f'    <image>')
    lines.append(f'      <url>{DOMINIO}/favicon.svg</url>')
    lines.append(f'      <title>PuntoDeSpawn</title>')
    lines.append(f'      <link>{DOMINIO}</link>')
    lines.append(f'    </image>')

    for p in posts:
        url  = f"{DOMINIO}/{p['archivo']}"
        pub  = fecha_rfc822(p['fecha'])
        desc = escape_xml(p['extracto'])
        title = escape_xml(p['titulo'])
        lines.append('    <item>')
        lines.append(f'      <title>{title}</title>')
        lines.append(f'      <link>{url}</link>')
        lines.append(f'      <guid isPermaLink="true">{url}</guid>')
        lines.append(f'      <pubDate>{pub}</pubDate>')
        lines.append(f'      <description>{desc}</description>')
        if p['imagen']:
            img = escape_xml(p['imagen'])
            lines.append(f'      <media:content url="{img}" medium="image"/>')
        lines.append('    </item>')

    lines.append('  </channel>')
    lines.append('</rss>')

    salida = raiz / "feed.xml"
    salida.write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(f"OK: feed.xml generado con {len(posts)} posts.")


if __name__ == "__main__":
    main()
