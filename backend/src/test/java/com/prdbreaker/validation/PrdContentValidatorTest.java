package com.prdbreaker.validation;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class PrdContentValidatorTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    // 검증 대상 래퍼 — @ValidPrdContent만 단독 테스트
    record Request(@ValidPrdContent String prdContent) {}

    @Test
    void valid_normalPrdText_passes() {
        var req = new Request("사용자 인증 기능을 구현합니다. 로그인 회원가입 비밀번호 재설정 소셜 로그인을 지원해야 합니다.");
        assertThat(validator.validate(req)).isEmpty();
    }

    @Test
    void valid_null_passes() {
        // null은 @NotBlank가 처리, @ValidPrdContent는 통과
        var req = new Request(null);
        assertThat(validator.validate(req)).isEmpty();
    }

    @Test
    void valid_blank_passes() {
        // 공백도 @NotBlank가 처리
        var req = new Request("   ");
        assertThat(validator.validate(req)).isEmpty();
    }

    @Test
    void invalid_fewerThanFiveWords_fails() {
        var req = new Request("짧은 입력 테스트");  // 3개 단어
        Set<ConstraintViolation<Request>> violations = validator.validate(req);
        assertThat(violations).hasSize(1);
        assertThat(violations.iterator().next().getMessage())
                .contains("최소 5개");
    }

    @Test
    void invalid_repeatedSingleChar_fails() {
        // 단어 12개(>= 5 통과) + 'a'가 비공백 문자의 100% 차지
        var req = new Request("aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa");
        Set<ConstraintViolation<Request>> violations = validator.validate(req);
        assertThat(violations).hasSize(1);
        assertThat(violations.iterator().next().getMessage())
                .contains("반복 문자");
    }

    @Test
    void invalid_repeatedKoreanChar_fails() {
        // 단어 9개(>= 5 통과) + '가'가 비공백 문자의 75% 차지
        var req = new Request("가가가 가가가 가가가 가가가 가가가 가가가 테스트 입력 반복");
        Set<ConstraintViolation<Request>> violations = validator.validate(req);
        assertThat(violations).hasSize(1);
        assertThat(violations.iterator().next().getMessage())
                .contains("반복 문자");
    }

    @Test
    void valid_exactlyFiveWords_passes() {
        var req = new Request("하나 둘 셋 넷 다섯");
        assertThat(validator.validate(req)).isEmpty();
    }

    @Test
    void valid_diverseCharsAboveThreshold_passes() {
        // 어떤 단일 문자도 50% 미만, 단어 5개 이상
        var req = new Request("PRD 요구사항 기능 목록 작성 사용자 인증 결제 시스템 대시보드");
        assertThat(validator.validate(req)).isEmpty();
    }
}
