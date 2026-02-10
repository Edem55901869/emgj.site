import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { admin_name, admin_email, plan_name, amount, proof_url } = await req.json();

    // Envoyer l'email de notification
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'agnimakaedeme@gmail.com',
      subject: `Nouvelle preuve de paiement hébergement - ${plan_name}`,
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
          <div style="background: linear-gradient(135deg, #2563eb, #dc2626); padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h2 style="color: white; margin: 0;">🔔 Nouvelle Preuve de Paiement</h2>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
            <h3 style="color: #1f2937; margin-top: 0;">Détails de la soumission</h3>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>👤 Administrateur:</strong> ${admin_name}</p>
              <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${admin_email}</p>
              <p style="margin: 5px 0;"><strong>📦 Plan:</strong> ${plan_name}</p>
              <p style="margin: 5px 0;"><strong>💰 Montant:</strong> ${amount}</p>
            </div>
            
            <div style="margin: 25px 0;">
              <p style="color: #6b7280; margin-bottom: 10px;">📎 Preuve de paiement:</p>
              <a href="${proof_url}" target="_blank" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Voir la preuve
              </a>
            </div>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 25px; border-radius: 4px;">
              <p style="margin: 0; color: #92400e;"><strong>⚠️ Action requise:</strong> Vérifier ce paiement dans les 48h pour valider l'hébergement.</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>FTGJ - Système de gestion d'hébergement</p>
          </div>
        </div>
      `
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});