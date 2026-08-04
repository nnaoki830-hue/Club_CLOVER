const { getStore } = require("@netlify/blobs");

const STORE_NAME = "club-clover";
const DATA_KEY = "site-data";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8"
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  const store = getStore(STORE_NAME);

  if (event.httpMethod === "GET") {
    const data = (await store.get(DATA_KEY, { type: "json" })) || {};
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, data })
    };
  }

  if (event.httpMethod === "POST") {
    const body = JSON.parse(event.body || "{}");
    const current = (await store.get(DATA_KEY, { type: "json" })) || {};

    const data = {
      casts: Array.isArray(body.casts) ? body.casts : current.casts || [],
      settings: body.settings && typeof body.settings === "object" ? body.settings : current.settings || {},
      schedule: body.schedule && typeof body.schedule === "object" ? body.schedule : current.schedule || {},
      news: Array.isArray(body.news) ? body.news : current.news || [],
      updatedAt: new Date().toISOString()
    };

    await store.setJSON(DATA_KEY, data);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, data })
    };
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ ok: false, message: "Method not allowed" })
  };
};