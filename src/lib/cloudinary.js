/**
 * src/lib/cloudinary.js
 * 建立 Cloudinary 上傳工具：
 * 直接在瀏覽器用「unsigned preset」上傳到 Cloudinary
 *  */ 
export async function uploadImageToCloudinary(file) {
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD
  const preset = import.meta.env.VITE_CLOUDINARY_PRESET
  const folder = import.meta.env.VITE_CLOUDINARY_FOLDER || 'covers'

  if (!cloud || !preset) {
    throw new Error('Missing Cloudinary env: VITE_CLOUDINARY_CLOUD / VITE_CLOUDINARY_PRESET')
  }

  const url = `https://api.cloudinary.com/v1_1/${cloud}/auto/upload` // auto: 自動辨識圖片/影片
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', preset) // unsigned preset
  fd.append('folder', folder)

  const res = await fetch(url, { method: 'POST', body: fd })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Cloudinary ${res.status}: ${text}`)
  }
  const json = await res.json()
  return json.secure_url // → 可直接存到 Firestore
}