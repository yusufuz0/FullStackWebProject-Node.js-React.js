require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { db } = require('../config/firebase');
const cron = require('node-cron');

async function runPayoutScheduler() {
  try {
    
    const balance = await stripe.balance.retrieve();
    console.log('🔍 Stripe Balance:', balance.available);

    console.log('🔄 Payout scheduler started...');

    const snapshot = await db.collection('orders')
      .where('payoutStatus', '==', 'pending')
      .get();

    if (snapshot.empty) {
      console.log('📭 No unpaid orders to process.');
      return;
    }

    const sellerMap = {};

    snapshot.forEach(doc => {
      const order = doc.data();

      const sellerId = order.sellerId;
      const stripeAccountId = order.sellerStripeAccountId;
      const orderPrice = parseFloat(order.price) * order.quantity;

      if (!stripeAccountId) {
        console.warn(`⚠️ Stripe hesabı eksik: ${sellerId}`);
        return;
      }

      if (!sellerMap[sellerId]) {
        sellerMap[sellerId] = {
          stripeAccountId,
          totalAmount: 0,
          orderRefs: [],
        };
      }

      sellerMap[sellerId].totalAmount += orderPrice;
      sellerMap[sellerId].orderRefs.push(doc.ref);
    });

    for (const [sellerId, data] of Object.entries(sellerMap)) {
      const totalCents = Math.round(data.totalAmount * 100);
      const commission = Math.round(totalCents * 0.20);
      const sellerPayout = totalCents - commission;

      console.log(`💸 Sending $${(sellerPayout / 100).toFixed(2)} to seller ${sellerId}`);

      await stripe.transfers.create({
        amount: sellerPayout,
        currency: 'gbp',
        destination: data.stripeAccountId,
        description: 'NotesMarket payout',
      });

      for (const ref of data.orderRefs) {
        await ref.update({
          payoutStatus: 'paid',
          paidAt: new Date(),
        });
      }
    }

    console.log('✅ Payout process completed.');

  } catch (error) {
    console.error('❌ Payout scheduler error:', error.message || error);
  }
}


cron.schedule('51 17 * * *', () => {
  console.log('⏰ Cron job triggered: Payout process is starting...');
  runPayoutScheduler();
},{
  timezone: 'UTC'  // <-- ZAMAN DİLİMİ BURADA AYARLANIR
});

// Eğer bu dosyayı direkt node ile çalıştırırsan, aşağıdaki satır ile cron çalışmaya başlar.
console.log('🔁 Payout scheduler cron job initialized...');