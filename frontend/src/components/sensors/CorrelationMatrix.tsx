import { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, Loader, AlertCircle } from 'lucide-react';

interface CorrelationData {
  value: number;
  interpretation: string;
}

interface MatrixData {
  [sensor: string]: {
    [target: string]: CorrelationData;
  };
}

export default function CorrelationMatrix() {
  const [matrix, setMatrix] = useState<MatrixData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState<{r: string, c: string} | null>(null);

  useEffect(() => {
    const fetchMatrix = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/sensors/correlation-matrix');
        setMatrix(res.data.matrix);
      } catch (error) {
        console.error("Failed to fetch correlation matrix:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatrix();
  }, []);

  const getCellColor = (value: number) => {
    const absVal = Math.abs(value);
    if (absVal >= 0.7) return value > 0 ? 'bg-status-good/20 text-status-good border-status-good/30' : 'bg-status-critical/20 text-status-critical border-status-critical/30';
    if (absVal >= 0.3) return 'bg-status-warning/20 text-status-warning border-status-warning/30';
    return 'bg-bg-page text-text-muted border-border-panel';
  };

  const sensors = ["P-101", "T-201", "F-301", "V-401"];

  if (isLoading) {
    return (
      <div className="bg-bg-panel border border-border-panel rounded-xl p-6 flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-text-muted animate-pulse">
          <Loader className="w-4 h-4 animate-spin" /> Calculating multivariate correlations...
        </div>
      </div>
    );
  }

  if (!matrix) {
    return (
      <div className="bg-bg-panel border border-border-panel rounded-xl p-6 flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-text-muted">
          <AlertCircle className="w-4 h-4" /> Correlation data unavailable
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-accent-primary" />
        <div>
          <h2 className="text-lg font-semibold text-text-primary">AI Sensor Correlation Matrix</h2>
          <p className="text-xs text-text-muted">Real-time Pearson correlation (r) detecting cascading failure modes</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-3 text-xs font-medium text-text-muted uppercase tracking-wider w-24"></th>
              {sensors.map(sensor => (
                <th key={sensor} className="p-3 text-xs font-bold text-text-primary uppercase tracking-wider text-center w-24">
                  {sensor}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sensors.map(rowSensor => (
              <tr key={rowSensor}>
                <td className="p-3 text-xs font-bold text-text-primary uppercase tracking-wider text-right pr-4">
                  {rowSensor}
                </td>
                {sensors.map(colSensor => {
                  const data = matrix[rowSensor][colSensor];
                  const isHovered = hoveredCell?.r === rowSensor && hoveredCell?.c === colSensor;
                  
                  return (
                    <td 
                      key={`${rowSensor}-${colSensor}`}
                      className="p-2 text-center relative group cursor-help"
                      onMouseEnter={() => setHoveredCell({r: rowSensor, c: colSensor})}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg border text-sm font-mono font-bold transition-all ${getCellColor(data.value)} ${isHovered ? 'ring-2 ring-accent-primary scale-105 z-10' : ''}`}>
                        {data.value.toFixed(2)}
                      </div>
                      
                      {/* Tooltip */}
                      {isHovered && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-bg-panel border border-border-panel rounded-lg shadow-xl z-20 pointer-events-none">
                          <p className="text-xs font-bold text-text-primary mb-1">
                            {rowSensor} ↔ {colSensor}
                          </p>
                          <p className="text-[11px] text-text-muted leading-relaxed">
                            {data.interpretation}
                          </p>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-border-panel flex items-center justify-center gap-6 text-[10px] text-text-muted uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-status-good/20 border border-status-good/30"></div>
          <span>Strong Correlation (|r| ≥ 0.7)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-status-warning/20 border border-status-warning/30"></div>
          <span>Moderate (0.3 ≤ |r| &lt; 0.7)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-bg-page border border-border-panel"></div>
          <span>Weak (|r| &lt; 0.3)</span>
        </div>
      </div>
    </div>
  );
}