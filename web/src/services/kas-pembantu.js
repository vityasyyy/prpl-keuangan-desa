import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

/**
 * KEGIATAN Service
 */

export async function getKegiatanList(params = {}) {
  const queryParams = new URLSearchParams({
    page: params.page || 1,
    limit: params.limit || 50,
    bulan: params.bulan || "",
    tahun: params.tahun || new Date().getFullYear(),
    type_enum: params.type_enum || "",
    search: params.search || "",
  });

  const query = Array.from(queryParams.entries())
    .filter(([_, value]) => value !== "")
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const endpoint =
    query.length > 0 ? `${API_ENDPOINTS.KEGIATAN_LIST}?${query}` : API_ENDPOINTS.KEGIATAN_LIST;

  return apiGet(endpoint);
}

export async function getKegiatanById(id) {
  return apiGet(API_ENDPOINTS.KEGIATAN_BY_ID(id));
}

export async function createKegiatan(data) {
  return apiPost(API_ENDPOINTS.KEGIATAN_CREATE, data);
}

export async function updateKegiatan(id, data) {
  return apiPut(API_ENDPOINTS.KEGIATAN_UPDATE(id), data);
}

export async function deleteKegiatan(id) {
  return apiDelete(API_ENDPOINTS.KEGIATAN_DELETE(id));
}

/**
 * PANJAR Service
 */

export async function getPanjarList(params = {}) {
  const queryParams = new URLSearchParams({
    page: params.page || 1,
    per_page: params.per_page || 50,
    bku_id: params.bku_id || "",
    from: params.from || "",
    to: params.to || "",
    sort_by: params.sort_by || "tanggal",
    order: params.order || "asc",
  });

  const query = Array.from(queryParams.entries())
    .filter(([_, value]) => value !== "")
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const endpoint =
    query.length > 0 ? `${API_ENDPOINTS.PANJAR_LIST}?${query}` : API_ENDPOINTS.PANJAR_LIST;

  return apiGet(endpoint);
}

export async function getPanjarById(id) {
  return apiGet(API_ENDPOINTS.PANJAR_BY_ID(id));
}

export async function createPanjar(data) {
  return apiPost(API_ENDPOINTS.PANJAR_CREATE, data);
}

export async function updatePanjar(id, data) {
  return apiPut(API_ENDPOINTS.PANJAR_UPDATE(id), data);
}

export async function deletePanjar(id) {
  return apiDelete(API_ENDPOINTS.PANJAR_DELETE(id));
}

/**
 * PAJAK Service
 */

export async function getPajakList(params = {}) {
  const queryParams = new URLSearchParams({
    page: params.page || 1,
    per_page: params.per_page || 50,
    bku_id: params.bku_id || "",
    from: params.from || "",
    to: params.to || "",
    sort_by: params.sort_by || "tanggal",
    order: params.order || "asc",
  });

  const query = Array.from(queryParams.entries())
    .filter(([_, value]) => value !== "")
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const endpoint =
    query.length > 0 ? `${API_ENDPOINTS.PAJAK_LIST}?${query}` : API_ENDPOINTS.PAJAK_LIST;

  return apiGet(endpoint);
}

export async function getPajakById(id) {
  return apiGet(API_ENDPOINTS.PAJAK_BY_ID(id));
}

export async function createPajak(data) {
  return apiPost(API_ENDPOINTS.PAJAK_CREATE, data);
}

export async function updatePajak(id, data) {
  return apiPut(API_ENDPOINTS.PAJAK_UPDATE(id), data);
}

export async function deletePajak(id) {
  return apiDelete(API_ENDPOINTS.PAJAK_DELETE(id));
}

/**
 * CATEGORY Services
 */

export async function getBidang() {
  try {
    const data = await apiGet(`${API_ENDPOINTS.BASE}/categories/bidang`);
    return data.data || [];
  } catch (error) {
    console.error("Error fetching bidang:", error);
    return [];
  }
}

export async function getSubBidang(bidangId) {
  try {
    const data = await apiGet(`${API_ENDPOINTS.BASE}/categories/bidang/${bidangId}/sub-bidang`);
    return data.data || [];
  } catch (error) {
    console.error("Error fetching sub-bidang:", error);
    return [];
  }
}

export async function getKegiatan(subBidangId) {
  try {
    const data = await apiGet(
      `${API_ENDPOINTS.BASE}/categories/sub-bidang/${subBidangId}/kegiatan`
    );
    return data.data || [];
  } catch (error) {
    console.error("Error fetching kegiatan:", error);
    return [];
  }
}
