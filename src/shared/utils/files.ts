export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadFromUrl = async (url: string, filename: string): Promise<void> => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al descargar el archivo");
    const blob = await response.blob();
    downloadBlob(blob, filename);
  } catch {
    throw new Error("Error en la descarga");
  }
};