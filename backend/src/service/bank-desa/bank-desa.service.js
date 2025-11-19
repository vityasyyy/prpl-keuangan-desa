const monthNames = [
	'Januari','Februari','Maret','April','Mei','Juni',
	'Juli','Agustus','September','Oktober','November','Desember'
];

const num = (value) => (value == null ? 0 : Number(value));

const formatDateDMY = (value) => {
	const dt = new Date(value);
	const day = String(dt.getUTCDate()).padStart(2, '0');
	const month = String(dt.getUTCMonth() + 1).padStart(2, '0');
	const year = dt.getUTCFullYear();
	return `${day}-${month}-${year}`;
};

export function toIdr(value) {
	const numeric = Number(value || 0);
	return numeric === 0 ? '' : new Intl.NumberFormat('id-ID').format(numeric);
}

function renderC6Html(data, { autoPrint = true } = {}) {
	const { meta, rows, totalsMonth, totalsCum } = data;
	const css = `
		@page { size: A4 landscape; margin: 10mm; }
		* { box-sizing: border-box; }
		body { font-family: 'Times New Roman', Times, serif; font-size: 12px; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
		.sheet { width: 100%; }
		
		/* Header Table */
		table.header-table { width: 100%; border: none; margin-bottom: 20px; }
		table.header-table td { border: none; padding: 2px; vertical-align: top; }
		
		.form-code { font-weight: bold; font-size: 12px; white-space: nowrap; }
		.title-main { font-weight: bold; font-size: 14px; text-decoration: underline; margin-bottom: 5px; }
		.title-sub { font-weight: bold; text-transform: uppercase; }
		
		/* Meta Table (Right side of header) */
		table.meta-table { width: 100%; border: none; font-size: 12px; }
		table.meta-table td { border: none; padding: 1px; }
		
		/* Main Data Table */
		table.main-table { width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid #000; }
		table.main-table th, table.main-table td { border: 1px solid #000 !important; padding: 4px 6px; vertical-align: middle; font-size: 11px; }
		table.main-table th { text-align: center; background-color: #eee !important; font-weight: bold; }
		
		/* Column Widths */
		.col-no { width: 4%; }
		.col-date { width: 10%; }
		.col-uraian { width: 26%; }
		.col-bukti { width: 10%; }
		.col-money { width: 10%; }
		
		.text-center { text-align: center; }
		.text-right { text-align: right; }
		.text-bold { font-weight: bold; }
		.bg-grey { background-color: #eee !important; }
		
		/* Signature Table */
		table.sign-table { width: 100%; border: none; margin-top: 50px; }
		table.sign-table td { border: none; text-align: center; vertical-align: top; padding: 0; }
		.sign-gap { height: 80px; }
		.sign-name { font-weight: bold; text-decoration: underline; }
		
		/* Notes */
		.notes { margin-top: 20px; font-size: 11px; }
		.notes-title { font-weight: bold; margin-bottom: 5px; }
		table.notes-table { width: 100%; border: none; }
		table.notes-table td { border: none; padding: 1px; vertical-align: top; }
	`;

	const headRow = `
		<tr>
			<th rowspan="2" class="col-no">No.</th>
			<th rowspan="2" class="col-date">TANGGAL<br>TRANSAKSI</th>
			<th rowspan="2" class="col-uraian">URAIAN TRANSAKSI</th>
			<th rowspan="2" class="col-bukti">BUKTI<br>TRANSAKSI</th>
			<th colspan="2">PEMASUKAN</th>
			<th colspan="3">PENGELUARAN</th>
			<th rowspan="2" class="col-money">SALDO</th>
		</tr>
		<tr>
			<th class="col-money">SETORAN<br>(Rp.)</th>
			<th class="col-money">BUNGA BANK<br>(Rp.)</th>
			<th class="col-money">PENARIKAN<br>(Rp.)</th>
			<th class="col-money">PAJAK<br>(Rp.)</th>
			<th class="col-money">BIAYA<br>ADMINISTRASI<br>(Rp.)</th>
		</tr>
		<tr class="bg-grey">
			<th class="text-center">1</th>
			<th class="text-center">2</th>
			<th class="text-center">3</th>
			<th class="text-center">4</th>
			<th class="text-center">5</th>
			<th class="text-center">6</th>
			<th class="text-center">7</th>
			<th class="text-center">8</th>
			<th class="text-center">9</th>
			<th class="text-center">10</th>
		</tr>
	`;

	const rowsHtml = rows.map((row) => `
		<tr>
			<td class="text-center">${row.no}</td>
			<td class="text-center">${row.tanggal}</td>
			<td>${row.uraian || ''}</td>
			<td class="text-center">${row.bukti_transaksi || ''}</td>
			<td class="text-right">${toIdr(row.setoran)}</td>
			<td class="text-right">${toIdr(row.penerimaan_bunga)}</td>
			<td class="text-right">${toIdr(row.penarikan)}</td>
			<td class="text-right">${toIdr(row.pajak)}</td>
			<td class="text-right">${toIdr(row.biaya_admin)}</td>
			<td class="text-right">${toIdr(row.saldo)}</td>
		</tr>
	`).join('');

	// Fill empty rows to ensure table looks complete
	const emptyRowsCount = Math.max(0, 10 - rows.length);
	const emptyRowsHtml = Array(emptyRowsCount).fill(0).map(() => `
		<tr>
			<td class="text-center">&nbsp;</td>
			<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
		</tr>
	`).join('');

	const footer = `
		<tr>
			<td colspan="4" class="text-bold text-right">TOTAL TRANSAKSI BULAN INI</td>
			<td class="text-right text-bold">${toIdr(totalsMonth.setoran)}</td>
			<td class="text-right text-bold">${toIdr(totalsMonth.penerimaan_bunga)}</td>
			<td class="text-right text-bold">${toIdr(totalsMonth.penarikan)}</td>
			<td class="text-right text-bold">${toIdr(totalsMonth.pajak)}</td>
			<td class="text-right text-bold">${toIdr(totalsMonth.biaya_admin)}</td>
			<td class="text-right text-bold">${toIdr(totalsMonth.saldo)}</td>
		</tr>
		<tr>
			<td colspan="4" class="text-bold text-right">TOTAL TRANSAKSI KUMULATIF</td>
			<td class="text-right text-bold">${toIdr(totalsCum.setoran)}</td>
			<td class="text-right text-bold">${toIdr(totalsCum.penerimaan_bunga)}</td>
			<td class="text-right text-bold">${toIdr(totalsCum.penarikan)}</td>
			<td class="text-right text-bold">${toIdr(totalsCum.pajak)}</td>
			<td class="text-right text-bold">${toIdr(totalsCum.biaya_admin)}</td>
			<td class="text-right text-bold">${toIdr(totalsCum.saldo)}</td>
		</tr>
	`;

	return `
	<!DOCTYPE html>
	<html>
		<head>
			<meta charset="utf-8">
			<title>C.6 Buku Bank Desa</title>
			<style>${css}</style>
		</head>
		<body>
			<div class="sheet">
				<table class="header-table" width="100%">
					<tr>
						<td width="20%" style="vertical-align: top;">
							<div class="form-code">C.6 BUKU BANK DESA</div>
						</td>
						<td width="45%" style="text-align: center; vertical-align: top;">
							<div class="title-main">BUKU BANK DESA</div>
							<div class="title-sub">DESA ${meta.desa || '....................'}</div>
							<div class="title-sub">KECAMATAN ${meta.kecamatan || '....................'}</div>
							<div class="title-sub">TAHUN ANGGARAN ${meta.tahun}</div>
						</td>
						<td width="35%" style="vertical-align: top;">
							<table class="meta-table" width="100%">
								<tr><td width="120">BULAN</td><td width="10">:</td><td>${monthNames[meta.bulan - 1] || meta.bulan}</td></tr>
								<tr><td>BANK CABANG</td><td>:</td><td>${meta.bankCabang || '....................'}</td></tr>
								<tr><td>REK. NO.</td><td>:</td><td>${meta.rekNo || '....................'}</td></tr>
								<tr><td>KODE REKENING</td><td>:</td><td>${meta.kodeRekening || '....................'}</td></tr>
							</table>
						</td>
					</tr>
				</table>

				<table class="main-table" border="1" cellspacing="0" cellpadding="4" width="100%">
					<thead>${headRow}</thead>
					<tbody>
						${rowsHtml}
						${emptyRowsHtml}
					</tbody>
					<tfoot>${footer}</tfoot>
				</table>

				<table class="sign-table" width="100%">
					<tr>
						<td width="30%">
							<div>MENGETAHUI</div>
							<div>KEPALA DESA,</div>
							<div class="sign-gap"></div>
							<div class="sign-name">( ....................................... )</div>
						</td>
						<td width="40%">&nbsp;</td>
						<td width="30%">
							<div>${meta.desa || '....................'}, tanggal ....................</div>
							<div>BENDAHARA DESA,</div>
							<div class="sign-gap"></div>
							<div class="sign-name">( ....................................... )</div>
						</td>
					</tr>
				</table>

				<div class="notes">
					<div class="notes-title">Cara Pengisian:</div>
					<table class="notes-table" width="100%">
						<tr><td style="width: 60px;">Kolom 1</td><td style="width: 10px;">:</td><td>Diisi dengan nomor urut pemasukan dan pengeluaran dengan Bank</td></tr>
						<tr><td>Kolom 2</td><td>:</td><td>Diisi dengan tanggal transaksi Bank</td></tr>
						<tr><td>Kolom 3</td><td>:</td><td>Diisi dengan uraian transaksi pemasukan dan pengeluaran</td></tr>
						<tr><td>Kolom 4</td><td>:</td><td>Diisi dengan bukti transaksi</td></tr>
						<tr><td>Kolom 5</td><td>:</td><td>Diisi dengan pemasukan jumlah setoran</td></tr>
						<tr><td>Kolom 6</td><td>:</td><td>Diisi dengan pemasukan jumlah bunga bank</td></tr>
						<tr><td>Kolom 7</td><td>:</td><td>Diisi dengan pengeluaran jumlah penarikan</td></tr>
						<tr><td>Kolom 8</td><td>:</td><td>Diisi dengan pengeluaran jumlah pajak</td></tr>
						<tr><td>Kolom 9</td><td>:</td><td>Diisi dengan pengeluaran biaya administrasi</td></tr>
						<tr><td>Kolom 10</td><td>:</td><td>Diisi dengan saldo Bank</td></tr>
					</table>
				</div>
			</div>
			${autoPrint ? '<script>window.addEventListener("load",()=>setTimeout(()=>window.print(),500));</script>' : ''}
		</body>
	</html>`;
}

