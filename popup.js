document.addEventListener("DOMContentLoaded", () => {
  const darkModeEnabled = localStorage.getItem("darkMode") === "true";

  if (darkModeEnabled) {
    document.body.classList.add("dark");
  }


  const promptName = document.getElementById("promptName");
  const promptTags = document.getElementById("promptTags");
  const promptInput = document.getElementById("promptInput");
  const saveButton = document.getElementById("savePrompt");
  const promptList = document.getElementById("promptList");
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const loadMoreButton = document.getElementById("loadMoreButton");
  const statusBar = document.getElementById("statusBar");

  const modal = document.getElementById("modal");
  const openModal = document.getElementById("openModal");
  const closeModal = document.getElementById("closeModal");

  let allPrompts = [];
  let filteredPrompts = [];
  let currentIndex = 0;
  const PAGE_SIZE = 3;

  let isEditing = false;
  let editingOriginalName = null;

  function showStatus(msg, duration = 2000) {
    if (!statusBar) return;
    statusBar.textContent = msg;
    statusBar.style.opacity = "1";
    setTimeout(() => {
      statusBar.style.opacity = "0";
    }, duration);
  }

  function setButtonsDisabled(disabled) {
    saveButton.disabled = disabled;
    searchButton.disabled = disabled;
    loadMoreButton.disabled = disabled;
  }

  function isValidPrompt(obj) {
    return obj &&
      typeof obj === "object" &&
      typeof obj.name === "string" &&
      obj.name.trim().length > 0 &&
      typeof obj.text === "string" &&
      obj.text.trim().length > 0;
  }

  function normalizeTags(tagString) {
    return tagString
      .split(",")
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);
  }

  function renderNextPage() {
  setButtonsDisabled(true);

  const end = currentIndex + PAGE_SIZE;
  const nextBatch = filteredPrompts.slice(currentIndex, end);

  nextBatch.forEach((prompt, idx) => {
    const li = document.createElement("li");

    const name = document.createElement("strong");
    name.textContent = prompt.name;
    li.appendChild(name);

    if (prompt.tags && prompt.tags.length > 0) {
      const tagEl = document.createElement("p");
      tagEl.textContent = "🏷️ " + prompt.tags.join(", ");
      tagEl.style.fontStyle = "italic";
      li.appendChild(tagEl);
    }

    // Prompt text with expand/collapse
    const textDiv = document.createElement("div");
    textDiv.className = "prompt-text";
    textDiv.textContent = prompt.text;
    textDiv.style.display = "block";
    textDiv.style.whiteSpace = "pre-line";
    textDiv.style.overflow = "hidden";
    textDiv.style.display = "-webkit-box";
    textDiv.style.webkitBoxOrient = "vertical";
    textDiv.style.webkitLineClamp = "3";
    textDiv.style.maxHeight = "4.5em";
    textDiv.style.transition = "max-height 0.2s";

    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = "Mehr anzeigen";
    toggleBtn.style.marginTop = "4px";
    toggleBtn.addEventListener("click", () => {
      const expanded = textDiv.classList.toggle("expanded");
      if (expanded) {
        textDiv.style.webkitLineClamp = "unset";
        textDiv.style.maxHeight = "none";
        toggleBtn.textContent = "Weniger anzeigen";
      } else {
        textDiv.style.webkitLineClamp = "3";
        textDiv.style.maxHeight = "4.5em";
        toggleBtn.textContent = "Mehr anzeigen";
      }
    });

    li.appendChild(textDiv);
    li.appendChild(toggleBtn);

    const buttonBar = document.createElement("div");
    buttonBar.style.display = "flex";
    buttonBar.style.justifyContent = "flex-end";
    buttonBar.style.gap = "8px";

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.title = "Bearbeiten";
    editBtn.addEventListener("click", () => {
      promptName.value = prompt.name;
      promptTags.value = (prompt.tags || []).join(", ");
      promptInput.value = prompt.text;
      isEditing = true;
      editingOriginalName = prompt.name;
      saveButton.textContent = "Aktualisieren";
      openModal.click();
    });
    buttonBar.appendChild(editBtn);

    const copyBtn = document.createElement("button");
    copyBtn.textContent = "📋";
    copyBtn.title = "Kopieren";
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(prompt.text);
        showStatus("Kopiert!");
      } catch (err) {
        alert("Fehler beim Kopieren: " + err);
      }
    });
    buttonBar.appendChild(copyBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.title = "Löschen";
    deleteBtn.addEventListener("click", () => {
      allPrompts = allPrompts.filter(p => p.name !== prompt.name);
      chrome.storage.local.set({ prompts: allPrompts }, () => {
        applyFilter(searchInput.value);
        showStatus("Prompt gelöscht");
      });
    });
    buttonBar.appendChild(deleteBtn);

    li.appendChild(buttonBar);
    promptList.appendChild(li);
  });

  currentIndex = end;
  loadMoreButton.style.display = currentIndex < filteredPrompts.length ? "block" : "none";
  setButtonsDisabled(false);
}

  function applyFilter(searchTerm = "") {
    promptList.innerHTML = "";
    currentIndex = 0;

    const lower = searchTerm.toLowerCase().trim();
    filteredPrompts = allPrompts.filter(p => {
      const inName = p.name.toLowerCase().includes(lower);
      const inTags = Array.isArray(p.tags) && p.tags.some(tag => tag.includes(lower.replace("#", "")));
      return isValidPrompt(p) && (inName || inTags);
    });

    renderNextPage();
  }

  saveButton.addEventListener("click", () => {
    const name = promptName.value.trim();
    const text = promptInput.value.trim();
    const tags = normalizeTags(promptTags.value);

    if (!name || !text) {
      alert("Bitte gültigen Namen und Text eingeben.");
      return;
    }

    setButtonsDisabled(true);

    chrome.storage.local.get(["prompts"], (result) => {
      let prompts = (result.prompts || []).filter(isValidPrompt);

      const exists = prompts.some(p => p.name === name);
      if (exists && (!isEditing || (isEditing && name !== editingOriginalName))) {
        alert("Name existiert bereits.");
        setButtonsDisabled(false);
        return;
      }

      if (isEditing) {
        if (name !== editingOriginalName) {
          prompts = prompts.filter(p => p.name !== editingOriginalName);
        }
        isEditing = false;
        editingOriginalName = null;
        saveButton.textContent = "Speichern";
      }

      prompts.push({ name, text, tags });
      chrome.storage.local.set({ prompts }, () => {
        promptName.value = "";
        promptInput.value = "";
        promptTags.value = "";
        modal.style.display = "none";
        loadData();
        showStatus("Prompt gespeichert");
        setButtonsDisabled(false);
      });
    });
  });

  searchButton.addEventListener("click", () => {
    applyFilter(searchInput.value);
  });

  loadMoreButton.addEventListener("click", () => {
    renderNextPage();
  });

  function loadData() {
    setButtonsDisabled(true);
    chrome.storage.local.get(["prompts"], (result) => {
      const raw = result.prompts || [];
      allPrompts = raw.filter(isValidPrompt);
      if (raw.length !== allPrompts.length) {
        chrome.storage.local.set({ prompts: allPrompts });
      }
      applyFilter(searchInput.value);
      setButtonsDisabled(false);
    });
  }

  // Modal Steuerung
  openModal.addEventListener("click", () => {
    modal.style.display = "block";
  });

  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
    promptName.value = "";
    promptInput.value = "";
    promptTags.value = "";
    isEditing = false;
    saveButton.textContent = "Speichern";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // Export
  document.getElementById("exportBtn").addEventListener("click", () => {
    chrome.storage.local.get(["prompts"], (result) => {
      const dataStr = JSON.stringify(result.prompts || [], null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "prompts_export.json";
      a.click();
      URL.revokeObjectURL(url);
      showStatus("Export erfolgreich");
    });
  });

  // Import
  document.getElementById("importBtn").addEventListener("click", () => {
    document.getElementById("importFile").click();
  });

  document.getElementById("importFile").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported)) throw new Error("Ungültiges Format");

        chrome.storage.local.get(["prompts"], (result) => {
          const existing = (result.prompts || []).filter(isValidPrompt);
          const combined = [
            ...existing,
            ...imported.filter(ip =>
              isValidPrompt(ip) &&
              !existing.some(ep => ep.name === ip.name)
            )
          ];
          chrome.storage.local.set({ prompts: combined }, () => {
            alert("Import erfolgreich!");
            loadData();
          });
        });
      } catch (err) {
        alert("Fehler beim Import: " + err.message);
      }
    };
    reader.readAsText(file);
  });

  loadData();
});
