"use client";

import { useState, useEffect } from "react";
import { Scale, Shield, AlertTriangle, Clock, ChevronRight, Loader2, History } from "lucide-react";

interface DebateTurn {
  speaker: "PolicyGuard" | "PolicyChallenger" | "Judge";
  content: string;
  timestamp?: number;
}

interface Verdict {
  verdict: string;
  win_probability: number;
  reasoning: string;
  loopholes: string[];
  risks: string[];
  legal_references: string[];
  next_step: string;
}

interface DebateRecord {
  id: string;
  policy_details: {
    insurer: string;
    planName: string;
    sumInsured: number;
    [key: string]: unknown;
  };
  claim_details: {
    treatment: string;
    hospital: string;
    amount: number;
    date: string;
    [key: string]: unknown;
  };
  debate: DebateTurn[];
  verdict: Verdict;
  created_at: string;
}

export default function HistoryPage() {
  const [debates, setDebates] = useState<DebateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/lawyer-debates");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setDebates(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getVerdictColor = (verdict: string) => {
    if (verdict === "in_favor_of_claimant") return "text-[#00B894]";
    if (verdict === "in_favor_of_insurer") return "text-[#E74C3C]";
    return "text-[#FFD700]";
  };

  const getVerdictLabel = (verdict: string) => {
    if (verdict === "in_favor_of_claimant") return "Claimant Favored";
    if (verdict === "in_favor_of_insurer") return "Insurer Favored";
    return "Partial Decision";
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-[#FFD700]/20 rounded-xl flex items-center justify-center">
            <History className="w-6 h-6 text-[#FFD700]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A2E]">Debate History</h1>
            <p className="text-[#636E72]">Past Lawyer Arena sessions</p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#FF6B35] animate-spin" />
            <span className="ml-3 text-[#636E72]">Loading debates...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500">Error: {error}</p>
          </div>
        ) : debates.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#1A1A2E] mb-2">No debates yet</h3>
            <p className="text-[#636E72]">Your past Lawyer Arena sessions will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {debates.map((record) => (
              <div
                key={record.id}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      record.verdict.verdict === "in_favor_of_claimant" ? "bg-[#00B894]/10" :
                      record.verdict.verdict === "in_favor_of_insurer" ? "bg-[#E74C3C]/10" : "bg-[#FFD700]/10"
                    }`}>
                      <Scale className={`w-5 h-5 ${getVerdictColor(record.verdict.verdict)}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1A1A2E]">
                        {record.policy_details.insurer} vs Claimant
                      </h3>
                      <p className="text-sm text-[#636E72]">
                        {record.claim_details.treatment} • ₹{record.claim_details.amount?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getVerdictColor(record.verdict.verdict)}`}>
                      {getVerdictLabel(record.verdict.verdict)}
                    </div>
                    <div className="text-xs text-[#636E72] flex items-center justify-end gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {new Date(record.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-[#636E72]">
                      <Shield className="w-4 h-4" />
                      {record.debate?.length || 0} arguments
                    </span>
                    <span className="flex items-center gap-1 text-[#636E72]">
                      <AlertTriangle className="w-4 h-4" />
                      {record.verdict.win_probability}% win probability
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#004E89] font-medium">
                    View details <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
