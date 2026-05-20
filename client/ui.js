// UI Utilities

// Escape HTML to prevent XSS
export function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Create avatar initials circle
export function createAvatar(name) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  // Generate color from name hash
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-red-500",
    "bg-indigo-500",
  ];
  const color = colors[Math.abs(hash) % colors.length];
  return `<div class="${color} text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shrink-0">${escapeHTML(initials)}</div>`;
}

// Modal manager
export const Modal = {
  _el: null,
  _content: null,

  init() {
    this._el = document.getElementById("modal");
    this._content = document.getElementById("modal-content");
    // Close on backdrop click
    this._el.addEventListener("click", (e) => {
      if (e.target === this._el) this.close();
    });
    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !this._el.classList.contains("hidden")) {
        this.close();
      }
    });
  },

  open(html) {
    this._content.innerHTML = html;
    this._el.classList.remove("hidden");
    this._el.classList.add("flex");
  },

  close() {
    this._el.classList.add("hidden");
    this._el.classList.remove("flex");
    this._content.innerHTML = "";
  },

  isOpen() {
    return !this._el.classList.contains("hidden");
  },
};

// Toast notifications
export const Toast = {
  _container: null,

  init() {
    this._container = document.getElementById("toasts");
  },

  show(message, type = "success") {
    const icons = {
      success: `<svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`,
      error: `<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`,
      info: `<svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    };

    const borderColors = {
      success: "border-l-green-500",
      error: "border-l-red-500",
      info: "border-l-blue-500",
    };

    const el = document.createElement("div");
    el.className = `flex items-center gap-3 bg-white border-l-4 ${borderColors[type]} rounded-lg shadow-lg p-4 toast-enter min-w-[280px]`;
    el.innerHTML = `${icons[type]}<span class="text-gray-700 text-sm">${escapeHTML(message)}</span>`;

    this._container.appendChild(el);

    // Auto remove after 3s
    setTimeout(() => {
      el.classList.add("toast-exit");
      el.addEventListener("animationend", () => el.remove());
    }, 3000);
  },
};

// Confirm dialog
export const ConfirmDialog = {
  _el: null,
  _msgEl: null,
  _resolve: null,

  init() {
    this._el = document.getElementById("confirm-dialog");
    this._msgEl = document.getElementById("confirm-message");

    document.getElementById("confirm-cancel").addEventListener("click", () => {
      this._el.classList.add("hidden");
      this._el.classList.remove("flex");
      if (this._resolve) this._resolve(false);
    });

    document.getElementById("confirm-ok").addEventListener("click", () => {
      this._el.classList.add("hidden");
      this._el.classList.remove("flex");
      if (this._resolve) this._resolve(true);
    });
  },

  show(message) {
    this._msgEl.textContent = message;
    this._el.classList.remove("hidden");
    this._el.classList.add("flex");
    return new Promise((resolve) => {
      this._resolve = resolve;
    });
  },
};

// Form validation
export function validateForm(data, rules) {
  const errors = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];

    if (
      fieldRules.required &&
      (!value || (typeof value === "string" && !value.trim()))
    ) {
      errors[field] = `${fieldRules.label || field} is required`;
      continue;
    }

    if (value && fieldRules.minLength && value.length < fieldRules.minLength) {
      errors[field] =
        `${fieldRules.label || field} must be at least ${fieldRules.minLength} characters`;
      continue;
    }

    if (
      fieldRules.min !== undefined &&
      (value === "" || Number(value) < fieldRules.min)
    ) {
      errors[field] =
        `${fieldRules.label || field} must be at least ${fieldRules.min}`;
      continue;
    }

    if (fieldRules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors[field] = `Please enter a valid email`;
      continue;
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

// Show field error
export function showFieldError(fieldEl, message) {
  clearFieldError(fieldEl);
  fieldEl.classList.add("border-red-500");
  const errorEl = document.createElement("p");
  errorEl.className = "text-red-500 text-xs mt-1 field-error";
  errorEl.textContent = message;
  fieldEl.parentNode.appendChild(errorEl);
}

// Clear field error
export function clearFieldError(fieldEl) {
  fieldEl.classList.remove("border-red-500");
  const errorEl = fieldEl.parentNode.querySelector(".field-error");
  if (errorEl) errorEl.remove();
}
