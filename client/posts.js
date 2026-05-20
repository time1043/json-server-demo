// Posts module - server-side pagination, filter, sort, search

import {
  escapeHTML,
  createAvatar,
  Modal,
  Toast,
  validateForm,
  showFieldError,
  clearFieldError,
} from "./ui.js";
import { openCommentsPanel } from "./comments.js";

let dataService;
let appState;

export function initPosts(ds, state) {
  dataService = ds;
  appState = state;
}

// Render pagination controls
function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / appState.perPage);
  const paginationEl = document.getElementById("pagination");

  if (totalPages <= 1) {
    paginationEl.innerHTML = "";
    return;
  }

  const { currentPage } = appState;

  let buttons = "";

  // First button
  buttons += `
    <button data-page="1" class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed" ${currentPage === 1 ? "disabled" : ""}>
      First
    </button>
  `;

  // Prev button
  buttons += `
    <button data-page="${currentPage - 1}" class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed" ${currentPage === 1 ? "disabled" : ""}>
      Prev
    </button>
  `;

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      buttons += `<button data-page="${i}" class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">${i}</button>`;
    } else if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      buttons += `<button data-page="${i}" class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">${i}</button>`;
    } else if (Math.abs(i - currentPage) === 2) {
      buttons += `<span class="px-2 text-gray-400">...</span>`;
    }
  }

  // Next button
  buttons += `
    <button data-page="${currentPage + 1}" class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed" ${currentPage === totalPages ? "disabled" : ""}>
      Next
    </button>
  `;

  // Last button
  buttons += `
    <button data-page="${totalPages}" class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed" ${currentPage === totalPages ? "disabled" : ""}>
      Last
    </button>
  `;

  paginationEl.innerHTML = buttons;
}

