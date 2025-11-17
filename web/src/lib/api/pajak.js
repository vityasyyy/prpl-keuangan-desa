const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/kas-pembantu/pajak`;

export async function getPajakList(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}?${query}`, { cache: "no-store" });

  if (!res.ok) throw new Error("Gagal mengambil daftar pajak");
  return res.json();
}

export async function getPajakById(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { cache: "no-store" });

  if (!res.ok) throw new Error("Pajak tidak ditemukan");
  return res.json();
}

export async function createPajak(body) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Gagal membuat pajak");
  }

  return res.json();
}

export async function updatePajak(id, body) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Gagal mengupdate pajak");
  }

  return res.json();
}

export async function deletePajak(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Gagal menghapus pajak");
  }
}
