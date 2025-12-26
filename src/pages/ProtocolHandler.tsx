import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProtocolHandler() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const url = searchParams.get('url');
    
    if (!url) {
      navigate('/niranx');
      return;
    }

    // Parse the protocol URL
    // Expected formats:
    // web+niranx://focus - Opens focus engine
    // web+niranx://task/123 - Opens specific task
    // web+niranx://note/456 - Opens specific note
    // web+study://topic/math - Opens study materials for topic
    
    try {
      const parsedUrl = new URL(url);
      const path = parsedUrl.pathname.replace(/^\/\//, '');
      const parts = path.split('/');
      const action = parts[0];
      const id = parts[1];

      switch (action) {
        case 'focus':
          navigate('/niranx/focus-engine');
          break;
          
        case 'task':
          navigate('/niranx/tasks', { state: { highlightTask: id } });
          break;
          
        case 'note':
          navigate('/niranx/notes', { state: { openNote: id } });
          break;
          
        case 'ai':
          navigate('/niranx/ai-solver', { state: { query: id } });
          break;
          
        case 'class':
          navigate(`/niranx/classroom/${id}`);
          break;
          
        case 'topic':
          navigate('/niranx/study-templates', { state: { topic: id } });
          break;
          
        case 'music':
          navigate('/niranx/xvibe');
          break;
          
        case 'calendar':
          navigate('/niranx/xorbit');
          break;
          
        case 'drive':
          navigate('/niranx/google-drive');
          break;
          
        default:
          toast.info(`Opening: ${action}`);
          navigate('/niranx');
      }
    } catch (error) {
      console.error('Protocol handler error:', error);
      navigate('/niranx');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
        <p className="text-muted-foreground">Processing link...</p>
      </div>
    </div>
  );
}
