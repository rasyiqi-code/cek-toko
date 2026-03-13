"use client"

import { useState } from "react"
import { X, Save, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"

interface Category {
  id: string
  name: string
}

interface AddProductFormData {
  name: string
  categoryId: string
  price: string
  buyPrice: string
  unit: string
  initialStock: number
}

export function AddProductModal({ 
  categories, 
  onClose, 
  onSave,
  loading 
}: { 
  categories: Category[], 
  onClose: () => void, 
  onSave: (data: AddProductFormData) => Promise<void>,
  loading: boolean
}) {
  const [formData, setFormData] = useState({
    name: "",
    categoryId: categories[0]?.id || "",
    price: "",
    buyPrice: "",
    unit: "pcs",
    initialStock: 1
  })

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center overflow-hidden p-4">
      <div className="absolute inset-0 bg-slate-900/60 z-10 transition-opacity enter-pop" onClick={onClose}></div>
      <div className="relative z-20 w-full max-w-md bg-white rounded-t-[32px] md:rounded-[32px] h-[85vh] md:h-auto md:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl enter-rise">
        <div className="flex flex-col items-center pt-3 pb-2 w-full bg-white shrink-0 rounded-t-[32px] md:rounded-t-[32px]">
          <div className="h-1.5 w-12 rounded-full bg-slate-100 md:hidden"></div>
          <div className="w-full flex justify-between items-center px-4 pt-3">
            <button className="h-9 w-9 flex items-center justify-center text-slate-500 rounded-full hover:bg-slate-100 transition-colors" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Tambah Barang</h1>
            <div className="w-9"></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 no-scrollbar">
          <label className="flex flex-col w-full group">
            <span className="text-slate-700 text-sm font-semibold mb-1.5 ml-1">Nama Barang</span>
            <Input 
              className="w-full h-[50px] px-4 rounded-[14px] bg-[#FDF9F1] border-2 border-transparent text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-0 transition-colors" 
              placeholder="Cth: Kopi Kapal Api"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col w-full group">
              <span className="text-slate-700 text-sm font-semibold mb-1.5 ml-1">Harga Modal</span>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-[10px] text-slate-400 font-bold uppercase">Rp</span>
                <Input 
                  className="w-full h-[50px] pl-8 pr-3 rounded-[14px] bg-[#FDF9F1] border-2 border-transparent text-slate-900 text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:border-primary focus:ring-0 transition-colors" 
                  placeholder="0" 
                  type="number"
                  value={formData.buyPrice}
                  onChange={(e) => setFormData({...formData, buyPrice: e.target.value})}
                />
              </div>
            </label>

            <label className="flex flex-col w-full group">
              <span className="text-slate-700 text-sm font-semibold mb-1.5 ml-1">Harga Jual</span>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-[10px] text-slate-400 font-bold uppercase">Rp</span>
                <Input 
                  className="w-full h-[50px] pl-8 pr-3 rounded-[14px] bg-[#FDF9F1] border-2 border-transparent text-primary text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:border-primary focus:ring-0 transition-colors" 
                  placeholder="0" 
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>
            </label>
          </div>

          <label className="flex flex-col w-full group">
            <span className="text-slate-700 text-sm font-semibold mb-1.5 ml-1">Stok Sekarang</span>
            <div className="flex items-center gap-3">
              <button 
                className="h-[50px] w-[50px] shrink-0 rounded-[14px] bg-[#FDF9F1] text-primary flex items-center justify-center border-2 border-transparent active:bg-primary/10 transition-colors" 
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, initialStock: Math.max(0, prev.initialStock - 1) }))}
              >
                <Minus className="h-5 w-5" />
              </button>
              <Input 
                className="flex-1 h-[50px] px-4 rounded-[14px] bg-[#FDF9F1] border-2 border-transparent text-slate-900 text-center text-base font-bold focus:outline-none focus:border-primary focus:ring-0 transition-colors" 
                type="number" 
                value={formData.initialStock}
                onChange={(e) => setFormData({...formData, initialStock: parseInt(e.target.value) || 0})}
              />
              <button 
                className="h-[50px] w-[50px] shrink-0 rounded-[14px] bg-[#FDF9F1] text-primary flex items-center justify-center border-2 border-transparent active:bg-primary/10 transition-colors" 
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, initialStock: prev.initialStock + 1 }))}
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </label>

          <label className="flex flex-col w-full group">
            <span className="text-slate-700 text-sm font-semibold mb-1.5 ml-1">Kategori</span>
            <Select 
              className="w-full h-[50px] px-4 appearance-none rounded-[14px] bg-[#FDF9F1] border-2 border-transparent text-slate-900 text-sm font-medium focus:outline-none focus:border-primary focus:ring-0 transition-colors"
              value={formData.categoryId}
              onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
            >
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </label>
        </div>

        <div className="p-4 bg-white border-t border-slate-100 shrink-0 mt-auto pb-safe">
          <Button 
            className="w-full h-[56px] bg-primary text-white rounded-full text-lg font-extrabold active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-soft"
            disabled={loading}
            onClick={() => onSave(formData)}
          >
            <Save className="h-5 w-5" />
            {loading ? "Menyimpan..." : "Simpan Barang"}
          </Button>
        </div>
      </div>
    </div>
  )
}
