<template>
  <div class="prd-input-card">
    <div class="card-header">
      <h2>PRD 입력</h2>
      <button class="sample-btn" @click="loadSample" :disabled="isLoading">
        샘플 불러오기
      </button>
    </div>

    <textarea
      v-model="prdContent"
      class="prd-textarea"
      placeholder="PRD 내용을 입력하세요 (최소 50자)..."
      :disabled="isLoading"
      rows="12"
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
        {{ isLoading ? '분석 중...' : 'AI 분석 시작' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  isLoading: boolean
}>()

const emit = defineEmits<{
  analyze: [content: string]
}>()

const prdContent = ref('')

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

function loadSample() {
  prdContent.value = SAMPLE_PRD
}

function handleAnalyze() {
  if (prdContent.value.length >= 50) {
    emit('analyze', prdContent.value)
  }
}
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
}

.sample-btn {
  padding: 0.4rem 0.8rem;
  border: 1px solid #1a1a2e;
  background: transparent;
  color: #1a1a2e;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.sample-btn:hover:not(:disabled) {
  background: #1a1a2e;
  color: white;
}

.prd-textarea {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.9rem;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;
}

.prd-textarea:focus {
  outline: none;
  border-color: #1a1a2e;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
}

.char-count {
  font-size: 0.875rem;
  color: #888;
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
  transition: background 0.2s;
}

.analyze-btn:hover:not(:disabled) {
  background: #2d2d5e;
}

.analyze-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
