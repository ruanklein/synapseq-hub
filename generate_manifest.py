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
RAW_BASE = f"https://ruanklein.github.io/synapseq-hub"

# Main categories to scan
ROOT_DIRS = ["official", "community"]

# Manifest configuration
MANIFEST_FILE = "manifest.json"
MANIFEST_VERSION = "1.0.0"

# File size limits
MAX_TEXT_FILE_SIZE = 32 * 1024         # 32KB
MAX_BACKGROUND_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def extract_dependencies(filepath, category):
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
        return f"{RAW_BASE}/{category}/{filename}"

    preset_pattern = re.compile(r"^@presetlist\s+([^\s]+\.spsq)", re.MULTILINE)
    for match in preset_pattern.findall(content):
        preset_path = os.path.join(category, match)
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
        background_path = os.path.join(category, match)
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


def get_author(filepath):
    """
    Determines the author based on the file path.

    Expected layouts:
      - official/<category>/<file>.spsq
      - community/<category>/<author>/<file>.spsq

    Any deviation from these patterns is treated as an error.

    Returns:
      "synapseq-official" for official files,
      <author> (GitHub username) for community files.
    """
    parts = filepath.split(os.sep)

    if not parts:
        print(f"ERROR: Invalid path '{filepath}'. Could not split into components.")
        sys.exit(1)

    origin = parts[0]
    if origin == "official":
        if len(parts) < 2:
            print(f"ERROR: Invalid official path '{filepath}'. Expected 'official/<category>/<file>.spsq'.")
            sys.exit(1)
        return "synapseq-official"

    elif origin == "community":
        if len(parts) < 3:
            print(
                f"ERROR: Invalid community path '{filepath}'. "
                "Expected 'community/<category>/<author>/<file>.spsq'."
            )
            sys.exit(1)
        return parts[2]

    else:
        print(
            f"ERROR: Invalid root directory in path '{filepath}'. "
            "Files must be under 'official/' or 'community/'."
        )
        sys.exit(1)
        
def get_origin_and_category(filepath):
    """
    Extracts origin ("official" or "community") and category (subfolder name)
    from the given relative file path.

    Example inputs:
      official/samples/focus-one.spsq
      community/meditation/ruanklein/relaxation.spsq

    Returns:
      ("official", "samples")
      ("community", "meditation")
    """
    parts = filepath.split(os.sep)

    if len(parts) < 2:
        print(f"ERROR: Invalid file path '{filepath}'. Expected at least two segments.")
        sys.exit(1)

    origin = parts[0]
    if origin not in ("official", "community"):
        print(f"ERROR: Invalid origin '{origin}' in '{filepath}'. Must be 'official' or 'community'.")
        sys.exit(1)

    category = parts[1]
    return origin, category

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
    Recursively walks through the root directories (official, community),
    scanning all .spsq files. For each file:
      - Extracts its dependencies
      - Derives category and author
      - Adds a structured entry to the index list
    """
    entries = []
    
    for root_dir in ROOT_DIRS:
        for dirpath, _, filenames in os.walk(root_dir):
            
            for file in filenames:
                if not file.endswith(".spsq") or file.startswith("presets-"):
                    continue
                
                filepath = os.path.join(dirpath, file)
                relpath = os.path.relpath(filepath)
                validate_file_size(filepath)

                origin, category = get_origin_and_category(relpath)
                author = get_author(relpath)
                deps = extract_dependencies(filepath, os.path.dirname(filepath))

                entries.append({
                    "name": os.path.splitext(file)[0],
                    "author": author,
                    "path": relpath,
                    "origin": origin,
                    "category": category,
                    "download_url": f"{RAW_BASE}/{relpath}",
                    "updated_at": get_updated_at(filepath),
                    "dependencies": deps
                })

    # Sort entries by update date (newest first)
    entries.sort(key=lambda e: e["updated_at"], reverse=True)
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

    with open(MANIFEST_FILE, "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, ensure_ascii=False, indent=2)

    print(f"Manifest built successfully with {len(entries)} entries -> {MANIFEST_FILE}")
    print(f"   Version: {manifest_data['version']} | Updated: {manifest_data['lastUpdated']}")


if __name__ == "__main__":
    sys.exit(main())