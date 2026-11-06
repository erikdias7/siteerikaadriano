import { getStore } from "@netlify/blobs";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("", { status: 204, headers: cors });
  }

  const store = getStore("erika-adriano-gifts");

  if (req.method === "GET") {
    const raw = await store.get("claims", { type: "json" });
    return new Response(JSON.stringify(raw || {}), {
      status: 200,
      headers: cors,
    });
  }

  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "JSON inválido" }), {
        status: 400,
        headers: cors,
      });
    }

    const id = String(body?.id || "").trim();
    if (!id) {
      return new Response(JSON.stringify({ error: "id obrigatório" }), {
        status: 400,
        headers: cors,
      });
    }

    const current = (await store.get("claims", { type: "json" })) || {};
    if (current[id]) {
      return new Response(JSON.stringify({ ok: false, alreadyClaimed: true, claims: current }), {
        status: 409,
        headers: cors,
      });
    }

    current[id] = {
      title: String(body.title || "").slice(0, 180),
      at: new Date().toISOString(),
    };
    await store.setJSON("claims", current);

    return new Response(JSON.stringify({ ok: true, claims: current }), {
      status: 200,
      headers: cors,
    });
  }

  return new Response(JSON.stringify({ error: "Método não permitido" }), {
    status: 405,
    headers: cors,
  });
};

export const config = { path: "/api/gift-claims" };
