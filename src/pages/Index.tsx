
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/ui/Logo";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to onboarding after showing the splash screen briefly
    const timer = setTimeout(() => {
      navigate("/");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-bg">
      <div className="text-white">
        <div className="flex justify-center mb-4">
          <Logo size="lg" withText={false} />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-center">CareerPathMatch</h1>
        <p className="text-lg opacity-80 text-center">
          Find your perfect career companion
        </p>
      </div>
    </div>
  );
};

export default Index;
