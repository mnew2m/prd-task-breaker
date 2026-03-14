import { ref } from 'vue'
import { useToast } from './useToast'
import type { jsPDF } from 'jspdf'
import type { PrdAnalysisResponse } from '../types/analysis'
import { loadNotoSansKR } from '../assets/fonts/NotoSansKR-Regular-base64'

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable: { finalY: number }
}

export type SectionKey =
  | 'features'
  | 'userStories'
  | 'todos'
  | 'apiDrafts'
  | 'dbDrafts'
  | 'testChecklist'
  | 'releaseChecklist'
  | 'uncertainItems'
  | 'readmeDraft'

export const SECTION_LABELS: Record<SectionKey, string> = {
  features: '기능 목록',
  userStories: '유저 스토리',
  todos: 'TODO',
  apiDrafts: 'API 초안',
  dbDrafts: 'DB 초안',
  testChecklist: '테스트 체크리스트',
  releaseChecklist: '릴리즈 체크리스트',
  uncertainItems: '불확실 항목',
  readmeDraft: 'README 초안',
}

export const ALL_SECTIONS: SectionKey[] = [
  'features',
  'userStories',
  'todos',
  'apiDrafts',
  'dbDrafts',
  'testChecklist',
  'releaseChecklist',
  'uncertainItems',
  'readmeDraft',
]

const PRIORITY_LABEL: Record<string, string> = {
  HIGH: '높음',
  MEDIUM: '보통',
  LOW: '낮음',
}