// Render a single post card
function renderPostCard(post) {
  const commentCount = appState.comments.filter(
    (c) => c.postId === post.id,
  ).length;
  return `
    <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden" data-post-id="${post.id}">
      <div class="p-5">
        <div class="flex items-start gap-3 mb-3">
          ${createAvatar(post.author)}
          <div class="flex-1 min-w-0">
            <h2 class="text-lg font-semibold text-gray-800 truncate">${escapeHTML(post.title)}</h2>
            <p class="text-sm text-gray-500">${escapeHTML(post.author)}</p>
          </div>
          <span class="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full shrink-0">
            ${post.views} views
          </span>
        </div>
        <div class="flex items-center justify-between pt-3 border-t border-gray-100">
          <button data-action="comments" data-id="${post.id}" class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            ${commentCount} comments
          </button>
          <div class="flex items-center gap-1">
            <button data-action="edit" data-id="${post.id}" class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button data-action="delete" data-id="${post.id}" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Render all posts (async - fetches from API)
export async function renderPosts() {
  const container = document.getElementById("posts");
  const emptyState = document.getElementById("empty-state");
  const clearSearchBtn = document.getElementById("btn-clear-search");
  const createFirstBtn = document.getElementById("btn-create-first");
  const postCount = document.getElementById("post-count");

  try {
    const { data: posts, total } = await dataService.posts.getAll({
      page: appState.currentPage,
      limit: appState.perPage,
      sort: appState.sortField,
      order: appState.sortDirection,
      q: appState.searchQuery || undefined,
    });

    const totalPages = Math.ceil(total / appState.perPage);

    // Reset to page 1 if current page exceeds total pages
    if (appState.currentPage > totalPages && totalPages > 0) {
      appState.currentPage = totalPages;
      return renderPosts();
    }

    // Update count
    const start =
      total === 0 ? 0 : (appState.currentPage - 1) * appState.perPage + 1;
    const end = Math.min(appState.currentPage * appState.perPage, total);

    postCount.textContent = appState.searchQuery
      ? `Showing ${start}-${end} of ${total} posts`
      : `Showing ${start}-${end} of ${total} posts`;

    if (total === 0) {
      container.innerHTML = "";
      document.getElementById("pagination").innerHTML = "";
      emptyState.classList.remove("hidden");
      if (appState.searchQuery) {
        clearSearchBtn.classList.remove("hidden");
        createFirstBtn.classList.add("hidden");
      } else {
        clearSearchBtn.classList.add("hidden");
        createFirstBtn.classList.remove("hidden");
      }
      return;
    }

    emptyState.classList.add("hidden");
    container.innerHTML = posts.map(renderPostCard).join("");
    renderPagination(total);
  } catch (err) {
    Toast.show("Failed to load posts", "error");
  }
}

// Open post form (create or edit)
export function openPostForm(post = null) {
  const isEdit = !!post;
  const title = isEdit ? "Edit Post" : "New Post";

  const html = `
    <div class="p-6">
      <h2 class="text-xl font-bold text-gray-800 mb-6">${title}</h2>
      <form id="post-form" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            name="title"
            value="${isEdit ? escapeHTML(post.title) : ""}"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="Enter post title"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Author</label>
          <input
            type="text"
            name="author"
            value="${isEdit ? escapeHTML(post.author) : ""}"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="Enter author name"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Views</label>
          <input
            type="number"
            name="views"
            value="${isEdit ? post.views : 0}"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <button type="button" data-action="cancel" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all">
            ${isEdit ? "Save Changes" : "Create Post"}
          </button>
        </div>
      </form>
    </div>
  `;

  Modal.open(html);

  const form = document.getElementById("post-form");
  const cancelBtn = form.querySelector('[data-action="cancel"]');

  cancelBtn.addEventListener("click", () => Modal.close());

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = {
      title: formData.get("title").trim(),
      author: formData.get("author").trim(),
      views: Number(formData.get("views")),
    };

    // Validate
    const { valid, errors } = validateForm(data, {
      title: { required: true, minLength: 3, label: "Title" },
      author: { required: true, minLength: 2, label: "Author" },
      views: { required: true, min: 0, label: "Views" },
    });

    // Clear previous errors
    form.querySelectorAll("input").forEach(clearFieldError);

    if (!valid) {
      for (const [field, message] of Object.entries(errors)) {
        showFieldError(form.querySelector(`[name="${field}"]`), message);
      }
      return;
    }

    try {
      if (isEdit) {
        await dataService.posts.update(post.id, data);
        Toast.show("Post updated successfully", "success");
      } else {
        await dataService.posts.create(data);
        Toast.show("Post created successfully", "success");
      }
      Modal.close();
      renderPosts();
    } catch (err) {
      Toast.show(err.message, "error");
    }
  });
}

// Handle post delete
export async function handlePostDelete(postId) {
  // Need to fetch the post to get its title for the confirm message
  try {
    const post = await dataService.posts.getById(postId);
    const { ConfirmDialog } = await import("./ui.js");
    const confirmed = await ConfirmDialog.show(
      `Delete post "${post.title}"? This cannot be undone.`,
    );
    if (!confirmed) return;

    await dataService.posts.delete(postId);
    // Also remove related comments from local cache
    appState.comments = appState.comments.filter((c) => c.postId !== postId);
    renderPosts();
    Toast.show("Post deleted", "success");
  } catch (err) {
    Toast.show(err.message, "error");
  }
}

// Handle search
export function handleSearch(query) {
  appState.searchQuery = query;
  appState.currentPage = 1;
  renderPosts();
}

// Handle sort
export function handleSort(field, direction) {
  appState.sortField = field;
  appState.sortDirection = direction;
  appState.currentPage = 1;
  renderPosts();
}

// Handle page change
export function handlePageChange(page) {
  appState.currentPage = page;
  renderPosts();
  document
    .getElementById("posts")
    .scrollIntoView({ behavior: "smooth", block: "start" });
}

// Export for event delegation
export { openCommentsPanel };
