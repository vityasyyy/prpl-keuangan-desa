// src/repository/apbd/apbd.repo.test.js
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import createApbdRepo from "./apbd.repo.js";

describe("APBD Repository", () => {
  let db;
  let apbdRepo;

  beforeEach(() => {
    db = {
      query: jest.fn(),
    };
    apbdRepo = createApbdRepo(db);
  });

  describe("initialization", () => {
    let consoleErrorSpy;
    beforeAll(() => {
      // Suppress expected console.error messages from the repo during these tests
      consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    });
    afterAll(() => {
      consoleErrorSpy.mockRestore();
    });
    it("should throw error if db instance is invalid", () => {
      expect(() => createApbdRepo({})).toThrow(
        "Invalid database instance passed to createApbdRepo"
      );
    });

    it("should throw error if db.query is not a function", () => {
      expect(() => createApbdRepo({ query: "not a function" })).toThrow(
        "Invalid database instance passed to createApbdRepo"
      );
    });

    it("should accept db with query function", () => {
      const validDb = { query: jest.fn() };
      expect(() => createApbdRepo(validDb)).not.toThrow();
    });

    it("should accept db.db with query function", () => {
      const validDb = { db: { query: jest.fn() } };
      expect(() => createApbdRepo(validDb)).not.toThrow();
    });
  });

  describe("listApbdesRows", () => {
    it("should return all rows when no filters provided", async () => {
      const mockRows = [
        {
          id: "rincian001",
          apbdes_id: "apbdes_2025",
          tahun: 2025,
          status: "draft",
        },
      ];
      db.query.mockResolvedValue({ rows: mockRows });

      const result = await apbdRepo.listApbdesRows({});
      expect(result).toEqual(mockRows);
      expect(db.query).toHaveBeenCalled();
    });

    it("should filter by id", async () => {
      const mockRows = [
        {
          id: "rincian001",
          apbdes_id: "apbdes_2025",
          tahun: 2025,
          status: "draft",
        },
      ];
      db.query.mockResolvedValue({ rows: mockRows });

      const result = await apbdRepo.listApbdesRows({ id: "rincian001" });
      expect(result).toEqual(mockRows);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("r.id = $1"),
        ["rincian001"]
      );
    });

    it("should filter by tahun", async () => {
      const mockRows = [
        {
          id: "rincian001",
          apbdes_id: "apbdes_2025",
          tahun: 2025,
          status: "draft",
        },
      ];
      db.query.mockResolvedValue({ rows: mockRows });

      const result = await apbdRepo.listApbdesRows({ tahun: 2025 });
      expect(result).toEqual(mockRows);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("a.tahun = $1"),
        [2025]
      );
    });

    it("should filter by status", async () => {
      const mockRows = [
        {
          id: "rincian001",
          apbdes_id: "apbdes_2025",
          tahun: 2025,
          status: "posted",
        },
      ];
      db.query.mockResolvedValue({ rows: mockRows });

      const result = await apbdRepo.listApbdesRows({ status: "posted" });
      expect(result).toEqual(mockRows);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("r.status = $1"),
        ["posted"]
      );
    });

    it("should filter by multiple conditions", async () => {
      const mockRows = [
        {
          id: "rincian001",
          apbdes_id: "apbdes_2025",
          tahun: 2025,
          status: "draft",
        },
      ];
      db.query.mockResolvedValue({ rows: mockRows });

      const result = await apbdRepo.listApbdesRows({
        tahun: 2025,
        status: "draft",
      });
      expect(result).toEqual(mockRows);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("a.tahun = $1 AND r.status = $2"),
        [2025, "draft"]
      );
    });
  });

  describe("kode fungsi list methods", () => {
    it("listKodeFungsi should return all kode fungsi", async () => {
      const mockRows = [
        {
          id: "kf001",
          full_code: "1 1 1",
          uraian: "Pendidikan",
          level: "bidang",
        },
      ];
      db.query.mockResolvedValue({ rows: mockRows });

      const result = await apbdRepo.listKodeFungsi();
      expect(result).toEqual(mockRows);
    });

    it("listBidang should return bidang level kode fungsi", async () => {
      db.query.mockResolvedValue({
        rows: [{ id: "kf001", full_code: "1", uraian: "Pendidikan" }],
      });

      await apbdRepo.listBidang();
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("level = $1"),
        ["bidang"]
      );
    });

    it("listSubBidang should return sub_bidang level kode fungsi", async () => {
      db.query.mockResolvedValue({
        rows: [{ id: "kf002", full_code: "1 1", uraian: "Pendidikan Dasar" }],
      });

      await apbdRepo.listSubBidang();
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("level = $1"),
        ["sub_bidang"]
      );
    });

    it("listKegiatan should return kegiatan level kode fungsi", async () => {
      db.query.mockResolvedValue({
        rows: [
          { id: "kf003", full_code: "1 1 1", uraian: "Program Pendidikan" },
        ],
      });

      await apbdRepo.listKegiatan();
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("level = $1"),
        ["kegiatan"]
      );
    });
  });

  describe("kode ekonomi list methods", () => {
    it("listKodeEkonomi should return all kode ekonomi", async () => {
      db.query.mockResolvedValue({
        rows: [{ id: "ke001", full_code: "4", uraian: "Belanja", level: "akun" }],
      });

      await apbdRepo.listKodeEkonomi();
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining("kode_ekonomi"));
    });

    it("listAkun should return akun level kode ekonomi", async () => {
      const mockRows = [{ id: "ke001", full_code: "4", uraian: "Belanja" }];
      db.query.mockResolvedValue({ rows: mockRows });

      const result = await apbdRepo.listAkun();
      expect(result).toEqual(mockRows);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("level = 'akun'")
      );
    });

    it("listKelompok should return kelompok level kode ekonomi", async () => {
      db.query.mockResolvedValue({
        rows: [{ id: "ke002", full_code: "4 1", uraian: "Belanja Operasional" }],
      });

      await apbdRepo.listKelompok();
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("level = $1"),
        ["kelompok"]
      );
    });

    it("listJenis should return jenis level kode ekonomi", async () => {
      db.query.mockResolvedValue({
        rows: [{ id: "ke003", full_code: "4 1 1", uraian: "Gaji dan Tunjangan" }],
      });

      await apbdRepo.listJenis();
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("level = $1"),
        ["jenis"]
      );
    });

    it("listObjek should return objek level kode ekonomi", async () => {
      db.query.mockResolvedValue({
        rows: [{ id: "ke004", full_code: "4 1 1 1", uraian: "Gaji Pokok" }],
      });

      await apbdRepo.listObjek();
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("level = $1"),
        ["objek"]
      );
    });
  });

  describe("APBD draft management", () => {
    it("createApbdesDraft should create new draft with correct ID format", async () => {
      const mockApbdes = {
        id: "apbdes_2025",
        tahun: 2025,
        status: "draft",
      };
      db.query.mockResolvedValue({ rows: [mockApbdes] });

      const result = await apbdRepo.createApbdesDraft(2025);
      expect(result).toEqual(mockApbdes);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO apbdes"),
        ["apbdes_2025", 2025]
      );
    });

    it("getDraftApbdesByYear should return draft apbdes for given year", async () => {
      const mockApbdes = {
        id: "apbdes_2025",
        tahun: 2025,
        status: "draft",
      };
      db.query.mockResolvedValue({ rows: [mockApbdes] });

      const result = await apbdRepo.getDraftApbdesByYear(2025);
      expect(result).toEqual(mockApbdes);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("status = 'draft'"),
        [2025]
      );
    });

    it("getDraftApbdesByYear should return undefined if no draft found", async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await apbdRepo.getDraftApbdesByYear(2025);
      expect(result).toBeUndefined();
    });
  });

  describe("APBD rincian management", () => {
    it("createApbdesRincian should create rincian with auto-generated ID", async () => {
      // Mock generateSequentialId behavior
      db.query
        .mockResolvedValueOnce({ rows: [] }) // First query for generateSequentialId
        .mockResolvedValueOnce({ rows: [] }) // Check if ID exists
        .mockResolvedValueOnce({
          rows: [
            {
              id: "rincian001",
              kode_fungsi_id: "kf001",
              kode_ekonomi_id: "ke001",
              jumlah_anggaran: 1000000,
              sumber_dana: "APBD",
              apbdes_id: "apbdes_2025",
            },
          ],
        }); // Final INSERT

      const result = await apbdRepo.createApbdesRincian({
        kode_fungsi_id: "kf001",
        kode_ekonomi_id: "ke001",
        jumlah_anggaran: 1000000,
        sumber_dana: "APBD",
        apbdes_id: "apbdes_2025",
      });

      expect(result).toHaveProperty("id");
      expect(result.jumlah_anggaran).toBe(1000000);
      expect(db.query).toHaveBeenCalled();
    });

    it("getDraftApbdesList should return all draft rincian", async () => {
      const mockRincian = [
        {
          id: "rincian001",
          apbdes_id: "apbdes_2025",
          tahun: 2025,
          status: "draft",
          jumlah_anggaran: 1000000,
        },
      ];
      db.query.mockResolvedValue({ rows: mockRincian });

      const result = await apbdRepo.getDraftApbdesList();
      expect(result).toEqual(mockRincian);
    });

    it("getDraftApbdesById should return rincian by ID", async () => {
      const mockRincian = {
        id: "rincian001",
        apbdes_id: "apbdes_2025",
        tahun: 2025,
        status: "draft",
        jumlah_anggaran: 1000000,
      };
      db.query.mockResolvedValue({ rows: [mockRincian] });

      const result = await apbdRepo.getDraftApbdesById("rincian001");
      expect(result).toEqual(mockRincian);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE r.id = $1"),
        ["rincian001"]
      );
    });

    it("getDraftApbdesById should return undefined if not found", async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await apbdRepo.getDraftApbdesById("nonexistent");
      expect(result).toBeUndefined();
    });

    it("getRincianListForPenjabaran should return rincian list", async () => {
      const mockRincian = [
        { id: "rincian001", apbdes_id: "apbdes_2025", tahun: 2025 },
      ];
      db.query.mockResolvedValue({ rows: mockRincian });

      const result = await apbdRepo.getRincianListForPenjabaran();
      expect(result).toEqual(mockRincian);
    });
  });

  describe("APBD rincian update and delete", () => {
    it("updateDraftApbdesItem should update rincian fields", async () => {
      const updatedRincian = {
        id: "rincian001",
        kode_ekonomi_id: "ke002",
        jumlah_anggaran: 2000000,
      };
      db.query.mockResolvedValue({ rows: [updatedRincian] });

      const result = await apbdRepo.updateDraftApbdesItem("rincian001", {
        kode_ekonomi_id: "ke002",
        jumlah_anggaran: 2000000,
      });

      expect(result).toEqual(updatedRincian);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE apbdes_rincian"),
        expect.arrayContaining([2000000, "rincian001"])
      );
    });

    it("updateDraftApbdesItem should skip null or undefined values", async () => {
      const mockRincian = { id: "rincian001", jumlah_anggaran: 1000000 };
      db.query.mockResolvedValue({ rows: [mockRincian] });

      await apbdRepo.updateDraftApbdesItem("rincian001", {
        kode_ekonomi_id: null,
        jumlah_anggaran: 2000000,
      });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("jumlah_anggaran = $1"),
        expect.not.stringContaining("kode_ekonomi_id")
      );
    });

    it("updateDraftApbdesItem should return existing record if no fields to update", async () => {
      const mockRincian = { id: "rincian001", jumlah_anggaran: 1000000 };
      db.query.mockResolvedValue({ rows: [mockRincian] });

      const result = await apbdRepo.updateDraftApbdesItem("rincian001", {
        kode_ekonomi_id: null,
      });

      expect(result).toEqual(mockRincian);
    });

    it("deleteDraftApbdesItem should delete rincian", async () => {
      const deletedRincian = {
        id: "rincian001",
        jumlah_anggaran: 1000000,
      };
      db.query.mockResolvedValue({ rows: [deletedRincian] });

      const result = await apbdRepo.deleteDraftApbdesItem("rincian001");
      expect(result).toEqual(deletedRincian);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM apbdes_rincian"),
        ["rincian001"]
      );
    });
  });

  describe("APBD posting and status", () => {
    it("postDraftApbdes should update apbdes status to posted", async () => {
      db.query.mockResolvedValue({});

      await apbdRepo.postDraftApbdes("apbdes_2025");
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE apbdes"),
        ["apbdes_2025"]
      );
    });

    it("postRincianByIds should post multiple rincian", async () => {
      const postedRincian = [
        { id: "rincian001", status: "posted" },
        { id: "rincian002", status: "posted" },
      ];
      db.query.mockResolvedValue({ rows: postedRincian });

      const result = await apbdRepo.postRincianByIds([
        "rincian001",
        "rincian002",
      ]);
      expect(result).toEqual(postedRincian);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE apbdes_rincian"),
        [["rincian001", "rincian002"]]
      );
    });

    it("postRincianByIds should return empty array if no IDs provided", async () => {
      const result = await apbdRepo.postRincianByIds([]);
      expect(result).toEqual([]);
      expect(db.query).not.toHaveBeenCalled();
    });

    it("postRincianByIds should return empty array if null provided", async () => {
      const result = await apbdRepo.postRincianByIds(null);
      expect(result).toEqual([]);
      expect(db.query).not.toHaveBeenCalled();
    });

    it("getApbdesStatus should return apbdes status", async () => {
      db.query.mockResolvedValue({
        rows: [{ apbdes_id: "apbdes_2025", apbdes_status: "draft" }],
      });

      const result = await apbdRepo.getApbdesStatus("apbdes_2025");
      expect(result).toBe("draft");
    });

    it("getApbdesStatus should return null if not found", async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await apbdRepo.getApbdesStatus("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("APBD summary", () => {
    it("getDraftApbdesSummary should return summary by akun", async () => {
      db.query.mockResolvedValue({
        rows: [
          { uraian: "Belanja", total_anggaran: "5000000" },
          { uraian: "Pendapatan", total_anggaran: "3000000" },
        ],
      });

      const result = await apbdRepo.getDraftApbdesSummary();
      expect(result).toEqual({
        Belanja: 5000000,
        Pendapatan: 3000000,
      });
    });

    it("getDraftApbdesSummary should handle empty results", async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await apbdRepo.getDraftApbdesSummary();
      expect(result).toEqual({});
    });
  });

  describe("APBD penjabaran management", () => {
    it("createApbdesRincianPenjabaran should create penjabaran", async () => {
      db.query
        .mockResolvedValueOnce({ rows: [] }) // For generateSequentialId
        .mockResolvedValueOnce({ rows: [] }) // Check if ID exists
        .mockResolvedValueOnce({
          rows: [
            {
              id: "penjabaran001",
              rincian_id: "rincian001",
              kode_fungsi_id: "kf001",
              volume: 100,
              satuan: "unit",
              jumlah_anggaran: 1000000,
            },
          ],
        }); // INSERT

      const result = await apbdRepo.createApbdesRincianPenjabaran({
        rincian_id: "rincian001",
        kode_fungsi_id: "kf001",
        volume: 100,
        satuan: "unit",
        jumlah_anggaran: 1000000,
      });

      expect(result).toHaveProperty("id");
      expect(result.rincian_id).toBe("rincian001");
    });

    it("getDraftPenjabaranApbdesList should return all penjabaran", async () => {
      const mockPenjabaran = [
        {
          id: "penjabaran001",
          rincian_id: "rincian001",
          volume: 100,
          satuan: "unit",
        },
      ];
      db.query.mockResolvedValue({ rows: mockPenjabaran });

      const result = await apbdRepo.getDraftPenjabaranApbdesList();
      expect(result).toEqual(mockPenjabaran);
    });

    it("getDraftPenjabaranApbdesById should return penjabaran by ID", async () => {
      const mockPenjabaran = {
        penjabaran_id: "penjabaran001",
        rincian_id: "rincian001",
        volume: 100,
        satuan: "unit",
      };
      db.query.mockResolvedValue({ rows: [mockPenjabaran] });

      const result = await apbdRepo.getDraftPenjabaranApbdesById("penjabaran001");
      expect(result).toEqual(mockPenjabaran);
    });

    it("getDraftPenjabaranByRincianId should return penjabaran with details", async () => {
      const mockPenjabaran = [
        {
          id: "penjabaran001",
          rincian_id: "rincian001",
          kode_fungsi_full_code: "1 1 1",
          kode_ekonomi_full_code: "4 1 1 1",
          volume: 100,
          satuan: "unit",
        },
      ];
      db.query.mockResolvedValue({ rows: mockPenjabaran });

      const result = await apbdRepo.getDraftPenjabaranByRincianId("rincian001");
      expect(result).toEqual(mockPenjabaran);
    });

    it("getDraftPenjabaranByRincianId should return empty array if not found", async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await apbdRepo.getDraftPenjabaranByRincianId("rincian001");
      expect(result).toEqual([]);
    });
  });

  describe("APBD penjabaran update and delete", () => {
    it("updatePenjabaranApbdesItem should update penjabaran fields", async () => {
      const updatedPenjabaran = {
        id: "penjabaran001",
        volume: 150,
        jumlah_anggaran: 1500000,
      };
      db.query.mockResolvedValue({ rows: [updatedPenjabaran] });

      const result = await apbdRepo.updatePenjabaranApbdesItem(
        "penjabaran001",
        { volume: 150, jumlah_anggaran: 1500000 }
      );

      expect(result).toEqual(updatedPenjabaran);
    });

    it("deletePenjabaranApbdesItem should delete penjabaran", async () => {
      const deletedPenjabaran = {
        id: "penjabaran001",
        rincian_id: "rincian001",
      };
      db.query.mockResolvedValue({ rows: [deletedPenjabaran] });

      const result = await apbdRepo.deletePenjabaranApbdesItem("penjabaran001");
      expect(result).toEqual(deletedPenjabaran);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM apbdes_rincian_penjabaran"),
        ["penjabaran001"]
      );
    });
  });

  describe("APBD penjabaran posting and summary", () => {
    it("postDraftPenjabaranApbdes should post penjabaran", async () => {
      db.query.mockResolvedValue({});

      await apbdRepo.postDraftPenjabaranApbdes("penjabaran001");
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE apbdes_rincian_penjabaran"),
        ["penjabaran001"]
      );
    });

    it("getDraftPenjabaranApbdesSummary should return penjabaran summary", async () => {
      db.query.mockResolvedValue({
        rows: [
          { uraian: "Belanja Operasional", total_anggaran: "5000000" },
        ],
      });

      const result = await apbdRepo.getDraftPenjabaranApbdesSummary();
      expect(result).toEqual({
        "Belanja Operasional": 5000000,
      });
    });
  });

  describe("helper methods", () => {
    it("getApbdesIdByRincianId should return apbdes_id", async () => {
      db.query.mockResolvedValue({
        rows: [{ apbdes_id: "apbdes_2025" }],
      });

      const result = await apbdRepo.getApbdesIdByRincianId("rincian001");
      expect(result).toBe("apbdes_2025");
    });

    it("getApbdesIdByRincianId should return null if not found", async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await apbdRepo.getApbdesIdByRincianId("rincian001");
      expect(result).toBeNull();
    });

    it("recalculateDraftApbdesTotals should calculate totals by akun", async () => {
      db.query.mockResolvedValue({
        rows: [
          { uraian: "Belanja", total: "5000000" },
          { uraian: "Pendapatan", total: "3000000" },
        ],
      });

      const result = await apbdRepo.recalculateDraftApbdesTotals("apbdes_2025");
      expect(result).toHaveLength(2);
      expect(result[0].uraian).toBe("Belanja");
    });
  });

  describe("getKodeFungsiDetailsByFullCode", () => {
    it("should get bidang details", async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ id: "kf001", uraian: "Pendidikan" }],
      });

      await apbdRepo.getKodeFungsiDetailsByFullCode("1");
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("level = 'bidang'"),
        ["1"]
      );
    });

    it("should get bidang, sub_bidang, and kegiatan details", async () => {
      db.query
        .mockResolvedValueOnce({
          rows: [{ id: "kf001", uraian: "Pendidikan" }],
        })
        .mockResolvedValueOnce({
          rows: [{ id: "kf002", uraian: "Pendidikan Dasar" }],
        })
        .mockResolvedValueOnce({
          rows: [{ id: "kf003", uraian: "Program Pendidikan" }],
        });

      const result = await apbdRepo.getKodeFungsiDetailsByFullCode("1 1 1");
      expect(result).toHaveProperty("bidang");
      expect(result).toHaveProperty("subBidang");
      expect(result).toHaveProperty("kegiatan");
    });
  });

  describe("getKodeEkonomiDetailsByFullCode", () => {
    it("should get akun details", async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ id: "ke001", uraian: "Belanja" }],
      });

      await apbdRepo.getKodeEkonomiDetailsByFullCode("4");
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("level = 'akun'"),
        ["4"]
      );
    });

    it("should get all levels of kode ekonomi", async () => {
      db.query
        .mockResolvedValueOnce({
          rows: [{ id: "ke001", uraian: "Belanja" }],
        })
        .mockResolvedValueOnce({
          rows: [{ id: "ke002", uraian: "Belanja Operasional" }],
        })
        .mockResolvedValueOnce({
          rows: [{ id: "ke003", uraian: "Gaji dan Tunjangan" }],
        })
        .mockResolvedValueOnce({
          rows: [{ id: "ke004", uraian: "Gaji Pokok" }],
        });

      const result = await apbdRepo.getKodeEkonomiDetailsByFullCode("4 1 1 01");
      expect(result).toHaveProperty("akun");
      expect(result).toHaveProperty("kelompok");
      expect(result).toHaveProperty("jenis");
      expect(result).toHaveProperty("objek");
    });
  });

  describe("full code to ID conversion", () => {
    it("getKodeEkonomiIdByFullCode should return id", async () => {
      db.query.mockResolvedValue({
        rows: [{ id: "ke001" }],
      });

      const result = await apbdRepo.getKodeEkonomiIdByFullCode("4");
      expect(result).toBe("ke001");
    });

    it("getKodeEkonomiIdByFullCode should return null if not found", async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await apbdRepo.getKodeEkonomiIdByFullCode("99");
      expect(result).toBeNull();
    });

    it("getKodeFungsiIdByFullCode should return id", async () => {
      db.query.mockResolvedValue({
        rows: [{ id: "kf001" }],
      });

      const result = await apbdRepo.getKodeFungsiIdByFullCode("1");
      expect(result).toBe("kf001");
    });

    it("getKodeFungsiIdByFullCode should return null if not found", async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await apbdRepo.getKodeFungsiIdByFullCode("99");
      expect(result).toBeNull();
    });

    it("getIdByFullCode should normalize full_code with spaces", async () => {
      db.query.mockResolvedValue({ rows: [{ id: "ke001" }] });

      await apbdRepo.getKodeEkonomiIdByFullCode("4  1  1  01");
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("full_code = $1"),
        ["4 1 1 01"]
      );
    });

    it("getIdByFullCode should return null if fullCode is null", async () => {
      const result = await apbdRepo.getKodeEkonomiIdByFullCode(null);
      expect(result).toBeNull();
    });
  });

  describe("error handling", () => {
    it("should handle database query errors", async () => {
      db.query.mockRejectedValue(new Error("Database error"));

      await expect(apbdRepo.listKodeFungsi()).rejects.toThrow("Database error");
    });

    it("should handle query errors in createApbdesDraft", async () => {
      db.query.mockRejectedValue(new Error("Insert failed"));

      await expect(apbdRepo.createApbdesDraft(2025)).rejects.toThrow(
        "Insert failed"
      );
    });

    it("should handle query errors in getDraftApbdesById", async () => {
      db.query.mockRejectedValue(new Error("Query failed"));

      await expect(apbdRepo.getDraftApbdesById("rincian001")).rejects.toThrow(
        "Query failed"
      );
    });
  });
});
