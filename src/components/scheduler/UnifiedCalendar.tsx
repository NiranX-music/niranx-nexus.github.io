import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, Clock, BookOpen, Trophy } from "lucide-react";

interface UnifiedCalendarProps {
  classes: any[];
  homework: any[];
  exams: any[];
  onUpdate: () => void;
  onClassSelect?: (classId: string) => void;
}

export const UnifiedCalendar = ({ classes, homework, exams, onUpdate, onClassSelect }: UnifiedCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const getItemsForDate = (date: Date) => {
    const dayClasses = classes.filter(c => isSameDay(new Date(c.start_time), date));
    const dayHomework = homework.filter(h => isSameDay(new Date(h.due_date), date));
    const dayExams = exams.filter(e => isSameDay(new Date(e.exam_date), date));

    return { dayClasses, dayHomework, dayExams };
  };

  const { dayClasses, dayHomework, dayExams } = getItemsForDate(selectedDate);

  const getDatesWithItems = () => {
    const dates: Date[] = [];
    
    classes.forEach(c => dates.push(new Date(c.start_time)));
    homework.forEach(h => dates.push(new Date(h.due_date)));
    exams.forEach(e => dates.push(new Date(e.exam_date)));

    return dates;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Schedule Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
            modifiers={{
              hasItems: getDatesWithItems(),
            }}
            modifiersClassNames={{
              hasItems: "bg-primary/20 font-bold",
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {format(selectedDate, "MMMM dd, yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {dayClasses.length === 0 && dayHomework.length === 0 && dayExams.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No items scheduled for this day
              </p>
            ) : (
              <div className="space-y-4">
                {dayClasses.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      Classes ({dayClasses.length})
                    </h4>
                     {dayClasses.map((cls) => (
                      <Card 
                        key={cls.id} 
                        className="p-3 cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => onClassSelect?.(cls.id)}
                      >
                        <div className="space-y-1">
                          <div className="font-medium">{cls.title}</div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {format(new Date(cls.start_time), "HH:mm")} - {format(new Date(cls.end_time), "HH:mm")}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {cls.subject}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {dayHomework.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Homework ({dayHomework.length})
                    </h4>
                    {dayHomework.map((hw) => (
                      <Card key={hw.id} className="p-3">
                        <div className="space-y-1">
                          <div className="font-medium">{hw.title}</div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {hw.subject}
                            </Badge>
                            <Badge variant={hw.priority === "high" ? "destructive" : "secondary"} className="text-xs">
                              {hw.priority}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {dayExams.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      Exams ({dayExams.length})
                    </h4>
                    {dayExams.map((exam) => (
                      <Card key={exam.id} className="p-3">
                        <div className="space-y-1">
                          <div className="font-medium">{exam.name}</div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {exam.exam_time} • {exam.duration}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {exam.subject}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
