const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Donation = require('../models/Donation');

// @route   POST api/donations
// @desc    Create a new donation
// @access  Public
router.post(
  '/',
  [
    check('amount', 'Amount is required').not().isEmpty(),
    check('currency', 'Currency is required').not().isEmpty(),
    check('payment_method', 'Payment method is required').not().isEmpty(),
    check('donor_name', 'Donor name is required').not().isEmpty(),
    check('donor_email', 'Please include a valid email').isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        user_id,
        amount,
        currency,
        payment_method,
        donor_name,
        donor_email,
        donor_address,
        donor_phone,
        donor_message,
        is_recurring,
        receipt_needed,
        status
      } = req.body;

      // Benzersiz bir transaction ID oluştur
      const transactionId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const newDonation = new Donation({
        userId: user_id,
        amount,
        currency,
        paymentMethod: payment_method,
        transactionId,
        status: status || 'PENDING',
        donorName: donor_name,
        donorEmail: donor_email,
        date: Date.now()
      });

      const donation = await newDonation.save();
      res.json(donation);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/donations/user/:userId
// @desc    Get all donations for a user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const donations = await Donation.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(donations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/donations/:id
// @desc    Get donation details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({ msg: 'Donation not found' });
    }

    res.json(donation);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Donation not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET api/donations
// @desc    Get all donations
// @access  Public
router.get('/', async (req, res) => {
  try {
    const donations = await Donation.find().sort({ date: -1 });
    res.json(donations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 