export const onRequestGet: PagesFunction = async () => {
  // Temporary stub until we wire auth + data storage
  return new Response(JSON.stringify({ requests: [] }), {
    headers: { "content-type": "application/json" },
  });
};
