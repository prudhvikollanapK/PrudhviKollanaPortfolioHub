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
          <div style="max-width:620px;margin:0 auto;background:linear-gradient(145deg,#0f172a,#1e293b);border:1px solid #334155;border-radius:18px;overflow:hidden;">
            <div style="padding:18px 22px;background:linear-gradient(120deg,rgba(56,189,248,.18),rgba(34,197,94,.16));border-bottom:1px solid #334155;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#7dd3fc;">Portfolio Hub</p>
              <h1 style="margin:0;font-size:22px;color:#f8fafc;">You're subscribed</h1>
            </div>
            <div style="padding:22px;">
              <p style="margin:0 0 14px;line-height:1.65;color:#cbd5e1;">
                Thanks for subscribing to creation updates. You'll receive launch notes and highlights when new creations go live.
              </p>
              <div style="background:#0b1220;border:1px solid #334155;border-radius:12px;padding:14px 16px;">
                <p style="margin:0;color:#94a3b8;font-size:12px;">Subscriber</p>
                <p style="margin:6px 0 14px;color:#f8fafc;font-size:17px;font-weight:700;">${email}</p>
                <p style="margin:0;color:#94a3b8;font-size:12px;">Added on (IST)</p>
                <p style="margin:6px 0 0;color:#e2e8f0;font-size:14px;font-weight:600;">${now}</p>
              </div>
              <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;">
                <span style="display:inline-block;padding:5px 10px;border-radius:999px;background:rgba(56,189,248,.14);border:1px solid rgba(56,189,248,.32);font-size:11px;color:#bae6fd;">Portfolio Hub</span>
                <span style="display:inline-block;padding:5px 10px;border-radius:999px;background:rgba(34,197,94,.14);border:1px solid rgba(34,197,94,.32);font-size:11px;color:#bbf7d0;">Subscriber Event</span>
              </div>
              <div style="margin-top:20px;">
                <a href="https://prudhvi-kollana-portfolio-hub.vercel.app/" style="display:inline-block;padding:10px 14px;border-radius:10px;background:linear-gradient(120deg,rgba(56,189,248,.35),rgba(34,197,94,.35));border:1px solid rgba(148,163,184,.45);color:#f8fafc;text-decoration:none;font-weight:600;font-size:13px;">
                  Open Portfolio Hub
                </a>
              </div>
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
      const ownerHtml = `
        <div style="font-family:Segoe UI,Arial,sans-serif;background:#020617;color:#e2e8f0;padding:24px;">
          <div style="max-width:620px;margin:0 auto;background:linear-gradient(145deg,#0f172a,#1e293b);border:1px solid #334155;border-radius:18px;overflow:hidden;">
            <div style="padding:18px 22px;background:linear-gradient(120deg,rgba(56,189,248,.18),rgba(34,197,94,.16));border-bottom:1px solid #334155;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#7dd3fc;">Portfolio Hub - Subscriber Alert</p>
              <h1 style="margin:0;font-size:22px;color:#f8fafc;">New subscriber joined</h1>
            </div>
            <div style="padding:22px;">
              <p style="margin:0 0 14px;line-height:1.65;color:#cbd5e1;">
                A new user subscribed to creation updates. Details are below.
              </p>
              <div style="background:#0b1220;border:1px solid #334155;border-radius:12px;padding:14px 16px;">
                <p style="margin:0;color:#94a3b8;font-size:12px;">Subscriber Email</p>
                <p style="margin:6px 0 14px;color:#f8fafc;font-size:17px;font-weight:700;">${email}</p>
                <p style="margin:0;color:#94a3b8;font-size:12px;">Received At (IST)</p>
                <p style="margin:6px 0 0;color:#e2e8f0;font-size:14px;font-weight:600;">${now}</p>
              </div>
              <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;">
                <span style="display:inline-block;padding:5px 10px;border-radius:999px;background:rgba(56,189,248,.14);border:1px solid rgba(56,189,248,.32);font-size:11px;color:#bae6fd;">Portfolio Hub</span>
                <span style="display:inline-block;padding:5px 10px;border-radius:999px;background:rgba(34,197,94,.14);border:1px solid rgba(34,197,94,.32);font-size:11px;color:#bbf7d0;">Subscriber Event</span>
              </div>
              <div style="margin-top:20px;">
                <a href="https://prudhvi-kollana-portfolio-hub.vercel.app/?source" style="display:inline-block;padding:10px 14px;border-radius:10px;background:linear-gradient(120deg,rgba(56,189,248,.35),rgba(34,197,94,.35));border:1px solid rgba(148,163,184,.45);color:#f8fafc;text-decoration:none;font-weight:600;font-size:13px;">
                  Open Portfolio Hub
                </a>
              </div>
            </div>
          </div>
        </div>
      `;

      const ownerPayload = {
        from: fromEmail,
        to: [ownerEmail],
        subject: "New Portfolio Hub subscriber",
        html: ownerHtml,
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
