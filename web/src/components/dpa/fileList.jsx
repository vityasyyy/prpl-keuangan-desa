import Button from "@/components/dpa/button";
import { Eye, Download, Trash } from "@/components/dpa/icons";

const FileList = ({ files, onDelete, onView }) => {
  const handleDownload = (file) => {
    if (!file.file) {
      console.log("Dummy file - download tidak tersedia");
      return;
    }
    const url = URL.createObjectURL(file.file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-6xl rounded-lg border border-gray-300 bg-white p-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">Dokumen Terupload</h2>

      {files.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-500">Belum ada dokumen yang diupload</p>
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between rounded-lg border border-gray-300 bg-white p-4"
            >
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{file.name}</p>
                <p className="text-sm text-gray-500">Diupload pada {file.uploadDate}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="primary" size="sm" onClick={() => onView(file)} title="Lihat">
                  <Eye width={16} height={16} />
                </Button>

                <Button
                  variant="peace"
                  size="sm"
                  onClick={() => handleDownload(file)}
                  title="Download"
                >
                  <Download width={16} height={16} />
                </Button>

                <Button variant="danger" size="sm" onClick={() => onDelete(file.id)} title="Hapus">
                  <Trash width={16} height={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileList;
