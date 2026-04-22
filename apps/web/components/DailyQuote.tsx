'use client'
import { useMemo } from 'react'

const QUOTES = [
  { text: '먹기 싫은 개구리는 아침에 먹어라.', attr: 'Mark Twain' },
  { text: '미루면 더 무거워진다.', attr: null },
  { text: '가장 하기 싫은 그것이 답이다.', attr: null },
  { text: '행동이 기분을 만든다. 반대가 아니라.', attr: null },
  { text: '오늘 도망친 일이 내일 너를 기다린다.', attr: null },
  { text: '완료가 완벽을 이긴다.', attr: null },
  { text: '10분만. 딱 10분만 시작해봐.', attr: null },
  { text: '싫은 일을 먼저 끝낸 사람의 오후는 다르다.', attr: null },
  { text: '두려움은 시작 전에 가장 크다.', attr: null },
  { text: '지금 불편한 것이 나중에 편한 것이다.', attr: null },
  { text: '성공한 사람들의 비밀: 하기 싫어도 한다.', attr: null },
  { text: '안 해서 후회가 해서 후회보다 오래간다.', attr: null },
  { text: '그냥 해. 나중의 나는 고마워할 거야.', attr: null },
  { text: '미루는 건 결정이야. 도망치는 결정.', attr: null },
  { text: '완벽한 타이밍은 없다. 지금이 그나마 제일 낫다.', attr: null },
  { text: 'Done is better than perfect.', attr: null },
  { text: '시작이 반이다. 나머지 반은 그냥 계속하는 거야.', attr: null },
  { text: '오늘 피한 일은 내일의 나에게 두 배로 돌아온다.', attr: null },
  { text: '하기 싫다는 감정 자체가 중요하다는 신호다.', attr: null },
  { text: 'The best time was yesterday. Second best is now.', attr: null },
  { text: '지금 이 순간이 나중이 되는 거야.', attr: null },
  { text: '불편함을 향해 걸어가는 것이 성장이다.', attr: null },
  { text: '할 일 목록은 미래의 나와의 약속이다.', attr: null },
  { text: '작은 시작이 큰 두려움을 이긴다.', attr: null },
]

export function DailyQuote() {
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], [])

  return (
    <div style={{
      padding: '12px 16px',
      borderLeft: '2px solid rgba(250,255,105,0.3)',
      marginBottom: '4px',
    }}>
      <p style={{
        fontSize: '13px',
        color: '#9a9a9a',
        lineHeight: 1.5,
        fontStyle: 'italic',
        wordBreak: 'keep-all',
      }}>
        {quote.text}
      </p>
      {quote.attr && (
        <p style={{ fontSize: '11px', color: '#484848', marginTop: '3px' }}>— {quote.attr}</p>
      )}
    </div>
  )
}
