"use client";

import { useEffect, useState } from "react";
import { Activity, Clock, MessageSquare, User } from "lucide-react";
import { getQuoteStatusLogs } from "@/lib/supabase/admin-queries";

export interface QuoteStatusLog {
  id: string;
  quote_id: string;
  from_status: string | null;
  to_status: string;
  changed_by_name: string | null;
  note: string | null;
  created_at: string;
}

const statusLabels: Record<string, string> = {
  new: "Chờ xử lý",
  contacted: "Đã liên hệ",
  qualified: "Đủ điều kiện",
  closed: "Đã hoàn tất",
  spam: "Thư rác",
};

const statusColors: Record<string, string> = {
  new: "bg-amber-100 text-amber-800 border-amber-200",
  contacted: "bg-blue-100 text-blue-800 border-blue-200",
  qualified: "bg-purple-100 text-purple-800 border-purple-200",
  closed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  spam: "bg-red-150 text-red-900 border-red-300",
};

export function QuoteTimeline({ quoteId }: { quoteId: string }) {
  const [logs, setLogs] = useState<QuoteStatusLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    
    getQuoteStatusLogs(quoteId)
      .then((data) => {
        if (active) {
          setLogs(data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load quote timeline logs:", err);
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [quoteId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 justify-center text-xs text-slate-400">
        <Clock className="size-3.5 animate-spin" />
        <span>Đang tải lịch sử xử lý...</span>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 bg-slate-50/50">
        Chưa có lịch sử cập nhật trạng thái cho yêu cầu này.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h5 className="font-bold text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b pb-2">
        <Activity className="size-3.5 text-slate-400" /> Lịch sử xử lý ({logs.length})
      </h5>
      <div className="flow-root">
        <ul className="-mb-8">
          {logs.map((log, logIdx) => (
            <li key={log.id || logIdx}>
              <div className="relative pb-8">
                {logIdx !== logs.length - 1 ? (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="flex size-8 items-center justify-center rounded-full bg-slate-100 ring-4 ring-white">
                      <Clock className="size-4 text-slate-500" />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                    <div className="text-xs text-slate-600">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-slate-800 font-bold">
                          <User className="size-3 text-slate-400" />
                          {log.changed_by_name || "Hệ thống"}
                        </span>
                        <span>đã cập nhật trạng thái:</span>
                        {log.from_status && (
                          <>
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold border ${statusColors[log.from_status] || "bg-slate-50"}`}>
                              {statusLabels[log.from_status] || log.from_status}
                            </span>
                            <span>→</span>
                          </>
                        )}
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold border ${statusColors[log.to_status] || "bg-slate-50"}`}>
                          {statusLabels[log.to_status] || log.to_status}
                        </span>
                      </span>
                      {log.note && (
                        <p className="mt-2 text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-150 flex items-start gap-1.5 italic">
                          <MessageSquare className="size-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>&quot;{log.note}&quot;</span>
                        </p>
                      )}
                    </div>
                    <div className="text-right text-[10px] whitespace-nowrap text-slate-400 font-mono">
                      {new Date(log.created_at).toLocaleDateString("vi-VN")}
                      <span className="block mt-0.5">
                        {new Date(log.created_at).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
