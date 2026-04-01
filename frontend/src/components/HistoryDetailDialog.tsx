import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  IconButton, 
  Typography, 
  Box, 
  LinearProgress, 
  Chip,
  Fade,
  Stack
} from '@mui/material';
import { 
  X, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Smartphone, 
  Clock, 
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';

interface PredictionResult {
  recurrence_risk: 'Low' | 'Medium' | 'High';
  confidence: number;
  recommendation: string;
  detailed_advice: string;
}

interface HistoryItem extends PredictionResult {
  id: string;
  date: string;
  previewUrl: string;
}

interface HistoryDetailDialogProps {
  item: HistoryItem | null;
  open: boolean;
  onClose: () => void;
  onAnalyzeNew: () => void;
}

const Transition = React.forwardRef(function Transition(
  props: any,
  ref: React.Ref<unknown>,
) {
  return <Fade ref={ref} {...props} />;
});

export const HistoryDetailDialog: React.FC<HistoryDetailDialogProps> = ({ 
  item, 
  open, 
  onClose, 
  onAnalyzeNew 
}) => {
  if (!item) return null;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return { main: '#15803d', light: '#f0fdf4', border: '#bcf2cd', icon: <CheckCircle2 size={24} /> };
      case 'Medium': return { main: '#a16207', light: '#fefce8', border: '#fef08a', icon: <ArrowUpRight size={24} /> };
      case 'High': return { main: '#b91c1c', light: '#fef2f2', border: '#fecaca', icon: <AlertCircle size={24} /> };
      default: return { main: '#64748b', light: '#f8fafc', border: '#e2e8f0', icon: <Activity size={24} /> };
    }
  };

  const riskStyle = getRiskColor(item.recurrence_risk);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          px: 3, 
          py: 2,
          bgcolor: riskStyle.light,
          borderBottom: `1px solid ${riskStyle.border}`
        }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: riskStyle.main, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {riskStyle.icon}
            {item.recurrence_risk} Risk Analysis
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: riskStyle.main }}>
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.5fr' }, gap: 4, mt: 1 }}>
          
          {/* Left Column: Image & Confidence */}
          <Box>
            <Box sx={{ 
              width: '100%', 
              borderRadius: 3, 
              overflow: 'hidden', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              mb: 3,
              bgcolor: 'black',
              aspectRatio: '1/1'
            }}>
              <img 
                src={item.previewUrl} 
                alt="Analyzed Fundus" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </Box>

            <Box sx={{ px: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'baseline' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Confidence Score
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: 'monospace' }}>
                  {(item.confidence * 100).toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={item.confidence * 100} 
                sx={{ 
                  height: 10, 
                  borderRadius: 5, 
                  bgcolor: 'rgba(0,0,0,0.05)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: riskStyle.main,
                    borderRadius: 5,
                  }
                }} 
              />
              
              <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                <Chip icon={<Clock size={14} />} label={item.date} size="small" variant="outlined" />
                <Chip label="ResNet18" size="small" sx={{ fontWeight: 700, bgcolor: 'slate.100' }} />
              </Stack>
            </Box>
          </Box>

          {/* Right Column: Recommendations & AI Plan */}
          <Box>
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
                <ShieldCheck color="#0288d1" size={18} />
                Clinical Recommendation
              </Typography>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'background.default', 
                borderRadius: 2, 
                border: '1px solid',
                borderColor: 'divider',
                lineHeight: 1.6,
                color: 'text.primary'
              }}>
                {(item.recommendation || "").split('\n').map((line, i) => {
                  const parts = line.split('**');
                  if (parts.length < 2) return <Typography key={i} variant="body2" sx={{ mb: 1, color: 'inherit' }}>{line}</Typography>;
                  return (
                    <Box key={i} sx={{ mb: 1.5, display: 'flex', gap: 1 }}>
                      <Typography variant="body2" sx={{ color: 'inherit' }}>
                        {parts.map((part, j) =>
                          j % 2 === 1 ? <Box component="span" key={j} sx={{ fontWeight: 800 }}>{part}</Box> : part
                        )}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                <Smartphone size={18} />
                AI Lifestyle & Dietary Plan
              </Typography>
              <Box sx={{ 
                p: 2.5, 
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(79, 195, 247, 0.1)' : 'primary.light', 
                borderRadius: 3, 
                border: '1px solid',
                borderColor: 'primary.main',
                fontSize: '0.9rem',
                color: (theme) => theme.palette.mode === 'dark' ? '#b3e5fc' : 'text.primary',
              }}>
                {(item.detailed_advice || "Stable maintenance plan advised for this risk profile.").split('\n').map((line, i) => {
                  const parts = line.split('**');
                  if (parts.length < 2) return <Typography key={i} variant="body2" sx={{ mb: 1, color: 'inherit' }}>{line}</Typography>;
                  return (
                    <Box key={i} sx={{ mb: 1.5, display: 'flex', gap: 1 }}>
                      <Typography variant="body2" sx={{ color: 'inherit' }}>
                        {parts.map((part, j) =>
                          j % 2 === 1 ? <Box component="span" key={j} sx={{ fontWeight: 800, color: (theme) => theme.palette.mode === 'dark' ? '#4fc3f7' : 'primary.dark' }}>{part}</Box> : part
                        )}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, bgcolor: 'slate.50', gap: 1.5 }}>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          sx={{ 
            borderRadius: 2, 
            textTransform: 'none', 
            fontWeight: 700,
            borderColor: 'slate.300',
            color: 'slate.600',
            px: 3
          }}
        >
          Close
        </Button>
        <Button 
          onClick={onAnalyzeNew} 
          variant="contained" 
          disableElevation
          endIcon={<ChevronRight size={18} />}
          sx={{ 
            borderRadius: 2, 
            textTransform: 'none', 
            fontWeight: 700,
            px: 3,
            bgcolor: 'blue.600',
            '&:hover': { bgcolor: 'blue.700' }
          }}
        >
          Analyze New Image
        </Button>
      </DialogActions>
    </Dialog>
  );
};
