import type { Express, Request, Response } from "express";
import { db } from "./db";
import { emailCampaigns, emailRecipients } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { sendEmail } from "./email-service";
import { z } from "zod";

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated?.() || !req.user) {
    return res.status(401).json({ message: "Nao autenticado" });
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated?.() || !req.user) {
    return res.status(401).json({ message: "Nao autenticado" });
  }
  if ((req.user as any).role !== "admin") {
    return res.status(403).json({ message: "Apenas administradores" });
  }
  next();
}

function generateInviteHtml(recipientName: string, body: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#111118; border-radius:12px; border:1px solid #1e1e2e;">
          <tr>
            <td style="padding: 32px 40px; border-bottom: 1px solid #1e1e2e;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="display:inline-block; width:36px; height:36px; background-color:#3b82f6; border-radius:8px; text-align:center; line-height:36px; color:white; font-weight:bold; font-size:16px;">A</div>
                    <span style="color:#f1f5f9; font-size:18px; font-weight:700; margin-left:12px; vertical-align:middle; letter-spacing:-0.3px;">AuraAUDIT</span>
                  </td>
                  <td align="right">
                    <span style="color:#64748b; font-size:11px;">Due Diligence Platform</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="color:#94a3b8; font-size:14px; margin:0 0 8px 0;">Prezado(a),</p>
              <p style="color:#e2e8f0; font-size:15px; font-weight:600; margin:0 0 24px 0;">${recipientName || 'Cliente'}</p>
              <div style="color:#cbd5e1; font-size:14px; line-height:1.7; margin:0 0 32px 0;">
                ${body.replace(/\n/g, '<br>')}
              </div>
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #3b82f6, #2563eb); border-radius:8px;">
                    <a href="https://audit.auradue.com/login" style="display:inline-block; padding:14px 32px; color:#ffffff; text-decoration:none; font-size:14px; font-weight:600; letter-spacing:0.3px;">
                      Acessar Plataforma
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid #1e1e2e; text-align:center;">
              <p style="color:#475569; font-size:11px; margin:0;">
                AuraAUDIT — Due Diligence Platform<br>
                CTS Brasil | Cadeia de Custodia Digital<br>
                <a href="https://audit.auradue.com" style="color:#3b82f6; text-decoration:none;">audit.auradue.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function registerEmailRoutes(app: Express) {
  app.get("/api/email/campaigns", requireAdmin, async (req: Request, res: Response) => {
    const campaigns = await db.select().from(emailCampaigns).orderBy(desc(emailCampaigns.createdAt));
    res.json(campaigns);
  });

  app.get("/api/email/campaigns/:id", requireAdmin, async (req: Request, res: Response) => {
    const [campaign] = await db.select().from(emailCampaigns).where(eq(emailCampaigns.id, req.params.id));
    if (!campaign) return res.status(404).json({ message: "Campanha nao encontrada" });

    const recipients = await db.select().from(emailRecipients).where(eq(emailRecipients.campaignId, req.params.id));
    res.json({ ...campaign, recipients });
  });

  app.post("/api/email/campaigns", requireAdmin, async (req: Request, res: Response) => {
    const schema = z.object({
      subject: z.string().min(1),
      body: z.string().min(1),
      fromEmail: z.string().email().optional(),
      fromName: z.string().optional(),
      recipients: z.array(z.object({
        email: z.string().email(),
        name: z.string().optional(),
        company: z.string().optional(),
      })).min(1),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Dados invalidos", errors: parsed.error.errors });

    const data = parsed.data;
    const user = req.user as any;

    const [campaign] = await db.insert(emailCampaigns).values({
      subject: data.subject,
      body: data.body,
      fromEmail: data.fromEmail || "contato@auradue.com",
      fromName: data.fromName || "AuraAUDIT",
      recipientCount: data.recipients.length,
      sentByUserId: user.id,
      status: "draft",
    }).returning();

    for (const r of data.recipients) {
      await db.insert(emailRecipients).values({
        campaignId: campaign.id,
        email: r.email,
        name: r.name || null,
        company: r.company || null,
        status: "pending",
      });
    }

    res.json(campaign);
  });

  app.post("/api/email/campaigns/:id/send", requireAdmin, async (req: Request, res: Response) => {
    const [campaign] = await db.select().from(emailCampaigns).where(eq(emailCampaigns.id, req.params.id));
    if (!campaign) return res.status(404).json({ message: "Campanha nao encontrada" });
    if (campaign.status === "sent") return res.status(400).json({ message: "Campanha ja foi enviada" });

    const recipients = await db.select().from(emailRecipients)
      .where(eq(emailRecipients.campaignId, campaign.id));

    let sentCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
      try {
        const html = generateInviteHtml(recipient.name || '', campaign.body);
        await sendEmail({
          to: recipient.email,
          subject: campaign.subject,
          html,
          fromEmail: campaign.fromEmail,
          fromName: campaign.fromName,
        });

        await db.update(emailRecipients)
          .set({ status: "sent", sentAt: new Date() })
          .where(eq(emailRecipients.id, recipient.id));
        sentCount++;
      } catch (err: any) {
        await db.update(emailRecipients)
          .set({ status: "failed", error: err.message || "Erro desconhecido" })
          .where(eq(emailRecipients.id, recipient.id));
        failedCount++;
      }
    }

    await db.update(emailCampaigns)
      .set({
        status: "sent",
        sentCount,
        failedCount,
        sentAt: new Date(),
      })
      .where(eq(emailCampaigns.id, campaign.id));

    res.json({ sentCount, failedCount, total: recipients.length });
  });

  app.delete("/api/email/campaigns/:id", requireAdmin, async (req: Request, res: Response) => {
    const [campaign] = await db.select().from(emailCampaigns).where(eq(emailCampaigns.id, req.params.id));
    if (!campaign) return res.status(404).json({ message: "Campanha nao encontrada" });
    if (campaign.status === "sent") return res.status(400).json({ message: "Nao e possivel excluir campanha ja enviada" });

    await db.delete(emailRecipients).where(eq(emailRecipients.campaignId, campaign.id));
    await db.delete(emailCampaigns).where(eq(emailCampaigns.id, campaign.id));
    res.json({ message: "Campanha excluida" });
  });

  app.post("/api/email/test", requireAdmin, async (req: Request, res: Response) => {
    const schema = z.object({
      to: z.string().email(),
      subject: z.string().min(1),
      body: z.string().min(1),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Dados invalidos" });

    try {
      const html = generateInviteHtml("Teste", parsed.data.body);
      const result = await sendEmail({
        to: parsed.data.to,
        subject: parsed.data.subject,
        html,
      });
      res.json({ success: true, result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
}
