import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ChevronLeft, Send, User, Coffee, Sandwich, EyeOff, Eye, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const sampleMatches = [
  {
    id: "1",
    name: "Emily J.",
    lastMessage: "Would you like to meet for coffee sometime?",
    time: "2m",
    isAnonymous: true,
    unread: 2,
    compatibilityScore: 92,
  },
  {
    id: "2",
    name: "Michael Chen",
    lastMessage: "I really enjoyed our conversation about tech trends!",
    time: "1h",
    isAnonymous: false,
    unread: 0,
    compatibilityScore: 78,
  },
  {
    id: "3",
    name: "Sophia R.",
    lastMessage: "Thanks for the book recommendation!",
    time: "5h",
    isAnonymous: true,
    unread: 0,
    compatibilityScore: 85,
  },
];

const sampleChatMessages = [
  {
    id: "1",
    senderId: "1",
    text: "Hi there! I noticed we both work in product management. What aspects of the role do you enjoy most?",
    timestamp: "10:32 AM",
    isUser: false,
  },
  {
    id: "2",
    senderId: "user",
    text: "Hi! I really enjoy the collaborative aspects of product management - working with designers and developers to solve real user problems.",
    timestamp: "10:35 AM",
    isUser: true,
  },
  {
    id: "3",
    senderId: "1",
    text: "That's exactly what I love too! What industry are you currently working in?",
    timestamp: "10:38 AM",
    isUser: false,
  },
  {
    id: "4",
    senderId: "user",
    text: "I'm in the healthtech space right now. It's really rewarding to build products that help people with their wellbeing. How about you?",
    timestamp: "10:40 AM",
    isUser: true,
  },
  {
    id: "5",
    senderId: "1",
    text: "That's amazing! I'm in fintech, but I've always been interested in healthtech. Would you like to grab a coffee sometime and chat more about our experiences?",
    timestamp: "10:45 AM",
    isUser: false,
  },
];

interface ChatListProps {
  matches: typeof sampleMatches;
  onSelectMatch: (id: string) => void;
  selectedMatchId: string | null;
}

