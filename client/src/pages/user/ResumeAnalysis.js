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
  Divider,
  Button,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Psychology as SkillIcon,
  Description as ResumeIcon,
} from '@mui/icons-material';
import ScoreCircle from '../../components/common/ScoreCircle';
import AlertMessage from '../../components/common/AlertMessage';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`resume-tabpanel-${index}`}
      aria-labelledby={`resume-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ResumeAnalysis = () => {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await api.get(`/api/resumes/${id}`);
        setResume(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching resume:', err);
        setAlert({
          open: true,
          message: 'Failed to load resume analysis. Please try again later.',
          severity: 'error',
        });
        setLoading(false);
      }
    };

    fetchResume();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      await api.post(`/api/resumes/${id}/analyze`);
      const res = await api.get(`/api/resumes/${id}`);
      setResume(res.data);
      setAlert({
        open: true,
        message: 'Resume analyzed successfully!',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error analyzing resume:', err);
      setAlert({
        open: true,
        message: 'Failed to analyze resume. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getSuggestionIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <ErrorIcon color="error" />;
      case 'medium':
        return <WarningIcon color="warning" />;
      case 'low':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };

  const getCategoryChip = (category) => {
    let color;
    switch (category) {
      case 'format':
        color = 'primary';
        break;
      case 'content':
        color = 'secondary';
        break;
      case 'keywords':
        color = 'info';
        break;
      case 'grammar':
        color = 'warning';
        break;
      default:
        color = 'default';
    }
    return <Chip label={category} color={color} size="small" />;
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

  const hasAnalysis = resume.analysis && resume.analysis.atsScore !== undefined;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Resume Analysis
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          View your resume analysis results, ATS compatibility score, and improvement suggestions.
        </Typography>

        <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <Typography variant="h6" gutterBottom>
                {resume.fileName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Uploaded on {formatDate(resume.createdAt)}
              </Typography>
              {resume.updatedAt !== resume.createdAt && (
                <Typography variant="body2" color="text.secondary">
                  Last analyzed on {formatDate(resume.updatedAt)}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
              {!hasAnalysis ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAnalyze}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Analyze Resume'}
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleAnalyze}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Re-analyze'}
                </Button>
              )}
            </Grid>
          </Grid>
        </Paper>

        {hasAnalysis ? (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="resume analysis tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="ATS Score & Suggestions" icon={<CheckIcon />} iconPosition="start" />
                <Tab label="Skills" icon={<SkillIcon />} iconPosition="start" />
                <Tab label="Experience" icon={<WorkIcon />} iconPosition="start" />
                <Tab label="Education" icon={<SchoolIcon />} iconPosition="start" />
                <Tab label="Job Matches" icon={<WorkIcon />} iconPosition="start" />
              </Tabs>
            </Box>

            {/* ATS Score & Suggestions Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      ATS Compatibility Score
                    </Typography>
                    <Box sx={{ my: 3, display: 'flex', justifyContent: 'center' }}>
                      <ScoreCircle score={resume.analysis.atsScore} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {resume.analysis.atsScore >= 80
                        ? 'Excellent! Your resume is highly ATS-compatible.'
                        : resume.analysis.atsScore >= 60
                        ? 'Good job! Your resume is moderately ATS-compatible, but there\'s room for improvement.'
                        : 'Your resume needs improvement to be more ATS-compatible.'}
                    </Typography>
                    <Button
                      component={RouterLink}
                      to={`/resume/${id}/job-matches`}
                      variant="outlined"
                      color="primary"
                      fullWidth
                    >
                      View Job Matches
                    </Button>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Improvement Suggestions
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Based on our AI analysis, here are suggestions to improve your resume:
                    </Typography>

                    {resume.analysis.suggestions && resume.analysis.suggestions.length > 0 ? (
                      resume.analysis.suggestions.map((suggestion, index) => {
                        // Skip displaying error messages as regular suggestions
                        if (suggestion.category === 'other' && 
                            suggestion.text.includes('error occurred during analysis')) {
                          return (
                            <Card key={index} sx={{ mb: 2, bgcolor: '#fff8f8', borderLeft: '4px solid #d32f2f' }}>
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box sx={{ mr: 2 }}>
                                    <ErrorIcon color="error" />
                                  </Box>
                                  <Box>
                                    <Typography variant="subtitle1" color="error" gutterBottom>
                                      Analysis Error
                                    </Typography>
                                    <Typography variant="body2">
                                      We encountered an issue while analyzing your resume. Please try again later or upload a different file.
                                    </Typography>
                                    <Button 
                                      variant="outlined" 
                                      color="primary" 
                                      size="small" 
                                      sx={{ mt: 2 }}
                                      component={RouterLink}
                                      to="/dashboard/upload"
                                    >
                                      Upload New Resume
                                    </Button>
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          );
                        }
                        
                        // Regular suggestion display
                        return (
                          <Card
                            key={index}
                            className={`suggestion-card ${suggestion.priority}`}
                            sx={{ mb: 2 }}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                <Box sx={{ mr: 2, mt: 0.5 }}>
                                  {getSuggestionIcon(suggestion.priority)}
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    {getCategoryChip(suggestion.category)}
                                    <Chip
                                      label={suggestion.priority}
                                      color={
                                        suggestion.priority === 'high'
                                          ? 'error'
                                          : suggestion.priority === 'medium'
                                          ? 'warning'
                                          : 'success'
                                      }
                                      size="small"
                                    />
                                  </Box>
                                  <Typography variant="body2">{suggestion.text}</Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        );
                      })
                    ) : (
                      <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                        No suggestions available. Your resume looks great!
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Skills Tab */}
            <TabPanel value={tabValue} index={1}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Skills Identified
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Our AI has identified the following skills in your resume:
                </Typography>

                {resume.analysis.skills && resume.analysis.skills.length > 0 ? (
                  <Box sx={{ mt: 2 }}>
                    {resume.analysis.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        color="primary"
                        variant="outlined"
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                    No skills were identified. Consider adding more specific skills to your resume.
                  </Typography>
                )}
              </Paper>
            </TabPanel>

            {/* Experience Tab */}
            <TabPanel value={tabValue} index={2}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Work Experience
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Our AI has identified the following work experience in your resume:
                </Typography>

                {resume.analysis.experience && resume.analysis.experience.length > 0 ? (
                  <List>
                    {resume.analysis.experience.map((exp, index) => (
                      <React.Fragment key={index}>
                        <ListItem alignItems="flex-start">
                          <ListItemIcon>
                            <WorkIcon />
                          </ListItemIcon>
                          <ListItemText primary={exp} />
                        </ListItem>
                        {index < resume.analysis.experience.length - 1 && <Divider component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                    No work experience was identified. Consider adding more details about your work history.
                  </Typography>
                )}
              </Paper>
            </TabPanel>

            {/* Education Tab */}
            <TabPanel value={tabValue} index={3}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Education
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Our AI has identified the following education details in your resume:
                </Typography>

                {resume.analysis.education && resume.analysis.education.length > 0 ? (
                  <List>
                    {resume.analysis.education.map((edu, index) => (
                      <React.Fragment key={index}>
                        <ListItem alignItems="flex-start">
                          <ListItemIcon>
                            <SchoolIcon />
                          </ListItemIcon>
                          <ListItemText primary={edu} />
                        </ListItem>
                        {index < resume.analysis.education.length - 1 && <Divider component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                    No education details were identified. Consider adding more information about your educational background.
                  </Typography>
                )}
              </Paper>
            </TabPanel>

            {/* Job Matches Tab */}
            <TabPanel value={tabValue} index={4}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Job Matches
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Based on your resume, our AI has identified the following job matches:
                </Typography>

                {resume.analysis.matchedJobs && resume.analysis.matchedJobs.length > 0 ? (
                  resume.analysis.matchedJobs.map((job, index) => (
                    <Card key={index} className="job-match-card" sx={{ mb: 2 }}>
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={8}>
                            <Typography variant="h6">{job.jobTitle}</Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                              {job.matchReason}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ScoreCircle score={job.matchScore} />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      No job matches found yet.
                    </Typography>
                    <Button
                      component={RouterLink}
                      to={`/resume/${id}/job-matches`}
                      variant="contained"
                      color="primary"
                    >
                      Find Job Matches
                    </Button>
                  </Box>
                )}
              </Paper>
            </TabPanel>
          </>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <ResumeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Resume Not Analyzed Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Your resume has been uploaded but not yet analyzed. Click the button below to analyze it with our AI-powered system.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAnalyze}
              disabled={loading}
              size="large"
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Analyze Resume'}
            </Button>
          </Paper>
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

export default ResumeAnalysis;
