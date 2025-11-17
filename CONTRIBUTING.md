# Contributing to SynapSeq Hub

Thank you for your interest in contributing to the **SynapSeq Hub**, the official repository of sequences, presets, and soundscapes for [SynapSeq](https://github.com/ruanklein/synapseq).

This document describes how to contribute new `.spsq` sequences, preset lists, or background audio files while ensuring quality, compatibility, and integrity.

## Repository Structure

All contributions must follow this directory pattern:

```
packages/<category>/<first-letter>/<github-username>/<files...>
```

Where:

- **`<category>`** -> Sequence category (`focus`, `relax`, `meditation`, `sleep`, `creative`, etc.)
- **`<first-letter`** -> First letter of your GitHub username (lowercase)
- **`<github-username>`** -> Your GitHub username (lowercase)
- **`<files...>`** -> Your `.spsq` files and optional `.wav` backgrounds

Pull Requests that do **not** follow this structure will be rejected.

## Quality and Integrity

SynapSeq Hub maintains a high standard of clarity and honesty about what brainwave entrainment can and cannot do.

Brainwave audio cannot reproduce the effects of drugs, medications, or chemical substances. Claims such as "LSD simulation", "ecstasy effect", "instant healing" or similar are unrealistic and misrepresent what binaural, monaural, or isochronic stimulation is capable of.

### Not allowed:

- Sequences claiming to mimic drugs or psychoactive substances
- Promises of medical, pharmacological, or therapeutic outcomes
- Titles or descriptions suggesting impossible or exaggerated effects

### Allowed:

- Relaxation, focus, meditation, sleep, creativity, and atmospheric themes
- Fictional or artistic names that don’t imply medical or chemical properties
- Creative sessions built on real brainwave frequency ranges

This guideline exists to keep the Hub clear, trustworthy, and free from misleading or exaggerated content.

## Submission Rules

### 1. Allowed file types

- `.spsq` -> Main sequence or preset list (UTF-8)
- `.wav` -> Optional background audio (PCM WAV, 8/16/24-bit, 2 channels)

### 2. Size limits

- `.spsq` files: maximum 32 KB
- `.wav` backgrounds: maximum 10 MB

### 3. Dependency rules

- All `@presetlist` files must begin with `presets-`.
- All `@background` references must point to local `.wav` files.
- External URLs are not allowed.
- All dependencies must exist inside your contribution directory.

### 4. Licensing

- All contributions must be licensed under CC BY-SA 4.0.
- The license must be explicitly stated in the `.spsq` header.
- .wav background files may use their own original license, depending on the source:
  - Your own recordings can be licensed as you choose.
  - Third-party recordings must comply with their original license terms and cannot conflict with CC BY-SA 4.0.
  - FreeSound / CC libraries must be properly attributed in the sequence header.
- **You may NOT relicense third-party audio as CC BY-SA 4.0.**
  WAV files must preserve their original license, attribution, and usage terms.
- When using third-party background audio, the header must include:
  - title of the sound
  - author/creator
  - original source (e.g. freesound.org link)
  - the exact license (e.g. CC BY 3.0, CC0, CC BY-NC, etc.)

Examples:

```
## Background: "Ocean Waves" by freesound.org/user/example (CC BY 3.0)
```

```
## Background: Original field recording by John Doe (All rights reserved)
```

```
## Background: "Soft Wind" by Alice - Licensed under CC0 (Public Domain)
```

### 5. Originality and Allowed Sources

- All submitted sequences must be original works created by you, or derived from sources that are explicitly licensed for reuse.
- **Sequences originating from proprietary, commercial, or restricted sources are not permitted**, even if they have been manually converted or rewritten into .spsq format.
- This includes any material whose original license does not grant permission for redistribution, modification, or derivative works.
- Conversions of content that was originally sold, locked behind paywalls, or distributed under closed licenses will be rejected.
- When adapting from openly licensed material (e.g., Creative Commons works), proper attribution is required and must follow the terms of the original license.

## Sequence Header Example

Every `.spsq` file must include a header using double-hash comments (`##`).

Example:

```
## Title: Deep Focus
## Author: Jane Doe
## License: CC BY-SA 4.0
##
## A moderate-intensity focus session using alpha-range
## binaural beats blended with pink-noise background.
```

If your sequence uses a third-party background WAV, include attribution. See [Licensing](#4-licensing) for details.

## Steps to Contribute

1. Fork the repository
2. Clone your fork
3. Create your directory
4. Add your files
5. Validate locally
6. Commit and push
7. Open a Pull Request

### Support, Issues, and Discussions

If you have questions about contribution rules, need clarification about licensing, or want to suggest improvements to the Hub, feel free to open an issue or start a discussion in the main SynapSeq repository:

- **Issues:**
  https://github.com/ruanklein/synapseq/issues

- **Discussions:**
  https://github.com/ruanklein/synapseq/discussions

Your feedback helps improve both the SynapSeq Hub and the broader SynapSeq ecosystem. Thank you for contributing and helping maintain a clean, reliable, and well-structured library of sequences.
