import { create } from "zustand";

interface SupplierState {
  // Active Requests
  activeRfqs: any[];
  selectedIdx: number;
  price: string;
  days: string;
  loadingRequests: boolean;
  submittingQuote: boolean;
  quoteMessage: { type: "success" | "error"; text: string } | null;

  // Submitted Quotes
  bids: any[];
  invoices: Record<string, any>;
  loadingBids: boolean;

  // Messages
  threads: any[];
  activeThread: string | null;
  messageText: string;
  chatMessages: any[];
  loadingThreads: boolean;
  statusMessage: string | null;

  // Setters
  setActiveRfqs: (rfqs: any[]) => void;
  setSelectedIdx: (idx: number) => void;
  setPrice: (price: string) => void;
  setDays: (days: string) => void;
  setLoadingRequests: (loading: boolean) => void;
  setSubmittingQuote: (submitting: boolean) => void;
  setQuoteMessage: (message: { type: "success" | "error"; text: string } | null) => void;

  setBids: (bids: any[]) => void;
  setInvoices: (invoices: Record<string, any>) => void;
  setLoadingBids: (loading: boolean) => void;

  setThreads: (threads: any[]) => void;
  setActiveThread: (thread: string | null) => void;
  setMessageText: (text: string) => void;
  setChatMessages: (messages: any[]) => void;
  setLoadingThreads: (loading: boolean) => void;
  setStatusMessage: (message: string | null) => void;
}

export const useSupplierStore = create<SupplierState>()((set) => ({
  // Active Requests Initial State
  activeRfqs: [],
  selectedIdx: 0,
  price: "",
  days: "",
  loadingRequests: true,
  submittingQuote: false,
  quoteMessage: null,

  // Submitted Quotes Initial State
  bids: [],
  invoices: {},
  loadingBids: true,

  // Messages Initial State
  threads: [],
  activeThread: null,
  messageText: "",
  chatMessages: [],
  loadingThreads: true,
  statusMessage: null,

  // Setters
  setActiveRfqs: (activeRfqs) => set({ activeRfqs }),
  setSelectedIdx: (selectedIdx) => set({ selectedIdx }),
  setPrice: (price) => set({ price }),
  setDays: (days) => set({ days }),
  setLoadingRequests: (loadingRequests) => set({ loadingRequests }),
  setSubmittingQuote: (submittingQuote) => set({ submittingQuote }),
  setQuoteMessage: (quoteMessage) => set({ quoteMessage }),

  setBids: (bids) => set({ bids }),
  setInvoices: (invoices) => set({ invoices }),
  setLoadingBids: (loadingBids) => set({ loadingBids }),

  setThreads: (threads) => set({ threads }),
  setActiveThread: (activeThread) => set({ activeThread }),
  setMessageText: (messageText) => set({ messageText }),
  setChatMessages: (chatMessages) => set({ chatMessages }),
  setLoadingThreads: (loadingThreads) => set({ loadingThreads }),
  setStatusMessage: (statusMessage) => set({ statusMessage }),
}));
