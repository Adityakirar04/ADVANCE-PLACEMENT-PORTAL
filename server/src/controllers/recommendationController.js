const Job = require('../models/Job');
const StudentProfile = require('../models/StudentProfile');

function calculateMatchScore(studentSkills, jobSkills, studentCgpa, jobCgpa) {
  if (!studentSkills || !jobSkills || jobSkills.length === 0) return 0;
  const matched = studentSkills.filter(s => jobSkills.some(j => j.toLowerCase() === s.toLowerCase()));
  const skillScore = (matched.length / jobSkills.length) * 100;
  const cgpaScore = studentCgpa >= jobCgpa ? 100 : (studentCgpa / jobCgpa) * 100;
  return Math.round((skillScore * 0.6) + (cgpaScore * 0.4));
}

exports.getRecommendedJobs = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id });
    const jobs = await Job.find({ isApproved: true, status: 'active' });

    const recommendations = jobs.map(job => {
      const score = calculateMatchScore(
        profile?.skills || [],
        job.skillsRequired || [],
        profile?.cgpa || 0,
        job.cgpaRequired || 0
      );
      return { ...job.toObject(), matchScore: score };
    });

    recommendations.sort((a, b) => b.matchScore - a.matchScore);
    res.status(200).json({ success: true, jobs: recommendations.slice(0, 10) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPlacementPrediction = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id });
    const cgpaWeight = 0.25;
    const skillsWeight = 0.30;
    const resumeWeight = 0.15;
    const educationWeight = 0.10;
    const socialWeight = 0.10;
    const profileWeight = 0.10;

    const cgpaScore = Math.min((profile?.cgpa || 0) / 10 * 100, 100);
    const skillsScore = Math.min((profile?.skills?.length || 0) * 10, 100);
    const resumeScore = profile?.resumeUrl ? 100 : 0;
    const educationScore = profile?.education ? 100 : 50;
    const socialScore = (profile?.github && profile?.linkedin) ? 100 : (profile?.github || profile?.linkedin) ? 50 : 0;
    const profileScore = profile?.about ? 100 : 50;

    const probability = Math.round(
      (cgpaScore * cgpaWeight) +
      (skillsScore * skillsWeight) +
      (resumeScore * resumeWeight) +
      (educationScore * educationWeight) +
      (socialScore * socialWeight) +
      (profileScore * profileWeight)
    );

    let grade = 'Poor';
    if (probability >= 80) grade = 'Excellent';
    else if (probability >= 60) grade = 'Good';
    else if (probability >= 40) grade = 'Average';

    const missingSkills = [];
    if (!profile?.skills?.includes('JavaScript')) missingSkills.push('JavaScript');
    if (!profile?.skills?.includes('Python')) missingSkills.push('Python');
    if (!profile?.skills?.includes('React')) missingSkills.push('React');
    if (!profile?.skills?.includes('Node.js')) missingSkills.push('Node.js');

    res.status(200).json({
      success: true,
      prediction: {
        probability,
        grade,
        cgpaScore: Math.round(cgpaScore),
        skillsScore,
        resumeScore,
        educationScore,
        socialScore,
        profileScore,
        missingSkills: missingSkills.slice(0, 3)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments({ isApproved: true });
    res.status(200).json({ success: true, stats: { totalJobs } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};