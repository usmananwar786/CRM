// import { useState, useEffect } from "react";
// import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Plane, Hotel, Car, Save, Upload, Plus, Trash2, Package, FileText } from "lucide-react";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// const Field = ({ label, type = "text", onChange, value, placeholder }: any) => (
//   <div className="space-y-1.5 text-left">
//     <Label className="text-[10px] text-slate-400 uppercase font-bold ml-1">{label}</Label>
//     <Input 
//       type={type}
//       placeholder={placeholder}
//       value={value || ""}
//       onChange={onChange}
//       className="bg-[#0D1224] border-slate-800 h-9 text-xs text-white focus:border-[#FF5722] [color-scheme:dark]"
//     />
//   </div>
// );

// export function CreateBookingDialog() {
//   const [open, setOpen] = useState(false);
//   const [showPackage, setShowPackage] = useState(false);
//   const [selectedFileName, setSelectedFileName] = useState<string>("");
//   const [screenshotBase64, setScreenshotBase64] = useState<string>("");

//   const [extraFlightFields, setExtraFlightFields] = useState<string[]>([]);
//   const [extraHotelFields, setExtraHotelFields] = useState<string[]>([]);
//   const [extraTransportFields, setExtraTransportFields] = useState<string[]>([]);
//   const [extraPackageFields, setExtraPackageFields] = useState<string[]>([]);

//   const [bookingData, setBookingData] = useState({
//     customer: { firstName: "", lastName: "" },
//     flight: { airline: "", flightNo: "", date: "", dep: "", arr: "", time: "", baggage: "", pnr: "", class: "", price: "0" },
//     hotel: { name: "", type: "", meal: "", checkIn: "", checkOut: "", nights: "", supplier: "", bookingId: "", contact: "", price: "0" },
//     transport: { date: "", mode: "", pickUp: "", dropOff: "", driver: "", contact: "", supplier: "", pax: "", notes: "", price: "0" },
//     package: { title: "", category: "", customCategory: "", price: "0" },
//     atol: false
//   });

//   // --- Calculate Grand Total ---
//   const calculateGrandTotal = () => {
//     const fPrice = parseFloat(bookingData.flight.price) || 0;
//     const hPrice = parseFloat(bookingData.hotel.price) || 0;
//     const tPrice = parseFloat(bookingData.transport.price) || 0;
//     const pPrice = parseFloat(bookingData.package.price) || 0;
//     return (fPrice + hPrice + tPrice + pPrice).toFixed(2);
//   };

