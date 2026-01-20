export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  // Mock implementation - in real scenario, integrate with email service like SendGrid
  console.log('Sending email:', payload);
  // Simulate async operation with timeout
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      resolve(undefined);
    }, 100);

    // Simulate possible timeout or failure
    // For demo, always succeed, but in real, handle timeout
  });
}