export type AIAction = 'improve' | 'professional' | 'concise' | 'technical' | 'achievement' | 'translate'

const endpoint = 'https://openrouter.ai/api/v1/chat/completions'
const model = 'openai/gpt-4o'

const actionInstructions: Record<AIAction, string> = {
  improve: 'Improve clarity and grammar while preserving every fact.',
  professional: 'Make the wording more professional and polished without adding facts.',
  concise: 'Make the text more concise while preserving its meaning and facts.',
  technical: 'Make the wording more technically precise without inventing technologies.',
  achievement: 'Emphasize outcomes only when they are already stated; never invent metrics.',
  translate: 'Translate the text into English while preserving facts and tone.',
}

function mockRewrite(text: string, action: AIAction) {
  const trimmed = text.trim()
  if (!trimmed) return ''
  if (action === 'concise') return trimmed.split('. ').slice(0, 2).join('. ').trim()
  if (action === 'translate') return `[English translation] ${trimmed}`
  if (action === 'technical') return `${trimmed} Applied structured engineering practices to keep the implementation reliable and maintainable.`
  if (action === 'achievement') return `${trimmed} Delivered a clear and dependable result for the intended users.`
  if (action === 'professional') return trimmed.replace(/^./, (character) => character.toUpperCase())
  return trimmed.replace(/\s+/g, ' ')
}

export async function improveText(text: string, action: AIAction): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
  if (!apiKey) return mockRewrite(text, action)
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'HTTP-Referer': window.location.origin, 'X-Title': 'CVcreate', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: `You are a CV writing assistant. ${actionInstructions[action]} Do not invent companies, technologies, dates, metrics, responsibilities, or experiences. Return only the revised text.\n\nText:\n${text}` }],
    }),
  })
  if (!response.ok) throw new Error(`AI request failed with status ${response.status}`)
  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
  const result = data.choices?.[0]?.message?.content?.trim()
  if (!result) throw new Error('The AI response did not contain revised text')
  return result
}
