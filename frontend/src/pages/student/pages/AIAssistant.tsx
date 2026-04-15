import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Bot, Send, Sparkles, RotateCcw, Clock3, MessageSquareText } from "lucide-react";
import { colors, fonts, radius, shadows } from "../../../styles/tokens";
import { SubPageHeader, StatsGrid } from "../../admin/components/ui/index";
import { sendAssistantMessage } from "../../../services/aiApi";

type MessageRole = "assistant" | "user";

interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
}

interface AssistantApiResponse {
  reply: string;
}

const starterPrompts = [
  "What classes do I have today?",
  "Summarize my timetable for this week.",
  "When is my next exam?",
  "Help me plan my study time around my schedule.",
];

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    text: "I can help you understand your timetable, exams, classes, and schedule conflicts. Ask me anything about your student portal.",
  },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const card = {
    background: colors.bg.base,
    border: `1px solid ${colors.border.medium}`,
    borderRadius: radius.lg,
    boxShadow: shadows.sm,
  };

  const cardInner = {
    background: colors.bg.raised,
    border: `1px solid ${colors.border.subtle}`,
    borderRadius: radius.md,
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const conversationStats = useMemo(() => {
    const userCount = messages.filter((message) => message.role === "user").length;
    const assistantCount = messages.filter((message) => message.role === "assistant").length;
    return [
      { num: messages.length.toString(), label: "Messages", color: colors.primary.main },
      { num: assistantCount.toString(), label: "Replies", color: colors.success.main },
      { num: userCount.toString(), label: "Questions", color: colors.info.main },
      { num: isSending ? "Typing" : "Ready", label: "Status", color: colors.warning.main },
    ];
  }, [isSending, messages]);

  const historyForApi = messages
    .filter((message) => message.id !== "welcome")
    .map((message) => ({
      role: message.role,
      text: message.text,
    }));

  const handleSend = async (promptText: string = input) => {
    const trimmed = promptText.trim();
    if (!trimmed || isSending) return;

    setError(null);
    setIsSending(true);
    setInput("");

    const userMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      text: trimmed,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);

    try {
      const result = (await sendAssistantMessage(trimmed, historyForApi.concat({ role: "user", text: trimmed }))) as AssistantApiResponse;
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          text: result.reply,
        },
      ]);
    } catch (chatError: unknown) {
      const friendlyError = chatError instanceof Error ? chatError.message : "Assistant request failed";
      setError(friendlyError);
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-error`,
          role: "assistant",
          text: friendlyError.includes("quota") || friendlyError.includes("rate limit")
            ? "I hit a Gemini usage limit right now. Please try again in a minute."
            : "I could not answer right now. Please check backend status and API configuration, then retry.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const resetConversation = () => {
    setMessages(initialMessages);
    setInput("");
    setError(null);
  };

  return (
    <>
      <SubPageHeader
        title="AI Assistant"
        subtitle="Ask Gemini about your timetable, exams, and student schedule"
        accentColor={colors.primary.main}
        actions={
          <button
            onClick={resetConversation}
            style={{
              ...cardInner,
              padding: "8px 14px",
              color: colors.text.primary,
              fontSize: fonts.size.sm,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontFamily: fonts.body,
            }}
          >
            <RotateCcw size={14} />
            Clear chat
          </button>
        }
      />

      {error && (
        <div
          style={{
            margin: "12px",
            padding: "10px 16px",
            background: colors.error.ghost,
            border: `1px solid ${colors.error.border}`,
            borderRadius: radius.md,
            color: colors.error.main,
            fontSize: fonts.size.sm,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ flex: 1, display: "flex", margin: "12px", gap: "12px", overflow: "hidden" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px", overflow: "hidden" }}>
          <StatsGrid stats={conversationStats} />

          <div style={{ ...card, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div
              style={{
                padding: "14px 16px",
                borderBottom: `1px solid ${colors.border.medium}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div>
                <div style={{ fontFamily: fonts.heading, fontWeight: fonts.weight.semibold, color: colors.text.primary }}>
                  Chat with your assistant
                </div>
                <div style={{ fontSize: fonts.size.xs, color: colors.text.muted }}>
                  Gemini will answer from the student timetable perspective
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: colors.text.muted, fontSize: fonts.size.xs }}>
                <Clock3 size={14} />
                Replies are generated live
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "16px", background: colors.bg.base }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {messages.map((message) => {
                  const isUser = message.role === "user";
                  return (
                    <div
                      key={message.id}
                      style={{
                        display: "flex",
                        justifyContent: isUser ? "flex-end" : "flex-start",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "78%",
                          padding: "12px 14px",
                          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                          background: isUser ? colors.primary.main : colors.bg.raised,
                          color: isUser ? "#fff" : colors.text.primary,
                          border: isUser ? "none" : `1px solid ${colors.border.medium}`,
                          boxShadow: isUser ? shadows.sm : "none",
                          whiteSpace: "pre-wrap",
                          lineHeight: 1.55,
                          fontSize: fonts.size.sm,
                        }}
                      >
                        {!isUser && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginBottom: "8px",
                              color: colors.primary.main,
                              fontSize: fonts.size.xs,
                              fontWeight: fonts.weight.semibold,
                            }}
                          >
                            <Bot size={14} />
                            Gemini Assistant
                          </div>
                        )}
                        {message.text}
                      </div>
                    </div>
                  );
                })}

                {isSending && (
                  <div style={{ display: "flex", justifyContent: "flex-start" }}>
                    <div
                      style={{
                        padding: "12px 14px",
                        borderRadius: "16px 16px 16px 4px",
                        background: colors.bg.raised,
                        border: `1px solid ${colors.border.medium}`,
                        color: colors.text.muted,
                        fontSize: fonts.size.sm,
                      }}
                    >
                      Gemini is typing...
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </div>

            <div
              style={{
                borderTop: `1px solid ${colors.border.medium}`,
                padding: "14px",
                background: colors.bg.base,
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    disabled={isSending}
                    style={{
                      ...cardInner,
                      padding: "8px 12px",
                      color: colors.text.secondary,
                      fontSize: fonts.size.xs,
                      cursor: isSending ? "not-allowed" : "pointer",
                      fontFamily: fonts.body,
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about classes, exams, schedule conflicts, or study planning..."
                  rows={3}
                  style={{
                    flex: 1,
                    resize: "none",
                    borderRadius: radius.md,
                    border: `1px solid ${colors.border.medium}`,
                    background: colors.bg.raised,
                    color: colors.text.primary,
                    padding: "12px 14px",
                    fontFamily: fonts.body,
                    fontSize: fonts.size.sm,
                    outline: "none",
                  }}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isSending}
                  style={{
                    background: input.trim() && !isSending ? colors.primary.main : colors.border.medium,
                    border: "none",
                    borderRadius: radius.md,
                    padding: "12px 16px",
                    color: "#fff",
                    cursor: input.trim() && !isSending ? "pointer" : "not-allowed",
                    fontFamily: fonts.body,
                    fontSize: fonts.size.sm,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    minWidth: "110px",
                    justifyContent: "center",
                  }}
                >
                  <Send size={14} />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ width: "280px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ ...card, padding: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", color: colors.primary.main }}>
              <Sparkles size={16} />
              <div style={{ fontFamily: fonts.heading, fontWeight: fonts.weight.semibold }}>How to use</div>
            </div>
            <div style={{ fontSize: fonts.size.sm, color: colors.text.secondary, lineHeight: 1.6 }}>
              Ask short questions or give full context. The assistant can summarize your timetable, suggest study planning, and explain schedule-related information.
            </div>
          </div>

          <div style={{ ...card, padding: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", color: colors.primary.main }}>
              <MessageSquareText size={16} />
              <div style={{ fontFamily: fonts.heading, fontWeight: fonts.weight.semibold }}>Good prompts</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  disabled={isSending}
                  style={{
                    ...cardInner,
                    padding: "10px 12px",
                    textAlign: "left",
                    color: colors.text.secondary,
                    fontSize: fonts.size.sm,
                    cursor: isSending ? "not-allowed" : "pointer",
                    fontFamily: fonts.body,
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}