export default function createRabService(rabRepo) {
  
  async function getRAByearService() {
    const years = await rabRepo.getRAByear();
    if (!years || years.length === 0) {
      throw new Error("No RAB years found");
    }
    return years;
  }

  async function getRABbyYearService(year) {
    if (!year) throw new Error("Year is required");
    const rabList = await rabRepo.getRABbyYear(year);
    return rabList;
  }

  async function getRABService(rab_id) {
    if (!rab_id) throw new Error("RAB ID is required");

    // Example: combine main RAB + lines
    const [rab] = await rabRepo.getRABbyId(rab_id);
    const lines = await rabRepo.getRABline(rab_id);

    return { ...rab, lines };
  }

  async function getRABlineService(rab_id) {
    if (!rab_id) throw new Error("RAB ID is required");
    return await rabRepo.getRABline(rab_id);
  }
  async function getRABbyStatusService(year,role) {
    //('belum diajukan', 'diajukan', 'terverifikasi', 'tidak terverifikasi', 'disetujui', 'tidak disetujui')
    
  if (!year)
    throw new Error("year is required");
  let status=[]
  if(role=='kades')
  { status = ['terverifikasi','disetujui','tidak disetujui']}else
  if(role=='sekretaris_desa')
  { status = ['diajukan','terverifikasi','tidak terverifikasi','disetujui','tidak disetujui']}else
  if(role=='kaur_keuangan'||role=='kaur_perencanaan'||role=='kaur_tu_umum'||role=='kasi_pemerintahan'||role=='kasi_kesejahteraan'||role=='kasi_pelayanan')
  { status =['belum diajukan', 'diajukan', 'terverifikasi', 'tidak terverifikasi', 'disetujui', 'tidak disetujui']}
  const rabList = await rabRepo.getRABbyYear(year);
  // Filter only rows whose status is in the list
  const filtered = rabList.filter(rab => status.includes(rab.status));

  return filtered;
}


  return {
    getRAByearService,
    getRABbyYearService,
    getRABService,
    getRABlineService,
    getRABbyStatusService
  };
}
