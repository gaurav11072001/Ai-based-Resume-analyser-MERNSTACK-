import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  BusinessCenter as BusinessIcon,
  AttachMoney as SalaryIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';

// Initial job data (will be replaced with AI recommendations)
let initialJobs = [
  {
    id: 1,
    title: 'Senior Full Stack Developer',
    company: 'TechCorp Solutions',
    location: 'San Francisco, CA',
    salary: '$120,000 - $160,000',
    type: 'Full-time',
    experience: '5+ years',
    description: 'We are seeking an experienced Full Stack Developer proficient in React, Node.js, and MongoDB...',
    skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'AWS'],
    postedDate: '2 days ago',
  },
  {
    id: 2,
    title: 'Data Scientist',
    company: 'AI Innovations Ltd',
    location: 'New York, NY',
    salary: '$100,000 - $140,000',
    type: 'Full-time',
    experience: '3+ years',
    description: 'Looking for a Data Scientist with strong machine learning and statistical analysis skills...',
    skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'PyTorch'],
    postedDate: '1 day ago',
  },
  {
    id: 3,
    title: 'UX/UI Designer',
    company: 'Creative Designs Inc',
    location: 'Los Angeles, CA',
    salary: '$90,000 - $120,000',
    type: 'Full-time',
    experience: '4+ years',
    description: 'Join our creative team as a UX/UI Designer to create beautiful and intuitive user interfaces...',
    skills: ['Figma', 'Adobe XD', 'Sketch', 'HTML/CSS', 'Prototyping'],
    postedDate: '3 days ago',
  },
  {
    id: 4,
    title: 'DevOps Engineer',
    company: 'Cloud Systems Corp',
    location: 'Seattle, WA',
    salary: '$110,000 - $150,000',
    type: 'Full-time',
    experience: '4+ years',
    description: 'Seeking a DevOps Engineer to manage our cloud infrastructure and CI/CD pipelines...',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform'],
    postedDate: '5 days ago',
  },
  {
    id: 5,
    title: 'Mobile App Developer',
    company: 'AppTech Solutions',
    location: 'Austin, TX',
    salary: '$95,000 - $130,000',
    type: 'Full-time',
    experience: '3+ years',
    description: 'Looking for a Mobile App Developer with experience in React Native and iOS/Android development...',
    skills: ['React Native', 'iOS', 'Android', 'JavaScript', 'Mobile UI'],
    postedDate: '1 week ago',
  },
  {
    id: 6,
    title: 'Product Manager',
    company: 'Product Innovations',
    location: 'Boston, MA',
    salary: '$115,000 - $155,000',
    type: 'Full-time',
    experience: '5+ years',
    description: 'Join our team as a Product Manager to lead product strategy and development...',
    skills: ['Product Strategy', 'Agile', 'User Research', 'Analytics', 'Roadmapping'],
    postedDate: '4 days ago',
  },
];

const Jobs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [page, setPage] = useState(1);
  const [jobs, setJobs] = useState(initialJobs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const jobsPerPage = 4;

  // Fetch job recommendations when component mounts
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the latest analyzed resume ID from localStorage
        const latestResumeId = localStorage.getItem('latestResumeId');

        if (!latestResumeId) {
          setJobs(initialJobs);
          return;
        }

        const response = await fetch(`/api/resumes/${latestResumeId}/jobs`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch job recommendations');
        }

        const data = await response.json();
        setJobs(data);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to fetch job recommendations. Using sample jobs instead.');
        setJobs(initialJobs);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter jobs based on search term and filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !locationFilter || job.location.includes(locationFilter);
    const matchesExperience = !experienceFilter || job.experience === experienceFilter;
    
    return matchesSearch && matchesLocation && matchesExperience;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const currentJobs = filteredJobs.slice(
    (page - 1) * jobsPerPage,
    page * jobsPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Find Your Dream Job
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Browse through hundreds of job opportunities matched to your skills
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 4 }} elevation={2}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search jobs by title, company, or keywords"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Location</InputLabel>
              <Select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                label="Location"
              >
                <MenuItem value="">All Locations</MenuItem>
                <MenuItem value="San Francisco">San Francisco</MenuItem>
                <MenuItem value="New York">New York</MenuItem>
                <MenuItem value="Los Angeles">Los Angeles</MenuItem>
                <MenuItem value="Seattle">Seattle</MenuItem>
                <MenuItem value="Austin">Austin</MenuItem>
                <MenuItem value="Boston">Boston</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Experience</InputLabel>
              <Select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                label="Experience"
              >
                <MenuItem value="">All Experience</MenuItem>
                <MenuItem value="3+ years">3+ years</MenuItem>
                <MenuItem value="4+ years">4+ years</MenuItem>
                <MenuItem value="5+ years">5+ years</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Job Listings */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Loading job recommendations...</Typography>
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
      <Grid container spacing={3}>
        {currentJobs.map((job) => (
          <Grid item xs={12} key={job.id}>
            <Card 
              elevation={2}
              sx={{
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                  transition: 'all 0.3s ease',
                },
              }}
            >
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="h5" component="h2" gutterBottom>
                      {job.title}
                    </Typography>
                    <Typography 
                      variant="subtitle1" 
                      color="primary"
                      sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                    >
                      <BusinessIcon sx={{ mr: 1 }} />
                      {job.company}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                    >
                      <LocationIcon sx={{ mr: 1 }} fontSize="small" />
                      {job.location}
                    </Typography>
                    <Typography 
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                    >
                      <SalaryIcon sx={{ mr: 1 }} fontSize="small" />
                      {job.salary}
                    </Typography>
                    <Typography 
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
                    >
                      <WorkIcon sx={{ mr: 1 }} fontSize="small" />
                      {job.type} • {job.experience}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {job.description}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {job.skills.map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mb: 2 }}>
                      <TimerIcon sx={{ mr: 1 }} fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Posted {job.postedDate}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button variant="outlined" color="primary" sx={{ mr: 1 }}>
                        Save Job
                      </Button>
                      <Button variant="contained" color="primary">
                        Apply Now
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Container>
  );
};

export default Jobs;
