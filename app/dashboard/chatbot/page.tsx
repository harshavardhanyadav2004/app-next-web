"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { Loader2, Send, Plus, Edit2, Check, X, MessageSquare, Clock, RefreshCw, Copy, CheckIcon } from "lucide-react"
import { format, isValid } from "date-fns"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism"

type MessageType = {
  text: string
  sender: "user" | "bot"
  timestamp: number
}
interface Session {
  id: string
  name: string
  messages: MessageType[]
}
interface SessionsMap {
  [key: string]: Session
}
const apiKey = process.env.NEXT_PUBLIC_RAG_MODEL_API_KEY
if (!apiKey) {
  throw new Error("API key is not defined")
}
const genAI = new GoogleGenerativeAI(apiKey)
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
const CopyButton = ({ textToCopy }: { textToCopy: string }) => {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }
  return (
    <Button
      variant="secondary"
      size="icon"
      className="h-7 w-7 bg-primary/10 hover:bg-primary/20 backdrop-blur-sm"
      onClick={handleCopy}
      title="Copy to clipboard"
    >
      {copied ? <CheckIcon className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  )
}
export default function ChatbotPage() {
  const [messages, setMessages] = useState<MessageType[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState("")
  const [sessions, setSessions] = useState<SessionsMap>({})
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editSessionName, setEditSessionName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    const savedSessions = localStorage.getItem("chatSessions")
    const currentSessionId = localStorage.getItem("currentSessionId")
    let parsedSessions: SessionsMap = {}
    if (savedSessions) {
      try {
        parsedSessions = JSON.parse(savedSessions)
        setSessions(parsedSessions)
      } catch (e) {
        console.error("Error parsing saved sessions:", e)
      }
    }
    if (currentSessionId && parsedSessions[currentSessionId]) {
      setSessionId(currentSessionId)
      setMessages(parsedSessions[currentSessionId].messages || [])
    } else {
      startNewSession()
    }
  }, [])
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
        setEditingSessionId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])
  useEffect(() => {
    if (sessionId && sessions[sessionId]) {
      localStorage.setItem("chatSessions", JSON.stringify(sessions))
      localStorage.setItem("currentSessionId", sessionId)
    }
  }, [sessions, sessionId])
  const generateSessionId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
  }

  const cleanTextOutput = (text: string) => {
    return text
      .replace(/\n{3,}/g, "\n\n")
      .replace(/\*\*/g, "")
      .trim()
  }
  const formatMessageText = (text: string) => {
    if (text.includes("```")) {
      const parts = text.split(/(```(?:[\w-]+)?\n[\s\S]*?\n```)/g)

      return (
        <>
          {parts.map((part, i) => {
            if (part.startsWith("```") && part.endsWith("```")) {
              const match = part.match(/```([\w-]+)?\n([\s\S]*?)\n```/)
              if (match) {
                const language = match[1] || "javascript"
                const code = match[2]
                return (
                  <div key={i} className="my-2 rounded overflow-hidden relative w-full">
                    <div className="absolute top-2 right-2 z-10">
                      <CopyButton textToCopy={code} />
                    </div>
                    <div className="w-full overflow-x-auto">
                      <SyntaxHighlighter
                        language={language}
                        style={atomDark}
                        customStyle={{ margin: 0 }}
                        wrapLines={true}
                        wrapLongLines={true}
                      >
                        {code}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                )
              }
            }
            return part.split("\n").map((line, j) => <div key={`${i}-${j}`}>{line || <br />}</div>)
          })}
        </>
      )
    }
    return text.split("\n").map((line, i) => <div key={i}>{line || <br />}</div>)
  }
  const isCodeInput = (text: string) => {
    const codePatterns = [
      /^(const|let|var|function|class|import|export|if|for|while)\s/m,
      /^(def|class|import|from|if|for|while)\s/m,
      /^(public|private|protected|class|interface|enum|import)\s/m,
      /[{};]\s*$/m,
      /^\s{2,}\w+/m,
    ]
    const lines = text.split("\n")
    return lines.length > 1 && codePatterns.some((pattern) => pattern.test(text))
  }
  const sendMessage = async () => {
    if (!input.trim()) return
    setIsLoading(true)
    setError(null)
    let formattedInput = input
    if (isCodeInput(input)) {
      const language =
        input.includes("function") || input.includes("const") || input.includes("let")
          ? "javascript"
          : input.includes("def ") || (input.includes("class ") && input.includes(":"))
            ? "python"
            : "code"
      formattedInput = "```" + language + "\n" + input + "\n```"
    }

    const userMessage: MessageType = {
      text: formattedInput,
      sender: "user",
      timestamp: Date.now(),
    }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")

    try {
      const filteredHistory = updatedMessages
        .filter((msg) => msg.sender === "user") // Keep only user messages for the beginning
        .map((msg) => ({
          role: "user",
          parts: [{ text: msg.text }],
        }));
      if (filteredHistory.length === 0) {
        setError("The chat must start with a user message.");
        setIsLoading(false);
        return;
      }
      const chatSession = await model.startChat({
        generationConfig: {
          temperature: 1,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
          responseMimeType: "text/plain",
        },
        history: filteredHistory.slice(-10),
      })

      const result = await chatSession.sendMessage(input)
      const botResponse = await result.response.text()
      const cleanedResponse = cleanTextOutput(botResponse)
      const botMessage: MessageType = {
        text: cleanedResponse,
        sender: "bot",
        timestamp: Date.now(),
      }

      const newMessages = [...updatedMessages, botMessage]
      setMessages(newMessages)

      setSessions((prevSessions) => {
        const updatedSessions: SessionsMap = {
          ...prevSessions,
          [sessionId]: {
            ...prevSessions[sessionId],
            messages: newMessages,
          },
        }
        return updatedSessions
      })
    } catch (error) {
      console.error("Error:", error)
      setError("Failed to get response from AI. Please try again.")
      setMessages(messages)
    } finally {
      setIsLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }
  const retryLastMessage = async () => {
    const lastUserMessageIndex = [...messages].reverse().findIndex((msg) => msg.sender === "user")
    if (lastUserMessageIndex === -1) return
    const lastUserMessage = messages[messages.length - 1 - lastUserMessageIndex]
    setInput(lastUserMessage.text)
    setMessages(messages.slice(0, messages.length - lastUserMessageIndex))
    setError(null)
    setTimeout(() => inputRef.current?.focus(), 100)
  }
  const startNewSession = useCallback(() => {
    const newSessionId = generateSessionId()
    const newSession: Session = {
      id: newSessionId,
      name: `Session ${Object.keys(sessions).length + 1}`,
      messages: [],
    }
    setSessions((prevSessions) => ({
      ...prevSessions,
      [newSessionId]: newSession,
    }))
    setSessionId(newSessionId)
    setMessages([])
    setError(null)
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [sessions, generateSessionId])

  const switchSession = (id: string) => {
    if (sessions[id]) {
      setSessionId(id)
      setMessages(sessions[id].messages || [])
      setError(null)
      setDropdownOpen(false)
    }
  }
  const startEditingSession = (id: string, name: string) => {
    setEditingSessionId(id)
    setEditSessionName(name)
    event?.stopPropagation()
  }
  const saveSessionName = (id: string) => {
    if (editSessionName.trim()) {
      setSessions((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          name: editSessionName.trim(),
        },
      }))
    }
    setEditingSessionId(null)
    event?.stopPropagation()
  }
  const cancelEditingSession = () => {
    setEditingSessionId(null)
    event?.stopPropagation()
  }
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (!isLoading && input.trim()) {
        sendMessage()
      }
    }
  }
  const deleteSession = (id: string) => {
    if (confirm("Are you sure you want to delete this session?")) {
      setSessions((prev) => {
        const newSessions = { ...prev }
        delete newSessions[id]
        return newSessions
      })
      if (id === sessionId) {
        const remainingSessions = Object.keys(sessions).filter((key) => key !== id)
        if (remainingSessions.length > 0) {
          switchSession(remainingSessions[0])
        } else { startNewSession() }
      }
    } event?.stopPropagation()
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Chatbot</h1>
        <div className="flex items-center gap-4">
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="outline"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              {sessions[sessionId]?.name || "Select Session"}
            </Button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-background border border-border rounded-md shadow-lg z-50">
                <div className="py-1 max-h-64 overflow-y-auto">
                  {Object.values(sessions).length > 0 ? (
                    Object.values(sessions).map((session) => (
                      <div
                        key={session.id}
                        className={`flex items-center justify-between px-4 py-2 hover:bg-muted ${session.id === sessionId ? "bg-muted/50" : ""
                          }`}
                      >
                        {editingSessionId === session.id ? (
                          <div className="flex items-center gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                            <Input
                              value={editSessionName}
                              onChange={(e) => setEditSessionName(e.target.value)}
                              className="h-7 text-sm"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveSessionName(session.id)
                                if (e.key === "Escape") cancelEditingSession()
                              }}
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => saveSessionName(session.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={cancelEditingSession}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <button
                              className="text-sm w-full text-left truncate"
                              onClick={() => switchSession(session.id)}
                            >
                              {session.name}
                              <span className="text-xs text-muted-foreground ml-2">
                                ({session.messages.length} messages)
                              </span>
                            </button>
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => startEditingSession(session.id, session.name)}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-destructive hover:text-destructive"
                                onClick={() => deleteSession(session.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-muted-foreground">No sessions</div>
                  )}
                </div>
                <div className="border-t py-1">
                  <Button variant="ghost" className="w-full justify-start px-4 py-2 text-sm" onClick={startNewSession}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Session
                  </Button>
                </div>
              </div>
            )}
          </div>
          <Button variant="outline" onClick={startNewSession} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Session
          </Button>
        </div>
      </div>
      <Card className="flex-1">
        <CardContent className="p-4">
          <div className="flex flex-col h-[600px]">
            <div className="flex-1 overflow-auto py-4 space-y-4 px-2">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Start a conversation by typing a message below</p>
                  </div>
                </div>
              )}

              {messages.map((msg, index) => (
                <div key={index} className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="flex flex-col max-w-[80%]">
                    <div
                      className={`p-3 rounded-lg break-words w-full overflow-hidden ${msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                    >
                      {formatMessageText(msg.text)}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1">
                      <Clock className="h-3 w-3" />
                      {msg.timestamp && isValid(new Date(msg.timestamp))
                        ? format(new Date(msg.timestamp), "h:mm a")
                        : "Invalid Date"}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex flex-col max-w-[80%]">
                    <div className="p-3 rounded-lg bg-muted flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex justify-center">
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive flex items-center gap-2">
                    <span>{error}</span>
                    <Button variant="outline" size="sm" className="h-7 ml-2" onClick={retryLastMessage}>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
            <div className="border-t pt-4 px-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  sendMessage()
                }}
                className="flex gap-2"
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-grow" />
                <Button type="submit" disabled={isLoading || !input.trim()} className="flex items-center gap-2">{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send{" "} </Button>{" "} </form>{" "}   </div>{" "}</div> </CardContent>  </Card>{" "}   </div>)
}