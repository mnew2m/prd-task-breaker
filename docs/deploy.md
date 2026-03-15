# 배포 가이드

## 배포 환경

| 레이어 | 서비스 | URL 패턴 |
|--------|--------|----------|
| 프론트엔드 | Vercel | `https://<project>.vercel.app` |
| 백엔드 | Railway | `https://<project>.railway.app` |
| DB | Railway PostgreSQL | Railway 내부 네트워크 |

---

## 프론트엔드 배포 (Vercel)

### 자동 배포
- `main` 브랜치 푸시 → Vercel이 자동으로 `npm run build` 실행 후 배포
- PR 생성 시 Preview 환경 자동 생성 (PR별 고유 URL 제공)

### 환경변수
| 변수명 | 설명 | 예시 |
|--------|------|------|
| `VITE_API_BASE_URL` | 백엔드 API URL | `https://api.example.railway.app` |

### 수동 배포
```bash
cd frontend && npm run build
# Vercel CLI 사용 시
vercel --prod
```

### 롤백
Vercel 대시보드 → Deployments → 이전 배포 선택 → "Promote to Production"
또는 CLI:
```bash
vercel rollback [deployment-url]
```

---

## 백엔드 배포 (Railway)

### 자동 배포
- `main` 브랜치 푸시 → Railway가 Dockerfile 기반으로 자동 빌드·배포
- 배포 중 헬스체크 실패 시 자동 롤백 (Railway 기본 동작)

### 환경변수
| 변수명 | 설명 |
|--------|------|
| `ANTHROPIC_API_KEY` | Claude API 키 |
| `AI_MODEL` | AI 모델명 (기본: `claude-haiku-4-5-20251001`) |
| `DB_URL` | PostgreSQL JDBC URL |
| `DB_USERNAME` | DB 사용자명 |
| `DB_PASSWORD` | DB 비밀번호 |
| `CORS_ALLOWED_ORIGINS` | 허용 CORS 도메인 |
| `SPRING_PROFILES_ACTIVE` | `prod` |

### 롤백
Railway 대시보드 → Service → Deployments → 이전 배포 선택 → "Redeploy"
- Railway는 배포 단위를 스냅샷으로 보관하므로 즉시 이전 버전으로 복원 가능

### 헬스체크
```
GET /api/v1/health
# 응답: 200 OK
```
Railway 서비스 설정에서 헬스체크 경로를 `/api/v1/health`로 설정 → 배포 실패 시 자동 롤백.

---

## CI/CD 파이프라인 전체 흐름

```
[push to main / PR]
      │
      ├──▶ backend-test       gradle build (compile + test + jacoco + 커버리지 임계값 검증), backend-test-report 아티팩트 저장
      ├──▶ frontend-check     npm audit → type-check → test:coverage → build
      └──▶ frontend-e2e       Playwright Chromium (smoke 6개 + user-flows 7개)

[main push / workflow_dispatch]
      └──▶ e2e-integration    실제 백엔드 기동 + Playwright integration 4개

[모든 잡 통과 시]
      ├──▶ Vercel: 자동 배포 (프론트엔드)
      └──▶ Railway: 자동 배포 (백엔드)

[수동 트리거 워크플로]
      ├──▶ performance.yml    k6 부하 테스트 (workflow_dispatch, BASE_URL 입력)
      ├──▶ rollback.yml       frontend/backend/all 롤백 (workflow_dispatch, reason 입력)
      └──▶ security.yml       Trivy 취약점 스캔 (매주 월요일 + workflow_dispatch)
```

---

## 롤백

### 자동 롤백 (배포 실패 시)
- **Railway**: 헬스체크(`/api/v1/health`) 실패 시 이전 배포로 자동 롤백
- **Vercel**: 빌드 실패 시 이전 배포 유지 (실패한 배포는 프로덕션에 반영 안 됨)

### 수동 롤백 (GitHub Actions)
`Actions` → `Rollback` 워크플로 → `Run workflow`:
- `target`: `frontend` / `backend` / `all` 선택
- `reason`: 롤백 사유 입력 (감사 로그용)

필요한 GitHub Secrets:
| Secret | 발급 위치 |
|--------|-----------|
| `VERCEL_TOKEN` | Vercel 계정 → Settings → Tokens |
| `RAILWAY_TOKEN` | Railway 계정 → Account Settings → Tokens |

### 수동 롤백 (대시보드)
- **Vercel**: Deployments → 이전 배포 → "Promote to Production"
- **Railway**: Service → Deployments → 이전 배포 → "Redeploy"

---

## 모니터링

### 현재 운영 중인 모니터링
| 도구 | 대상 | 알림 |
|------|------|------|
| Railway 내장 로그 | 백엔드 애플리케이션 로그 | 대시보드 확인 |
| Vercel Analytics | 프론트엔드 방문자·오류 | 대시보드 확인 |
| GitHub Actions | CI 빌드 성공/실패 | 이메일 알림 |

### Sentry (프론트엔드 에러 모니터링)
`@sentry/vue` 패키지가 설치되어 있으며, `VITE_SENTRY_DSN` 환경변수가 설정된 경우 자동 활성화됩니다.

Vercel 환경변수에 추가:
```
VITE_SENTRY_DSN=https://<key>@<org>.ingest.sentry.io/<project>
```

DSN이 없으면 Sentry 초기화를 건너뛰어 로컬/테스트 환경에 영향 없음.

### 권장 추가 모니터링
- **UptimeRobot**: `/api/v1/health` 엔드포인트 5분마다 체크, 다운 시 이메일/슬랙 알림
- **Railway Metrics**: CPU/메모리 사용률 이상 시 알림

---

## 성능 목표 및 테스트 계획

### 목표
| 항목 | 목표값 |
|------|--------|
| AI 분석 응답 P95 | 30초 이내 |
| 페이지 최초 로드 (FCP) | 2초 이내 |
| PDF 생성 | 3초 이내 |

### 성능 테스트 방법 (수동/스테이징)
```bash
# k6로 API 부하 테스트 (스테이징 환경)
k6 run perf/load-test.js

# Apache Bench 단순 응답시간 체크
ab -n 10 -c 1 https://api.staging.example.com/api/v1/health
```

`perf/load-test.js` 시나리오:
- VU 1명, 30초 분석 요청 3회 → P95 응답시간 측정
- VU 5명 동시, 분석 요청 → 레이스컨디션·타임아웃 확인

### 보안 테스트 항목
| 항목 | 도구/방법 | 빈도 |
|------|-----------|------|
| 프론트엔드 의존성 취약점 | `npm audit --audit-level=high` | CI 매 실행 |
| 백엔드 의존성 취약점 | Dependabot 자동 PR | 주 1회 |
| 입력 검증 | `@ValidPrdContent` 단위 테스트 | CI 매 실행 |
| OWASP Top 10 수동 점검 | 브라우저 개발자도구 + OWASP ZAP | 릴리즈 전 |
| 프롬프트 인젝션 방어 | system 프롬프트 역할 강화 + `<user_prd>` 태그 격리 | 코드 리뷰 |
