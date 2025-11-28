import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import createKasUmumService from './kas-umum.service.js';
import createKasUmumRepo from '../../repository/kas-umum/kas-umum.repo.js';

const mockLog = { info: jest.fn(), error: jest.fn(), debug: jest.fn() };

describe("KasUmumService (Unit)", () => {
  let kasUmumService;
  let mockKasUmumRepo;

  beforeEach(() => {
    // Create mock repository with all methods
    mockKasUmumRepo = {
      listBkuRows: jest.fn(),
      getBkuSummary: jest.fn(),
      listRAB: jest.fn(),
      listBidang: jest.fn(),
      listSubBidang: jest.fn(),
      listKegiatan: jest.fn(),
      insertBku: jest.fn(),
      listKodeEkonomi: jest.fn(),
      listAkun: jest.fn(),
      listJenis: jest.fn(),
      listObjek: jest.fn(),
      getLastSaldo: jest.fn(),
    };

    kasUmumService = createKasUmumService(mockKasUmumRepo);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getBku", () => {
    it("should return BKU data with rows and summary for valid month", async () => {
      // Arrange
      const mockRows = [
        {
          no: 1,
          tanggal: '2025-01-15',
          kode_rekening: '1.1.1.01',
          uraian: 'Penerimaan ADD',
          pemasukan: 1000000,
          pengeluaran: 0,
          netto_transaksi: 1000000,
          saldo: 1000000,
        }
      ];
      const mockSummary = {
        total_pemasukan: 1000000,
        total_pengeluaran: 0,
        total_netto: 1000000,
      };

      mockKasUmumRepo.listBkuRows.mockResolvedValue(mockRows);
      mockKasUmumRepo.getBkuSummary.mockResolvedValue(mockSummary);

      // Act
      const result = await kasUmumService.getBku({ month: '2025-01' });

      // Assert
      expect(result).toEqual({
        meta: { month: '2025-01' },
        summary: mockSummary,
        rows: mockRows,
      });
      expect(mockKasUmumRepo.listBkuRows).toHaveBeenCalledWith({
        monthDate: '2025-01-01',
        yearDate: undefined,
      });
      expect(mockKasUmumRepo.getBkuSummary).toHaveBeenCalledWith({
        monthDate: '2025-01-01',
        yearDate: undefined,
      });
    });

    it("should normalize month format from YYYY-MM to YYYY-MM-DD", async () => {
      // Arrange
      mockKasUmumRepo.listBkuRows.mockResolvedValue([]);
      mockKasUmumRepo.getBkuSummary.mockResolvedValue({
        total_pemasukan: 0,
        total_pengeluaran: 0,
        total_netto: 0,
      });

      // Act
      await kasUmumService.getBku({ month: '2025-01' });

      // Assert
      expect(mockKasUmumRepo.listBkuRows).toHaveBeenCalledWith({
        monthDate: '2025-01-01',
        yearDate: undefined,
      });
    });

    it("should throw error if month is not provided", async () => {
      // Act & Assert
      await expect(kasUmumService.getBku({})).rejects.toEqual({
        status: 400,
        error: "period_required",
        hint: "Gunakan year=YYYY atau month=YYYY-MM / YYYY-MM-DD",
      });
    });

    it("should filter by rabId if provided", async () => {
      // Arrange
      mockKasUmumRepo.listBkuRows.mockResolvedValue([]);
      mockKasUmumRepo.getBkuSummary.mockResolvedValue({
        total_pemasukan: 0,
        total_pengeluaran: 0,
        total_netto: 0,
      });

      // Act
      await kasUmumService.getBku({ month: '2025-01', rabId: 1 });

      // Assert
      expect(mockKasUmumRepo.listBkuRows).toHaveBeenCalledWith({
        monthDate: '2025-01-01',
        yearDate: undefined,
      });
    });

    it("should filter by rkkId if provided", async () => {
      // Arrange
      mockKasUmumRepo.listBkuRows.mockResolvedValue([]);
      mockKasUmumRepo.getBkuSummary.mockResolvedValue({
        total_pemasukan: 0,
        total_pengeluaran: 0,
        total_netto: 0,
      });

      // Act
      await kasUmumService.getBku({ month: '2025-01', rkkId: 2 });

      // Assert
      expect(mockKasUmumRepo.listBkuRows).toHaveBeenCalledWith({
        monthDate: '2025-01-01',
        yearDate: undefined,
      });
    });
  });

  describe("getRAB", () => {
    it("should return list of RAB", async () => {
      // Arrange
      const mockRAB = [
        { id: 1, nama: 'RAB 2025', tahun: 2025 },
        { id: 2, nama: 'RAB 2024', tahun: 2024 },
      ];
      mockKasUmumRepo.listRAB.mockResolvedValue(mockRAB);

      // Act
      const result = await kasUmumService.getRAB();

      // Assert
      expect(result).toEqual(mockRAB);
      expect(mockKasUmumRepo.listRAB).toHaveBeenCalled();
    });
  });

  describe("getBidang", () => {
    it("should return list of bidang", async () => {
      // Arrange
      const mockBidang = [
        { id: 1, full_code: '1.1', uraian: 'Bidang Penyelenggaraan' },
        { id: 2, full_code: '1.2', uraian: 'Bidang Pelaksanaan' },
      ];
      mockKasUmumRepo.listBidang.mockResolvedValue(mockBidang);

      // Act
      const result = await kasUmumService.getBidang();

      // Assert
      expect(result).toEqual(mockBidang);
      expect(mockKasUmumRepo.listBidang).toHaveBeenCalled();
    });
  });

  describe("getSubBidang", () => {
    it("should return list of sub bidang for valid bidangId", async () => {
      // Arrange
      const mockSubBidang = [
        { id: 3, full_code: '1.1.1', uraian: 'Sub Bidang A' },
        { id: 4, full_code: '1.1.2', uraian: 'Sub Bidang B' },
      ];
      mockKasUmumRepo.listSubBidang.mockResolvedValue(mockSubBidang);

      // Act
      const result = await kasUmumService.getSubBidang(1);

      // Assert
      expect(result).toEqual(mockSubBidang);
      expect(mockKasUmumRepo.listSubBidang).toHaveBeenCalledWith(1);
    });

    it("should throw error if bidangId is not provided", async () => {
      // Act & Assert
      await expect(kasUmumService.getSubBidang()).rejects.toEqual({
        status: 400,
        error: "bidangId_required",
      });
    });
  });

  describe("getKegiatan", () => {
    it("should return list of kegiatan for valid subBidangId", async () => {
      // Arrange
      const mockKegiatan = [
        { id: 5, full_code: '1.1.1.01', uraian: 'Kegiatan 1' },
        { id: 6, full_code: '1.1.1.02', uraian: 'Kegiatan 2' },
      ];
      mockKasUmumRepo.listKegiatan.mockResolvedValue(mockKegiatan);

      // Act
      const result = await kasUmumService.getKegiatan(3);

      // Assert
      expect(result).toEqual(mockKegiatan);
      expect(mockKasUmumRepo.listKegiatan).toHaveBeenCalledWith(3);
    });

    it("should throw error if subBidangId is not provided", async () => {
      // Act & Assert
      await expect(kasUmumService.getKegiatan()).rejects.toEqual({
        status: 400,
        error: "subBidangId_required",
      });
    });
  });

  describe("createBku", () => {
    const validPayload = {
      tanggal: '2025-01-15',
      rab_id: 1,
      kode_ekonomi_id: 10,
      bidang_id: 1,
      sub_bidang_id: 2,
      kegiatan_id: 5,
      uraian: 'Penerimaan ADD',
      pemasukan: '1000000',
      pengeluaran: '0',
      nomor_bukti: 'BKT-001',
    };

    it("should create BKU entry successfully with pemasukan", async () => {
      // Arrange
      const mockCreatedBku = {
        id: 100,
        tanggal: '2025-01-15',
        rab_id: 1,
        kode_ekonomi_id: 10,
        kode_fungsi_id: 5,
        uraian: 'Penerimaan ADD',
        penerimaan: 1000000,
        pengeluaran: 0,
        no_bukti: 'BKT-001',
        saldo_after: 1000000,
      };
      mockKasUmumRepo.insertBku.mockResolvedValue(mockCreatedBku);

      // Act
      const result = await kasUmumService.createBku(validPayload);

      // Assert
      expect(result).toEqual({
        message: 'Data Kas Umum berhasil ditambahkan',
        data: mockCreatedBku,
      });
      expect(mockKasUmumRepo.insertBku).toHaveBeenCalledWith({
        tanggal: '2025-01-15',
        rab_id: 1,
        kode_ekonomi_id: 10,
        kode_fungsi_id: 5,
        uraian: 'Penerimaan ADD',
        penerimaan: 1000000,
        pengeluaran: 0,
        no_bukti: 'BKT-001',
      });
    });

    it("should create BKU entry successfully with pengeluaran", async () => {
      // Arrange
      const payload = {
        ...validPayload,
        pemasukan: '0',
        pengeluaran: '500000',
      };
      const mockCreatedBku = {
        id: 101,
        penerimaan: 0,
        pengeluaran: 500000,
        saldo_after: 500000,
      };
      mockKasUmumRepo.insertBku.mockResolvedValue(mockCreatedBku);

      // Act
      const result = await kasUmumService.createBku(payload);

      // Assert
      expect(result.data.pengeluaran).toBe(500000);
      expect(mockKasUmumRepo.insertBku).toHaveBeenCalledWith(
        expect.objectContaining({
          penerimaan: 0,
          pengeluaran: 500000,
        })
      );
    });

    it("should throw error if tanggal is not provided", async () => {
      // Arrange
      const payload = { ...validPayload, tanggal: undefined };

      // Act & Assert
      await expect(kasUmumService.createBku(payload)).rejects.toEqual({
        status: 400,
        error: "tanggal_required",
        hint: "Format: YYYY-MM-DD",
      });
    });

    it("should throw error if rab_id is not provided", async () => {
      // Arrange
      const payload = { ...validPayload, rab_id: undefined };

      // Act & Assert
      await expect(kasUmumService.createBku(payload)).rejects.toEqual({
        status: 400,
        error: "rab_id_required",
        hint: "RAB ID tidak ditemukan",
      });
    });

    it("should throw error if kode_ekonomi_id is not provided", async () => {
      // Arrange
      const payload = { ...validPayload, kode_ekonomi_id: undefined };

      // Act & Assert
      await expect(kasUmumService.createBku(payload)).rejects.toEqual({
        status: 400,
        error: "kode_ekonomi_required",
        hint: "Kode Ekonomi harus dipilih",
      });
    });

    it("should throw error if kegiatan_id is not provided", async () => {
      // Arrange
      const payload = { ...validPayload, kegiatan_id: undefined };

      // Act & Assert
      await expect(kasUmumService.createBku(payload)).rejects.toEqual({
        status: 400,
        error: "kegiatan_required",
        hint: "Kegiatan harus dipilih dari dropdown",
      });
    });

    it("should throw error if neither pemasukan nor pengeluaran is provided", async () => {
      // Arrange
      const payload = { ...validPayload, pemasukan: '0', pengeluaran: '0' };

      // Act & Assert
      await expect(kasUmumService.createBku(payload)).rejects.toEqual({
        status: 400,
        error: "amount_required",
        hint: "Harus mengisi Pemasukan atau Pengeluaran",
      });
    });

    it("should throw error if both pemasukan and pengeluaran are provided", async () => {
      // Arrange
      const payload = { ...validPayload, pemasukan: '1000000', pengeluaran: '500000' };

      // Act & Assert
      await expect(kasUmumService.createBku(payload)).rejects.toEqual({
        status: 400,
        error: "amount_conflict",
        hint: "Tidak boleh mengisi Pemasukan dan Pengeluaran sekaligus",
      });
    });

    it("should use empty string for uraian if not provided", async () => {
      // Arrange
      const payload = { ...validPayload, uraian: undefined };
      mockKasUmumRepo.insertBku.mockResolvedValue({});

      // Act
      await kasUmumService.createBku(payload);

      // Assert
      expect(mockKasUmumRepo.insertBku).toHaveBeenCalledWith(
        expect.objectContaining({
          uraian: '',
        })
      );
    });

    it("should use null for no_bukti if not provided", async () => {
      // Arrange
      const payload = { ...validPayload, nomor_bukti: undefined };
      mockKasUmumRepo.insertBku.mockResolvedValue({});

      // Act
      await kasUmumService.createBku(payload);

      // Assert
      expect(mockKasUmumRepo.insertBku).toHaveBeenCalledWith(
        expect.objectContaining({
          no_bukti: null,
        })
      );
    });
  });

  describe("getKodeEkonomi", () => {
    it("should return list of kode ekonomi", async () => {
      // Arrange
      const mockKodeEkonomi = [
        { id: 1, full_code: '1.1.1', uraian: 'Pendapatan Asli Desa' },
        { id: 2, full_code: '2.1.1', uraian: 'Belanja Pegawai' },
      ];
      mockKasUmumRepo.listKodeEkonomi.mockResolvedValue(mockKodeEkonomi);

      // Act
      const result = await kasUmumService.getKodeEkonomi();

      // Assert
      expect(result).toEqual(mockKodeEkonomi);
      expect(mockKasUmumRepo.listKodeEkonomi).toHaveBeenCalled();
    });
  });

  describe("getAkun", () => {
    it("should return list of akun", async () => {
      // Arrange
      const mockAkun = [
        { id: 1, full_code: '1', uraian: 'Pendapatan' },
        { id: 2, full_code: '2', uraian: 'Belanja' },
      ];
      mockKasUmumRepo.listAkun.mockResolvedValue(mockAkun);

      // Act
      const result = await kasUmumService.getAkun();

      // Assert
      expect(result).toEqual(mockAkun);
      expect(mockKasUmumRepo.listAkun).toHaveBeenCalled();
    });
  });

  describe("getJenis", () => {
    it("should return list of jenis for valid akunID", async () => {
      // Arrange
      const mockJenis = [
        { id: 3, full_code: '1.1', uraian: 'Pendapatan Asli Desa' },
        { id: 4, full_code: '1.2', uraian: 'Pendapatan Transfer' },
      ];
      mockKasUmumRepo.listJenis.mockResolvedValue(mockJenis);

      // Act
      const result = await kasUmumService.getJenis(1);

      // Assert
      expect(result).toEqual(mockJenis);
      expect(mockKasUmumRepo.listJenis).toHaveBeenCalledWith(1);
    });

    it("should throw error if akunID is not provided", async () => {
      // Act & Assert
      await expect(kasUmumService.getJenis()).rejects.toEqual({
        status: 400,
        error: "akunId_required",
      });
    });
  });

  describe("getObjek", () => {
    it("should return list of objek for valid jenisID", async () => {
      // Arrange
      const mockObjek = [
        { id: 5, full_code: '1.1.1', uraian: 'Hasil Usaha Desa' },
        { id: 6, full_code: '1.1.2', uraian: 'Hasil Aset Desa' },
      ];
      mockKasUmumRepo.listObjek.mockResolvedValue(mockObjek);

      // Act
      const result = await kasUmumService.getObjek(3);

      // Assert
      expect(result).toEqual(mockObjek);
      expect(mockKasUmumRepo.listObjek).toHaveBeenCalledWith(3);
    });

    it("should throw error if jenisID is not provided", async () => {
      // Act & Assert
      await expect(kasUmumService.getObjek()).rejects.toEqual({
        status: 400,
        error: "jenisId_required",
      });
    });
  });

  describe("getLastSaldo", () => {
    it("should return last saldo for specific rabId", async () => {
      // Arrange
      mockKasUmumRepo.getLastSaldo.mockResolvedValue(5000000);

      // Act
      const result = await kasUmumService.getLastSaldo(1);

      // Assert
      expect(result).toEqual({ saldo: 5000000 });
      expect(mockKasUmumRepo.getLastSaldo).toHaveBeenCalledWith(1);
    });

    it("should return last saldo globally if rabId not provided", async () => {
      // Arrange
      mockKasUmumRepo.getLastSaldo.mockResolvedValue(10000000);

      // Act
      const result = await kasUmumService.getLastSaldo();

      // Assert
      expect(result).toEqual({ saldo: 10000000 });
      expect(mockKasUmumRepo.getLastSaldo).toHaveBeenCalledWith(undefined);
    });
  });
});
