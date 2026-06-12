"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Product } from "@/types";

interface ProductFormData {
  id: string;
  title: string;
  cat: string;
  price: string;
  priceRange: string;
  moq: string;
  customization: string;
  description: string;
}

const emptyForm: ProductFormData = {
  id: "", title: "", cat: "Apparel", price: "",
  priceRange: "", moq: "25", customization: "", description: "",
};

export function useAdminProducts() {
  const queryClient = useQueryClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProductFormData>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "title" && !formData.id && !isEditing) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setFormData((prev) => ({ ...prev, id: generatedSlug }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEditClick = (product: Product) => {
    setError(null);
    setSuccess(null);
    setIsEditing(true);
    setEditingId(product.id);
    setExistingImageUrl(product.img);
    setImagePreview(product.img);
    setImageFile(null);
    setFormData({
      id: product.id,
      title: product.title,
      cat: product.cat,
      price: product.price.toString(),
      priceRange: product.priceRange || "",
      moq: product.moq.toString(),
      customization: product.customization || "",
      description: product.description,
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setExistingImageUrl(null);
    setImagePreview(null);
    setImageFile(null);
    setFormData(emptyForm);
  };

  const handleDeleteClick = async (productId: string) => {
    if (!confirm("Are you absolutely sure you want to delete this product from the catalog? This action is permanent.")) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete product.");
      setSuccess("Product successfully deleted from catalog.");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      fetchProducts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete product.";
      console.error(err);
      setError(message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!imageFile && !isEditing) {
      setError("Product image file is required.");
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = existingImageUrl;

      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", imageFile);
        const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: uploadFormData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Failed to upload product image.");
        imageUrl = uploadData.url;
      }

      const productPayload = {
        ...formData,
        price: parseFloat(formData.price),
        moq: parseInt(formData.moq, 10),
        img: imageUrl,
      };

      const url = isEditing ? `/api/products/${editingId}` : "/api/products";
      const method = isEditing ? "PUT" : "POST";

      const productRes = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload),
      });
      const productData = await productRes.json();
      if (!productRes.ok) throw new Error(productData.error || "Failed to save product.");

      setSuccess(isEditing ? "Product catalog entry successfully updated!" : "Product uploaded and catalog successfully synchronized!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      handleCancelEdit();
      fetchProducts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      console.error(err);
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    products, loading, submitting, error, success,
    isEditing, formData, imagePreview,
    handleInputChange, handleImageChange,
    handleEditClick, handleCancelEdit, handleDeleteClick, handleSubmit,
  };
}
