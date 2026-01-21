import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, BookOpen, PlayCircle, CheckCircle, Clock, LayoutGrid } from "lucide-react"; 
import { useToast } from "@/hooks/use-toast"; 
import { Badge } from "@/components/ui/badge";
import { CreateCourseDialog } from "@/components/CreateCourseDialog";
import { CourseViewDialog } from "@/components/CourseViewDialog";

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const API_URL = "http://localhost:5000/api/courses"; 

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/all`); 
      if (!response.ok) throw new Error("Failed to fetch from MySQL");
      const data = await response.json();
      setCourses(data || []);
    } catch (error: any) {
      toast({
        title: "Database Error",
        description: "MySQL connection error: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-white bg-[#0f1117] min-h-screen flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500 mb-4"></div>
        <p className="text-slate-400 font-medium">Connecting to MySQL...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8 bg-[#0f1117] min-h-screen text-white">
      
      {/* HEADER SECTION */}
      <div className="flex flex-row justify-between items-center border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 tracking-tight">Courses & Membership</h1>
          <p className="text-slate-400">Manage your agent training modules</p>
        </div>
        <CreateCourseDialog onCourseCreated={fetchCourses} />
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg text-orange-500"><BookOpen size={24}/></div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Total Courses</p>
              <p className="text-3xl font-bold">{courses.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500"><Users size={24}/></div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Total Agents</p>
              <p className="text-3xl font-bold">{courses.reduce((acc, curr) => acc + (curr.student_count || 0), 0)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg text-green-500"><CheckCircle size={24}/></div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Lessons Hosted</p>
              <p className="text-3xl font-bold">{courses.reduce((acc, curr) => acc + (curr.lesson_count || 0), 0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* UNIQUE COMPACT GRID */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {courses.map((course) => (
          <div key={course.id} className="w-full h-[340px] group relative bg-[#0d0f14] rounded-[2rem] border border-white/5 overflow-hidden transition-all duration-500 hover:border-orange-500/40 hover:-translate-y-2 shadow-2xl flex flex-col">
            
            {/* Image Section */}
            <div className="h-36 w-full relative overflow-hidden bg-slate-900">
              <img 
                src={course.thumbnail_url || "https://images.unsplash.com/photo-1614850523296-d8c1af93d400"} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                alt={course.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f14] to-transparent" />
              <div className="absolute top-4 right-4 bg-orange-600 h-2 w-2 rounded-full shadow-[0_0_10px_#ea580c] animate-pulse" />
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col justify-between flex-grow">
              <div className="text-left space-y-2">
                <div className="flex justify-between items-center">
                   <Badge className="bg-orange-600/10 text-orange-500 border-none text-[10px] h-5">ACTIVE</Badge>
                   <span className="text-slate-500 text-[10px] flex items-center gap-1"><Clock size={12}/> {course.duration || "Self"}</span>
                </div>
                <h3 className="text-lg font-black text-white line-clamp-1 group-hover:text-orange-500 transition-colors tracking-tight">
                  {course.title}
                </h3>
                <p className="text-slate-500 text-[11px] line-clamp-2 leading-relaxed font-medium italic">
                  {course.description?.includes('import') ? "Premium training content is ready." : course.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-4">
                <CourseViewDialog course={course} />
                <button title="Manage Content" className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-800/40 border border-white/5 text-slate-500 hover:text-white hover:bg-orange-600 transition-all">
                   <LayoutGrid size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {courses.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-[3rem] bg-slate-900/20">
            <GraduationCap size={80} className="mx-auto text-slate-800 mb-6" />
            <h3 className="text-2xl font-bold">No Training Modules Found</h3>
            <p className="text-slate-500 mt-2 mb-8 max-w-sm mx-auto">It looks like your MySQL database is empty. Create a new course to get started.</p>
            <CreateCourseDialog onCourseCreated={fetchCourses} />
        </div>
      )}
    </div>
  );
}