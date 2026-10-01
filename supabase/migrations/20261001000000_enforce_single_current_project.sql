WITH ranked_current_projects AS (
  SELECT
    id,
    row_number() OVER (ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id) AS position
  FROM public.projects
  WHERE is_currently_building IS TRUE
)
UPDATE public.projects AS project
SET is_currently_building = FALSE
FROM ranked_current_projects AS ranked
WHERE project.id = ranked.id
  AND ranked.position > 1;

CREATE UNIQUE INDEX IF NOT EXISTS projects_single_currently_building_idx
  ON public.projects (is_currently_building)
  WHERE is_currently_building IS TRUE;