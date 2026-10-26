const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/tools - fetch all tools
router.get('/tools', async (req, res) => {
  try {
    const tools = await prisma.tool.findMany({ orderBy: { id: 'asc' } });
    res.json(tools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/tools - save a new tool to the database
router.post('/tools', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
    const tool = await prisma.tool.create({
      data: {
        name: name.trim(),
        description: description || '',
        isAvailable: true,
      },
    });
    res.status(201).json(tool);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/tools/:id - borrow or return a tool
router.patch('/tools/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid tool id' });
  }
  try {
    const existing = await prisma.tool.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Tool not found' });
    }
    const updated = await prisma.tool.update({
      where: { id },
      data: { isAvailable: !existing.isAvailable },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
