import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bot,
  Send,
  Plus,
  Trash2,
  MessageSquare,
  Sparkles,
  Shield,
  User,
  Loader2,
} from "lucide-react";

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  messages?: Message[];
}

const SUGGESTIONS = [
  "Quais os principais indicadores que devo acompanhar na auditoria de viagens?",
  "Como funciona a conciliacao entre OBT e Backoffice?",
  "Quais as melhores praticas para politica de antecedencia de compra?",
  "Como identificar markups indevidos em tarifas aereas?",
  "O que verificar em uma auditoria de hotel corporativo?",
  "Como funciona a cadeia de custodia digital em uma auditoria?",
];

export default function AiAssistant() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: conversationsList = [], isLoading: loadingList } = useQuery<Conversation[]>({
    queryKey: ["/api/ai/conversations"],
  });

  const { data: activeConversation, isLoading: loadingConversation } = useQuery<Conversation>({
    queryKey: ["/api/ai/conversations", activeConversationId],
    enabled: !!activeConversationId,
  });

  const createConversation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai/conversations", { title: "Nova Conversa" });
      return res.json();
    },
    onSuccess: (data: Conversation) => {
      setActiveConversationId(data.id);
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
    },
  });

  const deleteConversation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/ai/conversations/${id}`);
    },
    onSuccess: () => {
      if (activeConversationId) {
        setActiveConversationId(null);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, streamingContent]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return;

    let conversationId = activeConversationId;

    if (!conversationId) {
      const res = await apiRequest("POST", "/api/ai/conversations", { title: "Nova Conversa" });
      const conv: Conversation = await res.json();
      conversationId = conv.id;
      setActiveConversationId(conv.id);
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
    }

    setInput("");
    setIsStreaming(true);
    setStreamingContent("");

    queryClient.setQueryData(
      ["/api/ai/conversations", conversationId],
      (old: Conversation | undefined) => {
        const msgs = old?.messages || [];
        return {
          ...old,
          id: conversationId,
          title: old?.title || "Nova Conversa",
          createdAt: old?.createdAt || new Date().toISOString(),
          messages: [...msgs, { id: "temp-user", role: "user", content, createdAt: new Date().toISOString() }],
        };
      }
    );

    try {
      const response = await fetch(`/api/ai/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Erro na requisicao");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Sem body");

      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.content) {
              accumulated += event.content;
              setStreamingContent(accumulated);
            }
            if (event.done) {
              setStreamingContent("");
              setIsStreaming(false);
              queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations", conversationId] });
              queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
            }
            if (event.error) {
              throw new Error(event.error);
            }
          } catch (e) {
            if (!(e instanceof SyntaxError)) console.error(e);
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setIsStreaming(false);
      setStreamingContent("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const displayMessages = activeConversation?.messages || [];

  return (
    <div className="flex h-full" data-testid="ai-assistant-page">
      <div className="w-64 border-r flex flex-col bg-muted/30 shrink-0">
        <div className="p-3 border-b">
          <Button
            className="w-full"
            size="sm"
            onClick={() => createConversation.mutate()}
            disabled={createConversation.isPending}
            data-testid="button-new-conversation"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Conversa
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-2 space-y-1">
          {loadingList ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : conversationsList.length === 0 ? (
            <div className="p-4 text-center">
              <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Nenhuma conversa ainda</p>
            </div>
          ) : (
            conversationsList.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer text-sm transition-colors ${
                  activeConversationId === conv.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted text-muted-foreground"
                }`}
                onClick={() => setActiveConversationId(conv.id)}
                data-testid={`conversation-item-${conv.id}`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate flex-1 text-xs">{conv.title}</span>
                <button
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/10 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation.mutate(conv.id);
                  }}
                  data-testid={`button-delete-conversation-${conv.id}`}
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </button>
              </div>
            ))
          )}
        </div>
        <div className="p-3 border-t">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Cadeia de Custodia Ativa</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {!activeConversationId && displayMessages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-lg text-center space-y-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mx-auto">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold" data-testid="text-ai-welcome-title">AuraAI — Assistente de Auditoria</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Especialista em auditoria forense de viagens corporativas (T&E) e eventos (MICE).
                  Pergunte sobre politicas, conciliacoes, indicadores, fornecedores ou metodologia.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTIONS.map((suggestion, i) => (
                  <button
                    key={i}
                    className="text-left text-xs p-3 rounded-lg border hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                    onClick={() => sendMessage(suggestion)}
                    data-testid={`suggestion-${i}`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {loadingConversation ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                    <Skeleton className="h-16 flex-1 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {displayMessages.map((msg, i) => (
                  <div
                    key={msg.id || i}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                    data-testid={`message-${msg.role}-${i}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex items-start justify-center w-8 h-8 rounded-full bg-primary/10 shrink-0 mt-0.5">
                        <Bot className="w-4 h-4 text-primary mt-2" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {msg.content}
                    </div>
                    {msg.role === "user" && (
                      <div className="flex items-start justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 shrink-0 mt-0.5">
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-2" />
                      </div>
                    )}
                  </div>
                ))}
                {isStreaming && streamingContent && (
                  <div className="flex gap-3" data-testid="message-streaming">
                    <div className="flex items-start justify-center w-8 h-8 rounded-full bg-primary/10 shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-primary mt-2" />
                    </div>
                    <div className="max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed bg-muted whitespace-pre-wrap">
                      {streamingContent}
                      <span className="inline-block w-1.5 h-4 bg-primary/60 animate-pulse ml-0.5 align-text-bottom" />
                    </div>
                  </div>
                )}
                {isStreaming && !streamingContent && (
                  <div className="flex gap-3" data-testid="message-thinking">
                    <div className="flex items-start justify-center w-8 h-8 rounded-full bg-primary/10 shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-primary mt-2" />
                    </div>
                    <div className="rounded-xl px-4 py-3 bg-muted flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Analisando...</span>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="border-t p-3">
          <div className="flex gap-2 items-end max-w-3xl mx-auto">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte sobre auditoria, viagens, conciliacoes, politicas..."
              className="flex-1 resize-none rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[44px] max-h-[120px]"
              rows={1}
              disabled={isStreaming}
              data-testid="input-ai-message"
            />
            <Button
              size="icon"
              className="rounded-xl h-[44px] w-[44px] shrink-0"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isStreaming}
              data-testid="button-send-message"
            >
              {isStreaming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            AuraAI — Especialista em auditoria de viagens corporativas e eventos
          </p>
        </div>
      </div>
    </div>
  );
}
