import {
    Box,
    Button,
    LinearProgress,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import CardList from "../components/cardList";
import { useState } from "react";
import axios from "axios";

const Home = () => {
    const [imageNumber, setImageNumber] = useState<number>();
    const [catGallery, setCatGallery] = useState<any>([]);
    const [isError, setIsError] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        setCatGallery([]);
        setImageNumber(value);

        // Validate input (number should be between 1 and 10)
        if (value < 1 || value > 10) {
            setIsError(true);
        } else {
            setIsError(false);
        }
    };

    const handleImageNumber = async () => {
        if (imageNumber && (imageNumber >= 0 || imageNumber < 11)) {
            const res = await axios(`https://api.thecatapi.com/v1/images/search?limit=${imageNumber}&api_key=live_UMIEHUqwTGnUFY8TiJrv60nSuK36A42ddgNtFcb9YWb4lsQgXUJGvfJ4xcJfnlqA`);
            if (res) {
                setCatGallery(res.data);
            }
        }
    };

    return (
        <Stack spacing={2} padding={1} data-testid="main">
            <Typography variant="h3" component="h1">
                Cat Gallery
            </Typography>
            <Stack>
                <TextField
                    fullWidth
                    inputProps={{
                        "data-testid": "images-number-field",
                    }}
                    label="Images Number"
                    type="number"
                    helperText={"Number should be between 1 and 10"}
                    onChange={handleInputChange}
                    error={isError}
                />
                <Button
                    data-testid="random-image-btn"
                    disableElevation
                    variant="contained"
                    fullWidth
                    onClick={handleImageNumber}
                >
                    Random
                </Button>
            </Stack>
            <Box sx={{ width: "100%" }} data-testid="loading-indicator">
                <LinearProgress />
            </Box>
            {
                !isError && imageNumber ? (
                    <CardList catGallery={catGallery} />
                ) : (
                    <CardList />
                )
            }

        </Stack>
    );
};

export default Home;
