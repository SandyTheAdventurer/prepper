import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

// ── Tests ──
export function useTests() {
  return useQuery({
    queryKey: ['tests'],
    queryFn: async () => {
      const { data } = await api.get('/tests/');
      // Handle both paginated and non-paginated responses
      return data.results || data;
    },
  });
}

export function useTestHistory() {
  return useQuery({
    queryKey: ['test-history'],
    queryFn: async () => {
      const { data } = await api.get('/tests/history/');
      return data;
    },
  });
}

export function useCreateTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (testData) => api.post('/tests/', testData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tests'] }),
  });
}

export function useToggleTestActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (testId) => api.post(`/tests/${testId}/toggle-active/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tests'] }),
  });
}

// ── Students ──
export function useStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data } = await api.get('/students/');
      return data.results || data;
    },
  });
}

export function useTogglePlaced() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (username) => api.post('/students/toggle-placed/', { username }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });
}

// ── Categories ──
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories/');
      return data;
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name) => api.post('/categories/', { name }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

// ── Questions (test-scoped) ──
export function useTestQuestions(testId) {
  return useQuery({
    queryKey: ['test-questions', testId],
    queryFn: async () => {
      const { data } = await api.get(`/tests/${testId}/questions/`);
      return data;
    },
    enabled: !!testId,
  });
}

export function useAddQuestion(testId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (questionData) => api.post(`/tests/${testId}/questions/`, questionData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['test-questions', testId] }),
  });
}

export function useEditQuestion(testId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/tests/${testId}/questions/${id}/`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['test-questions', testId] }),
  });
}

export function useDeleteQuestion(testId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/tests/${testId}/questions/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['test-questions', testId] }),
  });
}

// ── Test Result ──
export function useTestResult(testId) {
  return useQuery({
    queryKey: ['test-result', testId],
    queryFn: async () => {
      const { data } = await api.get('/tests/result/', { params: { test_id: testId } });
      return data;
    },
    enabled: !!testId,
  });
}

// ── Export ──
export async function exportTestResults(testId) {
  const response = await api.get(`/tests/${testId}/export/`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `test_${testId}_results.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats/');
      return data;
    },
  });
}

export function useTestAnalytics(testId) {
  return useQuery({
    queryKey: ['test-analytics', testId],
    queryFn: async () => {
      const { data } = await api.get(`/tests/${testId}/analytics/`);
      return data;
    },
    enabled: !!testId,
  });
}

export function useCloneTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (testId) => api.post(`/tests/${testId}/clone/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tests'] }),
  });
}

export function useUpdateTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ testId, ...testData }) => api.patch(`/tests/${testId}/`, testData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tests'] }),
  });
}

export function useDeleteTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (testId) => api.delete(`/tests/${testId}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tests'] }),
  });
}

export async function downloadQuestionTemplate() {
  const response = await api.get('/tests/questions-template/', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'questions_template.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function useImportQuestions(testId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post(`/tests/${testId}/import-questions/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['test-questions', testId] }),
  });
}

export function useStudentAnalytics(username) {
  return useQuery({
    queryKey: ['student-analytics', username],
    queryFn: async () => {
      const res = await api.get(`/admin/student/${username}/analytics/`);
      return res.data;
    },
    enabled: !!username,
  });
}

export function useReorderQuestions(testId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (question_ids) => api.post(`/tests/${testId}/questions/reorder/`, { question_ids }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['questions', testId] }),
  });
}
