import React from 'react';
import { Box, Container, Typography, Link, Grid, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} justifyContent="space-between">
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Resume Analyzer with Gemini
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI-powered resume analysis tool that helps you improve your resume and find the right job matches.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Link component={RouterLink} to="/" color="inherit" display="block">
              Home
            </Link>
            <Link component={RouterLink} to="/about" color="inherit" display="block">
              About
            </Link>
            <Link component={RouterLink} to="/upload-resume" color="inherit" display="block">
              Upload Resume
            </Link>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Resources
            </Typography>
            <Link href="https://ai.google.dev/docs/gemini_api_overview" target="_blank" rel="noopener" color="inherit" display="block">
              Gemini AI Documentation
            </Link>
            <Link href="https://www.mongodb.com/docs/" target="_blank" rel="noopener" color="inherit" display="block">
              MongoDB Documentation
            </Link>
            <Link href="https://reactjs.org/docs/getting-started.html" target="_blank" rel="noopener" color="inherit" display="block">
              React Documentation
            </Link>
          </Grid>
        </Grid>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          {'Copyright © '}
          <Link component={RouterLink} to="/" color="inherit">
            Resume Analyzer with Gemini
          </Link>{' '}
          {currentYear}
          {'.'}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
