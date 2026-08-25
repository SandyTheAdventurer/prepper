import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { useToast } from '../components/Toast';
import api from '../lib/api';

export default function TestEnvironment() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { toast, confirm } = useToast();
  const [questions, setQuestions] = useState([]);
  const [currentSection, setCurrentSection] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Use refs to avoid stale closures in the timer
  const answersRef = useRef(answers);
  const submittingRef = useRef(submitting);
  const currentSectionRef = useRef(currentSection);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { submittingRef.current = submitting; }, [submitting]);
  useEffect(() => { currentSectionRef.current = currentSection; }, [currentSection]);

  const doSubmit = useCallback(async () => {
    if (submittingRef.current) return;
    setSubmitting(true);
    submittingRef.current = true;
    try {
      await api.post('/tests/submit/', { test_id: testId, answers: answersRef.current });
      toast.success('Test submitted successfully!');
      navigate(`/result/${testId}`, { replace: true });
    } catch (err) {
      toast.error('Error submitting test');
      setSubmitting(false);
      submittingRef.current = false;
    }
  }, [testId, navigate, toast]);

  const doSubmitSection = useCallback(async () => {
    if (submittingRef.current) return;
    setSubmitting(true);
    submittingRef.current = true;
    try {
      await api.post('/tests/submit-section/', { test_id: testId });
      toast.success('Section completed! Moving to next section.');
      // Re-fetch the test to get the next section instead of full page reload
      const res = await api.post('/tests/start/', { test_id: testId });
      setCurrentSection(res.data.current_section);
      setQuestions(res.data.questions || []);
      setTimeLeft((res.data.time_limit || 0) * 60);
      setCurrentIdx(0);
      setAnswers(res.data.previous_answers || {});
      setSubmitting(false);
      submittingRef.current = false;
    } catch (err) {
      toast.error('Error submitting section');
      setSubmitting(false);
      submittingRef.current = false;
    }
  }, [testId, toast]);

  useEffect(() => {
    const startTest = async () => {
      try {
        const res = await api.post('/tests/start/', { test_id: testId });
        setCurrentSection(res.data.current_section);
        setQuestions(res.data.questions || []);
        setTimeLeft((res.data.time_limit || 0) * 60);
        setCurrentIdx(0);
        if (res.data.previous_answers) {
          setAnswers(res.data.previous_answers);
        } else {
          setAnswers({});
        }
      } catch (err) {
        const errorMsg = err.response?.data?.detail || 'Failed to start test or you already took it.';
        toast.error(errorMsg);
        navigate('/dashboard', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    startTest();
  }, [testId, navigate, toast]);

  // Timer: runs once after loading, no timeLeft in deps
  useEffect(() => {
    if (loading) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (currentSectionRef.current === "APTITUDE") {
            doSubmitSection();
          } else {
            doSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, doSubmit, currentSection]);

  const handleSelectOption = async (qId, optionNum) => {
    setAnswers(prev => ({ ...prev, [qId]: optionNum }));
    try {
      await api.post('/tests/submit-answer/', {
        mcq_id: qId,
        selected_option: optionNum
      });
    } catch (err) {
      console.error('Failed to save answer instantly', err);
      // We don't want to alert the user aggressively since they can still submit at the end, 
      // but maybe a small toast or just ignore. 
    }
  };

  const handleSubmitTest = async () => {
    if (currentSection === "APTITUDE") {
      const isConfirmed = await confirm('Are you sure you want to finish the Aptitude section and proceed to Core? You cannot go back.', 'Submit Section');
      if (!isConfirmed) return;
      doSubmitSection();
    } else {
      const isConfirmed = await confirm('Are you sure you want to submit this test? You cannot retake it.', 'Submit Test');
      if (!isConfirmed) return;
      doSubmit();
    }
  };

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading test environment...</div>;
  }

  if (!questions || questions.length === 0) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2>No questions found for this test.</h2>
        <button className="primary" onClick={() => navigate('/dashboard')} style={{ marginTop: '20px' }}>Go Back</button>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIdx];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>
      {/* Test Header */}
      <div style={{ 
        padding: '16px 24px', 
        background: 'rgba(15, 23, 42, 0.9)', 
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <h2 style={{ margin: 0 }}>Test #{testId}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div className={timeLeft < 60 ? 'timer-urgent' : ''} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(255, 255, 255, 0.05)', 
            padding: '8px 16px', 
            borderRadius: '999px',
            color: timeLeft < 60 ? '#ef4444' : '#818cf8',
            fontWeight: 700,
            transition: 'all 0.3s'
          }}>
            <Clock size={18} />
            {formatTime(timeLeft)}
          </div>
          {currentSection === "APTITUDE" ? (
            <button className="primary" onClick={handleSubmitTest} disabled={submitting} style={{ background: 'var(--primary)', borderColor: 'var(--primary)' }}>
              Next Section <ArrowRight size={18} style={{ marginLeft: '4px' }} />
            </button>
          ) : (
            <button className="primary" onClick={handleSubmitTest} disabled={submitting} style={{ background: '#10b981', borderColor: '#10b981' }}>
              <CheckCircle size={18} /> Finish Test
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, maxWidth: '100%', margin: '0 auto', width: '100%', padding: '24px', gap: '24px' }}>
        
        {/* Navigation Sidebar (Moved to Left) */}
        <div className="glass-card" style={{ width: '300px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '16px' }}>Question Navigator</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = idx === currentIdx;
              
              let bg = 'rgba(15, 23, 42, 0.5)';
              let border = '1px solid var(--border)';
              let color = 'var(--text-main)';

              if (isCurrent) {
                border = '2px solid var(--primary)';
              } else if (isAnswered) {
                bg = 'rgba(16, 185, 129, 0.2)';
                border = '1px solid rgba(16, 185, 129, 0.5)';
                color = '#34d399';
              }

              return (
                <div 
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: bg,
                    border: border,
                    color: color,
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                >
                  {idx + 1}
                </div>
              );
            })}
          </div>
          
          <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.5)' }}></div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Answered</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border)' }}></div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Not Answered</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'transparent', border: '2px solid var(--primary)' }}></div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Current Question</span>
            </div>
          </div>
        </div>

        {/* Question Panel */}
          <div className="glass-card" style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span className="badge user">{currentSection} SECTION</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-muted)' }}>Question {currentIdx + 1} of {questions.length}</span>
            </div>
            
            <div 
              style={{ fontSize: '1.5rem', marginBottom: '40px', lineHeight: '1.6' }}
              dangerouslySetInnerHTML={{ __html: currentQuestion.q_text }}
            />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3, 4].map(optNum => (
              <div 
                key={optNum}
                onClick={() => handleSelectOption(currentQuestion.id, optNum)}
                style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: answers[currentQuestion.id] === optNum ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: answers[currentQuestion.id] === optNum ? 'rgba(99, 102, 241, 0.1)' : 'rgba(15, 23, 42, 0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  border: '1px solid',
                  borderColor: answers[currentQuestion.id] === optNum ? 'var(--primary)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {answers[currentQuestion.id] === optNum && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)' }} />}
                </div>
                <span style={{ fontSize: '1.1rem' }}>{currentQuestion[`op${optNum}`]}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '32px', display: 'flex', justifyContent: 'space-between' }}>
            <button 
              className="secondary" 
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => prev - 1)}
            >
              Previous
            </button>
            
            {currentIdx === questions.length - 1 ? (
              <button 
                className="primary" 
                onClick={handleSubmitTest}
              >
                {currentSection === "APTITUDE" ? 'Next Section' : 'Finish Test'}
              </button>
            ) : (
              <button 
                className="primary" 
                onClick={() => setCurrentIdx(prev => prev + 1)}
              >
                Next
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
