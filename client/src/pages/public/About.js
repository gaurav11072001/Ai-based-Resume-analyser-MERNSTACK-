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
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Psychology as AIIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  SupportAgent as SupportIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const About = () => {
  const { isAuthenticated } = useAuth();

  const benefits = [
    'Increase your chances of getting past ATS filters',
    'Receive personalized suggestions to improve your resume',
    'Match with job opportunities based on your skills',
    'Save time in the job application process',
    'Get insights from advanced AI technology',
  ];

  const technologies = [
    {
      name: 'Google Gemini AI',
      description: 'Cutting-edge AI model for natural language processing and understanding',
      icon: <AIIcon fontSize="large" color="primary" />,
    },
    {
      name: 'MERN Stack',
      description: 'MongoDB, Express.js, React.js, and Node.js for a robust full-stack application',
      icon: <SpeedIcon fontSize="large" color="secondary" />,
    },
    {
      name: 'Secure Data Handling',
      description: 'Your resume data is securely stored and processed with industry-standard encryption',
      icon: <SecurityIcon fontSize="large" color="success" />,
    },
    {
      name: '24/7 Support',
      description: 'Our team is available to help you with any questions or issues',
      icon: <SupportIcon fontSize="large" color="warning" />,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          About Resume Analyzer
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Our AI-powered platform helps job seekers optimize their resumes and find the perfect job match.
        </Typography>
      </Box>

      {/* Hero Section with Main Image */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          mb: 6, 
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          height: 400,
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #2196f3 0%, #9c27b0 100%)',
          color: 'white'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6} sx={{ p: 4, zIndex: 2 }}>
            <Typography variant="h3" gutterBottom fontWeight="bold">
              AI-Powered Resume Analysis
            </Typography>
            <Typography variant="h6" paragraph>
              Our advanced AI technology analyzes your resume against industry standards and provides personalized recommendations.
            </Typography>
            <Button 
              variant="contained" 
              size="large" 
              sx={{ 
                mt: 2, 
                bgcolor: 'white', 
                color: '#2196f3',
                '&:hover': {
                  bgcolor: '#f5f5f5',
                }
              }}
              component={RouterLink}
              to={isAuthenticated ? "/dashboard/upload" : "/register"}
            >
              {isAuthenticated ? "Upload Your Resume" : "Get Started"}
            </Button>
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
            <Box 
              component="img" 
              src="/images/ai-resume.svg" 
              alt="AI Resume Analysis"
              sx={{ 
                maxWidth: '100%', 
                maxHeight: 350,
                filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.2))'
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, height: '100%', borderRadius: 2 }} elevation={3}>
            <Typography variant="h4" gutterBottom color="primary">
              Our Mission
            </Typography>
            <Typography paragraph>
              We believe that everyone deserves a fair chance at landing their dream job. Our mission is to
              level the playing field by providing job seekers with the tools they need to create
              ATS-optimized resumes that showcase their skills and experience effectively.
            </Typography>
            <Typography paragraph>
              Using cutting-edge AI technology, we analyze resumes against industry standards and provide
              personalized recommendations to help you stand out from the competition.
            </Typography>
            <Box 
              component="img" 
              src="/images/team.svg" 
              alt="Our Team"
              sx={{ 
                width: '100%', 
                mt: 2,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, height: '100%', borderRadius: 2 }} elevation={3}>
            <Typography variant="h4" gutterBottom color="primary">
              Key Benefits
            </Typography>
            <List>
              {benefits.map((benefit, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={benefit} 
                    primaryTypographyProps={{ fontWeight: index === 0 ? 'bold' : 'regular' }}
                  />
                </ListItem>
              ))}
            </List>
            <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom color="secondary">
                Did You Know?
              </Typography>
              <Typography variant="body2">
                Over 75% of resumes are rejected by ATS systems before they ever reach a human recruiter. 
                Our AI-powered analysis helps ensure your resume passes these digital gatekeepers.
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 4, mt: 4, borderRadius: 2 }} elevation={3}>
            <Typography variant="h4" gutterBottom align="center" color="primary">
              Our Technology Stack
            </Typography>
            <Divider sx={{ mb: 4 }} />
            
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box 
                component="img" 
                src="/images/technology.svg" 
                alt="Technology Stack"
                sx={{ 
                  maxWidth: '100%', 
                  maxHeight: 300,
                  mb: 4
                }}
              />
            </Box>
            
            <Grid container spacing={3}>
              {technologies.map((tech, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                      }
                    }}
                    elevation={2}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Box sx={{ mb: 2 }}>{tech.icon}</Box>
                      <Typography variant="h6" gutterBottom>
                        {tech.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tech.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 6, textAlign: 'center', p: 4, bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom color="primary">
          Ready to Optimize Your Resume?
        </Typography>
        <Typography variant="body1" paragraph sx={{ maxWidth: 700, mx: 'auto', mb: 3 }}>
          Join thousands of job seekers who have improved their resumes and found their dream jobs using our AI-powered platform.
        </Typography>
        {isAuthenticated ? (
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={RouterLink}
            to="/dashboard/upload"
            sx={{ px: 4, py: 1.5 }}
          >
            Upload Your Resume
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={RouterLink}
            to="/register"
            sx={{ px: 4, py: 1.5 }}
          >
            Get Started Today
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default About;
