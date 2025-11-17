const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/kas-pembantu/kegiatan`;

export async function getKegiatanList(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}?${query}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Gagal mengambil daftar kegiatan");
  return res.json();
}

export async function getKegiatanById(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Kegiatan tidak ditemukan");
  return res.json();
}

export async function createKegiatan(body) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Gagal membuat kegiatan");
  }

  return res.json();
}

export async function updateKegiatan(id, body) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Gagal mengupdate kegiatan");
  }

  return res.json();
}

export async function deleteKegiatan(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Gagal menghapus kegiatan");
  }
}
