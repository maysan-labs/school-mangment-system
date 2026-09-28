"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Loader2,
  Lightbulb,
  TrendingUp,
  AlertCircle,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { handleAIQuery } from "@/lib/services/insights";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "info" | "suggestion" | "warning" | "insight";
}

const QUICK_ACTIONS = [
  { label: "Student Analytics", icon: TrendingUp, prompt: "Show me student performance insights" },
  { label: "Attendance Alerts", icon: AlertCircle, prompt: "Which classes have low attendance?" },
  { label: "Fee Collection Tips", icon: Lightbulb, prompt: "How can I improve fee collection?" },
  { label: "Academic Report", icon: BookOpen, prompt: "Generate a summary of academic performance" },
];

// Simulated AI responses for demo (can be replaced with real LLM API)
const AI_RESPONSES: Record<string, string> = {
  "attendance": "📊 **Attendance Analysis**\n\n- Class 10-A has 92% attendance (excellent)\n- Class 9-B shows 78% attendance (needs attention)\n- 15 students have attendance below 75%\n\n**Recommendations:**\n• Send automated reminders to parents\n• Schedule parent-teacher meetings for low attendance students\n• Consider incentive programs for consistent attendees",
  
  "fees": "💰 **Fee Collection Insights**\n\n- Overall collection rate: 82% this month\n- 45 students have pending fees over ₹5000\n- Top performing class: Class 12-A (95% collection)\n\n**Action Items:**\n• Send payment reminders to 23 families\n• Offer 5% discount for early payment (effective strategy)\n• Consider payment plan options for struggling families",
  
  "performance": "📈 **Academic Performance**\n\n**Top Performers:**\n• Class 10-A: Average 85%\n• Class 12-Science: Average 82%\n\n**Areas Needing Focus:**\n• Mathematics: 15% scoring below 50%\n• English: 8% below passing marks\n\n**AI Recommendations:**\n• Schedule extra math tutorials\n• Pair struggling students with top performers\n• Regular assessment every 2 weeks",
  
  "default": "🤖 **AI Assistant Ready**\n\nI can help you with:\n• 📊 Real-time analytics and insights\n• 💰 Fee collection optimization\n• 📚 Academic performance analysis\n• ⚠️ Anomaly detection\n• 📅 Scheduling recommendations\n\nJust ask me a question or use the quick actions above!"
};

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: AI_RESPONSES.default,
      timestamp: new Date(),
      type: "info"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: uuidv4(),
      role: "user",
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await handleAIQuery(content);
      let response = AI_RESPONSES.default;
      if (result.success && "answer" in result && result.answer) {
        response = result.answer as string;
      } else {
        const lowerContent = content.toLowerCase();
        if (lowerContent.includes("attendance")) response = AI_RESPONSES.attendance;
        else if (lowerContent.includes("fee") || lowerContent.includes("payment")) response = AI_RESPONSES.fees;
        else if (lowerContent.includes("performance") || lowerContent.includes("grade") || lowerContent.includes("academic")) response = AI_RESPONSES.performance;
      }

      const aiMsg: Message = {
        id: uuidv4(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
        type: "insight"
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const aiMsg: Message = {
        id: uuidv4(),
        role: "assistant",
        content: "Sorry, I could not fetch live data. Showing cached insights.",
        timestamp: new Date(),
        type: "warning"
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-emerald-600 to-blue-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all z-50"
      >
        <Sparkles className="h-6 w-6 text-white" />
      </Button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
          {/* Header */}
          <div className="p-4 border-b bg-gradient-to-r from-emerald-600 to-blue-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="font-semibold">AI Assistant</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-3 text-sm",
                    msg.role === "user"
                      ? "bg-emerald-600 text-white"
                      : "bg-white border border-slate-200 text-slate-700"
                  )}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
                {msg.role === "user" && (
                  <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-600 to-blue-600 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="p-3 border-t bg-white dark:bg-slate-900">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Quick Actions</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.prompt)}
                  className="text-xs h-7 rounded-full"
                >
                  <action.icon className="h-3 w-3 mr-1" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-white dark:bg-slate-900">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 rounded-md"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading} className="rounded-md bg-emerald-600">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}