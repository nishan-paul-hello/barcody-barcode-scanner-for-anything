import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { ExportFormat } from '@/lib/api/types';
import { toast } from 'sonner';

export function useExportData() {
  return useMutation({
    mutationFn: async ({
      format,
      scanIds,
    }: {
      format: ExportFormat;
      scanIds?: string[];
    }) => {
      let data: Blob;
      switch (format) {
        case ExportFormat.CSV:
          data = await api.export.exportCSV(scanIds);
          break;
        case ExportFormat.JSON:
          data = await api.export.exportJSON(scanIds);
          break;
        case ExportFormat.PDF:
          data = await api.export.exportPDF(scanIds);
          break;
        case ExportFormat.EXCEL:
          data = await api.export.exportExcel(scanIds);
          break;
        default:
          throw new Error('Unsupported export format');
      }

      // Download the file
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `scans-export-${new Date().toISOString()}.${format}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast.success('Export completed successfully');
    },
  });
}
