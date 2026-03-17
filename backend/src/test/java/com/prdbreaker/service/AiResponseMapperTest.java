package com.prdbreaker.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prdbreaker.ai.AiResponseValidator;
import com.prdbreaker.domain.AnalysisStatus;
import com.prdbreaker.domain.PrdAnalysis;
import com.prdbreaker.dto.response.PrdAnalysisResponse;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.*;

class AiResponseMapperTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final AiResponseValidator validator = new AiResponseValidator(objectMapper);
    private final AiResponseMapper mapper = new AiResponseMapper(validator, objectMapper);

    private PrdAnalysis entityWith(String json) {
        PrdAnalysis entity = PrdAnalysis.builder()
                .prdInput("test prd")
                .status(AnalysisStatus.COMPLETED)
                .resultJson(json)
                .build();
        entity.complete(json);
        return entity;
    }

    @Test
    void toResponse_fullJson_mapsAllSections() {
        String json = """
                {
                  "features": [{"name":"F1","description":"desc","priority":"HIGH","notes":null}],
                  "userStories": [{"role":"user","action":"do","benefit":"get","acceptanceCriteria":["ac1"],"notes":null}],
                  "todos": [{"task":"T1","category":"BE","priority":"HIGH","estimatedEffort":"1h","notes":null}],
                  "apiDrafts": [{"method":"GET","path":"/api/v1/test","description":"d","requestBody":null,"responseBody":"{}","notes":null}],
                  "dbDrafts": [{"tableName":"users","columns":["id","name"],"notes":null}],
                  "testChecklist": [{"item":"test it","category":"unit","uncertain":false}],
                  "releaseChecklist": [{"item":"deploy","category":"infra","uncertain":false}],
                  "uncertainItems": ["item1"],
                  "readmeDraft": "# README"
                }
                """;

        PrdAnalysisResponse response = mapper.toResponse(entityWith(json));

        assertThat(response.getFeatures()).hasSize(1);
        assertThat(response.getFeatures().get(0).getName()).isEqualTo("F1");
        assertThat(response.getUserStories()).hasSize(1);
        assertThat(response.getUserStories().get(0).getAcceptanceCriteria()).containsExactly("ac1");
        assertThat(response.getTodos()).hasSize(1);
        assertThat(response.getApiDrafts()).hasSize(1);
        assertThat(response.getApiDrafts().get(0).getMethod()).isEqualTo("GET");
        assertThat(response.getDbDrafts()).hasSize(1);
        assertThat(response.getDbDrafts().get(0).getColumns()).containsExactly("id", "name");
        assertThat(response.getTestChecklist()).hasSize(1);
        assertThat(response.getReleaseChecklist()).hasSize(1);
        assertThat(response.getUncertainItems()).containsExactly("item1");
        assertThat(response.getReadmeDraft()).isEqualTo("# README");
    }

    @Test
    void toResponse_emptyArrays_returnsEmptyLists() {
        String json = """
                {
                  "features":[],"userStories":[],"todos":[],
                  "apiDrafts":[],"dbDrafts":[],
                  "testChecklist":[],"releaseChecklist":[],
                  "uncertainItems":[]
                }
                """;

        PrdAnalysisResponse response = mapper.toResponse(entityWith(json));

        assertThat(response.getFeatures()).isEmpty();
        assertThat(response.getReadmeDraft()).isNull();
    }

    @Test
    void toResponse_missingFields_gracefullyDegrades() {
        String json = "{\"features\": [{\"name\":\"F1\"}]}";

        PrdAnalysisResponse response = mapper.toResponse(entityWith(json));

        assertThat(response.getFeatures()).hasSize(1);
        assertThat(response.getFeatures().get(0).getName()).isEqualTo("F1");
        assertThat(response.getUserStories()).isEmpty();
        assertThat(response.getTodos()).isEmpty();
        assertThat(response.getApiDrafts()).isEmpty();
    }

    @Test
    void toResponse_checklistUncertainFlag_parsedCorrectly() {
        String json = """
                {
                  "features":[],"userStories":[],"todos":[],"apiDrafts":[],"dbDrafts":[],
                  "testChecklist": [{"item":"uncertain test","category":"unit","uncertain":true}],
                  "releaseChecklist": [{"item":"normal","category":"infra","uncertain":false}],
                  "uncertainItems":[]
                }
                """;

        PrdAnalysisResponse response = mapper.toResponse(entityWith(json));

        assertThat(response.getTestChecklist().get(0).isUncertain()).isTrue();
        assertThat(response.getReleaseChecklist().get(0).isUncertain()).isFalse();
    }

    @Test
    void toResponse_entityMetadata_mappedCorrectly() {
        Instant fixedTime = Instant.parse("2026-03-15T10:00:00Z");
        String json = "{\"features\":[],\"userStories\":[],\"todos\":[],\"apiDrafts\":[],\"dbDrafts\":[],\"testChecklist\":[],\"releaseChecklist\":[],\"uncertainItems\":[]}";
        PrdAnalysis entity = PrdAnalysis.builder()
                .id(99L)
                .prdInput("test prd")
                .status(AnalysisStatus.COMPLETED)
                .resultJson(json)
                .createdAt(fixedTime)
                .useful(true)
                .build();

        PrdAnalysisResponse response = mapper.toResponse(entity);

        assertThat(response.getId()).isEqualTo(99L);
        assertThat(response.getCreatedAt()).isEqualTo(fixedTime);
        assertThat(response.getUseful()).isTrue();
    }

    @Test
    void toResponse_multipleApiDrafts_allParsed() {
        String json = """
                {
                  "features":[],"userStories":[],"todos":[],
                  "apiDrafts": [
                    {"method":"POST","path":"/api/v1/items","description":"create","requestBody":"{\\"name\\":\\"x\\"}","responseBody":"{\\"id\\":1}","notes":null},
                    {"method":"DELETE","path":"/api/v1/items/1","description":"delete","requestBody":null,"responseBody":null,"notes":null}
                  ],
                  "dbDrafts":[],"testChecklist":[],"releaseChecklist":[],"uncertainItems":[]
                }
                """;

        PrdAnalysisResponse response = mapper.toResponse(entityWith(json));

        assertThat(response.getApiDrafts()).hasSize(2);
        assertThat(response.getApiDrafts().get(0).getRequestBody()).isEqualTo("{\"name\":\"x\"}");
        assertThat(response.getApiDrafts().get(1).getResponseBody()).isNull();
    }
}
