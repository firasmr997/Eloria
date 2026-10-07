package com.eloria.mapper;

import com.eloria.dto.result.ResultDto;
import com.eloria.dto.result.ResultRequest;
import com.eloria.entity.Result;
import com.eloria.util.Text;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ResultMapper {

    private final TreatmentMapper treatmentMapper;

    public ResultDto toDto(Result result) {
        return new ResultDto(result.getId(), treatmentMapper.toRef(result.getTreatment()), result.getBeforeImageUrl(),
                result.getAfterImageUrl(), result.getTitle(), result.getDescription(), result.getDurationLabel(),
                result.isFeatured(), result.getDisplayOrder(), result.getCreatedAt(), result.getUpdatedAt());
    }

    /** Copies request fields; the treatment link is resolved by the service. */
    public void apply(ResultRequest request, Result result) {
        result.setBeforeImageUrl(request.beforeImageUrl().trim());
        result.setAfterImageUrl(request.afterImageUrl().trim());
        result.setTitle(request.title().trim());
        result.setDescription(Text.clean(request.description()));
        result.setDurationLabel(Text.clean(request.durationLabel()));
        result.setDisplayOrder(request.displayOrder() == null ? 0 : request.displayOrder());
        result.setFeatured(Boolean.TRUE.equals(request.featured()));
    }
}
