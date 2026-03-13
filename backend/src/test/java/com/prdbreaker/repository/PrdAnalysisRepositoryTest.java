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
}
