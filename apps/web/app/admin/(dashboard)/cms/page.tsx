"use client";

import { useState, useEffect } from 'react';
import { adminApiFetch } from '@/lib/admin-api';
import { TipTapEditor } from '@/components/admin/TipTapEditor';
import { FileText, MessageCircleQuestion, Plus, Trash2, ArrowUp, ArrowDown, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function CMSManagementPage() {
    const [activeTab, setActiveTab] = useState<'DOCUMENTS' | 'FAQS'>('DOCUMENTS');
    const [docs, setDocs] = useState<any[]>([]);
    const [faqs, setFaqs] = useState<any[]>([]);
    
    const [selectedDocSlug, setSelectedDocSlug] = useState<string>('privacy-policy');
    const [docContent, setDocContent] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    // FAQ specific
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDocs();
        fetchFaqs();
    }, []);

    useEffect(() => {
        const doc = docs.find(d => d.slug === selectedDocSlug);
        if (doc) setDocContent(doc.content);
    }, [selectedDocSlug, docs]);

    const fetchDocs = async () => {
        try {
            const res = await adminApiFetch('/admin/cms/documents');
            if (res.ok) setDocs(await res.json());
        } catch (e) {
            console.error('Docs err', e);
        }
    };

    const fetchFaqs = async () => {
        try {
            const res = await adminApiFetch('/admin/cms/faqs');
            if (res.ok) {
                const data = await res.json();
                setFaqs(data.sort((a: any, b: any) => a.displayOrder - b.displayOrder));
            }
        } catch (e) {
            console.error('FAQ err', e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveDocument = async () => {
        setIsSaving(true);
        try {
            const res = await adminApiFetch(`/admin/cms/documents/${selectedDocSlug}`, {
                method: 'PUT',
                body: JSON.stringify({ content: docContent })
            });

            if (!res.ok) throw new Error('Failed to save document');
            toast.success('Document changes successfully committed. Live instantly.');
            fetchDocs();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddFaq = async () => {
        const question = window.prompt("New FAQ Question:");
        if (!question) return;

        try {
            const res = await adminApiFetch('/admin/cms/faqs', {
                method: 'POST',
                body: JSON.stringify({ question, answer: '<p>Pending answer...</p>' })
            });
            if (res.ok) fetchFaqs();
        } catch (error: any) {
            toast.error('Failed to create FAQ');
        }
    };

    const handleUpdateFaqAnswer = async (id: string, answer: string) => {
        try {
            await adminApiFetch(`/admin/cms/faqs/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ answer })
            });
            toast.success('FAQ Answer saved.');
            fetchFaqs();
        } catch (e) {
             toast.error('Failed to save. Check logs.');
        }
    };

    const handleDeleteFaq = async (id: string) => {
        if (!window.confirm("Delete FAQ?")) return;
        try {
            await adminApiFetch(`/admin/cms/faqs/${id}`, { method: 'DELETE' });
            fetchFaqs();
        } catch (e) {}
    };

    const moveFaq = async (index: number, direction: 'UP' | 'DOWN') => {
        const newFaqs = [...faqs];
        if (direction === 'UP' && index > 0) {
            const temp = newFaqs[index].displayOrder;
            newFaqs[index].displayOrder = newFaqs[index - 1].displayOrder;
            newFaqs[index - 1].displayOrder = temp;
        } else if (direction === 'DOWN' && index < newFaqs.length - 1) {
            const temp = newFaqs[index].displayOrder;
            newFaqs[index].displayOrder = newFaqs[index + 1].displayOrder;
            newFaqs[index + 1].displayOrder = temp;
        } else {
            return;
        }

        const serializedPayload = newFaqs.map(f => ({ id: f.id, displayOrder: f.displayOrder }));
        setFaqs(newFaqs.sort((a: any, b: any) => a.displayOrder - b.displayOrder));

        try {
            await adminApiFetch('/admin/cms/faqs/reorder', {
                method: 'PATCH',
                body: JSON.stringify({ orders: serializedPayload })
            });
            toast.success('Ordering updated.')
        } catch (e) {}
    }


    return (
        <div className="space-y-6 animate-in slide-in-bottom duration-500 fade-in h-[calc(100vh-120px)] flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900">Content Engine</h1>
                  <p className="text-gray-500 text-sm mt-1">Manage core institutional assets spanning Legal constructs and FAQs globally.</p>
                </div>
            </div>

            {/* Config Tabs */}
            <div className="flex border-b border-gray-200 shrink-0">
                <button
                    onClick={() => setActiveTab('DOCUMENTS')}
                    className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
                        activeTab === 'DOCUMENTS' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                >
                    <FileText className="w-4 h-4" /> Legal Documents
                </button>
                <button
                    onClick={() => setActiveTab('FAQS')}
                    className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
                        activeTab === 'FAQS' ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50' : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                >
                    <MessageCircleQuestion className="w-4 h-4" /> Operations FAQs
                </button>
            </div>

            {/* Dynamic Interactive Plane */}
            <div className="flex-1 overflow-hidden">
               {activeTab === 'DOCUMENTS' && (
                   <div className="flex flex-col lg:flex-row h-[75%] gap-6">
                        {/* Legal Sidebar */}
                        <div className="w-full lg:w-64 shrink-0 border border-gray-200/80 rounded-xl bg-white xl:min-w-64">
                             <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 rounded-t-xl">
                                 <h3 className="font-bold text-xs uppercase text-gray-400 tracking-widest">Global Files</h3>
                             </div>
                             <div className="p-3 space-y-2">
                                 {docs.map(doc => (
                                     <button 
                                        key={doc.slug} 
                                        onClick={() => setSelectedDocSlug(doc.slug)}
                                        className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all shadow-sm ${selectedDocSlug === doc.slug ? 'bg-indigo-600 text-white border border-indigo-700' : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-white hover:border-gray-300'}`}
                                     >
                                         {doc.title}
                                     </button>
                                 ))}
                             </div>
                        </div>

                        {/* Editor Window */}
                        <div className="flex-1 flex flex-col h-full bg-white rounded-xl shadow-lg border border-gray-200">
                             <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                                 <h2 className="font-bold text-gray-900 tracking-tight">{docs.find(d => d.slug === selectedDocSlug)?.title || 'Editor'} File</h2>
                                 <button 
                                     onClick={handleSaveDocument}
                                     disabled={isSaving}
                                     className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"
                                 >
                                     <Save className="w-4 h-4" /> {isSaving ? 'Synchronizing File...' : 'Commit Version Updates'}
                                 </button>
                             </div>
                             <div className="p-4 flex-1 h-full min-h-0 bg-gray-50/30">
                                 <TipTapEditor content={docContent} onChange={setDocContent} />
                             </div>
                        </div>
                   </div>
               )}

               {activeTab === 'FAQS' && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 h-full flex flex-col">
                       <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
                             <h2 className="font-bold text-gray-900 tracking-tight">FAQ List (Ordered display)</h2>
                             <button 
                                 onClick={handleAddFaq}
                                 className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                             >
                                 <Plus className="w-4 h-4" /> Add Standard FAQ
                             </button>
                       </div>
                       <div className="p-6 overflow-y-auto space-y-6">
                           {isLoading ? <p className="text-sm font-semibold text-gray-500">Retrieving index...</p> : faqs.map((faq, index) => (
                               <div key={faq.id} className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white hover:border-emerald-300 transition-colors">
                                   <div className="flex items-start justify-between mb-4">
                                      <div className="flex items-center gap-4">
                                          <div className="flex flex-col gap-1 items-center bg-gray-50 border border-gray-100 p-1.5 rounded-lg">
                                             <button onClick={() => moveFaq(index, 'UP')} disabled={index === 0} className="p-1 hover:bg-gray-200 text-gray-500 hover:text-gray-900 rounded disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button>
                                             <span className="text-[10px] font-extrabold text-gray-400">{faq.displayOrder}</span>
                                             <button onClick={() => moveFaq(index, 'DOWN')} disabled={index === faqs.length - 1} className="p-1 hover:bg-gray-200 text-gray-500 hover:text-gray-900 rounded disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /></button>
                                          </div>
                                          <div>
                                              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1.5">Question Text</p>
                                              <input type="text" className="text-lg font-bold text-gray-900 bg-transparent outline-none border-b border-transparent focus:border-gray-200 w-full min-w-[300px]" defaultValue={faq.question} onBlur={(e) => {
                                                  // Optional: Can tie question updates later using the same endpoint.
                                                  adminApiFetch(`/admin/cms/faqs/${faq.id}`, { method: 'PUT', body: JSON.stringify({ question: e.target.value })})
                                              }} />
                                          </div>
                                      </div>
                                      <button onClick={() => handleDeleteFaq(faq.id)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors border border-transparent hover:border-red-100">
                                         <Trash2 className="w-[18px] h-[18px]" />
                                      </button>
                                   </div>

                                   <div className="ml-16 pr-8">
                                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Rich HTML Answer Configuration</p>
                                       <div className="h-64 border border-gray-200 rounded-xl overflow-hidden box-border">
                                            <TipTapEditor content={faq.answer} onChange={(html) => {
                                                const newFaqs = [...faqs];
                                                newFaqs[index].answer = html;
                                                setFaqs(newFaqs);
                                            }} />
                                       </div>
                                       <button onClick={() => handleUpdateFaqAnswer(faq.id, faqs[index].answer)} className="mt-4 px-4 py-2 bg-black hover:bg-gray-800 text-white font-bold text-xs rounded-lg shadow-sm">
                                           Save Nested Answer Blocks
                                       </button>
                                   </div>
                               </div>
                           ))}
                       </div>
                  </div>
               )}
            </div>
        </div>
    );
}
