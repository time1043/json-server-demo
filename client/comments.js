// Comments module - rendering and forms

import {
  escapeHTML,
  createAvatar,
  Modal,
  Toast,
  ConfirmDialog,
  validateForm,
  showFieldError,
  clearFieldError,
} from "./ui.js";

let dataService;
let appState;
let renderPosts;

export function initComments(ds, state, rp) {
  dataService = ds;
  appState = state;
  renderPosts = rp;
}

// Render a single comment card
function renderCommentCard(comment) {
  return `
    <div class="flex gap-3 py-3 border-b border-gray-100 last:border-0" data-comment-id="${comment.id}">
      ${createAvatar(comment.author.name)}
      <div class="flex-1 min-w-0">
        <p class="text-gray-800 text-sm">${escapeHTML(comment.body)}</p>
        <div class="flex items-center gap-3 mt-1">
          <span class="text-xs text-gray-500">${escapeHTML(comment.author.name)}</span>
          <span class="text-xs text-gray-400">${comment.votes} votes</span>
        </div>
      </div>
      <div class="flex items-center gap-1 shrink-0">
        <button data-action="edit-comment" data-id="${comment.id}" class="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition" title="Edit">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
        </button>
        <button data-action="delete-comment" data-id="${comment.id}" class="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition" title="Delete">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>
    </div>
  `;
}

// Open comments panel in modal
export async function openCommentsPanel(postId) {
  const post = appState.posts.find((p) => p.id === postId);
  if (!post) return;

  try {
    const comments = await dataService.comments.getByPostId(postId);

    const commentsHtml = comments.length
      ? comments.map(renderCommentCard).join("")
      : `<div class="text-center py-8 text-gray-400">
          <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
          <p>No comments yet</p>
          <p class="text-sm mt-1">Be the first to comment!</p>
        </div>`;

    const html = `
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-800">Comments</h2>
          <button data-action="add-comment" data-post-id="${postId}" class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 active:scale-95 transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Add Comment
          </button>
        </div>
        <p class="text-sm text-gray-500 mb-4">Post: <span class="font-medium text-gray-700">${escapeHTML(post.title)}</span></p>
        <div id="comments-list" data-post-id="${postId}">
          ${commentsHtml}
        </div>
      </div>
    `;

    Modal.open(html);

    // Event delegation for comment actions
    const modalContent = document.getElementById("modal-content");
    modalContent.addEventListener("click", async (e) => {
      const action = e.target.closest("[data-action]");
      if (!action) return;

      const actionType = action.dataset.action;

      if (actionType === "add-comment") {
        openCommentForm(postId);
      } else if (actionType === "edit-comment") {
        const commentId = Number(action.dataset.id);
        const comment = comments.find((c) => c.id === commentId);
        if (comment) openCommentForm(postId, comment);
      } else if (actionType === "delete-comment") {
        const commentId = Number(action.dataset.id);
        await handleCommentDelete(commentId, postId);
      }
    });
  } catch (err) {
    Toast.show(err.message, "error");
  }
}

// Open comment form (create or edit)
function openCommentForm(postId, comment = null) {
  const isEdit = !!comment;
  const title = isEdit ? "Edit Comment" : "New Comment";

  const html = `
    <div class="p-6">
      <h2 class="text-xl font-bold text-gray-800 mb-6">${title}</h2>
      <form id="comment-form" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Comment</label>
          <textarea
            name="body"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
            placeholder="Write your comment..."
          >${isEdit ? escapeHTML(comment.body) : ""}</textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value="${isEdit ? escapeHTML(comment.author.name) : ""}"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Your name"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value="${isEdit ? escapeHTML(comment.author.email) : ""}"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="your@email.com"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Votes</label>
          <input
            type="number"
            name="votes"
            value="${isEdit ? comment.votes : 0}"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <button type="button" data-action="back" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
            Back
          </button>
          <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all">
            ${isEdit ? "Save Changes" : "Add Comment"}
          </button>
        </div>
      </form>
    </div>
  `;

  Modal.open(html);

  const form = document.getElementById("comment-form");
  const backBtn = form.querySelector('[data-action="back"]');

  backBtn.addEventListener("click", () => openCommentsPanel(postId));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = {
      body: formData.get("body").trim(),
      author: {
        name: formData.get("name").trim(),
        email: formData.get("email").trim(),
      },
      votes: Number(formData.get("votes")),
      postId,
    };

    // Validate
    const { valid, errors } = validateForm(
      {
        body: data.body,
        name: data.author.name,
        email: data.author.email,
        votes: data.votes,
      },
      {
        body: { required: true, minLength: 1, label: "Comment" },
        name: { required: true, minLength: 2, label: "Name" },
        email: { required: true, email: true, label: "Email" },
        votes: { required: true, min: 0, label: "Votes" },
      },
    );

    // Clear previous errors
    form.querySelectorAll("input, textarea").forEach(clearFieldError);

    if (!valid) {
      for (const [field, message] of Object.entries(errors)) {
        showFieldError(form.querySelector(`[name="${field}"]`), message);
      }
      return;
    }

    try {
      if (isEdit) {
        await dataService.comments.update(comment.id, data);
        const index = appState.comments.findIndex((c) => c.id === comment.id);
        appState.comments[index] = { ...appState.comments[index], ...data };
        Toast.show("Comment updated", "success");
      } else {
        const created = await dataService.comments.create(data);
        appState.comments.push(created);
        Toast.show("Comment added", "success");
      }
      // Go back to comments panel
      openCommentsPanel(postId);
      // Re-render posts to update comment count
      if (renderPosts) renderPosts();
    } catch (err) {
      Toast.show(err.message, "error");
    }
  });
}

// Handle comment delete
async function handleCommentDelete(commentId, postId) {
  const comment = appState.comments.find((c) => c.id === commentId);
  if (!comment) return;

  const confirmed = await ConfirmDialog.show(
    "Delete this comment? This cannot be undone.",
  );
  if (!confirmed) return;

  try {
    await dataService.comments.delete(commentId);
    appState.comments = appState.comments.filter((c) => c.id !== commentId);
    Toast.show("Comment deleted", "success");
    // Refresh comments panel
    openCommentsPanel(postId);
    // Re-render posts to update comment count
    if (renderPosts) renderPosts();
  } catch (err) {
    Toast.show(err.message, "error");
  }
}
