import { prisma } from '../config/db.js';
import { streamUploadToCloudinary } from '../middleware/uploadMiddleware.js';

const VALID_POSITIONS = ['ST', 'CAM', 'CM', 'CB', 'GK'];

// Validate primary position strictly to 1 element
const isValidPosition = (pos) => {
  return VALID_POSITIONS.includes(pos?.toUpperCase());
};

// @desc    Register a new player profile
// @route   POST /api/player/register
// @access  Private (PLAYER only)
export const registerPlayer = async (req, res) => {
  try {
    const { name, studentId, academicSession, jerseyName, primaryPosition, secondaryPositions } = req.body;

    // Check if player profile already exists
    const existingProfile = await prisma.playerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Player profile already exists. Use PUT /api/player/register to edit.'
      });
    }

    // Validate inputs
    if (!studentId || !academicSession || !jerseyName || !primaryPosition) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: studentId, academicSession, jerseyName, primaryPosition'
      });
    }

    // Strictly validate 1 primary position
    if (!isValidPosition(primaryPosition)) {
      return res.status(400).json({
        success: false,
        message: `Primary position must be exactly one of: [${VALID_POSITIONS.join(', ')}]`
      });
    }

    // Handle profile image upload to Cloudinary (memory buffer)
    let imageUrl = null;
    let cloudPublicId = null;

    if (req.file) {
      const uploadResult = await streamUploadToCloudinary(req.file.buffer);
      imageUrl = uploadResult.secure_url;
      cloudPublicId = uploadResult.public_id;
    }

    // Update user's name if provided
    if (name) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { name }
      });
    }

    // Create player profile
    const profile = await prisma.playerProfile.create({
      data: {
        userId: req.user.id,
        studentId,
        academicSession,
        jerseyName,
        primaryPosition: primaryPosition.toUpperCase(),
        secondaryPositions: Array.isArray(secondaryPositions)
          ? secondaryPositions.join(',')
          : (secondaryPositions || ''),
        basePrice: 0, // Inits base price
        imageUrl,
        cloudPublicId,
        status: 'REGISTERED'
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Player registered successfully',
      profile
    });
  } catch (error) {
    console.error('registerPlayer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error registering player',
      error: error.message
    });
  }
};

// @desc    Edit existing player profile (Allowed only in SETUP or REGISTRATION phase)
// @route   PUT /api/player/register
// @access  Private (PLAYER only)
export const updateRegistration = async (req, res) => {
  try {
    const { name, studentId, academicSession, jerseyName, primaryPosition, secondaryPositions } = req.body;

    const profile = await prisma.playerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Player profile not found'
      });
    }

    // Validate primary position strictly to 1 element
    if (primaryPosition && !isValidPosition(primaryPosition)) {
      return res.status(400).json({
        success: false,
        message: `Primary position must be exactly one of: [${VALID_POSITIONS.join(', ')}]`
      });
    }

    // Handle new image upload if provided
    let imageUrl = profile.imageUrl;
    let cloudPublicId = profile.cloudPublicId;

    if (req.file) {
      const uploadResult = await streamUploadToCloudinary(req.file.buffer);
      imageUrl = uploadResult.secure_url;
      cloudPublicId = uploadResult.public_id;
    }

    if (name) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { name }
      });
    }

    const updatedProfile = await prisma.playerProfile.update({
      where: { userId: req.user.id },
      data: {
        studentId: studentId || profile.studentId,
        academicSession: academicSession || profile.academicSession,
        jerseyName: jerseyName || profile.jerseyName,
        primaryPosition: primaryPosition ? primaryPosition.toUpperCase() : profile.primaryPosition,
        secondaryPositions: secondaryPositions !== undefined
          ? (Array.isArray(secondaryPositions) ? secondaryPositions.join(',') : secondaryPositions)
          : profile.secondaryPositions,
        imageUrl,
        cloudPublicId
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Player profile updated successfully',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('updateRegistration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating player registration',
      error: error.message
    });
  }
};

// @desc    Withdraw registration profile (Allowed only in SETUP or REGISTRATION phase)
// @route   DELETE /api/player/register
// @access  Private (PLAYER only)
export const withdrawRegistration = async (req, res) => {
  try {
    const profile = await prisma.playerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'No registration profile found to withdraw'
      });
    }

    await prisma.playerProfile.delete({
      where: { userId: req.user.id }
    });

    return res.status(200).json({
      success: true,
      message: 'Player profile registration successfully withdrawn'
    });
  } catch (error) {
    console.error('withdrawRegistration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error withdrawing registration',
      error: error.message
    });
  }
};

// @desc    Get current player's profile registration details
// @route   GET /api/player/me
// @access  Private (PLAYER only)
export const getMyRegistration = async (req, res) => {
  try {
    const profile = await prisma.playerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'No player profile registration found for current account'
      });
    }

    return res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('getMyRegistration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching player registration details'
    });
  }
};
