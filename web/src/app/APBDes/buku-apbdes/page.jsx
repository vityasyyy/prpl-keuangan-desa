"use client";

import { useEffect, useState } from "react";
import BreadCrumb from "@/components/breadCrumb";

export default function BukuAPBDes() {
  const [data, setData] = useState([]);
  const [penjabaranData, setPenjabaranData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kodeEkonomiMap, setKodeEkonomiMap] = useState({});
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Fetch kode ekonomi untuk mapping ID ke uraian
  const fetchKodeEkonomi = async () => {
    try {
      const res = await fetch(`${API}/kode-ekonomi`);
      if (!res.ok) throw new Error("Failed to fetch kode ekonomi");
      const ekonomiData = await res.json();
      
      const map = {};
      ekonomiData.forEach((item) => {
        map[item.id] = item;
      });
      setKodeEkonomiMap(map);
    } catch (error) {
      console.error("Error fetching kode ekonomi:", error);
    }
  };

  // Fetch data APBDes yang sudah diposting
  const fetchPostedApbdes = async () => {
    setLoading(true);
    try {
      const tahun = new Date().getFullYear();
      
      // Fetch rincian yang sudah diposting
      const rincianRes = await fetch(`${API}?tahun=${tahun}&status=posted`);
      if (!rincianRes.ok) throw new Error("Failed to fetch posted APBDes");
      const result = await rincianRes.json();

      console.log("📊 Posted APBDes data:", result);
      
      setData(result.rows || []);
    } catch (error) {
      console.error("Error fetching posted APBDes:", error);
      alert(`Gagal memuat data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKodeEkonomi();
    fetchPostedApbdes();
  }, []);

  const sanitizeNumber = (val) => {
    if (val === null || val === undefined) return 0;
    const s = String(val).replace(/\s/g, "").replace(/[^0-9.,-]/g, "");
    if (s.indexOf(',') > -1 && s.indexOf('.') > -1) {
      return Number(s.replace(/\./g, '').replace(',', '.')) || 0;
    }
    if (s.indexOf('.') > -1 && s.indexOf(',') === -1) {
      if ((s.match(/\./g) || []).length > 1) {
        return Number(s.replace(/\./g, '')) || 0;
      }
      return Number(s) || 0;
    }
    if (s.indexOf(',') > -1) return Number(s.replace(',', '.')) || 0;
    return Number(s) || 0;
  };

  const buildHierarchy = (kategori) => {
    const allItems = data.filter(item => {
      const ekonomiInfo = kodeEkonomiMap[item.kode_ekonomi_id];
      return ekonomiInfo && ekonomiInfo.uraian.toLowerCase().includes(kategori.toLowerCase());
    });

    const groupedByKode = {};
    allItems.forEach(item => {
      const ekonomiInfo = kodeEkonomiMap[item.kode_ekonomi_id];
      if (ekonomiInfo && ekonomiInfo.full_code) {
        groupedByKode[ekonomiInfo.full_code] = groupedByKode[ekonomiInfo.full_code] || [];
        groupedByKode[ekonomiInfo.full_code].push(item);
      }
    });

    const sortedKodes = Object.keys(groupedByKode).sort((a, b) => {
      const aParts = a.split('.').map(Number);
      const bParts = b.split('.').map(Number);

      for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
        if (aParts[i] !== bParts[i]) {
          return aParts[i] - bParts[i];
        }
      }
      return aParts.length - bParts.length;
    });

    const hierarchy = {};

    sortedKodes.forEach(kode => {
      const itemsAtKode = groupedByKode[kode];
      if (itemsAtKode) {
        itemsAtKode.forEach(item => {
          const itemWithDetails = { ...item };
          itemWithDetails.calculatedTotal = sanitizeNumber(item.jumlah_anggaran || 0);

          const ekonomiInfo = kodeEkonomiMap[item.kode_ekonomi_id];
          const fungsiInfo = kodeEkonomiMap[item.kode_fungsi_id];

          itemWithDetails.displayUraian = fungsiInfo?.uraian || ekonomiInfo?.uraian || "Tidak ada uraian";
          itemWithDetails.level = ekonomiInfo?.level || 'unknown';
          itemWithDetails.kode = ekonomiInfo?.full_code;

          hierarchy[kode] = itemWithDetails;
        });
      }
    });

    const tree = [];
    Object.keys(hierarchy).forEach(kode => {
      const item = hierarchy[kode];
      const kodeParts = kode.split('.');
      if (kodeParts.length > 1) {
        const parentKode = kodeParts.slice(0, kodeParts.length - 1).join('.');
        if (hierarchy[parentKode]) {
          hierarchy[parentKode].children = hierarchy[parentKode].children || [];
          hierarchy[parentKode].children.push(item);
        } else {
          let existingParent = tree.find(node => node.kode === parentKode);
          if (!existingParent) {
            const parentEkonomiInfo = Object.values(kodeEkonomiMap).find(ke => ke.full_code === parentKode);
            existingParent = {
              kode: parentKode,
              displayUraian: (parentEkonomiInfo && parentEkonomiInfo.uraian) || `Kode ${parentKode}`,
              level: (parentEkonomiInfo && parentEkonomiInfo.level) || 'unknown',
              calculatedTotal: 0,
              children: [],
              isConceptual: true,
            };
            tree.push(existingParent);
          }
          existingParent.children.push(item);
        }
      } else {
        tree.push(item);
      }
    });

    const sortTree = (nodes) => {
      nodes.sort((a, b) => {
        const aKode = a.kode || '';
        const bKode = b.kode || '';

        const aParts = aKode.split('.').map(Number);
        const bParts = bKode.split('.').map(Number);
        
        for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
          if (aParts[i] !== bParts[i]) {
            return aParts[i] - bParts[i];
          }
        }
        return aParts.length - bParts.length;
      });
      nodes.forEach(node => {
        if (node.children) {
          sortTree(node.children);
        }
      });
    };
    sortTree(tree);

    const calculateNodeTotals = (nodes) => {
      let sum = 0;
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          node.calculatedTotal = calculateNodeTotals(node.children);
        }
        sum += node.calculatedTotal;
      });
      return sum;
    };
    const totalSum = calculateNodeTotals(tree);

    return { tree, totalSum };
  };

  const total = (kategori) => {
    const { totalSum } = buildHierarchy(kategori);
    return totalSum;
  };

  const getItems = (kategori) => {
    const { tree } = buildHierarchy(kategori);
    return tree;
  };

  const renderBox = (title, kategori) => {
    const items = getItems(kategori);

    const renderTree = (nodes, depth = 0) => {
      const paddingLeft = depth * 8;

      return (
        <div className="divide-y divide-gray-300">
          {nodes.map((node, idx) => (
            <div key={node.id || node.kode || idx}>
              <div
                className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded-md transition"
                style={{ paddingLeft: `${paddingLeft}px` }}
              >
                <div className="flex items-center text-sm text-gray-800 space-x-1">
                  <span>{node.displayUraian}</span>
                </div>
                <div className="text-sm font-light text-black">
                  Rp{node.calculatedTotal.toLocaleString("id-ID", {
                    minimumFractionDigits: 2,
                  })}
                </div>
              </div>

              {node.children && node.children.length > 0 && (
                <div className="pl-4">
                  {renderTree(node.children, depth + 1)}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    };

    return (
      <div className="rounded-2xl bg-white">
        {/* Header */}
        <div className="flex items-center justify-center rounded-full border border-gray-300 px-5 py-3 mb-4 relative w-full min-w-[900px]">
          <h3 className="text-base font-semibold text-[#011829] absolute left-4">
            {title}
          </h3>

          <p className="text-sm text-gray-700 font-medium">
            Total{" "}
            <span className="font-bold text-black">
              Rp{total(kategori).toLocaleString("id-ID", {
                minimumFractionDigits: 2,
              })}
            </span>
          </p>
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[180px]">
          {items.length > 0 ? (
            renderTree(items)
          ) : (
            <div className="text-gray-400 text-sm italic px-2 py-3">
              Tidak ada data {kategori.toLowerCase()}.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-white px-6 md:px-16 py-8">
      {/* Tetap tampil di semua kondisi */}
      <BreadCrumb category="APBDes" title="Buku APBDes" />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          APBDes
        </h1>
        <h3 className="text-sm font-normal text-gray-700 mt-1">
          Anggaran Pendapatan dan Belanja Pemerintah Desa BANGUNTAPAN Tahun
          Anggaran 2025
        </h3>
      </div>

      {/* Kondisi belum ada posting */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Memuat data...</p>
        </div>
      ) : (!data || data.length === 0) ? (
        <div className="flex flex-col items-center justify-center mt-20">
          <p className="text-gray-500 text-lg font-medium">
            ! PPKD belum melakukan posting APBDes !
          </p>
        </div>
      ) : (
        // Jika sudah ada data posting
        <div className="space-y-8">
          {renderBox("Pendapatan", "Pendapatan")}
          {renderBox("Belanja", "Belanja")}
          {renderBox("Pembiayaan", "Pembiayaan")}
        </div>
      )}
    </main>
  );
}
