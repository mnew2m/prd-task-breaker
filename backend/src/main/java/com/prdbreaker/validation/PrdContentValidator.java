package com.prdbreaker.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PrdContentValidator implements ConstraintValidator<ValidPrdContent, String> {

    private static final int MIN_WORD_COUNT = 5;
    private static final double MAX_SINGLE_CHAR_RATIO = 0.5;

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            return true; // null/blank는 @NotBlank가 담당
        }

        String trimmed = value.trim();

        if (!hasMinimumWords(trimmed)) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "PRD 내용은 최소 " + MIN_WORD_COUNT + "개 이상의 단어를 포함해야 합니다."
            ).addConstraintViolation();
            return false;
        }

        if (isRepetitiveContent(trimmed)) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "의미 있는 PRD 내용을 입력해주세요. 반복 문자는 허용되지 않습니다."
            ).addConstraintViolation();
            return false;
        }

        return true;
    }

    /** 공백/줄바꿈으로 나눈 토큰이 MIN_WORD_COUNT 이상인지 확인 */
    private boolean hasMinimumWords(String text) {
        String[] words = text.split("[\\s\\p{P}]+");
        long nonEmptyWords = java.util.Arrays.stream(words)
                .filter(w -> !w.isBlank())
                .count();
        return nonEmptyWords >= MIN_WORD_COUNT;
    }

    /** 단일 문자(공백 제외)가 전체 비공백 문자의 MAX_SINGLE_CHAR_RATIO 이상이면 반복 입력으로 간주 */
    private boolean isRepetitiveContent(String text) {
        String noSpaces = text.replaceAll("\\s", "");
        if (noSpaces.isEmpty()) return false;

        int[] freq = new int[Character.MAX_VALUE + 1];
        for (char c : noSpaces.toCharArray()) {
            freq[c]++;
        }

        int maxFreq = 0;
        for (int f : freq) {
            if (f > maxFreq) maxFreq = f;
        }

        return (double) maxFreq / noSpaces.length() >= MAX_SINGLE_CHAR_RATIO;
    }
}
