import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, X, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { isOnline } from "@/lib/offlineAI";

interface MedicalReportUploadProps {
  onReportUploaded: (reportText: string, fileName: string) => void;
  uploadedReport: { text: string; fileName: string } | null;
  onRemoveReport: () => void;
}

export const MedicalReportUpload = ({
  onReportUploaded,
  uploadedReport,
  onRemoveReport,
}: MedicalReportUploadProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [online, setOnline] = useState(isOnline());
  
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (20MB limit)
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File size must be less than 20MB");
      return;
    }

    setIsProcessing(true);
    toast.info("Processing your medical report...");

    try {
      // For text files, read directly
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        const text = await file.text();
        onReportUploaded(text, file.name);
        toast.success("Report uploaded successfully!");
      } 
      // For PDFs and other documents, we'd need to parse them
      // Since we can't use the parse_document tool directly in the browser,
      // we'll handle PDF parsing on the backend or ask users to upload text
      else if (file.type === "application/pdf") {
        toast.error("PDF support coming soon! Please upload a text file (.txt) for now.");
      } else {
        toast.error("Unsupported file format. Please upload a .txt or .pdf file.");
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Failed to process the file. Please try again.");
    } finally {
      setIsProcessing(false);
      event.target.value = "";
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload Medical Report (Optional)
          </CardTitle>
          <div className="flex items-center gap-2 text-sm">
            {online ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-green-500">Online - Full AI</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-orange-500" />
                <span className="text-orange-500">Offline - Basic</span>
              </>
            )}
          </div>
        </div>
        <CardDescription>
          Upload your blood test or medical report for AI analysis combined with CANary assessment.
          {!online && " (Offline mode: basic keyword analysis will be used)"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!uploadedReport ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <Label htmlFor="report-upload" className="cursor-pointer">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">
                    Text files (.txt) or PDF files (max 20MB)
                  </p>
                </div>
                <Input
                  id="report-upload"
                  type="file"
                  accept=".txt,.pdf"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="hidden"
                />
              </Label>
            </div>
            {isProcessing && (
              <p className="text-sm text-center text-muted-foreground">
                Processing your report...
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">{uploadedReport.fileName}</p>
                <p className="text-sm text-muted-foreground">
                  {uploadedReport.text.length} characters
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemoveReport}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
