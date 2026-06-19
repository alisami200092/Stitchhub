import { Webhooks } from "@polar-sh/nextjs";
import { handleSuccessfulPayment } from "@/lib/polar-utils";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET ?? "",
  onCheckoutUpdated: async (payload) => {
    const { data: checkout } = payload as {
      data: {
        id: string;
        status: string;
        metadata?: Record<string, string | number | boolean | undefined>;
      };
    };

    if (checkout.status !== "succeeded") return;

    await handleSuccessfulPayment(checkout);
  },
});
