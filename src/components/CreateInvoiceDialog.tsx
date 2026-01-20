import { useState, useRef, useEffect } from "react"; 
import { useSearchParams } from "react-router-dom"; 
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Plane, Hotel, Car, ReceiptText, Save, X, DollarSign, History, UploadCloud, Trash2 } from "lucide-react";

export default function CreateInvoiceDialog({ trigger, onSuccess }: { trigger?: React.ReactNode; onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [searchParams] = useSearchParams(); 
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [flightRows, setFlightRows] = useState(Array(4).fill({}));
  const [hotelRows, setHotelRows] = useState(Array(4).fill({}));
  const [transportRows, setTransportRows] = useState(Array(4).fill({}));

  const [formData, setFormData] = useState({
    customer_name: "",
    template_id: "Professional Blue", 
    due_date: "",
    status: "sent",
    payment_method: "Bank Transfer",
    total_selling: 0, 
    payment_received: 0,
    files: [] as File[],
  });

  useEffect(() => {
    const isNew = searchParams.get("new");
    const tName = searchParams.get("template");

    if (isNew === "true") {
      setOpen(true); 
      if (tName) {
        setFormData(prev => ({ ...prev, template_id: tName })); 
      }
    }
  }, [searchParams]);

  const grandTotal = formData.total_selling;
  const remaining = grandTotal - formData.payment_received;

  // ==========================================
  // ✅ FINAL SAVE & PDF DOWNLOAD FUNCTION
  // ==========================================
  const handleSubmit = async () => {
    try {
      if (!formData.customer_name) {
        alert("Please enter Customer Name first!");
        return;
      }

      const invoiceData = {
        customer_name: formData.customer_name,
        template_id: formData.template_id,
        total_amount: grandTotal,
        paid_amount: formData.payment_received,
        balance_amount: remaining,
        status: formData.status,
        payment_method: formData.payment_method,
        due_date: formData.due_date || null,
        // Items ko JSON string mein convert karna
        items_json: JSON.stringify({ 
          flights: flightRows, 
          hotels: hotelRows, 
          transport: transportRows 
        })
      };

      const response = await fetch("http://localhost:5000/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });

      const result = await response.json();

      if (response.ok) {
        alert("✅ Success! Invoice save ho gayi hai.");
        
        // 🚀 PDF DOWNLOAD TRIGGER:
        // Agar aapke backend mein download route hai toh ye auto-download karega
        if (result.id) {
          window.open(`http://localhost:5000/api/invoices/download/${result.id}`, "_blank");
        }

        if (onSuccess) onSuccess(); 
        setOpen(false); 
      } else {
        alert("❌ Server Error: " + (result.error || "Data save nahi ho saka."));
      }
    } catch (err) {
      alert("❌ Backend API se rabta nahi ho pa raha!");
    }
  };

  const addMoreRow = (setter: any) => setter((prev: any) => [...prev, {}]);
  const deleteRow = (index: number, setter: any) => {
    setter((prev: any) => prev.filter((_: any, i: number) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, files: Array.from(e.target.files) });
    }
  };

  const gridInputClass = "h-8 bg-slate-950 border-slate-800 text-[10px] rounded-none border-r focus-visible:ring-0 focus:border-orange-500 transition-all outline-none w-full px-2";
  const headerLabelClass = "text-[9px] font-bold text-slate-400 uppercase text-center py-1 border-r border-slate-700 last:border-0 flex items-center justify-center";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button className="bg-orange-600 hover:bg-orange-700 font-bold"><Plus className="h-4 w-4 mr-2" />New Invoice</Button>}
      </DialogTrigger>

      <DialogContent className="max-w-[98vw] lg:max-w-[1400px] h-[96vh] flex flex-col bg-[#020617] text-white border-slate-800 p-0 overflow-hidden rounded-2xl shadow-2xl [&>button]:hidden">
        
        {/* HEADER */}
        <div className="flex-none px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <DialogTitle className="text-xl font-black text-orange-500 flex items-center gap-2 tracking-tight uppercase">
            <ReceiptText className="h-6 w-6 text-white" /> TRAVEL ERP SYSTEM
          </DialogTitle>
          <X className="h-5 w-5 text-slate-500 cursor-pointer hover:text-white transition-colors" onClick={() => setOpen(false)} />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#020617] scrollbar-hide">
          
          {/* TOP CONFIG BAR */}
          <div className="grid grid-cols-5 gap-4 p-4 bg-slate-900/20 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <Label className="text-[10px] text-orange-500 font-bold uppercase">Template</Label>
              <Select value={formData.template_id} onValueChange={(v) => setFormData({...formData, template_id: v})}>
                <SelectTrigger className="h-9 bg-slate-950 border-slate-800 text-xs focus:ring-orange-500 focus:ring-offset-0"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-900 text-white border-slate-700">
                    <SelectItem value="Professional Blue">Professional Blue</SelectItem>
                    <SelectItem value="Modern Dark">Modern Dark</SelectItem>
                    <SelectItem value="Luxury Gold">Luxury Gold</SelectItem>
                    <SelectItem value="Emerald Tech">Emerald Tech</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-slate-500 font-bold uppercase">Customer Name</Label>
              <Input className="h-9 bg-slate-950 border-slate-800 text-xs focus:border-orange-500 focus-visible:ring-0" placeholder="Enter Client Name" value={formData.customer_name} onChange={(e)=>setFormData({...formData, customer_name: e.target.value})} />
            </div>
            <div className="space-y-1"><Label className="text-[10px] text-slate-500 font-bold uppercase">Due Date</Label><Input type="date" className="h-9 bg-slate-950 border-slate-800 text-xs [color-scheme:dark] focus:border-orange-500 focus-visible:ring-0" value={formData.due_date} onChange={(e)=>setFormData({...formData, due_date: e.target.value})} /></div>
            <div className="space-y-1"><Label className="text-[10px] text-slate-500 font-bold uppercase">Status</Label>
              <Select onValueChange={(v) => setFormData({...formData, status: v})} defaultValue="sent">
                <SelectTrigger className="h-9 bg-slate-950 border-slate-800 text-xs focus:ring-orange-500 focus:ring-offset-0"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-900 text-white border-slate-700"><SelectItem value="sent">Sent</SelectItem><SelectItem value="paid">Paid</SelectItem></SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label className="text-[10px] text-slate-500 font-bold uppercase">Attachments</Label>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} multiple />
              <div onClick={() => fileInputRef.current?.click()} className="h-9 border border-dashed border-slate-700 rounded bg-slate-950/50 flex items-center justify-center cursor-pointer hover:border-orange-500 transition-all">
                <UploadCloud className="h-4 w-4 mr-2 text-orange-500" />
                <span className="text-[9px] text-slate-400">{formData.files.length > 0 ? `${formData.files.length} Files` : "Upload Docs"}</span>
              </div>
            </div>
          </div>

          {/* TABLES SECTIONS */}
          <div className="space-y-6">
            {/* Flight Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center pl-1">
                <h3 className="text-blue-400 font-black text-[12px] uppercase tracking-tighter flex items-center gap-2"><Plane size={16}/> Flight Details</h3>
                <Button onClick={() => addMoreRow(setFlightRows)} size="sm" className="h-7 bg-blue-600 hover:bg-blue-500 text-[10px] font-bold">+ ADD ROW</Button>
              </div>
              <div className="rounded-lg border border-slate-800 overflow-hidden shadow-2xl">
                <div className="grid grid-cols-[1fr_1fr_0.8fr_0.8fr_0.7fr_0.7fr_1fr_1fr_0.7fr_40px] bg-slate-900 border-b border-slate-800">
                  <div className={headerLabelClass}>Date</div><div className={headerLabelClass}>Airline</div><div className={headerLabelClass}>Dep</div><div className={headerLabelClass}>Arr</div><div className={headerLabelClass}>Dep T</div><div className={headerLabelClass}>Arr T</div><div className={headerLabelClass}>Ref #</div><div className={headerLabelClass}>Supplier</div><div className={headerLabelClass}>Baggage</div><div className="bg-slate-900"></div>
                </div>
                {flightRows.map((_, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_0.8fr_0.8fr_0.7fr_0.7fr_1fr_1fr_0.7fr_40px] border-b border-slate-800/50 last:border-0">
                    <Input type="date" className={gridInputClass + " [color-scheme:dark]"} /><Input placeholder="..." className={gridInputClass} /><Input placeholder="..." className={gridInputClass} /><Input placeholder="..." className={gridInputClass} /><Input type="time" className={gridInputClass + " [color-scheme:dark] px-1"} /><Input type="time" className={gridInputClass + " [color-scheme:dark] px-1"} /><Input placeholder="..." className={gridInputClass} /><Input placeholder="..." className={gridInputClass} /><Input placeholder="..." className={gridInputClass + " border-r-0"} />
                    <div className="flex items-center justify-center bg-slate-950 border-l border-slate-800"><Trash2 size={13} className="text-slate-600 hover:text-red-500 cursor-pointer" onClick={() => deleteRow(i, setFlightRows)} /></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hotel Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center pl-1">
                <h3 className="text-emerald-400 font-black text-[12px] uppercase tracking-tighter flex items-center gap-2"><Hotel size={16}/> Accommodation</h3>
                <Button onClick={() => addMoreRow(setHotelRows)} size="sm" className="h-7 bg-emerald-600 hover:bg-emerald-500 text-[10px] font-bold">+ ADD ROW</Button>
              </div>
              <div className="rounded-lg border border-slate-800 overflow-hidden shadow-2xl">
                <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_1fr_0.8fr_0.7fr_40px] bg-slate-900 border-b border-slate-800">
                  <div className={headerLabelClass}>Hotel Name</div><div className={headerLabelClass}>Meal</div><div className={headerLabelClass}>Room</div><div className={headerLabelClass}>In</div><div className={headerLabelClass}>Out</div><div className={headerLabelClass}>Ref #</div><div className={headerLabelClass}>Supplier</div><div className={headerLabelClass}>Price</div><div className={headerLabelClass}>Guests</div><div className="bg-slate-900"></div>
                </div>
                {hotelRows.map((_, i) => (
                  <div key={i} className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_1fr_0.8fr_0.7fr_40px] border-b border-slate-800/50 last:border-0">
                    <Input placeholder="..." className={gridInputClass} /><Input placeholder="..." className={gridInputClass} /><Input placeholder="..." className={gridInputClass} /><Input type="date" className={gridInputClass + " [color-scheme:dark]"} /><Input type="date" className={gridInputClass + " [color-scheme:dark]"} /><Input placeholder="..." className={gridInputClass} /><Input placeholder="..." className={gridInputClass} /><Input placeholder="..." className={gridInputClass} /><Input placeholder="..." className={gridInputClass + " border-r-0"} />
                    <div className="flex items-center justify-center bg-slate-950 border-l border-slate-800"><Trash2 size={13} className="text-slate-600 hover:text-red-500 cursor-pointer" onClick={() => deleteRow(i, setHotelRows)} /></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transport Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center pl-1">
                <h3 className="text-purple-400 font-black text-[12px] uppercase tracking-tighter flex items-center gap-2"><Car size={16}/> Transport</h3>
                <Button onClick={() => addMoreRow(setTransportRows)} size="sm" className="h-7 bg-purple-600 hover:bg-purple-500 text-[10px] font-bold">+ ADD ROW</Button>
              </div>
              <div className="rounded-lg border border-slate-800 overflow-hidden shadow-2xl">
                <div className="grid grid-cols-[1fr_1fr_1.2fr_1.2fr_1fr_1fr_1fr_0.5fr_0.8fr_40px] bg-slate-900 border-b border-slate-800">
                  <div className={headerLabelClass}>Date</div><div className={headerLabelClass}>Vehicle</div><div className={headerLabelClass}>Pickup</div><div className={headerLabelClass}>Dropoff</div><div className={headerLabelClass}>Driver</div><div className={headerLabelClass}>Contact</div><div className={headerLabelClass}>Supplier</div><div className={headerLabelClass}>Pax</div><div className={headerLabelClass}>Cost</div><div className="bg-slate-900"></div>
                </div>
                {transportRows.map((_, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_1.2fr_1.2fr_1fr_1fr_1fr_0.5fr_0.8fr_40px] border-b border-slate-800/50 last:border-0">
                    <Input type="date" className={gridInputClass + " [color-scheme:dark]"} /><Input placeholder="..." className={gridInputClass} /><Input placeholder="..." className={gridInputClass} /><Input placeholder="..." className={gridInputClass} /><Input placeholder="..." className={gridInputClass} /><Input placeholder="..." className={gridInputClass} /><Input placeholder="..." className={gridInputClass} /><Input placeholder="..." className={gridInputClass} /><Input placeholder="..." className={gridInputClass + " border-r-0"} />
                    <div className="flex items-center justify-center bg-slate-950 border-l border-slate-800"><Trash2 size={13} className="text-slate-600 hover:text-red-500 cursor-pointer" onClick={() => deleteRow(i, setTransportRows)} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FINANCIAL SUMMARY */}
          <div className="grid grid-cols-12 gap-5 pt-4 border-t border-slate-800/50">
            <div className="col-span-4 p-5 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4 shadow-xl border-l-4 border-l-orange-500">
              <div className="flex items-center gap-2 text-orange-500 font-bold text-[11px] uppercase tracking-widest"><History size={14}/> Settlement Summary</div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-[9px] text-slate-500 uppercase font-bold">Total Selling Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-orange-500" />
                    <Input type="number" className="h-9 pl-8 bg-slate-950 border-slate-800 text-sm font-bold focus:border-orange-500" 
                      onChange={(e) => setFormData({...formData, total_selling: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1">
                      <Label className="text-[9px] text-slate-500 uppercase font-bold">Received Amount</Label>
                      <Input type="number" placeholder="0.00" className="h-9 bg-slate-950 border-emerald-500/30 text-emerald-400 font-bold focus:border-emerald-500" 
                        onChange={(e) => setFormData({...formData, payment_received: parseFloat(e.target.value) || 0})} />
                   </div>
                   <div className="space-y-1">
                      <Label className="text-[9px] text-slate-500 uppercase font-bold">Method</Label>
                      <Select onValueChange={(v) => setFormData({...formData, payment_method: v})} defaultValue="Bank Transfer">
                        <SelectTrigger className="h-9 bg-slate-950 border-slate-800 text-[10px] focus:ring-0"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-slate-900 text-white border-slate-700">
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                          <SelectItem value="Cash">Cash Payment</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                </div>
              </div>
            </div>

            <div className="col-span-5 p-5 bg-slate-900/40 border border-slate-800 rounded-2xl flex items-center justify-around shadow-xl">
              <div className="text-center">
                <span className="text-[10px] text-slate-500 uppercase font-black block mb-1">Grand Total</span>
                <span className="text-4xl font-black text-white tracking-tighter">${grandTotal.toLocaleString()}</span>
              </div>
              <div className="h-12 w-[1px] bg-slate-800"></div>
              <div className="text-center">
                <span className="text-[10px] text-red-500/70 uppercase font-black block mb-1">Balance Due</span>
                <span className="text-4xl font-black text-red-500 tracking-tighter">${remaining.toLocaleString()}</span>
              </div>
            </div>

            <div className="col-span-3 p-5 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl">
              <Label className="text-[9px] text-slate-500 uppercase font-bold mb-2 block">Internal Agency Notes</Label>
              <Textarea placeholder="Booking notes..." className="h-[74px] bg-slate-950 border-slate-800 text-[10px] resize-none focus:border-orange-500" />
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex-none p-4 bg-slate-950 border-t border-slate-800 flex justify-end items-center gap-6 px-10">
          <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white uppercase text-[10px] font-bold transition-colors">Discard Changes</button>
          
          <Button 
            onClick={handleSubmit}
            className="bg-orange-600 hover:bg-orange-700 h-11 px-10 font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95"
          >
            <Save className="h-4 w-4 mr-2" /> Save & Generate Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}