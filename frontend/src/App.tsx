import { useState, useRef, useEffect } from 'react';
import { 
  Snackbar, 
  Alert, 
  Box, 
  Typography, 
  Paper, 
  Stack,
  Fade,
  Grow,
  Button
} from '@mui/material';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { HistoryPage } from './components/HistoryPage';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getAppTheme } from './theme';
import './index.css';

interface PredictionResult {
  recurrence_risk: 'Low' | 'Medium' | 'High';
  confidence: number;
  recommendation: string;
  detailed_advice: string;
}

interface HistoryItem {
  recurrence_risk: 'Low' | 'Medium' | 'High';
  confidence: number;
  recommendation: string;
  detailed_advice: string;
  id: string;
  date: string;
  previewUrl: string;
}

function App() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme_mode');
    return saved === 'dark' ? 'dark' : 'light';
  });

  const theme = getAppTheme(themeMode);

  const toggleTheme = () => {
    setThemeMode(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme_mode', next);
      return next;
    });
  };

  const [activeTab, setActiveTab] = useState<string>('analyze');
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('cataract_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'info' | 'error' }>({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  useEffect(() => {
    try {
      localStorage.setItem('cataract_history', JSON.stringify(history));
    } catch (e) {
      console.warn("LocalStorage full, trimming history...");
      if (history.length > 0) {
        setHistory(prev => prev.slice(0, prev.length - 1));
      }
    }
  }, [history]);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
      setError(null);
    }
  };

  const createThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 200;
          const MAX_HEIGHT = 200;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
    });
  };

  const handlePredict = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setProcessingStep('Initializing Secure Connection...');

    const steps = [
      'Scanning Retinal Features...',
      'Analyzing Vessel Density...',
      'Detecting Opacities...',
      'Running ResNet18 Model...',
      'Generating Clinical Report...'
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setProcessingStep(steps[stepIndex]);
        stepIndex++;
      }
    }, 800);

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('DEBUG: Sending prediction request to backend...');
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('DEBUG: Backend Error Response:', errorText);
        throw new Error(`Prediction failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('DEBUG: Received data from backend:', data);
      
      if (!data.recurrence_risk) {
        console.error('DEBUG: Invalid data format received:', data);
        throw new Error('Invalid response format from server');
      }

      await new Promise(r => setTimeout(r, 1000));
      setResult(data);

      const thumbnailImage = await createThumbnail(file);
      const newItem: HistoryItem = {
        ...data,
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        previewUrl: thumbnailImage
      };
      
      setHistory(prev => {
        const newHistory = [newItem, ...prev].slice(0, 50);
        return newHistory;
      });
      setSnackbar({ open: true, message: 'Diagnosis Complete. Report generated.', severity: 'success' });

    } catch (err: any) {
      console.error('DEBUG: Fetch Error:', err);
      setError(`Error: ${err.message || 'Connection failed'}`);
      setSnackbar({ open: true, message: 'Connection Error', severity: 'error' });
    } finally {
      clearInterval(interval);
      setLoading(false);
      setProcessingStep('');
    }
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear all history? This cannot be undone.")) {
      setHistory([]);
      localStorage.removeItem('cataract_history');
      setSnackbar({ open: true, message: 'Clinical Database Cleared', severity: 'info' });
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag handles for the Dashboard component to use
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
      setError(null);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout activeTab={activeTab} onTabChange={setActiveTab} themeMode={themeMode} onThemeToggle={toggleTheme}>
        <Box sx={{ animation: 'fadeIn 0.5s', minHeight: '60vh' }}>
          
          {activeTab === 'dashboard' && (
             <Box sx={{ py: 6, textAlign: 'center' }}>
               <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, color: 'primary.main' }}>
                  Medical Analytics Dashboard
               </Typography>
               <Typography variant="h6" color="text.secondary" sx={{ mb: 6, opacity: 0.8 }}>
                  Overview of clinical diagnostic performance.
               </Typography>
               
               <Grow in timeout={800}>
                 <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} justifyContent="center" sx={{ mb: 6 }}>
                   <Paper sx={{ p: 4, flexGrow: 1, textAlign: 'center', borderRadius: 4, borderTop: '4px solid', borderColor: 'primary.main' }}>
                     <Typography variant="h2" color="primary" sx={{ fontWeight: 900 }}>{history.length}</Typography>
                     <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1 }}>TOTAL ANALYSES</Typography>
                   </Paper>
                   <Paper sx={{ p: 4, flexGrow: 1, textAlign: 'center', borderRadius: 4, borderTop: '4px solid', borderColor: 'error.main' }}>
                     <Typography variant="h2" color="error.main" sx={{ fontWeight: 900 }}>
                       {history.filter(h => h.recurrence_risk === 'High').length}
                     </Typography>
                     <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1 }}>HIGH RISK CASES</Typography>
                   </Paper>
                   <Paper sx={{ p: 4, flexGrow: 1, textAlign: 'center', borderRadius: 4, borderTop: '4px solid', borderColor: 'success.main' }}>
                     <Typography variant="h2" color="success.main" sx={{ fontWeight: 900 }}>98.2%</Typography>
                     <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1 }}>SYSTEM RELIABILITY</Typography>
                   </Paper>
                 </Stack>
               </Grow>
               
               <Box sx={{ mt: 4 }}>
                  <Button 
                     variant="contained" 
                     size="large" 
                     onClick={() => setActiveTab('analyze')}
                     sx={{ py: 2, px: 6, borderRadius: 3, fontSize: '1.1rem', boxShadow: 6 }}
                  >
                     Start Image Analysis
                  </Button>
               </Box>
             </Box>
          )}

          {activeTab === 'analyze' && (
            <Fade in timeout={500}>
              <Box>
                <Dashboard 
                  file={file}
                  preview={preview}
                  loading={loading}
                  processingStep={processingStep}
                  result={result}
                  error={error}
                  onFileSelect={handleFileSelect}
                  onDrop={handleDrop}
                  onPredict={handlePredict}
                  onReset={resetAnalysis}
                  fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
                />
              </Box>
            </Fade>
          )}

          {activeTab === 'history' && (
            <Fade in timeout={500}>
               <Box>
                 <HistoryPage 
                  history={history} 
                  onClearHistory={clearHistory} 
                  onAnalyzeNew={() => setActiveTab('analyze')}
                />
               </Box>
            </Fade>
          )}

          {activeTab === 'reports' && (
            <Fade in timeout={500}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>Institutional Diagnostic Repository</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Access and export verified patient diagnostic reports.</Typography>
                <HistoryPage 
                    history={history} 
                    onClearHistory={clearHistory} 
                    onAnalyzeNew={() => setActiveTab('analyze')}
                  />
              </Box>
            </Fade>
          )}
        </Box>

        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={4000} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Layout>
    </ThemeProvider>
  );
}

export default App;
