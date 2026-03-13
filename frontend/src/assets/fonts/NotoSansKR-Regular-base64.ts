/**
 * Noto Sans KR 폰트 로더
 *
 * 한글 PDF 출력을 위한 TTF 폰트를 CDN에서 런타임에 로드합니다.
 * jsPDF는 TTF/OTF만 지원하며 WOFF/WOFF2는 지원하지 않습니다.
 *
 * 번들에 직접 포함하려면:
 *   1. https://fonts.google.com/noto/specimen/Noto+Sans+KR 에서 NotoSansKR-Regular.ttf 다운로드
 *   2. Node.js로 변환:
 *      node -e "const fs=require('fs'); process.stdout.write(fs.readFileSync('NotoSansKR-Regular.ttf').toString('base64'))"
 *   3. 아래 EMBEDDED_FONT_BASE64 상수에 할당 후 loadNotoSansKR() 반환값으로 사용
 */

// fontsource v4는 TTF 파일을 포함합니다
const FONT_CDN_URL =
  'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-kr@4/files/noto-sans-kr-korean-400-normal.ttf'

let cachedFont: string | null = null
let attempted = false

/**
 * Noto Sans KR 폰트를 base64 문자열로 반환합니다.
 * 첫 호출 시 CDN에서 다운로드하고 이후 캐시를 반환합니다.
 * WOFF/WOFF2 형식이 반환되면 null을 반환합니다 (jsPDF 미지원).
 */
export async function loadNotoSansKR(): Promise<string | null> {
  if (attempted) return cachedFont
  if (cachedFont) return cachedFont

  attempted = true
  try {
    const response = await fetch(FONT_CDN_URL)
    if (!response.ok) throw new Error(`Font fetch failed: ${response.status}`)

    const buffer = await response.arrayBuffer()

    // jsPDF는 TTF/OTF만 지원합니다. WOFF/WOFF2가 반환되면 거부합니다.
    // WOFF magic: 0x774F4646 ('wOFF'), WOFF2 magic: 0x774F4632 ('wOF2')
    const magic = new DataView(buffer).getUint32(0, false)
    if (magic === 0x774f4646 || magic === 0x774f4632) {
      console.warn('폰트 CDN이 WOFF/WOFF2 형식을 반환했습니다. jsPDF는 TTF만 지원합니다.')
      return null
    }

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
