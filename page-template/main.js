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
let allSequences = []; // Store all sequences for filtering

// Theme handling
const themeToggle = document.getElementById("themeToggle");
const moonIcon = document.querySelector(".moon-icon");
const bulbIcon = document.querySelector(".bulb-icon");
const themeText = document.querySelector(".theme-text");

function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  document.body.classList.toggle("light", theme === "light");

  if (theme === "dark") {
    themeText.textContent = "Light Mode";
    moonIcon.style.display = "none";
    bulbIcon.style.display = "block";
  } else {
    themeText.textContent = "Dark Mode";
    moonIcon.style.display = "block";
    bulbIcon.style.display = "none";
  }

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
  formatTableDates();
}

// Initialize filters on page load
window.addEventListener("DOMContentLoaded", () => {
  initializeFilters();
});

// Initialize advanced filters with unique values
function initializeFilters() {
  const rows = table.querySelectorAll("tbody tr");
  const categories = new Set();
  const authors = new Set();

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    if (cells.length >= 4) {
      // New order: Name (0), Category (1), Author with badge (2), Updated (3)
      const name = cells[0].textContent.trim();
      const category = cells[1].textContent.trim();
      const authorBadge = cells[2].querySelector(".origin-badge");
      const author = authorBadge
        ? authorBadge.textContent.trim()
        : cells[2].textContent.trim();

      categories.add(category);
      authors.add(author);

      // Store row data for filtering
      allSequences.push({
        element: row,
        name: name,
        category: category,
        author: author,
      });
    }
  });

  // Populate filter dropdowns
  const filterCategory = document.getElementById("filterCategory");
  const filterAuthor = document.getElementById("filterAuthor");

  [...categories].sort().forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    filterCategory.appendChild(option);
  });

  [...authors].sort().forEach((author) => {
    const option = document.createElement("option");
    option.value = author;
    option.textContent = author;
    filterAuthor.appendChild(option);
  });
}

// Toggle advanced filters
function toggleFilters() {
  const filters = document.getElementById("advancedFilters");
  const btn = document.querySelector(".toggle-filters-btn");

  if (filters.style.display === "none" || !filters.style.display) {
    filters.style.display = "grid";
    btn.classList.add("active");
  } else {
    filters.style.display = "none";
    btn.classList.remove("active");
  }
}

// Apply all filters
function applyFilters() {
  const searchTerm = search.value.toLowerCase();
  const selectedCategory = document.getElementById("filterCategory").value;
  const selectedAuthor = document.getElementById("filterAuthor").value;

  allSequences.forEach((seq) => {
    const matchesSearch =
      !searchTerm ||
      seq.name.toLowerCase().includes(searchTerm) ||
      seq.category.toLowerCase().includes(searchTerm) ||
      seq.author.toLowerCase().includes(searchTerm);

    const matchesCategory =
      !selectedCategory || seq.category === selectedCategory;
    const matchesAuthor = !selectedAuthor || seq.author === selectedAuthor;

    seq.element.style.display =
      matchesSearch && matchesCategory && matchesAuthor ? "" : "none";
  });
}

// Clear all filters
function clearFilters() {
  document.getElementById("filterCategory").value = "";
  document.getElementById("filterAuthor").value = "";
  applyFilters();
}

// Format table dates with dayjs
function formatTableDates() {
  dayjs.extend(window.dayjs_plugin_relativeTime);

  const dateCells = document.querySelectorAll(
    "#seqTable tbody td[data-timestamp]"
  );
  dateCells.forEach((cell) => {
    const timestamp = cell.getAttribute("data-timestamp");
    if (timestamp) {
      const relativeTime = dayjs(timestamp).fromNow();
      const fullDate = dayjs(timestamp).format("MMMM D, YYYY [at] h:mm A");
      cell.textContent = relativeTime;
      cell.setAttribute("title", fullDate);
    }
  });
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
  const clearBtn = document.getElementById("clearSearch");
  clearBtn.style.display = search.value ? "flex" : "none";
  applyFilters();
});

