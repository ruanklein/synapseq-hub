/* SPDX-License-Identifier: GPL-3.0-or-later
 * SynapSeq Hub Frontend
 * Copyright (C) 2025 SynapSeq Project Contributors
 * Licensed under GPLv3 or later. See LICENSE_CODE for details.
 */

const table = document.getElementById("seqTable");
const search = document.getElementById("search");
const viewer = document.getElementById("viewer");
const seqCode = document.getElementById("seqCode");
const cliCommand = document.getElementById("cliCommand");
const seqInfo = document.getElementById("seqInfo");

let currentPath = "";
let manifestCache = null;

// Theme handling
const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  document.body.classList.toggle("light", theme === "light");
  themeToggle.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
  localStorage.setItem("theme", theme);
}

themeToggle.addEventListener("click", () => {
  const current = document.body.classList.contains("dark") ? "dark" : "light";
  applyTheme(current === "dark" ? "light" : "dark");
});

// Load saved theme
const savedTheme = localStorage.getItem("theme") || "light";
applyTheme(savedTheme);

// Format last updated time with dayjs
function formatLastUpdated() {
  const lastUpdatedEl = document.getElementById("lastUpdated");
  if (!lastUpdatedEl) return;

  const timestamp = lastUpdatedEl.getAttribute("data-timestamp");
  if (!timestamp) return;

  // Require relativeTime plugin
  dayjs.extend(window.dayjs_plugin_relativeTime);

  const relativeTime = dayjs(timestamp).fromNow();
  const fullDate = dayjs(timestamp).format("MMMM D, YYYY [at] h:mm A");

  lastUpdatedEl.textContent = relativeTime;
  lastUpdatedEl.setAttribute("title", fullDate);
}

// Run on page load
if (typeof dayjs !== "undefined") {
  formatLastUpdated();
}

// Load manifest for dependency resolution
async function loadManifest() {
  if (manifestCache) return manifestCache;
  const res = await fetch("manifest.json");
  manifestCache = await res.json();
  return manifestCache;
}

// Filtering table
search.addEventListener("input", () => {
  const term = search.value.toLowerCase();
  for (const row of table.querySelectorAll("tbody tr")) {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(term) ? "" : "none";
  }
});

// Get full URL considering base path
function getUrl(path) {
  const base = window.location.pathname.includes("/synapseq-hub")
    ? "/synapseq-hub"
    : "";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

// Show sequence and its metadata
async function showSequence(path) {
  const loading = document.getElementById("loading");
  const seqMeta = document.getElementById("seqMeta");
  const seqCodeEl = document.getElementById("seqCode");
  const buttons = document.getElementById("buttons");

  // Show viewer and loading
  viewer.style.display = "block";
  table.style.display = "none";
  search.style.display = "none";

  loading.classList.add("active");
  seqMeta.style.display = "none";
  seqCodeEl.style.display = "none";
  buttons.style.display = "none";

  seqCode.textContent = "";
  cliCommand.textContent = "";
  seqInfo.innerHTML = "";

  try {
    const res = await fetch(getUrl(path));
    if (!res.ok) {
      throw new Error("Failed to load sequence");
    }

    const content = await res.text();
    seqCode.textContent = content;
    currentPath = path;

    const manifest = await loadManifest();
    const entry = manifest.entries.find((e) => "/" + e.path === path);
    if (!entry) {
      throw new Error("Sequence not found in manifest");
    }

    cliCommand.textContent = `synapseq -hub-get ${entry.category}.${entry.name} ${entry.name}.wav`;

    const deps = entry.dependencies || [];
    if (deps.length > 0) {
      let depList = deps.map((d) => `<li>${d.type}: ${d.name}</li>`).join("");
      seqInfo.innerHTML = `<p><strong>Dependencies:</strong></p><ul>${depList}</ul>`;
    } else {
      seqInfo.innerHTML = "<p><strong>No dependencies.</strong></p>";
    }

    // Hide loading and show content
    loading.classList.remove("active");
    seqMeta.style.display = "block";
    seqCodeEl.style.display = "block";
    buttons.style.display = "block";
  } catch (err) {
    console.error("Error loading sequence:", err);
    seqCode.textContent = "Error loading file.";
    loading.classList.remove("active");
    seqCodeEl.style.display = "block";
  }
}

// Back to main list
function backToList() {
  viewer.style.display = "none";
  table.style.display = "";
  search.style.display = "";
}

// Copy CLI command to clipboard
async function copyCommand() {
  const command = cliCommand.textContent;
  const copyBtnDesktop = document.getElementById("copyBtnDesktop");
  const copyBtnMobile = document.getElementById("copyBtnMobile");
  const btnTextDesktop = copyBtnDesktop.querySelector("span");
  const btnTextMobile = copyBtnMobile.querySelector("span");

  try {
    await navigator.clipboard.writeText(command);

    // Feedback visual para ambos os botões
    copyBtnDesktop.classList.add("copied");
    copyBtnMobile.classList.add("copied");
    btnTextDesktop.textContent = "Copied!";
    btnTextMobile.textContent = "Copied!";

    setTimeout(() => {
      copyBtnDesktop.classList.remove("copied");
      copyBtnMobile.classList.remove("copied");
      btnTextDesktop.textContent = "Copy";
      btnTextMobile.textContent = "Copy";
    }, 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
    btnTextDesktop.textContent = "Failed";
    btnTextMobile.textContent = "Failed";
    setTimeout(() => {
      btnTextDesktop.textContent = "Copy";
      btnTextMobile.textContent = "Copy";
    }, 2000);
  }
}

// Download sequence + dependencies as ZIP
async function downloadZip() {
  if (!currentPath) return;

  const zip = new JSZip();
  const manifest = await loadManifest();
  const entry = manifest.entries.find((e) => "/" + e.path === currentPath);
  if (!entry) return;

  // Add main sequence
  const seqResp = await fetch(getUrl(currentPath));
  zip.file(`${entry.name}.spsq`, await seqResp.text());

  // Add dependencies
  for (const dep of entry.dependencies || []) {
    const depUrl =
      "/" + dep.download_url.replace(/^.*?\/(official|community)\//, "$1/");
    const res = await fetch(getUrl(depUrl));
    if (!res.ok) continue;

    const fname = dep.download_url.split("/").pop();

    if (fname.endsWith(".wav")) {
      const buffer = await res.arrayBuffer();
      zip.file(fname, buffer);
    } else {
      const text = await res.text();
      zip.file(fname, text);
    }
  }

  // Generate ZIP file
  const blob = await zip.generateAsync({ type: "blob" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${entry.name}.zip`;
  link.click();
}
