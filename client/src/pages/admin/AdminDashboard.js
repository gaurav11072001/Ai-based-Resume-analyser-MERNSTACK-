import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import api from '../../utils/axios';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  PeopleAlt as UsersIcon,
  Description as ResumeIcon,
  Work as JobIcon,
  BarChart as ChartIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import AlertMessage from '../../components/common/AlertMessage';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/api/admin/dashboard');
        setDashboardData(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setAlert({
          open: true,
          message: 'Failed to load dashboard data. Please try again later.',
          severity: 'error',
        });
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Prepare chart data
  const prepareSkillsChartData = () => {
    if (!dashboardData || !dashboardData.analytics.topSkills) {
      return {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
          },
        ],
      };
    }

    const colors = [
      '#2196f3',
      '#f44336',
      '#4caf50',
      '#ff9800',
      '#9c27b0',
      '#00bcd4',
      '#ffeb3b',
      '#795548',
      '#607d8b',
      '#e91e63',
    ];

    return {
      labels: dashboardData.analytics.topSkills.map((item) => item.skill),
      datasets: [
        {
          data: dashboardData.analytics.topSkills.map((item) => item.count),
          backgroundColor: colors.slice(0, dashboardData.analytics.topSkills.length),
          borderWidth: 1,
        },
      ],
    };
  };

  const prepareUserActivityData = () => {
    // This is a placeholder - in a real application, you would have user activity data
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'New Users',
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: 'rgba(33, 150, 243, 0.8)',
        },
        {
          label: 'Resume Uploads',
          data: [8, 15, 7, 12, 9, 14],
          backgroundColor: 'rgba(76, 175, 80, 0.8)',
        },
      ],
    };
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Monitor and manage the Resume Analyzer platform.
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <UsersIcon />
                  </Avatar>
                  <Typography variant="h6" component="div">
                    Users
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" align="center" sx={{ my: 2 }}>
                  {dashboardData?.counts.users || 0}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  component={RouterLink}
                  to="/admin/users"
                  size="small"
                  fullWidth
                >
                  View All Users
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                    <ResumeIcon />
                  </Avatar>
                  <Typography variant="h6" component="div">
                    Resumes
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" align="center" sx={{ my: 2 }}>
                  {dashboardData?.counts.resumes || 0}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  component={RouterLink}
                  to="/admin/users"
                  size="small"
                  fullWidth
                >
                  View All Resumes
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                    <JobIcon />
                  </Avatar>
                  <Typography variant="h6" component="div">
                    Jobs
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" align="center" sx={{ my: 2 }}>
                  {dashboardData?.counts.jobs || 0}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  component={RouterLink}
                  to="/admin/jobs"
                  size="small"
                  fullWidth
                >
                  Manage Jobs
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <ChartIcon />
                  </Avatar>
                  <Typography variant="h6" component="div">
                    Avg. ATS Score
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" align="center" sx={{ my: 2 }}>
                  {Math.round(dashboardData?.analytics.averageATSScore || 0)}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  component={RouterLink}
                  to="/admin/training"
                  size="small"
                  fullWidth
                >
                  Training Data
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Top Skills
              </Typography>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {dashboardData?.analytics.topSkills && dashboardData.analytics.topSkills.length > 0 ? (
                  <Pie data={prepareSkillsChartData()} options={{ maintainAspectRatio: false }} />
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No skill data available
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                User Activity
              </Typography>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Bar
                  data={prepareUserActivityData()}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Users
              </Typography>
              <List>
                {dashboardData?.recent.users && dashboardData.recent.users.length > 0 ? (
                  dashboardData.recent.users.map((user) => (
                    <React.Fragment key={user._id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={user.name}
                          secondary={
                            <>
                              {user.email}
                              <br />
                              Joined: {formatDate(user.createdAt)}
                            </>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))
                ) : (
                  <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 2 }}>
                    No recent users
                  </Typography>
                )}
              </List>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button
                  component={RouterLink}
                  to="/admin/users"
                  variant="outlined"
                  color="primary"
                >
                  View All Users
                </Button>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Resumes
              </Typography>
              <List>
                {dashboardData?.recent.resumes && dashboardData.recent.resumes.length > 0 ? (
                  dashboardData.recent.resumes.map((resume) => (
                    <React.Fragment key={resume._id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar>
                            <ResumeIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={resume.fileName}
                          secondary={
                            <>
                              By: {resume.user?.name || 'Unknown User'}
                              <br />
                              Uploaded: {formatDate(resume.createdAt)}
                              <br />
                              ATS Score: {resume.analysis?.atsScore || 'Not analyzed'}
                            </>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))
                ) : (
                  <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 2 }}>
                    No recent resumes
                  </Typography>
                )}
              </List>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button
                  component={RouterLink}
                  to="/admin/users"
                  variant="outlined"
                  color="primary"
                >
                  View All Resumes
                </Button>
              </Box>
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

export default AdminDashboard;