// Clear search
function clearSearch() {
  search.value = "";
  document.getElementById("clearSearch").style.display = "none";
  applyFilters();
}

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
  const sourceCodeSection = document.getElementById("sourceCodeSection");
  const dependenciesSection = document.getElementById("dependenciesSection");
  const buttons = document.getElementById("buttons");
  const toggleBtn = document.getElementById("toggleSourceCode");
  const toggleDepBtn = document.getElementById("toggleDependencies");

  // Show viewer and loading
  viewer.style.display = "block";
  table.style.display = "none";
  search.style.display = "none";

  // Hide advanced filters and toggle button
  const advancedFilters = document.getElementById("advancedFilters");
  const toggleFiltersBtn = document.querySelector(".toggle-filters-btn");
  if (advancedFilters) advancedFilters.style.display = "none";
  if (toggleFiltersBtn) toggleFiltersBtn.style.display = "none";

  loading.classList.add("active");
  seqMeta.style.display = "none";
  seqCodeEl.style.display = "none";
  sourceCodeSection.style.display = "none";
  dependenciesSection.style.display = "none";
  buttons.style.display = "none";

  seqCode.textContent = "";
  cliCommand.textContent = "";
  seqInfo.innerHTML = "";
  seqInfo.style.display = "none";

  // Reset toggle buttons
  toggleBtn.classList.remove("expanded");
  toggleBtn.querySelector("span").textContent = "Show source code";
  toggleDepBtn.classList.remove("expanded");
  toggleDepBtn.querySelector("span").textContent = "Show dependencies";

  try {
    const res = await fetch(getUrl(path));
    if (!res.ok) {
      throw new Error("Failed to load sequence");
    }

    const content = await res.text();
    currentPath = path;

    // Extract description (lines starting with ##)
    const lines = content.split("\n");
    const descriptionLines = [];
    const codeLines = [];

    lines.forEach((line) => {
      if (line.trim().startsWith("##")) {
        // Remove ## and trim
        descriptionLines.push(line.trim().substring(2).trim());
      } else {
        codeLines.push(line);
      }
    });

    // Set description
    const seqDescription = document.getElementById("seqDescription");
    const descriptionContent = document.getElementById("descriptionContent");
    const toggleDescBtn = document.getElementById("toggleDescription");

    if (descriptionLines.length > 0) {
      const descriptionText = descriptionLines.join("\n");
      descriptionContent.textContent = descriptionText;

      // Check if description is long (more than 150px height or ~6 lines)
      // We'll use line count as approximation: if more than 6 lines, show "Read more"
      if (descriptionLines.length > 6) {
        descriptionContent.classList.add("collapsed");
        toggleDescBtn.style.display = "block";
      } else {
        descriptionContent.classList.remove("collapsed");
        toggleDescBtn.style.display = "none";
      }

      seqDescription.style.display = "block";
    } else {
      seqDescription.style.display = "none";
    }

    // Set code without description comments
    seqCode.textContent = codeLines.join("\n");

    const manifest = await loadManifest();
    const entry = manifest.entries.find((e) => "/" + e.path === path);
    if (!entry) {
      throw new Error("Sequence not found in manifest");
    }

    cliCommand.textContent = `synapseq -hub-get ${entry.id} ${entry.name}.wav`;

    const deps = entry.dependencies || [];
    if (deps.length > 0) {
      // Group dependencies by type
      const grouped = {};
      deps.forEach((d) => {
        if (!grouped[d.type]) {
          grouped[d.type] = [];
        }
        grouped[d.type].push(d);
      });

      // Build tree structure
      let tree = '<div class="dep-tree">';
      tree += '<div class="dep-root">Dependencies</div>';

      Object.keys(grouped).forEach((type) => {
        tree += `<div class="dep-branch">`;
        tree += `<div class="dep-type">├─ ${type}</div>`;

        grouped[type].forEach((d, index) => {
          const isLast = index === grouped[type].length - 1;
          const connector = isLast ? "└─" : "├─";
          // Extract path from download_url (e.g., "https://...hub/packages/..." -> "packages/...")
          const depPath = d.download_url.replace(
            /^https?:\/\/[^\/]+\/[^\/]+\//,
            ""
          );
          const depUrl = getUrl("/" + depPath);
          tree += `<div class="dep-item ${isLast ? "last" : ""}">`;
          tree += `<span class="connector">${connector}</span> `;
          tree += `<a href="${depUrl}" target="_blank" rel="noopener noreferrer">${d.name}</a>`;
          tree += `</div>`;
        });
        tree += `</div>`;
      });

      tree += "</div>";
      seqInfo.innerHTML = tree;
    } else {
      seqInfo.innerHTML =
        '<div class="dep-tree"><div class="dep-root">No dependencies</div></div>';
    }

    // Hide loading and show content
    loading.classList.remove("active");
    seqMeta.style.display = "block";
    dependenciesSection.style.display = "block";
    sourceCodeSection.style.display = "block";
    buttons.style.display = "block";
  } catch (err) {
    console.error("Error loading sequence:", err);
    seqCode.textContent = "Error loading file.";
    loading.classList.remove("active");
    seqCodeEl.style.display = "block";
  }
}

