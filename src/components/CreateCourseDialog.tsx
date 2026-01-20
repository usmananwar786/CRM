import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, GraduationCap, Upload, Image as ImageIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function CreateCourseDialog({ onCourseCreated }: { onCourseCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  // 🔹 File Selection Handle karna
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string); // Preview dikhane ke liye
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // Note: Agar aap direct server pe file upload kar rahe hain to FormData bhejenge
    // Filhal hum base64 ya URL placeholder use kar rahe hain as per your current setup
    const courseData = {
      title: formData.get("title"),
      description: formData.get("description"),
      thumbnail_url: preview || "https://via.placeholder.com/150", // File preview ya default image
      target_audience: formData.get("target"),
      duration: formData.get("duration"),
    };

    try {
      const response = await fetch("http://localhost:5000/api/courses/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Course created successfully!" });
        setOpen(false);
        setPreview(null);
        onCourseCreated(); 
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Course save nahi ho saka. MySQL check karein.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          type="button"
          onClick={() => setOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
        >
          <Plus className="h-5 w-5 mr-2" /> New Course
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-slate-950 text-white border-slate-800 max-w-lg shadow-2xl z-[999] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-orange-500">
            <GraduationCap className="h-6 w-6" /> Create Agent Course
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Banner/File Uploader */}
          <div className="space-y-2">
            <Label>Course Banner (Image)</Label>
            <div className="relative border-2 border-dashed border-slate-700 rounded-lg p-4 text-center hover:border-orange-500 transition-colors">
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded-md" />
                  <button 
                    type="button" 
                    onClick={() => setPreview(null)}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <Upload className="h-8 w-8 mx-auto text-slate-500 mb-2" />
                  <span className="text-sm text-slate-400">Click to upload banner image</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Course Title</Label>
            <Input id="title" name="title" placeholder="e.g. Sales Techniques 101" className="bg-slate-900 border-slate-700" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Course Details / Description</Label>
            <textarea 
              id="description" 
              name="description" 
              placeholder="What will agents learn in this course?"
              className="w-full h-24 bg-slate-900 border border-slate-700 rounded-md p-3 text-white focus:ring-1 focus:ring-orange-500 outline-none" 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <select name="target" className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white">
                <option value="Beginner">Beginner Agent</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Senior Agent</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Input name="duration" placeholder="e.g. 45 Mins" className="bg-slate-900 border-slate-700" />
            </div>
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-slate-400">
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 min-w-[120px]" disabled={loading}>
              {loading ? "Processing..." : "Create Course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}