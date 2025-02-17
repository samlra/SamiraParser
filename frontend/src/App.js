import React, { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
  useTheme,
  alpha,
  IconButton,
  CssBaseline,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { UploadFile, Add as AddIcon, Delete as DeleteIcon, DarkMode, LightMode } from '@mui/icons-material';
import axios from 'axios';

// Predefined requirements for different roles
const jobRoleRequirements = {
  developer: [
    "Erfahrung mit modernen Programmiersprachen (z.B. Python, Java, JavaScript)",
    "Kenntnisse in Webtechnologien (HTML, CSS, React/Angular)",
    "Verständnis von Datenbanken und SQL",
    "Erfahrung mit Git und CI/CD",
    "Agile Entwicklungsmethoden"
  ],
  consultant: [
    "Ausgeprägte analytische Fähigkeiten",
    "Exzellente Kommunikationsfähigkeiten",
    "Projektmanagement-Erfahrung",
    "Präsentationsfähigkeiten",
    "Branchenkenntnisse"
  ],
  dataScientist: [
    "Erfahrung mit Python und R",
    "Machine Learning Kenntnisse",
    "Statistik und Mathematik",
    "Data Visualization",
    "Big Data Technologien"
  ],
  projectManager: [
    "Projektmanagement-Zertifizierungen",
    "Führungserfahrung",
    "Stakeholder Management",
    "Risikomanagement",
    "Budgetierung und Ressourcenplanung"
  ]
};

// Remove particles config and keep only the theme configuration
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    secondary: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    background: {
      default: mode === 'light' ? '#ffffff' : '#1a1a1a',
      paper: mode === 'light' ? '#ffffff' : '#242424',
    },
    text: {
      primary: mode === 'light' ? '#000000' : '#ffffff',
      secondary: mode === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 300,
      color: mode === 'light' ? '#000000' : '#ffffff',
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
    },
    h6: {
      fontWeight: 300,
      color: '#9c27b0',
      letterSpacing: '0.1em',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: mode === 'light' ? '#ffffff' : '#242424',
          backdropFilter: 'none',
          border: mode === 'light' 
            ? '1px solid rgba(0, 0, 0, 0.1)'
            : '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            border: mode === 'light'
              ? '1px solid rgba(0, 0, 0, 0.2)'
              : '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: mode === 'light'
              ? 'none'
              : '0 0 20px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
          fontWeight: 500,
          letterSpacing: '0.05em',
          padding: '8px 16px',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: mode === 'light' 
              ? '0 4px 20px rgba(0, 0, 0, 0.1)'
              : '0 4px 20px rgba(156, 39, 176, 0.4)',
          },
        },
        contained: {
          background: mode === 'light'
            ? '#9c27b0'
            : 'linear-gradient(45deg, #9c27b0 30%, #ba68c8 90%)',
          color: '#ffffff',
          '&:hover': {
            background: mode === 'light'
              ? '#7b1fa2'
              : 'linear-gradient(45deg, #ba68c8 30%, #9c27b0 90%)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: mode === 'light' ? 'transparent' : 'rgba(255, 255, 255, 0.03)',
            '& fieldset': {
              borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.15)',
            },
            '&:hover fieldset': {
              borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.25)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#9c27b0',
            },
          },
          '& .MuiInputLabel-root': {
            color: mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)',
          },
          '& .MuiInputBase-input': {
            color: mode === 'light' ? '#000000' : '#ffffff',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
          border: mode === 'light' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
          color: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : '#ffffff',
          '&:hover': {
            backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.08)',
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: mode === 'light' ? '#ffffff' : '#1a1a1a',
          backgroundImage: 'none',
        },
      },
    },
  },
});

