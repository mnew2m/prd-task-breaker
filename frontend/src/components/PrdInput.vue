<template>
  <div class="prd-input-card">
    <div class="card-header">
      <h2><FileEdit :size="20" /> PRD 입력</h2>

      <!-- 데스크탑: 버튼 직접 노출 -->
      <div class="header-actions desktop-actions">
        <a href="/prd-template.txt" download="PRD_템플릿.txt" class="template-btn"><Download :size="14" /> 템플릿 다운로드</a>
        <button class="sample-btn" @click="loadSample" :disabled="isLoading">
          <FileText :size="14" /> 샘플 불러오기
        </button>
      </div>

      <!-- 모바일: 메뉴 버튼 + 드롭다운 -->
      <div class="mobile-menu" ref="menuRef">
        <button class="menu-btn" @click="toggleMenu" :class="{ active: menuOpen }">
          <MoreVertical :size="20" />
        </button>
        <div v-if="menuOpen" class="dropdown">
          <button class="dropdown-item" @click="copyTemplate">
            <Copy :size="15" /> 템플릿 복사하기
          </button>
          <button class="dropdown-item" @click="loadSample" :disabled="isLoading">
            <FileText :size="15" /> 샘플 불러오기
          </button>
        </div>
      </div>
    </div>

    <textarea
      v-model="prdContent"
      class="prd-textarea"
      placeholder="PRD 내용을 입력하세요 (최소 50자)..."
      :disabled="isLoading"
      rows="12"
      aria-label="PRD 내용 입력 (최소 50자)"
    />

    <div class="input-footer">
      <span class="char-count" :class="{ 'too-short': prdContent.length < 50 }">
        {{ prdContent.length.toLocaleString() }} / 50,000자
        <span v-if="prdContent.length < 50 && prdContent.length > 0"> (최소 50자)</span>
      </span>
      <button
        class="analyze-btn"
        @click="handleAnalyze"
        :disabled="isLoading || prdContent.length < 50"
      >
        <Sparkles v-if="!isLoading" :size="16" />
        {{ isLoading ? '분석 중...' : 'AI 분석 시작' }}
      </button>
    </div>
  </div>

  <Teleport to="body">
    <div class="toast" :class="{ show: copied }">
      <Check :size="15" /> 템플릿이 복사되었습니다.
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { FileEdit, Download, FileText, Sparkles, MoreVertical, Copy, Check } from 'lucide-vue-next'


defineProps<{
  isLoading: boolean
}>()

const emit = defineEmits<{
  analyze: [content: string]
}>()

const prdContent = ref('')
const menuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const copied = ref(false)

const TEMPLATE_TEXT = `# [프로젝트명] PRD

## 1. 제품 개요
[이 프로젝트가 무엇인지 1~2문장으로 설명]

## 2. 목표
- [핵심 목표 1]
- [핵심 목표 2]
- [핵심 목표 3]

## 3. 대상 사용자
- 주요: [누가 이 서비스를 쓰는가?]
- 부수: [추가 사용자 그룹]

## 4. 핵심 기능

### 4.1 [기능명]
- [세부 요구사항]
- [세부 요구사항]
- [기술적 참고사항이 있다면 기재]

### 4.2 [기능명]
- [세부 요구사항]
- [세부 요구사항]

### 4.3 [기능명]
- [세부 요구사항]
- [세부 요구사항]

(필요한 만큼 기능 추가)

## 5. 비기능 요구사항
- 성능: [응답 시간, 동시 접속 등]
- 보안: [인증 방식, 데이터 보호 등]
- 배포: [배포 환경, CI/CD 등]

## 6. 기술 스택 (선택)
- Frontend: [프레임워크]
- Backend: [프레임워크]
- Database: [DB 종류]
- 기타: [외부 API, 인프라 등]

## 7. 제약사항 / 참고사항 (선택)
- [일정, 예산, 기존 시스템 연동 등]
- [불확실하거나 추후 결정할 사항]`

