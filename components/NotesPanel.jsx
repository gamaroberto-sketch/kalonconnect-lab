"use client";

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, FileText, Trash2, Plus, Search } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const NotesPanel = () => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: "Anotações",
      content: "Cliente demonstrou interesse em técnicas de relaxamento...",
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString()
    }
  ]);
  const [activeNote, setActiveNote] = useState(notes[0]?.id || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentNote = notes.find(note => note.id === activeNote);

  const panelBackground =
    themeColors.secondary || themeColors.secondaryDark || '#c5c6b7';
  const cardBackground = themeColors.background || '#ffffff';
  const surfaceMuted = themeColors.backgroundSecondary || '#f8fafc';
  const borderColor = themeColors.border || '#d1d5db';
  const primaryColor = themeColors.primary || '#0f172a';
  const textPrimary = themeColors.textPrimary || '#1f2937';
  const textSecondary = themeColors.textSecondary || '#4b5563';

  const handleNewNote = () => {
    const newNote = {
      id: Date.now(),
      title: "Nova Nota",
      content: "",
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString()
    };
    setNotes([newNote, ...notes]);
    setActiveNote(newNote.id);
    setIsEditing(true);
    setEditTitle(newNote.title);
    setEditContent(newNote.content);
  };

  const handleEditNote = () => {
    if (currentNote) {
      setIsEditing(true);
      setEditTitle(currentNote.title);
      setEditContent(currentNote.content);
    }
  };

  const handleSaveNote = () => {
    if (activeNote) {
      setNotes(notes.map(note =>
        note.id === activeNote
          ? {
              ...note,
              title: editTitle,
              content: editContent,
              updatedAt: new Date().toLocaleString()
            }
          : note
      ));
      setIsEditing(false);
    }
  };

  const handleDeleteNote = (noteId) => {
    setNotes(notes.filter(note => note.id !== noteId));
    if (activeNote === noteId) {
      setActiveNote(notes.length > 1 ? notes[0].id : null);
    }
  };

  const handleSelectNote = (noteId) => {
    setActiveNote(noteId);
    setIsEditing(false);
  };

  return (
    <div
      className="flex h-full"
      style={{
        backgroundColor: panelBackground,
        color: textPrimary
      }}
    >
      {/* Sidebar com lista de notas */}
      <div
        className="w-1/3 flex flex-col"
        style={{
          borderRight: `1px solid ${borderColor}`,
          backgroundColor: panelBackground
        }}
      >
        {/* Header */}
        <div
          className="p-3"
          style={{
            borderBottom: `1px solid ${borderColor}`,
            backgroundColor: cardBackground
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold" style={{ color: textPrimary }}>
              Notas
            </h3>
            <button
              onClick={handleNewNote}
              className="p-1 rounded transition-colors"
              style={{ color: primaryColor }}
              title="Nova Nota"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 w-4 h-4" style={{ color: textSecondary }} />
            <input
              type="text"
              placeholder="Buscar notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg focus:ring-2 focus:ring-offset-0 focus:ring-[var(--input-ring-color)]"
              style={{
                '--input-ring-color': primaryColor,
                border: `1px solid ${borderColor}`,
                backgroundColor: surfaceMuted,
                color: textPrimary
              }}
            />
          </div>
        </div>

        {/* Lista de notas */}
        <div
          className="flex-1 overflow-y-auto"
          style={{
            backgroundColor: panelBackground
          }}
        >
          {filteredNotes.map((note) => {
            const isActive = activeNote === note.id;
            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 cursor-pointer transition-colors rounded-md"
                style={{
                  borderBottom: `1px solid ${borderColor}`,
                  backgroundColor: isActive
                    ? `${primaryColor}15`
                    : cardBackground
                }}
                onClick={() => handleSelectNote(note.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4
                      className="font-medium text-sm truncate"
                      style={{ color: textPrimary }}
                    >
                      {note.title}
                    </h4>
                    <p
                      className="text-xs mt-1"
                      style={{ color: textSecondary }}
                    >
                      {note.updatedAt}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                    className="p-1 rounded transition-colors"
                    style={{ color: themeColors.error || '#dc2626' }}
                    title="Excluir nota"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Editor de notas */}
      <div
        className="flex-1 flex flex-col"
        style={{
          backgroundColor: panelBackground
        }}
      >
        {currentNote ? (
          <>
            {/* Header do editor */}
            <div
              className="p-3 flex items-center justify-between"
              style={{
                borderBottom: `1px solid ${borderColor}`,
                backgroundColor: cardBackground
              }}
            >
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full font-semibold bg-transparent border-none outline-none"
                    style={{ color: textPrimary }}
                    placeholder="Título da nota..."
                  />
                ) : (
                  <h3 className="font-semibold" style={{ color: textPrimary }}>
                    {currentNote.title}
                  </h3>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <button
                    onClick={handleSaveNote}
                    className="p-2 rounded-lg text-white transition-colors"
                    style={{ backgroundColor: primaryColor }}
                    title="Salvar"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleEditNote}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: textSecondary }}
                    title="Editar"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Editor de conteúdo */}
            <div
              className="flex-1 p-3 rounded-b-xl"
              style={{ backgroundColor: cardBackground }}
            >
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full min-h-[200px] resize-none border-none outline-none"
                  style={{
                    color: textPrimary,
                    backgroundColor: surfaceMuted
                  }}
                  placeholder="Digite o conteúdo da nota..."
                />
              ) : (
                <div
                  className="w-full whitespace-pre-wrap"
                  style={{ color: textPrimary }}
                >
                  {currentNote.content || 'Esta nota está vazia. Clique em editar para adicionar conteúdo.'}
                </div>
              )}
            </div>
          </>
        ) : (
          <div
            className="flex-1 flex items-center justify-center"
            style={{ color: textSecondary }}
          >
            <div className="text-center space-y-2">
              <FileText className="w-12 h-12 mx-auto opacity-50" />
              <p>Nenhuma nota selecionada</p>
              <p className="text-sm">Crie uma nova nota para começar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesPanel;







