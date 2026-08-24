import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTestAnalytics } from '../hooks/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function TestAnalytics() {
  const { testId } = useParams();
  const { data: analytics, isLoading } = useTestAnalytics(testId);

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading analytics...</div>;
  if (!analytics) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Test not found</div>;

  const chartData = Object.entries(analytics.score_distribution).map(([range, count]) => ({ range, count }));

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link to="/admin" className="secondary button-link" style={{ padding: '8px' }}><ArrowLeft size={18} /></Link>
        <h1 style={{ margin: 0 }}>Analytics: {analytics.title}</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '16px' }}>
          <h4>Total Attempts</h4>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{analytics.total_attempts}</div>
        </div>
        <div className="glass-card" style={{ padding: '16px' }}>
          <h4>Avg Score</h4>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{analytics.avg_score}%</div>
        </div>
        <div className="glass-card" style={{ padding: '16px' }}>
          <h4>Pass Rate ({'>='}50%)</h4>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {analytics.total_attempts ? Math.round((analytics.pass_count / analytics.total_attempts) * 100) : 0}%
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ height: '300px', marginBottom: '24px' }}>
        <h4>Score Distribution</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="range" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h4>Leaderboard</h4>
      <div className="glass" style={{ overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Student</th>
              <th>Score</th>
              <th>Aptitude</th>
              <th>Core</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {analytics.leaderboard.map(entry => (
              <tr key={entry.student_email}>
                <td>{entry.rank}</td>
                <td>{entry.student_name} <br/><small className="text-secondary">{entry.student_email}</small></td>
                <td><strong>{entry.score_percent}%</strong> ({entry.score}/{entry.total})</td>
                <td>{entry.aptitude_score}%</td>
                <td>{entry.core_score}%</td>
                <td>{new Date(entry.completed_at).toLocaleString()}</td>
              </tr>
            ))}
            {analytics.leaderboard.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>No attempts yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
