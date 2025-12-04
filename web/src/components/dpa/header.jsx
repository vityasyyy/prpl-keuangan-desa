import { Plus_Jakarta_Sans } from "next/font/google";
import Button from "@/components/dpa/button";
import { Cross, Download } from "@/components/dpa/icons";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "600"] });

const Header = ({ judul, desa, tahun, downloadHandler, inputHandler }) => {
  return (
    <div className={`${jakarta.className} mb-10 flex justify-between`}>
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold">{judul}</h1>
        <div className="mt-3 text-base text-black">
          <p> Buku {judul}</p>
          <p>
            Desa {desa} Tahun Anggaran {tahun}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-y-1">
        <Button variant="warm" size="md" className="text-sm" onClick={downloadHandler}>
          Unduh File
          <Download />
        </Button>
        <Button variant="peace" size="md" className="text-sm" onClick={inputHandler}>
          Input Data
          <Cross />
        </Button>
      </div>
    </div>
  );
};

export default Header;
