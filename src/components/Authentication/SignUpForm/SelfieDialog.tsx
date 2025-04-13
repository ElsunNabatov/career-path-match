
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SelfieDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: () => void;
  onCancel: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const SelfieDialog: React.FC<SelfieDialogProps> = ({
  isOpen,
  onOpenChange,
  onCapture,
  onCancel,
  videoRef,
  canvasRef
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Take a Selfie for Verification</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
          <canvas ref={canvasRef} width="640" height="640" className="hidden" />
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onCapture}>
            Capture
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelfieDialog;
