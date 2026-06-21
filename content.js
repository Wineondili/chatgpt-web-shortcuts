(() => {
  "use strict";

  const MODEL_SHORTCUTS = new Map([
    ["1", "Instant"],
    ["2", "Medium"],
    ["3", "High"],
    ["4", "Extra High"],
    ["5", "Pro Extended"]
  ]);

  const TOOL_SHORTCUTS = new Map([
    ["1", "Create image"],
    ["2", "Deep research"],
    ["3", "Web search"],
    ["4", "Agent mode"],
    ["5", "Create task"]
  ]);

  const NESTED_TOOLS = new Set([
    "Agent mode",
    "Create task"
  ]);

  const MODEL_LABELS = [
    "Instant",
    "Medium",
    "High",
    "Extra High",
    "Pro Extended",
    "GPT-5.5"
  ];

  const TOAST_ID = "cgpt-web-shortcuts-toast";

  document.addEventListener("keydown", onKeyDown, true);

  function onKeyDown(event) {
    const key = normalizeDigit(event);

    if (event.altKey && event.metaKey && !event.ctrlKey && !event.shiftKey && TOOL_SHORTCUTS.has(key)) {
      consumeShortcut(event);
      selectTool(TOOL_SHORTCUTS.get(key));
      return;
    }

    if (event.altKey && !event.metaKey && !event.ctrlKey && !event.shiftKey && MODEL_SHORTCUTS.has(key)) {
      consumeShortcut(event);
      selectModel(MODEL_SHORTCUTS.get(key));
    }
  }

  function consumeShortcut(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }

  function normalizeDigit(event) {
    if (/^[1-5]$/.test(event.key)) {
      return event.key;
    }

    const digitMatch = /^(?:Digit|Numpad)([1-5])$/.exec(event.code || "");
    return digitMatch ? digitMatch[1] : "";
  }

  async function selectModel(label) {
    try {
      const alreadyOpenItem = findVisibleMenuItem(label);

      if (alreadyOpenItem) {
        clickElement(alreadyOpenItem);
        showToast(`Model: ${label}`);
        return;
      }

      const trigger = findComposerModelTrigger();

      if (!trigger) {
        showToast("Model selector not found");
        return;
      }

      clickElement(trigger);

      const item = await waitFor(() => findVisibleMenuItem(label), 1200);

      if (!item) {
        showToast(`${label} not found`);
        return;
      }

      clickElement(item);
      showToast(`Model: ${label}`);
    } catch (error) {
      showToast("Model switch failed");
      console.debug("[ChatGPT Web Shortcuts]", error);
    }
  }

  async function selectTool(label) {
    try {
      const alreadyOpenItem = findVisibleMenuItem(label);

      if (alreadyOpenItem) {
        clickElement(alreadyOpenItem);
        showToast(`Tool: ${label}`);
        return;
      }

      const trigger = findComposerToolsTrigger();

      if (!trigger) {
        showToast("Tools menu not found");
        return;
      }

      clickElement(trigger);

      if (!NESTED_TOOLS.has(label)) {
        const item = await waitFor(() => findVisibleMenuItem(label), 1200);

        if (!item) {
          showToast(`${label} not found`);
          return;
        }

        clickElement(item);
        showToast(`Tool: ${label}`);
        return;
      }

      const moreItem = await waitFor(() => findVisibleMenuCommand("More"), 1200);

      if (!moreItem) {
        showToast("More menu not found");
        return;
      }

      clickElement(moreItem);

      const nestedItem = await waitFor(() => findVisibleMenuItem(label), 1200);

      if (!nestedItem) {
        showToast(`${label} not found`);
        return;
      }

      clickElement(nestedItem);
      showToast(`Tool: ${label}`);
    } catch (error) {
      showToast("Tool switch failed");
      console.debug("[ChatGPT Web Shortcuts]", error);
    }
  }

  function findComposerModelTrigger() {
    const root = findComposerRoot();
    const candidates = visibleElements(root.querySelectorAll("button[aria-haspopup='menu'], [role='button'][aria-haspopup='menu']"));

    const modelTextCandidates = candidates.filter((element) => {
      const text = getText(element);
      return MODEL_LABELS.some((label) => text === label);
    });

    if (modelTextCandidates.length > 0) {
      return sortByComposerDistance(modelTextCandidates)[0];
    }

    const fallbackCandidates = candidates.filter((element) => {
      const text = getText(element);
      return text && !/profile|account|share|more/i.test(text);
    });

    return sortByComposerDistance(fallbackCandidates)[0] || null;
  }

  function findComposerToolsTrigger() {
    const root = findComposerRoot();
    const candidates = visibleElements(root.querySelectorAll("button, [role='button']"));
    const exactCandidates = candidates.filter((element) => /^(Add files and more|Attach files)$/i.test(getElementLabel(element)));

    if (exactCandidates.length > 0) {
      return sortByComposerDistance(exactCandidates)[0];
    }

    const fuzzyCandidates = candidates.filter((element) => /add files|attach|upload/i.test(getElementLabel(element)));
    return sortByComposerDistance(fuzzyCandidates)[0] || null;
  }

  function findComposerRoot() {
    const textbox = findComposerTextbox();

    if (!textbox) {
      return document;
    }

    let current = textbox;

    while (current && current !== document.body) {
      const buttons = visibleElements(current.querySelectorAll("button[aria-haspopup='menu'], [role='button'][aria-haspopup='menu']"));
      const hasModelButton = buttons.some((button) => MODEL_LABELS.includes(getText(button)));

      if (hasModelButton) {
        return current;
      }

      current = current.parentElement;
    }

    return textbox.closest("form") || document;
  }

  function findComposerTextbox() {
    const textboxes = visibleElements(document.querySelectorAll("textarea, [contenteditable='true'], [role='textbox']"));

    return textboxes.find((element) => {
      const label = element.getAttribute("aria-label") || "";
      const placeholder = element.getAttribute("placeholder") || "";
      const text = `${label} ${placeholder}`;
      return /Chat with ChatGPT|Message ChatGPT|Ask anything/i.test(text);
    }) || textboxes.sort((a, b) => b.getBoundingClientRect().y - a.getBoundingClientRect().y)[0] || null;
  }

  function findVisibleMenuItem(label) {
    const items = visibleElements(document.querySelectorAll("[role='menuitemradio']"));
    return items.find((element) => getText(element) === label) || null;
  }

  function findVisibleMenuCommand(label) {
    const items = visibleElements(document.querySelectorAll("[role='menu'] [role='menuitem']"));
    return items.find((element) => getText(element) === label || getElementLabel(element) === label) || null;
  }

  function visibleElements(elements) {
    return Array.from(elements).filter(isVisible);
  }

  function isVisible(element) {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);

    return rect.width > 0 &&
      rect.height > 0 &&
      style.visibility !== "hidden" &&
      style.display !== "none";
  }

  function getText(element) {
    return (element.innerText || element.textContent || "").replace(/\s+/g, " ").trim();
  }

  function getElementLabel(element) {
    return [
      element.getAttribute("aria-label"),
      element.getAttribute("title"),
      getText(element)
    ].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  }

  function sortByComposerDistance(elements) {
    const textbox = findComposerTextbox();

    if (!textbox) {
      return elements;
    }

    const textboxRect = textbox.getBoundingClientRect();
    const targetX = textboxRect.right;
    const targetY = textboxRect.bottom;

    return [...elements].sort((a, b) => {
      const rectA = a.getBoundingClientRect();
      const rectB = b.getBoundingClientRect();
      const distanceA = Math.abs(rectA.right - targetX) + Math.abs(rectA.bottom - targetY);
      const distanceB = Math.abs(rectB.right - targetX) + Math.abs(rectB.bottom - targetY);
      return distanceA - distanceB;
    });
  }

  function clickElement(element) {
    const rect = element.getBoundingClientRect();
    const options = {
      bubbles: true,
      cancelable: true,
      composed: true,
      button: 0,
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2
    };

    element.dispatchEvent(new PointerEvent("pointerdown", { ...options, buttons: 1, pointerId: 1, pointerType: "mouse", isPrimary: true }));
    element.dispatchEvent(new MouseEvent("mousedown", { ...options, buttons: 1 }));
    element.dispatchEvent(new PointerEvent("pointerup", { ...options, buttons: 0, pointerId: 1, pointerType: "mouse", isPrimary: true }));
    element.dispatchEvent(new MouseEvent("mouseup", { ...options, buttons: 0 }));
    element.dispatchEvent(new MouseEvent("click", { ...options, buttons: 0 }));
  }

  function waitFor(callback, timeoutMs) {
    const start = Date.now();

    return new Promise((resolve) => {
      const tick = () => {
        const result = callback();

        if (result || Date.now() - start >= timeoutMs) {
          resolve(result || null);
          return;
        }

        requestAnimationFrame(tick);
      };

      tick();
    });
  }

  function showToast(message) {
    let toast = document.getElementById(TOAST_ID);

    if (!toast) {
      toast = document.createElement("div");
      toast.id = TOAST_ID;
      toast.setAttribute("role", "status");
      toast.style.cssText = [
        "position:fixed",
        "right:18px",
        "bottom:18px",
        "z-index:2147483647",
        "padding:8px 10px",
        "border-radius:8px",
        "background:rgba(32,33,35,.92)",
        "color:white",
        "font:13px/1.35 -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif",
        "box-shadow:0 6px 24px rgba(0,0,0,.22)",
        "pointer-events:none",
        "opacity:0",
        "transform:translateY(4px)",
        "transition:opacity .12s ease, transform .12s ease"
      ].join(";");
      document.documentElement.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";

    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(4px)";
    }, 1200);
  }
})();
