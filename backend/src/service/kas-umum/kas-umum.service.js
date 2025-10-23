// src/service/kas-umum/kas-umum.service.js
const normalizeMonth = (m) => (m?.length === 7 ? `${m}-01` : m);

export default function createKasUmumService(kasUmumRepo) {
  const getBku = async ({ month, rabId, rkkId }) => {
    if (!month) {
      throw {
        status: 400,
        error: "month_required",
        hint: "YYYY-MM atau YYYY-MM-DD",
      };
    }

    const monthDate = normalizeMonth(month);

    const [rows, summary] = await Promise.all([
      kasUmumRepo.listBkuRows({ monthDate, rabId, rkkId }),
      kasUmumRepo.getBkuSummary({ monthDate, rabId, rkkId }),
    ]);

    return {
      meta: { month: month.slice(0, 7) },
      summary,
      rows,
    };
  };

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

  return {
    getBku,
    getBidang,
    getSubBidang,
    getKegiatan,
    createBku,
    getKodeEkonomi,
  };
}
