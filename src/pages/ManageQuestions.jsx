import { useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Edit, Trash, Save, X, Plus, Upload, Download, GripVertical, ImagePlus } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useToast } from '../components/Toast';
import { useTestQuestions, useCategories, useAddQuestion, useEditQuestion, useDeleteQuestion, useCreateCategory, useImportQuestions, downloadQuestionTemplate, useReorderQuestions } from '../hooks/api';
import api from '../lib/api';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Rich text area with image upload support
function RichTextArea({ value, onChange, rows = 3, placeholder }) {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/admin/upload-image/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = res.data.url;
      const imgTag = `<img src="${url}" style="max-width:100%;margin:8px 0;" />`;

      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const newValue = value.slice(0, start) + imgTag + value.slice(start);
      onChange(newValue);
    } catch (err) {
      alert('Image upload failed');
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [value, onChange]);

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
        <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageUpload} />
        <button type="button" onClick={() => fileInputRef.current?.click()} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 10px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
          <ImagePlus size={14} /> Add Image
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
      />
    </div>
  );
}

function SortableQuestionItem({ q, categories, startEdit, handleDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: q.id });
  const style = { transform: CSS.Transform.toString(transform), transition, marginBottom: '12px' };
  
  return (
    <div ref={setNodeRef} style={style} className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div {...attributes} {...listeners} style={{ cursor: 'grab', marginRight: '8px', color: 'var(--text-muted)' }}>
            <GripVertical size={16} />
          </div>
          <span className="badge user" style={{ marginRight: '8px' }}>{q.section}</span>
          {q.category_id && <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>{categories.find(c => c.id === q.category_id)?.name || 'Unknown'}</span>}
        </div>
        <div>
          <button className="secondary" onClick={() => startEdit(q)} style={{ padding: '6px' }} title="Edit"><Edit size={16} /></button>
          <button className="danger" onClick={() => handleDelete(q.id)} style={{ padding: '6px' }} title="Delete"><Trash size={16} /></button>
        </div>
      </div>
      <div style={{ marginBottom: '12px', fontWeight: 600, fontSize: '1.1rem' }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.q_number + ". " + q.q_text) }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        <div style={q.correct_option === 1 ? { color: '#10b981', fontWeight: 600 } : {}}>A) {q.op1}</div>
        <div style={q.correct_option === 2 ? { color: '#10b981', fontWeight: 600 } : {}}>B) {q.op2}</div>
        <div style={q.correct_option === 3 ? { color: '#10b981', fontWeight: 600 } : {}}>C) {q.op3}</div>
        <div style={q.correct_option === 4 ? { color: '#10b981', fontWeight: 600 } : {}}>D) {q.op4}</div>
      </div>
    </div>
  );
}