const ChatList: React.FC<ChatListProps> = ({ matches, onSelectMatch, selectedMatchId }) => {
  return (
    <div className="space-y-1">
      {matches.map((match) => (
        <div
          key={match.id}
          className={cn(
            "p-3 rounded-lg flex items-center space-x-3 cursor-pointer",
            selectedMatchId === match.id ? "bg-brand-purple/10" : "hover:bg-gray-100"
          )}
          onClick={() => onSelectMatch(match.id)}
        >
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-brand-purple/20 text-brand-purple">
                {match.isAnonymous ? <User size={20} /> : match.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {match.unread > 0 && (
              <div className="absolute -top-1 -right-1 bg-brand-purple text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                {match.unread}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium truncate">
                {match.name}{" "}
                {match.isAnonymous && <EyeOff className="inline h-3 w-3 ml-1 opacity-70" />}
              </h3>
              <span className="text-xs text-gray-500">{match.time}</span>
            </div>
            <p className="text-sm text-gray-500 truncate">{match.lastMessage}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

interface ChatViewProps {
  match: typeof sampleMatches[0] | undefined;
  messages: typeof sampleChatMessages;
  onBack: () => void;
  onRevealIdentity: () => void;
  onScheduleDate: () => void;
  messageInput: string;
  setMessageInput: (value: string) => void;
  onSendMessage: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({
  match,
  messages,
  onBack,
  onRevealIdentity,
  onScheduleDate,
  messageInput,
  setMessageInput,
  onSendMessage,
}) => {
  if (!match) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="border-b p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={onBack}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-brand-purple/20 text-brand-purple">
                {match.isAnonymous ? <User size={16} /> : match.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center">
                <h3 className="font-medium">{match.name}</h3>
                <Badge className="ml-2 bg-brand-purple text-white text-xs">
                  {match.compatibilityScore}%
                </Badge>
              </div>
              {match.isAnonymous && (
                <button
                  className="text-xs flex items-center text-brand-purple"
                  onClick={onRevealIdentity}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Reveal identity
                </button>
              )}
            </div>
          </div>
          <button
            className="text-brand-purple flex items-center text-sm"
            onClick={onScheduleDate}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Schedule
          </button>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "max-w-[80%] rounded-lg p-3",
              message.isUser
                ? "bg-brand-purple text-white ml-auto rounded-br-none"
                : "bg-gray-100 mr-auto rounded-bl-none"
            )}
          >
            <p>{message.text}</p>
            <div
              className={cn(
                "text-xs mt-1",
                message.isUser ? "text-purple-100" : "text-gray-500"
              )}
            >
              {message.timestamp}
            </div>
          </div>
        ))}
      </div>

      {/* Chat actions: Coffee/Meal */}
      <div className="border-t p-2 flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs border-amber-400 text-amber-600"
        >
          <Coffee className="h-3 w-3 mr-1" /> Coffee ($1)
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs border-red-400 text-red-600"
        >
          <Sandwich className="h-3 w-3 mr-1" /> Meal ($2)
        </Button>
      </div>

      {/* Message input */}
      <div className="border-t p-3 flex items-center space-x-2">
        <Input
          placeholder="Type a message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSendMessage();
            }
          }}
        />
        <Button
          size="icon"
          className="bg-brand-purple hover:bg-brand-purple/90"
          onClick={onSendMessage}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const EmptyLikes = () => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <div className="h-16 w-16 rounded-full bg-brand-purple/10 flex items-center justify-center mb-4">
      <Heart className="h-8 w-8 text-brand-purple" />
    </div>
    <h3 className="text-lg font-medium">No new likes yet</h3>
    <p className="text-gray-500 text-sm mt-1">
      Check back soon to see who's interested
    </p>
  </div>
);

const ChatScreen: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("messages");
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState(sampleChatMessages);
  const navigate = useNavigate();

  const selectedMatch = selectedMatchId
    ? sampleMatches.find((match) => match.id === selectedMatchId)
    : undefined;

  const handleSelectMatch = (id: string) => {
    setSelectedMatchId(id);
  };

  const handleBack = () => {
    setSelectedMatchId(null);
  };

  const handleRevealIdentity = () => {
    toast.success("Request sent to reveal identity!");
  };

  const handleScheduleDate = () => {
    navigate("/calendar");
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    // Add the new message
    const newMessage = {
      id: `${messages.length + 1}`,
      senderId: "user",
      text: messageInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser: true,
    };

    setMessages([...messages, newMessage]);
    setMessageInput("");

    // Simulate a reply after a delay
    setTimeout(() => {
      const replyMessage = {
        id: `${messages.length + 2}`,
        senderId: selectedMatchId || "1",
        text: "That sounds interesting! Tell me more about it.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: false,
      };
      setMessages((prevMessages) => [...prevMessages, replyMessage]);
    }, 2000);
  };

  return (
    <div className="pb-16 h-full">
      <div className="px-4 py-3 border-b">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="likes">Likes</TabsTrigger>
          </TabsList>
          
          {selectedMatchId ? null : (
            <div className="p-4">
              <TabsContent value="messages" className="mt-0">
                <ChatList 
                  matches={sampleMatches}
                  onSelectMatch={handleSelectMatch}
                  selectedMatchId={selectedMatchId}
                />
              </TabsContent>
              <TabsContent value="likes" className="mt-0">
                <EmptyLikes />
              </TabsContent>
            </div>
          )}
        </Tabs>
      </div>

      <div className="h-[calc(100vh-140px)]">
        {selectedMatchId && (
          <ChatView
            match={selectedMatch}
            messages={messages}
            onBack={handleBack}
            onRevealIdentity={handleRevealIdentity}
            onScheduleDate={handleScheduleDate}
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            onSendMessage={handleSendMessage}
          />
        )}
      </div>
    </div>
  );
};

export default ChatScreen;
