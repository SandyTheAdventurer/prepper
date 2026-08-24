import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, ChevronLeft } from 'lucide-react';
import { useTestResult } from '../hooks/api';

export default function TestResult() {
  const { testId } = useParams();
  const { data: result, isLoading: loading, error } = useTestResult(testId);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading results...</div>;
  }

  if (error || !result) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>{error?.message || 'Failed to load test result. You may not have taken this test yet.'}</h2>
        <Link to="/dashboard" className="primary button-link" style={{ display: 'inline-block', marginTop: '20px' }}>Back to Dashboard</Link>
      </div>
    );
  }

  const { title, scores, details } = result;
  
  // Calculate total score percentage manually from scores object
  const totalCorrect = scores.aptitude.correct + scores.core.correct;
  const totalQuestions = scores.aptitude.total + scores.core.total;
  const overallPercentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const wrongAnswers = details.filter(d => !d.is_correct);

  return (
    <div className="animate-fade-in delay-1" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link to="/dashboard" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={20} /> Dashboard
        </Link>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Result: {title}</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Overall Score</h3>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)' }}>
            {overallPercentage}%
          </div>
          <p style={{ margin: 0 }}>{totalCorrect} / {totalQuestions} correct</p>
        </div>
        
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Percentile</h3>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: '#f59e0b' }}>
            {result.percentile}%
          </div>
          <p style={{ margin: 0 }}>Better than {result.percentile}% of students</p>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ marginBottom: '16px' }}>Section Breakdown</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Aptitude</span>
            <strong>{scores.aptitude.correct} / {scores.aptitude.total} ({scores.aptitude.score}%)</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Core</span>
            <strong>{scores.core.correct} / {scores.core.total} ({scores.core.score}%)</strong>
          </div>
        </div>
      </div>

      <h2>Review Wrong Answers</h2>
      {wrongAnswers.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: '#34d399' }}>
          <CheckCircle size={48} style={{ margin: '0 auto 16px auto', display: 'block' }} />
          <h3>Perfect Score!</h3>
          <p>You didn't get any questions wrong.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {wrongAnswers.map((log, index) => {
            const q = log.mcq;
            return (
              <div key={q.id} className="glass-card" style={{ borderLeft: '4px solid #ef4444' }}>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    {q.section}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Q{q.q_number}</span>
                </div>
                
                <h4 style={{ fontSize: '1.2rem', marginBottom: '20px', lineHeight: 1.5 }}>
                  {q.q_text}
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginBottom: '20px' }}>
                  {[1, 2, 3, 4].map(optNum => {
                    const isSelected = log.selected_option === optNum;
                    const isCorrect = q.correct_option === optNum;
                    
                    let bg = 'rgba(15, 23, 42, 0.5)';
                    let border = '1px solid var(--border)';
                    let icon = null;

                    if (isCorrect) {
                      bg = 'rgba(16, 185, 129, 0.1)';
                      border = '1px solid #34d399';
                      icon = <CheckCircle size={18} color="#34d399" />;
                    } else if (isSelected) {
                      bg = 'rgba(239, 68, 68, 0.1)';
                      border = '1px solid #f87171';
                      icon = <XCircle size={18} color="#f87171" />;
                    }

                    return (
                      <div key={optNum} style={{
                        padding: '12px 16px', borderRadius: '8px',
                        background: bg, border: border,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                      }}>
                        <span>{q[`op${optNum}`]}</span>
                        {icon && <div>{icon}</div>}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div style={{ 
                    padding: '16px', borderRadius: '8px', 
                    background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)',
                    display: 'flex', flexDirection: 'column', gap: '8px'
                  }}>
                    <strong style={{ color: '#818cf8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Explanation</strong>
                    <p style={{ margin: 0, lineHeight: 1.5, color: 'var(--text-main)' }}>{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
