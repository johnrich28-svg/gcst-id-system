import { Staff } from '../models/Staff.model.js';
import { ApiResponse } from '../utils/apiResponse.js';
import bcrypt from 'bcryptjs';

// GET /admin/staff — list all active staff (name + id only, no PIN)
export const getStaff = async (req, res, next) => {
  try {
    const staff = await Staff.find({ isActive: true }).select('name _id').sort({ name: 1 });
    res.status(200).json(new ApiResponse(200, staff));
  } catch (error) {
    next(error);
  }
};

// POST /admin/staff/verify — verify PIN, return staff info if correct
export const verifyStaffPin = async (req, res, next) => {
  try {
    const { staffId, pin } = req.body;
    if (!staffId || !pin) {
      return res.status(400).json(new ApiResponse(400, null, 'Staff ID and PIN are required'));
    }

    const staff = await Staff.findById(staffId);
    if (!staff || !staff.isActive) {
      return res.status(404).json(new ApiResponse(404, null, 'Staff member not found'));
    }

    const isMatch = await staff.comparePin(pin);
    if (!isMatch) {
      return res.status(401).json(new ApiResponse(401, null, 'Incorrect PIN'));
    }

    res.status(200).json(new ApiResponse(200, { id: staff._id, name: staff.name }, 'PIN verified'));
  } catch (error) {
    next(error);
  }
};

// POST /admin/staff — create a new staff member (superadmin only, or for setup)
export const createStaff = async (req, res, next) => {
  try {
    const { name, pin } = req.body;
    if (!name || !pin) {
      return res.status(400).json(new ApiResponse(400, null, 'Name and PIN are required'));
    }
    if (String(pin).length < 4) {
      return res.status(400).json(new ApiResponse(400, null, 'PIN must be at least 4 digits'));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(String(pin), salt);

    const staff = await Staff.create({ name, pin: hashedPin });
    res.status(201).json(new ApiResponse(201, { id: staff._id, name: staff.name }, 'Staff member created'));
  } catch (error) {
    next(error);
  }
};

// DELETE /admin/staff/:id — deactivate staff member
export const deactivateStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!staff) return res.status(404).json(new ApiResponse(404, null, 'Staff not found'));
    res.status(200).json(new ApiResponse(200, null, 'Staff member deactivated'));
  } catch (error) {
    next(error);
  }
};
