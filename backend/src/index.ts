export default {
  fetch(_req: Request): Response {
    return new Response(
      JSON.stringify({ ok: true, source: "worker" }),
      { headers: { "content-type": "application/json" } }
    );
  },
};
