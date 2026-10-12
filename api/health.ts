// GET /api/health
export default async function handler(req: any, res: any) {
  res.json({ status: "ok" });
}
