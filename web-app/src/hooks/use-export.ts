import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { ExportFormat, type PaginationParams } from '@/lib/api/types';
import { toast } from 'sonner';

export function useExportData() {
  return useMutation({
    mutationFn: async ({
      format,
      filters,
      onProgress,
    }: {
      format: ExportFormat;
      filters?: PaginationParams;
      onProgress?: (progress: number) => void;
    }) => {
      let blob: Blob;
      let mimeType: string;
      let extension: string;

      switch (format) {
        case ExportFormat.CSV:
          blob = await api.export.exportCSV(filters, onProgress);
          mimeType = 'text/csv';
          extension = 'csv';
          break;
        case ExportFormat.JSON:
          blob = await api.export.exportJSON(filters, onProgress);
          mimeType = 'application/json';
          extension = 'json';
          break;
        case ExportFormat.PDF:
          blob = await api.export.exportPDF(filters, onProgress);
          mimeType = 'application/pdf';
          extension = 'pdf';
          break;
        case ExportFormat.EXCEL:
          blob = await api.export.exportExcel(filters, onProgress);
          mimeType =
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          extension = 'xlsx';
          break;
        default:
          throw new Error('Unsupported export format');
      }

      // Ensure the blob has the correct MIME type
      const finalBlob =
        blob.type === mimeType ? blob : new Blob([blob], { type: mimeType });

      // Create download link using blob URL (works properly over HTTPS)
      const url = window.URL.createObjectURL(finalBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `scans-export-${new Date().toISOString().split('T')[0]}.${extension}`;
      link.style.display = 'none';

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup after a delay to ensure the browser has registered the download
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        window.URL.revokeObjectURL(url);
      }, 10000); // 10 seconds is much safer
    },
    onSuccess: () => {
      toast.success('Export completed successfully');
    },
  });
}
