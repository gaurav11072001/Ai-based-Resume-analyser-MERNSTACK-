import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import api from '../../utils/axios';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Description as ResumeIcon,
  WorkOutline as JobIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import AlertMessage from '../../components/common/AlertMessage';

const Dashboard = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await api.get('/api/resumes');
        setResumes(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching resumes:', err);
        setAlert({
          open: true,
          message: 'Failed to load resumes. Please try again later.',
          severity: 'error',
        });
        setLoading(false);
      }
    };

    fetchResumes();
  }, []);

  const handleDeleteResume = async (id) => {
    try {
      await api.delete(`/api/resumes/${id}`);
      setResumes(resumes.filter((resume) => resume._id !== id));
      setAlert({
        open: true,
        message: 'Resume deleted successfully',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error deleting resume:', err);
      setAlert({
        open: true,
        message: 'Failed to delete resume. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getScoreColor = (score) => {
    if (!score) return 'default';
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Welcome back, {user?.name}! Manage your resumes and job matches here.
        </Typography>

        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card className="dashboard-card" sx={{ height: '100%' }}>
              <CardContent>
                <UploadIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  Upload Resume
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Upload a new resume for AI analysis and get personalized improvement suggestions.
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  component={RouterLink}
                  to="/upload-resume"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Upload New Resume
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card className="dashboard-card" sx={{ height: '100%' }}>
              <CardContent>
                <ResumeIcon color="secondary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  Resume Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View your resume analysis results, ATS compatibility score, and improvement suggestions.
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  disabled={resumes.length === 0}
                  component={RouterLink}
                  to={resumes.length > 0 ? `/resume/${resumes[0]._id}` : '#'}
                  variant="outlined"
                  color="secondary"
                  fullWidth
                >
                  View Latest Analysis
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card className="dashboard-card" sx={{ height: '100%' }}>
              <CardContent>
                <JobIcon color="info" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  Job Matches
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Discover job opportunities that match your skills and experience based on your resume.
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  disabled={resumes.length === 0}
                  component={RouterLink}
                  to={resumes.length > 0 ? `/resume/${resumes[0]._id}/job-matches` : '#'}
                  variant="outlined"
                  color="info"
                  fullWidth
                >
                  View Job Matches
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Your Resumes
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : resumes.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                You haven't uploaded any resumes yet.
              </Typography>
              <Button
                component={RouterLink}
                to="/upload-resume"
                variant="contained"
                color="primary"
                startIcon={<UploadIcon />}
                sx={{ mt: 2 }}
              >
                Upload Your First Resume
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {resumes.map((resume) => (
                <Grid item xs={12} sm={6} md={4} key={resume._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" component="h3" noWrap>
                        {resume.fileName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Uploaded on {formatDate(resume.createdAt)}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          ATS Score:
                        </Typography>
                        {resume.analysis && resume.analysis.atsScore !== undefined ? (
                          <Chip
                            label={`${resume.analysis.atsScore}/100`}
                            color={getScoreColor(resume.analysis.atsScore)}
                            size="small"
                          />
                        ) : (
                          <Chip label="Not analyzed" size="small" />
                        )}
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        component={RouterLink}
                        to={`/resume/${resume._id}`}
                        size="small"
                        color="primary"
                      >
                        View Analysis
                      </Button>
                      <Button
                        component={RouterLink}
                        to={`/resume/${resume._id}/job-matches`}
                        size="small"
                        color="secondary"
                      >
                        Job Matches
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDeleteResume(resume._id)}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
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

export default Dashboard;
