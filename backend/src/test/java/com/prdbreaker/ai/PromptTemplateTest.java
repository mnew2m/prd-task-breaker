package com.prdbreaker.ai;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PromptTemplateTest {

    private final PromptTemplate promptTemplate = new PromptTemplate();

    @Test
    void buildPrompt_containsUserPrdDelimiters() {
        String prd = "사용자 PRD 내용입니다.";
        String prompt = promptTemplate.buildPrompt(prd);

        assertThat(prompt).contains("<user_prd>");
        assertThat(prompt).contains("</user_prd>");
        assertThat(prompt).contains(prd);
    }

    @Test
    void buildPrompt_injectionWarningInSystemInstruction() {
        String prompt = promptTemplate.buildPrompt("any prd");

        assertThat(prompt).contains("무시");
    }

    @Test
    void buildPrompt_prdContentIsInsideDelimiters() {
        String prd = "테스트 PRD 콘텐츠";
        String prompt = promptTemplate.buildPrompt(prd);

        int openTag = prompt.indexOf("<user_prd>");
        int closeTag = prompt.indexOf("</user_prd>");
        int prdIndex = prompt.indexOf(prd);

        assertThat(prdIndex).isGreaterThan(openTag);
        assertThat(prdIndex).isLessThan(closeTag);
    }

    @Test
    void buildPrompt_containsJsonFormatInstruction() {
        String prompt = promptTemplate.buildPrompt("any prd");

        assertThat(prompt).contains("features");
        assertThat(prompt).contains("userStories");
        assertThat(prompt).contains("todos");
    }
}