function JobRoleTab({ value, index, children }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [mode, setMode] = useState('light');
  const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);
  const [file, setFile] = useState(null);
  const [requirements, setRequirements] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedRole, setSelectedRole] = useState('developer');

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    // Load predefined requirements based on selected role
    const roleRequirements = {
      0: jobRoleRequirements.developer,
      1: jobRoleRequirements.consultant,
      2: jobRoleRequirements.dataScientist,
      3: jobRoleRequirements.projectManager,
    }[newValue] || [];
    setRequirements(roleRequirements);
  };

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
    setResults(null);

    const formData = new FormData();
    formData.append('file', file);
    
    // Convert requirements to a JSON string
    const requirementsJson = JSON.stringify(validRequirements.map(req => ({ text: req })));
    
    try {
      console.log('Sending request to backend...');
      const response = await axios.post(
        `http://localhost:8000/analyze-cv?requirements=${encodeURIComponent(requirementsJson)}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      console.log('Received response:', response.data);
      setResults(response.data);
    } catch (error) {
      console.error('Error details:', error);
      let errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
      
      if (error.response?.data?.detail) {
        errorMessage = `Fehler: ${error.response.data.detail}`;
      } else if (error.message) {
        errorMessage = `Fehler: ${error.message}`;
      }
      
      setError(errorMessage);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <IconButton onClick={toggleColorMode} color="inherit">
            {mode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Box>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4,
            position: 'relative',
            backgroundColor: mode === 'light' ? '#ffffff' : 'rgba(20, 20, 20, 0.8)',
            backdropFilter: mode === 'light' ? 'none' : 'blur(10px)',
            border: mode === 'light' 
              ? '1px solid rgba(0, 0, 0, 0.1)'
              : '1px solid rgba(156, 39, 176, 0.1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: mode === 'light'
                ? 'linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(156, 39, 176, 0.5), transparent)',
            },
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            align="center" 
            sx={{ 
              mb: 4,
              background: 'linear-gradient(45deg, #9c27b0, #ff9800)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'glow 2s ease-in-out infinite alternate',
              '@keyframes glow': {
                '0%': {
                  textShadow: '0 0 10px rgba(156, 39, 176, 0.3)',
                },
                '100%': {
                  textShadow: '0 0 20px rgba(255, 152, 0, 0.5)',
                },
              },
            }}
          >
            CV-Analyse & Bewertung
          </Typography>

          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              mb: 3,
              '& .MuiTab-root': {
                minWidth: 120,
                fontWeight: 500,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                },
              },
              '& .Mui-selected': {
                color: 'primary.main',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'primary.main',
                height: 3,
                borderRadius: 1.5,
              },
            }}
          >
            <Tab label="Software Entwickler" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="Consultant" id="tab-1" aria-controls="tabpanel-1" />
            <Tab label="Data Scientist" id="tab-2" aria-controls="tabpanel-2" />
            <Tab label="Projektmanager" id="tab-3" aria-controls="tabpanel-3" />
          </Tabs>

          <JobRoleTab value={selectedTab} index={0}>
            <Box>
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
                    sx={{
                      background: 'linear-gradient(45deg, #9c27b0 30%, #ff9800 90%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #7b1fa2 30%, #ffb74d 90%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 20px rgba(156, 39, 176, 0.3)',
                      },
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    PDF-Lebenslauf hochladen
                  </Button>
                </label>
                {file && (
                  <Typography variant="body2" sx={{ mt: 1, color: 'primary.main' }}>
                    Ausgewählte Datei: {file.name}
                  </Typography>
                )}
              </Box>

              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Stellenanforderungen
              </Typography>

              <List sx={{ mt: 2 }}>
                {requirements.map((req, index) => (
                  <ListItem 
                    key={index} 
                    sx={{ 
                      px: 0,
                      mb: 2,
                      '&:hover': {
                        '& .MuiButton-root': {
                          opacity: 1,
                        },
                      },
                    }}
                  >
                    <TextField
                      fullWidth
                      label={`Anforderung ${index + 1}`}
                      value={req}
                      onChange={(e) => handleRequirementChange(index, e.target.value)}
                      variant="outlined"
                      sx={{
                        mr: 1,
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: 'primary.light',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                    />
                    {index > 0 && (
                      <Button
                        color="error"
                        onClick={() => removeRequirement(index)}
                        startIcon={<DeleteIcon />}
                        sx={{
                          opacity: 0.7,
                          transition: 'opacity 0.2s',
                        }}
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
                sx={{
                  mt: 2,
                  color: 'secondary.main',
                  borderColor: 'secondary.main',
                  '&:hover': {
                    borderColor: 'secondary.dark',
                    backgroundColor: 'rgba(255, 152, 0, 0.04)',
                  },
                }}
                variant="outlined"
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
                sx={{
                  mt: 4,
                  background: 'linear-gradient(45deg, #9c27b0 30%, #ff9800 90%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #7b1fa2 30%, #ffb74d 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(156, 39, 176, 0.3)',
                  },
                  transition: 'all 0.3s ease-in-out',
                }}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Analyse starten'}
              </Button>
            </Box>
          </JobRoleTab>

          <JobRoleTab value={selectedTab} index={1}>
            <Box>
              <Box sx={{ mb: 4 }}>
                <input
                  accept="application/pdf"
                  style={{ display: 'none' }}
                  id="consultant-cv-upload"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="consultant-cv-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<UploadFile />}
                    fullWidth
                    sx={{
                      background: 'linear-gradient(45deg, #9c27b0 30%, #ff9800 90%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #7b1fa2 30%, #ffb74d 90%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 20px rgba(156, 39, 176, 0.3)',
                      },
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    PDF-Lebenslauf hochladen
                  </Button>
                </label>
                {file && (
                  <Typography variant="body2" sx={{ mt: 1, color: 'primary.main' }}>
                    Ausgewählte Datei: {file.name}
                  </Typography>
                )}
              </Box>

              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Stellenanforderungen
              </Typography>

              <List sx={{ mt: 2 }}>
                {requirements.map((req, index) => (
                  <ListItem 
                    key={index} 
                    sx={{ 
                      px: 0,
                      mb: 2,
                      '&:hover': {
                        '& .MuiButton-root': {
                          opacity: 1,
                        },
                      },
                    }}
                  >
                    <TextField
                      fullWidth
                      label={`Anforderung ${index + 1}`}
                      value={req}
                      onChange={(e) => handleRequirementChange(index, e.target.value)}
                      variant="outlined"
                      sx={{
                        mr: 1,
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: 'primary.light',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                    />
                    {index > 0 && (
                      <Button
                        color="error"
                        onClick={() => removeRequirement(index)}
                        startIcon={<DeleteIcon />}
                        sx={{
                          opacity: 0.7,
                          transition: 'opacity 0.2s',
                        }}
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
                sx={{
                  mt: 2,
                  color: 'secondary.main',
                  borderColor: 'secondary.main',
                  '&:hover': {
                    borderColor: 'secondary.dark',
                    backgroundColor: 'rgba(255, 152, 0, 0.04)',
                  },
                }}
                variant="outlined"
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
                sx={{
                  mt: 4,
                  background: 'linear-gradient(45deg, #9c27b0 30%, #ff9800 90%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #7b1fa2 30%, #ffb74d 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(156, 39, 176, 0.3)',
                  },
                  transition: 'all 0.3s ease-in-out',
                }}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Analyse starten'}
              </Button>
            </Box>
          </JobRoleTab>

          <JobRoleTab value={selectedTab} index={2}>
            <Box>
              <Box sx={{ mb: 4 }}>
                <input
                  accept="application/pdf"
                  style={{ display: 'none' }}
                  id="data-scientist-cv-upload"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="data-scientist-cv-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<UploadFile />}
                    fullWidth
                    sx={{
                      background: 'linear-gradient(45deg, #9c27b0 30%, #ff9800 90%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #7b1fa2 30%, #ffb74d 90%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 20px rgba(156, 39, 176, 0.3)',
                      },
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    PDF-Lebenslauf hochladen
                  </Button>
                </label>
                {file && (
                  <Typography variant="body2" sx={{ mt: 1, color: 'primary.main' }}>
                    Ausgewählte Datei: {file.name}
                  </Typography>
                )}
              </Box>

              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Stellenanforderungen
              </Typography>

              <List sx={{ mt: 2 }}>
                {requirements.map((req, index) => (
                  <ListItem 
                    key={index} 
                    sx={{ 
                      px: 0,
                      mb: 2,
                      '&:hover': {
                        '& .MuiButton-root': {
                          opacity: 1,
                        },
                      },
                    }}
                  >
                    <TextField
                      fullWidth
                      label={`Anforderung ${index + 1}`}
                      value={req}
                      onChange={(e) => handleRequirementChange(index, e.target.value)}
                      variant="outlined"
                      sx={{
                        mr: 1,
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: 'primary.light',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                    />
                    {index > 0 && (
                      <Button
                        color="error"
                        onClick={() => removeRequirement(index)}
                        startIcon={<DeleteIcon />}
                        sx={{
                          opacity: 0.7,
                          transition: 'opacity 0.2s',
                        }}
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
                sx={{
                  mt: 2,
                  color: 'secondary.main',
                  borderColor: 'secondary.main',
                  '&:hover': {
                    borderColor: 'secondary.dark',
                    backgroundColor: 'rgba(255, 152, 0, 0.04)',
                  },
                }}
                variant="outlined"
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
                sx={{
                  mt: 4,
                  background: 'linear-gradient(45deg, #9c27b0 30%, #ff9800 90%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #7b1fa2 30%, #ffb74d 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(156, 39, 176, 0.3)',
                  },
                  transition: 'all 0.3s ease-in-out',
                }}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Analyse starten'}
              </Button>
            </Box>
          </JobRoleTab>

          <JobRoleTab value={selectedTab} index={3}>
            <Box>
              <Box sx={{ mb: 4 }}>
                <input
                  accept="application/pdf"
                  style={{ display: 'none' }}
                  id="project-manager-cv-upload"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="project-manager-cv-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<UploadFile />}
                    fullWidth
                    sx={{
                      background: 'linear-gradient(45deg, #9c27b0 30%, #ff9800 90%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #7b1fa2 30%, #ffb74d 90%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 20px rgba(156, 39, 176, 0.3)',
                      },
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    PDF-Lebenslauf hochladen
                  </Button>
                </label>
                {file && (
                  <Typography variant="body2" sx={{ mt: 1, color: 'primary.main' }}>
                    Ausgewählte Datei: {file.name}
                  </Typography>
                )}
              </Box>

              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Stellenanforderungen
              </Typography>

              <List sx={{ mt: 2 }}>
                {requirements.map((req, index) => (
                  <ListItem 
                    key={index} 
                    sx={{ 
                      px: 0,
                      mb: 2,
                      '&:hover': {
                        '& .MuiButton-root': {
                          opacity: 1,
                        },
                      },
                    }}
                  >
                    <TextField
                      fullWidth
                      label={`Anforderung ${index + 1}`}
                      value={req}
                      onChange={(e) => handleRequirementChange(index, e.target.value)}
                      variant="outlined"
                      sx={{
                        mr: 1,
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: 'primary.light',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                    />
                    {index > 0 && (
                      <Button
                        color="error"
                        onClick={() => removeRequirement(index)}
                        startIcon={<DeleteIcon />}
                        sx={{
                          opacity: 0.7,
                          transition: 'opacity 0.2s',
                        }}
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
                sx={{
                  mt: 2,
                  color: 'secondary.main',
                  borderColor: 'secondary.main',
                  '&:hover': {
                    borderColor: 'secondary.dark',
                    backgroundColor: 'rgba(255, 152, 0, 0.04)',
                  },
                }}
                variant="outlined"
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
                sx={{
                  mt: 4,
                  background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                  color: 'white',
                  '&:hover': {
                    background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.primary.main, 0.25)}`,
                  },
                  transition: 'all 0.3s ease-in-out',
                }}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Analyse starten'}
              </Button>
            </Box>
          </JobRoleTab>

          {/* Results section */}
          {results && (
            <Box sx={{ mt: 4 }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{
                  background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: (theme) => `0 0 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                Analyseergebnisse
              </Typography>

              {results.summary && results.summary.startsWith('Fehler') ? (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 2,
                    backgroundColor: (theme) => theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.error.main, 0.1)
                      : alpha(theme.palette.error.light, 0.1),
                    color: 'error.main',
                    border: 1,
                    borderColor: 'error.main',
                  }}
                >
                  {results.summary}
                </Alert>
              ) : (
                <>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 3, 
                      mb: 3,
                      background: 'none',
                      border: (theme) => `1px solid ${
                        theme.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.1)' 
                          : 'rgba(0,0,0,0.1)'
                      }`,
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box 
                        sx={{ 
                          position: 'relative', 
                          display: 'inline-flex', 
                          mr: 3,
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: -4,
                            left: -4,
                            right: -4,
                            bottom: -4,
                            borderRadius: '50%',
                            background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            opacity: 0.2,
                            animation: 'pulse 2s ease-in-out infinite',
                          },
                          '@keyframes pulse': {
                            '0%': {
                              transform: 'scale(0.95)',
                              opacity: 0.5,
                            },
                            '70%': {
                              transform: 'scale(1)',
                              opacity: 0.2,
                            },
                            '100%': {
                              transform: 'scale(0.95)',
                              opacity: 0.5,
                            },
                          },
                        }}
                      >
                        <CircularProgress
                          variant="determinate"
                          value={results.overall_score}
                          size={80}
                          thickness={4}
                          sx={{
                            color: (theme) => results.overall_score > 70 
                              ? theme.palette.success.main
                              : results.overall_score > 40 
                                ? theme.palette.warning.main 
                                : theme.palette.error.main,
                            boxShadow: (theme) => `0 0 20px ${alpha(
                              results.overall_score > 70 
                                ? theme.palette.success.main
                                : results.overall_score > 40 
                                  ? theme.palette.warning.main 
                                  : theme.palette.error.main,
                              0.3
                            )}`,
                          }}
                        />
                        <Box
                          sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: 'absolute',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography 
                            variant="h6" 
                            component="div" 
                            sx={{ 
                              color: results.overall_score > 70 ? 'success.main' : 
                                     results.overall_score > 40 ? 'warning.main' : 'error.main',
                              fontWeight: 'bold',
                            }}
                          >
                            {`${Math.round(results.overall_score)}%`}
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="h5" sx={{ color: 'primary.main', mb: 0.5 }}>
                          Gesamtbewertung
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Übereinstimmung mit dem Anforderungsprofil
                        </Typography>
                      </Box>
                    </Box>

                    <Typography 
                      variant="body1" 
                      paragraph 
                      sx={{ 
                        whiteSpace: 'pre-line',
                        backgroundColor: (theme) => alpha(
                          theme.palette.background.paper,
                          theme.palette.mode === 'dark' ? 0.1 : 0.7
                        ),
                        p: 2,
                        borderRadius: 1,
                        border: 1,
                        borderColor: 'divider',
                        boxShadow: (theme) => `0 0 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                      }}
                    >
                      {results.summary}
                    </Typography>

                    {results.key_strengths && results.key_strengths.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" gutterBottom color="primary.main">
                          Besondere Stärken:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                          {results.key_strengths.map((strength, index) => (
                            <Chip
                              key={index}
                              label={strength}
                              color="success"
                              variant="outlined"
                              sx={{ 
                                fontSize: '0.9rem', 
                                py: 0.5,
                                background: 'none',
                                border: (theme) => `1px solid ${
                                  theme.palette.mode === 'dark' 
                                    ? 'rgba(255,255,255,0.1)' 
                                    : 'rgba(0,0,0,0.1)'
                                }`,
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {results.improvement_areas && results.improvement_areas.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" gutterBottom color="secondary.main">
                          Entwicklungspotenzial:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {results.improvement_areas.map((area, index) => (
                            <Chip
                              key={index}
                              label={area}
                              color="secondary"
                              variant="outlined"
                              sx={{ 
                                fontSize: '0.9rem', 
                                py: 0.5,
                                background: 'none',
                                border: (theme) => `1px solid ${
                                  theme.palette.mode === 'dark' 
                                    ? 'rgba(255,255,255,0.1)' 
                                    : 'rgba(0,0,0,0.1)'
                                }`,
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Paper>

                  {results.requirement_matches && results.requirement_matches.length > 0 && (
                    <>
                      <Typography variant="h6" gutterBottom color="primary.main">
                        Detaillierte Analyse der Anforderungen:
                      </Typography>
                      <List>
                        {results.requirement_matches.map((match, index) => (
                          <ListItem key={index} sx={{ px: 0, mb: 2 }}>
                            <Paper 
                              elevation={1} 
                              sx={{ 
                                p: 2, 
                                width: '100%',
                                background: 'none',
                                border: (theme) => `1px solid ${
                                  theme.palette.mode === 'dark' 
                                    ? 'rgba(255,255,255,0.1)' 
                                    : 'rgba(0,0,0,0.1)'
                                }`,
                                transition: 'transform 0.2s',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                },
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Typography 
                                  variant="subtitle2" 
                                  sx={{ 
                                    flex: 1,
                                    color: 'text.primary',
                                    fontWeight: 500,
                                  }}
                                >
                                  {match.requirement}
                                </Typography>
                                <Chip
                                  label={`${match.match_percentage}%`}
                                  color={match.match_percentage > 70 ? 'success' : 
                                        match.match_percentage > 40 ? 'warning' : 'error'}
                                  sx={{ 
                                    ml: 2,
                                    fontWeight: 'bold',
                                    backgroundColor: match.match_percentage > 70 ? alpha('#2e7d32', 0.1) : 
                                                  match.match_percentage > 40 ? alpha('#ed6c02', 0.1) : 
                                                  alpha('#d32f2f', 0.1),
                                  }}
                                />
                              </Box>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: 'text.secondary',
                                  whiteSpace: 'pre-line',
                                  p: 1.5,
                                  borderRadius: 1,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                }}
                              >
                                {match.explanation}
                              </Typography>
                            </Paper>
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}

                  {results.cv_text && (
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="subtitle1" gutterBottom color="text.secondary">
                        Extrahierter Text (Ausschnitt):
                      </Typography>
                      <Paper 
                        elevation={1} 
                        sx={{ 
                          p: 2,
                          background: 'none',
                          border: (theme) => `1px solid ${
                            theme.palette.mode === 'dark' 
                              ? 'rgba(255,255,255,0.1)' 
                              : 'rgba(0,0,0,0.1)'
                          }`,
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            whiteSpace: 'pre-line',
                            fontFamily: 'monospace',
                          }}
                        >
                          {results.cv_text}
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default App; 