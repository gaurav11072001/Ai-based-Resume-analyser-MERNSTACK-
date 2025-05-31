import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Paper,
  Card,
  CardContent,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Analytics as AnalyticsIcon,
  Work as WorkIcon,
  Psychology as AIIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      title: 'AI-Powered Resume Analysis',
      description: 'Our advanced AI analyzes your resume for ATS compatibility and provides a detailed score.',
      icon: <AIIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    },
    {
      title: 'Personalized Suggestions',
      description: 'Get tailored recommendations to improve your resume and make it stand out to employers.',
      icon: <AnalyticsIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
    },
    {
      title: 'Job Role Matching',
      description: 'Find job opportunities that match your skills and experience based on your resume.',
      icon: <WorkIcon sx={{ fontSize: 40, color: 'info.main' }} />,
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: 8,
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                fontWeight="bold"
                gutterBottom
              >
                AI-Powered Resume Analyzer
              </Typography>
              <Typography variant="h5" paragraph>
                Optimize your resume with Gemini AI and land your dream job
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Button
                  component={RouterLink}
                  to={isAuthenticated ? '/upload-resume' : '/register'}
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<UploadIcon />}
                  sx={{ mr: 2, mb: { xs: 2, sm: 0 } }}
                >
                  {isAuthenticated ? 'Upload Resume' : 'Get Started'}
                </Button>
                <Button
                  component={RouterLink}
                  to="/about"
                  variant="outlined"
                  color="inherit"
                  size="large"
                >
                  Learn More
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={6}
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  transform: 'perspective(1500px) rotateY(-15deg)',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'perspective(1500px) rotateY(-5deg)',
                  },
                }}
              >
                <Box
                  component="img"
                  src="/images/hero-resume.svg"
                  alt="AI Resume Analysis"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.15))'
                  }}
                />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Key Features
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ maxWidth: 700, mx: 'auto' }}
          >
            Our AI-powered resume analyzer helps you create an optimized resume that passes through Applicant Tracking Systems and impresses hiring managers.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 8,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8, mb: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" gutterBottom>
              How It Works
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ maxWidth: 700, mx: 'auto' }}
            >
              Our simple three-step process helps you improve your resume and find the right job matches.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: 3,
                  bgcolor: 'background.default',
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    fontSize: 24,
                    fontWeight: 'bold',
                  }}
                >
                  1
                </Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  Upload Your Resume
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Upload your resume in PDF or DOCX format. Our system will securely store and process it.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: 3,
                  bgcolor: 'background.default',
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'secondary.light',
                    color: 'secondary.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    fontSize: 24,
                    fontWeight: 'bold',
                  }}
                >
                  2
                </Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  Get AI Analysis
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Our Gemini AI analyzes your resume for ATS compatibility, content quality, and provides improvement suggestions.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: 3,
                  bgcolor: 'background.default',
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'info.light',
                    color: 'info.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    fontSize: 24,
                    fontWeight: 'bold',
                  }}
                >
                  3
                </Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  Find Job Matches
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Based on your skills and experience, our system matches you with relevant job opportunities.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ mb: 8 }}>
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 4,
            backgroundImage: 'linear-gradient(135deg, #2196f3 0%, #1565c0 100%)',
            color: 'white',
          }}
        >
          <Typography variant="h4" component="h2" gutterBottom>
            Ready to Optimize Your Resume?
          </Typography>
          <Typography variant="subtitle1" paragraph>
            Join thousands of job seekers who have improved their resumes and found better job matches with our AI-powered system.
          </Typography>
          <Button
            component={RouterLink}
            to={isAuthenticated ? '/upload-resume' : '/register'}
            variant="contained"
            color="secondary"
            size="large"
            sx={{ mt: 2 }}
          >
            {isAuthenticated ? 'Upload Your Resume' : 'Get Started for Free'}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default Home;
