import { useEffect, useState, useCallback, type FormEvent } from 'react';
import { supabase, type Note, type Category } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  NotebookPen,
  Plus,
  LogOut,
  Pin,
  PinOff,
  Pencil,
  Trash2,
  Search,
  Loader2,
  AlertCircle,
  Folder,
  FolderOpen,
  Tags,
  X,
} from 'lucide-react';

const COLORS = [
  { id: 'default', bg: 'bg-white', border: 'border-slate-200', accent: 'text-slate-600', dot: 'bg-slate-400' },
  { id: 'blue', bg: 'bg-blue-50', border: 'border-blue-200', accent: 'text-blue-600', dot: 'bg-blue-500' },
  { id: 'green', bg: 'bg-emerald-50', border: 'border-emerald-200', accent: 'text-emerald-600', dot: 'bg-emerald-500' },
  { id: 'amber', bg: 'bg-amber-50', border: 'border-amber-200', accent: 'text-amber-600', dot: 'bg-amber-500' },
  { id: 'rose', bg: 'bg-rose-50', border: 'border-rose-200', accent: 'text-rose-600', dot: 'bg-rose-500' },
  { id: 'cyan', bg: 'bg-cyan-50', border: 'border-cyan-200', accent: 'text-cyan-600', dot: 'bg-cyan-500' },
];

