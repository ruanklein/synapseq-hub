# SynapSeq Hub

**The official repository of sequences, presets, and soundscapes for
[SynapSeq](https://github.com/ruanklein/synapseq).**

SynapSeq Hub is a central archive for official and community-created
`.spsq` sequences, curated collections designed to guide brainwave
states for relaxation, focus, meditation, and creative exploration.
All sequences hosted here are written using the [SynapSeq text
syntax](https://github.com/ruanklein/synapseq/blob/main/docs/USAGE.md),
ensuring compatibility and long-term reproducibility.

------------------------------------------------------------------------

## Repository Structure

-   **`official/`** -> Sequences originally authored by the SynapSeq
    maintainer or part of the official sample set.
-   **`community/`** -> User-contributed sequences submitted via pull
    requests (PRs).

------------------------------------------------------------------------

## Purpose

The goal of SynapSeq Hub is to serve as an open, living collection of
creative work built with SynapSeq.
It enables users to share, discover, and learn from each other's
compositions, preserving the spirit of freedom and simplicity.

------------------------------------------------------------------------

## Contributing

You can contribute your own `.spsq` sequences, preset lists, or
background files by opening a **Pull Request** from your fork of this
repository.

### Submission Rules

To keep the repository organized and maintain consistent structure,
**all community contributions must follow this directory pattern**:

    community/<first-letter>/<github-username>/<project-name>/<files...>

This ensures each contributor has their own namespace, and prevents file
collisions or naming conflicts.

> Pull Requests that do **not** follow this structure will be
> rejected.

------------------------------------------------------------------------

### Steps to Contribute

1.  **Fork this repository**

    Click the "Fork" button on GitHub and clone your fork locally:

    ``` bash
    git clone https://github.com/<your-username>/synapseq-hub
    cd synapseq-hub
    ```

2.  **Create your directory**

    Follow the naming convention described above, e.g.:

    ``` bash
    mkdir -p community/u/username/focus-session
    ```

3.  **Add your files**

    Place your `.spsq` sequence and any related files (backgrounds,
    preset lists) inside your folder.

4.  **Include metadata at the top of your main sequence file:**

        ## Title: My Sequence Name
        ## Author: Your Name or Alias
        ## License: CC BY-SA 4.0

5.  **Validate your sequence**

    Make sure it runs successfully with the latest version of SynapSeq:

    ``` bash
    synapseq -test community/u/username/focus-session/my-sequence.spsq
    ```

6.  **Commit and push your changes**

    ``` bash
    git add .
    git commit -m "Add focus-session by username"
    git push origin main
    ```

7.  **Open a Pull Request**

    On GitHub, open a PR to merge your fork's `main` branch into the
    upstream `main` branch of `synapseq-hub`.

    In the PR description, include:

    -   A short description of what your sequence does (e.g., target
        frequency band, purpose, or mood)
    -   Any notes about background files or preset lists used

------------------------------------------------------------------------

All submissions will be reviewed for syntax, structure, and adherence to
the repository's conventions.
Only properly structured contributions under the `community/` directory
will be accepted.

By submitting a PR, you agree to release your contribution under the
**CC BY-SA 4.0** license.

------------------------------------------------------------------------

## License

All sequences and preset files (`.spsq`) in this repository are licensed
under the
**Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA
4.0)** license.
See the full license text in the [`LICENSE`](LICENSE) file.

By submitting a Pull Request to this repository, you agree that your
contribution will be released under the same CC BY-SA 4.0 license.
This ensures that every shared work remains free to use, modify, and
redistribute, as long as proper credit is given and derivative works
are shared under identical terms.

For more details:\
https://creativecommons.org/licenses/by-sa/4.0/

------------------------------------------------------------------------

## Compatibility

All sequences here are compatible with **SynapSeq v3.x** and later.
They can be rendered locally or streamed via any future service that
integrates the SynapSeq core.

------------------------------------------------------------------------

## Learn More

-   [SynapSeq Project](https://github.com/ruanklein/synapseq)
-   [Usage
    Guide](https://github.com/ruanklein/synapseq/blob/main/docs/USAGE.md)
-   [FAQ](https://github.com/ruanklein/synapseq/blob/main/docs/FAQ.md)
-   [Contributing
    Guidelines](https://github.com/ruanklein/synapseq/blob/main/CONTRIBUTING.md)
