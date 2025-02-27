"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { GoogleGenerativeAI } from "@google/generative-ai";

type MessageType = {
  text: string;
  sender: "user" | "bot";
};

interface Session {
  id: string;
  name: string;
  messages: MessageType[];
}

interface SessionsMap {
  [key: string]: Session;
}

const apiKey = process.env.NEXT_PUBLIC_RAG_MODEL_API_KEY;
if (!apiKey) {
  throw new Error("API key is not defined");
}
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export default function ChatbotPage() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [sessions, setSessions] = useState<SessionsMap>({});
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedSessions = localStorage.getItem("chatSessions");
    const currentSessionId = localStorage.getItem("currentSessionId");

    let parsedSessions: SessionsMap = {};
    if (savedSessions) {
      try {
        parsedSessions = JSON.parse(savedSessions);
        setSessions(parsedSessions);
      } catch (e) {
        console.error("Error parsing saved sessions:", e);
      }
    }

    if (currentSessionId && parsedSessions[currentSessionId]) {
      setSessionId(currentSessionId);
      setMessages(parsedSessions[currentSessionId].messages || []);
    } else {
      startNewSession();
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (sessionId && sessions[sessionId]) {
      localStorage.setItem("chatSessions", JSON.stringify(sessions));
    }
  }, [sessions]);

  function generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  function cleanTextOutput(text: string): string {
    return text.replace(/```[a-z]*\n|```/g, "").replace(/\n{3,}/g, "\n\n").replace(/\*\*/g, "").trim();
  }

  async function sendMessage() {
    if (!input.trim()) return;
    setIsLoading(true);

    const userMessage: MessageType = { text: input, sender: "user" };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      const history = updatedMessages.map(msg => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

      const chatSession = model.startChat({
        generationConfig: {
          temperature: 1,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
          responseMimeType: "text/plain",
        },
        history: history.slice(-10),
      });

      const result = await chatSession.sendMessage(input);
      const botResponse = await result.response.text();
      const cleanedResponse = cleanTextOutput(botResponse);

      const botMessage: MessageType = { text: cleanedResponse, sender: "bot" };

      const newMessages = [...updatedMessages, botMessage];
      setMessages(newMessages);

      setSessions(prevSessions => {
        const updatedSessions: SessionsMap = {
          ...prevSessions,
          [sessionId]: {
            ...prevSessions[sessionId],
            messages: newMessages,
          },
        };
        localStorage.setItem("chatSessions", JSON.stringify(updatedSessions));
        return updatedSessions;
      });
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, { text: "Sorry, I couldn't process your request.", sender: "bot" }]);
    }

    setInput("");
    setIsLoading(false);
  }

  function startNewSession() {
    const newSessionId = generateSessionId();
    const newSession: Session = {
      id: newSessionId,
      name: `Session ${Object.keys(sessions).length + 1}`,
      messages: []
    };

    const updatedSessions: SessionsMap = {
      ...sessions,
      [newSessionId]: newSession
    };

    setSessions(updatedSessions);
    setSessionId(newSessionId);
    setMessages([]);

    localStorage.setItem("chatSessions", JSON.stringify(updatedSessions));
    localStorage.setItem("currentSessionId", newSessionId);
  }

  function switchSession(id: string) {
    if (sessions[id]) {
      setSessionId(id);
      setMessages(sessions[id].messages || []);
      localStorage.setItem("currentSessionId", id);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Chatbot</h1>
        <div className="flex items-center gap-4">
          <div className="relative" ref={dropdownRef}>
            <Button variant="outline" onClick={() => setDropdownOpen(!dropdownOpen)}>
              {sessions[sessionId]?.name || "Select Session"}
            </Button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-black text-white border border-gray-200 rounded-md shadow-lg z-50">
                {Object.values(sessions).map(session => (
                 <button
                 key={session.id}
                 className={`block px-4 py-2 text-sm w-full text-left ${
                   session.id === sessionId ? "bg-black text-white" : "hover:bg-black-100"
                 }`}
                 onClick={() => {
                   switchSession(session.id);
                   setDropdownOpen(false);
                 }}
               >
                 {session.name}
               </button>
                ))}
              </div>
            )}
          </div>
          <Button variant="outline" onClick={startNewSession}>New Session</Button>
        </div>
      </div>

      <Card className="flex-1">
  <CardContent className="p-4">
    <div className="flex flex-col h-[600px]">
      {/* Message List */}
      <div className="flex-1 overflow-auto py-4 space-y-4 px-2">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            Start a conversation by typing a message below.
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-3 rounded-lg max-w-fit break-words inline-block ${
                  msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t pt-4 px-2">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isLoading && input.trim()) {
                sendMessage();
              }
            }}
            disabled={isLoading}
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
            Send
          </Button>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
    </div>
  );
}

