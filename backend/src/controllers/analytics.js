const Url = require('../models/Url');
const Visit = require('../models/Visit');

// @desc    Get analytics report for a specific shortened URL
// @route   GET /api/analytics/:id
// @access  Private
exports.getUrlAnalytics = async (req, res, next) => {
  try {
    const url = await Url.findById(req.params.id);

    if (!url) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }

    // Verify ownership
    if (url.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view analytics for this link' });
    }

    // 1. Fetch total clicks
    const totalClicks = url.clicks;

    // 2. Fetch last visited time
    const lastVisitDoc = await Visit.findOne({ urlId: url._id }).sort({ timestamp: -1 });
    const lastVisited = lastVisitDoc ? lastVisitDoc.timestamp : null;

    // 3. Compile daily click count trends for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const rawTrends = await Visit.aggregate([
      {
        $match: {
          urlId: url._id,
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          clicks: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format trend data with zeros for days with no activity
    const trendMap = new Map(rawTrends.map(t => [t._id, t.clicks]));
    const clicksByDate = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      clicksByDate.push({
        date: dateStr,
        clicks: trendMap.get(dateStr) || 0
      });
    }

    // 4. Device segment breakdown
    const devices = await Visit.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: '$device', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } }
    ]);

    // 5. Browser segment breakdown
    const browsers = await Visit.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } }
    ]);

    // 6. Geographic country segment breakdown
    const countries = await Visit.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { name: '$_id', value: '$count', _id: 0 } }
    ]);

    // 7. Extract the latest 10 visits log details
    const recentVisits = await Visit.find({ urlId: url._id })
      .sort({ timestamp: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        url,
        totalClicks,
        lastVisited,
        clicksByDate,
        devices,
        browsers,
        countries,
        recentVisits
      }
    });
  } catch (error) {
    next(error);
  }
};
