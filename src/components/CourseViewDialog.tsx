import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ImageOff,
  ArrowRight,
  LayoutGrid,
  Clock,
} from "lucide-react";

/* ================= HELPER ================= */
const getMediaUrl = (url?: string) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `https://yourdomain.com/${url}`; // 🔴 backend domain yahan daalo
};

/* ================= VIEW DIALOG ================= */
export function CourseViewDialog({ course }: { course: any }) {
  if (!course) return null;

  const videoUrl = getMediaUrl(course.video_url);
  const imageUrl = getMediaUrl(course.thumbnail_url);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex-1 bg-white text-black hover:bg-orange-500 hover:text-white transition-all rounded-full font-bold text-[10px] h-8 flex items-center justify-center gap-2 uppercase">
          View <ArrowRight size={12} />
        </button>
      </DialogTrigger>

      <DialogContent className="bg-[#0a0c10] text-white border-white/10 max-w-3xl p-0 overflow-hidden rounded-[2rem]">
        
        {/* ===== MEDIA ===== */}
        <div className="w-full h-[260px] bg-black">
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt="course"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageOff size={42} className="text-slate-600" />
            </div>
          )}
        </div>

        {/* ===== CONTENT ===== */}
        <div className="p-8 space-y-4">
          <h2 className="text-2xl font-black">{course.title}</h2>

          <div className="flex items-center gap-4 text-orange-500 text-xs font-bold">
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {course.duration || "Self-paced"}
            </span>
            <span className="bg-orange-500/10 px-2 py-0.5 rounded">
              Official Course
            </span>
          </div>

          <p className="text-slate-300 text-sm">
            {course.description || "No description available"}
          </p>

          <Button className="w-full h-12 rounded-xl bg-orange-600 hover:bg-orange-500 font-black">
            START TRAINING
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ================= COURSE CARD ================= */
export function CourseCard({ course }: { course: any }) {
  const imageUrl = getMediaUrl(course.thumbnail_url);

  return (
    <div className="w-[300px] h-[260px] relative rounded-[2rem] overflow-hidden bg-slate-900 border border-white/5 hover:shadow-xl transition">
      
      {/* IMAGE */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="course"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <ImageOff size={40} className="text-slate-600" />
        </div>
      )}

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      {/* CONTENT */}
      <div className="relative z-10 h-full p-5 flex flex-col justify-end">
        <h3 className="text-lg font-black text-white mb-2">
          {course.title}
        </h3>

        <p className="text-white/60 text-[11px] line-clamp-2 mb-3">
          {course.description || "Premium training content"}
        </p>

        <div className="flex gap-2">
          <CourseViewDialog course={course} />
          <button className="h-8 w-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-orange-500 transition">
            <LayoutGrid size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
