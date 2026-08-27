(() => {
  const SHORTCUTS = {
    v: "select",
    p: "pen",
    e: "eraser",
  };

  const state = {
    tool: "select",
  };

  const canvas = document.getElementById("board");
  const toolbar = document.querySelector(".toolbar");

  if (!canvas || !toolbar) {
    console.error("Drawora: missing canvas or toolbar.");
    return;
  }

  function isTypingTarget(element) {
    if (!element || !(element instanceof HTMLElement)) {
      return false;
    }

    return (
      element.tagName === "INPUT" ||
      element.tagName === "TEXTAREA" ||
      element.tagName === "SELECT" ||
      element.isContentEditable
    );
  }

  function setTool(tool) {
    if (!Object.values(SHORTCUTS).includes(tool) || tool === state.tool) {
      return;
    }

    state.tool = tool;
    canvas.dataset.cursor = tool;

    for (const button of toolbar.querySelectorAll("[data-tool]")) {
      button.setAttribute("aria-pressed", String(button.dataset.tool === tool));
    }
  }

  function resizeCanvas() {
    const wrap = canvas.parentElement;
    const rect = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }

  function onToolbarClick(event) {
    const button = event.target.closest("[data-tool]");
    if (!button || !toolbar.contains(button)) {
      return;
    }

    setTool(button.dataset.tool);
  }

  function onKeyDown(event) {
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    if (isTypingTarget(event.target)) {
      return;
    }

    const tool = SHORTCUTS[event.key.toLowerCase()];
    if (!tool) {
      return;
    }

    event.preventDefault();
    setTool(tool);
  }

  toolbar.addEventListener("click", onToolbarClick);
  document.addEventListener("keydown", onKeyDown);

  const observer = new ResizeObserver(resizeCanvas);
  observer.observe(canvas.parentElement);
  resizeCanvas();
  canvas.dataset.cursor = state.tool;
})();
