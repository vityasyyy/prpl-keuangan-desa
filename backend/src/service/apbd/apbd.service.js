// src/service/apbd/apbd.service.js

export default function createApbdService(ApbdRepo) {
  const getApbdes = async ({ id, tahun, status }) => {
    if (!tahun) {
      throw {
        status: 400,
        error: "tahun_required",
        hint: "Format: YYYY",
      };
    }

    const rows = await ApbdRepo.listApbdesRows({ id, tahun, status });

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

  /*
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
  }; */

  const createApbdesRincian = async (payload) => {
    ApbdRepo.validateApbdesData(payload);
    const newItem = await ApbdRepo.createApbdesRincian(payload);
    // Dapatkan apbdes_id dari kegiatan untuk hitung ulang total
    const apbdesIdQuery = `
      SELECT apbdes_id FROM kegiatan WHERE id = $1
    `;
    const { rows } = await ApbdRepo.db.query(apbdesIdQuery, [
      payload.kegiatan_id,
    ]); // Pastikan menggunakan repo untuk query
    const apbdesId = rows?.[0]?.apbdes_id;
    // Hitung ulang total setelah insert
    const total = await ApbdRepo.recalculateApbdesTotals(apbdesId);
    return {
      message: "Data APBDes berhasil ditambahkan",
      data: newItem,
      total,
    };
  };

  const getKodeEkonomi = async () => ApbdRepo.listKodeEkonomi();

  const getAkun = async () => ApbdRepo.listAkun();

  const getUraian = async () =>
    ApbdRepo.listUraian ? ApbdRepo.listUraian() : [];

  const getSumberDana = async () =>
    ApbdRepo.listSumberDana ? ApbdRepo.listSumberDana() : [];

  const getApbdesStatus = async (id) => {
    if (!id) throw { status: 400, error: "id_required" };
    const status = await ApbdRepo.getApbdesStatus(id);
    return status;
  }

  const getDraftApbdesList = async () => ApbdRepo.getDraftApbdesList();

  const getDraftApbdesById = async (id) => {
    if (!id) throw { status: 400, error: "id_required" };
    const draft = await ApbdRepo.getDraftApbdesById(id);
    if (!draft) throw { status: 404, error: "draft_not_found" };
    return draft;
  };

  const getApbdesSummary = async () => {
    const summary = await ApbdRepo.getApbdesSummary();
    return {
      pendapatan: summary.pendapatan || 0,
      belanja: summary.belanja || 0,
      pembiayaan: summary.pembiayaan || 0,
      raw: summary,
    };
  };

  const updateApbdesItem = async (id, data) => {
    ApbdRepo.validateApbdesData(data);
    const updatedItem = await ApbdRepo.updateApbdesItem(id, data);
    const total = await ApbdRepo.recalculateApbdesTotals(updatedItem.apbd_id); // Hitung ulang total
    return { updatedItem, total };
  };

  const deleteApbdesItem = async (id) => {
    const deletedItem = await ApbdRepo.deleteApbdesItem(id);
    const total = await ApbdRepo.recalculateApbdesTotals(deletedItem.apbd_id); // Hitung ulang total
    return { deletedItem, total };
  };

  const postApbdesDraft = async (id) => {
    if (!id) throw { status: 400, error: "id_required" };
    const currentStatus = await ApbdRepo.getApbdesStatus(id);
    if (currentStatus === "posted") {
      throw {
        status: 409,
        error: "apbdes_already_posted",
        message: "APBDes ini sudah diposting dan tidak dapat diubah lagi.",
      };
    }

    const postedApbdes = await ApbdRepo.postApbdesDraft(id);
    return {
      message: "APBDes berhasil diposting.",
      data: postedApbdes,
    };
  };

  return {
    getApbdes,
    getBidang,
    getKodeFungsi,
    getSubBidang,
    getKegiatan,
    createApbdesRincian,
    getKodeEkonomi,
    getAkun,
    getUraian,
    getSumberDana,
    getApbdesStatus,
    getDraftApbdesList,
    getDraftApbdesById,
    getApbdesSummary,
    updateApbdesItem,
    deleteApbdesItem,
    postApbdesDraft,
  };
}
