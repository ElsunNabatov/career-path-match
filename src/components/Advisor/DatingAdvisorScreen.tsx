
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Bot, Clock, HelpingHand, Settings, Send, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

type MessageType = {
  id: string;
  content: string;
  sender: "user" | "advisor";
  timestamp: Date;
};

type SuggestionType = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

const DatingAdvisorScreen: React.FC = () => {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: "1",
      content: "Hello! I'm your AI Dating Advisor. I can help with conversation starters, date planning, or any relationship advice. How can I assist you today?",
      sender: "advisor",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const suggestions: SuggestionType[] = [
    {
      title: "Conversation Starters",
      description: "Get ideas for breaking the ice",
      icon: <Bot className="h-4 w-4" />,
    },
    {
      title: "Date Planning",
      description: "Find perfect date activities",
      icon: <Clock className="h-4 w-4" />,
    },
    {
      title: "Relationship Advice",
      description: "Help with current relationship issues",
      icon: <HelpingHand className="h-4 w-4" />,
    },
    {
      title: "Profile Feedback",
      description: "Tips to improve your dating profile",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: MessageType = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // In a real app, this would call an API/edge function
      // For now, we'll simulate a response
      setTimeout(() => {
        const response = generateResponse(input);
        
        const advisorMessage: MessageType = {
          id: (Date.now() + 1).toString(),
          content: response,
          sender: "advisor",
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, advisorMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error getting advisor response:", error);
      toast.error("Couldn't get a response. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: SuggestionType) => {
    const userMessage: MessageType = {
      id: Date.now().toString(),
      content: `Help me with ${suggestion.title}`,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate response
    setTimeout(() => {
      const response = getSuggestionResponse(suggestion.title);
      
      const advisorMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: "advisor",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, advisorMessage]);
      setIsLoading(false);
    }, 1000);
  };

  // Simple response generator (in production this would call a real AI service)
  const generateResponse = (query: string): string => {
    if (query.toLowerCase().includes("conversation") || query.toLowerCase().includes("opener")) {
      return "Great conversation starters include asking about recent interests, travel experiences, or sharing a fun fact about yourself. Try something like: 'What's the most interesting thing you've done this month?' or 'If you could have dinner with anyone alive or dead, who would it be and why?'";
    } else if (query.toLowerCase().includes("date")) {
      return "For a first date, consider a coffee shop, a walk in a scenic area, or a casual lunch. For later dates, cooking classes, wine tastings, or art galleries can be fun shared experiences. The key is choosing a place where you can talk and get to know each other better.";
    } else if (query.toLowerCase().includes("profile")) {
      return "To improve your profile, use high-quality photos that clearly show your face, include pictures of you doing activities you enjoy, write a bio that highlights your personality and interests, and be specific about what you're looking for. Authenticity is always the most attractive quality!";
    } else {
      return "That's a great question! Building a connection takes time and authentic communication. Focus on showing genuine interest in the other person, being yourself, and sharing your thoughts and feelings openly. Would you like more specific advice on this topic?";
    }
  };

  const getSuggestionResponse = (suggestion: string): string => {
    switch (suggestion) {
      case "Conversation Starters":
        return "Here are some great conversation starters:\n\n1. What's something you're looking forward to this week?\n2. What's your favorite way to spend a weekend?\n3. What's a skill you've always wanted to learn?\n4. What was the last book/movie that really impacted you?\n5. If you could travel anywhere tomorrow, where would you go?";
      case "Date Planning":
        return "When planning a date, consider these ideas:\n\n• Coffee dates: Casual, low-pressure, and easy to extend or cut short\n• Activity dates: Bowling, mini-golf, or a cooking class can be fun shared experiences\n• Nature dates: Parks, botanical gardens, or short hikes offer beautiful settings\n• Cultural dates: Museums, galleries, or local events show shared interests\n\nThe best dates allow for conversation and create shared memories!";
      case "Relationship Advice":
        return "Building a healthy relationship takes:\n\n• Communication: Express your needs and listen actively\n• Boundaries: Respect each other's space and independence\n• Support: Be there through good times and challenges\n• Trust: Be reliable and honest with each other\n• Growth: Encourage each other's personal development\n\nRemember that all relationships require work from both sides!";
      case "Profile Feedback":
        return "For an effective dating profile:\n\n• Photos: Include 4-6 recent, high-quality photos with a clear headshot first\n• Bio: Keep it positive, authentic, and specific about your interests\n• Prompts: Answer in ways that showcase your personality and values\n• Details: Be honest about what you're looking for\n\nRemember, your profile should start conversations and reflect the real you!";
      default:
        return "What specific area of dating would you like advice on? I can help with conversation starters, planning dates, relationship tips, or improving your profile.";
    }
  };

  return (
    <div className="pb-20 h-full flex flex-col">
      <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b">
        <h1 className="text-xl font-bold text-center text-brand-blue">
          Dating Advisor
        </h1>
      </div>

      <div className="flex-1 flex flex-col p-4">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user"
                      ? "bg-brand-purple text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === "user"
                        ? "text-purple-100"
                        : "text-gray-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {messages.length <= 1 && !isLoading && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Try asking about:</p>
            <div className="grid grid-cols-2 gap-2">
              {suggestions.map((suggestion) => (
                <Card
                  key={suggestion.title}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <CardContent className="p-3 flex items-center space-x-3">
                    <div className="bg-brand-purple/10 p-2 rounded-full">
                      {suggestion.icon}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{suggestion.title}</p>
                      <p className="text-gray-500 text-xs">
                        {suggestion.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="relative mt-auto">
          <Textarea
            placeholder="Ask for dating advice..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="pr-12 resize-none"
            rows={2}
          />
          <Button
            size="icon"
            className="absolute right-2 bottom-2"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DatingAdvisorScreen;
