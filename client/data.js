// Data layer - fetch() based CRUD with server-side pagination/filter/sort

const API = "http://localhost:3000";

async function request(url, options = {}) {
  const res = await fetch(`${API}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  if (res.status === 204) return null;
  return res;
}

export function createDataService() {
  return {
    posts: {
      async getAll({
        page = 1,
        limit = 6,
        sort = "id",
        order = "asc",
        q = "",
        ...filters
      } = {}) {
        const params = new URLSearchParams();
        params.set("_page", page);
        params.set("_limit", limit);
        params.set("_sort", sort);
        params.set("_order", order);
        if (q) params.set("q", q);
        for (const [key, value] of Object.entries(filters)) {
          if (value) params.set(key, value);
        }

        const res = await request(`/posts?${params}`);
        const total = Number(res.headers.get("X-Total-Count"));
        const data = await res.json();
        return { data, total };
      },
      async getById(id) {
        const res = await request(`/posts/${id}`);
        return res.json();
      },
      async create(data) {
        const res = await request("/posts", {
          method: "POST",
          body: JSON.stringify(data),
        });
        return res.json();
      },
      async update(id, data) {
        const res = await request(`/posts/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
        return res.json();
      },
      async delete(id) {
        await request(`/posts/${id}`, { method: "DELETE" });
      },
    },

    comments: {
      async getAll() {
        const res = await request("/comments");
        return res.json();
      },
      async getByPostId(postId) {
        const res = await request(`/comments?postId=${postId}`);
        return res.json();
      },
      async create(data) {
        const res = await request("/comments", {
          method: "POST",
          body: JSON.stringify(data),
        });
        return res.json();
      },
      async update(id, data) {
        const res = await request(`/comments/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
        return res.json();
      },
      async delete(id) {
        await request(`/comments/${id}`, { method: "DELETE" });
      },
    },
  };
}
