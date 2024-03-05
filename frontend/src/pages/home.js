import * as React from "react";
import { useState, useEffect } from "react";
import {
  Grid as KendoGrid,
  GridColumn as Column,
  GridCell as Cell,
} from "@progress/kendo-react-grid";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { filterBy } from "@progress/kendo-data-query";
import "@progress/kendo-theme-default/dist/all.css";
import styles from "./styles/homepage.module.css";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const HomePage = () => {
  const router = useRouter();
  const initialFilter = {
    logic: "and",
    filters: [
      {
        field: "id",
        operator: "contains",
        value: "",
      },
    ],
  };

  const [movies, setMovies] = useState([]);
  const [filter, setFilter] = React.useState(initialFilter);

  // Modal de usuários
  const [userModalOpen, setUserModalOpen] = React.useState(false);
  const userModalClose = () => {
    setUserModalOpen(false);
  };

  // Campos usuários
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  // Modal de filmes
  const [movieModalOpen, setMovieModalOpen] = React.useState(false);
  const movieModalClose = () => {
    setMovieModalOpen(false);
  };

  // Campos filmes
  const [title, setTitle] = useState("");
  const [director, setDirector] = useState("");
  const [score, setScore] = useState("");
  const [movieIndex, setMovieIndex] = useState(0);
  const [movieId, setMovieId] = useState(0);
  const [movieFile, setMovieFile] = useState(null);
  const [scoreFile, setScoreFile] = useState(null);

  // Modal de Avaliação
  const [scoreModalOpen, setScoreModalOpen] = React.useState(false);
  const scoreModalClose = () => {
    setScoreModalOpen(false);
  };

  // Modal de importação de filmes
  const [importMovieModalOpen, setImportMovieModalOpen] = React.useState(false);
  const importMovieModalClose = () => {
    setImportMovieModalOpen(false);
  };

  // Modal de importação de Avaliações
  const [importScoreModalOpen, setImportScoreModalOpen] = React.useState(false);
  const importScoreModalClose = () => {
    setImportScoreModalOpen(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("currentUser");
        const response = await axios.get(process.env.API_URL + "/movies", {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        const result = response.data;
        setMovies(result);
        if (response.data.error == "Token expired") {
          Cookies.set("currentUser", "");
          router.push("/login");
        }
      } catch (error) {
        Cookies.set("currentUser", "");
        router.push("/login");
        console.error("Error on fetching movies:", error);
      }
    };

    fetchData();
  }, []);

  // Ação de Logout
  const handleLogout = async () => {
    const token = Cookies.get("currentUser");
    try {
      const response = await axios.post(
        process.env.API_URL + "/logout",
        {},
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.msg) {
        Cookies.set("currentUser", "");
        router.push("/login");
      }
    } catch (error) {
      console.error("Error on signing out:", error);
    }
  };

  // Cria novo usuário
  const submitNewUser = async () => {
    const token = Cookies.get("currentUser");
    let jsonForm = {
      user: {
        username: username,
        email: email,
        password: password,
        password_confirmation: passwordConfirmation,
      },
    };

    try {
      const response = await axios.post(
        process.env.API_URL + "/users",
        jsonForm,
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data) {
        setUserModalOpen(false);
        setUsername("");
        setEmail("");
        setPassword("");
        setPasswordConfirmation("");

        toast.success("User created successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error on submiting new user:", error);
    }
  };

  // Cria novo filme
  const submitNewMovie = async () => {
    const token = Cookies.get("currentUser");
    let jsonForm = {
      movie: {
        title: title,
        director: director,
      },
    };

    try {
      const response = await axios.post(
        process.env.API_URL + "/movies",
        jsonForm,
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data) {
        const result = response.data;
        let aux = movies;
        aux.push(result);
        setMovies(aux);

        setMovieModalOpen(false);
        setTitle("");
        setDirector("");

        toast.success("Movie created successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error on submiting new movie:", error);
    }
  };

  // Atualiza avaliação do filme
  const updateMovieScore = async () => {
    const token = Cookies.get("currentUser");
    const data = new FormData();
    data.append("movie_id", movieId);
    data.append("score", score);

    try {
      const response = await axios.post(
        process.env.API_URL + "/user_movies",
        data,
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data) {
        const result = response.data;
        let aux = movies;
        aux[movieIndex].average_score = result.score;
        setMovies(aux);

        setScoreModalOpen(false);
        setScore(0);

        toast.success("Score updated successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error on updating score:", error);
    }
  };

  // Importa arquivo CSV de filmes
  const importMovies = async () => {
    const token = Cookies.get("currentUser");
    const data = new FormData();
    data.append("csv_file", movieFile);

    try {
      const response = await axios.post(
        process.env.API_URL + "/csv/import_movies",
        data,
        {
          headers: {
            Authorization: "Bearer " + token,
            Accept: "application/json",
          },
        }
      );

      if (response.data) {
        toast.success("File will be processed in background!", {
          position: "top-right",
          autoClose: 3000,
        });
        setImportMovieModalOpen(false);
      }
    } catch (error) {
      console.error("Error on submiting csv file:", error);
    }
  };

  // Importa arquivo CSV de Avaliações
  const importScores = async () => {
    const token = Cookies.get("currentUser");
    const data = new FormData();
    data.append("csv_file", scoreFile);

    try {
      const response = await axios.post(
        process.env.API_URL + "/csv/import_scores",
        data,
        {
          headers: {
            Authorization: "Bearer " + token,
            Accept: "application/json",
          },
        }
      );

      if (response.data) {
        toast.success("File will be processed in background!", {
          position: "top-right",
          autoClose: 3000,
        });
        setImportScoreModalOpen(false);
      }
    } catch (error) {
      console.error("Error on submiting csv file:", error);
    }
  };

  return (
    <div>
      <ToastContainer />
      <Modal
        open={userModalOpen}
        onClose={userModalClose}
        aria-labelledby="create-user"
        aria-describedby="create-user"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            New User
          </Typography>
          <form>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              label="E-mail"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              margin="normal"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              label="Password Confirmation"
              variant="outlined"
              fullWidth
              margin="normal"
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
            />
          </form>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button variant="contained" onClick={submitNewUser}>
              Submit
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={movieModalOpen}
        onClose={movieModalClose}
        aria-labelledby="create-user"
        aria-describedby="create-user"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            New Movie
          </Typography>
          <form>
            <TextField
              label="Title"
              variant="outlined"
              fullWidth
              margin="normal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              label="Director"
              variant="outlined"
              fullWidth
              margin="normal"
              value={director}
              onChange={(e) => setDirector(e.target.value)}
            />
          </form>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button variant="contained" onClick={submitNewMovie}>
              Submit
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={scoreModalOpen}
        onClose={scoreModalClose}
        aria-labelledby="create-user"
        aria-describedby="create-user"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Update Movie Score
          </Typography>
          <form>
            <TextField
              label="Score"
              variant="outlined"
              fullWidth
              margin="normal"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              type="number"
            />
          </form>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button variant="contained" onClick={updateMovieScore}>
              Submit
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={importMovieModalOpen}
        onClose={importMovieModalClose}
        aria-labelledby="create-user"
        aria-describedby="create-user"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Import Movies
          </Typography>
          <form>
            <input
              type="file"
              onChange={(e) => setMovieFile(e.target.files[0])}
            />
          </form>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button variant="contained" onClick={importMovies}>
              Submit
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={importScoreModalOpen}
        onClose={importScoreModalClose}
        aria-labelledby="create-user"
        aria-describedby="create-user"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Import Scores
          </Typography>
          <form>
            <input
              type="file"
              onChange={(e) => setScoreFile(e.target.files[0])}
            />
          </form>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button variant="contained" onClick={importScores}>
              Submit
            </Button>
          </Box>
        </Box>
      </Modal>

      <Box sx={{ flexGrow: 1 }}>
        <Grid container="true" spacing={2}>
          <Grid item xs={8} md={10} xl={11}></Grid>
          <Grid item xs={4} md={2} xl={1}>
            <Button
              variant="contained"
              color="error"
              className={styles.logoutButton}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Grid>

          <Grid item xs={6} md={3}>
            <Button
              variant="contained"
              className={styles.createUserButton}
              onClick={() => {
                setUserModalOpen(true);
              }}
            >
              Create User
            </Button>
          </Grid>

          <Grid item xs={6} md={3}>
            <Button
              variant="contained"
              className={styles.createMovieButton}
              onClick={() => {
                setMovieModalOpen(true);
              }}
            >
              Create Movie
            </Button>
          </Grid>
          <Grid item xs={6} md={3}>
            <Button
              variant="contained"
              className={styles.importMovieButton}
              onClick={() => {
                setImportMovieModalOpen(true);
              }}
            >
              Import Movies
            </Button>
          </Grid>
          <Grid item xs={6} md={3}>
            <Button
              variant="contained"
              className={styles.importScoresButton}
              onClick={() => {
                setImportScoreModalOpen(true);
              }}
            >
              Import Scores
            </Button>
          </Grid>
        </Grid>
        <Box className={styles.kendoGrid}>
          <KendoGrid
            data={filterBy(movies, filter)}
            filterable={true}
            filter={filter}
            onFilterChange={(e) => setFilter(e.filter)}
          >
            <Column
              field="id"
              title="ID"
              minResizableWidth={50}
              resizable={true}
            />
            <Column
              field="title"
              title="Title"
              minResizableWidth={50}
              resizable={true}
            />
            <Column
              field="director"
              title="Director"
              minResizableWidth={50}
              resizable={true}
            />
            <Column
              field="average_score"
              title="Average Score"
              minResizableWidth={50}
              resizable={true}
            />
            <Column
              title="Actions"
              minResizableWidth={100}
              resizable={true}
              cell={(props) => (
                <Button
                  variant="contained"
                  className={styles.updateScoreButton}
                  onClick={() => {
                    setScoreModalOpen(true);
                    setScore(props.dataItem.score);
                    setMovieId(props.dataItem.id);
                    setMovieIndex(props.dataIndex);
                  }}
                >
                  Update Score
                </Button>
              )}
            />
          </KendoGrid>
        </Box>
      </Box>
    </div>
  );
};

export default HomePage;
