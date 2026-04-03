import Slot from "../models/Slot.js";

const normalizeSlotForResponse = (slot) =>
  typeof slot.toObject === "function" ? slot.toObject() : slot;

const normalizeIncomingOccurrences = (payload = {}) => {
  if (!Array.isArray(payload.occurrences)) {
    return [];
  }

  return payload.occurrences.map((entry) => ({
    day: entry?.day,
    startTime: entry?.startTime,
    endTime: entry?.endTime,
  }));
};

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const hasTimeOverlap = (leftStart, leftEnd, rightStart, rightEnd) => {
  const leftStartMinutes = timeToMinutes(leftStart);
  const leftEndMinutes = timeToMinutes(leftEnd);
  const rightStartMinutes = timeToMinutes(rightStart);
  const rightEndMinutes = timeToMinutes(rightEnd);
  return (
    leftStartMinutes < rightEndMinutes && rightStartMinutes < leftEndMinutes
  );
};

const findOccurrenceConflict = async (occurrences, excludeSlotId = null) => {
  const query = excludeSlotId ? { _id: { $ne: excludeSlotId } } : {};
  const existingSlots = await Slot.find(query).lean();

  for (const incoming of occurrences) {
    for (const existingSlot of existingSlots) {
      for (const existingOccurrence of existingSlot.occurrences || []) {
        if (incoming.day !== existingOccurrence.day) {
          continue;
        }

        if (
          hasTimeOverlap(
            incoming.startTime,
            incoming.endTime,
            existingOccurrence.startTime,
            existingOccurrence.endTime,
          )
        ) {
          return {
            slotId: existingSlot._id,
            label: existingSlot.label,
            occurrenceId: existingOccurrence._id,
            day: existingOccurrence.day,
            startTime: existingOccurrence.startTime,
            endTime: existingOccurrence.endTime,
          };
        }
      }
    }
  }

  return null;
};

// Get all slots
export const getAllSlots = async (req, res) => {
  try {
    const slots = await Slot.find().sort({ label: 1 });
    res.json(slots.map(normalizeSlotForResponse));
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching slots", error: error.message });
  }
};

// Get single slot by ID
export const getSlotById = async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }
    res.json(normalizeSlotForResponse(slot));
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching slot", error: error.message });
  }
};

// Create new slot
export const createSlot = async (req, res) => {
  try {
    const { label } = req.body;
    const normalizedLabel = (label || "").trim();
    const occurrences = normalizeIncomingOccurrences(req.body);

    if (!normalizedLabel || !occurrences.length) {
      return res
        .status(400)
        .json({ message: "Label and at least one occurrence are required" });
    }

    if (
      occurrences.some(
        (entry) => !entry.day || !entry.startTime || !entry.endTime,
      )
    ) {
      return res.status(400).json({
        message: "Each occurrence must include day, startTime, and endTime",
      });
    }

    const duplicate = await Slot.findOne({ label: normalizedLabel }).lean();
    if (duplicate) {
      return res.status(409).json({
        message: "A slot with this label already exists",
      });
    }

    const conflict = await findOccurrenceConflict(occurrences);
    if (conflict) {
      return res.status(409).json({
        message: "Occurrence conflicts with an existing slot",
        conflict,
      });
    }

    const created = await Slot.create({
      label: normalizedLabel,
      occurrences,
    });

    res.status(201).json(normalizeSlotForResponse(created));
  } catch (error) {
    if (error?.code === 11000) {
      return res
        .status(409)
        .json({ message: "A slot with this label already exists" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: "Error creating slot", error: error.message });
  }
};

// Update slot
export const updateSlot = async (req, res) => {
  try {
    const { label } = req.body;
    const { id } = req.params;
    const normalizedLabel = (label || "").trim();
    const occurrences = normalizeIncomingOccurrences(req.body);

    if (!normalizedLabel || !occurrences.length) {
      return res
        .status(400)
        .json({ message: "Label and at least one occurrence are required" });
    }

    if (
      occurrences.some(
        (entry) => !entry.day || !entry.startTime || !entry.endTime,
      )
    ) {
      return res.status(400).json({
        message: "Each occurrence must include day, startTime, and endTime",
      });
    }

    const duplicate = await Slot.findOne({
      _id: { $ne: id },
      label: normalizedLabel,
    }).lean();
    if (duplicate) {
      return res.status(409).json({
        message: "A slot with this label already exists",
      });
    }

    const conflict = await findOccurrenceConflict(occurrences, id);
    if (conflict) {
      return res.status(409).json({
        message: "Occurrence conflicts with an existing slot",
        conflict,
      });
    }

    const slot = await Slot.findByIdAndUpdate(
      id,
      { label: normalizedLabel, occurrences },
      { new: true, runValidators: true },
    );

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    res.json(normalizeSlotForResponse(slot));
  } catch (error) {
    if (error?.code === 11000) {
      return res
        .status(409)
        .json({ message: "A slot with this label already exists" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: "Error updating slot", error: error.message });
  }
};

// Delete slot
export const deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;

    const slot = await Slot.findByIdAndDelete(id);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    res.json({ message: "Slot deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting slot", error: error.message });
  }
};
