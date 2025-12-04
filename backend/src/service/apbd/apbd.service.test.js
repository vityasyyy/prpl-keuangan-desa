import { jest, describe, it, expect, beforeEach, afterEach } from "@jest/globals";

const repoMethodNames = [
  "listApbdesRows",
  "listKodeFungsi",
  "listBidang",
  "listSubBidang",
  "listKegiatan",
  "getDraftApbdesByYear",
  "createApbdesDraft",
  "createApbdesRincian",
  "recalculateDraftApbdesTotals",
  "getApbdesStatus",
  "getDraftApbdesList",
  "getDraftApbdesById",
  "getDraftApbdesSummary",
  "listKodeEkonomi",
  "listAkun",
  "listKelompok",
  "listJenis",
  "listObjek",
  "postDraftApbdes",
  "createApbdesRincianPenjabaran",
  "getApbdesIdByRincianId",
  "getDraftPenjabaranApbdesList",
  "getDraftPenjabaranApbdesById",
  "getDraftPenjabaranApbdesSummary",
  "postDraftPenjabaranApbdes",
  "updateDraftApbdesItem",
  "deleteDraftApbdesItem",
  "updatePenjabaranApbdesItem",
  "deletePenjabaranApbdesItem",
  "getKodeFungsiDetailsByFullCode",
  "getKodeEkonomiDetailsByFullCode",
  "getKodeEkonomiIdByFullCode",
  "getKodeFungsiIdByFullCode",
  "getRincianListForPenjabaran",
  "getDraftPenjabaranByRincianId",
  "postRincianByIds",
];

