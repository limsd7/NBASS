// 학생 식별자 단일 원천 (성적/목표/캐시/쿼터 네임스페이스 통일용)
// - 'ID-' prefix 임시 ID는 로그인 이메일 기준으로 정규화
// - GradeManagementView/StudyGoalsAndAIPlan/GradeSimulationView가 동일 함수 사용
export function resolveEffectiveStudentId(
  student: { id?: string } | null | undefined
): string {
  const id = student?.id;
  if (id && !id.startsWith('ID-')) return id;
  try {
    const email = localStorage.getItem('nbass_current_email')?.trim();
    if (email) return email;
  } catch {
    /* storage 접근 실패 시 폴백 */
  }
  return id || 'limsd7';
}
