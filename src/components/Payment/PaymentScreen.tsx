
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, CreditCard, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

const PaymentScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const plan = searchParams.get("plan") || "premium";
  const type = searchParams.get("type");
  
  const [paymentMethod, setPaymentMethod] = useState<"card" | "apple" | "paypal">("card");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvc: ""
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails({
      ...cardDetails,
      [name]: value
    });
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, "")
      .match(/.{1,4}/g)
      ?.join(" ")
      .substr(0, 19) || "";
  };

  const formatExpiry = (value: string) => {
    return value
      .replace(/\s/g, "")
      .replace(/\//g, "")
      .match(/.{1,2}/g)
      ?.join("/")
      .substr(0, 5) || "";
  };

  const getTitle = () => {
    if (type === "coffee") return "Purchase Coffee Stickers";
    if (type === "meal") return "Purchase Meal Stickers";
    return plan === "premiumPlus" ? "Premium+ Subscription" : "Premium Subscription";
  };

  const getPrice = () => {
    if (type === "coffee") return "$5.00";
    if (type === "meal") return "$10.00";
    return plan === "premiumPlus" ? "$20.00/week" : "$10.00/week";
  };

  const getDescription = () => {
    if (type === "coffee") return "5 Coffee stickers";
    if (type === "meal") return "3 Meal stickers";
    return plan === "premiumPlus" ? "Premium+ weekly subscription" : "Premium weekly subscription";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (paymentMethod === "card") {
      if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvc) {
        toast.error("Please fill in all card details");
        return;
      }
    }
    
    // Process payment
    toast.success("Payment successful!");
    
    // Navigate based on what was purchased
    if (type) {
      navigate("/people");
    } else {
      navigate("/profile");
    }
  };

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b flex items-center">
        <button onClick={() => navigate(-1)} className="mr-2">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold">{getTitle()}</h1>
      </div>

      <div className="p-4">
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">{getDescription()}</h3>
            <span className="font-bold">{getPrice()}</span>
          </div>
          {!type && (
            <p className="text-sm text-gray-500 mt-1">
              Auto-renews every week. Cancel anytime.
            </p>
          )}
        </div>

        <h2 className="font-bold text-lg mb-3">Payment Method</h2>
        
        <RadioGroup
          value={paymentMethod}
          onValueChange={(value) => setPaymentMethod(value as "card" | "apple" | "paypal")}
          className="space-y-3 mb-6"
        >
          <div className="flex items-center space-x-2 border rounded-lg p-3">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card" className="flex-1 cursor-pointer">Credit/Debit Card</Label>
            <CreditCard className="h-5 w-5 text-gray-500" />
          </div>
          
          <div className="flex items-center space-x-2 border rounded-lg p-3">
            <RadioGroupItem value="apple" id="apple" />
            <Label htmlFor="apple" className="flex-1 cursor-pointer">Apple Pay</Label>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path d="M17.5 12.5C17.5 10.8 19 9.2 20.5 8.9C19.6 7.5 18 6.7 16.5 6.7C15 6.7 14.2 7.5 13.1 7.5C12 7.5 10.9 6.7 9.7 6.7C7.7 6.7 5.5 8.3 5.5 11.5C5.5 13.5 6.2 15.6 7.1 17C7.8 18.1 8.5 19 9.5 19C10.5 19 10.9 18.3 12.1 18.3C13.3 18.3 13.6 19 14.7 19C15.8 19 16.5 18.1 17.2 17C17.7 16.3 18.1 15.4 18.3 14.5C16.5 14 15.5 12.5 15.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 3.5C13.2 4.3 12 5 11 5C11 3.8 11.8 2.6 12.6 2C13.4 1.4 14.5 1 15.5 1C15.5 2.2 14.8 2.7 14 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-lg p-3">
            <RadioGroupItem value="paypal" id="paypal" />
            <Label htmlFor="paypal" className="flex-1 cursor-pointer">PayPal</Label>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path d="M6.5 15H5L6 9H8.5C9.5 9 10 9.5 10 10.2C10 12 8.5 12.5 7 12.5H6.5L7 10.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10.5 15H9L10 9H12.5C13.5 9 14 9.5 14 10.2C14 12 12.5 12.5 11 12.5H10.5L11 10.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 15L15 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 20.5C7 20.5 7.5 19.5 9 18.5H16C17.5 18.5 18.5 17.5 19 16L21 10.5C21.5 9.5 21 8.5 20 8.5H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 7.5C3 7.5 3.5 6.5 5 5.5H12C13.5 5.5 14.5 4.5 15 3L17 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </RadioGroup>

        {paymentMethod === "card" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                name="number"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.number}
                onChange={(e) => {
                  const formattedValue = formatCardNumber(e.target.value);
                  setCardDetails({...cardDetails, number: formattedValue});
                }}
                maxLength={19}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                name="name"
                placeholder="John Doe"
                value={cardDetails.name}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardExpiry">Expiry Date</Label>
                <Input
                  id="cardExpiry"
                  name="expiry"
                  placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChange={(e) => {
                    const formattedValue = formatExpiry(e.target.value);
                    setCardDetails({...cardDetails, expiry: formattedValue});
                  }}
                  maxLength={5}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardCvc">CVC</Label>
                <Input
                  id="cardCvc"
                  name="cvc"
                  placeholder="123"
                  value={cardDetails.cvc}
                  onChange={handleInputChange}
                  maxLength={3}
                />
              </div>
            </div>
            
            <Button 
              type="submit"
              className="w-full mt-6 bg-brand-purple hover:bg-brand-purple/90"
            >
              Pay {getPrice()}
            </Button>
          </form>
        )}
        
        {paymentMethod === "apple" && (
          <div className="mt-6">
            <Button 
              onClick={handleSubmit}
              className="w-full bg-black hover:bg-black/90 flex items-center justify-center gap-2"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                <path d="M17.5 12.5C17.5 10.8 19 9.2 20.5 8.9C19.6 7.5 18 6.7 16.5 6.7C15 6.7 14.2 7.5 13.1 7.5C12 7.5 10.9 6.7 9.7 6.7C7.7 6.7 5.5 8.3 5.5 11.5C5.5 13.5 6.2 15.6 7.1 17C7.8 18.1 8.5 19 9.5 19C10.5 19 10.9 18.3 12.1 18.3C13.3 18.3 13.6 19 14.7 19C15.8 19 16.5 18.1 17.2 17C17.7 16.3 18.1 15.4 18.3 14.5C16.5 14 15.5 12.5 15.5 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 3.5C13.2 4.3 12 5 11 5C11 3.8 11.8 2.6 12.6 2C13.4 1.4 14.5 1 15.5 1C15.5 2.2 14.8 2.7 14 3.5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Pay with Apple Pay
            </Button>
          </div>
        )}
        
        {paymentMethod === "paypal" && (
          <div className="mt-6">
            <Button 
              onClick={handleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M6.5 15H5L6 9H8.5C9.5 9 10 9.5 10 10.2C10 12 8.5 12.5 7 12.5H6.5L7 10.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.5 15H9L10 9H12.5C13.5 9 14 9.5 14 10.2C14 12 12.5 12.5 11 12.5H10.5L11 10.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 15L15 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 20.5C7 20.5 7.5 19.5 9 18.5H16C17.5 18.5 18.5 17.5 19 16L21 10.5C21.5 9.5 21 8.5 20 8.5H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 7.5C3 7.5 3.5 6.5 5 5.5H12C13.5 5.5 14.5 4.5 15 3L17 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Pay with PayPal
            </Button>
          </div>
        )}
        
        <p className="text-xs text-center text-gray-500 mt-6">
          By proceeding, you agree to our Terms of Service and acknowledge you've read our Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default PaymentScreen;
