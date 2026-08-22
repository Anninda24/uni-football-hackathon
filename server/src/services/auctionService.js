import { prisma } from '../config/db.js';

// Constants for Roster Rules
const DEFAULT_MIN_ROSTER = 7;

// Fetch the lowest category tier base price dynamically from the DB
const getLowestBasePrice = async () => {
  const tiers = await prisma.categoryTier.findMany({
    orderBy: { basePrice: 'asc' }
  });
  return tiers.length > 0 ? tiers[0].basePrice : 3000;
};

// @desc    Process a bid request using serializable DB transaction
export const processNormalBid = async ({ playerId, teamId, userId, amount }) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch current active team details
    const team = await tx.team.findUnique({
      where: { id: teamId }
    });

    if (!team) {
      throw new Error('Franchise team not found');
    }

    // 2. Calculate current roster slots filled by this team
    const currentRosterCount = await tx.playerProfile.count({
      where: {
        status: 'SOLD',
        user: {
          managedTeam: {
            id: teamId
          }
        }
      }
    });

    // 3. Fetch minimum category base price dynamically
    const lowestPrice = await getLowestBasePrice();

    // 4. Validate remaining budget guardrail
    const remainingSlots = Math.max(0, DEFAULT_MIN_ROSTER - currentRosterCount - 1);
    const requiredReservedBudget = remainingSlots * lowestPrice;

    if (team.remainingBudget - amount < requiredReservedBudget) {
      throw new Error(
        `Bid Rejected: Insufficient reserve budget ($${requiredReservedBudget}) to fill remaining ${remainingSlots} roster slot(s) at minimum base price ($${lowestPrice} each).`
      );
    }

    if (team.remainingBudget < amount) {
      throw new Error('Bid Rejected: Amount exceeds remaining team budget.');
    }

    // 5. Create new bid record in AuctionLedger
    const bid = await tx.auctionLedger.create({
      data: {
        playerId,
        teamId,
        amount,
        type: 'NORMAL'
      }
    });

    return {
      success: true,
      bid,
      teamName: team.name,
      remainingBudget: team.remainingBudget
    };
  });
};

// @desc    Save blind sealed-bid envelope submission
export const processBlindBid = async ({ playerId, teamId, amount }) => {
  return await prisma.$transaction(async (tx) => {
    const team = await tx.team.findUnique({
      where: { id: teamId }
    });

    if (!team) throw new Error('Team not found');

    const lowestPrice = await getLowestBasePrice();
    const currentRosterCount = await tx.playerProfile.count({
      where: {
        status: 'SOLD',
        user: {
          managedTeam: { id: teamId }
        }
      }
    });

    const remainingSlots = Math.max(0, DEFAULT_MIN_ROSTER - currentRosterCount - 1);
    const requiredReservedBudget = remainingSlots * lowestPrice;

    if (team.remainingBudget - amount < requiredReservedBudget) {
      throw new Error('Bid Rejected: Violates budget guardrail reserve.');
    }

    // Save bid record (Not active until revealed at T=0)
    const bid = await tx.auctionLedger.create({
      data: {
        playerId,
        teamId,
        amount,
        type: 'BLIND'
      }
    });

    return { success: true, bid };
  });
};

// @desc    Finalize Sale of Player to Team
export const finalizePlayerSale = async ({ playerId, teamId, amount }) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Mark player profile as SOLD
    const updatedProfile = await tx.playerProfile.update({
      where: { id: playerId },
      data: {
        status: 'SOLD',
        basePrice: amount
      }
    });

    // 2. Deduct team remaining budget
    const team = await tx.team.findUnique({
      where: { id: teamId }
    });

    if (team) {
      await tx.team.update({
        where: { id: teamId },
        data: {
          remainingBudget: team.remainingBudget - amount
        }
      });
    }

    return updatedProfile;
  });
};

// @desc    Rollback last bid from ledger
export const rollbackLastBid = async (playerId) => {
  return await prisma.$transaction(async (tx) => {
    const bids = await tx.auctionLedger.findMany({
      where: { playerId },
      orderBy: { timestamp: 'desc' }
    });

    if (bids.length === 0) {
      throw new Error('No bids to rollback');
    }

    // Delete the latest bid
    const lastBid = bids[0];
    await tx.auctionLedger.delete({
      where: { id: lastBid.id }
    });

    // Return the previous bid (if any)
    const remainingBids = bids.slice(1);
    return remainingBids.length > 0 ? remainingBids[0] : null;
  });
};
