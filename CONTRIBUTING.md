# Contributing to SynapSeq Hub

Thank you for your interest in contributing to the **SynapSeq Hub**, the official repository of sequences, presets, and soundscapes for [SynapSeq](https://github.com/ruanklein/synapseq).

This document describes how to contribute new `.spsq` sequences, preset lists, or background audio files while ensuring quality, compatibility, and integrity.

---

## Repository Structure

All contributions must follow this file naming pattern:

```
packages/<category>-<namespace>-<name>.spsq
```

Where:

- **`<category>`** -> Sequence category (`samples`, `focus`, `relax`, `meditation`, `sleep`, `creative`, etc.)
- **`<namespace>`** -> Identifier chosen by the contributor (see rules below)
- **`<name>`** -> The name of your sequence

All files (`.spsq` sequences and `.wav` backgrounds) are stored in the `packages/` directory at the root level.

**Naming conventions for different file types:**

- **Sequences:** `<category>-<namespace>-<name>.spsq`
- **Preset lists:** `presets-<namespace>-<name>.spsq`
- **Background audio:** `<namespace>-<name>.wav`

### Examples

```
packages/samples-synapseq-binaural.spsq
packages/focus-janedoe-deep-work.spsq
packages/relax-neurofocus-ocean-waves.spsq
packages/presets-janedoe-focus-collection.spsq
packages/presets-neurofocus-relax-set.spsq
packages/synapseq-pink-noise.wav
packages/janedoe-ocean-waves.wav
```

Pull Requests that do **not** follow this naming convention will be rejected.

---

## Author Namespace Rules

Every contributor must define a **namespace**, which uniquely identifies the author inside the SynapSeq Hub.

This namespace **does not need to match your GitHub username**, but it must follow strict formatting rules to ensure consistency and avoid collisions.

### Namespace Requirements

Your namespace **must** follow all of these rules:

- Only lowercase letters (`a–z`)
- Length between **3 and 20 characters**
- Allowed characters:
  - `a–z`
  - `0–9`
  - `-` (hyphen)
- Must **start with a letter**
- Must be **unique** within the Hub
- Must remain **consistent across all your PRs**
- Must **not** use reserved or generic names, such as:
  - `focus`, `relax`, `sleep`, `samples`, `synapseq`
  - `user`, `test`, `anon`, `default`, `temp`

### Examples of valid namespaces

```
janedoe
john-doe
neurofocus
alpha-lab
zencreator7
```

### Examples of invalid namespaces

```
samples
focus
user
aa
developer_123
9creator
MyName
```

---

## Quality and Integrity

SynapSeq Hub maintains a high standard of clarity and honesty about what brainwave entrainment can and cannot do.

Brainwave audio **cannot** reproduce the effects of drugs, medications, or chemical substances. Claims such as "LSD simulation", "ecstasy effect", "instant healing" or similar are unrealistic and misrepresent what binaural, monaural, or isochronic stimulation can achieve.

### Not allowed:

- Claims that sequences mimic drugs or psychoactive substances
- Promises of medical, pharmacological, or therapeutic outcomes
- Titles or descriptions suggesting impossible or exaggerated effects

### Allowed:

- Relaxation, focus, meditation, sleep, creativity, and atmospheric themes
- Fictional or artistic names without medical connotations
- Creative sessions built around real brainwave frequency ranges

---

## Submission Rules

### 1. Allowed file types

- `.spsq` → Sequence or preset list (UTF‑8)
- `.wav` → Optional background audio (PCM WAV, 8/16/24‑bit, stereo)

### 2. Size limits

- `.spsq` files: **max 32 KB**
- `.wav` backgrounds: **max 10 MB**

### 3. Dependency rules

- All `@presetlist` files must follow the pattern `presets-<namespace>-<name>.spsq`
- All `@background` files must follow the pattern `<namespace>-<name>.wav`
- All files must be stored in `packages/` directory
- External URLs are not allowed
- All referenced files must exist in the `packages/` directory
- Your namespace must be consistent across all your files (sequences, presets, and backgrounds)

### 4. Licensing

- All contributions must be licensed under **CC BY-SA 4.0**
- `.spsq` header must explicitly state the license
- Background `.wav` files must include proper attribution in the `.spsq` header

**Note:** Non-Commercial licenses (CC-BY-NC, CC-BY-NC-SA, etc.) are not allowed for background audio, as they are incompatible with the commercial-permissive nature of the Hub and its CC BY-SA 4.0 licensing.

**You may NOT relicense third‑party audio as CC BY-SA 4.0.**

Examples of valid background audio attribution in `.spsq` files:

```
## Background: "Ocean Waves" by user example (CC BY 3.0)
## Source: https://freesound.org/people/example/sounds/12345/
```

```
## Background: Original field recording by John Doe
## License: CC BY-SA 4.0
## Source: https://archive.org/details/john-doe-ocean-recording
```

```
## Background: "Soft Wind" by Alice (CC0 - Public Domain)
## Source: https://freesound.org/people/alice/sounds/67890/
```

---

## Sequence Header Example

Each `.spsq` file must include a header using `##` comment lines:

```
## Title: Deep Focus
## Author: Jane Doe
## License: CC BY-SA 4.0
##
## Background: "Ocean Waves" by freesound.org/user/example (CC BY 3.0)
## Source: https://freesound.org/people/example/sounds/12345/
```

---

## Steps to Contribute

1. Fork the repository
2. Clone your fork
3. Add your `.spsq` file(s) to the `packages/` directory following the naming convention
4. Add any background `.wav` files to the `packages/` directory
5. Validate locally by running `python3 generate_manifest.py`
6. Commit and push
7. Open a Pull Request

---

## Support, Issues, and Discussions

For questions or suggestions:

- **Issues:**  
  https://github.com/ruanklein/synapseq/issues

- **Discussions:**  
  https://github.com/ruanklein/synapseq/discussions

Thank you for contributing and helping maintain a clean, reliable, and well‑structured library of sequences.
