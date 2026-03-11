import Request from '../models/Request.js';

// POST /api/requests — Faculty creates a reschedule request
export const createRequest = async (req, res) => {
  try {
    const { facultyId, facultyName, currentSlotId, requestedSlotId, reason } = req.body;

    if (!facultyId || !facultyName || !currentSlotId || !requestedSlotId || !reason) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const request = new Request({
      facultyId,
      facultyName,
      currentSlotId,
      requestedSlotId,
      reason,
    });
    await request.save();

    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ message: 'Error creating request', error: error.message });
  }
};

// GET /api/requests — Get all requests (optionally filter by status or facultyId)
export const getRequests = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.facultyId) filter.facultyId = req.query.facultyId;

    const requests = await Request.find(filter)
      .populate('currentSlotId')
      .populate('requestedSlotId')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests', error: error.message });
  }
};

// GET /api/requests/:id — Get a single request by ID
export const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('currentSlotId')
      .populate('requestedSlotId');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching request', error: error.message });
  }
};

// PATCH /api/requests/:id/approve — Admin approves a request
export const approveRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Request already ${request.status}` });
    }

    request.status = 'approved';
    request.reviewedBy = req.body.adminId || null;
    request.reviewedAt = new Date();
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error approving request', error: error.message });
  }
};

// PATCH /api/requests/:id/reject — Admin rejects a request
export const rejectRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Request already ${request.status}` });
    }

    request.status = 'rejected';
    request.reviewedBy = req.body.adminId || null;
    request.reviewedAt = new Date();
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting request', error: error.message });
  }
};
