import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import api from '../../utils/axios';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Work as WorkIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  School as EducationIcon,
  AttachMoney as SalaryIcon,
  Description as ResumeIcon,
} from '@mui/icons-material';
import ScoreCircle from '../../components/common/ScoreCircle';
import AlertMessage from '../../components/common/AlertMessage';

const JobMatches = () => {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [jobMatches, setJobMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get resume details
        const resumeRes = await api.get(`/api/resumes/${id}`);
        setResume(resumeRes.data);

        // Get job matches
        const matchesRes = await api.get(`/api/resumes/${id}/jobs`);
        setJobMatches(matchesRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setAlert({
          open: true,
          message: 'Failed to load job matches. Please try again later.',
          severity: 'error',
        });
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleFindMatches = async () => {
    setLoading(true);
    try {
      // Trigger job matching
      const matchesRes = await api.get(`/api/resumes/${id}/job-matches`);
      setJobMatches(matchesRes.data);
      
      setAlert({
        open: true,
        message: 'Job matches updated successfully!',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error finding job matches:', err);
      setAlert({
        open: true,
        message: 'Failed to find job matches. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!resume) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" color="error" gutterBottom>
            Resume not found
          </Typography>
          <Button component={RouterLink} to="/dashboard" variant="contained">
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  const hasAnalysis = resume.analysis && resume.analysis.skills && resume.analysis.skills.length > 0;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Job Matches
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Discover job opportunities that match your skills and experience based on your resume.
        </Typography>

        <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <Typography variant="h6" gutterBottom>
                {resume.fileName}
              </Typography>
              {hasAnalysis && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {resume.analysis.skills.slice(0, 5).map((skill, index) => (
                    <Chip key={index} label={skill} size="small" color="primary" variant="outlined" />
                  ))}
                  {resume.analysis.skills.length > 5 && (
                    <Chip 
                      label={`+${resume.analysis.skills.length - 5} more`} 
                      size="small" 
                      variant="outlined" 
                    />
                  )}
                </Box>
              )}
            </Grid>
            <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleFindMatches}
                disabled={loading || !hasAnalysis}
              >
                {loading ? <CircularProgress size={24} /> : 'Update Job Matches'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {!hasAnalysis ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <ResumeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Resume Not Analyzed Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Your resume needs to be analyzed before we can find job matches. Please go to the analysis page first.
            </Typography>
            <Button
              component={RouterLink}
              to={`/resume/${id}`}
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 2 }}
            >
              Analyze Resume
            </Button>
          </Paper>
        ) : jobMatches.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <WorkIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No Job Matches Found
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              We couldn't find any job matches for your resume. Try updating your resume with more skills and experience, or check back later for new job listings.
            </Typography>
            <Button
              component={RouterLink}
              to={`/resume/${id}`}
              variant="contained"
              color="primary"
              sx={{ mr: 2 }}
            >
              View Resume Analysis
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleFindMatches}
              disabled={loading}
            >
              Try Again
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {jobMatches.map((job, index) => (
              <Grid item xs={12} key={index}>
                <Card className="job-match-card">
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={9}>
                        <Typography variant="h5" component="h2" gutterBottom>
                          {job.jobTitle}
                        </Typography>
                        
                        <List dense>
                          {job.company && (
                            <ListItem>
                              <ListItemIcon>
                                <BusinessIcon />
                              </ListItemIcon>
                              <ListItemText primary={job.company} />
                            </ListItem>
                          )}
                          {job.location && (
                            <ListItem>
                              <ListItemIcon>
                                <LocationIcon />
                              </ListItemIcon>
                              <ListItemText primary={job.location} />
                            </ListItem>
                          )}
                          {job.education && (
                            <ListItem>
                              <ListItemIcon>
                                <EducationIcon />
                              </ListItemIcon>
                              <ListItemText primary={`Education: ${job.education}`} />
                            </ListItem>
                          )}
                          {job.salary && (
                            <ListItem>
                              <ListItemIcon>
                                <SalaryIcon />
                              </ListItemIcon>
                              <ListItemText primary={`Salary: ${job.salary}`} />
                            </ListItem>
                          )}
                        </List>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Typography variant="subtitle1" gutterBottom>
                          Match Reason:
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {job.matchReason}
                        </Typography>
                        
                        {job.skills && job.skills.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Required Skills:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {job.skills.map((skill, idx) => (
                                <Chip 
                                  key={idx} 
                                  label={skill} 
                                  size="small" 
                                  color={resume.analysis.skills.includes(skill) ? "success" : "default"}
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Grid>
                      
                      <Grid item xs={12} sm={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <ScoreCircle score={job.matchScore} />
                        <Typography variant="subtitle1" sx={{ mt: 1 }}>
                          Match Score
                        </Typography>
                        <Button 
                          variant="contained" 
                          color="primary"
                          sx={{ mt: 2 }}
                          fullWidth
                        >
                          Apply Now
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
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

export default JobMatches;
