import { formatUsd, formatVes } from '@/lib/currency';

const GRAPH_API_VERSION = 'v21.0';

export interface WhatsAppOrderAlertInput {
  numeroOrden: string;
  clienteNombre: string;
  clienteTelefono: string;
  totalUsd: number;
  totalVes: number;
  tipoEntrega: 'delivery' | 'pickup';
  zonaBarinas?: string | null;
  direccionEntrega?: string | null;
  latitudEntrega?: number | null;
  longitudEntrega?: number | null;
}

export interface WhatsAppSendResult {
  sent: number;
  failed: number;
  errors: string[];
}

function getWhatsAppConfig() {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim() || '';
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() || '';
  const rawPhones = process.env.WHATSAPP_ADMIN_PHONE?.trim() || '';
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME?.trim() || '';
  const templateLang = process.env.WHATSAPP_TEMPLATE_LANG?.trim() || 'es';

  const recipients = rawPhones
    .split(',')
    .map((p) => p.replace(/\D/g, ''))
    .filter((p) => p.length >= 10);

  return {
    configured: Boolean(accessToken && phoneNumberId && recipients.length > 0),
    accessToken,
    phoneNumberId,
    recipients,
    templateName,
    templateLang,
  };
}

export function isWhatsAppConfigured(): boolean {
  return getWhatsAppConfig().configured;
}

function buildOrderTextBody(input: WhatsAppOrderAlertInput): string {
  const deliveryLabel = input.tipoEntrega === 'pickup' ? 'Retiro en tienda' : 'Delivery';
  const lines = [
    `*NUEVO PEDIDO #${input.numeroOrden} — EL CATADOR.*`,
    `Cliente: ${input.clienteNombre}`,
    `Teléfono: ${input.clienteTelefono}`,
    `Total: ${formatUsd(input.totalUsd)} (${formatVes(input.totalVes)})`,
    `Modalidad: ${deliveryLabel}${input.zonaBarinas ? ` · ${input.zonaBarinas}` : ''}`,
  ];

  if (input.direccionEntrega) {
    lines.push(`Dirección: ${input.direccionEntrega}`);
  }
  if (input.latitudEntrega && input.longitudEntrega) {
    lines.push(`GPS: https://maps.google.com/?q=${input.latitudEntrega},${input.longitudEntrega}`);
  }
  lines.push('Abre el panel: https://elcatadorbarinas.vercel.app/admin/pedidos');
  return lines.join('\n');
}

async function postGraphMessage(
  phoneNumberId: string,
  accessToken: string,
  payload: Record<string, unknown>
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (res.ok) return { ok: true };

  const errJson = (await res.json().catch(() => ({}))) as {
    error?: { message?: string; code?: number };
  };
  return {
    ok: false,
    error: errJson.error?.message || `HTTP ${res.status}`,
  };
}

/**
 * Envía una alerta de nuevo pedido al WhatsApp del administrador (o lista separada por comas).
 * Usa plantilla aprobada de Meta cuando WHATSAPP_TEMPLATE_NAME está configurado,
 * y cae automáticamente a texto enriquecido si la plantilla aún no está aprobada.
 */
export async function sendWhatsAppOrderAlertToAdmins(
  input: WhatsAppOrderAlertInput
): Promise<WhatsAppSendResult> {
  const cfg = getWhatsAppConfig();
  if (!cfg.configured) {
    return { sent: 0, failed: 0, errors: [] };
  }

  const deliveryLabel = input.tipoEntrega === 'pickup' ? 'Retiro en tienda' : 'Delivery';
  const textBody = buildOrderTextBody(input);
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  await Promise.allSettled(
    cfg.recipients.map(async (to) => {
      if (cfg.templateName && cfg.templateName !== 'text') {
        const templatePayload =
          cfg.templateName === 'hello_world'
            ? {
                messaging_product: 'whatsapp',
                to,
                type: 'template',
                template: { name: 'hello_world', language: { code: 'en_US' } },
              }
            : {
                messaging_product: 'whatsapp',
                to,
                type: 'template',
                template: {
                  name: cfg.templateName,
                  language: { code: cfg.templateLang },
                  components: [
                    {
                      type: 'body',
                      parameters: [
                        { type: 'text', text: input.numeroOrden },
                        { type: 'text', text: input.clienteNombre },
                        { type: 'text', text: formatUsd(input.totalUsd) },
                        { type: 'text', text: formatVes(input.totalVes) },
                        { type: 'text', text: deliveryLabel },
                      ],
                    },
                  ],
                },
              };

        const tplResult = await postGraphMessage(cfg.phoneNumberId, cfg.accessToken, templatePayload);
        if (tplResult.ok) {
          sent += 1;
          return;
        }
        errors.push(`Template(${to}): ${tplResult.error}`);
      }

      const textResult = await postGraphMessage(cfg.phoneNumberId, cfg.accessToken, {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { preview_url: false, body: textBody },
      });

      if (textResult.ok) {
        sent += 1;
      } else {
        failed += 1;
        errors.push(`Text(${to}): ${textResult.error}`);
      }
    })
  );

  return { sent, failed, errors };
}
