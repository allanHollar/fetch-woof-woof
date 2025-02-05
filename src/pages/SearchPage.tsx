import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Link,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Pagination,
  CircularProgress,
  IconButton,
  Fade,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Search from "../components/search/search";

interface Dog {
  id: string;
  img: string;
  name: string;
  age: number;
  zip_code: string;
  breed: string;
}

const RESULTS_PER_PAGE = 25;

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [zipCodeFilter, setZipCodeFilter] = useState("");
  const [matchedDog, setMatchedDog] = useState<Dog | null>(null);
  const [matchMessageOpen, setMatchMessageOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(
        "https://frontend-take-home-service.fetch.com/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Logout failed");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const fetchDogDetails = async (ids: string[], total: number) => {
    try {
      const response = await fetch(
        "https://frontend-take-home-service.fetch.com/dogs",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ids),
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error();

      const dogDetails: Dog[] = await response.json();
      setDogs(dogDetails);
      setTotalResults(total);
    } catch {
      setError("Failed to load dog details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const findBestMatch = async () => {
    if (favorites.size === 0) {
      alert("Please select at least one favorite dog to find a match!");
      return;
    }

    try {
      const response = await fetch(
        "https://frontend-take-home-service.fetch.com/dogs/match",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Array.from(favorites)),
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error();

      const matchData = await response.json();
      fetchMatchedDogDetails(matchData.match);
    } catch {
      alert("Failed to find match. Please try again.");
    }
  };

  const fetchMatchedDogDetails = async (dogId: string) => {
    try {
      const response = await fetch(
        "https://frontend-take-home-service.fetch.com/dogs",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify([dogId]),
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error();

      const [dog] = await response.json();
      setMatchedDog(dog);
      setMatchMessageOpen(true);
    } catch {
      alert("Failed to load match details. Please try again.");
    }
  };

  const handleZipCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setZipCodeFilter(event.target.value);
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const updatedFavorites = new Set(prev);
      updatedFavorites.has(id)
        ? updatedFavorites.delete(id)
        : updatedFavorites.add(id);
      return updatedFavorites;
    });
  };

  useEffect(() => {
    if (!searchQuery) {
      setDogs([]);
      setTotalResults(0);
      return;
    }

    const fetchDogs = async () => {
      setLoading(true);
      setError(null);

      try {
        const from = (currentPage - 1) * RESULTS_PER_PAGE;
        const zipFilterQuery = zipCodeFilter
          ? `&zipCodes=${zipCodeFilter}`
          : "";
        const response = await fetch(
          `https://frontend-take-home-service.fetch.com/dogs/search?breeds=${encodeURIComponent(
            searchQuery
          )}&size=${RESULTS_PER_PAGE}&from=${from}${zipFilterQuery}&sort=breed:asc`,
          { credentials: "include" }
        );

        if (!response.ok) throw new Error();

        const data = await response.json();
        if (data.resultIds.length === 0) {
          setDogs([]);
          setTotalResults(0);
          setLoading(false);
          return;
        }

        fetchDogDetails(data.resultIds, data.total);
      } catch {
        setError("Failed to load dogs. Please try again.");
      }
    };

    fetchDogs();
  }, [searchQuery, currentPage, zipCodeFilter]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: 1,
        minHeight: "100vh",
        padding: 2,
      }}
    >
      {/* Left Column */}
      <Paper
        sx={{
          flex: 1,
          padding: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography sx={{ fontSize: "15px" }}>Filter by ZIP Code</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            label="Enter ZIP Code"
            variant="outlined"
            fullWidth
            value={zipCodeFilter}
            onChange={handleZipCodeChange}
          />
        </Box>
      </Paper>

      {/* Right Column */}
      <Paper
        sx={{
          flex: 3,
          padding: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Link
            component="button"
            onClick={handleLogout}
            sx={{ cursor: "pointer", fontSize: "14px" }}
          >
            Log Out
          </Link>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Search onSearch={setSearchQuery} />
          <Button
            variant="contained"
            color="secondary"
            onClick={findBestMatch}
            sx={{ fontWeight: "bold" }}
          >
            Match Me!
            <Favorite sx={{ color: "#FFFFFF", fontSize: "14px", ml: "5px" }} />
          </Button>
        </Box>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <CircularProgress />
          </Box>
        )}
        {error && <Typography color="error">{error}</Typography>}

        <List>
          {dogs.map((dog) => (
            <Fade in key={dog.id} timeout={500}>
              <ListItem sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  src={dog.img}
                  alt={dog.name}
                  sx={{ width: 60, height: 60, marginRight: 2 }}
                />
                <ListItemText
                  primary={dog.name}
                  secondary={`Breed: ${dog.breed} | Age: ${dog.age} | ZIP: ${dog.zip_code}`}
                />
                <IconButton
                  onClick={() => toggleFavorite(dog.id)}
                  color="primary"
                >
                  {favorites.has(dog.id) ? (
                    <Favorite color="error" />
                  ) : (
                    <FavoriteBorder />
                  )}
                </IconButton>
              </ListItem>
            </Fade>
          ))}
        </List>

        {totalResults > RESULTS_PER_PAGE && (
          <Pagination
            count={Math.ceil(totalResults / RESULTS_PER_PAGE)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            sx={{ mt: 2, display: "flex", justifyContent: "center" }}
          />
        )}

        <Dialog
          open={matchMessageOpen}
          onClose={() => setMatchMessageOpen(false)}
        >
          <DialogTitle>Your Best Match!</DialogTitle>
          <DialogContent>
            {matchedDog && (
              <ListItem sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  src={matchedDog.img}
                  alt={matchedDog.name}
                  sx={{ width: 140, height: 140, marginRight: 2 }}
                />
                <ListItemText
                  primary={matchedDog.name}
                  secondary={`Breed: ${matchedDog.breed} | Age: ${matchedDog.age} | ZIP: ${matchedDog.zip_code}`}
                />
              </ListItem>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMatchMessageOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default SearchPage;
