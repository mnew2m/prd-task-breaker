package com.prdbreaker.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prdbreaker.ai.AiResponseValidator;
import com.prdbreaker.domain.PrdAnalysis;
import com.prdbreaker.dto.response.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiResponseMapper {

    private final AiResponseValidator validator;
    private final ObjectMapper objectMapper;

    public PrdAnalysisResponse toResponse(PrdAnalysis entity) {
        JsonNode root = validator.validateAndParse(entity.getResultJson());

        return PrdAnalysisResponse.builder()
                .id(entity.getId())
                .features(parseFeatures(root))
                .userStories(parseUserStories(root))
                .todos(parseTodos(root))
                .apiDrafts(parseApiDrafts(root))
                .dbDrafts(parseDbDrafts(root))
                .testChecklist(parseChecklist(root, "testChecklist"))
                .releaseChecklist(parseChecklist(root, "releaseChecklist"))
                .uncertainItems(parseStringList(root, "uncertainItems"))
                .readmeDraft(getTextOrNull(root, "readmeDraft"))
                .createdAt(entity.getCreatedAt())
                .useful(entity.getUseful())
                .build();
    }

    private List<FeatureDto> parseFeatures(JsonNode root) {
        List<FeatureDto> result = new ArrayList<>();
        JsonNode node = root.path("features");
        if (node.isArray()) {
            for (JsonNode item : node) {
                result.add(FeatureDto.builder()
                        .name(getTextOrNull(item, "name"))
                        .description(getTextOrNull(item, "description"))
                        .priority(getTextOrNull(item, "priority"))
                        .notes(getTextOrNull(item, "notes"))
                        .build());
            }
        }
        return result;
    }

    private List<UserStoryDto> parseUserStories(JsonNode root) {
        List<UserStoryDto> result = new ArrayList<>();
        JsonNode node = root.path("userStories");
        if (node.isArray()) {
            for (JsonNode item : node) {
                result.add(UserStoryDto.builder()
                        .role(getTextOrNull(item, "role"))
                        .action(getTextOrNull(item, "action"))
                        .benefit(getTextOrNull(item, "benefit"))
                        .acceptanceCriteria(parseStringList(item, "acceptanceCriteria"))
                        .notes(getTextOrNull(item, "notes"))
                        .build());
            }
        }
        return result;
    }

    private List<TodoItemDto> parseTodos(JsonNode root) {
        List<TodoItemDto> result = new ArrayList<>();
        JsonNode node = root.path("todos");
        if (node.isArray()) {
            for (JsonNode item : node) {
                result.add(TodoItemDto.builder()
                        .task(getTextOrNull(item, "task"))
                        .category(getTextOrNull(item, "category"))
                        .priority(getTextOrNull(item, "priority"))
                        .estimatedEffort(getTextOrNull(item, "estimatedEffort"))
                        .notes(getTextOrNull(item, "notes"))
                        .build());
            }
        }
        return result;
    }

    private List<ApiDraftDto> parseApiDrafts(JsonNode root) {
        List<ApiDraftDto> result = new ArrayList<>();
        JsonNode node = root.path("apiDrafts");
        if (node.isArray()) {
            for (JsonNode item : node) {
                result.add(ApiDraftDto.builder()
                        .method(getTextOrNull(item, "method"))
                        .path(getTextOrNull(item, "path"))
                        .description(getTextOrNull(item, "description"))
                        .requestBody(getTextOrNull(item, "requestBody"))
                        .responseBody(getTextOrNull(item, "responseBody"))
                        .notes(getTextOrNull(item, "notes"))
                        .build());
            }
        }
        return result;
    }

    private List<DbDraftDto> parseDbDrafts(JsonNode root) {
        List<DbDraftDto> result = new ArrayList<>();
        JsonNode node = root.path("dbDrafts");
        if (node.isArray()) {
            for (JsonNode item : node) {
                result.add(DbDraftDto.builder()
                        .tableName(getTextOrNull(item, "tableName"))
                        .columns(parseStringList(item, "columns"))
                        .notes(getTextOrNull(item, "notes"))
                        .build());
            }
        }
        return result;
    }

    private List<ChecklistItemDto> parseChecklist(JsonNode root, String field) {
        List<ChecklistItemDto> result = new ArrayList<>();
        JsonNode node = root.path(field);
        if (node.isArray()) {
            for (JsonNode item : node) {
                result.add(ChecklistItemDto.builder()
                        .item(getTextOrNull(item, "item"))
                        .category(getTextOrNull(item, "category"))
                        .uncertain(item.path("uncertain").asBoolean(false))
                        .build());
            }
        }
        return result;
    }

    private List<String> parseStringList(JsonNode root, String field) {
        List<String> result = new ArrayList<>();
        JsonNode node = root.path(field);
        if (node.isArray()) {
            for (JsonNode item : node) {
                if (item.isTextual()) {
                    result.add(item.asText());
                }
            }
        }
        return result;
    }

    private String getTextOrNull(JsonNode node, String field) {
        JsonNode value = node.path(field);
        return value.isNull() || value.isMissingNode() ? null : value.asText();
    }
}
