import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TestResult } from "@/lib/storage";

interface EmailReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: 'single' | 'comparison' | 'trend';
  report?: TestResult;
  reportA?: TestResult;
  reportB?: TestResult;
  filteredReports?: TestResult[];
  dateRange?: { from?: Date; to?: Date };
}

export const EmailReportDialog = ({
  isOpen,
  onClose,
  reportType,
  report,
  reportA,
  reportB,
  filteredReports,
  dateRange,
}: EmailReportDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipientEmail: "",
    recipientName: "",
    senderName: "",
    subject: getDefaultSubject(),
    message: "",
  });

  function getDefaultSubject() {
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    switch (reportType) {
      case 'single':
        return `CANary Cancer Risk Screening Report - ${date}`;
      case 'comparison':
        return `CANary Report Comparison - ${date}`;
      case 'trend':
        return `CANary Risk Trend Report - ${date}`;
      default:
        return `CANary Report - ${date}`;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.recipientEmail) {
      toast({ title: "Error", description: "Please enter recipient email.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      // Build report summary based on type
      let reportSummary: any = {};

      if (reportType === 'single' && report) {
        reportSummary = {
          date: new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          riskLevels: {
            pancreatic: report.predictions?.pancreatic?.probability ?? 0,
            colon: report.predictions?.colon?.probability ?? 0,
            blood: report.predictions?.blood?.probability ?? 0,
          },
        };
      } else if (reportType === 'comparison' && reportA && reportB) {
        reportSummary = {
          dateRange: {
            from: new Date(reportA.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            to: new Date(reportB.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          },
        };
      } else if (reportType === 'trend' && filteredReports) {
        reportSummary = {
          dateRange: {
            from: dateRange?.from 
              ? dateRange.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : filteredReports.length > 0 
                ? new Date(filteredReports[filteredReports.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Start',
            to: dateRange?.to
              ? dateRange.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : filteredReports.length > 0
                ? new Date(filteredReports[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Present',
          },
          reportCount: filteredReports.length,
        };
      }

      const { data, error } = await supabase.functions.invoke('send-report-email', {
        body: {
          recipientEmail: formData.recipientEmail,
          recipientName: formData.recipientName,
          senderName: formData.senderName,
          subject: formData.subject,
          message: formData.message,
          reportType,
          reportSummary,
        },
      });

      if (error) throw error;

      toast({ 
        title: "Email Sent", 
        description: `Report summary sent to ${formData.recipientEmail}. Don't forget to attach the PDF!` 
      });
      
      // Reset form and close
      setFormData({
        recipientEmail: "",
        recipientName: "",
        senderName: "",
        subject: getDefaultSubject(),
        message: "",
      });
      onClose();
    } catch (error: any) {
      console.error("Error sending email:", error);
      toast({ 
        title: "Failed to Send", 
        description: error.message || "Could not send email. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Email Report to Provider
          </DialogTitle>
          <DialogDescription>
            Send a summary email to your healthcare provider. Remember to also share the downloaded PDF for complete details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipientEmail">Provider's Email *</Label>
            <Input
              id="recipientEmail"
              type="email"
              placeholder="doctor@example.com"
              value={formData.recipientEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, recipientEmail: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipientName">Provider's Name</Label>
            <Input
              id="recipientName"
              type="text"
              placeholder="Dr. Smith"
              value={formData.recipientName}
              onChange={(e) => setFormData(prev => ({ ...prev, recipientName: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senderName">Your Name</Label>
            <Input
              id="senderName"
              type="text"
              placeholder="Your name"
              value={formData.senderName}
              onChange={(e) => setFormData(prev => ({ ...prev, senderName: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Additional Message</Label>
            <Textarea
              id="message"
              placeholder="Add any notes or context for your healthcare provider..."
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
