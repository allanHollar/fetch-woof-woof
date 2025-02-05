import React, { useState, useEffect } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";

interface SearchProps {
  onSearch: (query: string) => void;
}

const Search: React.FC<SearchProps> = ({ onSearch }) => {
  const [breeds, setBreeds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchBreeds = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://frontend-take-home-service.fetch.com/dogs/breeds",
          { credentials: "include" }
        );
        if (!response.ok) throw new Error("Failed to fetch breeds");

        const data: string[] = await response.json();
        setBreeds(data);
      } catch (error) {
        console.error("Error fetching breeds:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBreeds();
  }, []);

  return (
    <Autocomplete
      freeSolo
      options={breeds}
      loading={loading}
      onInputChange={(_event, newValue) => {
        setQuery(newValue);
      }}
      onChange={(_event, newValue) => {
        if (newValue) {
          setQuery(newValue);
          onSearch(newValue);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search Breed"
          variant="outlined"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSearch(query);
            }
          }}
          sx={{ width: "350px" }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default Search;
