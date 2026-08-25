import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Award, BookOpen, Target, TrendingUp } from 'lucide-react';
import { useStudentAnalytics } from '../hooks/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function StudentAnalytics() {
  const { username } = useParams();
  const { data: analytics, isLoading } = useStudentAnalytics(username);

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading analytics...</div>;
  if (!analytics) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Student not found</div>;

  const historyData = [...analytics.test_history].reverse().map(t => ({
    name: `Test ${t.test_id}`,
    score: t.score_percent,
    aptitude: t.aptitude_score,
    core: t.core_score
  }));

  const categoryData = analytics.category_performance.map(c => ({
    subject: c.category,
    accuracy: c.accuracy
  }));

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link to="/admin" className="secondary button-link" style={{ padding: '8px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><ArrowLeft size={18} /> Back</Link>
        <div>
          <h1 style={{ margin: 0 }}>Analytics: {analytics.name}</h1>
          <div className="text-secondary">{analytics.username}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '50%' }}><BookOpen size={24} /></div>
          <div>
            <div className="text-secondary" style={{ fontSize: '0.85rem' }}>Tests Taken</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{analytics.total_tests}</div>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '50%' }}><Award size={24} /></div>
          <div>
            <div className="text-secondary" style={{ fontSize: '0.85rem' }}>Average Score</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{analytics.avg_score}%</div>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '50%' }}><TrendingUp size={24} /></div>
          <div>
            <div className="text-secondary" style={{ fontSize: '0.85rem' }}>Aptitude Avg</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{analytics.aptitude_avg}%</div>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '50%' }}><Target size={24} /></div>
          <div>
            <div className="text-secondary" style={{ fontSize: '0.85rem' }}>Core Avg</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{analytics.core_avg}%</div>
          </div>
        </div>
      </div>

      {analytics.total_tests > 0 ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div className="glass-card" style={{ height: '350px' }}>
              <h4>Performance Trend</h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} name="Overall %" />
                  <Line type="monotone" dataKey="aptitude" stroke="#10b981" strokeWidth={2} name="Aptitude %" />
                  <Line type="monotone" dataKey="core" stroke="#f59e0b" strokeWidth={2} name="Core %" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card" style={{ height: '350px' }}>
              <h4>Category Accuracy</h4>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis type="number" domain={[0, 100]} stroke="var(--text-muted)" />
                    <YAxis dataKey="subject" type="category" stroke="var(--text-muted)" width={100} />
                    <Tooltip contentStyle={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }} />
                    <Bar dataKey="accuracy" fill="var(--primary)" radius={[0, 4, 4, 0]} name="Accuracy %" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  No category data available
                </div>
              )}
            </div>
          </div>

          <h4>Test History</h4>
          <div className="glass" style={{ overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Date Completed</th>
                  <th>Score</th>
                  <th>Aptitude</th>
                  <th>Core</th>
                  <th>Percentile</th>
                </tr>
              </thead>
              <tbody>
                {analytics.test_history.map(t => (
                  <tr key={t.test_id}>
                    <td><strong>{t.test_title}</strong></td>
                    <td>{new Date(t.completed_at).toLocaleString()}</td>
                    <td><strong>{t.score_percent}%</strong> ({t.score}/{t.total})</td>
                    <td>{t.aptitude_score}%</td>
                    <td>{t.core_score}%</td>
                    <td>{t.percentile.toFixed(1)}th</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="glass-card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          <BookOpen size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
          <h3>No Tests Taken</h3>
          <p>This student hasn't completed any tests yet.</p>
        </div>
      )}
    </div>
  );
}
