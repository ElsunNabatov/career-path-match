
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, CheckCircle, XCircle, Pencil, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface LinkedInDetails {
  fullName: string;
  jobTitle: string;
  company: string;
  education: string;
  skills: string[];
}

const LinkedinVerificationScreen: React.FC = () => {
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const [linkedinDetails, setLinkedinDetails] = useState<LinkedInDetails>({
    fullName: "Jane Smith",
    jobTitle: "Senior Product Designer",
    company: "Tech Innovations Inc.",
    education: "BFA Design, Rhode Island School of Design",
    skills: ["UI Design", "UX Research", "Prototyping", "Design Systems"]
  });
  
  const [editableDetails, setEditableDetails] = useState<LinkedInDetails>({...linkedinDetails});
  
  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      setLinkedinDetails({...editableDetails});
      toast.success("Profile details updated");
    }
    setIsEditing(!isEditing);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableDetails({
      ...editableDetails,
      [name]: value
    });
  };
  
  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(',').map(skill => skill.trim());
    setEditableDetails({
      ...editableDetails,
      skills
    });
  };
  
  const handleVerify = () => {
    // In a real app, this would initiate the LinkedIn OAuth flow
    toast.info("Initiating LinkedIn verification...");
    
    // Simulate successful verification
    setTimeout(() => {
      setIsVerified(true);
      toast.success("LinkedIn profile verified successfully!");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b flex items-center">
        <button onClick={() => navigate("/profile")} className="mr-2">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold">LinkedIn Verification</h1>
      </div>

      <div className="p-4">
        <div className="mb-6 flex justify-between items-center">
          {isVerified ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">Verified Profile</span>
            </div>
          ) : (
            <div className="flex items-center text-gray-500">
              <XCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">Not Verified</span>
            </div>
          )}
          
          {isVerified && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleEditToggle}
            >
              {isEditing ? (
                <>Save Changes</>
              ) : (
                <>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </>
              )}
            </Button>
          )}
        </div>
        
        {isVerified ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              {isEditing ? (
                <Input 
                  name="fullName"
                  value={editableDetails.fullName}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{linkedinDetails.fullName}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Job Title</label>
              {isEditing ? (
                <Input 
                  name="jobTitle"
                  value={editableDetails.jobTitle}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{linkedinDetails.jobTitle}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Company</label>
              {isEditing ? (
                <Input 
                  name="company"
                  value={editableDetails.company}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{linkedinDetails.company}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Education</label>
              {isEditing ? (
                <Input 
                  name="education"
                  value={editableDetails.education}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{linkedinDetails.education}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Skills</label>
              {isEditing ? (
                <Input 
                  name="skills"
                  value={editableDetails.skills.join(', ')}
                  onChange={handleSkillsChange}
                  placeholder="Separate skills with commas"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded">
                  <div className="flex flex-wrap gap-2">
                    {linkedinDetails.skills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="pt-4">
              <p className="text-sm text-gray-500 mb-4">
                These details were imported from your verified LinkedIn profile. You can edit them if needed.
              </p>
              
              <div className="flex items-center bg-blue-50 p-3 rounded-lg">
                <Shield className="h-6 w-6 text-blue-700 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    Your profile is verified with LinkedIn
                  </p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    Last verified on April 5, 2023
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-gray-600">
              Connect your LinkedIn profile to verify your professional information and build trust with potential matches.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Benefits of LinkedIn Verification</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
                  <span>Verify your professional background</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
                  <span>Import your job history and education automatically</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
                  <span>Get a "Verified" badge on your profile</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
                  <span>Improve your match quality with other professionals</span>
                </li>
              </ul>
            </div>
            
            <Button 
              onClick={handleVerify}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="20" height="20" rx="2" fill="#0A66C2" />
                <path d="M8 10V16.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 6.5V7.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 16.5V10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 16.5V12.5C16 11.5 15.5 10 14 10C12.5 10 12 11.5 12 12.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Connect with LinkedIn
            </Button>
            
            <p className="text-xs text-center text-gray-500">
              We'll never post anything to your LinkedIn profile without your permission.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkedinVerificationScreen;
