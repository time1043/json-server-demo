// App entry point

import { createDataService } from "./data.js";
import { Modal, Toast, ConfirmDialog } from "./ui.js";
import {
  initPosts,
  renderPosts,
  openPostForm,
  handlePostDelete,
  handleSearch,
  handleSort,
  handlePageChange,
  openCommentsPanel,
} from "./posts.js";
import { initComments } from "./comments.js";

// Initialize services
const dataService = createDataService();

// App state
const appState = {
  posts: [],
  comments: [],
  searchQuery: "",
  sortField: "id",
  sortDirection: "asc",
  currentPage: 1,
  perPage: 6,
};

// Debounce helper
function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// Init
async function init() {
  // Init UI components
  Modal.init();
  Toast.init();
  ConfirmDialog.init();

  // Load data
  try {
    [appState.posts, appState.comments] = await Promise.all([
      dataService.posts.getAll(),
      dataService.comments.getAll(),
    ]);
  } catch (err) {
    Toast.show("Failed to load data", "error");
    return;
  }

  // Init modules
  initPosts(dataService, appState);
  initComments(dataService, appState, renderPosts);

  // Render initial posts
  renderPosts();

  // Wire up event listeners
  wireUpEvents();
}

function wireUpEvents() {
  const searchInput = document.getElementById("search-input");
  const sortField = document.getElementById("sort-field");
  const sortDir = document.getElementById("sort-dir");
  const btnNewPost = document.getElementById("btn-new-post");
  const btnClearSearch = document.getElementById("btn-clear-search");
  const btnCreateFirst = document.getElementById("btn-create-first");
  const postsContainer = document.getElementById("posts");

  // Search
  searchInput.addEventListener(
    "input",
    debounce((e) => {
      appState.currentPage = 1; // Reset to first page on search
      handleSearch(e.target.value);
    }, 300),
  );

  // Sort field
  sortField.addEventListener("change", (e) => {
    handleSort(e.target.value, appState.sortDirection);
  });

  // Sort direction toggle
  sortDir.addEventListener("click", () => {
    const newDir = appState.sortDirection === "asc" ? "desc" : "asc";
    sortDir.textContent = newDir.toUpperCase();
    handleSort(appState.sortField, newDir);
  });

  // New post
  btnNewPost.addEventListener("click", () => openPostForm());

  // Clear search
  btnClearSearch.addEventListener("click", () => {
    searchInput.value = "";
    handleSearch("");
  });

  // Create first post
  btnCreateFirst.addEventListener("click", () => openPostForm());

  // Event delegation for post cards
  postsContainer.addEventListener("click", (e) => {
    const action = e.target.closest("[data-action]");
    if (!action) return;

    const actionType = action.dataset.action;
    const postId = Number(action.dataset.id);

    if (actionType === "edit") {
      const post = appState.posts.find((p) => p.id === postId);
      if (post) openPostForm(post);
    } else if (actionType === "delete") {
      handlePostDelete(postId);
    } else if (actionType === "comments") {
      openCommentsPanel(postId);
    }
  });

  // Pagination event delegation
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-page]");
    if (!btn || btn.disabled) return;
    handlePageChange(Number(btn.dataset.page));
  });
}

// Start app
init();
