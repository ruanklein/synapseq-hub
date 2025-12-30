#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-or-later
#
# SynapSeq Hub Generator
# Copyright (C) 2025 SynapSeq Project Contributors
#
# This file is part of SynapSeq Hub.
# Licensed under the GNU General Public License v3.0 or later.
# See the LICENSE_CODE file for full license text.

import json, os, re, sys, subprocess
from datetime import datetime, UTC

# Repository configuration
RAW_BASE = f"https://synapseq-hub.ruan.sh"

# Package directory
PACKAGES_DIR = "static/packages"

# Manifest configuration
MANIFEST_FILE = "manifest.json"
MANIFEST_VERSION = "1.0.0"

# File size limits
MAX_TEXT_FILE_SIZE = 32 * 1024         # 32KB
MAX_BACKGROUND_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def extract_dependencies(filepath):
    """
    Extracts all @presetlist and @background references from a .spsq file.
    Returns a list of dependency objects with 'type' and 'download_url' fields.

    Rules:
      - All referenced files must be located within the repository (no external URLs).
      - If an external URL is found, the script exits with error code 1.
    """
    deps = []
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    def make_url(filename):
        if filename.startswith("http://") or filename.startswith("https://"):
            print(f"ERROR: File '{filepath}' references an external URL '{filename}'.")
            print("   All @presetlist and @background files must reside within the SynapSeq Hub repository.")
            sys.exit(1)
        return f"{RAW_BASE}/packages/{filename}"

    preset_pattern = re.compile(r"^@presetlist\s+([^\s]+\.spsq)", re.MULTILINE)
    for match in preset_pattern.findall(content):
        preset_path = os.path.join(PACKAGES_DIR, match)
        if not os.path.exists(preset_path):
            print(f"ERROR: File '{filepath}' references missing preset list '{match}'.")
            sys.exit(1)
        validate_file_size(preset_path)
        
        deps.append({
            "type": "presetlist",
            "name": os.path.splitext(os.path.basename(match))[0],
            "download_url": make_url(match)
        })

    background_pattern = re.compile(r"^@background\s+([^\s]+\.wav)", re.MULTILINE)
    for match in background_pattern.findall(content):
        background_path = os.path.join(PACKAGES_DIR, match)
        if not os.path.exists(background_path):
            print(f"ERROR: File '{filepath}' references missing background '{match}'.")
            sys.exit(1)
        validate_file_size(background_path)
        
        deps.append({
            "type": "background",
            "name": os.path.splitext(os.path.basename(match))[0],
            "download_url": make_url(match)
        })

    return deps


def get_author(filename):
    """
    Extracts the author (GitHub username) from the filename.

    Expected format:
        <category>-<username>-<name>.spsq

    Example:
        samples-synapseq-binaural.spsq -> synapseq
    """
    base = os.path.splitext(filename)[0]
    parts = base.split('-', 2)
    
    if len(parts) < 3:
        print(f"ERROR: Invalid filename '{filename}'. Expected format '<category>-<username>-<name>.spsq'.")
        sys.exit(1)
    
    return parts[1]
        
def get_category(filename):
    """
    Extracts the category from the filename.

    Expected format:
        <category>-<username>-<name>.spsq

    Example:
        samples-synapseq-binaural.spsq -> samples
    """
    base = os.path.splitext(filename)[0]
    parts = base.split('-', 1)
    
    if len(parts) < 1:
        print(f"ERROR: Invalid filename '{filename}'. Expected format '<category>-<username>-<name>.spsq'.")
        sys.exit(1)
    
    return parts[0]

def get_name(filename):
    """
    Extracts the sequence name from the filename.

    Expected format:
        <category>-<username>-<name>.spsq

    Example:
        samples-synapseq-binaural.spsq -> binaural
    """
    if not filename.endswith(".spsq"):
        print(f"ERROR: File '{filename}' is not a valid SynapSeq sequence (.spsq).")
        sys.exit(1)

    base = os.path.splitext(filename)[0]
    parts = base.split('-', 2)
    
    if len(parts) < 3:
        print(f"ERROR: Invalid filename '{filename}'. Expected format '<category>-<username>-<name>.spsq'.")
        sys.exit(1)
    
    name = parts[2]
    
    if not name or not name.strip():
        print(f"ERROR: Invalid or empty sequence name in '{filename}'.")
        sys.exit(1)

    return name.strip()

