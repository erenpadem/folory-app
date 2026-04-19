/**
 * Resize and re-encode cover images before sending as base64 JSON — keeps requests under nginx/PHP limits.
 */
export async function compressCoverImageToDataUrl(
  file: File,
  maxWidth = 1920,
  initialQuality = 0.82
): Promise<string> {
  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, maxWidth / bitmap.width)
    const w = Math.max(1, Math.round(bitmap.width * scale))
    const h = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Canvas desteklenmiyor')
    }
    ctx.drawImage(bitmap, 0, 0, w, h)

    let quality = initialQuality
    let dataUrl = canvas.toDataURL('image/jpeg', quality)
    // ~1.35 factor: base64 vs raw; target ~under 2.5M chars (~1.8MB binary) for JSON safety
    const maxLen = 2_600_000
    while (dataUrl.length > maxLen && quality > 0.4) {
      quality -= 0.06
      dataUrl = canvas.toDataURL('image/jpeg', quality)
    }
    return dataUrl
  } finally {
    bitmap.close()
  }
}

/**
 * Kare profil fotoğrafı: merkezden kırpma (cover), küçük boyut — istek boyutunu düşük tutar.
 */
export async function compressAvatarImageToDataUrl(
  file: File,
  size = 512,
  initialQuality = 0.85
): Promise<string> {
  const bitmap = await createImageBitmap(file)
  try {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Canvas desteklenmiyor')
    }
    const scale = Math.max(size / bitmap.width, size / bitmap.height)
    const w = bitmap.width * scale
    const h = bitmap.height * scale
    const dx = (size - w) / 2
    const dy = (size - h) / 2
    ctx.drawImage(bitmap, dx, dy, w, h)

    let quality = initialQuality
    let dataUrl = canvas.toDataURL('image/jpeg', quality)
    const maxLen = 800_000
    while (dataUrl.length > maxLen && quality > 0.45) {
      quality -= 0.06
      dataUrl = canvas.toDataURL('image/jpeg', quality)
    }
    return dataUrl
  } finally {
    bitmap.close()
  }
}
