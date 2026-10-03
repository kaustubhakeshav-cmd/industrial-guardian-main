import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // FastAPI OAuth2 expects form data, not JSON
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axios.post('http://127.0.0.1:8000/operator/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // Save the JWT token and role to localStorage
      localStorage.setItem('token', response.data.access_token);
      
      // Decode the JWT to get the role (simple base64 decode for demo)
      const payload = JSON.parse(atob(response.data.access_token.split('.')[1]));
      localStorage.setItem('role', payload.role);

      // Redirect based on role
      if (payload.role === 'engineer' || payload.role === 'admin') {
        navigate('/engineer-dashboard');
      } else {
        navigate('/operator-dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-page flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-bg-panel border border-border-panel rounded-xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-accent-primary/20 p-3 rounded-full mb-4">
            <ShieldCheck className="w-8 h-8 text-accent-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-text-primary">Industrial Guardian</h1>
          <p className="text-text-muted text-sm mt-1">SCADA Anomaly Detection Platform</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-bg-page border border-border-panel rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary transition-all"
              placeholder="e.g., test_operator"
              required
            />
            <p className="text-xs text-text-muted mt-1">Try: test_operator or test_engineer</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-bg-page border border-border-panel rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary transition-all"
              placeholder="••••••••"
              required
            />
            <p className="text-xs text-text-muted mt-1">Password: password123</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-status-critical text-sm bg-status-critical/10 p-3 rounded-lg border border-status-critical/20">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white font-medium py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Authenticating...' : 'Sign In to Control Room'}
          </button>
        </form>
      </div>
    </div>
  );
}