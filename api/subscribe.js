const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "This endpoint only accepts POST requests." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const email = (body?.email || "").trim().toLowerCase();

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Please enter a valid email address."
      });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const ownerEmail = process.env.OWNER_EMAIL;

    if (!apiKey) {
      return res.status(500).json({
        error: "Oops! Email delivery service is currently unavailable."
      });
    }

    const now = new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });

    const userHtml = `
      <div style="font-family:Segoe UI,Arial,sans-serif;background:#020617;color:#e2e8f0;padding:24px;">
        <div style="max-width:560px;margin:0 auto;background:linear-gradient(145deg,#0f172a,#1e293b);border:1px solid #334155;border-radius:18px;padding:24px;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#38bdf8;">Portfolio Hub</p>
          <h1 style="margin:0 0 10px;font-size:24px;color:#f8fafc;">You're subscribed.</h1>
          <p style="margin:0 0 16px;line-height:1.6;color:#cbd5e1;">
            Thanks for subscribing to creation updates. You'll receive launch notes and highlights when new creations go live.
          </p>
          <div style="background:#0b1220;border:1px solid #334155;border-radius:12px;padding:14px;">
            <p style="margin:0;color:#94a3b8;font-size:13px;">Subscriber</p>
            <p style="margin:6px 0 0;color:#f8fafc;font-weight:600;">${email}</p>
            <p style="margin:10px 0 0;color:#94a3b8;font-size:12px;">Added on ${now}</p>
          </div>
        </div>
      </div>
    `;

    const userPayload = {
      from: fromEmail,
      to: [email],
      subject: "You're in - Portfolio Hub updates",
      html: userHtml,
    };

    const userResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userPayload),
    });

    if (!userResponse.ok) {
      const errorBody = await userResponse.text();
      return res.status(502).json({
        error: "We couldn't send the confirmation email right now. Please try again shortly.",
        details: errorBody,
      });
    }

    if (ownerEmail) {
      const ownerPayload = {
        from: fromEmail,
        to: [ownerEmail],
        subject: "New Portfolio Hub subscriber",
        html: `<p><strong>${email}</strong> subscribed on ${now}.</p>`,
      };

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ownerPayload),
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subscription successful. Please check your email."
    });
  } catch (error) {
    return res.status(500).json({
      error: "Something went wrong on our side. Please try again later.",
      details: error?.message || "Unknown error",
    });
  }
};
