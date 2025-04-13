
import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Profile } from '@/types/supabase';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface AdvisorBotProps {
  currentProfile?: Profile | null;
  context?: 'people' | 'chat' | 'calendar';
  matchId?: string;
}

const AdvisorBot: React.FC<AdvisorBotProps> = ({ currentProfile, context = 'people', matchId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [usageCount, setUsageCount] = useState(0);
  const { user, profile: userProfile } = useAuth();
  
  const toggleBot = () => {
    if (!isOpen) {
      // Initialize with a greeting when opening
      if (messages.length === 0) {
        const greeting = generateGreeting();
        setMessages([
          {
            id: 'greeting',
            sender: 'bot',
            content: greeting,
            timestamp: new Date(),
          },
        ]);
      }
    }
    setIsOpen(!isOpen);
  };
  
  const generateGreeting = (): string => {
    switch (context) {
      case 'people':
        if (currentProfile) {
          return `Hey there! I'm your Dating Advisor. I can help analyze your compatibility with ${
            currentProfile.is_anonymous_mode ? "this person" : currentProfile.full_name
          }. What would you like to know?`;
        }
        return "Hey there! I'm your Dating Advisor. How can I help with your matches today?";
      
      case 'chat':
        return "Need tips for your conversation? I can suggest topics or help craft the perfect message!";
      
      case 'calendar':
        return "Planning a date? I can help you pick the perfect spot or suggest conversation starters!";
        
      default:
        return "Hey there! I'm your Dating Advisor. How can I help you today?";
    }
  };
  
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Check if user has exceeded free usage
    const subscription = userProfile?.subscription || 'free';
    if (subscription === 'free' && usageCount >= 3) {
      toast.error("You've used all your free advisor requests", {
        description: "Upgrade to Premium for unlimited AI advice",
        action: {
          label: "Upgrade",
          onClick: () => window.location.href = "/premium"
        }
      });
      return;
    }
    
    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue('');
    setUsageCount((prev) => prev + 1);
    
    // Simulate AI response
    setTimeout(() => {
      const botResponse = generateBotResponse(inputValue, currentProfile);
      const newBotMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        content: botResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newBotMessage]);
    }, 1000);
  };
  
  const generateBotResponse = (userInput: string, profile?: Profile | null): string => {
    // This is a simple simulator - in a real app, this would call a backend API
    
    const lowerInput = userInput.toLowerCase();
    
    // Match responses based on user query and context
    if (context === 'people' && profile) {
      if (lowerInput.includes('compatibility') || lowerInput.includes('match')) {
        return `Based on your profiles, you and ${
          profile.is_anonymous_mode ? "this person" : profile.full_name
        } have ${Math.floor(Math.random() * 40) + 60}% compatibility. You both ${
          profile.zodiac_sign === userProfile?.zodiac_sign ? "share the same zodiac sign" : "have complementary zodiac energies"
        } and your career paths could create interesting synergies.`;
      }
      
      if (lowerInput.includes('talk about') || lowerInput.includes('conversation')) {
        return `Great conversation starters with ${
          profile.is_anonymous_mode ? "this person" : profile.full_name
        } would be: ${profile.job_title ? `their experience as a ${profile.job_title}` : "their career journey"}, ${
          profile.hobbies && profile.hobbies.length > 0 ? `their interest in ${profile.hobbies[0]}` : "their hobbies"
        }, or asking about their ${profile.zodiac_sign || "zodiac sign"} traits.`;
      }
    }
    
    if (context === 'chat') {
      if (lowerInput.includes('what should i say') || lowerInput.includes('how to start')) {
        return "Try opening with something specific from their profile rather than a generic greeting. For example, ask about a skill they listed or comment on a shared interest. This shows you've paid attention to who they are.";
      }
      
      if (lowerInput.includes('date') || lowerInput.includes('meet')) {
        return "When suggesting a meetup, be specific about place, date and time - it makes the invitation more real and easier to respond to. Based on their profile interests, a casual coffee at a unique local café might be perfect for a first meeting.";
      }
    }
    
    if (context === 'calendar') {
      if (lowerInput.includes('where') || lowerInput.includes('place') || lowerInput.includes('spot')) {
        return "For a first date, I'd recommend somewhere with easy conversation flow - a café with good ambiance or a casual lunch spot. Check our Loyalty section for partner venues that offer discounts!";
      }
      
      if (lowerInput.includes('conversation') || lowerInput.includes('talk about')) {
        return "Prepare 3-5 open-ended questions about their interests and career aspirations. Listen actively and share your own experiences. Remember to maintain good eye contact and be genuinely curious about their answers!";
      }
    }
    
    // Generic responses
    const genericResponses = [
      "That's an interesting question! Based on your compatibility, I'd suggest focusing on shared professional interests when you meet.",
      "Great question! Your zodiac signs suggest you might connect over creative or intellectual pursuits. Perhaps mention your favorite book or podcast?",
      "I notice your profiles show complementary career paths. This could make for fascinating conversation about your professional journeys!",
      "Based on your profiles, you might want to discuss your shared interest in career development and growth opportunities."
    ];
    
    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
  };

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={toggleBot}
        className={`fixed z-40 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? "bottom-[330px] right-4 h-10 w-10 bg-gray-200 hover:bg-gray-300" : 
          "bottom-20 right-4 h-14 w-14 bg-gradient-to-r from-brand-blue to-brand-purple"
        }`}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Sparkles className="h-6 w-6" />
        )}
      </Button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-30 w-80 h-[300px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
          <div className="p-3 bg-gradient-to-r from-brand-blue to-brand-purple text-white rounded-t-lg flex items-center justify-between">
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2" />
              <h3 className="font-medium">Dating Advisor</h3>
            </div>
            <div className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              {usageCount}/3 Free
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'bot' && (
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src="/advisor-avatar.png" />
                    <AvatarFallback className="bg-brand-purple text-white">AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg px-3 py-2 max-w-[80%] ${
                    message.sender === 'user'
                      ? 'bg-brand-purple text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t">
            <div className="flex">
              <Input
                placeholder="Ask about compatibility..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 mr-2"
              />
              <Button onClick={handleSendMessage} size="icon" variant="default">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 text-xs text-center text-gray-500">
              {usageCount < 3 ? (
                <span>{3 - usageCount} free requests remaining</span>
              ) : (
                <span>Upgrade to Premium for unlimited advice</span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdvisorBot;
