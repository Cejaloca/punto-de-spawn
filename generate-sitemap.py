#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generate-sitemap.py — Genera sitemap.xml para PuntoDeSpawn
Lee data/posts.js, extrae todos los posts y arma el sitemap con las
páginas estáticas + todos los posts, usando la fecha de cada post
como <lastmod>.

Uso:
    python3 generate-sitemap.py

Se puede correr desde cualquier lado: busca la carpeta del proyecto
relativa a la ubicación del propio script.
"""

import re
import sys
from datetime import date
from pathlib import Path

DOMINIO = "https://puntodespawn.com"

# Páginas estáticas del sitio: (ruta, changefreq, priority)
PAGINAS_ESTATICAS = [
    ("index.html",      "daily",   "1.0"),
    ("gaming.html",     "daily",   "0.9"),
    ("tecnologia.html", "daily",   "0.9"),
    ("comunidad.html",  "weekly",  "0.7"),
    ("nosotros.html",   "monthly", "0.4"),
]


def encontrar_raiz_proyecto() -> Path:
    """La raíz del proyecto es la carpeta donde vive este script."""
    return Path(__file__).resolve().parent


def parsear_posts(posts_js: str):
    """
    Extrae (archivo, fecha) de cada entrada del array POSTS.
    Es tolerante al formato: busca pares archivo/fecha dentro de cada
    objeto {...} del array, sin depender del orden de los campos.
    """
    posts = []
    # Separar por objetos de primer nivel de forma simple:
    # cada entrada tiene un campo archivo: 'posts/....html'
    bloques = re.split(r"\},\s*\{", posts_js)
    for bloque in bloques:
        m_archivo = re.search(
            r"archivo\s*:\s*['\"](posts/[^'\"]+\.html)['\"]", bloque
        )
        if not m_archivo:
            continue
        m_fecha = re.search(
            r"fecha\s*:\s*['\"](\d{4}-\d{2}-\d{2})['\"]", bloque
        )
        fecha = m_fecha.group(1) if m_fecha else date.today().isoformat()
        posts.append((m_archivo.group(1), fecha))
    return posts


def url_entry(loc: str, lastmod: str, changefreq: str, priority: str) -> str:
    return (
        "  <url>\n"
        f"    <loc>{loc}</loc>\n"
        f"    <lastmod>{lastmod}</lastmod>\n"
        f"    <changefreq>{changefreq}</changefreq>\n"
        f"    <priority>{priority}</priority>\n"
        "  </url>\n"
    )


def main():
    raiz = encontrar_raiz_proyecto()
    posts_js_path = raiz / "data" / "posts.js"

    if not posts_js_path.exists():
        print(f"ERROR: no se encontró {posts_js_path}")
        print("Poné este script en la raíz del proyecto (junto a deploy-github.py).")
        sys.exit(1)

    contenido = posts_js_path.read_text(encoding="utf-8", errors="replace")
    posts = parsear_posts(contenido)

    if not posts:
        print("ERROR: no se pudo extraer ningún post de data/posts.js")
        print("Revisá que el array POSTS tenga el formato esperado.")
        sys.exit(1)

    hoy = date.today().isoformat()
    xml = ['<?xml version="1.0" encoding="UTF-8"?>\n']
    xml.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')

    # Páginas estáticas (lastmod = hoy, porque el home y categorías
    # cambian con cada post nuevo)
    for ruta, freq, prio in PAGINAS_ESTATICAS:
        loc = f"{DOMINIO}/" if ruta == "index.html" else f"{DOMINIO}/{ruta}"
        xml.append(url_entry(loc, hoy, freq, prio))

    # Posts (lastmod = fecha del post)
    faltantes = []
    for archivo, fecha in posts:
        if not (raiz / archivo).exists():
            faltantes.append(archivo)
        xml.append(url_entry(f"{DOMINIO}/{archivo}", fecha, "monthly", "0.8"))

    xml.append("</urlset>\n")

    salida = raiz / "sitemap.xml"
    salida.write_text("".join(xml), encoding="utf-8")

    print(f"OK: sitemap.xml generado con {len(PAGINAS_ESTATICAS)} páginas "
          f"estáticas + {len(posts)} posts.")
    if faltantes:
        print("\nAVISO: estos posts figuran en posts.js pero el HTML no existe:")
        for f in faltantes:
            print(f"  - {f}")
        print("Igual se incluyeron en el sitemap; revisá si es un error.")


if __name__ == "__main__":
    main()
