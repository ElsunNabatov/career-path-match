
import React, { useState, useEffect } from 'react';
import { Check, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Hobby } from '@/types/supabase';

const hobbyCategories = [
  'Sports & Fitness',
  'Arts & Creativity',
  'Food & Drink',
  'Technology',
  'Travel & Adventure',
  'Learning',
  'Music',
  'Outdoors',
  'Professional',
  'Wellness',
];

// Sample hobbies data
const sampleHobbies: Hobby[] = [
  { id: '1', name: 'Photography', icon: '📷', category: 'Arts & Creativity' },
  { id: '2', name: 'Hiking', icon: '🥾', category: 'Outdoors' },
  { id: '3', name: 'Cooking', icon: '🍳', category: 'Food & Drink' },
  { id: '4', name: 'Tennis', icon: '🎾', category: 'Sports & Fitness' },
  { id: '5', name: 'Reading', icon: '📚', category: 'Learning' },
  { id: '6', name: 'Travel', icon: '✈️', category: 'Travel & Adventure' },
  { id: '7', name: 'Coding', icon: '💻', category: 'Technology' },
  { id: '8', name: 'Yoga', icon: '🧘', category: 'Wellness' },
  { id: '9', name: 'Music', icon: '🎵', category: 'Music' },
  { id: '10', name: 'Running', icon: '🏃', category: 'Sports & Fitness' },
  { id: '11', name: 'Painting', icon: '🎨', category: 'Arts & Creativity' },
  { id: '12', name: 'Wine Tasting', icon: '🍷', category: 'Food & Drink' },
  { id: '13', name: 'Cycling', icon: '🚴', category: 'Sports & Fitness' },
  { id: '14', name: 'Dancing', icon: '💃', category: 'Arts & Creativity' },
  { id: '15', name: 'Gardening', icon: '🌱', category: 'Outdoors' },
  { id: '16', name: 'Public Speaking', icon: '🎤', category: 'Professional' },
  { id: '17', name: 'Meditation', icon: '🧠', category: 'Wellness' },
  { id: '18', name: 'Basketball', icon: '🏀', category: 'Sports & Fitness' },
  { id: '19', name: 'Writing', icon: '✏️', category: 'Arts & Creativity' },
  { id: '20', name: 'Language Learning', icon: '🗣️', category: 'Learning' },
];

interface HobbiesSelectorProps {
  selectedHobbies: string[];
  onHobbiesChange: (hobbies: string[]) => void;
  maxSelections?: number;
}

const HobbiesSelector: React.FC<HobbiesSelectorProps> = ({ 
  selectedHobbies, 
  onHobbiesChange,
  maxSelections = 10
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [hobbies, setHobbies] = useState<Hobby[]>(sampleHobbies);
  const { user } = useAuth();

  // In a real app, you'd fetch these from the database
  useEffect(() => {
    // For now we're using the sample data
    // In a real implementation, you'd load this from Supabase
    // const fetchHobbies = async () => {
    //   try {
    //     const { data, error } = await supabase
    //       .from('hobbies')
    //       .select('*')
    //       .order('name');
    //       
    //     if (error) throw error;
    //     setHobbies(data || []);
    //   } catch (error) {
    //     console.error('Error fetching hobbies:', error);
    //     toast.error('Failed to load hobbies');
    //   }
    // };
    // 
    // fetchHobbies();
  }, []);

  const filteredHobbies = hobbies
    .filter(hobby => 
      (activeCategory ? hobby.category === activeCategory : true) &&
      (searchQuery ? hobby.name.toLowerCase().includes(searchQuery.toLowerCase()) : true)
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const toggleHobby = (hobbyName: string) => {
    if (selectedHobbies.includes(hobbyName)) {
      onHobbiesChange(selectedHobbies.filter(h => h !== hobbyName));
    } else {
      if (selectedHobbies.length >= maxSelections) {
        toast.info(`You can select up to ${maxSelections} hobbies`);
        return;
      }
      onHobbiesChange([...selectedHobbies, hobbyName]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          className="pl-10 pr-4 py-2"
          placeholder="Search hobbies..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      <ScrollArea className="h-16 whitespace-nowrap rounded-md border">
        <div className="flex p-1 space-x-1">
          <Button
            variant={activeCategory === null ? "default" : "outline"}
            size="sm"
            className="rounded-md"
            onClick={() => setActiveCategory(null)}
          >
            All
          </Button>
          {hobbyCategories.map(category => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              className="rounded-md"
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </ScrollArea>

      <div className="flex flex-wrap gap-2 mb-4">
        {selectedHobbies.map(hobby => (
          <Button
            key={hobby}
            variant="default"
            size="sm"
            className="rounded-full bg-brand-purple text-white"
            onClick={() => toggleHobby(hobby)}
          >
            {hobbies.find(h => h.name === hobby)?.icon || ''}
            {' '}{hobby}
            <span className="ml-1">×</span>
          </Button>
        ))}
        {selectedHobbies.length === 0 && (
          <div className="text-sm text-gray-500 italic">
            No hobbies selected yet
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {filteredHobbies.map(hobby => (
          <Button
            key={hobby.id}
            variant={selectedHobbies.includes(hobby.name) ? "default" : "outline"}
            size="sm"
            className={`justify-start ${selectedHobbies.includes(hobby.name) ? 'bg-brand-purple/10 text-brand-purple border-brand-purple/30' : ''}`}
            onClick={() => toggleHobby(hobby.name)}
          >
            <div className="mr-2">{hobby.icon}</div>
            <span>{hobby.name}</span>
            {selectedHobbies.includes(hobby.name) && (
              <Check className="ml-auto h-4 w-4" />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default HobbiesSelector;
