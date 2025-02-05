import React from "react";
import { Container, Box } from "@mui/material/";
import Login from "../components/ login/login";

const Home: React.FC = () => {
  return (
    <>
      <Container maxWidth="xl" sx={{ padding: "20px" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Login />
        </Box>
      </Container>
    </>
  );
};

export default Home;