export async function generateBukuBankPrintHtml(db, { year, month, meta, autoPrint = true }) {
	if (!year || !month) {
		const err = new Error('year and month are required');
		err.status = 400;
		throw err;
	}

	const start = `${year}-${String(month).padStart(2, '0')}-01`;
	const nextMonth = month === 12
		? `${year + 1}-01-01`
		: `${year}-${String(month + 1).padStart(2, '0')}-01`;

	const { rows: before } = await db.query(
		`SELECT setoran, penerimaan_bunga, penarikan, pajak, biaya_admin
		 FROM buku_bank WHERE tanggal < $1`,
		[start]
	);
	const openIn = before.reduce((sum, row) => sum + num(row.setoran) + num(row.penerimaan_bunga), 0);
	const openOut = before.reduce((sum, row) => sum + num(row.penarikan) + num(row.pajak) + num(row.biaya_admin), 0);
	let runningSaldo = openIn - openOut;

	const { rows: tx } = await db.query(
		`SELECT id, tanggal, uraian, bukti_transaksi, setoran, penerimaan_bunga, penarikan, pajak, biaya_admin, created_at
		 FROM buku_bank
		 WHERE tanggal >= $1 AND tanggal < $2
		 ORDER BY tanggal ASC, created_at ASC, id ASC`,
		[start, nextMonth]
	);

	const rows = tx.map((entry, index) => {
		runningSaldo += (num(entry.setoran) + num(entry.penerimaan_bunga))
			- (num(entry.penarikan) + num(entry.pajak) + num(entry.biaya_admin));
		return {
			no: index + 1,
			tanggal: formatDateDMY(entry.tanggal),
			uraian: entry.uraian,
			bukti_transaksi: entry.bukti_transaksi,
			setoran: num(entry.setoran),
			penerimaan_bunga: num(entry.penerimaan_bunga),
			penarikan: num(entry.penarikan),
			pajak: num(entry.pajak),
			biaya_admin: num(entry.biaya_admin),
			saldo: runningSaldo,
		};
	});

	const totalsMonth = rows.reduce((acc, row) => ({
		setoran: acc.setoran + row.setoran,
		penerimaan_bunga: acc.penerimaan_bunga + row.penerimaan_bunga,
		penarikan: acc.penarikan + row.penarikan,
		pajak: acc.pajak + row.pajak,
		biaya_admin: acc.biaya_admin + row.biaya_admin,
		saldo: row.saldo,
	}), { setoran: 0, penerimaan_bunga: 0, penarikan: 0, pajak: 0, biaya_admin: 0, saldo: runningSaldo });

	const { rows: upto } = await db.query(
		`SELECT setoran, penerimaan_bunga, penarikan, pajak, biaya_admin
		 FROM buku_bank WHERE tanggal < $1`,
		[nextMonth]
	);

	const totalsCum = upto.reduce((acc, row) => ({
		setoran: acc.setoran + num(row.setoran),
		penerimaan_bunga: acc.penerimaan_bunga + num(row.penerimaan_bunga),
		penarikan: acc.penarikan + num(row.penarikan),
		pajak: acc.pajak + num(row.pajak),
		biaya_admin: acc.biaya_admin + num(row.biaya_admin),
		saldo: acc.saldo + num(row.setoran) + num(row.penerimaan_bunga)
			- num(row.penarikan) - num(row.pajak) - num(row.biaya_admin),
	}), { setoran: 0, penerimaan_bunga: 0, penarikan: 0, pajak: 0, biaya_admin: 0, saldo: 0 });

	const html = renderC6Html({
		meta: {
			desa: meta?.desa || '',
			kecamatan: meta?.kecamatan || '',
			tahun: year,
			bulan: month,
			bankCabang: meta?.bankCabang || '',
			rekNo: meta?.rekNo || '',
			kodeRekening: meta?.kodeRekening || '',
		},
		rows,
		totalsMonth,
		totalsCum,
	}, { autoPrint });

	return html;
}