export default function ManageQuestions() {
  const { testId } = useParams();
  const { toast, confirm } = useToast();
  const [form, setForm] = useState({
    section: 'APTITUDE', q_number: '', q_text: '',
    op1: '', op2: '', op3: '', op4: '', correct_option: 1, explanation: ''
  });
  
  const [generateForm, setGenerateForm] = useState({ topic: '', number: 5, difficulty: 'Medium' });
  const [generatedQuestions, setGeneratedQuestions] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const fileInputRef = useRef(null);

  const { data: questions = [] } = useTestQuestions(testId);
  const { data: categories = [] } = useCategories();
  const addQuestionMutation = useAddQuestion(testId);
  const editQuestionMutation = useEditQuestion(testId);
  const deleteQuestionMutation = useDeleteQuestion(testId);
  const createCategoryMutation = useCreateCategory();
  const importQuestionsMutation = useImportQuestions(testId);
  const reorderQuestionsMutation = useReorderQuestions(testId);

  const handleCreateCategory = async () => {
    const name = window.prompt('Enter new category name:');
    if (!name) return;
    try {
      await createCategoryMutation.mutateAsync(name);
      toast.success('Category created!');
    } catch (err) {
      toast.error('Failed to create category');
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      await addQuestionMutation.mutateAsync(form);
      toast.success('Question added successfully!');
      setForm({...form, q_text: '', op1: '', op2: '', op3: '', op4: '', explanation: ''});
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add question');
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = questions.findIndex(q => q.id === active.id);
    const newIndex = questions.findIndex(q => q.id === over.id);
    
    const newQuestions = [...questions];
    const [removed] = newQuestions.splice(oldIndex, 1);
    newQuestions.splice(newIndex, 0, removed);
    
    const newIds = newQuestions.map(q => q.id);
    await reorderQuestionsMutation.mutateAsync(newIds);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoadingAI(true);
    setGeneratedQuestions([]);
    
    let generatedCount = 0;
    const targetCount = parseInt(generateForm.number);
    let currentQuestions = [];

    for (let i = 0; i < targetCount; i++) {
      try {
        const existingTexts = [ ...currentQuestions.map(q => q.q_text) ];
        const res = await api.post(`/tests/${testId}/generate-questions/`, {
          ...generateForm,
          section: form.section,
          count: 1,
          existing_texts: existingTexts
        });
        
        if (res.data.questions && res.data.questions.length > 0) {
          const newQ = res.data.questions[0];
          currentQuestions = [...currentQuestions, newQ];
          setGeneratedQuestions(currentQuestions);
          generatedCount++;
        }
      } catch (err) {
        if (err.response?.status >= 500) break;
      }
    }
    
    setLoadingAI(false);
    if (generatedCount === 0) {
      toast.error('Failed to generate any questions. Ensure LLM is running.');
    } else {
      toast.success(`Generated ${generatedCount} question(s) successfully!`);
    }
  };

  const handleSaveGenerated = async () => {
    try {
      const qs = generatedQuestions.map(q => ({
        ...q, 
        section: form.section,
        category_id: generateForm.category_id || null
      }));
      await api.post(`/tests/${testId}/save-generated-questions/`, {
        questions: qs
      });
      toast.success('Saved generated questions successfully!');
      setGeneratedQuestions(null);
      addQuestionMutation.mutate({});
    } catch (err) {
      toast.error('Failed to save generated questions');
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm("Are you sure you want to delete this question?", "Delete Question");
    if (!isConfirmed) return;
    try {
      await deleteQuestionMutation.mutateAsync(id);
      toast.success('Question deleted successfully!');
    } catch (err) {
      toast.error("Failed to delete question");
    }
  };

  const startEdit = (q) => {
    setEditingId(q.id);
    setEditForm(q);
  };

  const saveEdit = async () => {
    try {
      await editQuestionMutation.mutateAsync(editForm);
      toast.success('Question updated successfully!');
      setEditingId(null);
    } catch (err) {
      toast.error("Failed to update question");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const res = await importQuestionsMutation.mutateAsync(file);
      toast.success(res.data.message || 'Questions imported successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to import CSV');
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link to="/admin" style={{ color: 'var(--primary)', textDecoration: 'none' }}>← Back to Admin Panel</Link>
          <h1 style={{ marginTop: '10px' }}>Manage Questions - Test #{testId}</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="file" 
            accept=".csv" 
            style={{ display: 'none' }} 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button className="secondary" onClick={() => downloadQuestionTemplate()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={16} /> Template
          </button>
          <button className="primary" onClick={() => fileInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }} disabled={importQuestionsMutation.isPending}>
            <Upload size={16} /> {importQuestionsMutation.isPending ? 'Importing...' : 'Import CSV'}
          </button>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-card">
          <h3>Add Manual Question</h3>
          <form onSubmit={handleAddQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label>Section</label>
                <select value={form.section} onChange={e => setForm({...form, section: e.target.value})}>
                  <option value="APTITUDE">Aptitude</option>
                  <option value="CORE">Core</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ margin: 0 }}>Category</label>
                  <button type="button" onClick={handleCreateCategory} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', padding: '2px 6px', borderRadius: '4px' }}>
                    <Plus size={14} /> New
                  </button>
                </div>
                <select value={form.category_id || ''} onChange={e => setForm({...form, category_id: e.target.value})}>
                  <option value="">None</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            
            <div>
              <label>Question Text (supports HTML &amp; images)</label>
              <RichTextArea value={form.q_text} onChange={val => setForm({...form, q_text: val})} rows={3} placeholder="Enter question text... You can use HTML tags like <b>bold</b> or <img>." />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><label>Option 1</label><input required value={form.op1} onChange={e => setForm({...form, op1: e.target.value})} /></div>
              <div><label>Option 2</label><input required value={form.op2} onChange={e => setForm({...form, op2: e.target.value})} /></div>
              <div><label>Option 3</label><input required value={form.op3} onChange={e => setForm({...form, op3: e.target.value})} /></div>
              <div><label>Option 4</label><input required value={form.op4} onChange={e => setForm({...form, op4: e.target.value})} /></div>
            </div>
            
            <div>
              <label>Correct Option</label>
              <select value={form.correct_option} onChange={e => setForm({...form, correct_option: parseInt(e.target.value)})}>
                <option value={1}>Option 1</option>
                <option value={2}>Option 2</option>
                <option value={3}>Option 3</option>
                <option value={4}>Option 4</option>
              </select>
            </div>
            
            <div>
              <label>Explanation (Optional)</label>
              <RichTextArea value={form.explanation || ''} onChange={val => setForm({...form, explanation: val})} rows={2} placeholder="Add an explanation..." />
            </div>
            
            <button type="submit" className="primary" style={{ marginTop: '10px' }}>Add Question</button>
          </form>
        </div>
        
        <div className="glass-card">
          <h3>AI Question Generator</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>Generate questions instantly using AI.</p>
          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <div>
                <label>Topic / Prompt</label>
                <input type="text" placeholder="e.g. Data Structures and Algorithms" required value={generateForm.topic} onChange={e => setGenerateForm({...generateForm, topic: e.target.value})} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ margin: 0 }}>Category</label>
                  <button type="button" onClick={handleCreateCategory} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', padding: '2px 6px', borderRadius: '4px' }}>
                    <Plus size={14} /> New
                  </button>
                </div>
                <select value={generateForm.category_id || ''} onChange={e => setGenerateForm({...generateForm, category_id: e.target.value})}>
                  <option value="">Auto-detect / None</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label>Number of Questions</label>
                <input type="number" min="1" max="10" required value={generateForm.number} onChange={e => setGenerateForm({...generateForm, number: e.target.value})} />
              </div>
              <div>
                <label>Difficulty</label>
                <select value={generateForm.difficulty} onChange={e => setGenerateForm({...generateForm, difficulty: e.target.value})}>
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
            </div>
            <button type="submit" className="secondary" disabled={loadingAI}>
              {loadingAI ? `Generating (${generatedQuestions?.length || 0}/${generateForm.number})...` : '✨ Generate with AI'}
            </button>
          </form>
          
          {generatedQuestions && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <h4 style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                Generated ({generatedQuestions.length})
                <button className="primary" onClick={handleSaveGenerated} style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Save to Test</button>
              </h4>
              <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {generatedQuestions.map((q, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
                    <strong>Q: {q.q_text}</strong>
                    <div style={{ fontSize: '0.85rem', marginTop: '8px', color: 'var(--text-muted)' }}>
                      <div>1: {q.op1}</div><div>2: {q.op2}</div><div>3: {q.op3}</div><div>4: {q.op4}</div>
                      <div style={{ color: 'var(--primary)', marginTop: '4px' }}>Ans: {q.correct_option}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card">
        <h3>Existing Questions ({questions.length})</h3>
        {questions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No questions have been added yet.</p>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {questions.map((q) => (
                  <div key={q.id}>
                    {editingId === q.id ? (
                      <div className="glass-card" style={{ marginBottom: '12px', border: '1px solid var(--primary)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <label>Question Text</label>
                            <RichTextArea value={editForm.q_text} onChange={val => setEditForm({...editForm, q_text: val})} rows={2} />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div><label>Op1</label><input value={editForm.op1} onChange={e => setEditForm({...editForm, op1: e.target.value})} /></div>
                            <div><label>Op2</label><input value={editForm.op2} onChange={e => setEditForm({...editForm, op2: e.target.value})} /></div>
                            <div><label>Op3</label><input value={editForm.op3} onChange={e => setEditForm({...editForm, op3: e.target.value})} /></div>
                            <div><label>Op4</label><input value={editForm.op4} onChange={e => setEditForm({...editForm, op4: e.target.value})} /></div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                              <label>Correct Option</label>
                              <select value={editForm.correct_option} onChange={e => setEditForm({...editForm, correct_option: parseInt(e.target.value)})}>
                                <option value={1}>1</option><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option>
                              </select>
                            </div>
                            <div>
                              <label>Explanation</label>
                              <RichTextArea value={editForm.explanation || ''} onChange={val => setEditForm({...editForm, explanation: val})} rows={2} />
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
                            <button className="secondary" onClick={() => setEditingId(null)}><X size={16} /> Cancel</button>
                            <button className="primary" onClick={saveEdit}><Save size={16} /> Save</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <SortableQuestionItem q={q} categories={categories} startEdit={startEdit} handleDelete={handleDelete} />
                    )}
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
