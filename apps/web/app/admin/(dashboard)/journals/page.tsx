"use client";

import { useState, useEffect } from "react";
import { adminApiFetch } from "@/lib/admin-api";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Check, X, BookOpen, PenTool, UploadCloud, Image as ImageIcon } from "lucide-react";
import { TipTapEditor } from "@/components/admin/TipTapEditor"; // We have this already

export default function JournalsAdminPage() {
    const [journals, setJournals] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingJournal, setEditingJournal] = useState<any>(null);

    // Form states
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [coverImage, setCoverImage] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [content, setContent] = useState("");
    const [isPublished, setIsPublished] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        fetchJournals();
    }, []);

    const fetchJournals = async () => {
        setIsLoading(true);
        try {
            const res = await adminApiFetch("/admin/journals");
            if (res.ok) {
                const data = await res.json();
                setJournals(data);
            }
        } catch (error) {
            toast.error("Failed to load journals");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTitleChange = (val: string) => {
        setTitle(val);
        if (!editingJournal) {
            // Auto-generate slug
            setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
    };

    const deleteFromS3 = async (url: string) => {
        if (!url || !url.includes('takshstore.com')) return;
        try {
            await adminApiFetch('admin/upload', {
                method: 'DELETE',
                body: JSON.stringify({ url }),
            });
        } catch (e) {
            console.error('Failed to purge from S3', e);
        }
    };

    const handleSave = async () => {
        if (!title.trim() || !slug.trim() || !content.trim()) {
            toast.error("Title, slug, and content are required.");
            return;
        }

        setIsSaving(true);
        try {
            let finalImageUrl = coverImage;
            
            if (selectedFile) {
                toast.loading('Uploading cover image...', { id: 'upload-img' });
                
                // Cleanup previous image if it was on our domain
                if (coverImage) await deleteFromS3(coverImage);

                const formData = new FormData();
                formData.append('file', selectedFile);
                
                const uploadRes = await adminApiFetch('/admin/upload', {
                    method: 'POST',
                    body: formData,
                });
                
                if (!uploadRes.ok) throw new Error('Image upload failed');
                
                const uploadData = await uploadRes.json();
                finalImageUrl = uploadData.url;
                toast.success('Image uploaded successfully', { id: 'upload-img' });
            }

            const payload = { title, slug, coverImage: finalImageUrl, excerpt, content, isPublished };
            let res;

            if (editingJournal) {
                res = await adminApiFetch(`/admin/journals/${editingJournal.id}`, {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                });
            } else {
                res = await adminApiFetch("/admin/journals", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
            }

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Failed to save journal");
            }

            toast.success(editingJournal ? "Journal updated!" : "Journal created!");
            setIsFormOpen(false);
            fetchJournals();
        } catch (err: any) {
            toast.dismiss('upload-img');
            toast.error(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this journal?")) return;
        
        const journalToDelete = journals.find(j => j.id === id);
        
        try {
            const res = await adminApiFetch(`/admin/journals/${id}`, { method: "DELETE" });
            if (res.ok) {
                // If deletion successful, cleanup storage
                if (journalToDelete?.coverImage) {
                    await deleteFromS3(journalToDelete.coverImage);
                }
                
                toast.success("Journal deleted");
                fetchJournals();
            } else {
                toast.error("Failed to delete journal");
            }
        } catch (error) {
            toast.error("Server error when deleting journal");
        }
    };

    const openCreateForm = () => {
        setEditingJournal(null);
        setTitle("");
        setSlug("");
        setCoverImage("");
        setExcerpt("");
        setContent("");
        setIsPublished(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsFormOpen(true);
    };

    const openEditForm = (journal: any) => {
        setEditingJournal(journal);
        setTitle(journal.title);
        setSlug(journal.slug);
        setCoverImage(journal.coverImage || "");
        setExcerpt(journal.excerpt || "");
        setContent(journal.content);
        setIsPublished(journal.isPublished);
        setSelectedFile(null);
        setPreviewUrl(journal.coverImage || null);
        setIsFormOpen(true);
    };

    if (isLoading) {
        return <div className="p-8 text-gray-500 animate-pulse">Loading Journals...</div>;
    }

    if (isFormOpen) {
        return (
            <div className="max-w-4xl mx-auto pb-24">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{editingJournal ? 'Edit Journal Entry' : 'New Journal Entry'}</h1>
                        <p className="text-gray-500 text-sm mt-1">Compose immersive reading experiences.</p>
                    </div>
                    <button onClick={() => setIsFormOpen(false)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4 md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700">Title <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                placeholder="Enter an engaging title..."
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-gray-700">URL Slug <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                placeholder="seo-friendly-slug"
                            />
                        </div>

                        <div className="space-y-4 md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700">Cover Image</label>
                            <div className="flex flex-col sm:flex-row gap-6 items-start">
                                <div className="flex-1 w-full space-y-3">
                                    <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-8 hover:bg-gray-50 transition-colors text-center group cursor-pointer bg-white">
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setSelectedFile(file);
                                                    setPreviewUrl(URL.createObjectURL(file));
                                                    setCoverImage(""); // Clear manual url
                                                }
                                            }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                <UploadCloud size={24} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">Click to upload image</span>
                                            <span className="text-xs text-gray-500">SVG, PNG, JPG or GIF (max. 5MB)</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-px bg-gray-200 flex-1" />
                                        <span className="text-xs font-semibold text-gray-400 tracking-wider">OR ENTER URL</span>
                                        <div className="h-px bg-gray-200 flex-1" />
                                    </div>
                                    <input
                                        type="url"
                                        value={coverImage}
                                        onChange={(e) => {
                                            setCoverImage(e.target.value);
                                            setSelectedFile(null);
                                            setPreviewUrl(null);
                                        }}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                                {(previewUrl || coverImage) && (
                                    <div className="w-full sm:w-64 aspect-video rounded-xl border border-gray-200 overflow-hidden relative bg-gray-50 shrink-0 shadow-sm">
                                        <img 
                                            src={previewUrl || coverImage} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                            onLoad={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'block';
                                            }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center -z-10 text-gray-400">
                                            <ImageIcon size={32} opacity={0.5} />
                                        </div>
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setSelectedFile(null);
                                                setPreviewUrl(null);
                                                setCoverImage("");
                                            }}
                                            className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-rose-600 hover:bg-white shadow-sm transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700">Excerpt (Short summary)</label>
                            <textarea
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                rows={2}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
                                placeholder="A brief, captivating snippet to display on the homepage cards..."
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <label className="block text-sm font-semibold text-gray-700">Full Content <span className="text-red-500">*</span></label>
                        <div className="border border-gray-200 rounded-xl overflow-hidden min-h-[400px]">
                            <TipTapEditor content={content} onChange={setContent} />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4 sm:gap-0 items-start sm:items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${isPublished ? 'bg-emerald-500' : 'bg-gray-300'}`} onClick={() => setIsPublished(!isPublished)}>
                                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${isPublished ? 'translate-x-5' : 'translate-x-1'}`} />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{isPublished ? 'Published (Live)' : 'Draft Mode'}</span>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-black text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-gray-900 transition-colors font-semibold tracking-wide disabled:opacity-50 bg-gray whitespace-nowrap justify-center w-full sm:w-auto"
                        >
                            <PenTool size={16} />
                            {isSaving ? "Saving..." : (editingJournal ? "Update Entry" : "Publish Entry")}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-gray-900 flex items-center gap-2 sm:gap-3 uppercase">
                        <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 shrink-0 text-teal-600" /> Journal Management
                    </h1>
                    <p className="text-gray-500 font-medium mt-1 uppercase tracking-widest  text-sm sm:text-base">Curate stories, announcements, and featured projects.</p>
                </div>
                <button
                    onClick={openCreateForm}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-900 rounded-lg shadow-sm font-semibold text-sm transition-colors bg-gray whitespace-nowrap justify-center w-full sm:w-auto"
                >
                    <Plus size={16} /> New Journal Entry
                </button>
            </div>

            {journals.length === 0 ? (
                <div className="bg-white border rounded-xl p-16 text-center shadow-sm">
                    <BookOpen size={48} className="mx-auto text-gray-200 mb-4" />
                    <h3 className="text-gray-900 font-semibold mb-1">No journals yet</h3>
                    <p className="text-gray-500 text-sm mb-6">Start composing rich editorial content to engage your audience.</p>
                    <button onClick={openCreateForm} className="text-indigo-600 font-medium hover:text-indigo-700">Write your first post &rarr;</button>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50/50 text-gray-500 uppercase text-xs tracking-wider border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Title</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Created</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {journals.map((journal) => (
                                    <tr key={journal.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {journal.coverImage ? (
                                                    <img src={journal.coverImage} className="w-10 h-10 object-cover rounded shadow-sm border border-gray-100" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 border border-gray-200">
                                                        <BookOpen size={16} />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-semibold text-gray-900">{journal.title}</div>
                                                    <div className="text-xs text-gray-500">/{journal.slug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {journal.isPublished ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                                    <Check size={12} /> Published
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                                    Draft
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(journal.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEditForm(journal)} className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(journal.id)} className="text-gray-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
