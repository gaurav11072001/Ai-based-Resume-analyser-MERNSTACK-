import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from '@mui/material';
import { 
  CloudUpload as UploadIcon,
  Analytics as AnalyticsIcon,
  Check as CheckIcon 
} from '@mui/icons-material';
import ResumeDropzone from '../../components/common/ResumeDropzone';
import AlertMessage from '../../components/common/AlertMessage';

const steps = ['Upload Resume', 'Analyze', 'View Results'];

const ResumeUpload = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadedResumeId, setUploadedResumeId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const handleFileAccepted = (file) => {
    setResumeFile(file);
  };

  const handleUpload = async () => {
    if (!resumeFile) {
      setAlert({
        open: true,
        message: 'Please select a resume file to upload',
        severity: 'error',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('resume', resumeFile);

      // Upload resume
      const res = await api.post('/api/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadedResumeId(res.data.resume.id);
      setActiveStep(1);
      setAlert({
        open: true,
        message: 'Resume uploaded successfully!',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error uploading resume:', err);
      setAlert({
        open: true,
        message: err.response?.data?.msg || 'Failed to upload resume. Please try again.',
        severity: 'error',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedResumeId) {
      setAlert({
        open: true,
        message: 'No resume to analyze. Please upload a resume first.',
        severity: 'error',
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Analyze resume with Gemini AI
      await api.post(`/api/resumes/${uploadedResumeId}/analyze`);

      setActiveStep(2);
      setAlert({
        open: true,
        message: 'Resume analyzed successfully!',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error analyzing resume:', err);
      setAlert({
        open: true,
        message: err.response?.data?.msg || 'Failed to analyze resume. Please try again.',
        severity: 'error',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleViewResults = () => {
    navigate(`/resume/${uploadedResumeId}`);
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Upload your resume
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Upload your resume in PDF or DOCX format. We'll analyze it with our AI-powered system to provide feedback and suggestions.
            </Typography>
            <ResumeDropzone onFileAccepted={handleFileAccepted} isUploading={isUploading} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={!resumeFile || isUploading}
                startIcon={isUploading ? <CircularProgress size={20} /> : <UploadIcon />}
              >
                {isUploading ? 'Uploading...' : 'Upload Resume'}
              </Button>
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Analyze your resume
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Now that your resume is uploaded, let's analyze it with our AI-powered system to provide feedback and suggestions.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                startIcon={isAnalyzing ? <CircularProgress size={20} /> : <AnalyticsIcon />}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
              </Button>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Analysis complete!
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Your resume has been successfully analyzed. View the detailed results to see your ATS compatibility score and suggestions for improvement.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleViewResults}
                startIcon={<CheckIcon />}
              >
                View Analysis Results
              </Button>
            </Box>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Upload Resume
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Upload your resume for AI-powered analysis and get personalized improvement suggestions.
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mt: 4, mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Paper sx={{ p: 4, borderRadius: 2 }}>
          {getStepContent(activeStep)}
        </Paper>
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

export default ResumeUpload;
