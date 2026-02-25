import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bot,
  Send,
  Plus,
  Trash2,
  MessageSquare,
  Sparkles,
  User,
  Loader2,
  X,
  ChevronLeft,
  History,
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
  "Quais indicadores acompanhar na auditoria de viagens?",
  "Como funciona a conciliacao OBT vs Backoffice?",
  "Como identificar markups indevidos em tarifas aereas?",
  "O que verificar em auditoria de hotel corporativo?",
];

export function FloatingAiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: conversationsList = [], isLoading: loadingList } = useQuery<Conversation[]>({
    queryKey: ["/api/ai/conversations"],
    enabled: isOpen,
  });

  const { data: activeConversation, isLoading: loadingConversation } = useQuery<Conversation>({
    queryKey: ["/api/ai/conversations", activeConversationId],
    enabled: !!activeConversationId && isOpen,
  });

  const createConversation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai/conversations", { title: "Nova Conversa" });
      return res.json();
    },
    onSuccess: (data: Conversation) => {
      setActiveConversationId(data.id);
      setShowHistory(false);
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

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, activeConversationId]);

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
  const hasMessages = activeConversationId && displayMessages.length > 0;

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-4 py-3 group"
          data-testid="button-floating-ai-open"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-medium">AuraAI</span>
        </button>
      )}

      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 w-[420px] h-[600px] max-h-[80vh] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200"
          data-testid="floating-ai-panel"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              {showHistory ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setShowHistory(false)}
                  data-testid="button-ai-back"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              ) : (
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
              )}
              <div>
                <h3 className="text-sm font-semibold leading-none" data-testid="text-ai-panel-title">
                  {showHistory ? "Historico" : "AuraAI"}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {showHistory ? "Conversas anteriores" : "Assistente de Auditoria"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!showHistory && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setShowHistory(true)}
                    data-testid="button-ai-history"
                  >
                    <History className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      setActiveConversationId(null);
                      setStreamingContent("");
                      setIsStreaming(false);
                    }}
                    data-testid="button-ai-new-chat"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsOpen(false)}
                data-testid="button-floating-ai-close"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {showHistory ? (
            <div className="flex-1 overflow-auto p-3 space-y-1">
              <Button
                className="w-full mb-2"
                size="sm"
                variant="outline"
                onClick={() => createConversation.mutate()}
                disabled={createConversation.isPending}
                data-testid="button-new-conversation-history"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Conversa
              </Button>
              {loadingList ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : conversationsList.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Nenhuma conversa ainda</p>
                </div>
              ) : (
                conversationsList.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group flex items-center gap-2 rounded-lg px-3 py-2.5 cursor-pointer text-sm transition-colors ${
                      activeConversationId === conv.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                    onClick={() => {
                      setActiveConversationId(conv.id);
                      setShowHistory(false);
                    }}
                    data-testid={`float-conversation-item-${conv.id}`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate flex-1 text-xs">{conv.title}</span>
                    <button
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation.mutate(conv.id);
                      }}
                      data-testid={`button-float-delete-${conv.id}`}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : !hasMessages && !activeConversationId ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center space-y-4 w-full">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mx-auto">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium" data-testid="text-float-ai-welcome">AuraAI</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Especialista em auditoria forense de viagens e eventos corporativos.
                  </p>
                </div>
                <div className="space-y-2">
                  {SUGGESTIONS.map((suggestion, i) => (
                    <button
                      key={i}
                      className="w-full text-left text-xs p-2.5 rounded-lg border hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                      onClick={() => sendMessage(suggestion)}
                      data-testid={`float-suggestion-${i}`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {loadingConversation ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex gap-2">
                      <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                      <Skeleton className="h-12 flex-1 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {displayMessages.map((msg, i) => (
                    <div
                      key={msg.id || i}
                      className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
                      data-testid={`float-message-${msg.role}-${i}`}
                    >
                      {msg.role === "assistant" && (
                        <div className="flex items-start justify-center w-7 h-7 rounded-full bg-primary/10 shrink-0 mt-0.5">
                          <Bot className="w-3.5 h-3.5 text-primary mt-1.5" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {msg.content}
                      </div>
                      {msg.role === "user" && (
                        <div className="flex items-start justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 shrink-0 mt-0.5">
                          <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-1.5" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isStreaming && streamingContent && (
                    <div className="flex gap-2" data-testid="float-message-streaming">
                      <div className="flex items-start justify-center w-7 h-7 rounded-full bg-primary/10 shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-primary mt-1.5" />
                      </div>
                      <div className="max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed bg-muted whitespace-pre-wrap">
                        {streamingContent}
                        <span className="inline-block w-1 h-3 bg-primary/60 animate-pulse ml-0.5 align-text-bottom" />
                      </div>
                    </div>
                  )}
                  {isStreaming && !streamingContent && (
                    <div className="flex gap-2" data-testid="float-message-thinking">
                      <div className="flex items-start justify-center w-7 h-7 rounded-full bg-primary/10 shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-primary mt-1.5" />
                      </div>
                      <div className="rounded-xl px-3 py-2 bg-muted flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">Analisando...</span>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          <div className="border-t p-3">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pergunte sobre auditoria, viagens, politicas..."
                className="flex-1 resize-none rounded-xl border bg-background px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[40px] max-h-[80px]"
                rows={1}
                disabled={isStreaming}
                data-testid="input-float-ai-message"
              />
              <Button
                size="icon"
                className="rounded-xl h-[40px] w-[40px] shrink-0"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isStreaming}
                data-testid="button-float-send"
              >
                {isStreaming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
