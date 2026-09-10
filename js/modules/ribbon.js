// js/modules/ribbon.js
// Drawora ribbon toolbar controller and overflow manager
(function (D) {
  "use strict";

  function setRibbonTab(name) {
    if (!D.RIBBON_TABS.includes(name)) {
      return;
    }

    D.state.ribbonTab = name;
    closeRibbonMenus();

    for (const tab of D.ribbonTabs.querySelectorAll("[data-ribbon-tab]")) {
      const selected = tab.dataset.ribbonTab === name;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    }

    for (const panel of D.toolbar.querySelectorAll(".ribbon-panel")) {
      panel.hidden = panel.dataset.ribbon !== name;
    }

    const panels = D.toolbar.querySelector(".ribbon-panels");
    if (panels) {
      panels.scrollLeft = 0;
    }
    layoutRibbonOverflow();
    requestAnimationFrame(layoutRibbonOverflow);
  }

  function isRibbonToolItem(element) {
    return (
      element instanceof HTMLElement &&
      !element.classList.contains("ribbon-more") &&
      !element.classList.contains("ribbon-menu")
    );
  }

  function prepareRibbonOverflow() {
    for (const group of D.toolbar.querySelectorAll(".ribbon-group")) {
      const tools = group.querySelector(":scope > .ribbon-group-tools");
      if (!tools || group.querySelector(":scope > .ribbon-group-main")) {
        continue;
      }

      [...tools.children].forEach((item, index) => {
        if (isRibbonToolItem(item)) {
          item.dataset.ribbonIndex = String(index);
        }
      });

      const main = document.createElement("div");
      main.className = "ribbon-group-main";
      const more = document.createElement("button");
      more.type = "button";
      more.className = "ribbon-more";
      more.hidden = true;
      more.setAttribute("aria-expanded", "false");
      const label = group.querySelector(".ribbon-group-label");
      more.title = label ? `More ${label.textContent.trim()} options` : "More options";
      more.setAttribute("aria-label", more.title);
      more.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9.5 12 14.5 17 9.5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      const menu = document.createElement("div");
      menu.className = "ribbon-menu";
      menu.hidden = true;
      menu.setAttribute("role", "menu");
      tools.replaceWith(main);
      main.append(tools, more);
      group.insertBefore(menu, label || null);
    }
  }

  function restoreRibbonItems(group) {
    const tools = group.querySelector(".ribbon-group-tools");
    const menu = group.querySelector(".ribbon-menu");
    if (!tools || !menu) {
      return;
    }
    while (menu.firstChild) {
      tools.appendChild(menu.firstChild);
    }
    [...tools.children]
      .filter(isRibbonToolItem)
      .sort((a, b) => Number(a.dataset.ribbonIndex) - Number(b.dataset.ribbonIndex))
      .forEach((item) => tools.appendChild(item));
  }

  function closeRibbonMenus() {
    for (const menu of D.toolbar.querySelectorAll(".ribbon-menu")) {
      menu.hidden = true;
    }
    for (const more of D.toolbar.querySelectorAll(".ribbon-more")) {
      more.setAttribute("aria-expanded", "false");
    }
  }

  function positionRibbonMenu(more, menu) {
    const rect = more.getBoundingClientRect();
    menu.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - 220))}px`;
    menu.style.top = `${rect.bottom + 4}px`;
  }

  function hideRibbonMore(group) {
    const more = group.querySelector(".ribbon-more");
    const menu = group.querySelector(".ribbon-menu");
    group.classList.remove("is-collapsed");
    if (more) {
      more.hidden = true;
      more.setAttribute("aria-expanded", "false");
    }
    if (menu) {
      menu.hidden = true;
    }
  }

  function sortRibbonMenu(menu) {
    [...menu.children]
      .filter(isRibbonToolItem)
      .sort((a, b) => Number(a.dataset.ribbonIndex) - Number(b.dataset.ribbonIndex))
      .forEach((item) => menu.appendChild(item));
  }

  function syncRibbonCollapsed(group) {
    const tools = group.querySelector(".ribbon-group-tools");
    const more = group.querySelector(".ribbon-more");
    const visible = Boolean(
      tools && [...tools.children].some((item) => isRibbonToolItem(item) && !item.hidden)
    );
    group.classList.toggle("is-collapsed", Boolean(more && !more.hidden && !visible));
  }

  function stripOverflows(strip, groups) {
    const right = strip.getBoundingClientRect().right;
    return groups.some((group) => group.getBoundingClientRect().right > right + 1);
  }

  function parkGroupUntilStripFits(group, strip) {
    const tools = group.querySelector(".ribbon-group-tools");
    const more = group.querySelector(".ribbon-more");
    const menu = group.querySelector(".ribbon-menu");
    if (!tools || !more || !menu) {
      return;
    }

    let guard = 40;
    while (guard > 0 && group.getBoundingClientRect().right > strip.getBoundingClientRect().right + 1) {
      guard -= 1;
      const items = [...tools.children].filter((item) => isRibbonToolItem(item) && !item.hidden);
      if (items.length === 0) {
        break;
      }
      more.hidden = false;
      menu.appendChild(items[items.length - 1]);
      syncRibbonCollapsed(group);
    }
    sortRibbonMenu(menu);
    if (!menu.childElementCount) {
      more.hidden = true;
    }
    syncRibbonCollapsed(group);
  }

  function layoutRibbonStrip(strip) {
    if (!strip) {
      return;
    }

    const groups = [...strip.querySelectorAll(":scope > .ribbon-group")];
    for (const group of groups) {
      restoreRibbonItems(group);
      hideRibbonMore(group);
    }

    if (strip.hidden) {
      return;
    }

    for (let index = groups.length - 1; index >= 0 && stripOverflows(strip, groups); index -= 1) {
      parkGroupUntilStripFits(groups[index], strip);
    }
  }

  function layoutRibbonOverflow() {
    closeRibbonMenus();
    for (const panel of D.toolbar.querySelectorAll(".ribbon-panel")) {
      const groups = [...panel.querySelectorAll(":scope > .ribbon-group")];
      for (const group of groups) {
        restoreRibbonItems(group);
        hideRibbonMore(group);
      }
    }
    layoutRibbonStrip(D.toolbar.querySelector(".ribbon-persistent"));
  }

  function toggleRibbonMenu(more) {
    const group = more.closest(".ribbon-group");
    const menu = group && group.querySelector(".ribbon-menu");
    if (!menu) {
      return;
    }

    const open = menu.hidden;
    closeRibbonMenus();
    if (!open) {
      return;
    }

    menu.hidden = false;
    more.setAttribute("aria-expanded", "true");
    positionRibbonMenu(more, menu);
  }

  function onRibbonTabKey(event) {
    const tabs = [...D.ribbonTabs.querySelectorAll("[data-ribbon-tab]")];
    const current = tabs.findIndex((tab) => tab.dataset.ribbonTab === D.state.ribbonTab);
    if (current < 0) {
      return;
    }

    let next = current;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = (current + 1) % tabs.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (current - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    setRibbonTab(tabs[next].dataset.ribbonTab);
    tabs[next].focus();
  }

  const exports = {
    setRibbonTab,
    isRibbonToolItem,
    prepareRibbonOverflow,
    restoreRibbonItems,
    closeRibbonMenus,
    positionRibbonMenu,
    hideRibbonMore,
    sortRibbonMenu,
    syncRibbonCollapsed,
    stripOverflows,
    parkGroupUntilStripFits,
    layoutRibbonStrip,
    layoutRibbonOverflow,
    toggleRibbonMenu,
    onRibbonTabKey,
  };

  Object.assign(D, exports);
  Object.assign(window, exports);
})(window.Drawora = window.Drawora || {});
