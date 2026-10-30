const Activity = require('../models/Activity');
const Student = require('../models/Student');
const FeePayment = require('../models/Fee');
const AuditLog = require('../models/AuditLog');

// @desc    Get real recent activities compiled from across institutional modules
// @route   GET /api/v1/activities
// @access  Private
exports.getActivities = async (req, res, next) => {
  try {
    const institutionId = req.user?.institutionId;
    const filter = institutionId ? { institutionId } : {};

    // Fetch real activities from Activity, Student admissions, Fee payments, and Audit logs
    const [rawActivities, recentStudents, recentPayments, recentAudits] = await Promise.all([
      Activity.find(filter).sort('-createdAt').limit(10).lean(),
      Student.find(filter).sort('-createdAt').limit(6).lean(),
      FeePayment.find(filter).sort('-paymentDate -createdAt').limit(6).lean(),
      AuditLog.find(filter).sort('-timestamp').limit(6).lean()
    ]);

    const formattedList = [];

    // 1. Map explicit Activity records
    rawActivities.forEach(act => {
      formattedList.push({
        id: `act-${act._id}`,
        type: act.entity ? act.entity.toLowerCase() : 'system',
        title: act.action === 'Added' 
          ? `New ${act.entity} registered` 
          : act.action === 'Logged In'
          ? `User sign-in event`
          : (act.action ? `${act.action} on ${act.entity}` : 'System action'),
        desc: act.details || `${act.user || 'User'} performed ${act.action}`,
        time: act.createdAt,
        timestamp: new Date(act.createdAt).getTime(),
        icon: act.action === 'Logged In' ? 'fa-right-to-bracket' : act.entity === 'Student' ? 'fa-user-plus' : 'fa-bell',
        iconBg: act.action === 'Logged In' ? 'bg-blue-100' : 'bg-purple-100',
        iconColor: act.action === 'Logged In' ? 'text-blue-600' : 'text-purple-600'
      });
    });

    // 2. Map real student admissions
    recentStudents.forEach(stu => {
      const courseInfo = stu.currentClass?.course 
        ? `${stu.currentClass.course} ${stu.currentClass.branch || ''}`.trim() 
        : (stu.college || 'Higher Education');
      formattedList.push({
        id: `stu-${stu._id}`,
        type: 'admission',
        title: 'New student admitted',
        desc: `${stu.name} (${courseInfo || stu.studentId})`,
        time: stu.createdAt,
        timestamp: new Date(stu.createdAt).getTime(),
        icon: 'fa-user-plus',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600'
      });
    });

    // 3. Map real fee payments
    recentPayments.forEach(pay => {
      formattedList.push({
        id: `fee-${pay._id}`,
        type: 'fee',
        title: 'Fee payment received',
        desc: `₹${Number(pay.amount).toLocaleString()} from ${pay.studentName || pay.studentId} (${pay.receiptNumber})`,
        time: pay.paymentDate || pay.createdAt,
        timestamp: new Date(pay.paymentDate || pay.createdAt).getTime(),
        icon: 'fa-indian-rupee-sign',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600'
      });
    });

    // 4. Map real security audit logins
    recentAudits.forEach(aud => {
      formattedList.push({
        id: `aud-${aud._id}`,
        type: 'security',
        title: aud.action === 'LOGIN' ? `${aud.actor?.role || 'User'} signed in` : `${aud.action} on ${aud.resource || 'System'}`,
        desc: aud.details || `${aud.actor?.username || 'User'} performed ${aud.action}`,
        time: aud.timestamp,
        timestamp: new Date(aud.timestamp).getTime(),
        icon: 'fa-shield-halved',
        iconBg: 'bg-indigo-100',
        iconColor: 'text-indigo-600'
      });
    });

    // Sort descending by actual timestamp
    formattedList.sort((a, b) => b.timestamp - a.timestamp);

    // Deduplicate by title+desc
    const seen = new Set();
    const finalActivities = [];
    for (const item of formattedList) {
      const key = `${item.title}-${item.desc}`;
      if (!seen.has(key)) {
        seen.add(key);
        finalActivities.push(item);
      }
      if (finalActivities.length >= 8) break;
    }

    res.status(200).json({ success: true, count: finalActivities.length, data: finalActivities });
  } catch (error) {
    console.error('getActivities error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
