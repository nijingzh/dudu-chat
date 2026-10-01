/** 图片压到长边 ≤maxSide 的 JPEG dataURL（照片墙 / 图片消息共用） */
export async function compressImage(
  file: File,
  maxSide = 900,
  quality = 0.72,
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', quality);
}
