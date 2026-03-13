package com.prdbreaker.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeatureDto {
    private String name;
    private String description;
    private String priority;
    private String notes;
}
