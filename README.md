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

- **`official/`** -> Sequences officially authored and maintained by the SynapSeq project.
- **`community/`** -> User-contributed sequences submitted via pull requests (PRs).

Each directory follows strict structural and validation rules enforced by the repository’s indexing script.

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

All community contributions **must** follow this directory pattern:

```
community/<category>/<github-username>/<files...>
```

This ensures each contributor has their own isolated namespace within a defined category, avoiding file collisions or naming conflicts.

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

---

### Header Metadata

Every main sequence file should begin with the following metadata block:

```
## Title: My Sequence Name
## Author: Your Name or Alias
## License: CC BY-SA 4.0
```

This information appears in the manifest and helps other users identify
your work.

---

### Steps to Contribute

1. **Fork the repository**

   ```bash
   git clone https://github.com/<your-username>/synapseq-hub
   cd synapseq-hub
   ```

2. **Create your directory**

   ```bash
   mkdir -p community/<category>/<your-github-username>
   ```

3. **Add your files**

   Include your `.spsq` sequence and any referenced `presets-*` or `.wav` background files.

4. **Validate locally**

   Test your sequence with the latest version of SynapSeq:

   ```bash
   synapseq -test community/<category>/<username>/<sequence>.spsq
   ```

5. **Commit and push**

   ```bash
   git add .
   git commit -m "Add new sequence <name> by <username>"
   git push origin main
   ```

6. **Open a Pull Request**

   Describe:

   - The purpose and characteristics of your sequence (e.g. focus, meditation, sleep)
   - The frequency range or waveform style
   - Any preset or background files used

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

## License

All `.spsq` files and accompanying assets are licensed under
**Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)**.  
Full text: [LICENSE](LICENSE)

By submitting a Pull Request, you agree to release your contribution
under this same license, ensuring every work remains free to use,
modify, and redistribute with proper attribution.

More info:  
<https://creativecommons.org/licenses/by-sa/4.0/>

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
