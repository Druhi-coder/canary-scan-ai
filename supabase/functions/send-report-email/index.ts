import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://esm.sh/zod@3.23.8";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const emailSchema = z.object({
  recipientEmail: z.string().email().max(255),
  recipientName: z.string().max(100).default(''),
  senderName: z.string().max(100).default(''),
  subject: z.string().min(1).max(200).regex(/^[^\r\n]+$/, "Subject must not contain line breaks"),
  message: z.string().max(2000).default(''),
  reportType: z.enum(['single', 'comparison', 'trend']),
  reportSummary: z.object({
    date: z.string().max(100).optional(),
    dateRange: z.object({
      from: z.string().max(100),
      to: z.string().max(100),
    }).optional(),
    riskLevels: z.object({
      pancreatic: z.number().min(0).max(100),
      colon: z.number().min(0).max(100),
      blood: z.number().min(0).max(100),
    }).optional(),
    reportCount: z.number().int().min(0).max(10000).optional(),
  }),
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate and sanitize inputs
    const rawBody = await req.json();
    const parseResult = emailSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: parseResult.error.flatten().fieldErrors }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { recipientEmail, recipientName, senderName, subject, message, reportType, reportSummary } = parseResult.data;

    // Escape all user-provided strings for HTML embedding
    const safeRecipientName = escapeHtml(recipientName || 'Healthcare Provider');
    const safeSenderName = escapeHtml(senderName);
    const safeMessage = escapeHtml(message);
    const safeSubject = escapeHtml(subject);

    // Build report summary HTML (reportSummary values are validated by zod)
    let reportDetailsHtml = '';
    
    if (reportType === 'single' && reportSummary.riskLevels) {
      const getRiskLabel = (prob: number) => prob >= 60 ? 'High' : prob >= 30 ? 'Medium' : 'Low';
      const getRiskColor = (prob: number) => prob >= 60 ? '#EF4444' : prob >= 30 ? '#F59E0B' : '#22C55E';
      const safeDate = escapeHtml(reportSummary.date || '');
      
      reportDetailsHtml = `
        <div style="background: #F9FAFB; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #374151;">Risk Assessment Summary</h3>
          <p style="margin: 5px 0; color: #6B7280;">Report Date: ${safeDate}</p>
          <table style="width: 100%; margin-top: 15px; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #E5E7EB;">Pancreatic Cancer</td>
              <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; text-align: right;">
                <span style="color: ${getRiskColor(reportSummary.riskLevels.pancreatic)}; font-weight: bold;">
                  ${reportSummary.riskLevels.pancreatic}% (${getRiskLabel(reportSummary.riskLevels.pancreatic)} Risk)
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #E5E7EB;">Colon Cancer</td>
              <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; text-align: right;">
                <span style="color: ${getRiskColor(reportSummary.riskLevels.colon)}; font-weight: bold;">
                  ${reportSummary.riskLevels.colon}% (${getRiskLabel(reportSummary.riskLevels.colon)} Risk)
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px;">Blood Cancer</td>
              <td style="padding: 10px; text-align: right;">
                <span style="color: ${getRiskColor(reportSummary.riskLevels.blood)}; font-weight: bold;">
                  ${reportSummary.riskLevels.blood}% (${getRiskLabel(reportSummary.riskLevels.blood)} Risk)
                </span>
              </td>
            </tr>
          </table>
        </div>
      `;
    } else if (reportType === 'trend' && reportSummary.dateRange) {
      reportDetailsHtml = `
        <div style="background: #F9FAFB; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #374151;">Trend Report Summary</h3>
          <p style="margin: 5px 0; color: #6B7280;">Period: ${escapeHtml(reportSummary.dateRange.from)} - ${escapeHtml(reportSummary.dateRange.to)}</p>
          <p style="margin: 5px 0; color: #6B7280;">Total Reports: ${reportSummary.reportCount ?? 0}</p>
        </div>
      `;
    } else if (reportType === 'comparison' && reportSummary.dateRange) {
      reportDetailsHtml = `
        <div style="background: #F9FAFB; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #374151;">Report Comparison</h3>
          <p style="margin: 5px 0; color: #6B7280;">Comparing reports from ${escapeHtml(reportSummary.dateRange.from)} to ${escapeHtml(reportSummary.dateRange.to)}</p>
        </div>
      `;
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3B82F6; margin: 0;">🐤 CANary</h1>
            <p style="color: #6B7280; margin: 5px 0;">Cancer Risk Screening Report</p>
          </div>
          
          <p>Dear ${safeRecipientName},</p>
          
          <p>${safeSenderName ? `${safeSenderName} has` : 'A patient has'} shared a cancer risk screening report with you from CANary.</p>
          
          ${safeMessage ? `
            <div style="background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 15px; margin: 20px 0;">
              <strong>Message from patient:</strong>
              <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${safeMessage}</p>
            </div>
          ` : ''}
          
          ${reportDetailsHtml}
          
          <div style="background: #FEF3C7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400E; font-size: 14px;">
              <strong>⚠️ Important Disclaimer:</strong> CANary is an AI-powered research tool for educational purposes only. 
              These results are NOT a medical diagnosis. Please use this information as a discussion starting point 
              with your patient and conduct appropriate clinical assessments.
            </p>
          </div>
          
          <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
            The patient has downloaded a detailed PDF report. Please request the PDF attachment directly from the patient for complete information.
          </p>
          
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
          
          <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
            This email was sent via CANary - Cancer Risk Screening Tool<br>
            For research and educational purposes only
          </p>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "CANary Reports <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: subject,
      html: emailHtml,
    });

    console.log("Email sent successfully");

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send email" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
