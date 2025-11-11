export default function createRabHandler(rabService) {
  return {
    async getRAByear(req, res) {
      try {
        const years = await rabService.getRAByearService();
        res.json(years);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    },

    async getRABbyYear(req, res) {
      try {
        const { year } = req.params;
        const rabList = await rabService.getRABbyYearService(year);
        res.json(rabList);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    },

    async getRAB(req, res) {
      try {
        const { rab_id } = req.params;
        const rab = await rabService.getRABService(rab_id);
        res.json(rab);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    },

    async getRABline(req, res) {
      try {
        const { rab_id } = req.params;
        const lines = await rabService.getRABlineService(rab_id);
        res.json(lines);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    },

    async getRABbyStatus(req, res) {
      try {
        const { year} = req.params;
        const role = req.cookies?.role; // 👈 take role from cookie
        if (!role) {
          return res.status(401).json({ error: "Missing user role cookie" });
        }
        const rabList = await rabService.getRABbyStatusService(year, role);
        res.json(rabList);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    },
  };
}
