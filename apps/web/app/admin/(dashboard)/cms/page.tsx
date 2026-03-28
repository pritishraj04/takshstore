"use client";

import { useState, useEffect } from 'react';
import { adminApiFetch } from '@/lib/admin-api';
import { toast } from 'sonner';
import { Settings, Save, GripVertical, Trash2, Plus, FileText, PhoneCall, HelpCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { TipTapEditor } from '@/components/admin/TipTapEditor';

export default function CMSPage() {
    const [activeTab, setActiveTab] = useState<'TERMS'|'PRIVACY'|'CONTACT'|'FAQ'>('TERMS');
    
    // CMS Content States
    const [termsContent, setTermsContent] = useState('');
    const [privacyContent, setPrivacyContent] = useState('');
    
    // Contact State (stored as JSON)
    const [contactData, setContactData] = useState({
        email: '',
        phone: '',
        address: '',
        hours: ''
    });

    // FAQ State
    const [faqs, setFaqs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [resTerms, resPrivacy, resContact, resFaqs] = await Promise.all([
                adminApiFetch('/cms/content/TERMS'),
                adminApiFetch('/cms/content/PRIVACY'),
                adminApiFetch('/cms/content/CONTACT'),
                adminApiFetch('/admin/cms/faqs')
            ]);

            if (resTerms.ok) setTermsContent((await resTerms.json()).content || '');
            if (resPrivacy.ok) setPrivacyContent((await resPrivacy.json()).content || '');
            
            if (resContact.ok) {
                const contactRaw = await resContact.json();
                if (contactRaw.content) {
                    try { setContactData(JSON.parse(contactRaw.content)); } 
                    catch(e) { console.error('Failed to parse contact data', e); }
                }
            }

            if (resFaqs.ok) {
                const data = await resFaqs.json();
                setFaqs(data.sort((a: any, b: any) => a.displayOrder - b.displayOrder));
            }

        } catch (error) {
            console.error("Failed to fetch CMS content:", error);
            toast.error("Failed to load CMS data.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveContent = async (key: string, content: string) => {
        setIsSaving(true);
        try {
            const res = await adminApiFetch(`/admin/cms/content/${key}`, {
                method: 'PATCH',
                body: JSON.stringify({ content })
            });

            if (!res.ok) throw new Error('Save failed');
            toast.success(`${key} saved successfully!`);
        } catch (error: any) {
            toast.error(`Error saving ${key}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveContact = () => {
        handleSaveContent('CONTACT', JSON.stringify(contactData));
    };

    const [isAddingFaq, setIsAddingFaq] = useState(false);
    const [newFaqQuestion, setNewFaqQuestion] = useState('');

    const handleAddFaq = async () => {
        if (!newFaqQuestion.trim()) {
            toast.error("Question cannot be empty");
            return;
        }

        try {
            const res = await adminApiFetch('/admin/cms/faqs', {
                method: 'POST',
                body: JSON.stringify({ question: newFaqQuestion, answer: '<p>Pending answer...</p>' })
            });
            if (res.ok) {
                fetchData();
                setIsAddingFaq(false);
                setNewFaqQuestion('');
                toast.success('FAQ Added! Please formulate the answer below.');
            }
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
            fetchData();
        } catch (e) {
             toast.error('Failed to save. Check logs.');
        }
    };

    const handleDeleteFaq = async (id: string) => {
        if (!confirm('Are you certain you want to remove this FAQ?')) return;
        try {
            const res = await adminApiFetch(`/admin/cms/faqs/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('FAQ Removed.');
                setFaqs(faqs.filter(f => f.id !== id));
            } else {
                throw new Error("Failed");
            }
        } catch (e) {
            toast.error("Error deleting FAQ");
        }
    };

    const moveFaqOrder = async (index: number, direction: 'UP' | 'DOWN') => {
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
    };

    if (isLoading) return <div className="p-8 text-sm text-gray-500 flex items-center gap-3"><div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /> Abstracting Network Storage...</div>;

    const TabButton = ({ value, label, icon: Icon }: any) => (
        <button 
            type="button" 
            onClick={() => setActiveTab(value)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === value ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
        >
            <Icon className="w-4 h-4" /> {label}
        </button>
    );

    return (
        <div className="space-y-6 animate-in slide-in-bottom duration-500 fade-in h-[calc(100vh-120px)] flex flex-col p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2"><Settings className="w-6 h-6 text-indigo-600" /> CMS & Data Store Policies</h1>
                  <p className="text-gray-500 text-sm mt-1">Manage core institutional assets spanning Legal constructs and FAQs globally.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col min-h-0 flex-1">
                
                {/* Tabs */}
                <div className="flex bg-gray-50/50 border-b border-gray-200 px-4 shrink-0">
                    <TabButton value="TERMS" label="Terms & Conditions" icon={FileText} />
                    <TabButton value="PRIVACY" label="Privacy Policy" icon={FileText} />
                    <TabButton value="FAQ" label="Support FAQ" icon={HelpCircle} />
                    <TabButton value="CONTACT" label="Contact Matrix" icon={PhoneCall} />
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto bg-gray-50/30">
                    
                    {/* TERMS */}
                    {activeTab === 'TERMS' && (
                        <div className="flex flex-col h-full bg-white animate-in slide-in-from-bottom-2">
                             <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                                 <h2 className="font-bold text-gray-900 tracking-tight">Terms & Conditions Markdown</h2>
                                 <button 
                                     onClick={() => handleSaveContent('TERMS', termsContent)}
                                     disabled={isSaving}
                                     className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"
                                 >
                                     <Save className="w-4 h-4" /> Save Terms Directives
                                 </button>
                             </div>
                             <div className="flex-1 min-h-0 bg-white">
                                 <TipTapEditor content={termsContent} onChange={setTermsContent} />
                             </div>
                        </div>
                    )}

                    {/* PRIVACY */}
                    {activeTab === 'PRIVACY' && (
                        <div className="flex flex-col h-full bg-white animate-in slide-in-from-bottom-2">
                             <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                                 <h2 className="font-bold text-gray-900 tracking-tight">Privacy Policy Markdown</h2>
                                 <button 
                                     onClick={() => handleSaveContent('PRIVACY', privacyContent)}
                                     disabled={isSaving}
                                     className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"
                                 >
                                     <Save className="w-4 h-4" /> Save Privacy Directives
                                 </button>
                             </div>
                             <div className="flex-1 min-h-0 bg-white">
                                 <TipTapEditor content={privacyContent} onChange={setPrivacyContent} />
                             </div>
                        </div>
                    )}

                    {/* CONTACT */}
                    {activeTab === 'CONTACT' && (
                        <div className="p-8 space-y-6 animate-in slide-in-from-bottom-2 max-w-2xl bg-white h-full">
                            <h2 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-3"><span className="w-8 h-px bg-gray-300"></span> Communication Vector Configuration</h2>
                            <div className="grid grid-cols-1 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 ">Primary Customer Service Email</label>
                                    <input type="email" value={contactData.email} onChange={e => setContactData({...contactData, email: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-indigo-500 text-sm" placeholder="support@domain.com" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 ">Public Helpdesk Phone</label>
                                    <input type="tel" value={contactData.phone} onChange={e => setContactData({...contactData, phone: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-indigo-500 text-sm" placeholder="+1 (800) 123-4567" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 ">Business / Fulfillment Address</label>
                                    <textarea value={contactData.address} onChange={e => setContactData({...contactData, address: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-indigo-500 text-sm h-24" placeholder="123 Studio Drive..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 ">Operating Hours String</label>
                                    <input type="text" value={contactData.hours} onChange={e => setContactData({...contactData, hours: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-indigo-500 text-sm" placeholder="Mon-Fri, 9am - 6pm EST" />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button onClick={handleSaveContact} disabled={isSaving} className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm">
                                    <Save className="w-4 h-4" /> Save Vector
                                </button>
                            </div>
                        </div>
                    )}

                    {/* FAQ */}
                    {activeTab === 'FAQ' && (
                        <div className="bg-white h-full flex flex-col">
                           <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
                                 <h2 className="font-bold text-gray-900 tracking-tight">FAQ List (Ordered display)</h2>
                                 {!isAddingFaq ? (
                                    <button 
                                        onClick={() => setIsAddingFaq(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                                    >
                                        <Plus className="w-4 h-4" /> Formulate New FAQ
                                    </button>
                                 ) : (
                                    <div className="flex items-center gap-3">
                                        <input 
                                           autoFocus
                                           type="text" 
                                           value={newFaqQuestion}
                                           onChange={e => setNewFaqQuestion(e.target.value)}
                                           onKeyDown={e => e.key === 'Enter' && handleAddFaq()}
                                           placeholder="e.g. How long does shipping take?"
                                           className="px-4 py-2 rounded-lg border border-emerald-500 outline-none focus:ring-2 focus:ring-emerald-200 text-sm font-semibold min-w-[250px]"
                                        />
                                        <button onClick={handleAddFaq} className="px-4 py-2 bg-black text-white rounded-lg text-sm font-bold shadow-sm">Save</button>
                                        <button onClick={() => { setIsAddingFaq(false); setNewFaqQuestion(''); }} className="px-3 py-2 text-gray-400 hover:text-gray-900 rounded-lg text-sm font-bold">Cancel</button>
                                    </div>
                                 )}
                           </div>
                           <div className="p-6 overflow-y-auto space-y-6 h-full border-t border-transparent">
                               {isLoading ? <p className="text-sm font-semibold text-gray-500">Retrieving index...</p> : faqs.map((faq, index) => (
                                   <div key={faq.id} className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white hover:border-emerald-300 transition-colors">
                                       <div className="flex items-start justify-between mb-4">
                                          <div className="flex items-center gap-4">
                                              <div className="flex flex-col gap-1 items-center bg-gray-50 border border-gray-100 p-1.5 rounded-lg">
                                                 <button onClick={() => moveFaqOrder(index, 'UP')} disabled={index === 0} className="p-1 hover:bg-gray-200 text-gray-500 hover:text-gray-900 rounded disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button>
                                                 <span className="text-[10px] font-extrabold text-gray-400">{faq.displayOrder}</span>
                                                 <button onClick={() => moveFaqOrder(index, 'DOWN')} disabled={index === faqs.length - 1} className="p-1 hover:bg-gray-200 text-gray-500 hover:text-gray-900 rounded disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /></button>
                                              </div>
                                              <div>
                                                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1.5">Question Text</p>
                                                  <input type="text" className="text-lg font-bold text-gray-900 bg-transparent outline-none border-b border-transparent focus:border-gray-200 w-full min-w-[300px]" defaultValue={faq.question} onBlur={(e) => {
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
        </div>
    );
}
