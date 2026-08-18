type EmailPayload = {
  body: string;
  subject: string;
  to: string;
};

export async function sendEmailNotification({ body, subject, to }: EmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFICATION_FROM_EMAIL;

  if (!apiKey || !from || !to) {
    return {
      error: "メール送信用の環境変数が未設定です。",
      sent: false,
      skipped: true,
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      text: body,
    }),
  });

  if (!response.ok) {
    return {
      error: await response.text(),
      sent: false,
      skipped: false,
    };
  }

  return {
    error: "",
    sent: true,
    skipped: false,
  };
}
