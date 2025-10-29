// src/service/apbd/apbd.service.js

export default function createApbdService(ApbdRepo) {
  const getBapbd = async ({ id, tahun, status }) => {
    if (!tahun) {
      throw {
        status: 400,
        error: "tahun_required",
        hint: "Format: YYYY",
      };
    }

    const rows = await ApbdRepo.listBApbdRows({ id, tahun, status });

    return {
      meta: { tahun },
      rows,
    };
  };

  const getKodeFungsi = async () => ApbdRepo.listKodeFungsi();

  const getBidang = async () => ApbdRepo.listBidang();

  const getSubBidang = async (bidangId) => {
    if (!bidangId) {
      throw { status: 400, error: "bidangId_required" };
    }
    return ApbdRepo.listSubBidang(bidangId);
  };

  const getKegiatan = async (subBidangId) => {
    if (!subBidangId) {
      throw { status: 400, error: "subBidangId_required" };
    }
    return ApbdRepo.listKegiatan(subBidangId);
  };

  const createBapbd = async (payload) => {
    const {
      kegiatan_id,
      kode_fungsi_id,
      kode_ekonomi_id,
      uraian,
      jumlah_anggaran,
      sumber_dana,
    } = payload;

    if (!kegiatan_id)
      throw {
        status: 400,
        error: "kegiatan_required",
        hint: "Kegiatan harus dipilih dari dropdown",
      };

    if (!kode_fungsi_id)
      throw {
        status: 400,
        error: "kode_fungsi_required",
        hint: "Kode fungsi harus dipilih",
      };

    if (!kode_ekonomi_id)
      throw {
        status: 400,
        error: "kode_ekonomi_required",
        hint: "Kode ekonomi harus dipilih",
      };

    if (!jumlah_anggaran || parseFloat(jumlah_anggaran) <= 0)
      throw {
        status: 400,
        error: "jumlah_anggaran_required",
        hint: "Jumlah anggaran harus lebih dari 0",
      };

    const newRow = await ApbdRepo.insertBApbd({
      kegiatan_id,
      kode_fungsi_id,
      kode_ekonomi_id,
      uraian: uraian || "",
      jumlah_anggaran: parseFloat(jumlah_anggaran),
      sumber_dana: sumber_dana || null,
    });

    return {
      message: "Data APBD berhasil ditambahkan",
      data: newRow,
    };
  };

  const getKodeEkonomi = async () => ApbdRepo.listKodeEkonomi();

  const getUraian = async () =>
    ApbdRepo.listUraian ? ApbdRepo.listUraian() : [];

  const getSumberDana = async () =>
    ApbdRepo.listSumberDana ? ApbdRepo.listSumberDana() : [];

  return {
    getBapbd,
    getBidang,
    getKodeFungsi,
    getSubBidang,
    getKegiatan,
    createBapbd,
    getKodeEkonomi,
    getUraian,
    getSumberDana,
  };
}