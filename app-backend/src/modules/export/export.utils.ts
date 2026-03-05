import { ChartConfiguration } from 'chart.js';

export interface ExportStats {
  total: number;
  barcodeTypeDist: Record<string, number>;
  deviceTypeDist: Record<string, number>;
  scansOverTime: {
    labels: string[];
    data: number[];
  };
  dateRange: {
    start: string;
    end: string;
  };
}

export function drawPdfHeader(doc: PDFKit.PDFDocument) {
  doc.rect(0, 0, doc.page.width, 100).fill('#0A1929');
  doc.fillColor('#00D9FF').fontSize(24).text('BARCODY', 50, 30);
  doc.fillColor('#FFFFFF').fontSize(14).text('Scan Export Report', 50, 60);
  doc.fillColor('#000000');
}

export function drawPdfStats(doc: PDFKit.PDFDocument, stats: ExportStats) {
  doc.fontSize(18).text('Summary Statistics', 50, 120);
  doc.fontSize(12).text(`Total Scans: ${stats.total}`, 50, 150);
  doc.text(`Date Range: ${stats.dateRange.start} - ${stats.dateRange.end}`);
}

export function drawPdfFooter(doc: PDFKit.PDFDocument) {
  const pages = doc.bufferedPageRange().count;
  for (let i = 0; i < pages; i++) {
    doc.switchToPage(i);
    doc
      .fontSize(8)
      .fillColor('grey')
      .text(`Page ${i + 1} of ${pages}`, 0, doc.page.height - 30, {
        align: 'center',
      });
  }
}

export function getLineChartConfig(stats: ExportStats, color: string): ChartConfiguration {
  return {
    type: 'line',
    data: {
      labels: stats.scansOverTime.labels,
      datasets: [
        {
          label: 'Scans',
          data: stats.scansOverTime.data,
          borderColor: color,
          backgroundColor: `${color}33`,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        legend: { display: true },
        title: { display: true, text: 'Scans Over Time' },
      },
    },
  };
}

export function getPieChartConfig(stats: ExportStats): ChartConfiguration {
  const colors = [
    '#0080FF',
    '#00D9FF',
    '#FF6B6B',
    '#4ECDC4',
    '#FFE66D',
    '#1A535C',
    '#F7FFF7',
    '#FF6B6B',
    '#FFE66D',
    '#4ECDC4',
  ];

  return {
    type: 'pie',
    data: {
      labels: Object.keys(stats.barcodeTypeDist),
      datasets: [
        {
          data: Object.values(stats.barcodeTypeDist),
          backgroundColor: colors.slice(0, Object.keys(stats.barcodeTypeDist).length),
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        legend: { position: 'right' },
        title: { display: true, text: 'Barcode Type Distribution' },
      },
    },
  };
}
