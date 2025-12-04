import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "@jest/globals";

import createRabService from "./rab.service.js";

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

describe("RAB Service Tests", () => {
  let mockRepo;
  let service;

  beforeEach(() => {
    mockRepo = {
      getRAByear: jest.fn(),
      getRABbyYear: jest.fn(),
      getRABbyId: jest.fn(),
      createRAB: jest.fn(),
      getRABline: jest.fn(),
      createRABLine: jest.fn(),
      getRABLineById: jest.fn(),
      updateRABLine: jest.fn(),
      deleteRABLine: jest.fn(),
      getKodeRekeningBidang: jest.fn(),
      getKodeRekeningSubBidang: jest.fn(),
      getKodeRekeningKegiatan: jest.fn(),
      getKodeEkonomiAkun: jest.fn(),
      getKodeEkonomiJenis: jest.fn(),
      getKodeEkonomiObjek: jest.fn(),
      getRABLines: jest.fn(),
      getKodeFungsiById: jest.fn(),
      getKodeEkonomiById: jest.fn(),
    };

    service = createRabService(mockRepo);
  });

  // ---------------------------------------------------------------------
  // 1. getRAByearService
  // ---------------------------------------------------------------------
  test("getRAByearService should return formatted years", async () => {
    mockRepo.getRAByear.mockResolvedValue([{ tahun: "2024" }]);

    const result = await service.getRAByearService();

    expect(result).toEqual([{ tahun: 2024, label: "Tahun 2024" }]);
    expect(mockRepo.getRAByear).toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------
  // 2. getRABbyYearService
  // ---------------------------------------------------------------------
  test("getRABbyYearService should validate year and return transformed data", async () => {
    mockRepo.getRABbyYear.mockResolvedValue([{ id: 1, total_amount: "1000" }]);

    const result = await service.getRABbyYearService(2024);

    expect(result[0].total_amount).toBe(1000);
  });

  test("getRABbyYearService should throw error when year invalid", async () => {
    await expect(service.getRABbyYearService("abc")).rejects.toThrow();
  });

  // ---------------------------------------------------------------------
  // 3. getRABbyIdService
  // ---------------------------------------------------------------------
  test("getRABbyIdService should return RAB detail", async () => {
    mockRepo.getRABbyId.mockResolvedValue({ id: 1, total_amount: "500" });

    const result = await service.getRABbyIdService(1);

    expect(result.total_amount).toBe(500);
  });

  test("getRABbyIdService should throw when not found", async () => {
    mockRepo.getRABbyId.mockResolvedValue(null);

    await expect(service.getRABbyIdService(99)).rejects.toThrow(
      "tidak ditemukan"
    );
  });

  // ---------------------------------------------------------------------
  // 4. createRABService
  // ---------------------------------------------------------------------
  test("createRABService should create RAB successfully", async () => {
    mockRepo.getKodeFungsiById.mockResolvedValue(true);
    mockRepo.getKodeEkonomiById.mockResolvedValue(true);
    mockRepo.createRAB.mockResolvedValue({
      id: 1,
      total_amount: 0,
    });

    const data = {
      mulai: "2024-01-01",
      selesai: "2024-02-01",
      kode_fungsi_id: 1,
      kode_ekonomi_id: 1,
    };

    const result = await service.createRABService(data);

    expect(result.success).toBe(true);
  });

  test("createRABService should throw when tanggal invalid", async () => {
    const data = {
      mulai: "2024-03-01",
      selesai: "2024-01-01", // salah
      kode_fungsi_id: 1,
      kode_ekonomi_id: 1,
    };

    await expect(service.createRABService(data)).rejects.toThrow();
  });

  // ---------------------------------------------------------------------
  // 5. getRABlineService
  // ---------------------------------------------------------------------
  test("getRABlineService should return transformed lines", async () => {
    mockRepo.getRABbyId.mockResolvedValue({ id: 1 });
    mockRepo.getRABline.mockResolvedValue([
      { id: 1, volume: "2", harga_satuan: "100", jumlah: "200" },
    ]);

    const result = await service.getRABlineService(1);

    expect(result[0].volume).toBe(2);
    expect(result[0].jumlah).toBe(200);
  });

  // ---------------------------------------------------------------------
  // 6. createRABLineService
  // ---------------------------------------------------------------------
  test("createRABLineService should calculate jumlah automatically", async () => {
    mockRepo.getRABbyId.mockResolvedValue({
      id: 1,
      status_rab: "belum diajukan",
    });
    mockRepo.createRABLine.mockResolvedValue({
      volume: "2",
      harga_satuan: "100",
      jumlah: "200",
    });

    const result = await service.createRABLineService({
      rab_id: 1,
      uraian: "Uji",
      volume: 2,
      harga_satuan: 100,
      satuan: "pcs",
    });

    expect(result.jumlah).toBe(200);
  });

  // ---------------------------------------------------------------------
  // 7. updateRABLineService
  // ---------------------------------------------------------------------
  test("updateRABLineService should recalculate jumlah", async () => {
    mockRepo.getRABLineById.mockResolvedValue({
      id: 1,
      rab_id: 1,
    });
    mockRepo.getRABbyId.mockResolvedValue({ status_rab: "belum diajukan" });
    mockRepo.updateRABLine.mockResolvedValue({
      success: true,
      data: { volume: 3, harga_satuan: 100, jumlah: 300 },
    });

    const result = await service.updateRABLineService(1, {
      uraian: "Test",
      volumeNum: 3,
      hargaSatuanNum: 100,
      satuan: "pcs",
    });

    expect(result.data.jumlah).toBe(300);
  });

  // ---------------------------------------------------------------------
  // 8. deleteRABLineService
  // ---------------------------------------------------------------------
  test("deleteRABLineService should delete successfully", async () => {
    mockRepo.getRABLineById.mockResolvedValue({ rab_id: 1 });
    mockRepo.getRABbyId.mockResolvedValue({ status_rab: "belum diajukan" });
    mockRepo.deleteRABLine.mockResolvedValue({ success: true });

    const result = await service.deleteRABLineService(1);

    expect(result.message).toBe("RAB line berhasil dihapus");
    expect(result.deleted).toBeDefined();
  });

  // ---------------------------------------------------------------------
  // 9. getRABbyStatusService
  // ---------------------------------------------------------------------
  test("getRABbyStatusService should filter by role", async () => {
    mockRepo.getRABbyYear.mockResolvedValue([
      { id: 1, status_rab: "diajukan" },
      { id: 2, status_rab: "terverifikasi" },
    ]);

    const result = await service.getRABbyStatusService(2024, "sekretaris_desa");

    expect(result.length).toBe(2);
  });

  // ---------------------------------------------------------------------
  // 10. getKodeRekeningBidangService
  // ---------------------------------------------------------------------
  test("getKodeRekeningBidangService should return formatted list", async () => {
    mockRepo.getKodeRekeningBidang.mockResolvedValue([
      { kode: "1", uraian: "Bidang A" },
    ]);

    const result = await service.getKodeRekeningBidangService();

    expect(result[0].label).toBe("1 - Bidang A");
  });

  // ---------------------------------------------------------------------
  // 11–15. Kode Rekening + Ekonomi
  // ---------------------------------------------------------------------
  test("getKodeRekeningSubBidangService should return formatted", async () => {
    mockRepo.getKodeRekeningSubBidang.mockResolvedValue([
      { kode: "1.1", uraian: "Sub A" },
    ]);

    const result = await service.getKodeRekeningSubBidangService(1);
    expect(result[0].label).toBe("1.1 - Sub A");
  });

  test("getKodeRekeningKegiatanService should return formatted", async () => {
    mockRepo.getKodeRekeningKegiatan.mockResolvedValue([
      { kode: "1.1.1", uraian: "Kegiatan A" },
    ]);

    const result = await service.getKodeRekeningKegiatanService(1);
    expect(result[0].label).toBe("1.1.1 - Kegiatan A");
  });

  test("getKodeEkonomiAkunService should return formatted", async () => {
    mockRepo.getKodeEkonomiAkun.mockResolvedValue([
      { kode: "5", uraian: "Belanja Pegawai" },
    ]);

    const result = await service.getKodeEkonomiAkunService();

    expect(result[0].label).toBe("5 - Belanja Pegawai");
  });

  test("getKodeEkonomiJenisService should return formatted", async () => {
    mockRepo.getKodeEkonomiJenis.mockResolvedValue([
      { kode: "5.1", uraian: "Jenis A" },
    ]);

    const result = await service.getKodeEkonomiJenisService(5);
    expect(result[0].label).toBe("5.1 - Jenis A");
  });

  test("getKodeEkonomiObjekService should return formatted", async () => {
    mockRepo.getKodeEkonomiObjek.mockResolvedValue([
      { kode: "5.1.1", uraian: "Objek A" },
    ]);

    const result = await service.getKodeEkonomiObjekService(5);

    expect(result[0].label).toBe("5.1.1 - Objek A");
  });

  // ---------------------------------------------------------------------
  // 16. calculateRABTotalService
  // ---------------------------------------------------------------------
  test("calculateRABTotalService should calculate correct total", async () => {
    mockRepo.getRABbyId.mockResolvedValue({ id: 1, total_amount: 200 });
    mockRepo.getRABLines.mockResolvedValue([
      { jumlah: "100" },
      { jumlah: "100" },
    ]);

    const result = await service.calculateRABTotalService(1);

    expect(result.calculated_total).toBe(200);
    expect(result.is_consistent).toBe(true);
  });

  // ---------------------------------------------------------------------
  // 17. validateRABDataService
  // ---------------------------------------------------------------------
  test("validateRABDataService should identify invalid data", async () => {
    mockRepo.getKodeFungsiById.mockResolvedValue(true);
    mockRepo.getKodeEkonomiById.mockResolvedValue(true);

    const result = await service.validateRABDataService({
      mulai: "",
      selesai: "",
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
