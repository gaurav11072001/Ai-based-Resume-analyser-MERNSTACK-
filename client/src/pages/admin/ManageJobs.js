import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import AlertMessage from '../../components/common/AlertMessage';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobFormData, setJobFormData] = useState({
    title: '',
    company: '',
    description: '',
    requirements: '',
    skills: '',
    experience: '',
    education: '',
    location: '',
    salary: '',
  });
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/jobs');
      setJobs(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setAlert({
        open: true,
        message: 'Failed to load jobs. Please try again later.',
        severity: 'error',
      });
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleCreateClick = () => {
    setJobFormData({
      title: '',
      company: '',
      description: '',
      requirements: '',
      skills: '',
      experience: '',
      education: '',
      location: '',
      salary: '',
    });
    setCreateDialogOpen(true);
  };

  const handleEditClick = (job) => {
    setSelectedJob(job);
    setJobFormData({
      title: job.title,
      company: job.company,
      description: job.description,
      requirements: job.requirements.join('\n'),
      skills: job.skills.join(', '),
      experience: job.experience,
      education: job.education || '',
      location: job.location || '',
      salary: job.salary || '',
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (job) => {
    setSelectedJob(job);
    setDeleteDialogOpen(true);
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedJob(null);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedJob(null);
  };

  const handleFormChange = (e) => {
    setJobFormData({
      ...jobFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateSubmit = async () => {
    try {
      // Format the data
      const formattedData = {
        ...jobFormData,
        requirements: jobFormData.requirements.split('\n').filter(req => req.trim() !== ''),
        skills: jobFormData.skills.split(',').map(skill => skill.trim()).filter(skill => skill !== ''),
      };

      const res = await api.post('/api/admin/jobs', formattedData);
      
      // Add the new job to the local state
      setJobs([res.data, ...jobs]);
      
      setAlert({
        open: true,
        message: 'Job created successfully!',
        severity: 'success',
      });
      
      handleCreateDialogClose();
    } catch (err) {
      console.error('Error creating job:', err);
      setAlert({
        open: true,
        message: 'Failed to create job. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleEditSubmit = async () => {
    try {
      // Format the data
      const formattedData = {
        ...jobFormData,
        requirements: jobFormData.requirements.split('\n').filter(req => req.trim() !== ''),
        skills: jobFormData.skills.split(',').map(skill => skill.trim()).filter(skill => skill !== ''),
      };

      const res = await api.put(`/api/admin/jobs/${selectedJob._id}`, formattedData);
      
      // Update the job in the local state
      setJobs(
        jobs.map((job) =>
          job._id === selectedJob._id ? { ...job, ...res.data } : job
        )
      );
      
      setAlert({
        open: true,
        message: 'Job updated successfully!',
        severity: 'success',
      });
      
      handleEditDialogClose();
    } catch (err) {
      console.error('Error updating job:', err);
      setAlert({
        open: true,
        message: 'Failed to update job. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      await api.delete(`/api/admin/jobs/${selectedJob._id}`);
      
      // Remove the job from the local state
      setJobs(jobs.filter((job) => job._id !== selectedJob._id));
      
      setAlert({
        open: true,
        message: 'Job deleted successfully!',
        severity: 'success',
      });
      
      handleDeleteDialogClose();
    } catch (err) {
      console.error('Error deleting job:', err);
      setAlert({
        open: true,
        message: 'Failed to delete job. Please try again.',
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

  // Filter jobs based on search term
  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const paginatedJobs = filteredJobs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const renderJobFormFields = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          name="title"
          label="Job Title"
          value={jobFormData.title}
          onChange={handleFormChange}
          fullWidth
          required
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          name="company"
          label="Company"
          value={jobFormData.company}
          onChange={handleFormChange}
          fullWidth
          required
          margin="normal"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          name="description"
          label="Job Description"
          value={jobFormData.description}
          onChange={handleFormChange}
          fullWidth
          required
          multiline
          rows={4}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          name="requirements"
          label="Requirements (one per line)"
          value={jobFormData.requirements}
          onChange={handleFormChange}
          fullWidth
          required
          multiline
          rows={4}
          margin="normal"
          helperText="Enter each requirement on a new line"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          name="skills"
          label="Required Skills"
          value={jobFormData.skills}
          onChange={handleFormChange}
          fullWidth
          required
          margin="normal"
          helperText="Enter skills separated by commas (e.g., JavaScript, React, Node.js)"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          name="experience"
          label="Experience Required"
          value={jobFormData.experience}
          onChange={handleFormChange}
          fullWidth
          required
          margin="normal"
          helperText="e.g., 2+ years, Entry level, etc."
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          name="education"
          label="Education Required"
          value={jobFormData.education}
          onChange={handleFormChange}
          fullWidth
          margin="normal"
          helperText="e.g., Bachelor's degree, Master's degree, etc."
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          name="location"
          label="Location"
          value={jobFormData.location}
          onChange={handleFormChange}
          fullWidth
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          name="salary"
          label="Salary Range"
          value={jobFormData.salary}
          onChange={handleFormChange}
          fullWidth
          margin="normal"
          helperText="e.g., $80,000 - $100,000, Competitive, etc."
        />
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Manage Jobs
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Create, edit, and manage job listings for resume matching.
        </Typography>

        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={handleSearchChange}
                fullWidth
              />
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateClick}
              sx={{ ml: 2 }}
            >
              Add Job
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={fetchJobs}
              sx={{ ml: 2 }}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
        </Paper>

        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Company</TableCell>
                    <TableCell>Experience</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Skills</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedJobs.length > 0 ? (
                    paginatedJobs.map((job) => (
                      <TableRow key={job._id}>
                        <TableCell>{job.title}</TableCell>
                        <TableCell>{job.company}</TableCell>
                        <TableCell>{job.experience}</TableCell>
                        <TableCell>{job.location || 'N/A'}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {job.skills.slice(0, 3).map((skill, index) => (
                              <Chip
                                key={index}
                                label={skill}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            ))}
                            {job.skills.length > 3 && (
                              <Chip
                                label={`+${job.skills.length - 3}`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>{formatDate(job.createdAt)}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() => handleEditClick(job)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(job)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No jobs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredJobs.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </TableContainer>

        {/* Create Job Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={handleCreateDialogClose}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Create New Job</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Enter the details for the new job listing. This job will be used for matching with user resumes.
            </DialogContentText>
            <Box sx={{ mt: 2 }}>
              {renderJobFormFields()}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCreateDialogClose}>Cancel</Button>
            <Button onClick={handleCreateSubmit} color="primary" variant="contained">
              Create Job
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Job Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={handleEditDialogClose}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Edit Job</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              {renderJobFormFields()}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditDialogClose}>Cancel</Button>
            <Button onClick={handleEditSubmit} color="primary" variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Job Dialog */}
        <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
          <DialogTitle>Delete Job</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the job "{selectedJob?.title}" at {selectedJob?.company}? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteDialogClose}>Cancel</Button>
            <Button onClick={handleDeleteSubmit} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
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

export default ManageJobs;
