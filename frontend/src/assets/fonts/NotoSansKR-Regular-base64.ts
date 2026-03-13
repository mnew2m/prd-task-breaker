/**
 * Noto Sans KR 폰트 로더
 *
 * 한글 PDF 출력을 위한 TTF 폰트를 로컬 패키지에서 로드합니다.
 * jsPDF는 TTF/OTF만 지원하며 WOFF/WOFF2는 지원하지 않습니다.
 */

// Vite가 TTF를 static asset으로 처리하여 빌드 시 올바른 URL 제공
import fontUrl from '@expo-google-fonts/noto-sans-kr/400Regular/NotoSansKR_400Regular.ttf'

let cachedFont: string | null = null
let attempted = false

/**
 * Noto Sans KR 폰트를 base64 문자열로 반환합니다.
 * 첫 호출 시 로컬 asset에서 로드하고 이후 캐시를 반환합니다.
 */
export async function loadNotoSansKR(): Promise<string | null> {
  if (attempted) return cachedFont
  if (cachedFont) return cachedFont

  attempted = true
  try {
    const response = await fetch(fontUrl)
    if (!response.ok) throw new Error(`Font fetch failed: ${response.status}`)

    const buffer = await response.arrayBuffer()

    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    cachedFont = btoa(binary)
    return cachedFont
  } catch (e) {
    console.warn('Noto Sans KR 폰트 로드 실패. 한글이 PDF에서 깨질 수 있습니다.', e)
    return null
  }
}
