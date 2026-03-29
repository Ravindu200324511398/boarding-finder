// server/routes/ai.js
// ─────────────────────────────────────────────────────────
// AI Feature 5 — Listing Writer
// POST /api/ai/generate-listing
// Takes basic listing details, returns AI-generated title + description
// ─────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const { protect } = require('../middleware/auth');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── POST /api/ai/generate-listing ────────────────────────
// Body: { location, price, roomType, amenities[], gender, description }
// Returns: { title, description }
router.post('/generate-listing', protect, async (req, res, next) => {
  try {
    const { location, price, roomType, amenities = [], gender, description } = req.body;

    if (!location || !price || !roomType) {
      return res.status(400).json({
        success: false,
        message: 'location, price and roomType are required to generate a listing',
      });
    }

    const amenityList = amenities.length > 0
      ? amenities.join(', ')
      : 'not specified';

    const genderLabel = gender === 'Any' ? 'open to anyone' : `${gender} only`;

    const userNotes = description?.trim()
      ? `Owner notes: "${description.trim()}"`
      : 'No additional notes from owner.';

    const prompt = `You are a professional property listing copywriter specialising in student boarding houses in Sri Lanka.

Write a compelling boarding house listing based on the following details:

- Location: ${location}
- Room type: ${roomType}
- Monthly price: LKR ${Number(price).toLocaleString()}
- Suitable for: ${genderLabel}
- Amenities: ${amenityList}
- ${userNotes}

Your response must be a JSON object with exactly two fields:
1. "title" — a catchy, specific listing title (max 60 characters). Do NOT include the price in the title.
2. "description" — a warm, honest, detailed description of 3–4 sentences (80–130 words). Mention the location, room type, key amenities, and who it suits best. Write in third person. No bullet points.

Respond ONLY with the raw JSON object. No markdown, no code fences, no extra text.

Example format:
{"title":"Bright Single Room Near Moratuwa University","description":"This well-maintained single room is ideally situated..."}`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    // Strip any accidental markdown fences
    const cleaned = raw.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return res.status(500).json({
        success: false,
        message: 'AI returned unexpected format. Please try again.',
      });
    }

    if (!parsed.title || !parsed.description) {
      return res.status(500).json({
        success: false,
        message: 'AI response was incomplete. Please try again.',
      });
    }

    res.json({
      success: true,
      title: parsed.title.trim(),
      description: parsed.description.trim(),
    });
  } catch (err) {
    // Anthropic SDK throws structured errors
    if (err?.status === 401) {
      return res.status(500).json({ success: false, message: 'Invalid Anthropic API key. Check your .env file.' });
    }
    if (err?.status === 429) {
      return res.status(429).json({ success: false, message: 'AI rate limit reached. Please wait a moment and try again.' });
    }
    next(err);
  }
});

// ── POST /api/ai/improve-listing ─────────────────────────
// Improves an existing description the owner already wrote
// Body: { existingDescription, location, roomType, price }
// Returns: { description }
router.post('/improve-listing', protect, async (req, res, next) => {
  try {
    const { existingDescription, location, roomType, price } = req.body;

    if (!existingDescription) {
      return res.status(400).json({ success: false, message: 'existingDescription is required' });
    }

    const prompt = `You are a professional copywriter for student boarding houses in Sri Lanka.

Improve the following boarding listing description. Make it more appealing, clear and professional — but keep all the factual details accurate. Fix grammar. Keep it to 3–4 sentences (80–130 words). Write in third person.

Context:
- Location: ${location || 'not provided'}
- Room type: ${roomType || 'not provided'}  
- Price: LKR ${price ? Number(price).toLocaleString() : 'not provided'}/month

Original description:
"${existingDescription}"

Respond with ONLY the improved description text. No JSON, no labels, no quotes.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    const improved = message.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('')
      .trim();

    res.json({ success: true, description: improved });
  } catch (err) {
    next(err);
  }
});

module.exports = router;