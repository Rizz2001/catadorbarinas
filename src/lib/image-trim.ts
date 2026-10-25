/**
 * Utilidad para detectar y recortar automáticamente márgenes transparentes
 * en imágenes de logotipos (PNG, WebP) antes de subirlas al servidor.
 */

export async function trimTransparentBorders(file: File, padding = 12): Promise<File> {
  // Solo procesar imágenes rasterizadas con potencial de transparencia
  if (!file.type.includes('png') && !file.type.includes('webp')) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        let minX = canvas.width;
        let minY = canvas.height;
        let maxX = 0;
        let maxY = 0;

        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const alpha = data[(y * canvas.width + x) * 4 + 3];
            if (alpha > 15) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        // Si la imagen no tiene contenido o no tiene bordes vacíos significativos
        if (maxX <= minX || maxY <= minY) {
          return resolve(file);
        }

        const trimmedWidth = maxX - minX;
        const trimmedHeight = maxY - minY;

        // Si ya ocupa más del 92% del espacio, no necesita recorte
        if (trimmedWidth >= canvas.width * 0.92 && trimmedHeight >= canvas.height * 0.92) {
          return resolve(file);
        }

        const cropX = Math.max(0, minX - padding);
        const cropY = Math.max(0, minY - padding);
        const cropW = Math.min(canvas.width - cropX, trimmedWidth + padding * 2);
        const cropH = Math.min(canvas.height - cropY, trimmedHeight + padding * 2);

        const outCanvas = document.createElement('canvas');
        outCanvas.width = cropW;
        outCanvas.height = cropH;
        const outCtx = outCanvas.getContext('2d');
        if (!outCtx) return resolve(file);

        outCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

        outCanvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            const cleanFile = new File([blob], file.name.replace(/\.[^/.]+$/, '') + '_trimmed.png', {
              type: 'image/png',
            });
            resolve(cleanFile);
          },
          'image/png'
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
