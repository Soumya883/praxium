import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";

const isConfigured = !!(accountSid && authToken && process.env.TWILIO_WHATSAPP_NUMBER);

let client: any = null;
if (isConfigured && accountSid && authToken) {
  try {
    client = twilio(accountSid, authToken);
  } catch (error) {
    console.error("[TWILIO INITIALIZATION ERROR]:", error);
  }
}

export async function sendWhatsAppMessage(to: string, message: string): Promise<{ success: boolean; error?: string }> {
  // Validate and format phone number to E.164 +91 country prefix if 10 digits
  const cleanNumber = to.replace(/\D/g, "");
  let formattedNumber = to;
  
  if (cleanNumber.length === 10) {
    formattedNumber = `whatsapp:+91${cleanNumber}`;
  } else if (!to.startsWith("whatsapp:")) {
    formattedNumber = `whatsapp:+${cleanNumber}`;
  }

  console.log(`[WHATSAPP MESSAGE DISPATCH]: To: ${formattedNumber}, Body: "${message.replace(/\n/g, " ")}"`);

  if (!isConfigured || !client) {
    console.warn("[TWILIO SIMULATION]: Twilio environment SID or AuthToken not configured. Logged to console above.");
    return { success: true };
  }

  try {
    const res = await client.messages.create({
      body: message,
      from: twilioNumber,
      to: formattedNumber,
    });
    console.log(`[TWILIO SUCCESS] Message SID: ${res.sid}`);
    return { success: true };
  } catch (error: any) {
    console.error("[TWILIO API ERROR]:", error);
    return { success: false, error: error.message || "Twilio delivery failure" };
  }
}
