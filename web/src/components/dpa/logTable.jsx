import { Edit } from "@/components/dpa/icons";

const LogTable = ({ logData, onEdit }) => {
  return (
    <div className="mt-20 rounded-2xl border border-[#D4D4D8] bg-white px-4 py-2 shadow-sm">
      <div className="border-[#D4D4D8] px-6 py-4">
        <h2 className="text-lg font-semibold text-[#011829]">Log Pengisian RAB</h2>
      </div>
      <div className="text-center text-sm text-gray-700">
        <div className="flex rounded-t-2xl border-b-1 border-gray-400 bg-gray-100 px-6 py-3 font-medium text-gray-700">
          <div className="w-3/6">Uraian</div>
          <div className="w-1/6">Volume</div>
          <div className="w-1/6">Satuan</div>
          <div className="w-1/6">Harga Satuan</div>
          <div className="w-1/6">Jumlah</div>
          <div className="w-1/6">Aksi</div>
        </div>
        {logData.length > 0 ? (
          logData.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center border-b border-[#D4D4D8] bg-white px-6 py-3 transition hover:bg-gray-100"
            >
              <div className="w-3/6 text-gray-800">{item.uraian}</div>
              <div className="w-1/6 text-gray-700">{item.volume}</div>
              <div className="w-1/6 text-gray-700">{item.satuan}</div>
              <div className="w-1/6 text-gray-800">
                Rp {Number(item.hargaSatuan).toLocaleString("id-ID")}
              </div>
              <div className="w-1/6 font-medium text-[#011829]">
                Rp {Number(item.jumlah).toLocaleString("id-ID")}
              </div>
              <div className="w-1/6 text-gray-700">
                <button className="text-gray-400 hover:text-gray-500" onClick={() => onEdit(item)}>
                  <Edit width={16} height={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-6 text-center text-gray-500 italic">
            Belum ada data yang diinput.
          </div>
        )}
      </div>
    </div>
  );
};

export default LogTable;
