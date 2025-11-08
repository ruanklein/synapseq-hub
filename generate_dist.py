#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-or-later
#
# SynapSeq Hub Generator
# Copyright (C) 2025 SynapSeq Project Contributors
#
# This file is part of SynapSeq Hub.
# Licensed under the GNU General Public License v3.0 or later.
# See the LICENSE_CODE file for full license text.

import os
import json
import shutil
from datetime import datetime, UTC

TEMPLATE_DIR = "page-template"
DIST_DIR = "dist"

MANIFEST_SRC = "manifest.json"
MANIFEST_OUT = os.path.join(DIST_DIR, "manifest.json")
TEMPLATE_PATH = os.path.join(TEMPLATE_DIR, "base.html")
OUTPUT_PATH = os.path.join(DIST_DIR, "index.html")


def render_template(template_path, context):
    """Replace placeholders {{key}} in template with given values."""
    with open(template_path, "r", encoding="utf-8") as f:
        html = f.read()
    for key, value in context.items():
        html = html.replace(f"{{{{{key}}}}}", str(value))
    return html


def build_static_files():
    """Copy style.css, main.js, logo, favicon, and sequence folders from page-template/ to dist/static/."""
    dist_static = os.path.join(DIST_DIR, "static")
    os.makedirs(dist_static, exist_ok=True)

    # Copy CSS, JS, logo and favicon
    src_css = os.path.join(TEMPLATE_DIR, "style.css")
    src_js = os.path.join(TEMPLATE_DIR, "main.js")
    src_logo = os.path.join(TEMPLATE_DIR, "logo.png")
    src_favicon = os.path.join(TEMPLATE_DIR, "favicon.ico")
    
    dst_css = os.path.join(dist_static, "style.css")
    dst_js = os.path.join(dist_static, "main.js")
    dst_logo = os.path.join(dist_static, "logo.png")
    dst_favicon = os.path.join(dist_static, "favicon.ico")

    if os.path.exists(src_css):
        shutil.copy(src_css, dst_css)
    else:
        print(f"WARNING: {src_css} not found")

    if os.path.exists(src_js):
        shutil.copy(src_js, dst_js)
    else:
        print(f"WARNING: {src_js} not found")

    if os.path.exists(src_logo):
        shutil.copy(src_logo, dst_logo)
    else:
        print(f"WARNING: {src_logo} not found")

    if os.path.exists(src_favicon):
        shutil.copy(src_favicon, dst_favicon)
    else:
        print(f"WARNING: {src_favicon} not found")

    # Copy official and community folders
    official_src = "official"
    community_src = "community"
    official_dst = os.path.join(DIST_DIR, "official")
    community_dst = os.path.join(DIST_DIR, "community")

    if os.path.exists(official_src):
        shutil.copytree(official_src, official_dst, dirs_exist_ok=True)
        print(f"-> Copied {official_src}/ to dist/")
    else:
        print(f"WARNING: {official_src} folder not found")

    if os.path.exists(community_src):
        shutil.copytree(community_src, community_dst, dirs_exist_ok=True)
        print(f"-> Copied {community_src}/ to dist/")
    else:
        print(f"WARNING: {community_src} folder not found")

    print("-> Static assets copied to dist/static")


def build_manifest():
    """Copy manifest.json to dist/ (no minification)."""
    if not os.path.exists(MANIFEST_SRC):
        print(f"ERROR: {MANIFEST_SRC} not found")
        raise SystemExit(1)

    os.makedirs(DIST_DIR, exist_ok=True)
    shutil.copy(MANIFEST_SRC, MANIFEST_OUT)
    print("-> manifest.json copied to dist/")


def build_index():
    """Render base.html with manifest data and write dist/index.html."""
    if not os.path.exists(MANIFEST_SRC):
        print(f"ERROR: {MANIFEST_SRC} not found")
        raise SystemExit(1)

    with open(MANIFEST_SRC, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    entries = manifest.get("entries", [])
    total = len(entries)

    rows = ""
    for e in entries:
        path = e["path"]
        origin = e.get("origin", "")
        category = e["category"]
        name = e["name"]
        author = e["author"]
        updated_at = e.get("updated_at", "")
        
        # Add badge class for origin
        origin_class = "badge-official" if origin == "official" else "badge-community"
        
        rows += (
            f"<tr onclick=\"showSequence('/{path}')\">"
            f"<td><span class=\"origin-badge {origin_class}\">{origin}</span></td>"
            f"<td>{category}</td>"
            f"<td class=\"sequence-name\">{name}</td>"
            f"<td class=\"author-name\">{author}</td>"
            f"<td class=\"updated-time\" data-timestamp=\"{updated_at}\">{updated_at}</td></tr>\n"
        )

    context = {
        "total": total,
        "last_updated": manifest.get("lastUpdated", ""),
        "generated_at": datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "rows": rows,
    }

    html = render_template(TEMPLATE_PATH, context)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write(html)

    print("-> index.html generated in dist/")


def clean_dist():
    """Remove old dist and recreate."""
    if os.path.exists(DIST_DIR):
        shutil.rmtree(DIST_DIR)
    os.makedirs(DIST_DIR)
    print("-> Cleaned dist directory")


def main():
    clean_dist()
    build_static_files()
    build_manifest()
    build_index()
    print("\nBuild completed successfully -> ./dist\n")


if __name__ == "__main__":
    main()