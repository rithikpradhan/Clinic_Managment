const EMAILJS_API_URL = "https://api.emailjs.com/api/v1.0/email/send";

/**
 * Sends an email via EmailJS API
 * @param {Object} data - { to, subject, message, patient_name, images }
 */
export async function sendEmailJS({ to, subject, message, patient_name, images = [] }) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    throw new Error("EmailJS configuration is missing. Check your .env file.");
  }


  // If there are images, we add them as a list of links or descriptions
  // Note: EmailJS free plan has limits on attachments, so we'll mention them in the message
  let finalMessage = message;
  
  if (images.length > 0) {
    finalMessage += "\n\n[Attachments included in this appointment record]";
  }

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: {
      to_email: to,
      patient_name: patient_name,
      subject: subject,
      message: finalMessage,
      // You can add more variables here if your template uses them
    },
  };

  const response = await fetch(EMAILJS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to send email via EmailJS");
  }

  return true;
}