async function copyTemplate() {
  try {
    await navigator.clipboard.writeText(TEMPLATE_TEXT)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (e) {
    console.warn('클립보드 복사 실패:', e)
  }
  menuOpen.value = false
}

const SAMPLE_PRD = `# 온라인 쇼핑몰 PRD

## 제품 개요
사용자가 다양한 상품을 검색하고 구매할 수 있는 온라인 쇼핑몰 플랫폼을 개발합니다.

## 핵심 기능

### 1. 사용자 인증
- 이메일/패스워드 기반 회원가입 및 로그인
- 소셜 로그인 (Google, Kakao)
- JWT 토큰 기반 세션 관리

### 2. 상품 관리
- 상품 목록 조회 (페이징, 필터링, 정렬)
- 상품 상세 페이지 (이미지, 설명, 가격, 재고)
- 카테고리별 분류

### 3. 장바구니 & 주문
- 장바구니 추가/삭제/수량 변경
- 주문서 작성 (배송지, 결제 수단)
- 결제 처리 (신용카드, 계좌이체)
- 주문 내역 조회

### 4. 리뷰
- 구매 확정 후 리뷰 작성 (별점 + 텍스트)
- 리뷰 목록 조회

## 비기능 요구사항
- 응답 시간: 페이지 로드 3초 이내
- 동시 접속자: 1,000명 이상 지원
- 모바일 반응형 UI`

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function loadSample() {
  prdContent.value = SAMPLE_PRD
  menuOpen.value = false
}

function handleAnalyze() {
  if (prdContent.value.length >= 50) {
    emit('analyze', prdContent.value)
  }
}

function handleClickOutside(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    menuOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.prd-input-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h2 {
  font-size: 1.25rem;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

/* ── 데스크탑 버튼 ── */
.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.template-btn,
.sample-btn {
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  line-height: 1.4;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.2s;
}

.template-btn {
  border: 1px solid #6366f1;
  background: transparent;
  color: #6366f1;
  text-decoration: none;
}

.template-btn:hover {
  background: #6366f1;
  color: white;
}

.sample-btn {
  border: 1px solid #1a1a2e;
  background: transparent;
  color: #1a1a2e;
}

.sample-btn:hover:not(:disabled) {
  background: #1a1a2e;
  color: white;
}

/* ── 모바일 메뉴 ── */
.mobile-menu {
  display: none;
  position: relative;
}

.menu-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a1a2e;
  transition: all 0.2s;
}

.menu-btn:hover,
.menu-btn.active {
  background: #f0f0f5;
}

.dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  min-width: 160px;
  z-index: 100;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.65rem 1rem;
  font-size: 0.9rem;
  color: #1a1a2e;
  background: transparent;
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.15s;
  box-sizing: border-box;
}

.dropdown-item:hover:not(:disabled) {
  background: #f5f5fa;
}

.dropdown-item:not(:last-child) {
  border-bottom: 1px solid #f5f5f5;
}

/* ── 반응형 ── */
@media (max-width: 600px) {
  .desktop-actions {
    display: none;
  }

  .mobile-menu {
    display: block;
  }
}

/* ── 텍스트 영역 ── */
.prd-textarea {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.9rem;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.prd-textarea:focus {
  outline: none;
  border-color: #1a1a2e;
}

/* ── 하단 푸터 ── */
.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
  gap: 0.5rem;
}

.char-count {
  font-size: 0.875rem;
  color: #888;
  flex-shrink: 0;
}

.char-count.too-short {
  color: #e74c3c;
}

.analyze-btn {
  padding: 0.6rem 1.5rem;
  background: #1a1a2e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: background 0.2s;
  white-space: nowrap;
}

.analyze-btn:hover:not(:disabled) {
  background: #2d2d5e;
}

.analyze-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── 토스트 ── */
.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%) translateY(1rem);
  background: #1a1a2e;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s, transform 0.2s;
  z-index: 9999;
  white-space: nowrap;
}

.toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
</style>
