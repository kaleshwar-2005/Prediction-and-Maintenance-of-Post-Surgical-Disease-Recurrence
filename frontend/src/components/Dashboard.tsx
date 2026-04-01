import React from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  LinearProgress, 
  Chip, 
  Divider,
  Stack,
  Alert,
  IconButton,
  Tooltip,
  Paper,
  Avatar
} from '@mui/material';
import { 
  Upload, 
  FileUp, 
  Activity, 
  ShieldCheck, 
  Smartphone, 
  FileText, 
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { generateMedicalReport } from '../services/ReportService';

interface PredictionResult {
  recurrence_risk: 'Low' | 'Medium' | 'High';
  confidence: number;
  recommendation: string;
  detailed_advice: string;
}

interface DashboardProps {
  file: File | null;
  preview: string | null;
  loading: boolean;
  processingStep: string;
  result: PredictionResult | null;
  error: string | null;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
  onPredict: () => void;
  onReset: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const Dashboard: React.FC<DashboardProps> = ({
  file,
  preview,
  loading,
  processingStep,
  result,
  error,
  onFileSelect,
  onDrop,
  onPredict,
  onReset,
  fileInputRef
}) => {

  const getRiskStatus = (risk: string) => {
    switch (risk) {
      case 'Low': return { color: 'success', label: 'OPTIMAL STATUS', icon: <CheckCircle2 size={24} /> };
      case 'Medium': return { color: 'warning', label: 'OBSERVATION REQUIRED', icon: <Activity size={24} /> };
      case 'High': return { color: 'error', label: 'URGENT ATTENTION', icon: <AlertCircle size={24} /> };
      default: return { color: 'primary', label: 'PENDING ANALYSIS', icon: <Activity size={24} /> };
    }
  };

  const riskStatus = result ? getRiskStatus(result.recurrence_risk) : getRiskStatus('');

  const handleDownloadPDF = () => {
    if (result && preview) {
      generateMedicalReport({
        patientId: Date.now().toString(),
        date: new Date().toLocaleString(),
        riskLevel: result.recurrence_risk,
        confidence: result.confidence,
        recommendation: result.recommendation,
        lifestylePlan: result.detailed_advice,
        previewUrl: preview
      });
    }
  };

  return (
    <Box sx={{ width: '100%', animate: 'fadeIn' }}>
      <Grid container spacing={3}>
        
        {/* TOP ROW: Analysis Control & Diagnostic Result */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FileUp size={20} /> Patient Data Acquisition
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                Upload high-resolution retinal fundus sequence for AI analysis.
              </Typography>

              <Box
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  border: '2px dashed',
                  borderColor: preview ? 'primary.main' : 'divider',
                  bgcolor: preview ? 'primary.light' : 'transparent',
                  borderRadius: 3,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.light' },
                  position: 'relative',
                  aspectRatio: '16/10',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={onFileSelect} />
                {preview ? (
                  <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                    <img src={preview} alt="Retinal Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {loading && (
                      <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(2, 136, 209, 0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                         <LinearProgress sx={{ width: '80%', mb: 2 }} />
                         <Typography variant="caption" color="white" sx={{ fontWeight: 800, bgcolor: 'primary.main', px: 1, borderRadius: 1 }}>
                           {processingStep}
                         </Typography>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Stack spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 64, height: 64 }}>
                      <Upload size={32} />
                    </Avatar>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>Select Patient Scan</Typography>
                      <Typography variant="caption" color="text.secondary">Drop image or browse local storage</Typography>
                    </Box>
                  </Stack>
                )}
              </Box>

              <Box sx={{ mt: 3 }}>
                {loading ? (
                  <Button fullWidth variant="contained" disabled startIcon={<RefreshCw className="animate-spin" />}>
                    Analyzing...
                  </Button>
                ) : (
                  <Button 
                    fullWidth 
                    variant="contained" 
                    disabled={!file} 
                    onClick={onPredict}
                    startIcon={<Activity size={20} />}
                    sx={{ py: 1.5, fontSize: '1rem' }}
                  >
                    Run AI Diagnosis
                  </Button>
                )}
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: '100%', borderLeft: 6, borderLeftColor: result ? `${riskStatus.color}.main` : 'divider' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 1.5 }}>
                    Clinical Status Indicator
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: result ? `${riskStatus.color}.main` : 'text.disabled' }}>
                    {result ? result.recurrence_risk.toUpperCase() : 'N/A'} RISK
                  </Typography>
                </Box>
                {result && (
                  <Chip 
                    icon={riskStatus.icon}
                    label={riskStatus.label} 
                    color={riskStatus.color as any} 
                    sx={{ fontWeight: 800, borderRadius: 1.5, py: 2.5, px: 1 }}
                  />
                )}
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={4}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: 'text.secondary' }}>
                    ANALYSIS CONFIDENCE
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={result ? result.confidence * 100 : 0} 
                        sx={{ height: 12, borderRadius: 6, bgcolor: 'background.default' }}
                      />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, minWidth: 60 }}>
                      {result ? `${(result.confidence * 100).toFixed(1)}%` : '0.0%'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block' }}>
                      ENGINE VERSION
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>ResNet18 / Pytorch 2.5</Typography>
                  </Box>
                </Grid>
              </Grid>

              {result && (
                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<FileText size={18} />} 
                    onClick={handleDownloadPDF}
                    sx={{ flexGrow: 1 }}
                  >
                    Download Medical Report
                  </Button>
                  <Tooltip title="Reset Analysis">
                    <IconButton onClick={onReset} sx={{ border: '1px solid', borderColor: 'divider' }}>
                      <RefreshCw size={18} />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* BOTTOM ROW: Recommendation & AI Advice */}
        {result && (
          <>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%', bgcolor: 'primary.light', border: '1px solid', borderColor: 'primary.main', opacity: 0.9 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: 'primary.dark', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShieldCheck size={20} /> Clinical Recommendation
                  </Typography>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
                    <Typography variant="body2" sx={{ lineHeight: 1.7, fontWeight: 500 }}>
                      {result.recommendation}
                    </Typography>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%', bgcolor: 'secondary.light', border: '1px solid', borderColor: 'secondary.dark' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: 'secondary.dark', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Smartphone size={20} /> AI Lifestyle Management Plan
                  </Typography>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: 'background.paper',
                    maxHeight: 200,
                    overflowY: 'auto',
                    fontSize: '0.875rem'
                  }}>
                    {(result.detailed_advice || "No specific AI advice available for this risk level.")
                      .split('\n').map((line, i) => (
                      <Typography key={i} variant="body2" sx={{ mb: 1, color: 'text.primary' }}>
                        {line.replace(/\*\*/g, '')}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};
