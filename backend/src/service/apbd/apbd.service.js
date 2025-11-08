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

  const validateApbdesRincian = async (payload) => {
    ApbdRepo.validateApbdesRincian(payload);
    return { message: "Validasi berhasil" };
  };

  const createApbdesRincian = async (payload) => {
    ApbdRepo.validateApbdesRincian(payload);
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
    const total = await ApbdRepo.recalculateDraftApbdesTotals(apbdesId);
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
  };

  const getDraftApbdesList = async () => ApbdRepo.getDraftApbdesList();

  const getDraftApbdesById = async (id) => {
    if (!id) throw { status: 400, error: "id_required" };
    const draft = await ApbdRepo.getDraftApbdesById(id);
    if (!draft) throw { status: 404, error: "draft_not_found" };
    return draft;
  };

  const getDraftApbdesSummary = async () => {
    const summary = await ApbdRepo.getDraftApbdesSummary();
    return {
      pendapatan: summary.pendapatan || 0,
      belanja: summary.belanja || 0,
      pembiayaan: summary.pembiayaan || 0,
      raw: summary,
    };
  };

  const updateDraftApbdesItem = async (id, data) => {
    ApbdRepo.validateApbdesRincian(data);
    const updatedItem = await ApbdRepo.updateDraftApbdesItem(id, data);
    const total = await ApbdRepo.recalculateDraftApbdesTotals(
      updatedItem.apbd_id
    ); // Hitung ulang total
    return { updatedItem, total };
  };

  const deleteDraftApbdesItem = async (id) => {
    const deletedItem = await ApbdRepo.deleteDraftApbdesItem(id);
    const total = await ApbdRepo.recalculateDraftApbdesTotals(
      deletedItem.apbd_id
    ); // Hitung ulang total
    return { deletedItem, total };
  };

  const postDraftApbdes = async (id) => {
    if (!id) throw { status: 400, error: "id_required" };
    const currentStatus = await ApbdRepo.getApbdesStatus(id);
    if (currentStatus === "posted") {
      throw {
        status: 409,
        error: "apbdes_already_posted",
        message: "APBDes ini sudah diposting dan tidak dapat diubah lagi.",
      };
    }

    const postedApbdes = await ApbdRepo.postDraftApbdes(id);
    return {
      message: "APBDes berhasil diposting.",
      data: postedApbdes,
    };
  };

  const validateApbdesRincianPenjabaran = async (payload) => {
    ApbdRepo.validateApbdesRincianPenjabaran(payload);
    return { message: "Validasi berhasil" };
  };

  const createApbdesRincianPenjabaran = async (payload) => {
    ApbdRepo.createApbdesRincianPenjabaran(payload);
    return { message: "APBDes rincian penjabaran berhasil dibuat" };
  };

  const getDraftPenjabaranApbdesList = async () =>
    ApbdRepo.getDraftPenjabaranApbdesList();

  const getDraftPenjabaranApbdesById = async (id) => {
    if (!id) throw { status: 400, error: "id_required" };
    const draft = await ApbdRepo.getDraftPenjabaranApbdesById(id);
    if (!draft) throw { status: 404, error: "draft_not_found" };
    return draft;
  };

  const getDraftPenjabaranApbdesSummary = async () => {
    const summary = await ApbdRepo.getDraftPenjabaranApbdesSummary();
    return {
      pendapatan: summary.pendapatan || 0,
      belanja: summary.belanja || 0,
      pembiayaan: summary.pembiayaan || 0,
      raw: summary,
    };
  };

  const postDraftPenjabaranApbdes = async (id) => {
    if (!id) throw { status: 400, error: "id_required" };
    const currentStatus = await ApbdRepo.getApbdesStatus(id);
    if (currentStatus === "posted") {
      throw {
        status: 409,
        error: "apbdes_already_posted",
        message: "APBDes ini sudah diposting dan tidak dapat diubah lagi.",
      };
    }

    const postedApbdes = await ApbdRepo.postDraftPenjabaranApbdes(id);
    return {
      message: "APBDes berhasil diposting.",
      data: postedApbdes,
    };
  };

  const updatePenjabaranApbdesItem = async (id, data) => {
    ApbdRepo.validateApbdesRincianPenjabaran(data);
    const updatedItem = await ApbdRepo.updatePenjabaranApbdesItem(id, data);
    const total = await ApbdRepo.recalculatePenjabaranApbdesTotals(
      updatedItem.penjabaran_id
    ); // Hitung ulang total
    return { updatedItem, total };
  };

  const deletePenjabaranApbdesItem = async (id) => {
    const deletedItem = await ApbdRepo.deletePenjabaranApbdesItem(id);
    const total = await ApbdRepo.recalculatePenjabaranApbdesTotals(
      deletedItem.penjabaran_id
    ); // Hitung ulang total
    return { deletedItem, total };
  };

  return {
    //input form apbdes rincian
    getBidang,
    getKodeFungsi,
    getSubBidang,
    getKegiatan,
    getKodeEkonomi,
    getAkun,
    getUraian,
    getSumberDana,
    createApbdesRincian,
    validateApbdesRincian,

    //output apbdes rincian
    getDraftApbdesList,
    getDraftApbdesById,
    getDraftApbdesSummary,
    updateDraftApbdesItem,
    deleteDraftApbdesItem,
    postDraftApbdes,

    //input form apbdes rincian penjabaran
    validateApbdesRincianPenjabaran,
    createApbdesRincianPenjabaran,

    //output draft apbdes rincian penjabaran
    getDraftPenjabaranApbdesList,
    getDraftPenjabaranApbdesById,
    getDraftPenjabaranApbdesSummary,
    updatePenjabaranApbdesItem,
    deletePenjabaranApbdesItem,
    postDraftPenjabaranApbdes,

    //buku apbdes
    getApbdes,
    getApbdesStatus,
  };
}
