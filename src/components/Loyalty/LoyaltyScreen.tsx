
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SlidersHorizontal, Coffee, Utensils, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// Sample data for partner venues
const coffeeShops = [
  {
    id: "c1",
    name: "Brew Haven",
    distance: "0.5",
    discount: { free: 0, premium: 10, premiumPlus: 20 },
    address: "123 Coffee Lane",
    rating: 4.8
  },
  {
    id: "c2",
    name: "Bean Bliss",
    distance: "0.8",
    discount: { free: 0, premium: 10, premiumPlus: 20 },
    address: "456 Espresso Ave",
    rating: 4.5
  },
  {
    id: "c3",
    name: "Café Serenity",
    distance: "1.2",
    discount: { free: 0, premium: 10, premiumPlus: 20 },
    address: "789 Latte Blvd",
    rating: 4.7
  }
];

const restaurants = [
  {
    id: "r1",
    name: "The Gourmet Gallery",
    distance: "0.7",
    discount: { free: 0, premium: 0, premiumPlus: 10 },
    address: "321 Fine Dining St",
    rating: 4.9
  },
  {
    id: "r2",
    name: "Savory Square",
    distance: "1.5",
    discount: { free: 0, premium: 0, premiumPlus: 10 },
    address: "654 Cuisine Court",
    rating: 4.6
  },
  {
    id: "r3",
    name: "Palette Plates",
    distance: "2.0",
    discount: { free: 0, premium: 0, premiumPlus: 10 },
    address: "987 Bistro Boulevard",
    rating: 4.8
  }
];

const LoyaltyScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("coffee");
  const [membershipType, setMembershipType] = useState<"free" | "premium" | "premiumPlus">("free");
  
  const handleVenueClick = (venue: any) => {
    toast.info(`Selected ${venue.name}`);
    // In a real app, this would navigate to the venue details or open maps
  };

  const handleUpgrade = () => {
    navigate("/premium");
  };

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-brand-blue">Loyalty Program</h1>
          <Button variant="outline" size="sm" onClick={handleUpgrade}>
            Upgrade
          </Button>
        </div>
        
        <div className="mt-3">
          <div className="bg-brand-purple/5 rounded-lg p-3 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Current Plan: {membershipType === "free" ? "Free" : membershipType === "premium" ? "Premium" : "Premium+"}</h3>
              <p className="text-sm text-gray-600">
                {membershipType === "free" 
                  ? "No discounts available" 
                  : membershipType === "premium"
                    ? "10% off at coffee shops"
                    : "10% off restaurants, 20% off coffee shops"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="coffee" className="flex items-center gap-2">
              <Coffee className="h-4 w-4" />
              Coffee Shops
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              Restaurants
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="coffee" className="mt-4 space-y-4">
            {coffeeShops.map((shop) => (
              <div 
                key={shop.id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleVenueClick(shop)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{shop.name}</h3>
                    <div className="flex items-center mt-1 text-sm text-gray-600">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      {shop.address}
                    </div>
                    <div className="flex items-center mt-2">
                      <span className="text-xs text-gray-500 mr-2">{shop.distance} mi</span>
                      <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">
                        {shop.rating} ★
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge 
                      variant={membershipType !== "free" ? "default" : "outline"}
                      className={
                        membershipType === "premiumPlus" ? "bg-brand-purple text-white" : 
                        membershipType === "premium" ? "bg-brand-blue text-white" : 
                        "bg-gray-100 text-gray-500"
                      }
                    >
                      {membershipType === "free" ? "0%" : membershipType === "premium" ? "10%" : "20%"} off
                    </Badge>
                    
                    {membershipType === "free" && (
                      <div className="mt-2">
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="text-xs p-0 h-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpgrade();
                          }}
                        >
                          Upgrade for discount
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="restaurants" className="mt-4 space-y-4">
            {restaurants.map((restaurant) => (
              <div 
                key={restaurant.id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleVenueClick(restaurant)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{restaurant.name}</h3>
                    <div className="flex items-center mt-1 text-sm text-gray-600">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      {restaurant.address}
                    </div>
                    <div className="flex items-center mt-2">
                      <span className="text-xs text-gray-500 mr-2">{restaurant.distance} mi</span>
                      <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">
                        {restaurant.rating} ★
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge 
                      variant={membershipType === "premiumPlus" ? "default" : "outline"}
                      className={
                        membershipType === "premiumPlus" ? "bg-brand-purple text-white" : 
                        "bg-gray-100 text-gray-500"
                      }
                    >
                      {membershipType === "premiumPlus" ? "10%" : "0%"} off
                    </Badge>
                    
                    {membershipType !== "premiumPlus" && (
                      <div className="mt-2">
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="text-xs p-0 h-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpgrade();
                          }}
                        >
                          Upgrade to Premium+
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LoyaltyScreen;
