import { prisma } from '../config/db.js';

export const checkPhase = (...allowedPhases) => {
  return async (req, res, next) => {
    try {
      const systemState = await prisma.systemState.findFirst();
      const currentPhase = systemState ? systemState.currentPhase : 'SETUP';

      if (!allowedPhases.includes(currentPhase)) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: Action is only allowed during the following phase(s): [${allowedPhases.join(', ')}]. Current phase is: ${currentPhase}`
        });
      }

      // Attach currentPhase to request for down-stream access
      req.currentPhase = currentPhase;
      next();
    } catch (error) {
      console.error('Phase check middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error checking system phase'
      });
    }
  };
};
