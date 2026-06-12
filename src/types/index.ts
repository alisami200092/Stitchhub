export interface Product {
  id: string;
  title: string;
  cat: string;
  img: string;
  price: number;
  priceRange?: string;    
  customization?: string; 
  description: string;
  moq: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  customNotes: string;
}

export interface OrderItem {
  product: {
    title: string;
    img: string;
    cat: string;
  };
  quantity: number;
  size: string;
  customNotes?: string;
}

export interface Order {
  id: string;
  invoiceNumber: string;
  totalAmount: string;
  status: string;
  itemsSnapshot: OrderItem[];
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  } | null;
}

export interface EscalationLog {
  id: string;
  subject: string;
  body: string;
  status: string;
  aiResponseDraft: string;
  createdAt: string;
  metadata?: { recipientEmail?: string; itemCount?: number };
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  totalAmount: string;
  status: string;
  createdAt: string;
}

export type ProfileTab = "inbox" | "account" | "security" | "ledger";
