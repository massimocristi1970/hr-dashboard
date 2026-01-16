export const onRequestGet: PagesFunction = async () => {
  return new Response(JSON.stringify({ employees: [] }), {
    headers: { "content-type": "application/json" },
  });
};
