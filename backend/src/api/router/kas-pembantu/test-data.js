const months = [
  { month: 7, day: 15, uraian: "Data Juli 2025" },
  { month: 8, day: 20, uraian: "Data Agustus 2025" },
  { month: 11, day: 25, uraian: "Data November 2025" },
];

async function createAll() {
  for (const m of months) {
    const monthStr = String(m.month).padStart(2, "0");
    const dayStr = String(m.day).padStart(2, "0");
    const payload = {
      bku_id: "bku003",
      type_enum: "operasional",
      tanggal: `2025-${monthStr}-${dayStr}`,
      uraian: m.uraian,
      penerimaan: 0,
      pengeluaran: 250000,
    };

    try {
      const r = await fetch("http://localhost:8081/api/kas-pembantu/kegiatan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((r) => r.json());

      console.log("✓", m.uraian, r.id ? "(success)" : "(check response)");
    } catch (e) {
      console.log("✗", m.uraian, e.message);
    }
  }

  console.log("\nTest data creation complete!");
}

createAll();
