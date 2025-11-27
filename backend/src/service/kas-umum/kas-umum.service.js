import ExcelJS from "exceljs";

const normalizeMonth = (m) => (m?.length === 7 ? `${m}-01` : m);

export default function createKasUmumService(kasUmumRepo) {
  // helper sederhana; samakan gaya dengan normalizeMonth kamu
  function normalizeYear(year) {
    if (typeof year === "number") year = String(year);
    if (!/^\d{4}$/.test(year)) {
      throw {
        status: 400,
        error: "year_invalid",
        hint: "YYYY",
      };
    }
    return new Date(`${year}-01-01`);
  }

  const getBku = async ({ month, year }) => {
    if (!month && !year) {
      throw {
        status: 400,
        error: "period_required",
        hint: "Gunakan year=YYYY atau month=YYYY-MM / YYYY-MM-DD",
      };
    }

    const monthDateStr = month ? normalizeMonth(month) : undefined; // string
    const yearDate = year ? normalizeYear(year) : undefined; // Date

    // Jika keduanya ada, pastikan konsisten (tahun di month == year)
    if (monthDateStr && yearDate) {
      const yFromMonth = new Date(monthDateStr).getUTCFullYear();
      const yFromYear = yearDate.getUTCFullYear();
      if (yFromMonth !== yFromYear) {
        throw {
          status: 400,
          error: "year_mismatch",
          hint: `Year (${yFromYear}) harus sama dengan tahun pada month (${yFromMonth}).`,
        };
      }
    }

    const [rows, summary] = await Promise.all([
      kasUmumRepo.listBkuRows({ monthDate: monthDateStr, yearDate }),
      kasUmumRepo.getBkuSummary({ monthDate: monthDateStr, yearDate }),
    ]);

    const meta = {};
    if (year) meta.year = String(year).slice(0, 4);
    if (month) meta.month = month.slice(0, 7); // YYYY-MM

    return { meta, summary, rows };
  };

  async function getMonthlySaldo({ year }) {
    if (!year) throw { status: 400, error: "year_required", hint: "YYYY" };
    const yearDate = normalizeYear(year);
    const rows = await kasUmumRepo.getMonthlySaldo({ yearDate });
    const map = {};
    for (const r of rows) {
      map[r.ym] = r.saldo_after == null ? null : Number(r.saldo_after);
    }
    return { year: String(year), saldo: map };
  }

  async function exportBku({ month, year }) {
    if (!month && !year) {
      throw {
        status: 400,
        error: "period_required",
        hint: "Gunakan year=YYYY atau month=YYYY-MM",
      };
    }

    const monthDateStr = month ? normalizeMonth(month) : undefined;
    const yearDate = year ? normalizeYear(year) : undefined;

    const rows = await kasUmumRepo.listBkuRows({
      monthDate: monthDateStr,
      yearDate,
    });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("BKU");

    ws.columns = [
      { header: "No", key: "no", width: 6 },
      { header: "Tanggal", key: "tanggal", width: 12 },
      { header: "Kode Rekening", key: "kode_rekening", width: 18 },
      { header: "Uraian", key: "uraian", width: 30 },
      { header: "Pemasukan", key: "pemasukan", width: 15 },
      { header: "Pengeluaran", key: "pengeluaran", width: 15 },
      { header: "No. Bukti", key: "no_bukti", width: 12 },
      { header: "Netto Transaksi", key: "netto_transaksi", width: 17 },
      { header: "Saldo", key: "saldo", width: 15 },
    ];

    rows.forEach((r) => {
      ws.addRow({
        no: r.no,
        tanggal: new Date(r.tanggal).toISOString().slice(0, 10),
        kode_rekening: r.kode_rekening,
        uraian: r.uraian,
        pemasukan: r.pemasukan,
        pengeluaran: r.pengeluaran,
        no_bukti: r.no_bukti,
        netto_transaksi:
          r.netto_transaksi < 0
            ? `(${Math.abs(r.netto_transaksi)})`
            : r.netto_transaksi,
        saldo: r.saldo,
      });
    });

    const filename = month
      ? `BKU-${String(month).slice(0, 7)}.xlsx`
      : `BKU-${String(year)}.xlsx`;

    const buffer = await wb.xlsx.writeBuffer();

    return { filename, buffer };
  }

  // ⬇⬇ DIDEFINISIKAN DI SINI, BUKAN DI DALAM exportBku
  const getBkuById = async (id) => {
    if (!id) throw { status: 400, error: "id_required" };

    const row = await kasUmumRepo.getBkuById(id);
    if (!row) throw { status: 404, error: "not_found" };

    return row;
  };

  const updateBku = async (id, payload) => {
    const {
      tanggal,
      rab_id,
      kode_ekonomi_id,
      kegiatan_id,
      uraian,
      pemasukan,
      pengeluaran,
      nomor_bukti,
    } = payload;

    if (!tanggal) throw { status: 400, error: "tanggal_required" };
    if (!rab_id) throw { status: 400, error: "rab_id_required" };
    if (!kode_ekonomi_id) throw { status: 400, error: "kode_ekonomi_required" };
    if (!kegiatan_id) throw { status: 400, error: "kegiatan_required" };

    const hasPemasukan = pemasukan && parseFloat(pemasukan) > 0;
    const hasPengeluaran = pengeluaran && parseFloat(pengeluaran) > 0;

    if (!hasPemasukan && !hasPengeluaran)
      throw { status: 400, error: "amount_required" };
    if (hasPemasukan && hasPengeluaran)
      throw { status: 400, error: "amount_conflict" };

    const updated = await kasUmumRepo.updateBku(id, {
      tanggal,
      rab_id,
      kode_ekonomi_id,
      kode_fungsi_id: kegiatan_id,
      uraian,
      penerimaan: hasPemasukan ? Number(pemasukan) : 0,
      pengeluaran: hasPengeluaran ? Number(pengeluaran) : 0,
      no_bukti: nomor_bukti || null,
    });

    return {
      message: "Data Kas Umum berhasil diperbarui",
      data: updated,
    };
  };

  const approveBku = async (id, { status = "approved" } = {}) => {
    if (!id) throw { status: 400, error: "id_required" };

    // status expected: 'approved' or 'rejected' or 'pending'
    const updated = await kasUmumRepo.setPersetujuan(id, status);
    if (!updated) throw { status: 404, error: "not_found" };

    return {
      message: `BKU ${id} status updated to ${status}`,
      data: updated,
    };
  };

  const getRAB = async () => kasUmumRepo.listRAB();
  const getBidang = async () => kasUmumRepo.listBidang();

  const getSubBidang = async (bidangId) => {
    if (!bidangId) {
      throw { status: 400, error: "bidangId_required" };
    }
    return kasUmumRepo.listSubBidang(bidangId);
  };

  const getKegiatan = async (subBidangId) => {
    if (!subBidangId) {
      throw { status: 400, error: "subBidangId_required" };
    }
    return kasUmumRepo.listKegiatan(subBidangId);
  };

  const createBku = async (payload) => {
    const {
      tanggal,
      rab_id,
      kode_ekonomi_id,
      bidang_id,
      sub_bidang_id,
      kegiatan_id,
      uraian,
      pemasukan,
      pengeluaran,
      nomor_bukti,
    } = payload;

    if (!tanggal)
      throw {
        status: 400,
        error: "tanggal_required",
        hint: "Format: YYYY-MM-DD",
      };

    if (!rab_id)
      throw {
        status: 400,
        error: "rab_id_required",
        hint: "RAB ID tidak ditemukan",
      };

    if (!kode_ekonomi_id)
      throw {
        status: 400,
        error: "kode_ekonomi_required",
        hint: "Kode Ekonomi harus dipilih",
      };

    if (!kegiatan_id)
      throw {
        status: 400,
        error: "kegiatan_required",
        hint: "Kegiatan harus dipilih dari dropdown",
      };

    const hasPemasukan = pemasukan && parseFloat(pemasukan) > 0;
    const hasPengeluaran = pengeluaran && parseFloat(pengeluaran) > 0;

    if (!hasPemasukan && !hasPengeluaran)
      throw {
        status: 400,
        error: "amount_required",
        hint: "Harus mengisi Pemasukan atau Pengeluaran",
      };

    if (hasPemasukan && hasPengeluaran)
      throw {
        status: 400,
        error: "amount_conflict",
        hint: "Tidak boleh mengisi Pemasukan dan Pengeluaran sekaligus",
      };

    const newBku = await kasUmumRepo.insertBku({
      tanggal,
      rab_id,
      kode_ekonomi_id,
      kode_fungsi_id: kegiatan_id,
      uraian: uraian || "",
      penerimaan: hasPemasukan ? parseFloat(pemasukan) : 0,
      pengeluaran: hasPengeluaran ? parseFloat(pengeluaran) : 0,
      no_bukti: nomor_bukti || null,
    });

    return {
      message: "Data Kas Umum berhasil ditambahkan",
      data: newBku,
    };
  };

  const deleteBku = async (id) => {
    if (!id) throw { status: 400, error: "id_required" };
    const deleted = await kasUmumRepo.deleteBku(id);
    if (!deleted) throw { status: 404, error: "not_found" };
    return { message: "Data Kas Umum berhasil dihapus", data: deleted };
  };

  const getKodeEkonomi = async () => kasUmumRepo.listKodeEkonomi();
  const getAkun = async () => kasUmumRepo.listAkun();

  const getJenis = async (akunID) => {
    if (!akunID) {
      throw { status: 400, error: "akunId_required" };
    }
    return kasUmumRepo.listJenis(akunID);
  };

  const getObjek = async (jenisID) => {
    if (!jenisID) {
      throw { status: 400, error: "jenisId_required" };
    }
    return kasUmumRepo.listObjek(jenisID);
  };

  const getLastSaldo = async (rabId) => {
    const saldo = await kasUmumRepo.getLastSaldo(rabId);
    return { saldo };
  };

  return {
    getRAB,
    getBku,
    getMonthlySaldo,
    exportBku,
    getBidang,
    getSubBidang,
    getKegiatan,
    createBku,
    getKodeEkonomi,
    getAkun,
    getJenis,
    getObjek,
    getLastSaldo,
    updateBku,
    getBkuById,
    deleteBku,
    approveBku,
  };
}
