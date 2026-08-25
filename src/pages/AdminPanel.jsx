import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, BookOpen, Shield, Trash2, Copy, BarChart2, Edit2, Check, X, Search, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useTests, useStudents, useCreateTest, useToggleTestActive, useTogglePlaced, useAdminStats, useCloneTest, useUpdateTest, useDeleteTest } from '../hooks/api';
import api from '../lib/api';

export default function AdminPanel() {
  const navigate = useNavigate();
  const { toast, confirm } = useToast();
  const [activeTab, setActiveTab] = useState('tests');
  
  // Test State
  const [showCreateTest, setShowCreateTest] = useState(false);
  const [editingTestId, setEditingTestId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [testForm, setTestForm] = useState({
    title: '', date: '', start_time: '', end_time: '', aptitude_time_limit: 30, core_time_limit: 30, active: true
  });

  // User State
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [userForm, setUserForm] = useState({ username: '', name: '', password: '' });
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const { data: stats } = useAdminStats();
  const { data: students = [], refetch: refetchStudents } = useStudents();
  const { data: tests = [], refetch: refetchTests } = useTests();
  
  const createTestMutation = useCreateTest();
  const toggleTestMutation = useToggleTestActive();
  const togglePlacedMutation = useTogglePlaced();
  const cloneTestMutation = useCloneTest();
  const updateTestMutation = useUpdateTest();
  const deleteTestMutation = useDeleteTest();

  // User Actions
  const handleToggleAdmin = async (username) => {
    try {
      await togglePlacedMutation.mutateAsync(username);
      refetchStudents();
    } catch (err) {
      toast.error('Failed to toggle admin status');
    }
  };

  const handleResetPassword = (username) => {
    setResetPasswordUser(username);
    setNewPassword('');
    setShowNewPassword(false);
  };

  const handleConfirmResetPassword = async () => {
    if (!newPassword) return;
    try {
      await api.post(`/admin/student/${resetPasswordUser}/reset-password/`, { password: newPassword });
      toast.success('Password reset successfully!');
      setResetPasswordUser(null);
      setNewPassword('');
    } catch (err) {
      toast.error('Failed to reset password');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register/', userForm);
      toast.success('User created successfully!');
      setShowCreateUser(false);
      setUserForm({ username: '', name: '', password: '' });
      refetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.username?.[0] || 'Failed to create user');
    }
  };

  // Test Actions
  const handleCreateTest = async (e) => {
    e.preventDefault();
    try {
      await createTestMutation.mutateAsync(testForm);
      setShowCreateTest(false);
      toast.success('Test created successfully!');
    } catch (err) {
      toast.error('Failed to create test');
    }
  };

  const handleCloneTest = async (testId) => {
    try {
      await cloneTestMutation.mutateAsync(testId);
      toast.success('Test cloned successfully');
    } catch (err) {
      toast.error('Failed to clone test');
    }
  };

  const handleDeleteTest = async (testId) => {
    const isConfirmed = await confirm("Are you sure you want to delete this test? All associated questions and logs will be permanently deleted.", "Delete Test");
    if (isConfirmed) {
      try {
        await deleteTestMutation.mutateAsync(testId);
        toast.success('Test deleted successfully');
      } catch (err) {
        toast.error('Failed to delete test');
      }
    }
  };

  const startEditing = (test) => {
    setEditingTestId(test.test_id);
    setEditForm({ ...test });
  };

  const saveEdit = async () => {
    try {
      await updateTestMutation.mutateAsync({ testId: editingTestId, ...editForm });
      setEditingTestId(null);
      toast.success('Test updated');
    } catch (err) {
      toast.error('Failed to update test');
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  return (
    <div className="animate-fade-in">
      {/* OVERVIEW STATS */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="glass-card" style={{ padding: '16px' }}>
            <div className="text-secondary" style={{ fontSize: '0.85rem' }}>Total Tests</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.total_tests}</div>
          </div>
          <div className="glass-card" style={{ padding: '16px' }}>
            <div className="text-secondary" style={{ fontSize: '0.85rem' }}>Total Questions</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.total_questions}</div>
          </div>
          <div className="glass-card" style={{ padding: '16px' }}>
            <div className="text-secondary" style={{ fontSize: '0.85rem' }}>Total Students</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.total_students}</div>
          </div>
          <div className="glass-card" style={{ padding: '16px' }}>
            <div className="text-secondary" style={{ fontSize: '0.85rem' }}>Global Pass Rate</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.pass_rate}%</div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
        <button className={activeTab === 'tests' ? 'primary' : 'secondary'} onClick={() => setActiveTab('tests')}>
          <BookOpen size={18} /> Manage Tests
        </button>
        <button className={activeTab === 'students' ? 'primary' : 'secondary'} onClick={() => setActiveTab('students')}>
          <Users size={18} /> Manage Users
        </button>
      </div>

      {activeTab === 'tests' && (
        <div className="animate-fade-in delay-1">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2>Tests Management</h2>
            <button className="primary" onClick={() => setShowCreateTest(!showCreateTest)}>
              <Plus size={18} /> {showCreateTest ? 'Cancel' : 'Create New Test'}
            </button>
          </div>

          {showCreateTest && (
            <div className="glass-card" style={{ marginBottom: '24px' }}>
              <h3>Create Test</h3>
              <form onSubmit={handleCreateTest} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Test Title</label>
                  <input type="text" value={testForm.title} onChange={e => setTestForm({...testForm, title: e.target.value})} required />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Test Date</label>
                  <input type="date" value={testForm.date} onChange={e => setTestForm({...testForm, date: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Start Time</label>
                  <input type="time" value={testForm.start_time} onChange={e => setTestForm({...testForm, start_time: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input type="time" value={testForm.end_time} onChange={e => setTestForm({...testForm, end_time: e.target.value})} />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={testForm.active} onChange={e => setTestForm({...testForm, active: e.target.checked})} style={{ width: 'auto' }} />
                  <label style={{ margin: 0 }}>Active</label>
                </div>
                <div className="form-group">
                  <label>Aptitude Time Limit (mins)</label>
                  <input type="number" value={testForm.aptitude_time_limit} onChange={e => setTestForm({...testForm, aptitude_time_limit: parseInt(e.target.value) || 0})} required />
                </div>
                <div className="form-group">
                  <label>Core Time Limit (mins)</label>
                  <input type="number" value={testForm.core_time_limit} onChange={e => setTestForm({...testForm, core_time_limit: parseInt(e.target.value) || 0})} required />
                </div>
                <button type="submit" className="primary" style={{ gridColumn: '1 / -1' }}>Create Test</button>
              </form>
            </div>
          )}

          <div className="glass" style={{ overflow: 'x-auto' }}>
            <table style={{ minWidth: '800px' }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title & Schedule</th>
                  <th>Limits (m)</th>
                  <th>Stats</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tests.map(test => {
                  const isEditing = editingTestId === test.test_id;
                  
                  return (
                  <tr key={test.test_id}>
                    <td>{test.test_id}</td>
                    <td>
                      {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} style={{ padding: '4px' }} />
                          <input type="date" value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})} style={{ padding: '4px' }} />
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <input type="time" value={editForm.start_time || ''} onChange={e => setEditForm({...editForm, start_time: e.target.value})} style={{ padding: '4px', width: '100px' }} />
                            <input type="time" value={editForm.end_time || ''} onChange={e => setEditForm({...editForm, end_time: e.target.value})} style={{ padding: '4px', width: '100px' }} />
                          </div>
                        </div>
                      ) : (
                        <>
                          <strong>{test.title}</strong><br/>
                          <small className="text-secondary">{test.date} | {test.start_time || 'Any'} - {test.end_time || 'Any'}</small>
                        </>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <input type="number" value={editForm.aptitude_time_limit} onChange={e => setEditForm({...editForm, aptitude_time_limit: e.target.value})} style={{ width: '50px', padding: '4px' }} title="Aptitude" />
                          <input type="number" value={editForm.core_time_limit} onChange={e => setEditForm({...editForm, core_time_limit: e.target.value})} style={{ width: '50px', padding: '4px' }} title="Core" />
                        </div>
                      ) : (
                        <small className="text-secondary">A: {test.aptitude_time_limit} | C: {test.core_time_limit}</small>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                        <Users size={14} /> {test.attempt_count} attempts
                      </div>
                    </td>
                    <td>
                      <span 
                        className={`badge ${test.active ? 'user' : 'inactive'}`}
                        onClick={() => toggleTestMutation.mutate(test.test_id)}
                        style={{ cursor: 'pointer' }}
                        title="Toggle active status"
                      >
                        {test.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={saveEdit} className="primary" style={{ padding: '6px' }} title="Save"><Check size={16} /></button>
                          <button onClick={() => setEditingTestId(null)} className="secondary" style={{ padding: '6px' }} title="Cancel"><X size={16} /></button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          <button onClick={() => startEditing(test)} className="secondary" style={{ padding: '6px' }} title="Edit Test"><Edit2 size={16} /></button>
                          <button onClick={() => navigate(`/admin/test/${test.test_id}/questions`)} className="secondary" style={{ padding: '6px' }} title="Manage Questions"><BookOpen size={16} /></button>
                          <button onClick={() => navigate(`/admin/test/${test.test_id}/analytics`)} className="secondary" style={{ padding: '6px' }} title="Analytics"><BarChart2 size={16} /></button>
                          <button onClick={() => handleCloneTest(test.test_id)} className="secondary" style={{ padding: '6px' }} title="Clone Test"><Copy size={16} /></button>
                          <button onClick={() => handleDeleteTest(test.test_id)} className="danger" style={{ padding: '6px', background: 'transparent', color: 'var(--error)' }} title="Delete Test"><Trash2 size={16} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="animate-fade-in delay-1">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2>User Management</h2>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '300px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '40px', width: '100%' }}
                />
              </div>
              <button className="primary" onClick={() => setShowCreateUser(!showCreateUser)}>
                <Plus size={18} /> {showCreateUser ? 'Cancel' : 'Add User'}
              </button>
            </div>
          </div>
          
          {showCreateUser && (
            <div className="glass-card" style={{ marginBottom: '24px' }}>
              <h3>Create User</h3>
              <form onSubmit={handleCreateUser} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Name</label>
                  <input type="text" required placeholder="e.g. Dhivyesh" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Username</label>
                  <input type="text" required placeholder="e.g. 23z112" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Password</label>
                  <input type="password" required value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} />
                </div>
                <button type="submit" className="primary" style={{ marginBottom: '4px' }}>Create</button>
              </form>
            </div>
          )}

          <div className="glass" style={{ overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student.username}>
                    <td>{student.name}</td>
                    <td>{student.username}</td>
                    <td>
                      {student.placed || student.is_admin ? (
                        <span className="badge admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Shield size={12} /> Admin</span>
                      ) : (
                        <span className="badge user">Student</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => navigate(`/admin/student/${student.username}/analytics`)} className="secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                          <BarChart2 size={14} style={{ marginRight: '4px', display: 'inline' }} /> Analytics
                        </button>
                        <button onClick={() => handleResetPassword(student.username)} className="secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                          <KeyRound size={14} style={{ marginRight: '4px', display: 'inline' }} /> Reset Password
                        </button>
                        <button 
                          className={student.placed || student.is_admin ? 'danger' : 'secondary'} 
                          onClick={() => handleToggleAdmin(student.username)}
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        >
                          {student.placed || student.is_admin ? 'Revoke Admin' : 'Make Admin'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>No users found matching "{searchQuery}"</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {resetPasswordUser && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div className="glass-card" style={{ maxWidth: '420px', width: '90%' }}>
            <h3 style={{ marginTop: 0 }}>Reset Password</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Enter new password for <strong>{resetPasswordUser}</strong></p>
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="New password"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleConfirmResetPassword()}
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="secondary" onClick={() => setResetPasswordUser(null)} style={{ padding: '10px 20px' }}>
                Cancel
              </button>
              <button className="primary" onClick={handleConfirmResetPassword} disabled={!newPassword} style={{ padding: '10px 20px' }}>
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
