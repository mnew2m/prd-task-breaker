package com.prdbreaker.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TodoItemDto {
    private String task;
    private String category;
    private String priority;
    private String estimatedEffort;
    private String notes;
}
