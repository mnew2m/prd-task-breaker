package com.prdbreaker.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStoryDto {
    private String role;
    private String action;
    private String benefit;
    private List<String> acceptanceCriteria;
    private String notes;
}
