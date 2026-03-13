package com.prdbreaker.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiDraftDto {
    private String method;
    private String path;
    private String description;
    private String requestBody;
    private String responseBody;
    private String notes;
}