//   const handleNestedChange = (section: string, field: string, value: string) => {
//     setBookingData((prev) => ({
//       ...prev,
//       [section]: {
//         //@ts-ignore
//         ...prev[section],
//         [field]: value,
//       },
//     }));
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       setSelectedFileName(file.name);
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setScreenshotBase64(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleGenerateInvoice = () => {
//     const doc = new jsPDF();
//     doc.setFontSize(22);
//     doc.setTextColor(40, 40, 40);
//     doc.text("CLIENT TRAVEL AGENCY", 105, 20, { align: "center" });
//     doc.setFontSize(10);
//     doc.text("CONFIRMED BOOKING ITINERARY", 105, 28, { align: "center" });
//     doc.line(15, 32, 195, 32);

//     doc.setFontSize(12);
//     doc.text(`Guest: ${bookingData.customer.firstName} ${bookingData.customer.lastName}`, 15, 42);
//     doc.text(`Date: ${new Date().toLocaleDateString()}`, 155, 42);

//     autoTable(doc, {
//       startY: 50,
//       head: [['Service', 'Details', 'Price']],
//       body: [
//         ['Flight', `${bookingData.flight.airline} (${bookingData.flight.dep}-${bookingData.flight.arr})`, `$${bookingData.flight.price}`],
//         ['Hotel', `${bookingData.hotel.name} (${bookingData.hotel.nights} Nights)`, `$${bookingData.hotel.price}`],
//         ['Transport', `${bookingData.transport.mode} (${bookingData.transport.pickUp})`, `$${bookingData.transport.price}`],
//         ['Package', bookingData.package.title || 'N/A', `$${bookingData.package.price}`],
//       ],
//       foot: [['', 'GRAND TOTAL', `$${calculateGrandTotal()}`]],
//       headStyles: { fillColor: [30, 41, 59] },
//       footStyles: { fillColor: [255, 87, 34] }
//     });

//     if (screenshotBase64) {
//       const finalY = (doc as any).lastAutoTable.finalY + 10;
//       doc.text("Reference Screenshot:", 15, finalY);
//       doc.addImage(screenshotBase64, 'JPEG', 15, finalY + 5, 180, 100);
//     }

//     doc.save(`Invoice_${bookingData.customer.lastName}.pdf`);
//   };

//   const handleSaveBooking = async () => {
//     try {
//       const finalPayload = { 
//         ...bookingData, 
//         grandTotal: calculateGrandTotal(),
//         screenshot: screenshotBase64,
//         extraFlightFields, extraHotelFields, extraTransportFields, extraPackageFields 
//       };
//       const res = await fetch("http://localhost:5000/api/bookings", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(finalPayload)
//       });
//       if (res.ok) { alert("Booking Saved!"); setOpen(false); }
//     } catch (err) { alert("Database error"); }
//   };

//   const addField = (setter: any) => setter((prev: any) => [...prev, ""]);
//   const removeField = (setter: any, index: number) => setter((prev: any) => prev.filter((_: any, i: number) => i !== index));
//   const handleFieldChange = (setter: any, index: number, value: string) => {
//     setter((prev: any) => { const updated = [...prev]; updated[index] = value; return updated; });
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button className="bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold px-4 h-10 text-xs uppercase">New Booking</Button>
//       </DialogTrigger>

//       <DialogContent className="max-w-[1100px] max-h-[98vh] overflow-y-auto bg-[#050A18] text-white border-slate-800 p-0 rounded-lg">
//         <form className="p-6 space-y-8" onSubmit={(e) => e.preventDefault()}>
          
//           <div className="grid grid-cols-2 gap-6">
//             <Field label="Customer First Name" value={bookingData.customer.firstName} onChange={(e:any) => handleNestedChange('customer', 'firstName', e.target.value)} />
//             <Field label="Customer Last Name" value={bookingData.customer.lastName} onChange={(e:any) => handleNestedChange('customer', 'lastName', e.target.value)} />
//           </div>

//           {/* FLIGHT SECTION */}
//           <div className="border border-blue-500/20 bg-[#080E1F] p-5 rounded-md">
//             <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
//                <h3 className="text-blue-400 text-[10px] font-black uppercase flex items-center gap-2 underline italic"><Plane size={12}/> Flight Information</h3>
//                <Button type="button" onClick={() => addField(setExtraFlightFields)} className="h-6 px-2 text-[9px] bg-blue-600 hover:bg-blue-500 text-white gap-1 rounded-full"><Plus size={10} /> Add More</Button>
//             </div>
//             <div className="grid grid-cols-3 gap-4">
//               <Field label="Airline Name" value={bookingData.flight.airline} onChange={(e:any) => handleNestedChange('flight', 'airline', e.target.value)} />
//               <Field label="Flight No" value={bookingData.flight.flightNo} onChange={(e:any) => handleNestedChange('flight', 'flightNo', e.target.value)} />
//               <Field label="Departure Date" type="date" value={bookingData.flight.date} onChange={(e:any) => handleNestedChange('flight', 'date', e.target.value)} />
//               <Field label="Departure Airport" value={bookingData.flight.dep} onChange={(e:any) => handleNestedChange('flight', 'dep', e.target.value)} />
//               <Field label="Arrival Airport" value={bookingData.flight.arr} onChange={(e:any) => handleNestedChange('flight', 'arr', e.target.value)} />
//               <Field label="Time" type="time" value={bookingData.flight.time} onChange={(e:any) => handleNestedChange('flight', 'time', e.target.value)} />
//               <Field label="Baggage" value={bookingData.flight.baggage} onChange={(e:any) => handleNestedChange('flight', 'baggage', e.target.value)} />
//               <Field label="PNR Reference" value={bookingData.flight.pnr} onChange={(e:any) => handleNestedChange('flight', 'pnr', e.target.value)} />
//               <Field label="Flight Price ($)" type="number" value={bookingData.flight.price} onChange={(e:any) => handleNestedChange('flight', 'price', e.target.value)} />
//             </div>
//             {extraFlightFields.map((val, i) => (
//               <div key={i} className="flex items-end gap-2 mt-3">
//                 <div className="flex-1"><Field label={`Extra Info ${i+1}`} value={val} onChange={(e:any) => handleFieldChange(setExtraFlightFields, i, e.target.value)} /></div>
//                 <Button onClick={() => removeField(setExtraFlightFields, i)} className="bg-red-900/40 h-9 px-2 hover:bg-red-600"><Trash2 size={14}/></Button>
//               </div>
//             ))}
//           </div>

//           {/* HOTEL SECTION */}
//           <div className="border border-emerald-500/20 bg-[#080E1F] p-5 rounded-md">
//             <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
//                <h3 className="text-emerald-400 text-[10px] font-black uppercase flex items-center gap-2 underline italic"><Hotel size={12}/> Hotel & Accommodation</h3>
//                <Button type="button" onClick={() => addField(setExtraHotelFields)} className="h-6 px-2 text-[9px] bg-emerald-600 hover:bg-emerald-500 text-white gap-1 rounded-full"><Plus size={10} /> Add More</Button>
//             </div>
//             <div className="grid grid-cols-3 gap-4">
//               <Field label="Hotel Name" value={bookingData.hotel.name} onChange={(e:any) => handleNestedChange('hotel', 'name', e.target.value)} />
//               <Field label="Room Type" value={bookingData.hotel.type} onChange={(e:any) => handleNestedChange('hotel', 'type', e.target.value)} />
//               <Field label="Meal Plan" value={bookingData.hotel.meal} onChange={(e:any) => handleNestedChange('hotel', 'meal', e.target.value)} />
//               <Field label="Check In" type="date" value={bookingData.hotel.checkIn} onChange={(e:any) => handleNestedChange('hotel', 'checkIn', e.target.value)} />
//               <Field label="Check Out" type="date" value={bookingData.hotel.checkOut} onChange={(e:any) => handleNestedChange('hotel', 'checkOut', e.target.value)} />
//               <Field label="Total Nights" type="number" value={bookingData.hotel.nights} onChange={(e:any) => handleNestedChange('hotel', 'nights', e.target.value)} />
//               <Field label="Supplier" value={bookingData.hotel.supplier} onChange={(e:any) => handleNestedChange('hotel', 'supplier', e.target.value)} />
//               <Field label="Booking ID" value={bookingData.hotel.bookingId} onChange={(e:any) => handleNestedChange('hotel', 'bookingId', e.target.value)} />
//               <Field label="Hotel Price ($)" type="number" value={bookingData.hotel.price} onChange={(e:any) => handleNestedChange('hotel', 'price', e.target.value)} />
//             </div>
//             {extraHotelFields.map((val, i) => (
//               <div key={i} className="flex items-end gap-2 mt-3">
//                 <div className="flex-1"><Field label={`Extra Info ${i+1}`} value={val} onChange={(e:any) => handleFieldChange(setExtraHotelFields, i, e.target.value)} /></div>
//                 <Button onClick={() => removeField(setExtraHotelFields, i)} className="bg-red-900/40 h-9 px-2 hover:bg-red-600"><Trash2 size={14}/></Button>
//               </div>
//             ))}
//           </div>

//           {/* TRANSPORT SECTION */}
//           <div className="border border-purple-500/20 bg-[#080E1F] p-5 rounded-md">
//             <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
//                <h3 className="text-purple-400 text-[10px] font-black uppercase flex items-center gap-2 underline italic"><Car size={12}/> Transport & Transfers</h3>
//                <Button type="button" onClick={() => addField(setExtraTransportFields)} className="h-6 px-2 text-[9px] bg-purple-600 hover:bg-purple-500 text-white gap-1 rounded-full"><Plus size={10} /> Add More</Button>
//             </div>
//             <div className="grid grid-cols-3 gap-4">
//               <Field label="Date" type="date" value={bookingData.transport.date} onChange={(e:any) => handleNestedChange('transport', 'date', e.target.value)} />
//               <Field label="Vehicle Mode" value={bookingData.transport.mode} onChange={(e:any) => handleNestedChange('transport', 'mode', e.target.value)} />
//               <Field label="Pick up Point" value={bookingData.transport.pickUp} onChange={(e:any) => handleNestedChange('transport', 'pickUp', e.target.value)} />
//               <Field label="Drop off Point" value={bookingData.transport.dropOff} onChange={(e:any) => handleNestedChange('transport', 'dropOff', e.target.value)} />
//               <Field label="Driver Name" value={bookingData.transport.driver} onChange={(e:any) => handleNestedChange('transport', 'driver', e.target.value)} />
//               <Field label="Driver Contact" value={bookingData.transport.contact} onChange={(e:any) => handleNestedChange('transport', 'contact', e.target.value)} />
//               <Field label="Supplier" value={bookingData.transport.supplier} onChange={(e:any) => handleNestedChange('transport', 'supplier', e.target.value)} />
//               <Field label="No of Pax" type="number" value={bookingData.transport.pax} onChange={(e:any) => handleNestedChange('transport', 'pax', e.target.value)} />
//               <Field label="Transport Price ($)" type="number" value={bookingData.transport.price} onChange={(e:any) => handleNestedChange('transport', 'price', e.target.value)} />
//             </div>
//             {extraTransportFields.map((val, i) => (
//               <div key={i} className="flex items-end gap-2 mt-3">
//                 <div className="flex-1"><Field label={`Extra Info ${i+1}`} value={val} onChange={(e:any) => handleFieldChange(setExtraTransportFields, i, e.target.value)} /></div>
//                 <Button onClick={() => removeField(setExtraTransportFields, i)} className="bg-red-900/40 h-9 px-2 hover:bg-red-600"><Trash2 size={14}/></Button>
//               </div>
//             ))}
//           </div>

//           {/* PACKAGE BUILDER */}
//           <div className="pb-4 border-b border-slate-800">
//             <Button type="button" size="sm" onClick={() => setShowPackage(!showPackage)} className="bg-slate-800 hover:bg-slate-700 text-[10px] h-8 gap-2 border border-slate-600">
//               <Plus size={14}/> {showPackage ? "Remove Package" : "Configure Package Itinerary"}
//             </Button>

//             {showPackage && (
//               <div className="mt-4 p-5 border border-orange-500/30 bg-orange-500/5 rounded-md space-y-4">
//                 <div className="flex justify-between items-center">
//                    <h3 className="text-orange-400 text-[10px] font-black uppercase flex items-center gap-2"><Package size={12}/> Package Details</h3>
//                    <Button type="button" onClick={() => addField(setExtraPackageFields)} className="h-6 px-2 text-[9px] bg-orange-600 hover:bg-orange-500 text-white gap-1 rounded-full"><Plus size={10} /> Add Info</Button>
//                 </div>
//                 <div className="grid grid-cols-4 gap-4">
//                   <Field label="Package Title" value={bookingData.package.title} onChange={(e:any) => handleNestedChange('package', 'title', e.target.value)} />
//                   <div className="space-y-1.5">
//                     <Label className="text-[10px] text-slate-400 uppercase font-bold ml-1">Category</Label>
//                     <Select onValueChange={(v) => handleNestedChange('package', 'category', v)}>
//                       <SelectTrigger className="bg-[#0D1224] border-slate-700 h-9 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
//                       <SelectContent className="bg-[#1e293b] text-white">
//                         <SelectItem value="luxury">Luxury</SelectItem>
//                         <SelectItem value="umrah">Umrah</SelectItem>
//                         <SelectItem value="adventure">Adventure</SelectItem>
//                         <SelectItem value="honeymoon">Honeymoon</SelectItem>
//                         <SelectItem value="other">Other</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <Field label="Price" type="number" value={bookingData.package.price} onChange={(e:any) => handleNestedChange('package', 'price', e.target.value)} />
//                   <div className="space-y-1.5 flex flex-col justify-end">
//                     <div className="border border-dashed border-slate-700 rounded h-9 flex items-center justify-center bg-[#0D1224] relative cursor-pointer overflow-hidden px-2">
//                       <Upload size={12} className="mr-2 text-slate-500" />
//                       <span className="text-[9px] text-slate-500 uppercase font-bold truncate">
//                         {selectedFileName || "Upload File"}
//                       </span>
//                       <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
//                     </div>
//                   </div>
//                 </div>
//                 {extraPackageFields.map((val, i) => (
//                   <div key={i} className="flex items-end gap-2 mt-3">
//                     <div className="flex-1"><Field label={`Extra Info ${i+1}`} value={val} onChange={(e:any) => handleFieldChange(setExtraPackageFields, i, e.target.value)} /></div>
//                     <Button onClick={() => removeField(setExtraPackageFields, i)} className="bg-red-900/40 h-9 px-2 hover:bg-red-600"><Trash2 size={14}/></Button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* FOOTER */}
//           <div className="pt-4 flex items-center justify-between sticky bottom-0 bg-[#050A18] pb-4 border-t border-slate-800">
//             <div className="flex flex-col">
//               <span className="text-[9px] text-slate-500 font-bold uppercase">Grand Total</span>
//               <span className="text-3xl font-black text-[#FF5722]">${calculateGrandTotal()}</span>
//             </div>
//             <div className="flex gap-4">
//               <Button type="button" onClick={handleSaveBooking} className="bg-[#1e293b] text-white h-10 px-6 uppercase text-[10px] font-bold border border-slate-700"><Save size={14} className="mr-2"/> Save Booking</Button>
//               <Button type="button" onClick={handleGenerateInvoice} className="bg-[#FF5722] text-white h-10 px-8 uppercase text-[10px] font-black tracking-widest">Generate Invoice</Button>
//             </div>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }





import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plane, Hotel, Car, Save, Plus, Trash2, FileText, X, Package, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast"; // Added for notifications
import jsPDF from "jspdf";

const Field = ({ label, type = "text", value, onChange, placeholder }: any) => (
  <div className="flex flex-col gap-1 w-full">
    <Label className="text-[9px] text-slate-500 uppercase font-bold ml-1 tracking-tight">{label}</Label>
    <Input
      type={type}
      placeholder={placeholder || label}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="bg-[#0D1224] border-slate-800 h-8 text-[11px] text-white focus:border-[#FF5722] focus:ring-0 transition-all px-2"
    />
  </div>
);

// Added onBookingCreated prop to refresh the list in Bookings.tsx
export function CreateBookingDialog({ onBookingCreated }: { onBookingCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false); // New loading state
  const [showPackage, setShowPackage] = useState(false);
  const { toast } = useToast(); // Toast hook

  const [customer, setCustomer] = useState({ firstName: "", lastName: "" });
  const [flights, setFlights] = useState([{ date: "", airline: "", flightNo: "", dep: "", arr: "", depT: "", arrT: "", ref: "", baggage: "", price: "0" }]);
  const [hotels, setHotels] = useState([{ name: "", meal: "", room: "", checkIn: "", checkOut: "", ref: "", price: "0", guests: "" }]);
  const [transports, setTransports] = useState([{ date: "", mode: "", pickUp: "", dropOff: "", driver: "", contact: "", pax: "", price: "0" }]);
  const [packages, setPackages] = useState([{ title: "", category: "", price: "0", fileName: "", fileData: "" }]);

  const addRow = (setter: any, template: any) => setter((prev: any) => [...prev, template]);
  
  const removeRow = (setter: any, index: number) => {
    if (index === 0 && setter !== setPackages) return; 
    setter((prev: any) => prev.filter((_: any, i: number) => i !== index));
  };

  const updateRow = (setter: any, index: number, field: string, value: string) => {
    setter((prev: any) => {
      const newArr = [...prev];
      newArr[index] = { ...newArr[index], [field]: value };
      return newArr;
    });
  };

  const handleFileChange = (e: any, index: number) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateRow(setPackages, index, 'fileName', file.name);
        updateRow(setPackages, index, 'fileData', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateTotal = () => {
    const fTotal = flights.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0);
    const hTotal = hotels.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0);
    const tTotal = transports.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0);
    const pTotal = showPackage ? packages.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0) : 0;
    return (fTotal + hTotal + tTotal + pTotal).toFixed(2);
  };

  // --- UPDATED SAVE FUNCTION FOR DATABASE ---
  const handleSaveBooking = async () => {
    if (!customer.firstName || !customer.lastName) {
      toast({ title: "Error", description: "Customer name is required", variant: "destructive" });
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    // Preparing final data object for backend
    const bookingData = {
      customerName: `${customer.firstName} ${customer.lastName}`,
      packageId: showPackage ? (packages[0]?.title || "Custom") : "Custom",
      travelDate: flights[0]?.date || new Date().toISOString(),
      totalAmount: calculateTotal(),
      status: "Pending",
      // Storing complex objects as strings or JSON depending on your backend schema
      flightDetails: JSON.stringify(flights),
      hotelDetails: JSON.stringify(hotels),
      transportDetails: JSON.stringify(transports),
      specialRequests: showPackage ? `Category: ${packages[0]?.category}` : ""
    };

    try {
      const response = await fetch("http://localhost:5000/api/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        toast({ title: "Success!", description: "Booking saved to CRM successfully." });
        onBookingCreated(); // Refresh the table
        setOpen(false); // Close dialog
      } else {
        const result = await response.json();
        throw new Error(result.error || "Failed to save booking");
      }
    } catch (error: any) {
      toast({ title: "Database Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = () => {
    const doc = new jsPDF("landscape");
    let y = 20;

    const drawCell = (x: number, y: number, w: number, h: number, text: string, isHeader = false) => {
      doc.setDrawColor(180);
      if (isHeader) {
        doc.setFillColor(235, 235, 235);
        doc.rect(x, y, w, h, 'FD');
        doc.setFont("helvetica", "bold");
      } else {
        doc.rect(x, y, w, h);
        doc.setFont("helvetica", "normal");
      }
      doc.setFontSize(8);
      doc.text(text || "-", x + 2, y + (h / 2) + 2);
    };

    doc.setFontSize(18);
    doc.setTextColor(255, 87, 34);
    doc.text("BOOKING ITINERARY", 148, y, { align: "center" });
    y += 12;

    doc.setTextColor(0);
    drawCell(15, y, 134, 10, `CUSTOMER: ${customer.firstName.toUpperCase()} ${customer.lastName.toUpperCase()}`, true);
    drawCell(149, y, 133, 10, `DATE: ${new Date().toLocaleDateString()}`, true);
    y += 15;

    // 1. FLIGHT TABLE
    doc.setFontSize(10);
    doc.text("FLIGHT DETAILS", 15, y);
    y += 5;
    const fHeaders = ["Date", "Airline", "Flight #", "Dep", "Arr", "Dep T", "Arr T", "Price"];
    const fWidths = [30, 40, 30, 30, 30, 30, 30, 47];
    let currentX = 15;
    fHeaders.forEach((h, i) => { drawCell(currentX, y, fWidths[i], 8, h, true); currentX += fWidths[i]; });
    y += 8;
    flights.forEach(f => {
      currentX = 15;
      [f.date, f.airline, f.flightNo, f.dep, f.arr, f.depT, f.arrT, f.price].forEach((d, i) => { drawCell(currentX, y, fWidths[i], 8, d); currentX += fWidths[i]; });
      y += 8;
    });

    // 2. ACCOMMODATION TABLE
    y += 10;
    doc.text("ACCOMMODATION", 15, y);
    y += 5;
    const hHeaders = ["Hotel Name", "Room", "Meal", "Check-In", "Check-Out", "Price"];
    const hWidths = [60, 40, 40, 40, 40, 47];
    currentX = 15;
    hHeaders.forEach((h, i) => { drawCell(currentX, y, hWidths[i], 8, h, true); currentX += hWidths[i]; });
    y += 8;
    hotels.forEach(h => {
      currentX = 15;
      [h.name, h.room, h.meal, h.checkIn, h.checkOut, h.price].forEach((d, i) => { drawCell(currentX, y, hWidths[i], 8, d); currentX += hWidths[i]; });
      y += 8;
    });

    // 3. TRANSPORT TABLE
    y += 10;
    doc.text("TRANSPORTATION", 15, y);
    y += 5;
    const tHeaders = ["Date", "Vehicle", "Pick Up", "Drop Off", "Pax", "Price"];
    const tWidths = [40, 50, 50, 50, 30, 47];
    currentX = 15;
    tHeaders.forEach((h, i) => { drawCell(currentX, y, tWidths[i], 8, h, true); currentX += tWidths[i]; });
    y += 8;
    transports.forEach(t => {
      currentX = 15;
      [t.date, t.mode, t.pickUp, t.dropOff, t.pax, t.price].forEach((d, i) => { drawCell(currentX, y, tWidths[i], 8, d); currentX += tWidths[i]; });
      y += 8;
    });

    if (showPackage) {
      y += 10;
      doc.text("PACKAGE OPTIONS & SCREENSHOTS", 15, y);
      y += 5;
      const pHeaders = ["Package Title", "Category", "Price", "File Name"];
      const pWidths = [80, 60, 40, 87];
      currentX = 15;
      pHeaders.forEach((h, i) => { drawCell(currentX, y, pWidths[i], 8, h, true); currentX += pWidths[i]; });
      y += 8;
      packages.forEach(p => {
        currentX = 15;
        [p.title, p.category, p.price, p.fileName].forEach((d, i) => { drawCell(currentX, y, pWidths[i], 8, d); currentX += pWidths[i]; });
        y += 8;
        if (p.fileData) {
            if (y > 150) { doc.addPage(); y = 20; }
            doc.addImage(p.fileData, "JPEG", 15, y, 50, 30);
            y += 35;
        }
      });
    }

    doc.save(`Invoice_${customer.lastName}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold h-9 px-4 text-xs uppercase shadow-lg">New Booking</Button>
      </DialogTrigger>

      <DialogContent className="max-w-[1200px] max-h-[90vh] overflow-y-auto bg-[#050A18] text-white border-slate-800 p-6 rounded-xl shadow-2xl [&>button]:hidden">
        <div className="space-y-5">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
               <h2 className="text-xl font-black tracking-tight text-white uppercase">New Booking</h2>
               <p className="text-slate-500 text-[9px] uppercase tracking-widest italic">Agent Console</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500 rounded-full" onClick={() => setOpen(false)}>
                <X size={20} />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-[#0D1224]/50 p-4 rounded-lg border border-slate-800/50">
            <Field label="First Name" value={customer.firstName} onChange={(v:any) => setCustomer({...customer, firstName: v})} />
            <Field label="Last Name" value={customer.lastName} onChange={(v:any) => setCustomer({...customer, lastName: v})} />
          </div>

          <section className="space-y-2">
            <div className="flex justify-between items-center border-b border-blue-500/20 pb-1">
              <h3 className="text-blue-400 text-[10px] font-bold uppercase flex items-center gap-2"><Plane size={14}/> Flight Details</h3>
              <Button onClick={() => addRow(setFlights, { price: "0" })} className="h-6 text-[8px] bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-600/20 px-2 leading-none">ADD FLIGHT</Button>
            </div>
            {flights.map((f, i) => (
              <div key={i} className="flex gap-1.5 items-end bg-slate-900/10 p-2 rounded border border-slate-800/30">
                <div className="flex-1"><Field label="Date" type="date" value={f.date} onChange={(v:any) => updateRow(setFlights, i, 'date', v)} /></div>
                <div className="flex-1"><Field label="Airline" value={f.airline} onChange={(v:any) => updateRow(setFlights, i, 'airline', v)} /></div>
                <div className="flex-[0.8]"><Field label="Flt #" value={f.flightNo} onChange={(v:any) => updateRow(setFlights, i, 'flightNo', v)} /></div>
                <div className="flex-[0.5]"><Field label="Dep" value={f.dep} onChange={(v:any) => updateRow(setFlights, i, 'dep', v)} /></div>
                <div className="flex-[0.5]"><Field label="Arr" value={f.arr} onChange={(v:any) => updateRow(setFlights, i, 'arr', v)} /></div>
                <div className="flex-[0.7]"><Field label="Dep T" type="time" value={f.depT} onChange={(v:any) => updateRow(setFlights, i, 'depT', v)} /></div>
                <div className="flex-[0.7]"><Field label="Arr T" type="time" value={f.arrT} onChange={(v:any) => updateRow(setFlights, i, 'arrT', v)} /></div>
                <div className="flex-[0.8]"><Field label="Price" type="number" value={f.price} onChange={(v:any) => updateRow(setFlights, i, 'price', v)} /></div>
                {i > 0 && <Button onClick={() => removeRow(setFlights, i)} className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white h-8 w-8 p-0 rounded-md"><Trash2 size={14}/></Button>}
              </div>
            ))}
          </section>

          <section className="space-y-2">
            <div className="flex justify-between items-center border-b border-emerald-500/20 pb-1">
              <h3 className="text-emerald-400 text-[10px] font-bold uppercase flex items-center gap-2"><Hotel size={14}/> Accommodation</h3>
              <Button onClick={() => addRow(setHotels, { price: "0" })} className="h-6 text-[8px] bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-600/20 px-2 leading-none">ADD HOTEL</Button>
            </div>
            {hotels.map((h, i) => (
              <div key={i} className="flex gap-1.5 items-end bg-slate-900/10 p-2 rounded border border-slate-800/30">
                <div className="flex-[1.5]"><Field label="Hotel Name" value={h.name} onChange={(v:any) => updateRow(setHotels, i, 'name', v)} /></div>
                <div className="flex-1"><Field label="Room" value={h.room} onChange={(v:any) => updateRow(setHotels, i, 'room', v)} /></div>
                <div className="flex-[0.8]"><Field label="Meal" value={h.meal} onChange={(v:any) => updateRow(setHotels, i, 'meal', v)} /></div>
                <div className="flex-1"><Field label="Check-In" type="date" value={h.checkIn} onChange={(v:any) => updateRow(setHotels, i, 'checkIn', v)} /></div>
                <div className="flex-1"><Field label="Check-Out" type="date" value={h.checkOut} onChange={(v:any) => updateRow(setHotels, i, 'checkOut', v)} /></div>
                <div className="flex-[0.8]"><Field label="Price" type="number" value={h.price} onChange={(v:any) => updateRow(setHotels, i, 'price', v)} /></div>
                {i > 0 && <Button onClick={() => removeRow(setHotels, i)} className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white h-8 w-8 p-0 rounded-md"><Trash2 size={14}/></Button>}
              </div>
            ))}
          </section>

          <section className="space-y-2">
            <div className="flex justify-between items-center border-b border-purple-500/20 pb-1">
              <h3 className="text-purple-400 text-[10px] font-bold uppercase flex items-center gap-2"><Car size={14}/> Transport</h3>
              <Button onClick={() => addRow(setTransports, { price: "0" })} className="h-6 text-[8px] bg-purple-600/10 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-600/20 px-2 leading-none">ADD TRANSPORT</Button>
            </div>
            {transports.map((t, i) => (
              <div key={i} className="flex gap-1.5 items-end bg-slate-900/10 p-2 rounded border border-slate-800/30">
                <div className="flex-1"><Field label="Date" type="date" value={t.date} onChange={(v:any) => updateRow(setTransports, i, 'date', v)} /></div>
                <div className="flex-1"><Field label="Vehicle" value={t.mode} onChange={(v:any) => updateRow(setTransports, i, 'mode', v)} /></div>
                <div className="flex-1"><Field label="Pick Up" value={t.pickUp} onChange={(v:any) => updateRow(setTransports, i, 'pickUp', v)} /></div>
                <div className="flex-1"><Field label="Drop Off" value={t.dropOff} onChange={(v:any) => updateRow(setTransports, i, 'dropOff', v)} /></div>
                <div className="flex-[0.6]"><Field label="Pax" value={t.pax} onChange={(v:any) => updateRow(setTransports, i, 'pax', v)} /></div>
                <div className="flex-[0.8]"><Field label="Price" type="number" value={t.price} onChange={(v:any) => updateRow(setTransports, i, 'price', v)} /></div>
                {i > 0 && <Button onClick={() => removeRow(setTransports, i)} className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white h-8 w-8 p-0 rounded-md"><Trash2 size={14}/></Button>}
              </div>
            ))}
          </section>

          <section className="space-y-2">
            <div className="flex justify-between items-center border-b border-orange-500/20 pb-1">
              <Button type="button" onClick={() => setShowPackage(!showPackage)} className="bg-orange-600/5 text-orange-400 border border-orange-600/20 h-7 text-[9px] gap-2 px-3">
                <Package size={12}/> {showPackage ? "HIDE PACKAGE" : "SHOW PACKAGE OPTIONS"}
              </Button>
              {showPackage && (
                <Button onClick={() => addRow(setPackages, { price: "0", fileName: "", fileData: "" })} className="h-6 text-[8px] bg-orange-600/10 hover:bg-orange-600 text-orange-400 border border-orange-600/20 px-2 leading-none">ADD NEW PACKAGE</Button>
              )}
            </div>
            
            {showPackage && packages.map((p, i) => (
              <div key={i} className="p-3 bg-orange-600/5 border border-orange-600/10 rounded-lg flex gap-3 items-end relative">
                <div className="flex-1"><Field label="Package Title" value={p.title} onChange={(v:any) => updateRow(setPackages, i, 'title', v)} /></div>
                <div className="flex-[0.8] flex flex-col gap-1">
                  <Label className="text-[9px] text-slate-500 uppercase font-bold ml-1">Category</Label>
                  <Select onValueChange={(v) => updateRow(setPackages, i, 'category', v)}>
                    <SelectTrigger className="bg-[#0D1224] border-slate-800 h-8 text-[11px]"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent className="bg-[#1e293b] text-white border-slate-700">
                      <SelectItem value="umrah">Umrah</SelectItem>
                      <SelectItem value="holiday">Holiday</SelectItem>
                      <SelectItem value="adventure">Adventure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-[0.5]"><Field label="Price" type="number" value={p.price} onChange={(v:any) => updateRow(setPackages, i, 'price', v)} /></div>
                <div className="flex-[0.8] h-8 border border-dashed border-slate-700 rounded bg-[#0D1224] flex items-center justify-center relative">
                    <Upload size={12} className="text-slate-500 mr-2" />
                    <span className="text-[9px] text-slate-500 truncate px-1">{p.fileName || "UPLOAD SCREENSHOT"}</span>
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, i)} />
                </div>
                {i > 0 && <Button onClick={() => removeRow(setPackages, i)} className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white h-8 w-8 p-0 rounded-md shrink-0"><Trash2 size={14}/></Button>}
              </div>
            ))}
          </section>

          <div className="pt-4 border-t border-slate-800 flex justify-between items-center bg-[#050A18] sticky bottom-0 z-10">
            <div>
              <Label className="text-[9px] text-slate-500 font-bold uppercase block tracking-tighter">Total Amount</Label>
              <span className="text-3xl font-black text-white"><span className="text-[#FF5722] mr-1">$</span>{calculateTotal()}</span>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSaveBooking} 
                disabled={loading}
                className="bg-slate-800 text-white h-10 px-4 font-bold uppercase text-[10px] gap-2 rounded-lg hover:bg-slate-700"
              >
                <Save size={16}/> {loading ? "Saving..." : "Save to CRM"}
              </Button>
              <Button onClick={handleGenerateInvoice} className="bg-[#FF5722] text-white h-10 px-6 font-black uppercase text-[10px] gap-2 rounded-lg shadow-lg hover:bg-[#E64A19]">
                <FileText size={16}/> Invoice
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}