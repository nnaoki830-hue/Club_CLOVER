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
    try {
      const body = JSON.parse(event.body || "{}");
      const data = {
        casts: Array.isArray(body.casts) ? body.casts : [],
        settings: body.settings && typeof body.settings === "object" ? body.settings : {},
        schedule: body.schedule && typeof body.schedule === "object" ? body.schedule : {},
        news: Array.isArray(body.news) ? body.news : [],
        updatedAt: new Date().toISOString()
      };

      await store.setJSON(DATA_KEY, data);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, data })
      };
    } catch (error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ ok: false, message: "保存データを読み込めませんでした" })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ ok: false, message: "Method not allowed" })
  };
};
