import React, { Component, ErrorInfo, ReactNode } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: "center", 
            bgcolor: "rgba(239, 68, 68, 0.05)", 
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "16px"
          }}
        >
          <ErrorIcon sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
          <Typography variant="h6" gutterBottom>Something went wrong</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            This component failed to load. Please try refreshing the page.
          </Typography>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={() => this.setState({ hasError: false })}
          >
            Try Again
          </Button>
        </Paper>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
