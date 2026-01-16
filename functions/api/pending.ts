export const onRequestGet: PagesFunction = async () => {
  return new Response(JSON.stringify({ requests: [] }), {
    headers: { "content-type": "application/json" },
  });
};
