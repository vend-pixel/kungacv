import { HttpError } from "react-admin";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://kungacv-backend.onrender.com";

const RESOURCE_CONFIG = {
  templates: {
    path: "admin/templates",
    collection: "templates",
    singular: "template",
  },
  pricing: {
    path: "admin/pricing",
    collection: "subscriptions",
    singular: "subscription",
  },
  payments: {
    path: "admin/payments",
    collection: "payments",
    singular: "payment",
  },
  users: { path: "admin/get-users", collection: "users", singular: "user" },
};

const LIST_FILTERS = {
  templates: [
    "search",
    "access",
    "active",
    "published",
    "packageUid",
    "includeDeleted",
  ],
  pricing: ["search", "active", "includeDeleted"],
  payments: ["status", "plan", "userUid", "txRef", "from", "to"],
  users: ["name", "email", "active", "role"],
};

const configFor = (resource) =>
  RESOURCE_CONFIG[resource] || {
    path: `admin/${resource}`,
    collection: resource,
    singular: resource.endsWith("s") ? resource.slice(0, -1) : resource,
  };

const endpointFor = (resource, operation, id) => {
  if (resource === "users") {
    if (operation === "create") return "admin/create-user";
    if (operation === "update")
      return `admin/update-user/${encodeURIComponent(id)}`;
    if (operation === "delete")
      return `admin/delete-user/${encodeURIComponent(id)}`;
  }
  const config = configFor(resource);
  return id === undefined
    ? config.path
    : `${config.path}/${encodeURIComponent(id)}`;
};

const authHeaders = (extra = {}) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("admin_access_token")
      : null;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
};

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}/${path.replace(/^\//, "")}`, {
    ...options,
    headers: authHeaders({
      "Content-Type": "application/json",
      ...(options.headers || {}),
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = Array.isArray(body.message)
      ? body.message.join(", ")
      : body.message || `Request failed (${response.status})`;
    throw new HttpError(message, response.status, body);
  }
  return body;
}

function withId(record, fallback) {
  return {
    ...record,
    id: record.id || record.uid || record.tx_ref || fallback,
  };
}

function queryFor(resource, params) {
  const query = new URLSearchParams();
  query.set("page", String(params.pagination?.page || 1));
  query.set("perPage", String(params.pagination?.perPage || 25));
  const sortField = params.sort?.field;
  if (sortField) query.set("sort", sortField);
  if (params.sort?.order) query.set("order", params.sort.order.toLowerCase());
  const allowed = LIST_FILTERS[resource] || [];
  Object.entries(params.filter || {}).forEach(([key, value]) => {
    if (
      allowed.includes(key) &&
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      query.set(key, String(value));
    }
  });
  return query.toString();
}

const dataProvider = {
  async getList(resource, params) {
    const config = configFor(resource);
    const body = await request(`${config.path}?${queryFor(resource, params)}`);
    const rows = body[config.collection] || [];
    return {
      data: rows.map((row, index) => withId(row, `${resource}-${index}`)),
      total: body.count ?? rows.length,
    };
  },

  async getOne(resource, params) {
    const config = configFor(resource);
    const body = await request(endpointFor(resource, "getOne", params.id));
    return {
      data: withId(
        body[config.singular] ||
          body.user ||
          body.payment ||
          body.subscription ||
          body.template ||
          body.users?.[0],
        params.id,
      ),
    };
  },

  async create(resource, params) {
    if (resource === "payments")
      throw new HttpError("Payments are read-only", 405);
    const config = configFor(resource);
    const body = await request(endpointFor(resource, "create"), {
      method: "POST",
      body: JSON.stringify(params.data),
    });
    const record = body[config.singular] || body.template || body.subscription;
    return { data: withId(record, params.data.id) };
  },

  async update(resource, params) {
    if (resource === "payments")
      throw new HttpError("Payments are read-only", 405);
    const config = configFor(resource);
    const body = await request(endpointFor(resource, "update", params.id), {
      method: "PATCH",
      body: JSON.stringify(params.data),
    });
    return {
      data: withId(
        body[config.singular] || body.template || body.subscription,
        params.id,
      ),
    };
  },

  async delete(resource, params) {
    if (resource === "payments")
      throw new HttpError("Payments are read-only", 405);
    const config = configFor(resource);
    const body = await request(endpointFor(resource, "delete", params.id), {
      method: "DELETE",
    });
    return {
      data: withId(
        body[config.singular] || body.template || body.subscription,
        params.id,
      ),
    };
  },

  async getMany(resource, params) {
    const records = await Promise.all(
      params.ids.map((id) => dataProvider.getOne(resource, { id })),
    );
    return { data: records.map((result) => result.data) };
  },

  async getManyReference(resource, params) {
    return dataProvider.getList(resource, {
      ...params,
      filter: { ...(params.filter || {}), [params.target]: params.id },
    });
  },

  async updateMany(resource, params) {
    const results = await Promise.all(
      params.ids.map((id) =>
        dataProvider.update(resource, { id, data: params.data }),
      ),
    );
    return { data: results.map((result) => result.data.id) };
  },

  async deleteMany(resource, params) {
    const results = await Promise.all(
      params.ids.map((id) => dataProvider.delete(resource, { id })),
    );
    return { data: results.map((result) => result.data.id) };
  },

  async uploadTemplatePreview(templateUid, file) {
    const formData = new FormData();
    formData.append("file", file);
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_access_token")
        : null;
    const response = await fetch(
      `${API_BASE}/admin/templates/${encodeURIComponent(templateUid)}/preview`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      },
    );
    const body = await response.json().catch(() => ({}));
    if (!response.ok)
      throw new HttpError(
        body.message || `Upload failed (${response.status})`,
        response.status,
        body,
      );
    return { data: withId(body.template, templateUid) };
  },
};

export { API_BASE, dataProvider };
export default dataProvider;
