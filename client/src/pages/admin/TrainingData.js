import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Slider,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Psychology as AIIcon,
} from '@mui/icons-material';
import AlertMessage from '../../components/common/AlertMessage';

const TrainingData = () => {
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [trainingData, setTrainingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    resumeId: '',
    jobId: '',
    matchScore: 70,
    feedback: '',
  });
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch resumes, jobs, and training data in parallel
      const [resumesRes, jobsRes, trainingDataRes] = await Promise.all([
        api.get('/api/admin/resumes'),
        api.get('/api/admin/jobs'),
        api.get('/api/admin/training-data'),
      ]);
      
      setResumes(resumesRes.data);
      setJobs(jobsRes.data);
      setTrainingData(trainingDataRes.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setAlert({
        open: true,
        message: 'Failed to load data. Please try again later.',
        severity: 'error',
      });
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSliderChange = (event, newValue) => {
    setFormData({
      ...formData,
      matchScore: newValue,
    });
  };

  const handleSubmit = async () => {
    try {
      // Validate form
      if (!formData.resumeId || !formData.jobId || !formData.feedback) {
        setAlert({
          open: true,
          message: 'Please fill in all required fields',
          severity: 'error',
        });
        return;
      }
      
      // Submit training data
      const res = await api.post('/api/admin/training-data', formData);
      
      // Add to local state
      setTrainingData([res.data.data, ...trainingData]);
      
      // Reset form
      setFormData({
        resumeId: '',
        jobId: '',
        matchScore: 70,
        feedback: '',
      });
      
      setAlert({
        open: true,
        message: 'Training data added successfully!',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error adding training data:', err);
      setAlert({
        open: true,
        message: 'Failed to add training data. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleDeleteTrainingData = async (id) => {
    try {
      await api.delete(`/api/admin/training-data/${id}`);
      
      // Remove from local state
      setTrainingData(trainingData.filter((item) => item._id !== id));
      
      setAlert({
        open: true,
        message: 'Training data deleted successfully!',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error deleting training data:', err);
      setAlert({
        open: true,
        message: 'Failed to delete training data. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const getResumeById = (id) => {
    return resumes.find((resume) => resume._id === id);
  };

  const getJobById = (id) => {
    return jobs.find((job) => job._id === id);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Training Data
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Manage training data for the AI model to improve resume-job matching.
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Add Training Data
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Provide feedback on resume-job matches to help train the AI model.
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box component="form" sx={{ mt: 2 }}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="resume-select-label">Resume</InputLabel>
                    <Select
                      labelId="resume-select-label"
                      id="resume-select"
                      name="resumeId"
                      value={formData.resumeId}
                      onChange={handleFormChange}
                      label="Resume"
                    >
                      {resumes.map((resume) => (
                        <MenuItem key={resume._id} value={resume._id}>
                          {resume.fileName} ({resume.user?.name || 'Unknown User'})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth margin="normal">
                    <InputLabel id="job-select-label">Job</InputLabel>
                    <Select
                      labelId="job-select-label"
                      id="job-select"
                      name="jobId"
                      value={formData.jobId}
                      onChange={handleFormChange}
                      label="Job"
                    >
                      {jobs.map((job) => (
                        <MenuItem key={job._id} value={job._id}>
                          {job.title} at {job.company}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Box sx={{ mt: 3, mb: 2 }}>
                    <Typography id="match-score-slider" gutterBottom>
                      Match Score: {formData.matchScore}
                    </Typography>
                    <Slider
                      value={formData.matchScore}
                      onChange={handleSliderChange}
                      aria-labelledby="match-score-slider"
                      valueLabelDisplay="auto"
                      step={5}
                      marks
                      min={0}
                      max={100}
                    />
                  </Box>

                  <TextField
                    fullWidth
                    margin="normal"
                    name="feedback"
                    label="Feedback"
                    multiline
                    rows={4}
                    value={formData.feedback}
                    onChange={handleFormChange}
                    placeholder="Provide feedback on why this resume matches or doesn't match the job requirements..."
                  />

                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleSubmit}
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    Add Training Data
                  </Button>
                </Box>
              )}
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 2, mt: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AIIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  About Training Data
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Training data helps improve the AI's ability to match resumes with jobs. By providing feedback on matches, you help the system learn what makes a good match.
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                For Google's Gemini AI, this training data is used to improve the prompts and evaluation criteria used in the matching process.
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<SaveIcon />}
                fullWidth
              >
                Export Training Data
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Training Data History
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                View and manage previously added training data.
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : trainingData.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No training data available yet.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add training data to improve the AI model.
                  </Typography>
                </Box>
              ) : (
                <List>
                  {trainingData.map((item, index) => {
                    const resume = getResumeById(item.resumeId);
                    const job = getJobById(item.jobId);
                    
                    return (
                      <React.Fragment key={item._id || index}>
                        <ListItem alignItems="flex-start">
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" component="div">
                                {job?.title || 'Unknown Job'} at {job?.company || 'Unknown Company'}
                              </Typography>
                            }
                            secondary={
                              <>
                                <Typography variant="body2" component="span" color="text.primary">
                                  Resume: {resume?.fileName || 'Unknown Resume'}
                                </Typography>
                                <br />
                                <Typography variant="body2" component="span">
                                  Match Score: {item.matchScore}
                                </Typography>
                                <br />
                                <Typography variant="body2" component="span">
                                  Added: {formatDate(item.addedAt)}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  component="div"
                                  sx={{
                                    mt: 1,
                                    p: 1,
                                    bgcolor: 'background.default',
                                    borderRadius: 1,
                                  }}
                                >
                                  {item.feedback}
                                </Typography>
                              </>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => handleDeleteTrainingData(item._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                        {index < trainingData.length - 1 && <Divider component="li" />}
                      </React.Fragment>
                    );
                  })}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <AlertMessage
        open={alert.open}
        message={alert.message}
        severity={alert.severity}
        onClose={handleCloseAlert}
      />
    </Container>
  );
};

export default TrainingData;
