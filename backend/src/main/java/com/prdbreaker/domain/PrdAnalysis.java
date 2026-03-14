package com.prdbreaker.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "prd_analysis")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrdAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "prd_input", columnDefinition = "TEXT", nullable = false)
    private String prdInput;

    @Column(name = "result_json", columnDefinition = "TEXT")
    private String resultJson;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AnalysisStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "useful")
    private Boolean useful;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public void complete(String resultJson) {
        this.resultJson = resultJson;
        this.status = AnalysisStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
    }

    public void fail() {
        this.status = AnalysisStatus.FAILED;
        this.completedAt = LocalDateTime.now();
    }

    public void markUseful(boolean useful) {
        this.useful = useful;
    }
}
