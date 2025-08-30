import React, { useEffect, useState } from "react";
import { Trash2, Plus, X, Save } from "lucide-react";
import logo from "../assets/icon.png";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface Note {
  id: string;
  title: string;
  content?: string;
  createdAt?: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");

  // Load notes from localStorage on component mount
  useEffect(() => {
    const storedNotes = localStorage.getItem("userNotes");
    if (storedNotes) {
      try {
        setNotes(JSON.parse(storedNotes));
      } catch (e) {
        console.error("Error parsing stored notes:", e);
      }
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem("userNotes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (!token) {
      navigate("/signup");
      return;
    }
  }, [token, navigate]);

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  const createNote = () => {
    if (!newNoteTitle.trim()) {
      setError("Note title is required");
      return;
    }

    const newNote: Note = {
      id: Date.now().toString(),
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      createdAt: new Date().toISOString(),
    };

    setNotes([newNote, ...notes]);
    setNewNoteTitle("");
    setNewNoteContent("");
    setShowCreateModal(false);
    setError(null);
  };

  const handleCreateModalClose = () => {
    setShowCreateModal(false);
    setNewNoteTitle("");
    setNewNoteContent("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Container */}
      <div className="max-w-sm mx-auto bg-white min-h-screen relative">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-4 bg-white">
          <div className="flex items-center">
            <div className="w-8 h-8 mr-3 flex items-center justify-center">
              <img src={logo} alt="logo" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          </div>
          <button onClick={logout} className="text-blue-500 font-medium">
            Sign Out
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-20">
          {/* Welcome Card */}
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Welcome{user ? `, ${user.name}` : ""}!
            </h2>
            <p className="text-gray-600 text-sm">Email: {user?.email || "-"}</p>
          </div>

          {/* Create Note Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-4 rounded-xl transition-colors duration-200 mb-6 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Note
          </button>

          {/* Notes Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
            <div className="space-y-3">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
                  {error}
                </div>
              )}
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white p-4 rounded-lg border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-gray-900 font-medium text-lg">
                      {note.title}
                    </h4>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {note.content && (
                    <p className="text-gray-600 text-sm mb-2">{note.content}</p>
                  )}
                  {note.createdAt && (
                    <p className="text-gray-400 text-xs">
                      {new Date(note.createdAt).toLocaleDateString()} at{" "}
                      {new Date(note.createdAt).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              ))}

              {notes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No notes yet. Create your first note!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Home Indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="w-32 h-1 bg-gray-900 rounded-full"></div>
        </div>

        {/* Create Note Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Create New Note
                </h3>
                <button
                  onClick={handleCreateModalClose}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="noteTitle"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Title
                  </label>
                  <input
                    id="noteTitle"
                    type="text"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    placeholder="Enter note title..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>

                <div>
                  <label
                    htmlFor="noteContent"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Content
                  </label>
                  <textarea
                    id="noteContent"
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Enter note content..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateModalClose}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createNote}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Note
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
