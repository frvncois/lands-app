// server/routes/stripe.js
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// Create checkout session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { priceId, projectId, successUrl, cancelUrl } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        projectId: projectId.toString(),
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Check subscription status
router.get('/subscription-status/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    // TODO: Query your database for the subscription ID associated with this project
    // For now, we'll simulate this - replace with your actual database query
    
    // Example database query (replace with your actual implementation):
    // const project = await db.collection('projects').doc(projectId).get();
    // const stripeSubscriptionId = project.data()?.settings?.stripeSubscriptionId;
    
    // For testing, return free plan
    const project = { settings: { stripeSubscriptionId: null } }; // Replace this line
    
    if (!project.settings?.stripeSubscriptionId) {
      return res.json({
        isActive: false,
        planId: 'free',
        status: 'inactive'
      });
    }

    // Get subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(project.settings.stripeSubscriptionId);
    
    const isActive = subscription.status === 'active';
    
    // Map Stripe price ID to plan ID
    const priceToplanMap = {
      'price_1RnNk2GbBhc0ZLgaRknNo32B': 'basic',
      'price_1RnNkwGbBhc0ZLganF5Tuv5m': 'pro'
    };
    
    const planId = priceToplanMap[subscription.items.data[0].price.id] || 'free';

    res.json({
      isActive,
      planId,
      status: subscription.status,
      subscriptionId: subscription.id
    });

  } catch (error) {
    console.error('Error checking subscription:', error);
    res.json({
      isActive: false,
      planId: 'free',
      status: 'error'
    });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Received webhook event:', event.type);

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Checkout session completed:', session.id);
      await handleSuccessfulPayment(session);
      break;

    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object;
      console.log('Subscription updated:', updatedSubscription.id);
      await handleSubscriptionChange(updatedSubscription);
      break;

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      console.log('Subscription deleted:', deletedSubscription.id);
      await handleSubscriptionChange(deletedSubscription);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

async function handleSuccessfulPayment(session) {
  try {
    // Get the subscription
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    const projectId = session.metadata.projectId;

    // Map price ID to plan
    const priceToplanMap = {
      'price_1RnNk2GbBhc0ZLgaRknNo32B': 'basic',
      'price_1RnNkwGbBhc0ZLganF5Tuv5m': 'pro'
    };
    
    const planId = priceToplanMap[subscription.items.data[0].price.id] || 'free';

    console.log(`Payment successful for project ${projectId}, plan: ${planId}`);

    // TODO: Update your database here
    // Example database update (replace with your actual implementation):
    /*
    await db.collection('projects').doc(projectId).update({
      'settings.plan': planId,
      'settings.stripeSubscriptionId': subscription.id,
      'settings.subscriptionStatus': subscription.status
    });
    */

    console.log(`Updated project ${projectId} to ${planId} plan`);
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

async function handleSubscriptionChange(subscription) {
  try {
    console.log(`Handling subscription change: ${subscription.id}, status: ${subscription.status}`);

    // TODO: Find project by subscription ID in your database
    // Example database query (replace with your actual implementation):
    /*
    const projectQuery = await db.collection('projects')
      .where('settings.stripeSubscriptionId', '==', subscription.id)
      .get();
    
    if (projectQuery.empty) {
      console.log('Project not found for subscription:', subscription.id);
      return;
    }
    
    const project = projectQuery.docs[0];
    */

    let planId = 'free';
    
    if (subscription.status === 'active') {
      const priceToplanMap = {
        'price_1RnNk2GbBhc0ZLgaRknNo32B': 'basic',
        'price_1RnNkwGbBhc0ZLganF5Tuv5m': 'pro'
      };
      planId = priceToplanMap[subscription.items.data[0].price.id] || 'free';
    }

    // TODO: Update database
    /*
    await project.ref.update({
      'settings.plan': planId,
      'settings.subscriptionStatus': subscription.status
    });
    */

    console.log(`Updated subscription status to ${subscription.status}, plan: ${planId}`);
  } catch (error) {
    console.error('Error handling subscription change:', error);
  }
}

module.exports = router;