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
    check('paymentMethod', 'Payment method is required').not().isEmpty(),
    check('transactionId', 'Transaction ID is required').not().isEmpty(),
    check('status', 'Status is required').not().isEmpty(),
    check('donorName', 'Donor name is required').not().isEmpty(),
    check('donorEmail', 'Please include a valid email').isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        userId,
        amount,
        currency,
        paymentMethod,
        transactionId,
        status,
        donorName,
        donorEmail,
        date
      } = req.body;

      const newDonation = new Donation({
        userId,
        amount,
        currency,
        paymentMethod,
        transactionId,
        status,
        donorName,
        donorEmail,
        date: date || Date.now()
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
// @access  Private
router.get('/user/:userId', auth, async (req, res) => {
  try {
    // Kullanıcının kendi bağışlarını görmesini sağla
    if (req.user.id !== req.params.userId) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    const donations = await Donation.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(donations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/donations
// @desc    Get all donations (admin only)
// @access  Private/Admin
router.get('/', auth, async (req, res) => {
  try {
    // Sadece admin kullanıcıların tüm bağışları görmesine izin ver
    if (!req.user.isAdmin) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    const donations = await Donation.find().sort({ date: -1 });
    res.json(donations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 