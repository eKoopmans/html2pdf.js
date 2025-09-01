// https://github.com/zumerlab/snapdom
//
// MIT License
//
// Copyright (c) 2025 ZumerLab
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

/**
 * Deep cloning utilities for DOM elements, including styles and shadow DOM.
 * @module clone
 */


/**
 * Freeze the responsive selection of an <img> that has srcset/sizes.
 * Copies a concrete URL into `src` and removes `srcset`/`sizes` so the clone
 * doesn't need layout to resolve a candidate.
 * Works with <picture> because currentSrc reflects the chosen source.
 * @param {HTMLImageElement} original - Image in the live DOM.
 * @param {HTMLImageElement} cloned - Just-created cloned <img>.
 */
function freezeImgSrcset(original, cloned) {
  try {
    const chosen = original.currentSrc || original.src || '';
    if (!chosen) return;
    cloned.setAttribute('src', chosen);
    cloned.removeAttribute('srcset');
    cloned.removeAttribute('sizes');
    // Hint deterministic decode/load for capture
    cloned.loading = 'eager';
    cloned.decoding = 'sync';
  } catch {
    // no-op
  }
}


/**
 * Creates a deep clone of a DOM node, including styles, shadow DOM, and special handling for excluded/placeholder/canvas nodes.
 *
 * @param {Node} node - Node to clone
 * @returns {Node|null} Cloned node with styles and shadow DOM content, or null for empty text nodes or filtered elements
 */


export function deepCloneBasic(node) {
  if (!node) throw new Error('Invalid node');

  // Local set to avoid duplicates in slot processing
  const clonedAssignedNodes = new Set();
  let pendingSelectValue = null; // Track select value for later fix

  // 1. Text nodes
  if (node.nodeType === Node.TEXT_NODE) {
    return node.cloneNode(true);
  }

  // 2. Non-element nodes (comments, etc.)
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return node.cloneNode(true);
  }

  // 6. Special case: iframe → fallback pattern
  if (node.tagName === "IFRAME") {
    const fallback = document.createElement("div");
    fallback.style.cssText = `width:${node.offsetWidth}px;height:${node.offsetHeight}px;background-image:repeating-linear-gradient(45deg,#ddd,#ddd 5px,#f9f9f9 5px,#f9f9f9 10px);display:flex;align-items:center;justify-content:center;font-size:12px;color:#555;border:1px solid #aaa;`;
    return fallback;
  }

  // 8. Canvas → convert to image
  if (node.tagName === "CANVAS") {
    const dataURL = node.toDataURL();
    const img = document.createElement("img");
    img.src = dataURL;
    img.width = node.width;
    img.height = node.height;
    return img;
  }

  // 9. Base clone (without children)
  let clone;
  try {
    clone = node.cloneNode(false);

    if (node.tagName === 'IMG') {
      freezeImgSrcset(node, clone);
    }
  } catch (err) {
    console.error("[Snapdom] Failed to clone node:", node, err);
    throw err;
  }

  // Special handling: textarea (keep size and value)
  if (node instanceof HTMLTextAreaElement) {
    clone.textContent = node.value;
    clone.value = node.value;
    const rect = node.getBoundingClientRect();
    clone.style.boxSizing = 'border-box';
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    return clone;
  }

  // Special handling: input
  if (node instanceof HTMLInputElement) {
    if (node.hasAttribute("value")) {
      clone.value = node.value;
      clone.setAttribute("value", node.value);
    }
    if (node.checked !== void 0) {
      clone.checked = node.checked;
      if (node.checked) clone.setAttribute("checked", "");
      if (node.indeterminate) clone.indeterminate = node.indeterminate;
    }
    // return clone;
  }

  // Special handling: select → postpone value adjustment
  if (node instanceof HTMLSelectElement) {
    pendingSelectValue = node.value;
  }

  // 12. ShadowRoot logic
  if (node.shadowRoot) {
    const hasSlot = Array.from(node.shadowRoot.querySelectorAll("slot")).length > 0;

    if (hasSlot) {
    } else {
      // ShadowRoot without slots: clone full content
      const shadowFrag = document.createDocumentFragment();
      for (const child of node.shadowRoot.childNodes) {
        if (child.nodeType === Node.ELEMENT_NODE && child.tagName === "STYLE") {
          continue;
        }
        const clonedChild = deepCloneBasic(child);
        if (clonedChild) shadowFrag.appendChild(clonedChild);
      }
      clone.appendChild(shadowFrag);
    }
  }

  // 13. Slot outside ShadowRoot
  if (node.tagName === "SLOT") {
    const assigned = node.assignedNodes?.({ flatten: true }) || [];
    const nodesToClone = assigned.length > 0 ? assigned : Array.from(node.childNodes);
    const fragment = document.createDocumentFragment();

    for (const child of nodesToClone) {
      const clonedChild = deepCloneBasic(child);
      if (clonedChild) fragment.appendChild(clonedChild);
    }
    return fragment;
  }

  // 14. Clone children (light DOM), skipping duplicates
  for (const child of node.childNodes) {
    if (clonedAssignedNodes.has(child)) continue;

    const clonedChild = deepCloneBasic(child);
    if (clonedChild) clone.appendChild(clonedChild);
  }

  // Adjust select value after children are cloned
  if (pendingSelectValue !== null && clone instanceof HTMLSelectElement) {
    clone.value = pendingSelectValue;
    for (const opt of clone.options) {
      if (opt.value === pendingSelectValue) {
        opt.setAttribute("selected", "");
      } else {
        opt.removeAttribute("selected");
      }
    }
  }

  // Fix scrolling (taken from prepareClone).
  const scrollX = node.scrollLeft;
  const scrollY = node.scrollTop;
  const hasScroll = scrollX || scrollY;
  if (hasScroll && clone instanceof HTMLElement) {
    clone.style.overflow = "hidden";
    clone.style.scrollbarWidth = "none";
    clone.style.msOverflowStyle = "none";
    const inner = document.createElement("div");
    inner.style.transform = `translate(${-scrollX}px, ${-scrollY}px)`;
    inner.style.willChange = "transform";
    inner.style.display = "inline-block";
    inner.style.width = "100%";
    while (clone.firstChild) {
      inner.appendChild(clone.firstChild);
    }
    clone.appendChild(inner);
  }

  return clone;
}
