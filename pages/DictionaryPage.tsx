import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useAuth } from '../hooks/useAuth';
import { dictionaryService } from '../services/dictionaryService';
import { PencilIcon } from '../components/icons/PencilIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { CheckIcon } from '../components/icons/CheckIcon';
import { XMarkIcon } from '../components/icons/XMarkIcon';

type Dictionary = Record<string, string>;

const DictionaryPage: React.FC = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const [dictionary, setDictionary] = useState<Dictionary>({});
  const [originalWord, setOriginalWord] = useState('');
  const [replacementWord, setReplacementWord] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [addWordError, setAddWordError] = useState('');
  
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editData, setEditData] = useState({ original: '', replacement: '' });

  const loadDictionary = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      try {
        const dict = await dictionaryService.getDictionary(user.id);
        setDictionary(dict);
      } catch (error) {
        console.error("Failed to load dictionary", error);
      }
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDictionary();
  }, [loadDictionary]);

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddWordError('');
    const trimmedOriginal = originalWord.trim();

    if (!trimmedOriginal || !replacementWord.trim()) {
      return;
    }

    if (Object.prototype.hasOwnProperty.call(dictionary, trimmedOriginal)) {
      setAddWordError(t('dictionary.error.alreadyExists'));
      return;
    }

    if (user && !isMutating) {
      setIsMutating(true);
      await dictionaryService.addWord(user.id, trimmedOriginal, replacementWord.trim());
      setOriginalWord('');
      setReplacementWord('');
      await loadDictionary();
      setIsMutating(false);
    }
  };

  const handleDeleteWord = async (word: string) => {
    if (user && !isMutating && window.confirm(`Are you sure you want to delete "${word}"?`)) {
      setIsMutating(true);
      await dictionaryService.deleteWord(user.id, word);
      await loadDictionary();
      setIsMutating(false);
    }
  };

  const handleEditStart = (original: string, replacement: string) => {
    setEditingKey(original);
    setEditData({ original, replacement });
  };

  const handleSaveEdit = async () => {
    if (!user || !editingKey || !editData.original.trim() || !editData.replacement.trim()) return;
    
    // Check if the new original word already exists (and it's not the same as the one being edited)
    if (editData.original.trim() !== editingKey && Object.prototype.hasOwnProperty.call(dictionary, editData.original.trim())) {
        alert(t('dictionary.error.alreadyExists'));
        return;
    }

    setIsMutating(true);
    try {
        // If the original word (the key) has changed, we must delete the old entry and add a new one.
        if (editingKey !== editData.original.trim()) {
            await dictionaryService.deleteWord(user.id, editingKey);
        }
        // Use addWord (which upserts) for both creating the new entry and updating an existing one.
        await dictionaryService.addWord(user.id, editData.original.trim(), editData.replacement.trim());
        setEditingKey(null);
        await loadDictionary();
    } catch(err) {
        console.error("Failed to save edit:", err);
    } finally {
        setIsMutating(false);
    }
  };
  
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    setImportStatus({type: 'success', message: t('dictionary.import.processing')});
    setIsMutating(true);
    
    try {
      const content = await file.text();
      const lines = content.split(/\r?\n/);
      
      const words = lines
        .map(line => {
            const parts = line.split(/[,\t]/);
            const original = parts[0]?.trim();
            const replacement = parts[1]?.trim();
            if (original && replacement) {
                return [original, replacement];
            }
            return null;
        })
        .filter((pair): pair is [string, string] => pair !== null);


      if (words.length > 0) {
        await dictionaryService.bulkAddWords(user.id, Object.fromEntries(words));
        setImportStatus({ type: 'success', message: t('dictionary.import.success', { count: words.length }) });
        await loadDictionary();
      } else {
        throw new Error("No valid word pairs found in file.");
      }
    } catch (error) {
      console.error("File import failed:", error);
      const message = error instanceof Error ? error.message : t('dictionary.import.error');
      setImportStatus({ type: 'error', message });
    } finally {
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setIsMutating(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="animate-fade-in-down">
        <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-2">{t('dictionary.title')}</h1>
        <p className="text-text-secondary dark:text-dark-text-secondary mb-8">{t('dictionary.subtitle')}</p>
      </div>

      {importStatus && (
        <div className={`p-3 rounded mb-6 text-center border animate-fade-in ${importStatus.type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
          {importStatus.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-secondary dark:bg-dark-secondary p-8 rounded-lg shadow-lg animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-4">{t('dictionary.add.title')}</h2>
            <form onSubmit={handleAddWord} className="space-y-4">
            {addWordError && <div className="bg-red-500/10 text-red-500 text-sm p-3 rounded text-center border border-red-500/20">{addWordError}</div>}
            <div>
                <label className="block text-sm font-bold mb-2" htmlFor="originalWord">{t('dictionary.add.original')}</label>
                <input id="originalWord" type="text" value={originalWord} onChange={(e) => { setOriginalWord(e.target.value); if(addWordError) setAddWordError(''); }}
                className="w-full p-2 bg-accent dark:bg-dark-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"/>
            </div>
            <div>
                <label className="block text-sm font-bold mb-2" htmlFor="replacementWord">{t('dictionary.add.replacement')}</label>
                <input id="replacementWord" type="text" value={replacementWord} onChange={(e) => setReplacementWord(e.target.value)}
                className="w-full p-2 bg-accent dark:bg-dark-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"/>
            </div>
            <button type="submit" disabled={isMutating} className="w-full bg-highlight text-white font-bold py-2 px-4 rounded-lg hover:bg-highlight-hover transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                {isMutating ? '...' : t('dictionary.add.button')}
            </button>
            </form>
        </div>
        <div className="bg-secondary dark:bg-dark-secondary p-8 rounded-lg shadow-lg animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-4">{t('dictionary.import.title')}</h2>
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-4">{t('dictionary.import.description')}</p>
            <input type="file" accept=".txt,.csv" onChange={handleFileImport} ref={fileInputRef} className="hidden" id="file-upload" disabled={isMutating} />
            <label htmlFor="file-upload" className={`w-full text-center cursor-pointer block bg-highlight text-white font-bold py-2 px-4 rounded-lg hover:bg-highlight-hover transition-colors active:scale-95 ${isMutating ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {isMutating ? t('dictionary.import.processing') : t('dictionary.import.button')}
            </label>
        </div>
      </div>
      
      <div className="bg-secondary dark:bg-dark-secondary p-6 rounded-lg shadow-lg animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          {isLoading ? <p className="text-center text-text-secondary dark:text-dark-text-secondary py-8">Loading...</p> :
           Object.keys(dictionary).length === 0 ? (
                <p className="text-center text-text-secondary dark:text-dark-text-secondary py-8">{t('dictionary.empty')}</p>
          ) : (
             <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                    <thead className="text-xs text-text-primary dark:text-dark-text-primary uppercase bg-accent dark:bg-dark-accent">
                        <tr>
                            <th scope="col" className="px-6 py-3">{t('dictionary.table.original')}</th>
                            <th scope="col" className="px-6 py-3">{t('dictionary.table.replacement')}</th>
                            <th scope="col" className="px-6 py-3 text-end">{t('dictionary.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(dictionary).map(([original, replacement], index) => (
                            <tr 
                              key={original} 
                              className="border-b border-accent dark:border-dark-accent animate-fade-in"
                              style={{ animationDelay: `${index * 30}ms`, animationDuration: '300ms' }}
                            >
                                {editingKey === original ? (
                                    <>
                                        <td className="px-6 py-2">
                                            <input type="text" value={editData.original} onChange={(e) => setEditData({...editData, original: e.target.value})} className="w-full p-2 bg-accent dark:bg-dark-accent rounded-md"/>
                                        </td>
                                        <td className="px-6 py-2">
                                            <input type="text" value={editData.replacement} onChange={(e) => setEditData({...editData, replacement: e.target.value})} className="w-full p-2 bg-accent dark:bg-dark-accent rounded-md"/>
                                        </td>
                                        <td className="px-6 py-2 text-end">
                                            <div className="flex justify-end items-center gap-2">
                                                <button onClick={handleSaveEdit} disabled={isMutating} title={t('dictionary.save')} className="p-2 text-green-500 hover:bg-green-500/10 rounded-full"><CheckIcon className="w-5 h-5"/></button>
                                                <button onClick={() => setEditingKey(null)} disabled={isMutating} title={t('planManagement.cancel')} className="p-2 text-text-secondary hover:bg-gray-500/10 rounded-full"><XMarkIcon className="w-5 h-5"/></button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-6 py-4 font-medium">{original}</td>
                                        <td className="px-6 py-4">{String(replacement)}</td>
                                        <td className="px-6 py-4 text-end">
                                            <div className="flex justify-end items-center gap-2">
                                                <button onClick={() => handleEditStart(original, String(replacement))} disabled={isMutating} title={t('dictionary.edit')} className="p-2 text-highlight hover:bg-highlight/10 rounded-full">
                                                    <PencilIcon className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleDeleteWord(original)} disabled={isMutating} title={t('dictionary.delete')} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full">
                                                    <TrashIcon className="w-5 h-5"/>
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          )}
      </div>
    </div>
  );
};

export default DictionaryPage;