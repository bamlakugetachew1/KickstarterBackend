const catchAsync = require('../utils/catchAsync');
const payment = require('../utils/payment');
const Payment = require('../models/payments.model');
const BackedProject = require('../models/backedproject.model');
const Project = require('../models/project.model');
const { PaypalAccessToken } = require('../config/env.config');

const saveBackedProjects = catchAsync(async (projectid, creatorid) => {
  const BackedProjects = new BackedProject({
    projectid,
    creatorid,
  });
  await BackedProjects.save();
});

exports.fundProjects = catchAsync(async (req, res) => {
  const { projectid, payerid, amount, message } = req.body;
  process.env.PROJECT_ID = projectid;
  process.env.PAYER_ID = payerid;
  process.env.AMOUNT = amount;
  process.env.MESSAGE = message;
  const paymentUrl = await payment.createPayment(amount, message, PaypalAccessToken);
  res.redirect(paymentUrl);
});

// exports.fundProjects = catchAsync(async (req, res) => {
//   // const { projectid, payerid, amount, message } = req.body;
//   const queryParams = new URLSearchParams({
//     projectid: '662fe35c69b43e06e00940cb',
//     payerid: '662fd9cc392a484f5fcec147',
//     amount: '400',
//     message: 'Thanks for the motivatons and the upbring this to the world',
//   }).toString();
//   const successUrl = `http://localhost:3000/api/pay/success?${queryParams}`;
//   const cancelUrl = 'http://localhost:3000/api/pay/cancel';
// eslint-disable-next-line max-len
//   const paymentUrl = await payment.createPayment('30', 'message', PaypalAccessToken, successUrl, cancelUrl);
//   res.redirect(paymentUrl);
//   // res.json({ paymentUrl });
// });

exports.paymentSucessHandler = catchAsync(async (req, res) => {
  const projectid = process.env.PROJECT_ID;
  const payerid = process.env.PAYER_ID;
  const amount = process.env.AMOUNT;
  const message = process.env.MESSAGE;
  const { paymentId } = req.query;
  const paymentDetailsPromise = payment.getPaymentDetails(paymentId, PaypalAccessToken);
  const paymentDetails = await paymentDetailsPromise;
  const paymentStatus = await payment.executePayment(
    paymentId,
    paymentDetails.payer.payer_info.payer_id,
    PaypalAccessToken,
  );
  if (paymentStatus === 'approved') {
    saveBackedProjects(projectid, payerid);
    const PaymentsDetails = new Payment({
      projectid,
      payerid,
      amount,
      message,
      paymentemail: paymentDetails.payer.payer_info.email,
    });
    await PaymentsDetails.save();
    await Project.findOneAndUpdate({ _id: projectid }, { $inc: { amountReached: amount } });
    return res.redirect('http://localhost:5173/payment/success');
  }
  return res.json({ message: 'something went wrong your account not charged' });
});

// eslint-disable-next-line prettier/prettier
exports.paymentFailureHandler = catchAsync(async (req, res) => {
  req.session.destroy();
  return res.redirect('http://localhost:5173/payment/failed');
});

// exports.refundPayment = catchAsync(async (req, res) => {
//   // const { projectid, paymentemail } = req.body;
//   const account = await Payment.findOne({
//     projectid: '6614522821ea8d627a667e57',
//     paymentemail: 'sb-y371a30358162@personal.example.com',
//   });
//   await payment.initiatePayout(account.amount, account.paymentemail, PaypalAccessToken);
//   res.json({ message: 'succssfully send the  payment' });
// });

exports.refundPayment = catchAsync(async (req, res) => {
  const { projectid, paymentemail, isAmount } = req.body;
  let amount = isAmount ? isAmount * 0.95 : 0;
  const account = await Payment.findOne({ projectid, paymentemail });

  if (!isAmount) {
    amount = account.amount;
  }

  await payment.initiatePayout(amount, account.paymentemail, PaypalAccessToken);
  res.json({ message: 'Successfully sent the payment' });
});