function colorOf(id: string) {
  return COLORS.find((c) => c.id === id) ?? COLORS[0];
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins} min`;
  if (hours < 24) return `hace ${hours} h`;
  if (days < 7) return `hace ${days} d`;
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
}

type DateSort = 'newest' | 'oldest';
const ALL_CATEGORIES = 'all';
const UNCATEGORIZED = '__uncat__';
const NOTE_CONTENT_MAX = 500;

type EditData = {
  id: string | null;
  title: string;
  content: string;
  color: string;
  category_id: string | null;
};

export function NotesApp() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES);
  const [dateSort, setDateSort] = useState<DateSort>('newest');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [noteFormError, setNoteFormError] = useState<string | null>(null);
  const [editData, setEditData] = useState<EditData>({
    id: null, title: '', content: '', color: 'default', category_id: null,
  });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Category management
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catColor, setCatColor] = useState('blue');
  const [catSaving, setCatSaving] = useState(false);
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);
  const [deleteCatOpen, setDeleteCatOpen] = useState(false);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('notes')
      .select('*')
      .order('pinned', { ascending: false })
      .order('updated_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setNotes(data as Note[]);
    }
    setLoading(false);
  }, []);

  const fetchCategories = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setCategories(data as Category[]);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
    fetchCategories();
  }, [fetchNotes, fetchCategories]);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  function openNewNote() {
    setEditData({
      id: null, title: '', content: '', color: 'default',
      category_id: activeCategory !== ALL_CATEGORIES && activeCategory !== UNCATEGORIZED
        ? activeCategory
        : null,
    });
    setNoteFormError(null);
    setDialogOpen(true);
  }

  function openEditNote(note: Note) {
    setEditData({
      id: note.id, title: note.title, content: note.content,
      color: note.color, category_id: note.category_id,
    });
    setNoteFormError(null);
    setDialogOpen(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!editData.title.trim()) return;
    if (editData.content.length > NOTE_CONTENT_MAX) {
      setNoteFormError(`El texto de la nota no puede tener más de ${NOTE_CONTENT_MAX} caracteres.`);
      return;
    }
    setNoteFormError(null);
    setSaving(true);

    try {
      if (editData.id) {
        const { error: updateError } = await supabase
          .from('notes')
          .update({
            title: editData.title.trim(),
            content: editData.content,
            color: editData.color,
            category_id: editData.category_id,
          })
          .eq('id', editData.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('notes').insert({
          title: editData.title.trim(),
          content: editData.content,
          color: editData.color,
          category_id: editData.category_id,
        });
        if (insertError) throw insertError;
      }
      setDialogOpen(false);
      await fetchNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la nota');
    } finally {
      setSaving(false);
    }
  }

  async function togglePin(note: Note) {
    const { error: pinError } = await supabase
      .from('notes')
      .update({ pinned: !note.pinned })
      .eq('id', note.id);
    if (pinError) {
      setError(pinError.message);
      return;
    }
    await fetchNotes();
  }

  function confirmDelete(id: string) {
    setDeleteId(id);
    setDeleteOpen(true);
  }

  async function handleDelete() {
    if (!deleteId) return;
    const { error: deleteError } = await supabase.from('notes').delete().eq('id', deleteId);
    setDeleteOpen(false);
    setDeleteId(null);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    await fetchNotes();
  }

  // Category CRUD
  function openNewCategory() {
    setCatName('');
    setCatColor('blue');
    setCatDialogOpen(true);
  }

  async function handleSaveCategory(e: FormEvent) {
    e.preventDefault();
    if (!catName.trim()) return;
    setCatSaving(true);
    try {
      const { error: insertError } = await supabase.from('categories').insert({
        name: catName.trim(),
        color: catColor,
      });
      if (insertError) throw insertError;
      setCatDialogOpen(false);
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la categoría');
    } finally {
      setCatSaving(false);
    }
  }

  function confirmDeleteCategory(id: string) {
    setDeleteCatId(id);
    setDeleteCatOpen(true);
  }

  async function handleDeleteCategory() {
    if (!deleteCatId) return;
    const { error: deleteError } = await supabase.from('categories').delete().eq('id', deleteCatId);
    setDeleteCatOpen(false);
    setDeleteCatId(null);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    if (activeCategory === deleteCatId) setActiveCategory(ALL_CATEGORIES);
    await fetchCategories();
    await fetchNotes();
  }

  const categoryName = (id: string | null) => {
    if (!id) return null;
    const cat = categories.find((c) => c.id === id);
    return cat ?? null;
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch = search.trim()
      ? n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchesCategory =
      activeCategory === ALL_CATEGORIES
        ? true
        : activeCategory === UNCATEGORIZED
          ? !n.category_id
          : n.category_id === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const byDate = (a: Note, b: Note) => {
    const da = new Date(a.updated_at).getTime();
    const db = new Date(b.updated_at).getTime();
    return dateSort === 'oldest' ? da - db : db - da;
  };

  const pinnedNotes = filteredNotes.filter((n) => n.pinned).sort(byDate);
  const regularNotes = filteredNotes.filter((n) => !n.pinned).sort(byDate);

  const noteCountInCategory = (catId: string) => notes.filter((n) => n.category_id === catId).length;
  const uncatNoteCount = notes.filter((n) => !n.category_id).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20">
              <NotebookPen className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">Notas</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:inline truncate max-w-[180px]">
              {user?.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex gap-6">
        {/* Sidebar — Categories */}
        <aside className="hidden md:flex flex-col w-56 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
              <Tags className="w-4 h-4 text-slate-400" />
              Categorías
            </h2>
            <button
              onClick={openNewCategory}
              className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              aria-label="Nueva categoría"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setActiveCategory(ALL_CATEGORIES)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeCategory === ALL_CATEGORIES
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FolderOpen className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">Todas las notas</span>
              <span className="text-xs text-slate-400">{notes.length}</span>
            </button>

            <button
              onClick={() => setActiveCategory(UNCATEGORIZED)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeCategory === UNCATEGORIZED
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Folder className="w-4 h-4 shrink-0 text-slate-400" />
              <span className="flex-1 text-left">Sin categoría</span>
              <span className="text-xs text-slate-400">{uncatNoteCount}</span>
            </button>

            {categories.map((cat) => {
              const c = colorOf(cat.color);
              const isActive = activeCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  className={`group w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                    isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <span className={`w-3 h-3 rounded-full shrink-0 ${c.dot}`} />
                  <span className="flex-1 text-left truncate">{cat.name}</span>
                  <span className="text-xs text-slate-400">{noteCountInCategory(cat.id)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDeleteCategory(cat.id);
                    }}
                    className="p-0.5 rounded text-slate-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                    aria-label="Eliminar categoría"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscá tus notas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 border-slate-200 bg-white"
              />
            </div>

            <Select value={activeCategory} onValueChange={setActiveCategory}>
              <SelectTrigger className="h-10 w-full sm:w-[200px] border-slate-200 bg-white" aria-label="Filtrar por categoría">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CATEGORIES}>Todas las categorías</SelectItem>
                <SelectItem value={UNCATEGORIZED}>Sin categoría</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateSort} onValueChange={(value) => setDateSort(value as DateSort)}>
              <SelectTrigger className="h-10 w-full sm:w-[220px] border-slate-200 bg-white" aria-label="Ordenar por fecha">
                <SelectValue placeholder="Fecha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Más reciente primero</SelectItem>
                <SelectItem value="oldest">Más antiguo primero</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile: New Category button */}
            <Button
              variant="outline"
              onClick={openNewCategory}
              className="h-10 md:hidden font-medium"
            >
              <Tags className="w-4 h-4 mr-1.5" />
              Categoría
            </Button>

            <Button
              onClick={openNewNote}
              className="h-10 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md shadow-blue-500/20 font-semibold"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Nueva nota
            </Button>
          </div>

          {activeCategory !== ALL_CATEGORIES && (
            <div className="flex items-center gap-2 mb-4 text-sm">
              <span className="text-slate-500">Filtrando por:</span>
              {activeCategory === UNCATEGORIZED ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                  <Folder className="w-3.5 h-3.5" />
                  Sin categoría
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                  <span className={`w-2.5 h-2.5 rounded-full ${colorOf(categoryName(activeCategory)?.color ?? 'blue').dot}`} />
                  {categoryName(activeCategory)?.name}
                </span>
              )}
              <button
                onClick={() => setActiveCategory(ALL_CATEGORIES)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Quitar filtro"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-6">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <NotebookPen className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-1">
                {search || activeCategory !== ALL_CATEGORIES ? 'No se encontraron notas' : 'Todavía no hay notas'}
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                {search || activeCategory !== ALL_CATEGORIES
                  ? 'Probá cambiar la búsqueda o el filtro.'
                  : 'Creá tu primera nota para empezar.'}
              </p>
              {!search && (
                <Button
                  onClick={openNewNote}
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 font-semibold"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Crear nota
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {pinnedNotes.length > 0 && (
                <section>
                  <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                    <Pin className="w-3.5 h-3.5" />
                    Fijadas
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        categoryName={categoryName(note.category_id)}
                        onEdit={() => openEditNote(note)}
                        onPin={() => togglePin(note)}
                        onDelete={() => confirmDelete(note.id)}
                      />
                    ))}
                  </div>
                </section>
              )}
              {regularNotes.length > 0 && (
                <section>
                  {pinnedNotes.length > 0 && (
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                      Todas las notas
                    </h2>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {regularNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        categoryName={categoryName(note.category_id)}
                        onEdit={() => openEditNote(note)}
                        onPin={() => togglePin(note)}
                        onDelete={() => confirmDelete(note.id)}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Create/Edit Note Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editData.id ? 'Editar nota' : 'Nueva nota'}</DialogTitle>
            <DialogDescription>
              {editData.id ? 'Modificá los datos de tu nota.' : 'Completá los datos de tu nueva nota.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note-title">Título</Label>
              <Input
                id="note-title"
                placeholder="Título de la nota"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                autoFocus
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="note-content">Contenido</Label>
                <span
                  className={`text-xs ${
                    editData.content.length >= NOTE_CONTENT_MAX ? 'text-red-600 font-medium' : 'text-slate-400'
                  }`}
                >
                  {editData.content.length}/{NOTE_CONTENT_MAX}
                </span>
              </div>
              <Textarea
                id="note-content"
                placeholder="Escribí tu nota acá..."
                value={editData.content}
                onChange={(e) => {
                  const content = e.target.value.slice(0, NOTE_CONTENT_MAX);
                  setEditData({ ...editData, content });
                  if (content.length <= NOTE_CONTENT_MAX) setNoteFormError(null);
                }}
                maxLength={NOTE_CONTENT_MAX}
                rows={6}
                className="resize-none"
              />
              {noteFormError && (
                <p className="text-xs text-red-600">{noteFormError}</p>
              )}
            </div>
            <div className="flex gap-4">
              <div className="space-y-2 flex-1">
                <Label>Categoría</Label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEditData({ ...editData, category_id: null })}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                      editData.category_id === null
                        ? 'border-slate-400 bg-slate-100 text-slate-700 font-medium'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    Ninguna
                  </button>
                  {categories.map((cat) => {
                    const c = colorOf(cat.color);
                    const selected = editData.category_id === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setEditData({ ...editData, category_id: cat.id })}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all ${
                          selected
                            ? `${c.border} ${c.bg} ${c.accent} font-medium`
                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
                {categories.length === 0 && (
                  <p className="text-xs text-slate-400">
                    Todavía no hay categorías. Creá una desde el menú lateral.
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setEditData({ ...editData, color: c.id })}
                    className={`w-8 h-8 rounded-lg ${c.dot} transition-all ${
                      editData.color === c.id
                        ? 'ring-2 ring-offset-2 ring-slate-400 scale-110'
                        : 'hover:scale-105'
                    }`}
                    aria-label={`Color ${c.id}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving || editData.content.length > NOTE_CONTENT_MAX}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 font-semibold"
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editData.id ? 'Guardar cambios' : 'Crear nota'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Category Dialog */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nueva categoría</DialogTitle>
            <DialogDescription>
              Creá una categoría para organizar tus notas.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCategory} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Nombre</Label>
              <Input
                id="cat-name"
                placeholder="ej. Trabajo, Personal, Ideas..."
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.slice(1).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCatColor(c.id)}
                    className={`w-8 h-8 rounded-lg ${c.dot} transition-all ${
                      catColor === c.id
                        ? 'ring-2 ring-offset-2 ring-slate-400 scale-110'
                        : 'hover:scale-105'
                    }`}
                    aria-label={`Color ${c.id}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCatDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={catSaving}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 font-semibold"
              >
                {catSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Crear
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Note Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>¿Eliminar nota?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. La nota se eliminará de forma permanente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-1.5" />
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation */}
      <Dialog open={deleteCatOpen} onOpenChange={setDeleteCatOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>¿Eliminar categoría?</DialogTitle>
            <DialogDescription>
              Se eliminará la categoría. Las notas de esta categoría seguirán existiendo, pero quedarán sin categoría.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteCatOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>
              <Trash2 className="w-4 h-4 mr-1.5" />
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NoteCard({
  note,
  categoryName,
  onEdit,
  onPin,
  onDelete,
}: {
  note: Note;
  categoryName: Category | null;
  onEdit: () => void;
  onPin: () => void;
  onDelete: () => void;
}) {
  const c = colorOf(note.color);
  return (
    <Card
      className={`group relative ${c.bg} ${c.border} border shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-slate-900 leading-snug line-clamp-2 flex-1">
            {note.title}
          </h3>
          <button
            onClick={onPin}
            className={`shrink-0 p-1 rounded-md transition-colors ${
              note.pinned
                ? `${c.accent} opacity-100`
                : 'text-slate-300 opacity-0 group-hover:opacity-100 hover:text-slate-500'
            }`}
            aria-label={note.pinned ? 'Desfijar nota' : 'Fijar nota'}
          >
            {note.pinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
          </button>
        </div>
        {note.content && (
          <p className="text-sm text-slate-600 line-clamp-4 whitespace-pre-wrap leading-relaxed">
            {note.content}
          </p>
        )}
        {categoryName && (
          <div className="mt-3">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${colorOf(categoryName.color).bg} ${colorOf(categoryName.color).border} border ${colorOf(categoryName.color).accent}`}>
              <span className={`w-2 h-2 rounded-full ${colorOf(categoryName.color).dot}`} />
              {categoryName.name}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/60">
          <span className="text-xs text-slate-400">{formatDate(note.updated_at)}</span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              aria-label="Editar nota"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              aria-label="Eliminar nota"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
