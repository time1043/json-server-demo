// Static data (same as db.json)
const posts = [
  { id: 1, title: "json-server", author: "typicode", views: 100 },
  { id: 2, title: "json-server tips", author: "typicode", views: 200 },
  { id: 3, title: "restful api design", author: "oswin", views: 150 },
  { id: 4, title: "node.js intro", author: "alice", views: 50 },
  { id: 5, title: "express guide", author: "typicode", views: 80 },
  { id: 6, title: "cors explained", author: "oswin", views: 120 },
  { id: 7, title: "http methods", author: "alice", views: 300 },
  { id: 8, title: "status codes", author: "typicode", views: 45 },
  { id: 9, title: "middleware basics", author: "oswin", views: 90 },
  { id: 10, title: "routing patterns", author: "alice", views: 250 },
  { id: 11, title: "error handling", author: "typicode", views: 180 },
  { id: 12, title: "api versioning", author: "oswin", views: 60 },
];

const comments = [
  {
    id: 1,
    body: "great post!",
    postId: 1,
    votes: 5,
    author: { name: "typicode", email: "typicode@example.com" },
  },
  {
    id: 2,
    body: "thanks for sharing",
    postId: 1,
    votes: 3,
    author: { name: "oswin", email: "oswin@example.com" },
  },
  {
    id: 3,
    body: "very helpful",
    postId: 2,
    votes: 8,
    author: { name: "typicode", email: "typicode@example.com" },
  },
  {
    id: 4,
    body: "nice work",
    postId: 3,
    votes: 2,
    author: { name: "alice", email: "alice@example.com" },
  },
  {
    id: 5,
    body: "well explained",
    postId: 2,
    votes: 12,
    author: { name: "oswin", email: "oswin@example.com" },
  },
  {
    id: 6,
    body: "learned a lot",
    postId: 1,
    votes: 6,
    author: { name: "alice", email: "alice@example.com" },
  },
  {
    id: 7,
    body: "keep it up",
    postId: 2,
    votes: 1,
    author: { name: "typicode", email: "typicode@example.com" },
  },
  {
    id: 8,
    body: "bookmarking this",
    postId: 3,
    votes: 9,
    author: { name: "oswin", email: "oswin@example.com" },
  },
  {
    id: 9,
    body: "exactly what I needed",
    postId: 1,
    votes: 4,
    author: { name: "alice", email: "alice@example.com" },
  },
  {
    id: 10,
    body: "thanks a bunch",
    postId: 2,
    votes: 7,
    author: { name: "typicode", email: "typicode@example.com" },
  },
];

// DOM elements
const postsContainer = document.getElementById("posts");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const commentsContainer = document.getElementById("comments");
const closeModal = document.getElementById("close-modal");

// Render posts
function renderPosts() {
  postsContainer.innerHTML = posts
    .map(
      (post) => `
    <div class="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer" data-id="${post.id}">
      <h2 class="text-lg font-semibold text-gray-800">${post.title}</h2>
      <div class="flex items-center gap-4 mt-2 text-sm text-gray-500">
        <span>${post.author}</span>
        <span>${post.views} views</span>
      </div>
    </div>
  `,
    )
    .join("");

  // Add click listeners
  postsContainer.querySelectorAll("[data-id]").forEach((el) => {
    el.addEventListener("click", () => openComments(Number(el.dataset.id)));
  });
}

// Open comments modal
function openComments(postId) {
  const post = posts.find((p) => p.id === postId);
  const postComments = comments.filter((c) => c.postId === postId);

  modalTitle.textContent = `Comments for "${post.title}"`;
  commentsContainer.innerHTML = postComments.length
    ? postComments
        .map(
          (c) => `
      <div class="border-b border-gray-200 pb-3 last:border-0">
        <p class="text-gray-800">${c.body}</p>
        <div class="flex items-center gap-3 mt-1 text-sm text-gray-500">
          <span>${c.author.name}</span>
          <span>${c.votes} votes</span>
        </div>
      </div>
    `,
        )
        .join("")
    : '<p class="text-gray-500">No comments yet.</p>';

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

// Close modal
closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
});

// Init
renderPosts();
