'use client';

import React, { useEffect, useState } from 'react';
import { useAgentContext } from '@/context/AgentContext';
import Button from '@/components/reusable/Button';
import InputField from '@/components/reusable/InputField';

interface NoteFormData {
  title: string;
  content: string;
  type: 'property' | 'inspection' | 'general';
  priority: 'high' | 'medium' | 'low';
}

export default function AddNotesPhase() {
  const { 
    agentData, 
    updateAgentData, 
    addNote, 
    updateNote, 
    deleteNote,
    previousPhase, 
    resetAgentFlow,
    setLoading, 
    loading 
  } = useAgentContext();
  
  const [notes, setNotes] = useState(agentData.notes);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [formData, setFormData] = useState<NoteFormData>({
    title: '',
    content: '',
    type: 'property',
    priority: 'medium'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<'all' | 'property' | 'inspection' | 'general'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'type'>('date');

  useEffect(() => {
    // Simulate fetching notes
    const fetchNotes = async () => {
      setLoading(true);
      try {
        // Use real API call to fetch notes
        const response = await fetch('/api/notes', {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch notes');
        
        const data = await response.json();
        const notes = data.data || data;
        
        setNotes(notes);
        updateAgentData({ notes });
      } catch (error) {
        console.error('Error fetching notes:', error);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [setLoading, updateAgentData, agentData.selectedProperty?.id]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const noteData = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      type: formData.type,
      priority: formData.priority,
      propertyId: formData.type === 'property' ? agentData.selectedProperty?.id : undefined,
      inspectionId: formData.type === 'inspection' ? agentData.selectedInspection?.id : undefined
    };

    if (editingNote) {
      updateNote(editingNote, noteData);
      const updatedNotes = notes.map(note => 
        note.id === editingNote 
          ? { ...note, ...noteData, updatedAt: new Date().toISOString() }
          : note
      );
      setNotes(updatedNotes);
    } else {
      const newNote = {
        id: Date.now().toString(),
        ...noteData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      addNote(noteData);
      setNotes([newNote, ...notes]);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'property',
      priority: 'medium'
    });
    setShowForm(false);
    setEditingNote(null);
    setErrors({});
  };

  const handleEdit = (note: any) => {
    setFormData({
      title: note.title,
      content: note.content,
      type: note.type,
      priority: note.priority
    });
    setEditingNote(note.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNote(id);
      setNotes(notes.filter(note => note.id !== id));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'property':
        return 'bg-blue-100 text-blue-800';
      case 'inspection':
        return 'bg-purple-100 text-purple-800';
      case 'general':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotes = notes.filter(note => {
    if (filter === 'all') return true;
    return note.type === filter;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Notes & Documentation</h2>
            <p className="text-gray-600 mt-1">Add, edit, and manage notes for properties and inspections</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            variant="primary"
          >
            Add Note
          </Button>
        </div>

        {/* Note Form */}
        {showForm && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingNote ? 'Edit Note' : 'Add New Note'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                error={errors.title}
                placeholder="Note title"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'property' | 'inspection' | 'general' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="property">Property</option>
                    <option value="inspection">Inspection</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'high' | 'medium' | 'low' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Note content"
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.content ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                )}
              </div>
              <div className="flex gap-3">
                <Button type="submit" variant="primary">
                  {editingNote ? 'Update Note' : 'Add Note'}
                </Button>
                <Button type="button" onClick={resetForm} variant="secondary">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            <label className="text-sm font-medium text-gray-700 self-center">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'property' | 'inspection' | 'general')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Notes</option>
              <option value="property">Property</option>
              <option value="inspection">Inspection</option>
              <option value="general">General</option>
            </select>
          </div>
          <div className="flex gap-2">
            <label className="text-sm font-medium text-gray-700 self-center">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'type')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="date">Date</option>
              <option value="priority">Priority</option>
              <option value="type">Type</option>
            </select>
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          {sortedNotes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No notes found</div>
              <p className="text-gray-500">
                {filter === 'all' ? 'Add your first note to get started.' : `No ${filter} notes found.`}
              </p>
            </div>
          ) : (
            sortedNotes.map((note) => (
              <div key={note.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{note.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(note.type)}`}>
                        {note.type.charAt(0).toUpperCase() + note.type.slice(1)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(note.priority)}`}>
                        {note.priority.charAt(0).toUpperCase() + note.priority.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{note.content}</p>
                    <div className="text-xs text-gray-500">
                      Created: {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString()}
                      {note.updatedAt !== note.createdAt && (
                        <span className="ml-2">
                          • Updated: {new Date(note.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      onClick={() => handleEdit(note)}
                      variant="secondary"
                      size="sm"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(note.id)}
                      variant="secondary"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200">
          <Button onClick={previousPhase} variant="secondary" className="flex-1">
            Back to Inspections
          </Button>
          <Button onClick={resetAgentFlow} variant="primary" className="flex-1">
            Complete & Start New
          </Button>
        </div>
      </div>
    </div>
  );
}