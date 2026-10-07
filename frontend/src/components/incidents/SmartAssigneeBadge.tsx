import { useEffect, useState } from 'react';
import axios from 'axios';
import { Bot, UserCheck, AlertCircle, Loader } from 'lucide-react';

interface Recommendation {
  recommended_user: string;
  confidence_score: number;
  reason: string;
  sensor_id: string;
}

interface SmartAssigneeBadgeProps {
  incidentId: number;
}

export default function SmartAssigneeBadge({ incidentId }: SmartAssigneeBadgeProps) {
  const [data, setData] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendation = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/incidents/${incidentId}/recommend-assignee`);
        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch AI assignee recommendation:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendation();
  }, [incidentId]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-text-muted animate-pulse">
        <Loader className="w-3 h-3 animate-spin" /> AI analyzing history...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <AlertCircle className="w-3 h-3" /> Recommendation unavailable
      </div>
    );
  }

  // Dynamic color based on confidence score
  const confidenceColor = data.confidence_score >= 80 ? 'text-status-good' : 
                          data.confidence_score >= 60 ? 'text-status-warning' : 'text-text-muted';

  return (
    <div className="mt-2 p-2.5 bg-bg-page border border-border-panel rounded-lg">
      <div className="flex items-center gap-2 mb-1.5">
        <Bot className="w-3.5 h-3.5 text-accent-primary" />
        <span className="text-[10px] font-semibold text-accent-primary uppercase tracking-wider">
          AI Recommended Assignee
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-text-primary" />
          <span className="text-sm font-bold text-text-primary capitalize">
            {data.recommended_user.replace('test_', '')}
          </span>
        </div>
        <span className={`text-xs font-bold ${confidenceColor} bg-bg-panel px-2 py-0.5 rounded border border-border-panel`}>
          {data.confidence_score}% Match
        </span>
      </div>
      
      <p className="text-[10px] text-text-muted mt-1.5 leading-tight italic">
        "{data.reason}"
      </p>
    </div>
  );
}