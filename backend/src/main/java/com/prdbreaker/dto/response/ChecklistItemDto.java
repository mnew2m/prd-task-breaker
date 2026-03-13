package com.prdbreaker.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistItemDto {
    private String item;
    private String category;
    private boolean uncertain;
}
