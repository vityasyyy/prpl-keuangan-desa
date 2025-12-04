export default function createRabService(rabRepo) {
  async function getRAByearService() {
    try {
      const years = await rabRepo.getRAByear();
      return years.map((row) => ({
        tahun: parseInt(row.tahun),
        label: `Tahun ${parseInt(row.tahun)}`,
      }));
    } catch (err) {
      console.error("SERVICE ERROR getRABYearService:", err);
      throw new Error("Gagal mengambil data tahun RAB");
    }
  }

  async function getRABbyYearService(year) {
    if (!year || isNaN(year)) {
      throw new Error("Tahun harus diisi dan berupa angka");
    }
    try {
      const rabList = await rabRepo.getRABbyYear(year);

      // Transform data untuk response yang lebih clean
      return rabList.map((rab) => ({
        ...rab,
        tahun: parseInt(year),
        total_amount: parseFloat(rab.total_amount || 0),
      }));
    } catch (err) {
      console.error("SERVICE ERROR getRABByYearService:", err);
      throw new Error(`Gagal mengambil data RAB tahun ${year}`);
    }
  }

  async function getRABbyIdService(rabId) {
    if (!rabId) {
      throw new Error("rabId harus diisi");
    }
    try {
      const rab = await rabRepo.getRABbyId(rabId);
      if (!rab) {
        throw new Error(`RAB dengan id ${rabId} tidak ditemukan`);
      }
      // Transform numeric fields
      return {
        ...rab,
        total_amount: parseFloat(rab.total_amount || 0),
      };
    } catch (err) {
      console.error("SERVICE ERROR getRABByIdService:", err);
      if (err.message.includes("tidak ditemukan")) {
        throw err;
      }
      throw new Error("Gagal mengambil data RAB");
    }
  }

  async function createRABService(rabData) {
    const { mulai, selesai, kode_fungsi_id, kode_ekonomi_id, status_rab } =
      rabData;

    // Required fields
    if (!mulai || !selesai || !kode_fungsi_id || !kode_ekonomi_id) {
      throw new Error(
        "Data mulai, selesai, kode_fungsi_id, dan kode_ekonomi_id harus diisi"
      );
    }

    // Date logic
    const startDate = new Date(mulai);
    const endDate = new Date(selesai);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Format tanggal tidak valid");
    }

    if (startDate > endDate) {
      throw new Error("Tanggal selesai tidak boleh sebelum tanggal mulai");
    }

    // Kode rekening
    try {
      const [kodeFungsiExists, kodeEkonomiExists] = await Promise.all([
        rabRepo.getKodeFungsiById(kode_fungsi_id),
        rabRepo.getKodeEkonomiById(kode_ekonomi_id),
      ]);

      if (!kodeFungsiExists) {
        throw new Error(
          `Kode fungsi dengan ID ${kode_fungsi_id} tidak ditemukan`
        );
      }
      if (!kodeEkonomiExists) {
        throw new Error(
          `Kode ekonomi dengan ID ${kode_ekonomi_id} tidak ditemukan`
        );
      }
    } catch (err) {
      // Re-throw validation errors
      throw err;
    }

    // Set defaults
    const rabDataWithDefaults = {
      ...rabData,
      status_rab: status_rab || "belum diajukan",
      total_amount: rabData.total_amount || 0,
    };

    try {
      const createdRAB = await rabRepo.createRAB(rabDataWithDefaults);

      // Transform response
      return {
        ...createdRAB,
        total_amount: parseFloat(createdRAB.total_amount || 0),
        success: true,
        message: "RAB berhasil dibuat",
      };
    } catch (err) {
      console.error("SERVICE ERROR createRABService:", err);
      throw new Error("Gagal membuat RAB. Silakan coba lagi.");
    }
  }

  async function getRABlineService(rabId) {
    if (!rabId) {
      throw new Error("rabId harus diisi");
    }

    try {
      const rabExists = await rabRepo.getRABbyId(rabId);
      if (!rabExists) {
        throw new Error(`RAB dengan id ${rabId} tidak ditemukan`);
      }

      const lines = await rabRepo.getRABline(rabId);
      // Transform numeric fields
      return lines.map((line) => ({
        ...line,
        volume: parseFloat(line.volume || 0),
        harga_satuan: parseFloat(line.harga_satuan || 0),
        jumlah: parseFloat(line.jumlah || 0),
      }));
    } catch (err) {
      console.error("SERVICE ERROR getRABlineService:", err);
      throw new Error("Gagal mengambil data RAB line");
    }
  }

  async function createRABLineService(rabLineData) {
    const { rab_id, uraian, volume, harga_satuan, satuan } = rabLineData;

    // Required fields
    if (
      !rab_id ||
      !uraian ||
      volume === undefined ||
      harga_satuan === undefined ||
      !satuan
    ) {
      throw new Error(
        "Data rab_id, uraian, volume, harga_satuan, dan satuan harus diisi"
      );
    }

    const rabExists = await rabRepo.getRABbyId(rab_id);
    if (!rabExists) {
      throw new Error(`RAB dengan id ${rab_id} tidak ditemukan`);
    }

    if (rabExists.status_rab !== "belum diajukan") {
      throw new Error("Tidak dapat menambah RAB line");
    }
    const volumeNum = parseFloat(volume);
    const hargaSatuanNum = parseFloat(harga_satuan);

    if (isNaN(volumeNum) || volumeNum <= 0) {
      throw new Error("Volume harus berupa angka dan lebih besar dari 0");
    }
    if (isNaN(hargaSatuanNum) || hargaSatuanNum <= 0) {
      throw new Error("Harga satuan harus berupa angka dan lebih besar dari 0");
    }

    // Auto-calculation
    const jumlah = volumeNum * hargaSatuanNum;

    const lineDataWithCalculation = {
      ...rabLineData,
      volume: volumeNum,
      harga_satuan: hargaSatuanNum,
      jumlah: jumlah,
    };

    try {
      const createdLine = await rabRepo.createRABLine(lineDataWithCalculation);

      return {
        ...createdLine,
        volume: parseFloat(createdLine.volume),
        harga_satuan: parseFloat(createdLine.harga_satuan),
        jumlah: parseFloat(createdLine.jumlah),
        success: true,
        message: "RAB line berhasil ditambahkan",
      };
    } catch (err) {
      console.error("SERVICE ERROR createRABLineService:", err);
      throw new Error("Gagal menambahkan RAB line");
    }
  }
  async function updateRABLineService(rabLineId, updateData) {
    const { uraian, volume, harga_satuan, satuan } = updateData;

    // Required fields
    if (!uraian) {
      throw new Error("Uraian harus diisi");
    }
    if (!satuan) {
      throw new Error("Satuan harus diisi");
    }
    try {
      // 1. Dapatkan existing line untuk cek status RAB
      const existingLine = await rabRepo.getRABLineById(rabLineId);
      if (!existingLine) {
        throw new Error(`RAB line dengan id ${rabLineId} tidak ditemukan`);
      }

      // 2. Validasi status RAB (business logic)
      const rabExists = await rabRepo.getRABbyId(existingLine.rab_id);
      if (rabExists.status_rab !== "belum diajukan") {
        throw new Error("Tidak dapat mengubah RAB line");
      }

      // 3. Validasi dan transformasi data numerik
      let calculatedData = { ...updateData };

      if (volume !== undefined || harga_satuan !== undefined) {
        const volumeNum = parseFloat(
          volume !== undefined ? volume : existingLine.volume
        );
        const hargaSatuanNum = parseFloat(
          harga_satuan !== undefined ? harga_satuan : existingLine.harga_satuan
        );

        if (isNaN(volumeNum) || volumeNum <= 0) {
          throw new Error("Volume harus berupa angka dan lebih besar dari 0");
        }
        if (isNaN(hargaSatuanNum) || hargaSatuanNum <= 0) {
          throw new Error(
            "Harga satuan harus berupa angka dan lebih besar dari 0"
          );
        }

        // Auto-calculation
        calculatedData.jumlah = volumeNum * hargaSatuanNum;
        calculatedData.volume = volumeNum;
        calculatedData.harga_satuan = hargaSatuanNum;
      }

      // 4. Panggil repository
      const updatedLine = await rabRepo.updateRABLine(
        rabLineId,
        calculatedData
      );

      // 5. Transform response
      return {
        ...updatedLine,
        volume: parseFloat(updatedLine.volume),
        harga_satuan: parseFloat(updatedLine.harga_satuan),
        jumlah: parseFloat(updatedLine.jumlah),
        message: "RAB line berhasil diupdate",
      };
    } catch (err) {
      console.error("SERVICE ERROR updateRABLineService:", err);
      throw new Error(err.message);
    }
  }

  async function deleteRABLineService(rabLineId) {
    try {
      // 1. Dapatkan existing line untuk cek status RAB
      const existingLine = await rabRepo.getRABLineById(rabLineId);
      if (!existingLine) {
        throw new Error(`RAB line dengan id ${rabLineId} tidak ditemukan`);
      }

      // 2. Validasi status RAB (business logic)
      const rabExists = await rabRepo.getRABbyId(existingLine.rab_id);
      if (rabExists.status_rab !== "belum diajukan") {
        throw new Error("Tidak dapat menghapus RAB line");
      }

      // 3. Panggil repository
      const deletedLine = await rabRepo.deleteRABLine(rabLineId);

      return {
        deleted: deletedLine,
        message: "RAB line berhasil dihapus",
      };
    } catch (err) {
      console.error("SERVICE ERROR deleteRABLineService:", err);
      throw new Error(err.message);
    }
  }
  async function getRABbyStatusService(year, role) {
    //('belum diajukan', 'diajukan', 'terverifikasi', 'tidak terverifikasi', 'disetujui', 'tidak disetujui')

    if (!year) throw new Error("year is required");
    let status = [];
    if (role == "kades") {
      status = ["terverifikasi", "disetujui", "tidak disetujui"];
    } else if (role == "sekretaris_desa") {
      status = [
        "diajukan",
        "terverifikasi",
        "tidak terverifikasi",
        "disetujui",
        "tidak disetujui",
      ];
    } else if (
      role == "kaur_keuangan" ||
      role == "kaur_perencanaan" ||
      role == "kaur_tu_umum" ||
      role == "kasi_pemerintahan" ||
      role == "kasi_kesejahteraan" ||
      role == "kasi_pelayanan"
    ) {
      status = [
        "belum diajukan",
        "diajukan",
        "terverifikasi",
        "tidak terverifikasi",
        "disetujui",
        "tidak disetujui",
      ];
    }
    const rabList = await rabRepo.getRABbyYear(year);
    // Filter only rows whose status is in the list
    const filtered = rabList.filter((rab) => status.includes(rab.status_rab));
    return filtered;
  }
  async function getKodeRekeningBidangService() {
    try {
      const bidangList = await rabRepo.getKodeRekeningBidang();
      return bidangList.map((bidang) => ({
        ...bidang,
        label: `${bidang.kode} - ${bidang.uraian}`,
      }));
    } catch (err) {
      console.error("SERVICE ERROR getKodeRekeningBidangService:", err);
      throw new Error("Gagal mengambil data bidang");
    }
  }
  async function getKodeRekeningSubBidangService(bidangId) {
    if (!bidangId) {
      throw new Error("bidangId harus diisi");
    }

    try {
      const subBidangList = await rabRepo.getKodeRekeningSubBidang(bidangId);
      return subBidangList.map((subBidang) => ({
        ...subBidang,
        label: `${subBidang.kode} - ${subBidang.uraian}`,
      }));
    } catch (err) {
      console.error("SERVICE ERROR getKodeRekeningSubBidangService:", err);
      throw new Error("Gagal mengambil data sub bidang");
    }
  }

  async function getKodeRekeningKegiatanService(subBidangId) {
    if (!subBidangId) {
      throw new Error("subBidangId harus diisi");
    }

    try {
      const kegiatanList = await rabRepo.getKodeRekeningKegiatan(subBidangId);
      return kegiatanList.map((kegiatan) => ({
        ...kegiatan,
        label: `${kegiatan.kode} - ${kegiatan.uraian}`,
      }));
    } catch (err) {
      console.error("SERVICE ERROR getKodeRekeningKegiatanService:", err);
      throw new Error("Gagal mengambil data kegiatan");
    }
  }

  async function getKodeEkonomiAkunService() {
    try {
      const akunList = await rabRepo.getKodeEkonomiAkun();
      return akunList.map((akun) => ({
        ...akun,
        label: `${akun.kode} - ${akun.uraian}`,
      }));
    } catch (err) {
      console.error("SERVICE ERROR getKodeEkonomiAkunService:", err);
      throw new Error("Gagal mengambil data akun");
    }
  }
  async function getKodeEkonomiKelompokService(akunId) {
    if (!akunId) {
      throw new Error("akunId harus diisi");
    }

    try {
      const kelompokList = await rabRepo.getKodeEkonomiKelompok(akunId);
      return kelompokList.map((kelompok) => ({
        ...kelompok,
        label: `${kelompok.kode} - ${kelompok.uraian}`,
      }));
    } catch (err) {
      console.error("SERVICE ERROR getKodeEkonomiKelompokService:", err);
      throw new Error("Gagal mengambil data kelompok");
    }
  }

  async function getKodeEkonomiJenisService(kelompokId) {
    if (!kelompokId) {
      throw new Error("kelompokId harus diisi");
    }

    try {
      const jenisList = await rabRepo.getKodeEkonomiJenis(kelompokId);
      return jenisList.map((jenis) => ({
        ...jenis,
        label: `${jenis.kode} - ${jenis.uraian}`,
      }));
    } catch (err) {
      console.error("SERVICE ERROR getKodeEkonomiJenisService:", err);
      throw new Error("Gagal mengambil data jenis");
    }
  }

  async function getKodeEkonomiObjekService(jenisId) {
    if (!jenisId) {
      throw new Error("jenisId harus diisi");
    }

    try {
      const objekList = await rabRepo.getKodeEkonomiObjek(jenisId);
      return objekList.map((objek) => ({
        ...objek,
        label: `${objek.kode} - ${objek.uraian}`,
      }));
    } catch (err) {
      console.error("SERVICE ERROR getKodeEkonomiObjekService:", err);
      throw new Error("Gagal mengambil data objek");
    }
  }

  async function calculateRABTotalService(rabId) {
    if (!rabId) {
      throw new Error("rabId harus diisi");
    }
    const rabExists = await rabRepo.getRABbyId(rabId);
    if (!rabExists) {
      throw new Error(`RAB dengan id ${rabId} tidak ditemukan`);
    }

    try {
      const lines = await rabRepo.getRABLines(rabId);
      const calculatedTotal = lines.reduce(
        (sum, line) => sum + parseFloat(line.jumlah || 0),
        0
      );
      const storedTotal = parseFloat(rabExists.total_amount || 0);

      return {
        rab_id: rabId,
        calculated_total: calculatedTotal,
        stored_total: storedTotal,
        difference: calculatedTotal - storedTotal,
        line_count: lines.length,
        is_consistent: Math.abs(calculatedTotal - storedTotal) < 0.01, // Tolerance for floating point
        details: lines.map((line) => ({
          id: line.id,
          uraian: line.uraian,
          volume: parseFloat(line.volume),
          harga_satuan: parseFloat(line.harga_satuan),
          jumlah: parseFloat(line.jumlah),
        })),
      };
    } catch (err) {
      console.error("SERVICE ERROR calculateRABTotalService:", err);
      throw new Error("Gagal menghitung total RAB");
    }
  }

  async function validateRABDataService(rabData) {
    const errors = [];
    const warnings = [];

    const { mulai, selesai, kode_fungsi_id, kode_ekonomi_id, total_amount } =
      rabData;

    // Required fields validation
    if (!mulai) errors.push("Tanggal mulai harus diisi");
    if (!selesai) errors.push("Tanggal selesai harus diisi");
    if (!kode_fungsi_id) errors.push("Kode fungsi harus diisi");
    if (!kode_ekonomi_id) errors.push("Kode ekonomi harus diisi");

    // Date validation
    if (mulai && selesai) {
      const startDate = new Date(mulai);
      const endDate = new Date(selesai);

      if (isNaN(startDate.getTime()))
        errors.push("Format tanggal mulai tidak valid");
      if (isNaN(endDate.getTime()))
        errors.push("Format tanggal selesai tidak valid");

      if (startDate > endDate)
        errors.push("Tanggal selesai tidak boleh sebelum tanggal mulai");

      // Warning for long duration
      const durationMonths = (endDate - startDate) / (1000 * 60 * 60 * 24 * 30);
      if (durationMonths > 12) {
        warnings.push("Durasi RAB lebih dari 12 bulan");
      }
    }

    // Amount validation
    if (total_amount !== undefined) {
      const amount = parseFloat(total_amount);
      if (isNaN(amount)) errors.push("Total amount harus berupa angka");
      if (amount < 0) errors.push("Total amount tidak boleh negatif");
    }

    // Kode rekening existence check (async)
    if (kode_fungsi_id && kode_ekonomi_id) {
      try {
        const [kodeFungsiExists, kodeEkonomiExists] = await Promise.all([
          rabRepo.getKodeFungsiById(kode_fungsi_id),
          rabRepo.getKodeEkonomiById(kode_ekonomi_id),
        ]);

        if (!kodeFungsiExists) errors.push("Kode fungsi tidak ditemukan");
        if (!kodeEkonomiExists) errors.push("Kode ekonomi tidak ditemukan");
      } catch (err) {
        errors.push("Gagal memvalidasi kode rekening");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      timestamp: new Date().toISOString(),
    };
  }

  async function updateRABStatusService(rabId, newStatus) {
    if (!rabId) {
      throw new Error("rabId harus diisi");
    }

    const validStatuses = [
      "belum diajukan",
      "diajukan",
      "terverifikasi",
      "tidak terverifikasi",
      "disetujui",
      "tidak disetujui",
    ];

    if (!validStatuses.includes(newStatus)) {
      throw new Error(
        `Status tidak valid. Status harus salah satu dari: ${validStatuses.join(
          ", "
        )}`
      );
    }

    try {
      const rab = await rabRepo.getRABbyId(rabId);
      if (!rab) {
        throw new Error(`RAB dengan id ${rabId} tidak ditemukan`);
      }

      const updatedRAB = await rabRepo.updateRABStatus(rabId, newStatus);

      return {
        ...updatedRAB,
        total_amount: parseFloat(updatedRAB.total_amount || 0),
        success: true,
        message: `Status RAB berhasil diubah menjadi ${newStatus}`,
      };
    } catch (err) {
      console.error("SERVICE ERROR updateRABStatusService:", err);
      if (err.message.includes("tidak ditemukan")) {
        throw err;
      }
      throw new Error("Gagal mengubah status RAB");
    }
  }

  return {
    getRAByearService,
    getRABbyYearService,
    getRABbyIdService,
    createRABService,
    getRABlineService,
    createRABLineService,
    updateRABLineService,
    deleteRABLineService,
    getRABbyStatusService,

    getKodeRekeningBidangService,
    getKodeRekeningSubBidangService,
    getKodeRekeningKegiatanService,
    getKodeEkonomiAkunService,
    getKodeEkonomiKelompokService,
    getKodeEkonomiJenisService,
    getKodeEkonomiObjekService,

    calculateRABTotalService,
    validateRABDataService,
    updateRABStatusService,
  };
}
