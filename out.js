(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // src/pages/ManageQuestions.jsx
  var import_react = __require("react");
  var import_react_router_dom = __require("react-router-dom");
  var import_lucide_react = __require("lucide-react");
  var import_Toast = __require("../components/Toast");
  var import_api = __require("../hooks/api");
  var import_api2 = __toESM(__require("../lib/api"), 1);
  var import_core = __require("@dnd-kit/core");
  var import_sortable = __require("@dnd-kit/sortable");
  var import_utilities = __require("@dnd-kit/utilities");
  var import_react_quill = __toESM(__require("react-quill"), 1);
  var import_quill_snow = __require("react-quill/dist/quill.snow.css");
  function CustomQuill({ value, onChange, style }) {
    const quillRef = (0, import_react.useRef)(null);
    const imageHandler = (0, import_react.useCallback)(() => {
      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", "image/*");
      input.click();
      input.onchange = async () => {
        const file = input.files[0];
        if (file) {
          const formData = new FormData();
          formData.append("image", file);
          try {
            const res = await import_api2.default.post("/admin/upload-image/", formData, {
              headers: { "Content-Type": "multipart/form-data" }
            });
            const url = res.data.url;
            const quill = quillRef.current.getEditor();
            const range = quill.getSelection(true) || { index: quill.getLength() };
            quill.insertEmbed(range.index, "image", url);
          } catch (err) {
            console.error("Image upload failed", err);
            alert("Image upload failed");
          }
        }
      };
    }, []);
    const modules = (0, import_react.useMemo)(() => ({
      toolbar: {
        container: [
          [{ "header": [1, 2, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ "list": "ordered" }, { "list": "bullet" }, { "indent": "-1" }, { "indent": "+1" }],
          ["link", "image"],
          ["clean"]
        ],
        handlers: {
          image: imageHandler
        }
      }
    }), [imageHandler]);
    return /* @__PURE__ */ React.createElement(
      import_react_quill.default,
      {
        ref: quillRef,
        theme: "snow",
        value,
        onChange,
        modules,
        style
      }
    );
  }
  function SortableQuestionItem({ q, categories, startEdit, handleDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition } = (0, import_sortable.useSortable)({ id: q.id });
    const style = { transform: import_utilities.CSS.Transform.toString(transform), transition, marginBottom: "12px" };
    return /* @__PURE__ */ React.createElement("div", { ref: setNodeRef, style, className: "glass-card" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", { ...attributes, ...listeners, style: { cursor: "grab", marginRight: "8px", color: "var(--text-muted)" } }, /* @__PURE__ */ React.createElement(import_lucide_react.GripVertical, { size: 16 })), /* @__PURE__ */ React.createElement("span", { className: "badge user", style: { marginRight: "8px" } }, q.section), q.category_id && /* @__PURE__ */ React.createElement("span", { className: "badge", style: { background: "rgba(16, 185, 129, 0.2)", color: "#10b981" } }, categories.find((c) => c.id === q.category_id)?.name || "Unknown")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("button", { className: "secondary", onClick: () => startEdit(q), style: { padding: "6px" }, title: "Edit" }, /* @__PURE__ */ React.createElement(import_lucide_react.Edit, { size: 16 })), /* @__PURE__ */ React.createElement("button", { className: "danger", onClick: () => handleDelete(q.id), style: { padding: "6px" }, title: "Delete" }, /* @__PURE__ */ React.createElement(import_lucide_react.Trash, { size: 16 })))), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: "12px", fontWeight: 600, fontSize: "1.1rem" }, dangerouslySetInnerHTML: { __html: q.q_number + ". " + q.q_text } }), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.9rem", color: "var(--text-muted)" } }, /* @__PURE__ */ React.createElement("div", { style: q.correct_option === 1 ? { color: "#10b981", fontWeight: 600 } : {} }, "A) ", q.op1), /* @__PURE__ */ React.createElement("div", { style: q.correct_option === 2 ? { color: "#10b981", fontWeight: 600 } : {} }, "B) ", q.op2), /* @__PURE__ */ React.createElement("div", { style: q.correct_option === 3 ? { color: "#10b981", fontWeight: 600 } : {} }, "C) ", q.op3), /* @__PURE__ */ React.createElement("div", { style: q.correct_option === 4 ? { color: "#10b981", fontWeight: 600 } : {} }, "D) ", q.op4)));
  }
  function ManageQuestions() {
    const { testId } = (0, import_react_router_dom.useParams)();
    const { toast, confirm } = (0, import_Toast.useToast)();
    const [form, setForm] = (0, import_react.useState)({
      section: "APTITUDE",
      q_number: "",
      q_text: "",
      op1: "",
      op2: "",
      op3: "",
      op4: "",
      correct_option: 1,
      explanation: ""
    });
    const [generateForm, setGenerateForm] = (0, import_react.useState)({ topic: "", number: 5, difficulty: "Medium" });
    const [generatedQuestions, setGeneratedQuestions] = (0, import_react.useState)(null);
    const [loadingAI, setLoadingAI] = (0, import_react.useState)(false);
    const [editingId, setEditingId] = (0, import_react.useState)(null);
    const [editForm, setEditForm] = (0, import_react.useState)({});
    const fileInputRef = (0, import_react.useRef)(null);
    const { data: questions = [] } = (0, import_api.useTestQuestions)(testId);
    const { data: categories = [] } = (0, import_api.useCategories)();
    const addQuestionMutation = (0, import_api.useAddQuestion)(testId);
    const editQuestionMutation = (0, import_api.useEditQuestion)(testId);
    const deleteQuestionMutation = (0, import_api.useDeleteQuestion)(testId);
    const createCategoryMutation = (0, import_api.useCreateCategory)();
    const importQuestionsMutation = (0, import_api.useImportQuestions)(testId);
    const reorderQuestionsMutation = (0, import_api.useReorderQuestions)(testId);
    const generateQuestionsMutation = {};
    const handleCreateCategory = async () => {
      const name = window.prompt("Enter new category name:");
      if (!name) return;
      try {
        await createCategoryMutation.mutateAsync(name);
        toast.success("Category created!");
      } catch (err) {
        toast.error("Failed to create category");
      }
    };
    const handleAddQuestion = async (e) => {
      e.preventDefault();
      try {
        await addQuestionMutation.mutateAsync(form);
        toast.success("Question added successfully!");
        setForm({ ...form, q_text: "", op1: "", op2: "", op3: "", op4: "", explanation: "" });
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to add question");
      }
    };
    const handleDragEnd = async (event) => {
      const { active, over } = event;
      if (active.id !== over.id) {
        const oldIndex = questions.findIndex((q) => q.id === active.id);
        const newIndex = questions.findIndex((q) => q.id === over.id);
        const newQuestions = [...questions];
        const [removed] = newQuestions.splice(oldIndex, 1);
        newQuestions.splice(newIndex, 0, removed);
        const newIds = newQuestions.map((q) => q.id);
        await reorderQuestionsMutation.mutateAsync(newIds);
      }
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
          const existingTexts = [...currentQuestions.map((q) => q.q_text)];
          const res = await import_api2.default.post(`/tests/${testId}/generate-questions/`, {
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
        toast.error("Failed to generate any questions. Ensure LLM is running.");
      } else {
        toast.success(`Generated ${generatedCount} question(s) successfully!`);
      }
    };
    const handleSaveGenerated = async () => {
      try {
        const qs = generatedQuestions.map((q) => ({
          ...q,
          section: form.section,
          category_id: generateForm.category_id || null
        }));
        await import_api2.default.post(`/tests/${testId}/save-generated-questions/`, {
          questions: qs
        });
        toast.success("Saved generated questions successfully!");
        setGeneratedQuestions(null);
        addQuestionMutation.mutate({});
      } catch (err) {
        toast.error("Failed to save generated questions");
      }
    };
    const handleDelete = async (id) => {
      const isConfirmed = await confirm("Are you sure you want to delete this question?", "Delete Question");
      if (!isConfirmed) return;
      try {
        await deleteQuestionMutation.mutateAsync(id);
        toast.success("Question deleted successfully!");
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
        toast.success("Question updated successfully!");
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
        toast.success(res.data.message || "Questions imported successfully");
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to import CSV");
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    return /* @__PURE__ */ React.createElement("div", { className: "animate-fade-in" }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(import_react_router_dom.Link, { to: "/admin", style: { color: "var(--primary)", textDecoration: "none" } }, "\u2190 Back to Admin Panel"), /* @__PURE__ */ React.createElement("h1", { style: { marginTop: "10px" } }, "Manage Questions - Test #", testId)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "12px" } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "file",
        accept: ".csv",
        style: { display: "none" },
        ref: fileInputRef,
        onChange: handleFileUpload
      }
    ), /* @__PURE__ */ React.createElement("button", { className: "secondary", onClick: () => (0, import_api.downloadQuestionTemplate)(), style: { display: "flex", alignItems: "center", gap: "8px" } }, /* @__PURE__ */ React.createElement(import_lucide_react.Download, { size: 16 }), " Template"), /* @__PURE__ */ React.createElement("button", { className: "primary", onClick: () => fileInputRef.current?.click(), style: { display: "flex", alignItems: "center", gap: "8px" }, disabled: importQuestionsMutation.isPending }, /* @__PURE__ */ React.createElement(import_lucide_react.Upload, { size: 16 }), " ", importQuestionsMutation.isPending ? "Importing..." : "Import CSV"))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "40px" } }, /* @__PURE__ */ React.createElement("div", { className: "glass-card" }, /* @__PURE__ */ React.createElement("h3", null, "Add Manual Question"), /* @__PURE__ */ React.createElement("form", { onSubmit: handleAddQuestion, style: { display: "flex", flexDirection: "column", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", null, "Section"), /* @__PURE__ */ React.createElement("select", { value: form.section, onChange: (e) => setForm({ ...form, section: e.target.value }) }, /* @__PURE__ */ React.createElement("option", { value: "APTITUDE" }, "Aptitude"), /* @__PURE__ */ React.createElement("option", { value: "CORE" }, "Core"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" } }, /* @__PURE__ */ React.createElement("label", { style: { margin: 0 } }, "Category"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: handleCreateCategory, style: { background: "transparent", border: "none", color: "var(--primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", padding: "2px 6px", borderRadius: "4px" } }, /* @__PURE__ */ React.createElement(import_lucide_react.Plus, { size: 14 }), " New")), /* @__PURE__ */ React.createElement("select", { value: form.category_id || "", onChange: (e) => setForm({ ...form, category_id: e.target.value }) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "None"), categories.map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, c.name))))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", null, "Question Text"), /* @__PURE__ */ React.createElement(CustomQuill, { value: form.q_text, onChange: (val) => setForm({ ...form, q_text: val }), style: { background: "rgba(255,255,255,0.05)", borderRadius: "8px" } })), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", null, "Option 1"), /* @__PURE__ */ React.createElement("input", { required: true, value: form.op1, onChange: (e) => setForm({ ...form, op1: e.target.value }) })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", null, "Option 2"), /* @__PURE__ */ React.createElement("input", { required: true, value: form.op2, onChange: (e) => setForm({ ...form, op2: e.target.value }) })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", null, "Option 3"), /* @__PURE__ */ React.createElement("input", { required: true, value: form.op3, onChange: (e) => setForm({ ...form, op3: e.target.value }) })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", null, "Option 4"), /* @__PURE__ */ React.createElement("input", { required: true, value: form.op4, onChange: (e) => setForm({ ...form, op4: e.target.value }) }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", null, "Correct Option"), /* @__PURE__ */ React.createElement("select", { value: form.correct_option, onChange: (e) => setForm({ ...form, correct_option: parseInt(e.target.value) }) }, /* @__PURE__ */ React.createElement("option", { value: 1 }, "Option 1"), /* @__PURE__ */ React.createElement("option", { value: 2 }, "Option 2"), /* @__PURE__ */ React.createElement("option", { value: 3 }, "Option 3"), /* @__PURE__ */ React.createElement("option", { value: 4 }, "Option 4"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", null, "Explanation (Optional)"), /* @__PURE__ */ React.createElement(CustomQuill, { value: form.explanation || "", onChange: (val) => setForm({ ...form, explanation: val }), style: { background: "rgba(255,255,255,0.05)", borderRadius: "8px" } })), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "primary", style: { marginTop: "10px" } }, "Add Question"))), /* @__PURE__ */ React.createElement("div", { className: "glass-card" }, /* @__PURE__ */ React.createElement("h3", null, "AI Question Generator"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "0.9rem", marginBottom: "16px" } }, "Generate questions instantly using AI."), /* @__PURE__ */ React.createElement("form", { onSubmit: handleGenerate, style: { display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", null, "Topic / Prompt"), /* @__PURE__ */ React.createElement("input", { type: "text", placeholder: "e.g. Data Structures and Algorithms", required: true, value: generateForm.topic, onChange: (e) => setGenerateForm({ ...generateForm, topic: e.target.value }) })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" } }, /* @__PURE__ */ React.createElement("label", { style: { margin: 0 } }, "Category"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: handleCreateCategory, style: { background: "transparent", border: "none", color: "var(--primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", padding: "2px 6px", borderRadius: "4px" } }, /* @__PURE__ */ React.createElement(import_lucide_react.Plus, { size: 14 }), " New")), /* @__PURE__ */ React.createElement("select", { value: generateForm.category_id || "", onChange: (e) => setGenerateForm({ ...generateForm, category_id: e.target.value }) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "Auto-detect / None"), categories.map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, c.name))))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", null, "Number of Questions"), /* @__PURE__ */ React.createElement("input", { type: "number", min: "1", max: "10", required: true, value: generateForm.number, onChange: (e) => setGenerateForm({ ...generateForm, number: e.target.value }) })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", null, "Difficulty"), /* @__PURE__ */ React.createElement("select", { value: generateForm.difficulty, onChange: (e) => setGenerateForm({ ...generateForm, difficulty: e.target.value }) }, /* @__PURE__ */ React.createElement("option", null, "Easy"), /* @__PURE__ */ React.createElement("option", null, "Medium"), /* @__PURE__ */ React.createElement("option", null, "Hard")))), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "secondary", disabled: loadingAI }, loadingAI ? `Generating (${generatedQuestions?.length || 0}/${generateForm.number})...` : "\u2728 Generate with AI")), generatedQuestions && /* @__PURE__ */ React.createElement("div", { style: { borderTop: "1px solid var(--border)", paddingTop: "16px" } }, /* @__PURE__ */ React.createElement("h4", { style: { marginBottom: "12px", display: "flex", justifyContent: "space-between" } }, "Generated (", generatedQuestions.length, ")", /* @__PURE__ */ React.createElement("button", { className: "primary", onClick: handleSaveGenerated, style: { padding: "4px 8px", fontSize: "0.8rem" } }, "Save to Test")), /* @__PURE__ */ React.createElement("div", { style: { maxHeight: "300px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" } }, generatedQuestions.map((q, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { background: "rgba(255,255,255,0.05)", padding: "12px", borderRadius: "8px" } }, /* @__PURE__ */ React.createElement("strong", null, "Q: ", q.q_text), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.85rem", marginTop: "8px", color: "var(--text-muted)" } }, /* @__PURE__ */ React.createElement("div", null, "1: ", q.op1), /* @__PURE__ */ React.createElement("div", null, "2: ", q.op2), /* @__PURE__ */ React.createElement("div", null, "3: ", q.op3), /* @__PURE__ */ React.createElement("div", null, "4: ", q.op4), /* @__PURE__ */ React.createElement("div", { style: { color: "var(--primary)", marginTop: "4px" } }, "Ans: ", q.correct_option)))))))), /* @__PURE__ */ React.createElement("div", { className: "glass-card" }, /* @__PURE__ */ React.createElement("h3", null, "Existing Questions (", questions.length, ")"), questions.length === 0 ? /* @__PURE__ */ React.createElement("p", { style: { color: "var(--text-muted)" } }, "No questions have been added yet.") : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" } }, /* @__PURE__ */ React.createElement(import_core.DndContext, { collisionDetection: import_core.closestCenter, onDragEnd: handleDragEnd }, /* @__PURE__ */ React.createElement(import_sortable.SortableContext, { items: questions.map((q) => q.id), strategy: import_sortable.verticalListSortingStrategy }, questions.map((q) => /* @__PURE__ */ React.createElement("div", { key: q.id }, editingId === q.id ? /* @__PURE__ */ React.createElement("div", { className: "glass-card", style: { marginBottom: "12px", border: "1px solid var(--primary)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", null, "Question Text"), /* @__PURE__ */ React.createElement(CustomQuill, { value: editForm.q_text, onChange: (val) => setEditForm({ ...editForm, q_text: val }), style: { background: "rgba(255,255,255,0.05)", borderRadius: "8px" } })), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", null, "Op1"), /* @__PURE__ */ React.createElement("input", { value: editForm.op1, onChange: (e) => setEditForm({ ...editForm, op1: e.target.value }) })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", null, "Op2"), /* @__PURE__ */ React.createElement("input", { value: editForm.op2, onChange: (e) => setEditForm({ ...editForm, op2: e.target.value }) })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", null, "Op3"), /* @__PURE__ */ React.createElement("input", { value: editForm.op3, onChange: (e) => setEditForm({ ...editForm, op3: e.target.value }) })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", null, "Op4"), /* @__PURE__ */ React.createElement("input", { value: editForm.op4, onChange: (e) => setEditForm({ ...editForm, op4: e.target.value }) }))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", null, "Correct Option"), /* @__PURE__ */ React.createElement("select", { value: editForm.correct_option, onChange: (e) => setEditForm({ ...editForm, correct_option: parseInt(e.target.value) }) }, /* @__PURE__ */ React.createElement("option", { value: 1 }, "1"), /* @__PURE__ */ React.createElement("option", { value: 2 }, "2"), /* @__PURE__ */ React.createElement("option", { value: 3 }, "3"), /* @__PURE__ */ React.createElement("option", { value: 4 }, "4"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", null, "Explanation"), /* @__PURE__ */ React.createElement(CustomQuill, { value: editForm.explanation || "", onChange: (val) => setEditForm({ ...editForm, explanation: val }), style: { background: "rgba(255,255,255,0.05)", borderRadius: "8px" } }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" } }, /* @__PURE__ */ React.createElement("button", { className: "secondary", onClick: () => setEditingId(null) }, /* @__PURE__ */ React.createElement(import_lucide_react.X, { size: 16 }), " Cancel"), /* @__PURE__ */ React.createElement("button", { className: "primary", onClick: saveEdit }, /* @__PURE__ */ React.createElement(import_lucide_react.Save, { size: 16 }), " Save")))) : /* @__PURE__ */ React.createElement(SortableQuestionItem, { q, categories, startEdit, handleDelete }))))))));
  }
})();
