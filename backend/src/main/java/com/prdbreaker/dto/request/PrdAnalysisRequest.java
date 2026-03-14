package com.prdbreaker.dto.request;

import com.prdbreaker.validation.ValidPrdContent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PrdAnalysisRequest {

    @NotBlank(message = "PRD content must not be blank")
    @Size(min = 50, max = 50000, message = "PRD content must be between 50 and 50000 characters")
    @ValidPrdContent
    private String prdContent;
}
