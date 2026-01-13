import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  invitationToken: string;
  role: string;
  inviterName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, invitationToken, role, inviterName } = await req.json() as InvitationRequest;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    const origin = req.headers.get('origin') || 'https://app.example.com';
    const inviteLink = `${origin}/accept-invite/${invitationToken}`;
    
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured, simulating email send");
      
      // Return success but indicate email wasn't actually sent
      return new Response(
        JSON.stringify({ 
          success: true, 
          simulated: true,
          message: `Email would be sent to ${email} with invitation link`,
          inviteLink
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Use esm.sh for Resend
    const { Resend } = await import("https://esm.sh/resend@2.0.0");
    const resend = new Resend(resendApiKey);

    const emailResponse = await resend.emails.send({
      from: "MarketAI Team <team@resend.dev>",
      to: [email],
      subject: "You've been invited to join a team on MarketAI",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; margin: 0; padding: 40px 20px;">
          <div style="max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); border-radius: 16px; overflow: hidden;">
            <div style="padding: 40px; text-align: center;">
              <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #8b5cf6, #d946ef); border-radius: 16px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 28px; font-weight: bold;">M</span>
              </div>
              <h1 style="color: white; font-size: 24px; margin: 0 0 16px;">You're Invited!</h1>
              <p style="color: #a5b4fc; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                ${inviterName ? `${inviterName} has` : 'Someone has'} invited you to join their team on MarketAI as a <strong style="color: #c4b5fd;">${role}</strong>.
              </p>
              <a href="${inviteLink}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #d946ef); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Accept Invitation
              </a>
              <p style="color: #64748b; font-size: 14px; margin-top: 32px;">
                This invitation expires in 7 days.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending invitation email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
