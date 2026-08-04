export const DEEPSEEK_BASE_URL = "https://api.deepseek.com"
export const DEEPSEEK_MODEL = "deepseek-chat"

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string }

export function isAiConfigured(): boolean {
  return Boolean(process.env.DEEPSEEK_API_KEY)
}

async function deepseekFetch(body: Record<string, unknown>) {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY is not configured")
  const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`DeepSeek API error ${res.status}: ${text.slice(0, 300)}`)
  }
  return res
}

export async function chatCompletion(messages: ChatMessage[], opts: { temperature?: number; maxTokens?: number; json?: boolean } = {}) {
  const res = await deepseekFetch({
    model: DEEPSEEK_MODEL,
    messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 1500,
    stream: false,
    response_format: opts.json ? { type: "json_object" } : undefined,
  })
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ""
}

export async function* streamCompletion(messages: ChatMessage[], opts: { temperature?: number; maxTokens?: number } = {}) {
  const res = await deepseekFetch({
    model: DEEPSEEK_MODEL,
    messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 2000,
    stream: true,
  })

  const reader = res.body?.getReader()
  if (!reader) throw new Error("No response body")
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith("data:")) continue
      const payload = trimmed.slice(5).trim()
      if (payload === "[DONE]") return
      try {
        const json = JSON.parse(payload)
        const delta = json.choices?.[0]?.delta?.content
        if (delta) yield delta
      } catch {
        // ignore malformed lines
      }
    }
  }
}
