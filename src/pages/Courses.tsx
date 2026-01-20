
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, BookOpen, PlayCircle, CheckCircle } from "lucide-react"; 
import { useToast } from "@/hooks/use-toast"; 
import { Badge } from "@/components/ui/badge";
import { CreateCourseDialog } from "@/components/CreateCourseDialog";
import { CourseViewDialog } from "@/components/CourseViewDialog";
// Is line ko theek karein
// import { GraduationCap, Users, BookOpen, PlayCircle, CheckCircle } from "lucide-react";

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
      
      <div className="flex flex-row justify-between items-center border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Courses & Membership</h1>
          <p className="text-slate-400">Manage your agent training modules</p>
        </div>
        <CreateCourseDialog onCourseCreated={fetchCourses} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/40 border-slate-800">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg text-orange-500"><BookOpen size={24}/></div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Total Courses</p>
              <p className="text-3xl font-bold">{courses.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/40 border-slate-800">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500"><Users size={24}/></div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Total Agents</p>
              <p className="text-3xl font-bold">{courses.reduce((acc, curr) => acc + (curr.student_count || 0), 0)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg text-green-500"><CheckCircle size={24}/></div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Lessons Hosted</p>
              <p className="text-3xl font-bold">{courses.reduce((acc, curr) => acc + (curr.lesson_count || 0), 0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="border-slate-800 bg-slate-900/60 hover:border-orange-500/50 transition-all overflow-hidden flex flex-col">
            <div className="aspect-video bg-slate-800 relative">
              {course.thumbnail_url && <img src={course.thumbnail_url} className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <PlayCircle className="text-white w-12 h-12" />
              </div>
            </div>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold truncate">{course.title}</CardTitle>
                <Badge className="bg-orange-600">Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
              <p className="text-slate-400 text-sm line-clamp-2">{course.description}</p>
              <div className="flex flex-col gap-2 pt-4">
                <CourseViewDialog course={course} />
                <Button variant="ghost" className="w-full text-slate-400 border border-transparent hover:border-slate-700">
                  Manage Content
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
            <GraduationCap size={80} className="mx-auto text-slate-800 mb-6" />
            <h3 className="text-2xl font-bold">No Training Modules</h3>
            <p className="text-slate-500 mt-2 mb-8 max-w-sm mx-auto">Create a new course to start training.</p>
            <CreateCourseDialog onCourseCreated={fetchCourses} />
        </div>
      )}
    </div>
  );
}