/**
 * File utility functions for downloading files and parsing content disposition headers.
 */

export const tryGetFilename = (contentDisposition?: string, fallback?: string): string => {
  if (contentDisposition) {
    const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(contentDisposition);
    const raw = match?.[1] || match?.[2];
    if (raw) {
      try {
        return decodeURIComponent(raw);
      } catch {
        return raw;
      }
    }
  }
  return fallback || 'report.bin';
};

export const downloadFileFromBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadFileFromResponse = (response: any, fallbackFilename?: string): void => {
  const blob = response.data as Blob;
  const filename = tryGetFilename(
    response.headers?.['content-disposition'],
    fallbackFilename
  );
  downloadFileFromBlob(blob, filename);
};