describe("APBD Service (implementation-aligned tests)", () => {
  let ApbdRepo;
  let apbdService;

  beforeEach(async () => {
    jest.resetModules();
    ApbdRepo = Object.fromEntries(repoMethodNames.map((n) => [n, jest.fn()]));

    await jest.unstable_mockModule("../../repository/apbd/apbd.repo.js", () => ({
      default: () => ApbdRepo,
    }));

    const mod = await import("./apbd.service.js");
    const createApbdService = mod.default;
    apbdService = createApbdService(ApbdRepo);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe("getApbdes", () => {
    it("throws 400 when tahun missing", async () => {
      await expect(apbdService.getApbdes({ id: 1, status: "draft" })).rejects.toEqual({
        status: 400,
        error: "tahun_required",
        hint: "Format: YYYY",
      });
    });

    it("returns rows & meta when tahun provided", async () => {
      const rows = [{ id: 1 }];
      ApbdRepo.listApbdesRows.mockResolvedValue(rows);

      const res = await apbdService.getApbdes({ id: 2, tahun: 2025, status: "draft" });

      expect(res).toEqual({ meta: { tahun: 2025 }, rows });
      expect(ApbdRepo.listApbdesRows).toHaveBeenCalledWith({ id: 2, tahun: 2025, status: "draft" });
    });

    it("propagates repo errors", async () => {
      ApbdRepo.listApbdesRows.mockRejectedValue(new Error("DB fail"));
      await expect(apbdService.getApbdes({ id: 1, tahun: 2025 })).rejects.toThrow("DB fail");
    });
  });

  describe("master list getters", () => {
    it("getKodeFungsi proxies to repo", async () => {
      const data = [{ id: 1 }];
      ApbdRepo.listKodeFungsi.mockResolvedValue(data);
      const res = await apbdService.getKodeFungsi();
      expect(res).toBe(data);
      expect(ApbdRepo.listKodeFungsi).toHaveBeenCalled();
    });

    it("getBidang/getSubBidang/getKegiatan proxies to repo", async () => {
      ApbdRepo.listBidang.mockResolvedValue([1]);
      ApbdRepo.listSubBidang.mockResolvedValue([2]);
      ApbdRepo.listKegiatan.mockResolvedValue([3]);
      expect(await apbdService.getBidang()).toEqual([1]);
      expect(await apbdService.getSubBidang()).toEqual([2]);
      expect(await apbdService.getKegiatan()).toEqual([3]);
    });
  });

  describe("createApbdesDraft", () => {
    it("returns existing draft if found", async () => {
      const draft = { id: 10, tahun: 2024 };
      ApbdRepo.getDraftApbdesByYear.mockResolvedValue(draft);
      const res = await apbdService.createApbdesDraft(2024);
      expect(res).toEqual({ message: "Draft APBDes berhasil dibuat", data: draft });
    });

    it("creates new draft if none exists", async () => {
      ApbdRepo.getDraftApbdesByYear.mockResolvedValue(null);
      const created = { id: 77, tahun: 2025 };
      ApbdRepo.createApbdesDraft.mockResolvedValue(created);
      const res = await apbdService.createApbdesDraft(2025);
      expect(res).toEqual({ message: "Draft APBDes berhasil dibuat", data: created });
      expect(ApbdRepo.createApbdesDraft).toHaveBeenCalledWith(2025);
    });

    it("uses current year when tahun not provided", async () => {
      const year = new Date().getFullYear();
      ApbdRepo.getDraftApbdesByYear.mockResolvedValue(null);
      ApbdRepo.createApbdesDraft.mockResolvedValue({ id: 999, tahun: year });
      const res = await apbdService.createApbdesDraft();
      expect(ApbdRepo.getDraftApbdesByYear).toHaveBeenCalledWith(year);
      expect(ApbdRepo.createApbdesDraft).toHaveBeenCalledWith(year);
      expect(res.data.tahun).toBe(year);
    });
  });

  describe("createApbdesRincian", () => {
    it("uses provided apbdes_id and returns message,data,total", async () => {
      const payload = { apbdes_id: 5, jumlah: 20000 };
      const rincian = { id: 99, jumlah: 20000 };
      const total = { pendapatan: 1000 };

      ApbdRepo.createApbdesRincian.mockResolvedValue(rincian);
      ApbdRepo.recalculateDraftApbdesTotals.mockResolvedValue(total);

      const res = await apbdService.createApbdesRincian(payload);
      expect(res).toEqual({ message: "Rincian berhasil ditambahkan", data: rincian, total });
      expect(ApbdRepo.createApbdesRincian).toHaveBeenCalledWith(payload);
      expect(ApbdRepo.recalculateDraftApbdesTotals).toHaveBeenCalledWith(5);
    });

    it("creates draft if apbdes_id missing then inserts rincian and respects payload.tahun", async () => {
      const payload = { jumlah: 5000, tahun: 2030 };
      const newDraft = { id: 444, tahun: 2030 };
      const rincian = { id: 23, jumlah: 5000 };
      const total = { belanja: 8000 };

      ApbdRepo.getDraftApbdesByYear.mockResolvedValue(null);
      ApbdRepo.createApbdesDraft.mockResolvedValue(newDraft);
      ApbdRepo.createApbdesRincian.mockResolvedValue(rincian);
      ApbdRepo.recalculateDraftApbdesTotals.mockResolvedValue(total);

      const res = await apbdService.createApbdesRincian(payload);

      expect(ApbdRepo.getDraftApbdesByYear).toHaveBeenCalledWith(2030);
      expect(payload.apbdes_id).toBe(444);
      expect(res).toEqual({ message: "Rincian berhasil ditambahkan", data: rincian, total });
    });

    it("converts kode_ekonomi_id full_code to id and throws if invalid", async () => {
      const payload = { jumlah: 1000, kode_ekonomi_id: "4 1 1 01", apbdes_id: 7 };
      const rincian = { id: 200 };
      const total = { pendapatan: 0 };

      ApbdRepo.getKodeEkonomiIdByFullCode.mockResolvedValue(41101);
      ApbdRepo.createApbdesRincian.mockResolvedValue(rincian);
      ApbdRepo.recalculateDraftApbdesTotals.mockResolvedValue(total);

      const res = await apbdService.createApbdesRincian({ ...payload });
      // payload should be mutated to have numeric id after conversion
      expect(ApbdRepo.getKodeEkonomiIdByFullCode).toHaveBeenCalledWith("4 1 1 01");
      expect(ApbdRepo.createApbdesRincian).toHaveBeenCalledWith(expect.objectContaining({ kode_ekonomi_id: 41101 }));
      expect(res).toEqual({ message: "Rincian berhasil ditambahkan", data: rincian, total });

      // invalid code path
      ApbdRepo.getKodeEkonomiIdByFullCode.mockResolvedValue(null);
      await expect(apbdService.createApbdesRincian({ jumlah: 1000, kode_ekonomi_id: "9 9 9 99", apbdes_id: 7 })).rejects.toEqual({
        status: 400,
        error: 'invalid_kode_ekonomi',
        message: 'Kode ekonomi "9 9 9 99" tidak ditemukan',
      });
    });

    it("converts kode_fungsi_id full_code to id and throws if invalid", async () => {
      const payload = { jumlah: 1000, kode_fungsi_id: "1 2 03", apbdes_id: 8 };
      const rincian = { id: 201 };
      const total = { pendapatan: 0 };

      ApbdRepo.getKodeFungsiIdByFullCode.mockResolvedValue(1203);
      ApbdRepo.createApbdesRincian.mockResolvedValue(rincian);
      ApbdRepo.recalculateDraftApbdesTotals.mockResolvedValue(total);

      const res = await apbdService.createApbdesRincian({ ...payload });
      expect(ApbdRepo.getKodeFungsiIdByFullCode).toHaveBeenCalledWith("1 2 03");
      expect(ApbdRepo.createApbdesRincian).toHaveBeenCalledWith(expect.objectContaining({ kode_fungsi_id: 1203 }));
      expect(res).toEqual({ message: "Rincian berhasil ditambahkan", data: rincian, total });

      ApbdRepo.getKodeFungsiIdByFullCode.mockResolvedValue(null);
      await expect(apbdService.createApbdesRincian({ jumlah: 1000, kode_fungsi_id: "9 9 99", apbdes_id: 8 })).rejects.toEqual({
        status: 400,
        error: 'invalid_kode_fungsi',
        message: 'Kode fungsi "9 9 99" tidak ditemukan',
      });
    });
  });

  describe("kode ekonomi helpers", () => {
    it("proxies listKodeEkonomi/listAkun/listKelompok/listJenis/listObjek", async () => {
      ApbdRepo.listKodeEkonomi.mockResolvedValue([1]);
      ApbdRepo.listAkun.mockResolvedValue([2]);
      ApbdRepo.listKelompok.mockResolvedValue([3]);
      ApbdRepo.listJenis.mockResolvedValue([4]);
      ApbdRepo.listObjek.mockResolvedValue([5]);

      expect(await apbdService.getKodeEkonomi()).toEqual([1]);
      expect(await apbdService.getAkun()).toEqual([2]);
      expect(await apbdService.getKelompok()).toEqual([3]);
      expect(await apbdService.getJenis()).toEqual([4]);
      expect(await apbdService.getObjek()).toEqual([5]);
    });
  });

  describe("draft apbdes list / details / summary", () => {
    it("getDraftApbdesList returns repo result (raw)", async () => {
      const drafts = [{ id: 1 }, { id: 2 }];
      ApbdRepo.getDraftApbdesList.mockResolvedValue(drafts);
      const res = await apbdService.getDraftApbdesList();
      expect(res).toBe(drafts);
    });

    it("getDraftApbdesById: validates id and returns draft or throws 404", async () => {
      await expect(apbdService.getDraftApbdesById()).rejects.toEqual({ status: 400, error: "id_required" });

      const draft = { id: 1, status: "draft" };
      ApbdRepo.getDraftApbdesById.mockResolvedValue(draft);
      const res = await apbdService.getDraftApbdesById(1);
      expect(res).toBe(draft);

      ApbdRepo.getDraftApbdesById.mockResolvedValue(null);
      await expect(apbdService.getDraftApbdesById(999)).rejects.toEqual({ status: 404, error: "draft_not_found" });
    });

    it("getDraftApbdesSummary returns normalized totals + raw and handles missing fields", async () => {
      const summary = { total_anggaran: 500000, pendapatan: 200000, belanja: 300000, pembiayaan: 0, count: 5 };
      ApbdRepo.getDraftApbdesSummary.mockResolvedValue(summary);
      const res = await apbdService.getDraftApbdesSummary();
      expect(res).toEqual({
        pendapatan: 200000,
        belanja: 300000,
        pembiayaan: 0,
        raw: summary,
      });

      ApbdRepo.getDraftApbdesSummary.mockResolvedValue({});
      const res2 = await apbdService.getDraftApbdesSummary();
      expect(res2).toEqual({ pendapatan: 0, belanja: 0, pembiayaan: 0, raw: {} });
    });
  });

  describe("update / delete draft rincian", () => {
    it("updateDraftApbdesItem returns updatedItem + total (uses updated.apbdes_id)", async () => {
      const updated = { id: 1, apbdes_id: 5, jumlah_anggaran: 50000 };
      const total = { pendapatan: 100000 };
      ApbdRepo.updateDraftApbdesItem.mockResolvedValue(updated);
      ApbdRepo.recalculateDraftApbdesTotals.mockResolvedValue(total);

      const res = await apbdService.updateDraftApbdesItem(1, { jumlah_anggaran: 50000 });
      expect(res).toEqual({ updatedItem: updated, total });
      expect(ApbdRepo.updateDraftApbdesItem).toHaveBeenCalledWith(1, { jumlah_anggaran: 50000 });
      expect(ApbdRepo.recalculateDraftApbdesTotals).toHaveBeenCalledWith(5);
    });

    it("updateDraftApbdesItem converts full_codes on update and errors when invalid", async () => {
      ApbdRepo.getKodeEkonomiIdByFullCode.mockResolvedValue(41101);
      ApbdRepo.getKodeFungsiIdByFullCode.mockResolvedValue(1203);
      const updated = { id: 2, apbdes_id: 6 };
      ApbdRepo.updateDraftApbdesItem.mockResolvedValue(updated);
      ApbdRepo.recalculateDraftApbdesTotals.mockResolvedValue({ pendapatan: 0 });

      const res = await apbdService.updateDraftApbdesItem(2, { kode_ekonomi_id: "4 1 1 01", kode_fungsi_id: "1 2 03" });
      expect(ApbdRepo.getKodeEkonomiIdByFullCode).toHaveBeenCalledWith("4 1 1 01");
      expect(ApbdRepo.getKodeFungsiIdByFullCode).toHaveBeenCalledWith("1 2 03");
      expect(res.updatedItem).toBe(updated);

      // invalid ekonomi
      ApbdRepo.getKodeEkonomiIdByFullCode.mockResolvedValue(null);
      await expect(apbdService.updateDraftApbdesItem(2, { kode_ekonomi_id: "9 9 9 99" })).rejects.toEqual({
        status: 400,
        error: 'invalid_kode_ekonomi',
        message: 'Kode ekonomi "9 9 9 99" tidak ditemukan',
      });
    });

    it("deleteDraftApbdesItem returns deletedItem + total and triggers recalculation with apbdes_id (detects bug)", async () => {
      const deletedItem = { id: 2, apbdes_id: 10 };
      const total = { pendapatan: 50000 };
      ApbdRepo.deleteDraftApbdesItem.mockResolvedValue(deletedItem);
      ApbdRepo.recalculateDraftApbdesTotals.mockResolvedValue(total);

      const res = await apbdService.deleteDraftApbdesItem(2);
      expect(res).toEqual({ deletedItem, total });
      expect(ApbdRepo.deleteDraftApbdesItem).toHaveBeenCalledWith(2);
      // This expectation is the correct behavior; if the service has a typo (apbd_id) this will fail and reveal the bug.
      expect(ApbdRepo.recalculateDraftApbdesTotals).toHaveBeenCalledWith(10);
    });
  });

  describe("postDraftApbdes", () => {
    it("validates id", async () => {
      await expect(apbdService.postDraftApbdes()).rejects.toEqual({ status: 400, error: "id_required" });
    });

    it("throws 409 when already posted", async () => {
      ApbdRepo.getApbdesStatus.mockResolvedValue("posted");
      await expect(apbdService.postDraftApbdes(1)).rejects.toMatchObject({ status: 409, error: "apbdes_already_posted" });
    });

    it("posts and returns message + data (message ends with dot)", async () => {
      const posted = { id: 1, status: "posted" };
      ApbdRepo.getApbdesStatus.mockResolvedValue("draft");
      ApbdRepo.postDraftApbdes.mockResolvedValue(posted);

      const res = await apbdService.postDraftApbdes(1);
      expect(res).toEqual({ message: "APBDes berhasil diposting.", data: posted });
    });
  });

  describe("penjabaran create / post / list / summary", () => {
    it("createApbdesRincianPenjabaran returns message,data,total and creates draft if missing apbdesId", async () => {
      const payload = { rincian_id: 10 };
      const newItem = { id: 5, rincian_id: 10 };
      ApbdRepo.createApbdesRincianPenjabaran.mockResolvedValue(newItem);
      ApbdRepo.getApbdesIdByRincianId.mockResolvedValue(7);
      ApbdRepo.recalculateDraftApbdesTotals.mockResolvedValue({ belanja: 100000 });

      const res = await apbdService.createApbdesRincianPenjabaran(payload);
      expect(res).toEqual({ message: "Penjabaran berhasil ditambahkan", data: newItem, total: { belanja: 100000 } });

      // when getApbdesIdByRincianId returns null, it should create draft
      ApbdRepo.getApbdesIdByRincianId.mockResolvedValue(null);
      ApbdRepo.createApbdesDraft.mockResolvedValue({ id: 88, tahun: new Date().getFullYear() });
      ApbdRepo.createApbdesRincianPenjabaran.mockResolvedValue({ id: 6, rincian_id: 11 });
      ApbdRepo.recalculateDraftApbdesTotals.mockResolvedValue({ belanja: 5000 });

      const res2 = await apbdService.createApbdesRincianPenjabaran({ rincian_id: 11 });
      expect(ApbdRepo.createApbdesDraft).toHaveBeenCalled();
      expect(res2.total).toEqual({ belanja: 5000 });
    });

    it("getDraftPenjabaranApbdesList returns raw list", async () => {
      const penjabarans = [{ id: 1 }, { id: 2 }];
      ApbdRepo.getDraftPenjabaranApbdesList.mockResolvedValue(penjabarans);
      const res = await apbdService.getDraftPenjabaranApbdesList();
      expect(res).toBe(penjabarans);
    });

    it("getDraftPenjabaranApbdesById validates id and returns raw or throws", async () => {
      await expect(apbdService.getDraftPenjabaranApbdesById()).rejects.toEqual({ status: 400, error: "id_required" });
      const penjabaran = { id: 1, rincian_id: 10 };
      ApbdRepo.getDraftPenjabaranApbdesById.mockResolvedValue(penjabaran);
      const res = await apbdService.getDraftPenjabaranApbdesById(1);
      expect(res).toBe(penjabaran);
      ApbdRepo.getDraftPenjabaranApbdesById.mockResolvedValue(null);
      await expect(apbdService.getDraftPenjabaranApbdesById(999)).rejects.toEqual({ status: 404, error: "draft_not_found" });
    });

    it("getDraftPenjabaranApbdesSummary normalizes totals", async () => {
      const summary = { total_penjabaran: 300000, pendapatan: 100000, belanja: 200000, pembiayaan: 0 };
      ApbdRepo.getDraftPenjabaranApbdesSummary.mockResolvedValue(summary);
      const res = await apbdService.getDraftPenjabaranApbdesSummary();
      expect(res).toEqual({ pendapatan: 100000, belanja: 200000, pembiayaan: 0, raw: summary });
    });

    it("update/delete penjabaran use apbdes totals recalculation", async () => {
      const updated = { id: 1, rincian_id: 10 };
      const total = { belanja: 150000 };
      ApbdRepo.updatePenjabaranApbdesItem.mockResolvedValue(updated);
      ApbdRepo.recalculateDraftApbdesTotals.mockResolvedValue(total);
      ApbdRepo.getApbdesIdByRincianId.mockResolvedValue(5);

      const res = await apbdService.updatePenjabaranApbdesItem(1, { jumlah: 40000 });
      expect(res).toEqual({ updatedItem: updated, total });

      const deleted = { id: 2, penjabaran_id: 2 };
      ApbdRepo.deletePenjabaranApbdesItem.mockResolvedValue(deleted);
      ApbdRepo.recalculateDraftApbdesTotals.mockResolvedValue({ belanja: 100000 });

      const res2 = await apbdService.deletePenjabaranApbdesItem(2);
      expect(res2).toEqual({ deletedItem: deleted, total: { belanja: 100000 } });
    });

    it("postDraftPenjabaranApbdes validates parent rincian posted", async () => {
      const penjabaran = { id: 2, rincian_id: 20 };
      ApbdRepo.getDraftPenjabaranApbdesById.mockResolvedValue(penjabaran);
      ApbdRepo.getDraftApbdesById.mockResolvedValue({ id: 20, status: "posted" });
      ApbdRepo.postDraftPenjabaranApbdes.mockResolvedValue();

      const res = await apbdService.postDraftPenjabaranApbdes(2);
      expect(res).toEqual({ message: "Penjabaran berhasil diposting.", data: { id: 2, rincian_id: 20 } });

      ApbdRepo.getDraftPenjabaranApbdesById.mockResolvedValue({ id: 3, rincian_id: 30 });
      ApbdRepo.getDraftApbdesById.mockResolvedValue({ id: 30, status: "draft" });
      await expect(apbdService.postDraftPenjabaranApbdes(3)).rejects.toMatchObject({ status: 400, error: "rincian_not_posted" });
    });
  });

  describe("dropdown helpers", () => {
    it("returns kode_fungsi shape when repo returns kegiatan", async () => {
      ApbdRepo.getKodeFungsiDetailsByFullCode.mockResolvedValue({ bidang: {}, subBidang: {}, kegiatan: {} });
      const res = await apbdService.getDropdownOptionsByKodeRekening("1.1.01");
      expect(res).toHaveProperty("type", "kode_fungsi");
      expect(ApbdRepo.getKodeFungsiDetailsByFullCode).toHaveBeenCalled();
    });

    it("returns kode_ekonomi shape when repo returns objek", async () => {
      const result = { akun: { id: 4 }, kelompok: { id: 41 }, jenis: { id: 411 }, objek: { id: 41101 } };
      ApbdRepo.getKodeEkonomiDetailsByFullCode.mockResolvedValue(result);
      ApbdRepo.listKelompok.mockResolvedValue([{ id: 41 }]);
      ApbdRepo.listJenis.mockResolvedValue([{ id: 411 }]);
      ApbdRepo.listObjek.mockResolvedValue([{ id: 41101 }]);

      const res = await apbdService.getDropdownOptionsByKodeRekening("4.1.1.01");
      expect(res).toHaveProperty("type", "kode_ekonomi");
      expect(res).toHaveProperty("akun");
    });

    it("throws for invalid kode rekening", async () => {
      ApbdRepo.getKodeFungsiDetailsByFullCode.mockResolvedValue(null);
      ApbdRepo.getKodeEkonomiDetailsByFullCode.mockResolvedValue(null);
      await expect(apbdService.getDropdownOptionsByKodeRekening("9.9.9.9")).rejects.toMatchObject({ status: 400, error: "invalid_kode_rekening" });
    });

    it("getAllDropdownOptions proxies to repo and returns all collections", async () => {
      ApbdRepo.listBidang.mockResolvedValue(["a"]);
      ApbdRepo.listSubBidang.mockResolvedValue(["b"]);
      ApbdRepo.listKegiatan.mockResolvedValue(["c"]);
      ApbdRepo.listAkun.mockResolvedValue(["d"]);
      ApbdRepo.listKelompok.mockResolvedValue(["e"]);
      ApbdRepo.listJenis.mockResolvedValue(["f"]);
      ApbdRepo.listObjek.mockResolvedValue(["g"]);

      const res = await apbdService.getAllDropdownOptions();
      expect(res).toEqual({ bidang: ["a"], subBidang: ["b"], kegiatan: ["c"], akun: ["d"], kelompok: ["e"], jenis: ["f"], objek: ["g"] });
    });
  });

  describe("getApbdesStatus", () => {
    it("validates id and returns repo value raw", async () => {
      await expect(apbdService.getApbdesStatus()).rejects.toEqual({ status: 400, error: "id_required" });
      ApbdRepo.getApbdesStatus.mockResolvedValue({ id: 1, status: "draft" });
      const res = await apbdService.getApbdesStatus(1);
      expect(res).toEqual({ id: 1, status: "draft" });
    });
  });

  describe("postPenjabaranWithParent", () => {
    it("throws when penjabaranIds missing or empty", async () => {
      await expect(apbdService.postPenjabaranWithParent()).rejects.toEqual({ status: 400, error: "penjabaran_ids_required" });
      await expect(apbdService.postPenjabaranWithParent([])).rejects.toEqual({ status: 400, error: "penjabaran_ids_required" });
    });

    it("throws 404 when none of the penjabaran found", async () => {
      ApbdRepo.getDraftPenjabaranApbdesById.mockResolvedValue(null);
      await expect(apbdService.postPenjabaranWithParent([1, 2])).rejects.toEqual({ status: 404, error: "no_penjabaran_found" });
    });

    it("posts only rincian that are not posted and posts apbdes parents when needed", async () => {
      // two penjabaran referencing different rincian
      ApbdRepo.getDraftPenjabaranApbdesById
        .mockResolvedValueOnce({ id: 1, rincian_id: 100 })
        .mockResolvedValueOnce({ id: 2, rincian_id: 101 });

      // rincian 100 already posted, rincian 101 draft
      ApbdRepo.getDraftApbdesById
        .mockResolvedValueOnce({ id: 100, status: 'posted', apbdes_id: 500 })
        .mockResolvedValueOnce({ id: 101, status: 'draft', apbdes_id: 501 });

      ApbdRepo.postRincianByIds.mockResolvedValue([{ id: 101 }]);

      // For apbdes parents, 500 is posted, 501 is draft -> only 501 should be posted
      ApbdRepo.getApbdesStatus
        .mockResolvedValueOnce('posted')
        .mockResolvedValueOnce('draft');
      ApbdRepo.postDraftApbdes.mockResolvedValue({ id: 501, status: 'posted' });

      const res = await apbdService.postPenjabaranWithParent([1, 2]);
      expect(res).toHaveProperty('message');
      expect(res.data.posted_rincian_count).toBe(1);
      expect(res.data.posted_apbdes_count).toBe(1);
      expect(ApbdRepo.postRincianByIds).toHaveBeenCalledWith([101]);
      expect(ApbdRepo.postDraftApbdes).toHaveBeenCalledWith(501);
    });
  });

  describe("error handling", () => {
    it("propagates repo errors from createApbdesDraft", async () => {
      ApbdRepo.createApbdesDraft.mockRejectedValue(new Error("Insert failed"));
      ApbdRepo.getDraftApbdesByYear.mockResolvedValue(null);
      await expect(apbdService.createApbdesDraft(2025)).rejects.toThrow("Insert failed");
    });

    it("propagates repo errors from getDraftApbdesList", async () => {
      ApbdRepo.getDraftApbdesList.mockRejectedValue(new Error("Query failed"));
      await expect(apbdService.getDraftApbdesList()).rejects.toThrow("Query failed");
    });
  });
});
