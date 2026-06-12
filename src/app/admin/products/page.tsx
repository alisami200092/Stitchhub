"use client";

import React from "react";
import Image from "next/image";
import GlassCard from "@/components/admin/GlassCard";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import EmptyState from "@/components/admin/EmptyState";
import FormField from "@/components/admin/FormField";
import { useAdminProducts } from "@/hooks/useAdminProducts";

const categoryOptions = [
  { value: "Apparel", label: "Apparel" },
  { value: "Drinkware", label: "Drinkware" },
  { value: "Performance", label: "Performance" },
  { value: "Accessories", label: "Accessories" },
];

export default function AdminProductsPage() {
  const {
    products, loading, submitting, error, success,
    isEditing, formData, imagePreview,
    handleInputChange, handleImageChange,
    handleEditClick, handleCancelEdit, handleDeleteClick, handleSubmit,
  } = useAdminProducts();

  return (
    <div className="space-y-6 animate-fadeIn pb-12 w-full">
      <AdminPageHeader title="Product Catalog" subtitle="Add, edit, or remove products from the catalog." />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <GlassCard className="p-6 h-[720px] flex flex-col" glow>
            <h3 className="text-sm font-bold text-zinc-300 mb-4 relative z-10">Product Catalog</h3>
            
            {loading ? (
              <LoadingSpinner />
            ) : products.length === 0 ? (
              <EmptyState message="No products found. Use the panel on the right to add your first product." />
            ) : (
              <div className="flex-1 overflow-y-auto pr-2 relative z-10 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="p-4 bg-black/40 border border-white/5 rounded-xl hover:border-white/10 transition-all flex gap-4 relative group">
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditClick(product)} title="Edit Product"
                          className="p-1.5 bg-white/5 border border-white/10 hover:bg-[#d4af37]/20 hover:border-[#d4af37]/40 rounded-lg text-zinc-300 hover:text-[#d4af37] transition-all cursor-pointer">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDeleteClick(product.id)} title="Delete Product"
                          className="p-1.5 bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/40 rounded-lg text-zinc-300 hover:text-red-400 transition-all cursor-pointer">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="h-16 w-16 bg-zinc-900 border border-white/10 rounded-lg overflow-hidden shrink-0">
                        <Image src={product.img} alt={product.title} width={64} height={64} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-mono text-[#d4af37] uppercase tracking-wider bg-[#d4af37]/10 px-2 py-0.5 rounded-full">{product.cat}</span>
                        <h4 className="text-xs font-bold text-white mt-1.5 truncate pr-14">{product.title}</h4>
                        <div className="flex justify-between items-center mt-2 text-[10px] font-mono text-zinc-400">
                          <span>Minimum: {product.moq} units</span>
                          <span className="text-white font-bold">{product.priceRange}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-sm font-bold text-zinc-300 mb-6">{isEditing ? "Edit Product" : "Create Product"}</h3>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">{error}</div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">{success}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="Product Title" name="title" required value={formData.title} onChange={handleInputChange} placeholder="e.g. Gildan Heavyweight Hoodie" />

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Slug / ID" name="id" required value={formData.id} onChange={handleInputChange} placeholder="gildan-hoodie" disabled={isEditing} />
                <FormField label="Category" name="cat" type="select" value={formData.cat} onChange={handleInputChange} options={categoryOptions} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Base Price ($)" name="price" type="number" required value={formData.price} onChange={handleInputChange} placeholder="39.99" step="0.01" />
                <FormField label="Min. Order" name="moq" type="number" required value={formData.moq} onChange={handleInputChange} placeholder="25" />
              </div>

              <FormField label="Volume Pricing Range" name="priceRange" required value={formData.priceRange} onChange={handleInputChange} placeholder="e.g. $14.20 - $22.50" />
              <FormField label="Customization Options" name="customization" required value={formData.customization} onChange={handleInputChange} placeholder="e.g. Screen Print | Embroidery" />
              <FormField label="Description" name="description" type="textarea" required value={formData.description} onChange={handleInputChange} placeholder="Product description and details..." />

              <FormField label="Product Image" name="image" type="file"
                imagePreview={imagePreview} onFileChange={handleImageChange}
                hiddenFileId="product-image-file" accept="image/*"
                value="" onChange={() => {}} />

              <div className="flex gap-3">
                {isEditing && (
                  <button type="button" onClick={handleCancelEdit}
                    className="flex-1 bg-white/5 border border-white/10 text-white py-3 rounded-xl text-xs font-bold hover:bg-white/10 transition-colors font-mono uppercase tracking-wider">
                    Cancel
                  </button>
                )}
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-[#d4af37] text-[#090a0f] py-3 rounded-xl text-xs font-bold hover:bg-[#bfa032] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[0_0_20px_rgba(212,175,55,0.25)] font-mono uppercase tracking-wider">
                  {submitting ? (isEditing ? "Updating..." : "Saving...") : (isEditing ? "Save Changes" : "Save Product")}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