// Toggle dependencies visibility
function toggleDependencies() {
  const seqInfoEl = document.getElementById("seqInfo");
  const toggleBtn = document.getElementById("toggleDependencies");
  const btnText = toggleBtn.querySelector("span");

  if (seqInfoEl.style.display === "none") {
    seqInfoEl.style.display = "block";
    toggleBtn.classList.add("expanded");
    btnText.textContent = "Hide dependencies";
  } else {
    seqInfoEl.style.display = "none";
    toggleBtn.classList.remove("expanded");
    btnText.textContent = "Show dependencies";
  }
}

// Toggle source code visibility
function toggleSourceCode() {
  const seqCodeEl = document.getElementById("seqCode");
  const toggleBtn = document.getElementById("toggleSourceCode");
  const btnText = toggleBtn.querySelector("span");

  if (seqCodeEl.style.display === "none") {
    seqCodeEl.style.display = "block";
    toggleBtn.classList.add("expanded");
    btnText.textContent = "Hide source code";
  } else {
    seqCodeEl.style.display = "none";
    toggleBtn.classList.remove("expanded");
    btnText.textContent = "Show source code";
  }
}

// Toggle description visibility
function toggleDescription() {
  const descriptionContent = document.getElementById("descriptionContent");
  const toggleBtn = document.getElementById("toggleDescription");

  if (descriptionContent.classList.contains("collapsed")) {
    descriptionContent.classList.remove("collapsed");
    toggleBtn.textContent = "Read less";
  } else {
    descriptionContent.classList.add("collapsed");
    toggleBtn.textContent = "Read more";
  }
}

// Back to main list
function backToList() {
  viewer.style.display = "none";
  table.style.display = "";
  search.style.display = "";

  // Show advanced filters toggle button
  const toggleFiltersBtn = document.querySelector(".toggle-filters-btn");
  if (toggleFiltersBtn) toggleFiltersBtn.style.display = "";
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
let downloadTimer = null;
let downloadStarted = false;

// Handle download click - modal for desktop/tablet, direct download for mobile
function handleDownloadClick() {
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    // Direct download for mobile
    downloadZip();
  } else {
    // Show modal for desktop/tablet
    openDownloadModal();
  }
}

