import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ChevronLeft, Send, User, Coffee, Sandwich, EyeOff, Eye, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ChatService } from "@/services/ChatService";
import { useAuth } from "@/contexts/AuthContext";
import { format, isToday, isYesterday } from "date-fns";
import DateScheduler from "./DateScheduler";
import AdvisorBot from "../Advisor/AdvisorBot";
import { Profile } from "@/types/supabase";

interface Match {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerPhoto?: string;
  isAnonymous: boolean;
  unreadCount: number;
  compatibilityScore: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isUser: boolean;
}

const ChatList: React.FC<{
  matches: Match[];
  onSelectMatch: (id: string) => void;
  selectedMatchId: string | null;
  isLoading: boolean;
}> = ({ matches, onSelectMatch, selectedMatchId, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-4">
        <p className="text-sm text-gray-500 text-center">Loading conversations...</p>
      </div>
    );
  }
  
  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium">No conversations yet</h3>
        <p className="text-gray-500 text-sm mt-1">
          Match with someone to start chatting
        </p>
      </div>
    );
  }

  // Format the timestamp
  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MM/dd/yy');
    }
  };

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
              {match.partnerPhoto ? (
                <AvatarImage src={match.partnerPhoto} alt={match.partnerName} />
              ) : (
                <AvatarFallback className="bg-brand-purple/20 text-brand-purple">
                  {match.isAnonymous ? <User size={20} /> : match.partnerName.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            {match.unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-brand-purple text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                {match.unreadCount}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium truncate">
                {match.partnerName}{" "}
                {match.isAnonymous && <EyeOff className="inline h-3 w-3 ml-1 opacity-70" />}
              </h3>
              <span className="text-xs text-gray-500">{formatTime(match.lastMessageTime || '')}</span>
            </div>
            <p className="text-sm text-gray-500 truncate">{match.lastMessage || "Start a conversation"}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

interface ChatViewProps {
  match: Match | undefined;
  messages: ChatMessage[];
  onBack: () => void;
  onRevealIdentity: () => void;
  onScheduleDate: () => void;
  messageInput: string;
  setMessageInput: (value: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
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
  isLoading,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll to bottom whenever messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  if (!match) return null;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'EEEE, MMMM d');
    }
  };
  
  // Group messages by date
  const groupedMessages: { [date: string]: ChatMessage[] } = {};
  messages.forEach(message => {
    const dateKey = formatDate(message.timestamp);
    if (!groupedMessages[dateKey]) {
      groupedMessages[dateKey] = [];
    }
    groupedMessages[dateKey].push(message);
  });

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
              {match.partnerPhoto ? (
                <AvatarImage src={match.partnerPhoto} alt={match.partnerName} />
              ) : (
                <AvatarFallback className="bg-brand-purple/20 text-brand-purple">
                  {match.isAnonymous ? <User size={16} /> : match.partnerName.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <div className="flex items-center">
                <h3 className="font-medium">{match.partnerName}</h3>
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
          <DateScheduler 
            matchId={match.id}
            onScheduled={onScheduleDate}
          />
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-4 bg-gray-50 rounded-full mb-3">
              <Send className="h-6 w-6 text-gray-400" />
            </div>
            <p className="font-medium">No messages yet</p>
            <p className="text-gray-500 text-sm mt-1">
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          Object.keys(groupedMessages).map(date => (
            <div key={date} className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                  {date}
                </div>
              </div>
              
              {groupedMessages[date].map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-[80%] rounded-lg p-3",
                    message.isUser
                      ? "bg-brand-purple text-white ml-auto rounded-br-none"
                      : "bg-gray-100 mr-auto rounded-bl-none"
                  )}
                >
                  <p>{message.content}</p>
                  <div
                    className={cn(
                      "text-xs mt-1",
                      message.isUser ? "text-purple-100" : "text-gray-500"
                    )}
                  >
                    {format(new Date(message.timestamp), 'h:mm a')}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
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
          disabled={!messageInput.trim()}
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
  const [matches, setMatches] = useState<Match[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const selectedMatch = selectedMatchId
    ? matches.find((match) => match.id === selectedMatchId)
    : undefined;

  // Fetch matches on component mount
  useEffect(() => {
    const fetchMatches = async () => {
      if (!user) return;
      
      try {
        setIsLoadingMatches(true);
        const fetchedMatches = await ChatService.getMatches(user.id);
        setMatches(fetchedMatches);
      } catch (error) {
        console.error('Error fetching matches:', error);
        toast.error('Failed to load conversations');
      } finally {
        setIsLoadingMatches(false);
      }
    };
    
    fetchMatches();
  }, [user]);
  
  // Fetch messages for selected match
  useEffect(() => {
    if (!selectedMatchId || !user) return;
    
    const loadChatHistory = async () => {
      try {
        setIsLoadingMessages(true);
        const chatHistory = await ChatService.getChatHistory(selectedMatchId);
        
        // Convert messages to the format used by the component
        const formattedMessages = chatHistory.map(msg => ({
          id: msg.id,
          senderId: msg.sender_id,
          content: msg.content,
          timestamp: msg.created_at,
          isUser: msg.sender_id === user.id,
        }));
        
        setMessages(formattedMessages);
        
        // Mark messages as read
        if (selectedMatch) {
          await ChatService.markAsRead(selectedMatchId, selectedMatch.partnerId);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setIsLoadingMessages(false);
      }
    };
    
    loadChatHistory();
    
    // Set up real-time message subscription
    const unsubscribe = ChatService.subscribeToChat(selectedMatchId, (newMsg) => {
      // Add the new message to the chat
      if (newMsg.sender_id !== user.id) {
        const formattedMessage = {
          id: newMsg.id,
          senderId: newMsg.sender_id,
          content: newMsg.content,
          timestamp: newMsg.created_at,
          isUser: false,
        };
        
        setMessages(prev => [...prev, formattedMessage]);
        
        // Mark the message as read since we're already in the chat
        ChatService.markAsRead(selectedMatchId, newMsg.sender_id);
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [selectedMatchId, user, selectedMatch]);
  
  // Refresh matches when returning to the main chat list
  useEffect(() => {
    if (!selectedMatchId && user) {
      const fetchMatches = async () => {
        try {
          const fetchedMatches = await ChatService.getMatches(user.id);
          setMatches(fetchedMatches);
        } catch (error) {
          console.error('Error refreshing matches:', error);
        }
      };
      
      fetchMatches();
    }
  }, [selectedMatchId, user]);

  const handleSelectMatch = (id: string) => {
    setSelectedMatchId(id);
    setMessageInput("");
  };

  const handleBack = () => {
    setSelectedMatchId(null);
  };

  const handleRevealIdentity = () => {
    if (!selectedMatchId) return;
    
    ChatService.requestIdentityReveal(selectedMatchId)
      .then(() => {
        toast.success("Request sent to reveal identity!");
      })
      .catch((error) => {
        console.error('Error requesting identity reveal:', error);
        toast.error("Failed to send request");
      });
  };

  const handleScheduleDate = () => {
    navigate("/calendar");
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedMatchId || !user) return;
    
    const trimmedMessage = messageInput.trim();
    // Clear input right away for better UX
    setMessageInput("");
    
    // Add message to UI immediately
    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();
    const newMessage = {
      id: tempId,
      senderId: user.id,
      content: trimmedMessage,
      timestamp: now,
      isUser: true,
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Send message to backend
    try {
      const sentMessage = await ChatService.sendMessage(selectedMatchId, user.id, trimmedMessage);
      
      // Update the message with the real ID (if needed)
      setMessages(prev => 
        prev.map(msg => msg.id === tempId 
          ? { 
              ...msg, 
              id: sentMessage.id,
              timestamp: sentMessage.created_at 
            } 
          : msg
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
      
      // Remove the temporary message if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      // Restore the message input
      setMessageInput(trimmedMessage);
    }
  };

  // Get the match ID for AdvisorBot - don't redeclare selectedMatchId
  const advisorMatchId = selectedMatch?.id;

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
                  matches={matches}
                  onSelectMatch={handleSelectMatch}
                  selectedMatchId={selectedMatchId}
                  isLoading={isLoadingMatches}
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
            isLoading={isLoadingMessages}
          />
        )}
      </div>

      {/* Dating Advisor Bot for Chat section */}
      <AdvisorBot 
        currentProfile={selectedMatch ? { id: selectedMatch.partnerId, full_name: selectedMatch.partnerName } as Profile : undefined}
        context="chat" 
        matchId={advisorMatchId}
      />
    </div>
  );
};

export default ChatScreen;
