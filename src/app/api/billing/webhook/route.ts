import { getStripe } from "@/lib/billing/stripe";
import {
  handleCheckoutSessionCompleted,
  markUserSubscriptionCanceled,
  syncSubscriptionFromStripe,
} from "@/lib/billing/webhook-handlers";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();
  const signature = headerList.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing stripe-signature or STRIPE_WEBHOOK_SECRET" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook error";
    console.error(
      `[stripe-webhook] Webhook signature verification failed: ${message}`,
    );
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscriptionFromStripe(subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        if (userId) {
          await markUserSubscriptionCanceled(userId);
        } else {
          await syncSubscriptionFromStripe(subscription);
        }
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(
      `[stripe-webhook] Error processing webhook event ${event.type}:`,
      err,
    );
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
