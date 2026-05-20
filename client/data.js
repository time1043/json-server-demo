// Data layer - Promise-based CRUD with static data
// Easy to swap to fetch() later by replacing method bodies

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function createDataService() {
  // Seed data
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

  let nextPostId = 13;
  let nextCommentId = 11;

  return {
    posts: {
      async getAll() {
        await delay(200);
        return [...posts];
      },
      async getById(id) {
        await delay(100);
        const post = posts.find((p) => p.id === id);
        if (!post) throw new Error("Post not found");
        return { ...post };
      },
      async create(data) {
        await delay(300);
        const post = { id: nextPostId++, ...data };
        posts.push(post);
        return { ...post };
      },
      async update(id, data) {
        await delay(300);
        const index = posts.findIndex((p) => p.id === id);
        if (index === -1) throw new Error("Post not found");
        posts[index] = { ...posts[index], ...data, id };
        return { ...posts[index] };
      },
      async delete(id) {
        await delay(200);
        const index = posts.findIndex((p) => p.id === id);
        if (index === -1) throw new Error("Post not found");
        posts.splice(index, 1);
      },
    },

    comments: {
      async getAll() {
        await delay(200);
        return [...comments];
      },
      async getById(id) {
        await delay(100);
        const comment = comments.find((c) => c.id === id);
        if (!comment) throw new Error("Comment not found");
        return { ...comment };
      },
      async getByPostId(postId) {
        await delay(150);
        return comments
          .filter((c) => c.postId === postId)
          .map((c) => ({ ...c }));
      },
      async create(data) {
        await delay(300);
        const comment = { id: nextCommentId++, ...data };
        comments.push(comment);
        return { ...comment };
      },
      async update(id, data) {
        await delay(300);
        const index = comments.findIndex((c) => c.id === id);
        if (index === -1) throw new Error("Comment not found");
        comments[index] = { ...comments[index], ...data, id };
        return { ...comments[index] };
      },
      async delete(id) {
        await delay(200);
        const index = comments.findIndex((c) => c.id === id);
        if (index === -1) throw new Error("Comment not found");
        comments.splice(index, 1);
      },
    },
  };
}
