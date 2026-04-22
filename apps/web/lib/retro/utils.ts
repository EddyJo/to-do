export type RetroMood = 'encouraging' | 'mixed' | 'concern'

export interface RetroResult {
  mood: RetroMood
  message: string
  highlight: string
}

export function shouldShowRetro(now: Date, lastSeenDate: string | null): boolean {
  if (now.getHours() < 8) return false
  const todayStr = now.toISOString().slice(0, 10) // 'YYYY-MM-DD'
  return lastSeenDate !== todayStr
}

export function buildRetroPrompt(completedTitles: string[], pendingTitles: string[]): string {
  const doneCount = completedTitles.length
  const pendingCount = pendingTitles.length

  const doneSection = doneCount > 0
    ? `완료한 항목 (${doneCount}개):\n${completedTitles.map(t => `- ${t}`).join('\n')}`
    : `완료한 항목: 없음 (0개 완료)`

  const pendingSection = pendingCount > 0
    ? `미완료 항목 (${pendingCount}개):\n${pendingTitles.map(t => `- ${t}`).join('\n')}`
    : `미완료 항목: 없음`

  return `어제의 할 일 처리 현황을 바탕으로 짧은 회고를 한국어로 작성해줘.

${doneSection}

${pendingSection}

회고 작성 기준:
- 모두 완료했다면: 따뜻하게 칭찬하고 오늘도 이어가도록 독려
- 일부만 완료했다면: 한 것을 인정하되 남은 것의 중요성을 부드럽게 상기
- 아무것도 완료 못 했다면: 솔직하게 미완료의 리스크와 파급 효과를 구체적으로 말하되 공격적이지 않게, 오늘 시작하도록 촉구

반드시 아래 JSON 형식만 반환해 (다른 텍스트 없이):
{
  "mood": "encouraging" | "mixed" | "concern",
  "message": "회고 메시지 (2-3문장, 구체적으로)",
  "highlight": "핵심 한 줄 (20자 이내)"
}`
}

export function parseRetroResponse(raw: string): RetroResult | null {
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
    const validMoods: RetroMood[] = ['encouraging', 'mixed', 'concern']
    const mood: RetroMood = validMoods.includes(parsed.mood) ? parsed.mood : 'mixed'
    return {
      mood,
      message: String(parsed.message ?? ''),
      highlight: String(parsed.highlight ?? ''),
    }
  } catch {
    return null
  }
}
