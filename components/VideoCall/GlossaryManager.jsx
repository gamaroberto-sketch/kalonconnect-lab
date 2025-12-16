import { useState } from 'react';
import { X, Plus, Download, Upload, Trash2, Edit2, Check } from 'lucide-react';
import { useGlossary } from '../../hooks/useGlossary';
import { useTheme } from '../ThemeProvider';

export default function GlossaryManager({ onClose }) {
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();
    const {
        glossary,
        addTerm,
        removeTerm,
        updateTerm,
        importFromCSV,
        exportToCSV,
        clearAll
    } = useGlossary();

    const [newTerm, setNewTerm] = useState({
        term: '',
        translation: '',
        category: 'general'
    });
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [csvText, setCsvText] = useState('');
    const [showImport, setShowImport] = useState(false);

    const primary = themeColors?.primary || '#0f172a';
    const background = themeColors?.background || '#ffffff';
    const textPrimary = themeColors?.textPrimary || '#1f2937';
    const textSecondary = themeColors?.textSecondary || '#6b7280';
    const border = themeColors?.border || '#e5e7eb';

    const categories = [
        { value: 'general', label: 'Geral', icon: '📝' },
        { value: 'medical', label: 'Médico', icon: '⚕️' },
        { value: 'name', label: 'Nome Próprio', icon: '👤' },
        { value: 'jargon', label: 'Jargão', icon: '💬' },
        { value: 'acronym', label: 'Sigla', icon: '🔤' }
    ];

    const handleAdd = () => {
        if (newTerm.term && newTerm.translation) {
            addTerm(newTerm);
            setNewTerm({ term: '', translation: '', category: 'general' });
        }
    };

    const handleImport = () => {
        const count = importFromCSV(csvText);
        alert(`${count} termos importados com sucesso!`);
        setCsvText('');
        setShowImport(false);
    };

    const filteredGlossary = glossary.filter(term => {
        const matchesSearch = term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
            term.translation.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || term.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div
                className="w-full max-w-3xl rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
                style={{ backgroundColor: background }}
            >
                {/* Header */}
                <div
                    className="p-6 border-b flex items-center justify-between"
                    style={{ borderColor: border }}
                >
                    <div>
                        <h2 className="text-2xl font-bold" style={{ color: textPrimary }}>
                            🔤 Glossário Personalizado
                        </h2>
                        <p className="text-sm mt-1" style={{ color: textSecondary }}>
                            Melhore suas traduções com termos personalizados
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" style={{ color: textSecondary }} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Add New Term */}
                    <div
                        className="rounded-lg p-4 border"
                        style={{ borderColor: border, backgroundColor: `${primary}05` }}
                    >
                        <h3 className="text-sm font-semibold mb-3" style={{ color: primary }}>
                            ➕ Adicionar Novo Termo
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input
                                type="text"
                                placeholder="Termo original"
                                value={newTerm.term}
                                onChange={(e) => setNewTerm({ ...newTerm, term: e.target.value })}
                                className="px-3 py-2 rounded-lg border outline-none focus:ring-2"
                                style={{
                                    borderColor: border,
                                    backgroundColor: background,
                                    color: textPrimary
                                }}
                            />
                            <input
                                type="text"
                                placeholder="Tradução"
                                value={newTerm.translation}
                                onChange={(e) => setNewTerm({ ...newTerm, translation: e.target.value })}
                                className="px-3 py-2 rounded-lg border outline-none focus:ring-2"
                                style={{
                                    borderColor: border,
                                    backgroundColor: background,
                                    color: textPrimary
                                }}
                            />
                            <div className="flex gap-2">
                                <select
                                    value={newTerm.category}
                                    onChange={(e) => setNewTerm({ ...newTerm, category: e.target.value })}
                                    className="flex-1 px-3 py-2 rounded-lg border outline-none"
                                    style={{
                                        borderColor: border,
                                        backgroundColor: background,
                                        color: textPrimary
                                    }}
                                >
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.icon} {cat.label}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleAdd}
                                    className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                    style={{ backgroundColor: primary, color: '#ffffff' }}
                                    onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filters and Actions */}
                    <div className="flex flex-wrap gap-3 items-center justify-between">
                        <div className="flex gap-3 flex-1">
                            <input
                                type="text"
                                placeholder="🔍 Buscar..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg border outline-none"
                                style={{
                                    borderColor: border,
                                    backgroundColor: background,
                                    color: textPrimary
                                }}
                            />
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="px-3 py-2 rounded-lg border outline-none"
                                style={{
                                    borderColor: border,
                                    backgroundColor: background,
                                    color: textPrimary
                                }}
                            >
                                <option value="all">Todas Categorias</option>
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.icon} {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowImport(!showImport)}
                                className="px-3 py-2 rounded-lg border transition-colors flex items-center gap-2 text-sm"
                                style={{ borderColor: primary, color: primary }}
                            >
                                <Upload className="w-4 h-4" />
                                Importar
                            </button>
                            <button
                                onClick={exportToCSV}
                                className="px-3 py-2 rounded-lg border transition-colors flex items-center gap-2 text-sm"
                                style={{ borderColor: primary, color: primary }}
                            >
                                <Download className="w-4 h-4" />
                                Exportar
                            </button>
                        </div>
                    </div>

                    {/* Import CSV Section */}
                    {showImport && (
                        <div
                            className="rounded-lg p-4 border"
                            style={{ borderColor: border }}
                        >
                            <h4 className="text-sm font-semibold mb-2" style={{ color: textPrimary }}>
                                Importar CSV
                            </h4>
                            <p className="text-xs mb-3" style={{ color: textSecondary }}>
                                Formato: termo,tradução,categoria (uma por linha)
                            </p>
                            <textarea
                                value={csvText}
                                onChange={(e) => setCsvText(e.target.value)}
                                placeholder="anamnese,medical history,medical&#10;TDAH,ADHD,acronym"
                                className="w-full px-3 py-2 rounded-lg border outline-none font-mono text-sm"
                                rows={4}
                                style={{
                                    borderColor: border,
                                    backgroundColor: background,
                                    color: textPrimary
                                }}
                            />
                            <button
                                onClick={handleImport}
                                className="mt-2 px-4 py-2 rounded-lg transition-colors"
                                style={{ backgroundColor: primary, color: '#ffffff' }}
                            >
                                Importar Termos
                            </button>
                        </div>
                    )}

                    {/* Glossary List */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold" style={{ color: textPrimary }}>
                                📚 Termos ({filteredGlossary.length})
                            </h3>
                            {glossary.length > 0 && (
                                <button
                                    onClick={() => {
                                        if (confirm('Tem certeza que deseja limpar todo o glossário?')) {
                                            clearAll();
                                        }
                                    }}
                                    className="text-xs px-3 py-1 rounded-lg border transition-colors flex items-center gap-1"
                                    style={{ borderColor: '#ef4444', color: '#ef4444' }}
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Limpar Tudo
                                </button>
                            )}
                        </div>

                        {filteredGlossary.length === 0 ? (
                            <div
                                className="text-center py-12 rounded-lg border-2 border-dashed"
                                style={{ borderColor: border }}
                            >
                                <p style={{ color: textSecondary }}>
                                    Nenhum termo no glossário ainda.
                                </p>
                                <p className="text-sm mt-1" style={{ color: textSecondary }}>
                                    Adicione termos acima para melhorar suas traduções!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredGlossary.map(term => (
                                    <div
                                        key={term.id}
                                        className="p-3 rounded-lg border flex items-center justify-between"
                                        style={{ borderColor: border }}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium" style={{ color: textPrimary }}>
                                                    {term.term}
                                                </span>
                                                <span style={{ color: textSecondary }}>→</span>
                                                <span className="text-sm" style={{ color: textSecondary }}>
                                                    {term.translation}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span
                                                    className="text-xs px-2 py-0.5 rounded"
                                                    style={{ backgroundColor: `${primary}15`, color: primary }}
                                                >
                                                    {categories.find(c => c.value === term.category)?.icon}{' '}
                                                    {categories.find(c => c.value === term.category)?.label}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => removeTerm(term.id)}
                                                className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div
                    className="p-4 border-t flex justify-end"
                    style={{ borderColor: border }}
                >
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg transition-colors"
                        style={{ backgroundColor: primary, color: '#ffffff' }}
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
