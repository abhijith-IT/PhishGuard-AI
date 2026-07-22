import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Finding = {
  text: string;
  type: string;
  weight?: number;
};

export type SupportingIndicator = {
  indicator: string;
  matched_text: string[];
};

export type HistoryItem = {
  id: number;
  message: string;
  risk: string;
  confidence: number;
  recommendation?: string;
  reason: Finding[];
  analysis_source?: string;
  analysis_version?: string;
  timestamp?: string;
  processing_time?: number;
  possible_attack?: string;
  validated_attack?: string;
  attack_confidence?: number;
  validation_status?: string;
  validation_notes?: string;
  executive_summary?: string;
  confidence_explanation?: string;
  detected_categories?: string[];
  supporting_indicators?: SupportingIndicator[];
  recommended_actions?: string[];
  target_brand?: string;
};

type HistoryContextType = {
  history: HistoryItem[];
  isLoading: boolean;
  pinnedIds: number[];
  togglePin: (id: number) => void;
  deleteAnalysis: (id: number) => void;
  refreshHistory: () => Promise<void>;
  clearAllHistory: () => Promise<void>;
};

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Local storage for pins and logical deletes
  const [pinnedIds, setPinnedIds] = useState<number[]>(() => {
    const saved = localStorage.getItem("phishguard_pinned");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [deletedIds, setDeletedIds] = useState<number[]>(() => {
    const saved = localStorage.getItem("phishguard_deleted");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("phishguard_pinned", JSON.stringify(pinnedIds));
  }, [pinnedIds]);

  useEffect(() => {
    localStorage.setItem("phishguard_deleted", JSON.stringify(deletedIds));
  }, [deletedIds]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/history`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!res.ok) return;
      const data = await res.json();
      const normalizedData = data.map((item: any) => {
        if (item.reason && Array.isArray(item.reason)) {
          item.reason = item.reason.map((r: any) => {
            if (typeof r === 'string') {
              return { text: r, type: 'warning', weight: 0 };
            }
            return r;
          });
        } else {
          item.reason = [];
        }
        item.risk = item.risk || "Unknown";
        return item;
      });
      
      const sortedData = normalizedData.sort((a: any, b: any) => {
        if (a.timestamp && b.timestamp) {
          return b.timestamp.localeCompare(a.timestamp);
        }
        if (a.timestamp) return -1;
        if (b.timestamp) return 1;
        return b.id - a.id;
      });

      setHistory(sortedData);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const togglePin = (id: number) => {
    setPinnedIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const deleteAnalysis = (id: number) => {
    setDeletedIds(prev => {
      if (!prev.includes(id)) return [...prev, id];
      return prev;
    });
  };

  const clearAllHistory = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/history`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setHistory([]);
        setPinnedIds([]);
        setDeletedIds([]);
      }
    } catch (err) {
      console.error("Failed to clear history", err);
    }
  };

  return (
    <HistoryContext.Provider value={{ 
      history: history.filter(item => !deletedIds.includes(item.id)), 
      isLoading, 
      pinnedIds, 
      togglePin, 
      deleteAnalysis, 
      refreshHistory: loadHistory,
      clearAllHistory
    }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useSharedHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error("useSharedHistory must be used within a HistoryProvider");
  }
  return context;
}
