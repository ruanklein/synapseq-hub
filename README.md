# SynapSeq Hub

**The official repository of sequences, presets, and soundscapes for
[SynapSeq](https://github.com/ruanklein/synapseq).**

SynapSeq Hub is the curated archive for official and community-created
`.spsq` sequences, structured compositions designed to guide
brainwave states for relaxation, focus, meditation, and creative
exploration.

All sequences hosted here are written using the [SynapSeq text syntax](https://github.com/ruanklein/synapseq/blob/main/docs/USAGE.md),
ensuring full compatibility and reproducibility.

---

## Repository Structure

All sequences are organized in the `packages/` directory following this structure:

```
packages/<category>/<first-letter>/<username>/<files...>
```

- **`<category>`** -> Type of sequence (e.g., `samples`, `focus`, `relax`, `meditation`)
- **`<first-letter>`** -> First letter of the username (lowercase)
- **`<username>`** -> GitHub username or author identifier
- **`<files...>`** -> `.spsq` sequence files and optional `.wav` backgrounds

Each directory follows strict structural and validation rules enforced by the repository's indexing script.

---

## Purpose

The goal of SynapSeq Hub is to provide an open, validated, and
self-consistent collection of creative works built with SynapSeq.

It allows users to share, discover, and learn from each other's
compositions, ensuring both technical integrity and artistic freedom.

---

## Contributing

You can contribute your own `.spsq` sequences, preset lists, or
background sound files by opening a **Pull Request** from your fork of this repository.

### Directory Convention

All contributions **must** follow this directory pattern:

```
packages/<category>/<first-letter>/<github-username>/<files...>
```

Where:

- **`<category>`** is the type of your sequence (e.g., `focus`, `relax`, `meditation`, `sleep`, `creative`)
- **`<first-letter>`** is the first letter of your GitHub username (lowercase)
- **`<github-username>`** is your GitHub username (lowercase)
- **`<files...>`** are your `.spsq` files and optional `.wav` backgrounds

**Example:** If your username is `johndoe` and you're creating a focus sequence:

```
packages/focus/j/johndoe/deep-focus.spsq
```

This structure ensures each contributor has their own isolated namespace within a defined category, avoiding file collisions or naming conflicts.

> Pull Requests that do **not** follow this structure will be rejected.

---

### Submission Rules

1. **Allowed file types**

   - `.spsq` -> Main sequence or preset list (plain text, UTF-8).
   - `.wav` -> Optional background sound (PCM WAV 24-bit, 2 channels).

2. **Size limits**

   - `.spsq` files (including preset lists): **maximum 32 KB**
   - `.wav` background files: **maximum 10 MB**

   Files exceeding these limits will cause validation failure.

3. **Dependency rules**

   - Every referenced `@presetlist` must use a file that begins with `presets-`.
   - Every referenced `@background` must point to a `.wav` file.
   - No `@presetlist` or `@background` line may reference external URLs.
   - All dependencies must exist inside this repository.

4. **Licensing**

   - All contributions must be released under **CC BY-SA 4.0**.
   - The license must be explicitly mentioned in the sequence header.

5. **Originality and proprietary content**
   - All submitted sequences must be **original works** or properly licensed derivatives.
   - **Sequences copied or derived from proprietary sources will be rejected**, even if technically compatible with open formats.
   - You must have the legal right to license your submission under CC BY-SA 4.0.
   - If adapting or remixing existing CC-licensed work, proper attribution is required.

---

### About sequence headers

Every `.spsq` file **must** include a header section using double hash comments (`##`) at the top.  
This section describes your sequence and will be displayed on the Hub when users view details.

Example:

```spsq
## Title: Focus Session
## Author: Jane Doe
## License: CC BY-SA 4.0
##
## This sequence is designed to improve focus and mental clarity.
## It uses a light binaural beat in the alpha range (10 Hz)
## and a soft pink-noise background for relaxation.
```

Keep it concise: 3 - 10 lines describing what your sequence does is ideal.

If your sequence uses **background sounds (.wav)** that are not your own recordings,  
you **must** include a comment indicating the **copyright or license** of the source, for example:

```spsq
## Background: "Calm Ocean" by freesound.org/user/username (CC BY 3.0)
```

This ensures full transparency and compliance with the SynapSeq Hub’s open licensing policy.

---

### Steps to Contribute

1. **Fork the repository**

   Go to [https://github.com/ruanklein/synapseq-hub](https://github.com/ruanklein/synapseq-hub) and click the **Fork** button to create your own copy.

2. **Clone your fork**

   ```bash
   git clone https://github.com/<your-username>/synapseq-hub
   cd synapseq-hub
   ```

3. **Create your directory**

   Replace `<category>`, `<first-letter>`, and `<your-username>` with your values:

   ```bash
   mkdir -p packages/<category>/<first-letter>/<your-username>
   ```

   **Example for user `johndoe` contributing a focus sequence:**

   ```bash
   mkdir -p packages/focus/j/johndoe
   ```

4. **Add your files**

   Place your `.spsq` sequence(s) in your directory. Include any referenced `presets-*` or `.wav` background files.

   **Important:** Only commit files inside **your own username directory**. Do not modify or add files to other users' directories.

5. **Validate locally**

   Test your sequence with the latest version of SynapSeq:

   ```bash
   synapseq -test packages/<category>/<first-letter>/<username>/<sequence>.spsq
   ```

6. **Commit and push**

   ```bash
   git add packages/<category>/<first-letter>/<your-username>/
   git commit -m "Add <sequence-name> by <your-username>"
   git push origin main
   ```

7. **Open a Pull Request**

   Go to your fork on GitHub and click **"Contribute"** -> **"Open pull request"** to submit your changes to the main repository.

   Describe:

   - The purpose and characteristics of your sequence (e.g. focus, meditation, sleep)
   - The frequency range or waveform style
   - Any preset or background files used

   **Note:** Your PR should only contain changes inside `packages/<category>/<first-letter>/<your-username>/`. PRs modifying other users' files will be rejected.

---

## Validation Process

Each commit to `main` automatically triggers a validation pipeline that:

1. Verifies directory and filename structure
2. Checks file size limits (32 KB / 10 MB)
3. Ensures no external URLs in `@presetlist` or `@background`
4. Confirms all references resolve locally
5. Generates the versioned `manifest.json` file

If any rule is violated, the build fails and the PR is rejected.

---

## Licensing

This repository contains two types of works licensed under different terms:

| Component                                           | License                                                         | Description                                                                                     |
| --------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `.spsq` sequences and `.wav` sound files            | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Creative Commons license for all audio and sequence content under `official/` and `community/`. |
| Python, HTML, CSS, JS (scripts and generator tools) | [GNU GPLv3](https://www.gnu.org/licenses/gpl-3.0.html)          | Open source software license covering the generation scripts and web frontend.                  |

In short:

- Creative content -> CC BY-SA 4.0
- Source code -> GPL v3.0

---

## Compatibility

All sequences are compatible with **SynapSeq v3.x** and later.
They can be rendered locally or streamed via SynapSeq HTTP streaming endpoint.

---

## Learn More

- [SynapSeq Project](https://github.com/ruanklein/synapseq)
- [Usage Guide](https://github.com/ruanklein/synapseq/blob/main/docs/USAGE.md)
- [FAQ](https://github.com/ruanklein/synapseq/blob/main/docs/FAQ.md)
- [Contributing Guidelines](https://github.com/ruanklein/synapseq/blob/main/CONTRIBUTING.md)
