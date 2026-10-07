import { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

interface AddSensorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSensorAdded: () => void;
}

export default function AddSensorModal({ isOpen, onClose, onSensorAdded }: AddSensorModalProps) {
  const [formData, setFormData] = useState({
    sensor_id: '',
    name: '',
    unit: '',
    area: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/sensors', formData);
      onSensorAdded();
      onClose();
      setFormData({ sensor_id: '', name: '', unit: '', area: '' });
    } catch (error) {
      alert("Error adding sensor. Make sure the ID is unique.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg-panel border border-border-panel rounded-xl p-6 w-96 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Add New Sensor</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-text-muted uppercase">Sensor ID (e.g., P-999)</label>
            <input required value={formData.sensor_id} onChange={e => setFormData({...formData, sensor_id: e.target.value})} 
              className="w-full bg-bg-page border border-border-panel rounded p-2 text-sm text-text-primary focus:ring-2 focus:ring-accent-primary outline-none" />
          </div>
          <div>
            <label className="text-xs text-text-muted uppercase">Name</label>
            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
              className="w-full bg-bg-page border border-border-panel rounded p-2 text-sm text-text-primary focus:ring-2 focus:ring-accent-primary outline-none" />
          </div>
          <div>
            <label className="text-xs text-text-muted uppercase">Unit (e.g., bar)</label>
            <input required value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} 
              className="w-full bg-bg-page border border-border-panel rounded p-2 text-sm text-text-primary focus:ring-2 focus:ring-accent-primary outline-none" />
          </div>
          <div>
            <label className="text-xs text-text-muted uppercase">Area</label>
            <input required value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} 
              className="w-full bg-bg-page border border-border-panel rounded p-2 text-sm text-text-primary focus:ring-2 focus:ring-accent-primary outline-none" />
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-2 bg-accent-primary text-white rounded hover:bg-accent-primary/90 transition-colors">
            {isLoading ? 'Adding...' : 'Add Sensor'}
          </button>
        </form>
      </div>
    </div>
  );
}