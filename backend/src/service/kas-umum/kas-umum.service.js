// src/service/kas-umum/kas-umum.service.js
const normalizeMonth = (m) => (m?.length === 7 ? `${m}-01` : m);

export default function createKasUmumService(kasUmumRepo) {
  // Service

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
    // pakai awal tahun agar index tanggal tetap ke-pick (range di repo pakai date_trunc)
    return new Date(`${year}-01-01`);
  }

  const getBku = async ({ month, year }) => {
    // Minimal harus ada month ATAU year
    if (!month && !year) {
      throw {
        status: 400,
        error: "period_required",
        hint: "Gunakan year=YYYY atau month=YYYY-MM / YYYY-MM-DD",
      };
    }

    // Normalisasi input
    const monthDate = month ? normalizeMonth(month) : undefined;
    const yearDate = year ? normalizeYear(year) : undefined;

    // Jika keduanya ada, pastikan konsisten (tahun di month == year)
    if (monthDate && yearDate) {
      const yFromMonth = monthDate.getUTCFullYear();
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
      kasUmumRepo.listBkuRows({ monthDate, yearDate }),
      kasUmumRepo.getBkuSummary({ monthDate, yearDate }),
    ]);

    // meta rapi: isi yang tersedia saja
    const meta = {};
    if (year) meta.year = String(year).slice(0, 4);
    if (month) meta.month = month.slice(0, 7); // YYYY-MM

    return { meta, summary, rows };
  };
  function normalizeYear(year) {
    if (typeof year === "number") year = String(year);
    if (!/^\d{4}$/.test(year))
      throw { status: 400, error: "year_invalid", hint: "YYYY" };
    return new Date(`${year}-01-01`);
  }

  async function getMonthlySaldo({ year }) {
    if (!year) throw { status: 400, error: "year_required", hint: "YYYY" };
    const yearDate = normalizeYear(year);
    const rows = await kasUmumRepo.getMonthlySaldo({ yearDate });
    const map = {};
    for (const r of rows) map[r.ym] = Number(r.saldo_after) || 0;
    return { year: String(year), saldo: map };
  }

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
    // rabId optional
    const saldo = await kasUmumRepo.getLastSaldo(rabId);
    return { saldo };
  };

  return {
    getRAB,
    getBku,
    getMonthlySaldo,
    getBidang,
    getSubBidang,
    getKegiatan,
    createBku,
    getKodeEkonomi,
    getAkun,
    getJenis,
    getObjek,
    getLastSaldo,
  };
}
