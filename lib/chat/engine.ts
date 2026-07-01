export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatEngineOptions {
  messages: ChatMessage[];
  characterId: string;
}

export function streamChatResponse(options: ChatEngineOptions): ReadableStream<string> {
  const { messages } = options;

  const apiBaseUrl = process.env.CHAT_API_BASE_URL;
  const apiKey = process.env.CHAT_API_KEY;
  const model = process.env.CHAT_MODEL;
  const systemPrompt = process.env.CHAT_SYSTEM_PROMPT || "You are a digital companion in an AI girlfriend app called provoque.ai";
  const temperature = parseFloat(process.env.CHAT_TEMPERATURE || "0.7");

  if (!apiBaseUrl || !apiKey || !model) {
    throw new Error("Missing chat engine env vars: CHAT_API_BASE_URL, CHAT_API_KEY, CHAT_MODEL");
  }

  const apiMessages = [
    { role: "system" as const, content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  return new ReadableStream<string>({
    async start(controller) {
      try {
        const response = await fetch(`${apiBaseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: apiMessages,
            temperature,
            stream: true,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          controller.error(new Error(`API error ${response.status}: ${errorText}`));
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          controller.error(new Error("No response body"));
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;

            const data = trimmed.slice(6);
            if (data === "[DONE]") {
              controller.close();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(content);
              }
            } catch {
              // Skip malformed JSON lines
            }
          }
        }

        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}
