import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { UploadFile, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [file, setFile] = useState(null);
  const [requirements, setRequirements] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Bitte wählen Sie eine PDF-Datei aus.');
      setFile(null);
    }
  };

  const handleRequirementChange = (index, value) => {
    const newRequirements = [...requirements];
    newRequirements[index] = value;
    setRequirements(newRequirements);
  };

  const addRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const removeRequirement = (index) => {
    const newRequirements = requirements.filter((_, i) => i !== index);
    setRequirements(newRequirements);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Bitte wählen Sie eine PDF-Datei aus.');
      return;
    }

    const validRequirements = requirements.filter(req => req.trim() !== '');
    if (validRequirements.length === 0) {
      setError('Bitte geben Sie mindestens eine Anforderung ein.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('requirements', JSON.stringify({ requirements: validRequirements }));

    try {
      const response = await axios.post('http://localhost:8000/analyze-cv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      setResults(response.data);
    } catch (error) {
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            CV Parser & Analyzer
          </Typography>

          <Box sx={{ mb: 4 }}>
            <input
              accept="application/pdf"
              style={{ display: 'none' }}
              id="cv-file-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="cv-file-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<UploadFile />}
                fullWidth
              >
                PDF-Lebenslauf hochladen
              </Button>
            </label>
            {file && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Ausgewählte Datei: {file.name}
              </Typography>
            )}
          </Box>

          <Typography variant="h6" gutterBottom>
            Stellenanforderungen
          </Typography>
          
          <List>
            {requirements.map((req, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <TextField
                  fullWidth
                  label={`Anforderung ${index + 1}`}
                  value={req}
                  onChange={(e) => handleRequirementChange(index, e.target.value)}
                  variant="outlined"
                  sx={{ mr: 1 }}
                />
                {index > 0 && (
                  <Button
                    color="error"
                    onClick={() => removeRequirement(index)}
                    startIcon={<DeleteIcon />}
                  >
                    Entfernen
                  </Button>
                )}
              </ListItem>
            ))}
          </List>

          <Button
            startIcon={<AddIcon />}
            onClick={addRequirement}
            sx={{ mt: 2 }}
          >
            Anforderung hinzufügen
          </Button>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ mt: 4 }}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : 'Analyse starten'}
          </Button>

          {results && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Analyseergebnisse
              </Typography>
              <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h5" gutterBottom>
                  Gesamtbewertung: {results.overall_score}%
                </Typography>
              </Paper>
              
              <Typography variant="subtitle1" gutterBottom>
                Detaillierte Übereinstimmungen:
              </Typography>
              <List>
                {results.detailed_matches.map((match, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={match.requirement}
                      secondary={
                        <Chip
                          label={`${match.score}%`}
                          color={match.score > 70 ? 'success' : match.score > 40 ? 'warning' : 'error'}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default App; 