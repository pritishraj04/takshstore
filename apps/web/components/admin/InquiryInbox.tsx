"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import {
  Mail,
  Trash2,
  CheckCircle,
  Clock,
  User,
  MessageSquare,
  ChevronRight,
  Loader2,
  AlertCircle,
  Bell,
  BellOff
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { adminApiFetch } from "@/lib/admin-api";

export default function InquiryInbox() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [receivesAlerts, setReceivesAlerts] = useState(false);
  const [togglingAlerts, setTogglingAlerts] = useState(false);
  const [me, setMe] = useState<any>(null);

  const fetchInquiries = async () => {
    try {
      const res = await adminApiFetch("/admin/inquiries");
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
      } else {
        toast.error("Failed to load inquiries");
      }
    } catch (e) {
      toast.error("Network error loading inquiries");
    } finally {
      setLoading(false);
    }
  };

  const fetchMe = async () => {
    try {
      const res = await adminApiFetch('/admin/users/me');
      if (res.ok) {
        const data = await res.json();
        setMe(data);
        setReceivesAlerts(data.receivesContactAlerts);
      }
    } catch (e) { }
  };

  useEffect(() => {
    fetchInquiries();
    fetchMe();
  }, []);

  const toggleAlerts = async () => {
    setTogglingAlerts(true);
    try {
      const newState = !receivesAlerts;
      const res = await adminApiFetch("/admin/users/me/alerts", {
        method: 'PATCH',
        body: JSON.stringify({ receives: newState }),
      });
      if (res.ok) {
        setReceivesAlerts(newState);
        toast.success(newState ? "Admin alerts enabled" : "Admin alerts disabled");
      } else {
        throw new Error("Failed to update");
      }
    } catch (e) {
      toast.error("Failed to update alert settings");
    } finally {
      setTogglingAlerts(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await adminApiFetch(`/admin/inquiries/${id}/read`, {
        method: 'PATCH',
      });
      if (res.ok) {
        setInquiries(prev => prev.map(i => i.id === id ? { ...i, isRead: true } : i));
        if (selectedInquiry?.id === id) {
          setSelectedInquiry({ ...selectedInquiry, isRead: true });
        }
      }
    } catch (e) {
      toast.error("Failed to mark as read");
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      const res = await adminApiFetch(`/admin/inquiries/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setInquiries(prev => prev.filter(i => i.id !== id));
        if (selectedInquiry?.id === id) setSelectedInquiry(null);
        toast.success("Inquiry deleted");
      } else {
        throw new Error("Failed to delete");
      }
    } catch (e) {
      toast.error("Failed to delete inquiry");
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Title and Alert Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-gray-900 flex items-center gap-2 sm:gap-3 uppercase">
            <Mail className="w-6 h-6 sm:w-8 sm:h-8 shrink-0 text-emerald-600" /> Customer Inquiries
          </h1>
          <p className="text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px] sm:text-xs">Manage messages & leads efficiently</p>
        </div>

        <button
          onClick={toggleAlerts}
          disabled={togglingAlerts}
          className={`flex items-center justify-center whitespace-nowrap w-full sm:w-auto gap-3 px-6 py-3 rounded-xl border transition-all duration-300 font-bold uppercase tracking-widest text-xs ${receivesAlerts
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm'
              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
        >
          {togglingAlerts ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : receivesAlerts ? (
            <Bell className="w-4 h-4" />
          ) : (
            <BellOff className="w-4 h-4" />
          )}
          {receivesAlerts ? "Email Alerts Active" : "Email Alerts Off"}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 min-h-[70vh]">

        {/* Left: Message List */}
        <div className="xl:col-span-5 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Inbox ({inquiries.length})</h3>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[700px]">
            {inquiries.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-10" />
                <p className="uppercase tracking-widest text-xs font-bold">No inquiries yet</p>
              </div>
            ) : (
              inquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  onClick={() => {
                    setSelectedInquiry(inquiry);
                    if (!inquiry.isRead) markAsRead(inquiry.id);
                  }}
                  className={`p-6 border-b border-gray-50 cursor-pointer transition-all hover:bg-gray-50 group flex items-start gap-4 ${selectedInquiry?.id === inquiry.id ? 'bg-gray-50 ring-2 ring-inset ring-black' : ''
                    }`}
                >
                  <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${inquiry.isRead ? 'bg-transparent' : 'bg-black shadow-[0_0_8px_rgba(0,0,0,0.5)]'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm truncate pr-4 ${inquiry.isRead ? 'font-medium text-gray-700' : 'font-extrabold text-black'}`}>
                        {inquiry.name}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-bold uppercase shrink-0">
                        {format(new Date(inquiry.createdAt), 'MMM dd')}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${inquiry.isRead ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>
                      {inquiry.subject}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Focused Message Detail */}
        <div className="xl:col-span-7">
          {selectedInquiry ? (
            <div className="bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-xs">
                    {selectedInquiry.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-black">{selectedInquiry.name}</h2>
                    <p className="text-xs text-gray-500 font-medium">{selectedInquiry.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteInquiry(selectedInquiry.id)}
                    className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-8 flex-1">
                <div className="mb-10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5B39A] block mb-2">Subject</span>
                  <h3 className="text-2xl font-extrabold text-gray-900 pr-12">{selectedInquiry.subject}</h3>
                </div>

                <div className="mb-10 p-8 bg-gray-50 rounded-3xl border border-gray-100 ring-1 ring-white shadow-inner min-h-[200px]">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-4 border-b border-gray-200 pb-2">Full Message</span>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {selectedInquiry.message}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest pr-4 border-r border-gray-200">
                    <Clock className="w-3.5 h-3.5" />
                    Received {format(new Date(selectedInquiry.createdAt), 'hh:mm a, MMMM dd yyyy')}
                  </div>
                  <a
                    href={`mailto:${selectedInquiry.email}`}
                    className="inline-flex items-center justify-center whitespace-nowrap w-full sm:w-auto gap-3 px-8 py-4 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-gray-900 transition-all shadow-xl hover:scale-[1.02] active:scale-95"
                  >
                    <Mail className="w-4 h-4" />
                    Direct Reply
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl h-full flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center shadow-sm mb-6 border border-gray-100 rotate-3">
                <MessageSquare className="w-10 h-10 text-gray-200 -rotate-3" />
              </div>
              <h3 className="text-gray-900 font-extrabold uppercase tracking-widest text-sm mb-2">Select an Inquiry</h3>
              <p className="text-gray-400 text-xs max-w-xs font-medium">Choose a message from the list on the left to view full details and respond.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