export function usePdfExport() {
  const { show: showToast } = useToast()
  const isGenerating = ref(false)

  async function generatePdf(
    result: PrdAnalysisResponse,
    selectedSections: SectionKey[],
  ): Promise<void> {
    isGenerating.value = true

    try {
      // Dynamic import to code-split jsPDF out of the main bundle
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ])

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' }) as JsPDFWithAutoTable

      // Register Korean font if available (TTF only — WOFF/WOFF2 is rejected by loader)
      let fontFamily = 'helvetica'
      try {
        const fontBase64 = await loadNotoSansKR()
        if (fontBase64) {
          doc.addFileToVFS('NotoSansKR-Regular.ttf', fontBase64)
          doc.addFont('NotoSansKR-Regular.ttf', 'NotoSansKR', 'normal')
          fontFamily = 'NotoSansKR'
        }
      } catch (e) {
        console.warn('한글 폰트 등록 실패, 기본 폰트로 대체합니다:', e)
      }
      doc.setFont(fontFamily)

      const pageW = doc.internal.pageSize.getWidth()
      const margin = 15
      const contentW = pageW - margin * 2
      let y = margin

      // Helper: check remaining space and add new page if needed
      function checkPageBreak(neededHeight: number) {
        const pageH = doc.internal.pageSize.getHeight()
        if (y + neededHeight > pageH - margin) {
          doc.addPage()
          y = margin
        }
      }

      // Helper: section heading
      function addHeading(text: string) {
        checkPageBreak(12)
        doc.setFontSize(14)
        doc.setTextColor(26, 26, 46)
        doc.text(text, margin, y)
        y += 8
        doc.setDrawColor(99, 102, 241)
        doc.setLineWidth(0.5)
        doc.line(margin, y, margin + contentW, y)
        y += 4
      }

      // Helper: body text (auto-wrap)
      function addBodyText(text: string, indent = 0) {
        doc.setFontSize(9)
        doc.setTextColor(60, 60, 80)
        const lines = doc.splitTextToSize(text, contentW - indent)
        checkPageBreak(lines.length * 5)
        doc.text(lines, margin + indent, y)
        y += lines.length * 5 + 2
      }

      // ── Cover / title ────────────────────────────────────────────
      doc.setFontSize(20)
      doc.setTextColor(26, 26, 46)
      doc.text('PRD 분석 결과', margin, y + 10)
      y += 18
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 120)
      doc.text(`ID: ${result.id}`, margin, y)
      y += 6
      const rawCreatedAt = result.createdAt
      const createdAtDate = Array.isArray(rawCreatedAt)
        ? new Date(rawCreatedAt[0], rawCreatedAt[1] - 1, rawCreatedAt[2], rawCreatedAt[3] ?? 0, rawCreatedAt[4] ?? 0)
        : new Date(rawCreatedAt)
      const createdAt = createdAtDate.toLocaleString('ko-KR')
      doc.text(`생성일시: ${createdAt}`, margin, y)
      y += 12

      const sections = new Set(selectedSections)

      // ── Features ─────────────────────────────────────────────────
      if (sections.has('features') && result.features.length > 0) {
        addHeading('기능 목록')
        autoTable(doc, {
          startY: y,
          head: [['기능명', '우선순위', '설명']],
          body: result.features.map((f) => [
            f.name,
            PRIORITY_LABEL[f.priority] ?? f.priority,
            f.description + (f.notes ? `\n[${f.notes}]` : ''),
          ]),
          styles: { font: fontFamily, fontSize: 8 },
          headStyles: { fillColor: [99, 102, 241] },
          columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 20 }, 2: { cellWidth: 'auto' } },
          margin: { left: margin, right: margin },
          didDrawPage: (data) => {
            y = data.cursor?.y ?? y
          },
        })
        y = doc.lastAutoTable.finalY + 8
      }

      // ── User Stories ─────────────────────────────────────────────
      if (sections.has('userStories') && result.userStories.length > 0) {
        addHeading('유저 스토리')
        for (const story of result.userStories) {
          const storyText = `나는 ${story.role}로서, ${story.action}하고 싶다. 왜냐하면 ${story.benefit}`
          addBodyText(`• ${storyText}`)
          if (story.acceptanceCriteria.length > 0) {
            addBodyText('인수 기준:', 4)
            for (const ac of story.acceptanceCriteria) {
              addBodyText(`- ${ac}`, 8)
            }
          }
          y += 2
        }
        y += 4
      }

      // ── TODOs ─────────────────────────────────────────────────────
      if (sections.has('todos') && result.todos.length > 0) {
        addHeading('TODO')
        autoTable(doc, {
          startY: y,
          head: [['작업', '카테고리', '우선순위', '예상 공수']],
          body: result.todos.map((t) => [
            t.task + (t.notes ? `\n[${t.notes}]` : ''),
            t.category,
            PRIORITY_LABEL[t.priority] ?? t.priority,
            t.estimatedEffort,
          ]),
          styles: { font: fontFamily, fontSize: 8 },
          headStyles: { fillColor: [99, 102, 241] },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 30 },
            2: { cellWidth: 20 },
            3: { cellWidth: 25 },
          },
          margin: { left: margin, right: margin },
        })
        y = doc.lastAutoTable.finalY + 8
      }

      // ── API Drafts ────────────────────────────────────────────────
      if (sections.has('apiDrafts') && result.apiDrafts.length > 0) {
        addHeading('API 초안')
        autoTable(doc, {
          startY: y,
          head: [['메서드', '경로', '설명']],
          body: result.apiDrafts.map((a) => [a.method, a.path, a.description]),
          styles: { font: fontFamily, fontSize: 8 },
          headStyles: { fillColor: [99, 102, 241] },
          columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 55 }, 2: { cellWidth: 'auto' } },
          margin: { left: margin, right: margin },
        })
        y = doc.lastAutoTable.finalY + 8
      }

      // ── DB Drafts ─────────────────────────────────────────────────
      if (sections.has('dbDrafts') && result.dbDrafts.length > 0) {
        addHeading('DB 초안')
        for (const db of result.dbDrafts) {
          addBodyText(`테이블: ${db.tableName}`)
          addBodyText(`컬럼: ${db.columns.join(', ')}`, 4)
          if (db.notes) addBodyText(`[${db.notes}]`, 4)
          y += 2
        }
        y += 4
      }

      // ── Test Checklist ────────────────────────────────────────────
      if (sections.has('testChecklist') && result.testChecklist.length > 0) {
        addHeading('테스트 체크리스트')
        autoTable(doc, {
          startY: y,
          head: [['테스트 항목', '카테고리']],
          body: result.testChecklist.map((c) => [c.item, c.category]),
          styles: { font: fontFamily, fontSize: 8 },
          headStyles: { fillColor: [99, 102, 241] },
          columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 35 } },
          margin: { left: margin, right: margin },
        })
        y = doc.lastAutoTable.finalY + 8
      }

      // ── Release Checklist ─────────────────────────────────────────
      if (sections.has('releaseChecklist') && result.releaseChecklist.length > 0) {
        addHeading('릴리즈 체크리스트')
        autoTable(doc, {
          startY: y,
          head: [['릴리즈 항목', '카테고리']],
          body: result.releaseChecklist.map((c) => [c.item, c.category]),
          styles: { font: fontFamily, fontSize: 8 },
          headStyles: { fillColor: [99, 102, 241] },
          columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 35 } },
          margin: { left: margin, right: margin },
        })
        y = doc.lastAutoTable.finalY + 8
      }

      // ── Uncertain Items ───────────────────────────────────────────
      if (sections.has('uncertainItems') && result.uncertainItems.length > 0) {
        addHeading('불확실 항목')
        for (const item of result.uncertainItems) {
          addBodyText(`• ${item}`)
        }
        y += 4
      }

      // ── README Draft ──────────────────────────────────────────────
      if (sections.has('readmeDraft') && result.readmeDraft) {
        addHeading('README 초안')
        addBodyText(result.readmeDraft)
      }

      // Save
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      doc.save(`PRD분석결과_${result.id}_${date}.pdf`)
      showToast('PDF가 저장되었습니다')
    } finally {
      isGenerating.value = false
    }
  }

  return { generatePdf, isGenerating }
}
