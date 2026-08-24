import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, CheckCircle } from 'lucide-react';
import { useTests, useTestHistory } from '../hooks/api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: tests = [], isLoading: testsLoading } = useTests();
  const { data: history = [], isLoading: historyLoading } = useTestHistory();
  const loading = testsLoading || historyLoading;

  const handleStartTest = (testId) => {
    navigate(`/test/${testId}`);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading dashboard...</div>;
  }

  return (
    <div className="animate-fade-in delay-1">
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Welcome, {user.name}</h1>
          <p>Ready to challenge yourself today?</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <h2>Available Tests</h2>
        </div>
        
        {tests.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
            <p>No tests available at the moment. Check back later!</p>
          </div>
        ) : (
          tests.map((test) => {
            const hasTaken = history.some(h => h.test_id === test.test_id);
            const isAvailable = test.active && !hasTaken;
            
            return (
              <div key={test.test_id} className="glass-card" style={{ 
                display: 'flex', flexDirection: 'column', 
                opacity: hasTaken ? 0.6 : 1, 
                filter: hasTaken ? 'grayscale(80%)' : 'none',
                transition: 'all 0.3s'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{test.title}</h3>
                    <span className={`badge ${test.active ? 'user' : 'inactive'}`}>
                      {test.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', color: 'var(--text-muted)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={16} />
                      {test.aptitude_time_limit + test.core_time_limit} mins
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={16} />
                      {test.date} ({test.start_time || 'Any'} - {test.end_time || 'Any'})
                    </div>
                  </div>
                </div>
                <button 
                  className={hasTaken ? "secondary" : "primary"} 
                  onClick={() => hasTaken ? navigate(`/result/${test.test_id}`) : handleStartTest(test.test_id)}
                  disabled={!test.active && !hasTaken}
                  style={{ width: '100%' }}
                >
                  <Play size={18} />
                  {hasTaken ? 'View Result' : 'Start Test'}
                </button>
              </div>
            );
          })
        )}

        <div style={{ gridColumn: '1 / -1', marginTop: '30px' }}>
          <h2>Test History</h2>
          {history.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>You haven't taken any tests yet.</p>
          ) : (
            <div className="glass" style={{ overflow: 'hidden' }}>
              <table>
                <thead>
                  <tr>
                    <th>Test Title</th>
                    <th>Date Taken</th>
                    <th>Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record, index) => (
                    <tr key={index}>
                      <td>{record.test_title || `Test #${record.test_id}`}</td>
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      <td>{record.score} / {record.total}</td>
                      <td>
                        <button 
                          className="secondary" 
                          onClick={() => navigate(`/result/${record.test_id}`)}
                          style={{ padding: '4px 12px', fontSize: '0.85rem' }}
                        >
                          View Results
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