async function openDownloadModal() {
  if (!currentPath) return;

  const modal = document.getElementById("downloadModal");
  const downloadBtn = document.getElementById("downloadBtn");
  const downloadBtnText = document.getElementById("downloadBtnText");
  const countdownText = document.getElementById("countdownText");

  // Get sequence info
  const manifest = await loadManifest();
  const entry = manifest.entries.find((e) => "/" + e.path === currentPath);
  if (!entry) return;

  const zipName = `${entry.name}.zip`;
  const folderName = entry.name;
  const sequenceName = entry.name;

  // Update instructions
  document.getElementById(
    "unzipWindows"
  ).textContent = `Expand-Archive -Path ${zipName} -DestinationPath .`;
  document.getElementById("unzipUnix").textContent = `unzip ${zipName}`;
  document.getElementById("cdCommand").textContent = `cd ${folderName}`;
  document.getElementById(
    "generateCommand"
  ).textContent = `synapseq ${sequenceName}.spsq ${sequenceName}.wav`;

  // Reset modal state
  downloadStarted = false;
  downloadBtn.disabled = true;
  downloadBtn.classList.add("countdown");
  downloadBtnText.innerHTML = `Download starting in <strong id="countdownText">3</strong>...`;

  // Show modal
  modal.style.display = "flex";

  // Start countdown
  let count = 3;
  downloadTimer = setInterval(() => {
    count--;
    if (count > 0) {
      // Update the innerHTML with current count
      downloadBtnText.innerHTML = `Download starting in <strong id="countdownText">${count}</strong>...`;
    } else {
      clearInterval(downloadTimer);
      downloadTimer = null;

      // Start download
      downloadZip();
      downloadStarted = true;

      // Enable button for manual download
      downloadBtn.disabled = false;
      downloadBtn.classList.remove("countdown");
      downloadBtnText.textContent = "Download Again";
    }
  }, 1000);
}

function closeDownloadModal() {
  const modal = document.getElementById("downloadModal");

  // Cancel countdown if running
  if (downloadTimer) {
    clearInterval(downloadTimer);
    downloadTimer = null;
  }

  modal.style.display = "none";
}

// Copy code from modal
async function copyCode(elementId) {
  const codeElement = document.getElementById(elementId);
  const text = codeElement.textContent;
  const button = event.currentTarget;

  try {
    await navigator.clipboard.writeText(text);

    // Visual feedback
    button.classList.add("copied");

    setTimeout(() => {
      button.classList.remove("copied");
    }, 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
}

async function trackDownload(id) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch(
      "https://us-central1-synapseq-hub.cloudfunctions.net/trackDownload",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-SYNAPSEQ-SOURCE": "WEB",
          "X-SYNAPSEQ-ACTION": "DOWNLOAD",
        },
        body: JSON.stringify({ id }),
        signal: controller.signal,
      }
    );

    if (!res.ok) {
      console.warn(`Tracking failed: HTTP ${res.status}`);
      return;
    }

    const data = await res.json();
    if (!data.success) {
      console.warn("Tracking returned non-success:", data);
    }
  } catch (err) {
    if (err.name === "AbortError") {
      console.warn("Tracking request timed out");
    } else {
      console.error("Tracking request failed:", err);
    }
  } finally {
    clearTimeout(timeout);
  }
}

async function downloadZip() {
  if (!currentPath) return;

  const zip = new JSZip();
  const manifest = await loadManifest();
  const entry = manifest.entries.find((e) => "/" + e.path === currentPath);
  if (!entry) return;

  // Create a folder inside the ZIP
  const folder = zip.folder(entry.name);

  // Add main sequence to the folder
  const seqResp = await fetch(getUrl(currentPath));
  folder.file(`${entry.name}.spsq`, await seqResp.text());

  // Add dependencies to the folder
  for (const dep of entry.dependencies || []) {
    // Extract path from download_url (e.g., "https://...hub/packages/..." -> "packages/...")
    const depPath = dep.download_url.replace(
      /^https?:\/\/[^\/]+\/[^\/]+\//,
      ""
    );
    const depUrl = "/" + depPath;
    const res = await fetch(getUrl(depUrl));
    if (!res.ok) continue;

    const fname = dep.download_url.split("/").pop();

    if (fname.endsWith(".wav")) {
      const buffer = await res.arrayBuffer();
      folder.file(fname, buffer);
    } else {
      const text = await res.text();
      folder.file(fname, text);
    }
  }

  // Generate ZIP file
  const blob = await zip.generateAsync({ type: "blob" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${entry.name}.zip`;
  link.click();

  // Track download
  trackDownload(entry.id)
    .then(() => {
      console.log("Download tracked successfully");
    })
    .catch((err) => {
      console.error("Error tracking download:", err);
    });
}
