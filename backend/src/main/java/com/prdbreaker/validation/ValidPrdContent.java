package com.prdbreaker.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * PRD 입력값이 실질적인 텍스트 내용을 담고 있는지 검증한다.
 * 길이(@Size)와 공백(@NotBlank) 검사 이후의 의미론적 검증을 담당한다.
 *
 * 검사 항목:
 *   1. 최소 5개 이상의 단어(공백 구분)를 포함해야 함
 *   2. 단일 문자가 전체 텍스트의 50% 이상을 차지하면 의미 없는 반복 입력으로 간주
 */
@Documented
@Constraint(validatedBy = PrdContentValidator.class)
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidPrdContent {

    String message() default "PRD 내용이 유효하지 않습니다. 실제 기획 내용을 입력해주세요.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
