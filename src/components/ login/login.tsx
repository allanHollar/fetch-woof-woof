import React, { useState } from "react";
import { faDog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Stack,
  TextField,
  Typography,
  Paper,
  Button,
  Alert,
} from "@mui/material";

const Login: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!name || !email) {
      setError("Please enter both name and email.");
      return;
    }

    try {
      const response = await fetch(
        "https://frontend-take-home-service.fetch.com/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email }),
          credentials: "include",
        }
      );

      if (response.ok) {
        console.log("Login successful");
        navigate("/search");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setError("Something went wrong. Please try again later.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Paper elevation={3} sx={{ width: 400, padding: 4, borderRadius: 2 }}>
        <form onSubmit={handleLogin} style={{ width: "100%" }}>
          <Stack spacing={2} sx={{ width: "100%" }}>
            <Typography variant="h6" textAlign="center">
              <FontAwesomeIcon icon={faDog} size="2x" />
              Please log in
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Name"
              type="text"
              variant="outlined"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              helperText={!name ? "Enter your name." : ""}
            />

            <TextField
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              helperText={!email ? "Enter a valid email." : ""}
            />

            <Button type="submit" variant="contained" color="primary" fullWidth>
              Login
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
