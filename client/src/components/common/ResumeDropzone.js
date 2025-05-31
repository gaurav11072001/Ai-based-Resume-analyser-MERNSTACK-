import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const ResumeDropzone = ({ onFileAccepted, isUploading }) => {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback(
    (acceptedFiles) => {
      // Only keep the most recent file
      const newFile = acceptedFiles[0];
      if (newFile) {
        setFiles([newFile]);
        onFileAccepted(newFile);
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const removeFile = () => {
    setFiles([]);
  };

  const getFileIcon = (file) => {
    if (file.type === 'application/pdf') {
      return <PdfIcon color="error" />;
    }
    return <DocIcon color="primary" />;
  };

  const getFileSize = (size) => {
    if (size < 1024) {
      return size + ' bytes';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(2) + ' KB';
    } else {
      return (size / (1024 * 1024)).toFixed(2) + ' MB';
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {files.length === 0 ? (
        <Paper
          {...getRootProps()}
          className={`resume-drop-area ${isDragActive ? 'active' : ''}`}
          sx={{
            p: 5,
            textAlign: 'center',
            cursor: 'pointer',
            borderRadius: 2,
            borderStyle: 'dashed',
            borderWidth: 2,
            borderColor: (theme) =>
              isDragActive ? theme.palette.primary.main : theme.palette.grey[400],
            bgcolor: (theme) =>
              isDragActive ? 'rgba(33, 150, 243, 0.08)' : 'background.paper',
            '&:hover': {
              borderColor: (theme) => theme.palette.primary.main,
              bgcolor: 'rgba(33, 150, 243, 0.04)',
            },
          }}
        >
          <input {...getInputProps()} />
          <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {isDragActive
              ? 'Drop your resume here...'
              : 'Drag & drop your resume here'}
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            or click to browse files
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Supported formats: PDF, DOCX (Max size: 5MB)
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <List>
            {files.map((file) => (
              <ListItem
                key={file.name}
                secondaryAction={
                  <Button
                    onClick={removeFile}
                    disabled={isUploading}
                    startIcon={<DeleteIcon />}
                    color="error"
                    variant="outlined"
                    size="small"
                  >
                    Remove
                  </Button>
                }
              >
                <ListItemIcon>{getFileIcon(file)}</ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={`${file.type} - ${getFileSize(file.size)}`}
                />
              </ListItem>
            ))}
          </List>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              disabled={isUploading}
              startIcon={
                isUploading ? <CircularProgress size={20} /> : <UploadIcon />
              }
              onClick={() => onFileAccepted(files[0])}
            >
              {isUploading ? 'Uploading...' : 'Upload Resume'}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ResumeDropzone;
