import { prisma } from '../config/db.js';

// @desc    Get current global system phase
// @route   GET /api/admin/system-phase
// @access  Private (SUPER_ADMIN)
export const getSystemPhase = async (req, res) => {
  try {
    let systemState = await prisma.systemState.findFirst();
    if (!systemState) {
      systemState = await prisma.systemState.create({
        data: { currentPhase: 'SETUP' }
      });
    }

    return res.status(200).json({
      success: true,
      currentPhase: systemState.currentPhase
    });
  } catch (error) {
    console.error('getSystemPhase error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching system phase'
    });
  }
};

// @desc    Update system phase
// @route   PUT /api/admin/system-phase
// @access  Private (SUPER_ADMIN)
export const updateSystemPhase = async (req, res) => {
  try {
    const { phase } = req.body;

    const validPhases = ['SETUP', 'REGISTRATION', 'AUCTION', 'TOURNAMENT'];
    if (!validPhases.includes(phase)) {
      return res.status(400).json({
        success: false,
        message: `Invalid phase. Must be one of [${validPhases.join(', ')}]`
      });
    }

    let systemState = await prisma.systemState.findFirst();
    if (!systemState) {
      systemState = await prisma.systemState.create({
        data: { currentPhase: phase }
      });
    } else {
      systemState = await prisma.systemState.update({
        where: { id: systemState.id },
        data: { currentPhase: phase }
      });
    }

    return res.status(200).json({
      success: true,
      message: `System phase successfully updated to ${phase}`,
      currentPhase: systemState.currentPhase
    });
  } catch (error) {
    console.error('updateSystemPhase error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating system phase'
    });
  }
};

// @desc    Get rules configuration (Total budget, category tiers, bidding rules)
// @route   GET /api/admin/rules
// @access  Private (SUPER_ADMIN or others depending on requirement, let's keep public/authenticated readable but only SUPER_ADMIN writeable)
export const getEventRules = async (req, res) => {
  try {
    const categoryTiers = await prisma.categoryTier.findMany();
    const biddingRules = await prisma.biddingRule.findMany();

    // Default configuration for budget
    // For simplicity, we can fetch team budget configuration from teams or from a standard default
    const teamSample = await prisma.team.findFirst();
    const totalTeamBudget = teamSample ? teamSample.budget : 100000;

    return res.status(200).json({
      success: true,
      totalTeamBudget,
      categoryTiers,
      biddingRules
    });
  } catch (error) {
    console.error('getEventRules error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching event rules'
    });
  }
};

// @desc    Update rules configuration (Phase 1 config)
// @route   PUT /api/admin/rules
// @access  Private (SUPER_ADMIN only)
export const updateEventRules = async (req, res) => {
  try {
    const { totalTeamBudget, categoryTiers, biddingRules } = req.body;

    // 1. Update Team Budgets
    if (totalTeamBudget !== undefined) {
      await prisma.team.updateMany({
        data: {
          budget: parseFloat(totalTeamBudget),
          remainingBudget: parseFloat(totalTeamBudget) // Resetting budget
        }
      });
    }

    // 2. Re-create Category Tiers
    if (categoryTiers && Array.isArray(categoryTiers)) {
      await prisma.categoryTier.deleteMany();
      await prisma.categoryTier.createMany({
        data: categoryTiers.map(tier => ({
          name: tier.name,
          basePrice: parseFloat(tier.basePrice)
        }))
      });
    }

    // 3. Re-create Bidding Rules
    if (biddingRules && Array.isArray(biddingRules)) {
      await prisma.biddingRule.deleteMany();
      await prisma.biddingRule.createMany({
        data: biddingRules.map(rule => ({
          minBudgetPercent: parseFloat(rule.minBudgetPercent),
          maxBudgetPercent: parseFloat(rule.maxBudgetPercent),
          raiseStep: parseFloat(rule.raiseStep)
        }))
      });
    }

    const updatedTiers = await prisma.categoryTier.findMany();
    const updatedRules = await prisma.biddingRule.findMany();

    return res.status(200).json({
      success: true,
      message: 'Event rules configured and updated successfully',
      totalTeamBudget,
      categoryTiers: updatedTiers,
      biddingRules: updatedRules
    });
  } catch (error) {
    console.error('updateEventRules error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error configuring event rules'
    });
  }
};
