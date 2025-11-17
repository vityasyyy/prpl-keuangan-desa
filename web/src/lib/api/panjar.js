const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/kas-pembantu/panjar`;

export async function getPanjarList(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}?${query}`, { cache: "no-store" });

  if (!res.ok) throw new Error("Gagal mengambil daftar panjar");
  return res.json();
}

export async function getPanjarById(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { cache: "no-store" });

  if (!res.ok) throw new Error("Panjar tidak ditemukan");
  return res.json();
}

export async function createPanjar(body) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Gagal membuat panjar");
  }

  return res.json();
}

export async function updatePanjar(id, body) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Gagal mengupdate panjar");
  }

  return res.json();
}

export async function deletePanjar(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Gagal menghapus panjar");
  }
}