def get_id(filename):
    """
    Derives the SynapSeq Hub ID from a filename.

    Expected format:
        <category>-<author>-<name>.spsq

    The resulting ID format:
        author.category.name

    Example:
        samples-synapseq-binaural.spsq -> synapseq.samples.binaural
    """
    base = os.path.splitext(filename)[0]
    parts = base.split('-', 2)
    
    if len(parts) < 3:
        print(f"ERROR: Invalid filename '{filename}'. Expected format '<category>-<author>-<name>.spsq'.")
        sys.exit(1)
    
    category = parts[0]
    author = parts[1]
    name = parts[2]

    for field_name, field_value in [("category", category), ("author", author), ("name", name)]:
        if not field_value or not field_value.strip():
            print(f"ERROR: Missing or empty {field_name} in '{filename}'.")
            sys.exit(1)
        if any(c in field_value for c in " /\\"):
            print(f"ERROR: Invalid character in {field_name} ('{field_value}'). Only alphanumeric, hyphens, or underscores allowed.")
            sys.exit(1)

    return f"{author.strip()}.{category.strip()}.{name.strip()}"

def get_updated_at(filepath):
    """Returns last git commit date (ISO 8601 UTC) for this file."""
    try:
        ts = subprocess.check_output(
            ["git", "log", "-1", "--format=%cI", filepath],
            text=True
        ).strip()
        if ts:
            return ts
    except subprocess.CalledProcessError:
        pass
    return datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")

def walk_files():
    """
    Scans all .spsq files in the packages directory.
    For each file:
      - Extracts its dependencies
      - Derives category and author from filename
      - Adds a structured entry to the index list
    """
    entries = []

    for file in os.listdir(PACKAGES_DIR):
        if not file.endswith(".spsq") or file.startswith("presets-"):
            continue
        
        filepath = os.path.join(PACKAGES_DIR, file)
        relpath = os.path.relpath(filepath)
        # Remove 'static/' prefix from path since it's the root in production
        relpath = relpath.replace('static/', '', 1)
        validate_file_size(filepath)

        id = get_id(file)
        name = get_name(file)
        category = get_category(file)
        author = get_author(file)
        deps = extract_dependencies(filepath)
        
        # Generate thumbnail path: same directory as path + id + .webp
        path_dir = os.path.dirname(relpath)
        thumbnail = f"{path_dir}/{id}.webp"

        entries.append({
            "id": id,
            "name": name,
            "author": author,
            "path": relpath,
            "category": category,
            "download_url": f"{RAW_BASE}/{relpath}",
            "thumbnail": thumbnail,
            "updated_at": get_updated_at(filepath),
            "dependencies": deps
        })

    # Sort entries: primary by update date (newest first), secondary by name (A-Z)
    # Negate date comparison for DESC, keep name for ASC
    entries.sort(key=lambda e: e["name"])  # First sort by name A-Z
    entries.sort(key=lambda e: e["updated_at"], reverse=True)  # Then by date (stable sort preserves name order)
    return entries
                
                
def validate_file_size(filepath):
    """
    Validates the file size according to its type.

    - .spsq files (both sequences and preset lists): max 32KB
    - .wav files used as backgrounds: max 10MB

    If a file exceeds the limit, exits with an error.
    """
    size = os.path.getsize(filepath)

    if filepath.endswith(".spsq"):
        if size > MAX_TEXT_FILE_SIZE:
            print(f"ERROR: File '{filepath}' exceeds maximum size ({MAX_TEXT_FILE_SIZE / 1024:.0f}KB allowed).")
            sys.exit(1)

    elif filepath.endswith(".wav"):
        if size > MAX_BACKGROUND_FILE_SIZE:
            print(f"ERROR: File '{filepath}' exceeds maximum size ({MAX_BACKGROUND_FILE_SIZE / (1024 * 1024):.0f}MB allowed).")
            sys.exit(1)


def main():
    """
    Entry point. Walks through all directories, generates the complete index,
    and writes it to index.json in the repository root.
    """
    entries = walk_files()

    manifest_data = {
        "version": MANIFEST_VERSION,
        "lastUpdated": datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "entries": entries
    }

    with open(f"src/lib/data/{MANIFEST_FILE}", "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, ensure_ascii=False, indent=2)

    print(f"Manifest built successfully with {len(entries)} entries -> src/lib/data/{MANIFEST_FILE}")
    print(f"   Version: {manifest_data['version']} | Updated: {manifest_data['lastUpdated']}")


if __name__ == "__main__":
    sys.exit(main())