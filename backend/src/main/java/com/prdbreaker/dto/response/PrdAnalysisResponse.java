package com.prdbreaker.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrdAnalysisResponse {
    private Long id;
    private List<FeatureDto> features;
    private List<UserStoryDto> userStories;
    private List<TodoItemDto> todos;
    private List<ApiDraftDto> apiDrafts;
    private List<DbDraftDto> dbDrafts;
    private List<ChecklistItemDto> testChecklist;
    private List<ChecklistItemDto> releaseChecklist;
    private List<String> uncertainItems;
    private String readmeDraft;
    private LocalDateTime createdAt;
    private Boolean useful;
}
