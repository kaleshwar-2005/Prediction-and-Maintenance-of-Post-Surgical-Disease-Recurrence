import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Chip, 
  Stack,
  Button
} from '@mui/material';
import { 
  DataGrid, 
  GridActionsCellItem
} from '@mui/x-data-grid';
import type { 
  GridColDef, 
  GridRenderCellParams 
} from '@mui/x-data-grid';
import { 
  History, 
  Trash2, 
  Eye, 
  Download,
  Activity
} from 'lucide-react';
import { HistoryDetailDialog } from './HistoryDetailDialog';
import { generateMedicalReport } from '../services/ReportService';

interface PredictionResult {
  recurrence_risk: 'Low' | 'Medium' | 'High';
  confidence: number;
  recommendation: string;
  detailed_advice: string;
}

interface HistoryItemData extends PredictionResult {
  id: string;
  date: string;
  previewUrl: string;
}

interface HistoryPageProps {
  history: HistoryItemData[];
  onClearHistory: () => void;
  onAnalyzeNew: () => void;
  viewMode?: 'table' | 'cards';
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ 
  history, 
  onClearHistory, 
  onAnalyzeNew 
}) => {
  const [selectedItem, setSelectedItem] = useState<HistoryItemData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewDetails = (item: HistoryItemData) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleDownloadPDF = (item: HistoryItemData) => {
    generateMedicalReport({
      patientId: item.id,
      date: item.date,
      riskLevel: item.recurrence_risk,
      confidence: item.confidence,
      recommendation: item.recommendation,
      lifestylePlan: item.detailed_advice,
      previewUrl: item.previewUrl
    });
  };

  const columns: GridColDef[] = [
    { 
      field: 'id', 
      headerName: 'Patient ID', 
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>
          CAT-{params.value?.toString().slice(-6).toUpperCase() || 'N/A'}
        </Typography>
      )
    },
    { field: 'date', headerName: 'Analysis Date', width: 220 },
    { 
      field: 'recurrence_risk', 
      headerName: 'Risk Level', 
      width: 150,
      renderCell: (params: GridRenderCellParams) => {
        const risk = params.value as string;
        const color = risk === 'High' ? 'error' : risk === 'Medium' ? 'warning' : 'success';
        return (
          <Chip 
            label={risk} 
            color={color} 
            size="small" 
            sx={{ fontWeight: 800, width: 90 }} 
          />
        );
      }
    },
    { 
      field: 'confidence', 
      headerName: 'Confidence', 
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {(params.value * 100).toFixed(1)}%
        </Typography>
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Eye size={20} color="#0288d1" />}
          label="View Details"
          onClick={() => handleViewDetails(params.row)}
        />,
        <GridActionsCellItem
          icon={<Download size={20} color="#00838f" />}
          label="Download PDF"
          onClick={() => handleDownloadPDF(params.row)}
        />,
      ],
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <History color="#0288d1" /> Patient Record Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Secure clinical database of all past AI diagnostics and patient risk profiles.
          </Typography>
        </Box>
        {history.length > 0 && (
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<Trash2 size={18} />} 
            onClick={onClearHistory}
            sx={{ border: '1px solid', borderColor: 'error.light' }}
          >
            Clear Database
          </Button>
        )}
      </Stack>

      {history.length === 0 ? (
        <Paper sx={{ p: 10, textAlign: 'center', bgcolor: 'transparent', border: '2px dashed', borderColor: 'divider' }}>
          <Activity size={48} color="#94a3b8" />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>No Patient Records Found</Typography>
          <Typography variant="body2" color="text.disabled">Analyzed cases will be automatically archived here.</Typography>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ height: 600, width: '100%', overflow: 'hidden', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <DataGrid
            rows={history}
            columns={columns}
            getRowId={(row) => row.id}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            sx={{
              border: 0,
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: 'background.default',
                color: 'text.secondary',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: 1,
                fontSize: '0.75rem'
              },
              '& .MuiDataGrid-cell': {
                borderColor: 'divider',
              },
              '& .MuiDataGrid-row:hover': {
                bgcolor: 'rgba(2, 136, 209, 0.15)',
                cursor: 'pointer'
              },
              '& .MuiDataGrid-row.Mui-selected': {
                bgcolor: 'rgba(2, 136, 209, 0.25)',
                '&:hover': {
                  bgcolor: 'rgba(2, 136, 209, 0.35)',
                }
              }
            }}
          />
        </Paper>
      )}

      <HistoryDetailDialog 
        item={selectedItem}
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAnalyzeNew={() => {
          setIsDialogOpen(false);
          onAnalyzeNew();
        }}
      />
    </Box>
  );
};
