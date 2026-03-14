package com.prdbreaker.repository;

import com.prdbreaker.domain.AnalysisStatus;
import com.prdbreaker.domain.PrdAnalysis;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
class PrdAnalysisRepositoryTest {

    @Autowired
    private PrdAnalysisRepository repository;

    @Test
    void save_andFindById_returnsEntity() {
        PrdAnalysis entity = PrdAnalysis.builder()
                .prdInput("테스트 PRD 내용입니다")
                .status(AnalysisStatus.PENDING)
                .build();

        PrdAnalysis saved = repository.save(entity);
        Optional<PrdAnalysis> found = repository.findById(saved.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getPrdInput()).isEqualTo("테스트 PRD 내용입니다");
        assertThat(found.get().getStatus()).isEqualTo(AnalysisStatus.PENDING);
        assertThat(found.get().getCreatedAt()).isNotNull();
    }

    @Test
    void complete_updatesStatusAndResultJson() {
        PrdAnalysis entity = PrdAnalysis.builder()
                .prdInput("PRD 내용")
                .status(AnalysisStatus.PENDING)
                .build();
        PrdAnalysis saved = repository.save(entity);

        saved.complete("{\"features\":[]}");
        repository.save(saved);

        PrdAnalysis found = repository.findById(saved.getId()).orElseThrow();
        assertThat(found.getStatus()).isEqualTo(AnalysisStatus.COMPLETED);
        assertThat(found.getResultJson()).isEqualTo("{\"features\":[]}");
        assertThat(found.getCompletedAt()).isNotNull();
    }

    @Test
    void fail_updatesStatusToFailed() {
        PrdAnalysis entity = PrdAnalysis.builder()
                .prdInput("PRD 내용")
                .status(AnalysisStatus.PENDING)
                .build();
        PrdAnalysis saved = repository.save(entity);

        saved.fail();
        repository.save(saved);

        PrdAnalysis found = repository.findById(saved.getId()).orElseThrow();
        assertThat(found.getStatus()).isEqualTo(AnalysisStatus.FAILED);
        assertThat(found.getCompletedAt()).isNotNull();
    }

    @Test
    void findAllByOrderByCreatedAtDesc_paginationLimitsResults() {
        repository.save(PrdAnalysis.builder().prdInput("PRD 1").status(AnalysisStatus.COMPLETED).build());
        repository.save(PrdAnalysis.builder().prdInput("PRD 2").status(AnalysisStatus.COMPLETED).build());
        repository.save(PrdAnalysis.builder().prdInput("PRD 3").status(AnalysisStatus.COMPLETED).build());

        List<PrdAnalysis> results = repository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 2));

        assertThat(results).hasSize(2);
    }

    @Test
    void findAllByOrderByCreatedAtDesc_emptyRepository_returnsEmptyList() {
        List<PrdAnalysis> results = repository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 10));
        assertThat(results).isEmpty();
    }

    @Test
    void findByStatusOrderByCreatedAtDesc_returnsOnlyMatchingStatus() {
        PrdAnalysis completed = PrdAnalysis.builder().prdInput("완료").status(AnalysisStatus.COMPLETED).build();
        PrdAnalysis pending = PrdAnalysis.builder().prdInput("보류").status(AnalysisStatus.PENDING).build();
        PrdAnalysis failed = PrdAnalysis.builder().prdInput("실패").status(AnalysisStatus.FAILED).build();
        completed.complete("{\"features\":[]}");
        repository.save(completed);
        repository.save(pending);
        repository.save(failed);

        List<PrdAnalysis> results = repository.findByStatusOrderByCreatedAtDesc(
                AnalysisStatus.COMPLETED, PageRequest.of(0, 10));

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getStatus()).isEqualTo(AnalysisStatus.COMPLETED);
    }

    @Test
    void findByStatusOrderByCreatedAtDesc_paginationLimitsResults() {
        for (int i = 0; i < 5; i++) {
            PrdAnalysis e = PrdAnalysis.builder()
                    .prdInput("PRD " + i)
                    .status(AnalysisStatus.COMPLETED)
                    .build();
            repository.save(e);
        }

        List<PrdAnalysis> results = repository.findByStatusOrderByCreatedAtDesc(
                AnalysisStatus.COMPLETED, PageRequest.of(0, 3));

        assertThat(results).hasSize(3);
    }

    @Test
    void findByStatusOrderByCreatedAtDesc_returnsResultsInDescOrder() {
        PrdAnalysis first = PrdAnalysis.builder().prdInput("PRD A").status(AnalysisStatus.COMPLETED).build();
        PrdAnalysis second = PrdAnalysis.builder().prdInput("PRD B").status(AnalysisStatus.COMPLETED).build();
        PrdAnalysis third = PrdAnalysis.builder().prdInput("PRD C").status(AnalysisStatus.COMPLETED).build();
        repository.save(first);
        repository.save(second);
        repository.save(third);

        List<PrdAnalysis> results = repository.findByStatusOrderByCreatedAtDesc(
                AnalysisStatus.COMPLETED, PageRequest.of(0, 10));

        assertThat(results).hasSize(3);
        // 가장 나중에 저장된 항목이 먼저 반환되어야 한다
        for (int i = 0; i < results.size() - 1; i++) {
            assertThat(results.get(i).getCreatedAt())
                    .isAfterOrEqualTo(results.get(i + 1).getCreatedAt());
        }
    }

    @Test
    void findByStatusOrderByCreatedAtDesc_failedAndPendingExcluded() {
        PrdAnalysis completed = PrdAnalysis.builder().prdInput("완료").status(AnalysisStatus.COMPLETED).build();
        PrdAnalysis failed = PrdAnalysis.builder().prdInput("실패").status(AnalysisStatus.FAILED).build();
        PrdAnalysis pending = PrdAnalysis.builder().prdInput("대기").status(AnalysisStatus.PENDING).build();
        repository.save(completed);
        repository.save(failed);
        repository.save(pending);

        List<PrdAnalysis> results = repository.findByStatusOrderByCreatedAtDesc(
                AnalysisStatus.COMPLETED, PageRequest.of(0, 10));

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getStatus()).isEqualTo(AnalysisStatus.COMPLETED);
        assertThat(results).noneMatch(e -> e.getStatus() == AnalysisStatus.FAILED);
        assertThat(results).noneMatch(e -> e.getStatus() == AnalysisStatus.PENDING);
    }
}
