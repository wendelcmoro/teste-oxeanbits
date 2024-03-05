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
import { useFormik } from "formik";
import * as Yup from "yup";

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

  // Usuários
  const formikUser = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
    validationSchema: Yup.object({
      username: Yup.string().required("Required"),
      email: Yup.string().email("Invalid email address").required("Required"),
      password: Yup.string().required("Required"),
      passwordConfirmation: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Required"),
    }),
    onSubmit: async (values) => {
      try {
        const token = Cookies.get("currentUser");
        let jsonForm = {
          user: {
            username: values.username,
            email: values.email,
            password: values.password,
            password_confirmation: values.passwordConfirmation,
          },
        };

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
          formikUser.resetForm();
          toast.success("User created successfully!", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } catch (error) {
        console.error("Error on submitting new user:", error);
      }
    },
  });

  // Modal de filmes
  const [movieModalOpen, setMovieModalOpen] = React.useState(false);
  const movieModalClose = () => {
    setMovieModalOpen(false);
  };

  // Filmes
  const formikMovie = useFormik({
    initialValues: {
      title: "",
      director: "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Required"),
      director: Yup.string().required("Required"),
    }),
    onSubmit: async (values) => {
      try {
        const token = Cookies.get("currentUser");
        let jsonForm = {
          movie: {
            title: values.title,
            director: values.director,
          },
        };

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
          setMovieModalOpen(false);
          formikMovie.resetForm();
          toast.success("Movie created successfully!", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } catch (error) {
        console.error("Error on submitting new movie:", error);
      }
    },
  });

  // Avaliações
  const [movieIndex, setMovieIndex] = useState(0);
  const [movieId, setMovieId] = useState(0);
  const formikScore = useFormik({
    initialValues: {
      score: 0,
    },
    validationSchema: Yup.object({
      score: Yup.number()
        .required("Required")
        .min(0, "Score must be greater than or equal to 0")
        .max(10, "Score must be less than or equal to 10"),
    }),
    onSubmit: async (values) => {
      try {
        const token = Cookies.get("currentUser");
        const data = new FormData();
        data.append("movie_id", movieId);
        data.append("score", values.score);

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
          formikScore.resetForm();
          toast.success("Score updated successfully!", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } catch (error) {
        console.error("Error on updating score:", error);
      }
    },
  });

  // Importação de filmes
  const formikImportMovies = useFormik({
    initialValues: {
      csv_file: null,
    },
    validationSchema: Yup.object({
      csv_file: Yup.mixed().required("File is required"),
    }),
    onSubmit: async (values) => {
      try {
        const token = Cookies.get("currentUser");
        const data = new FormData();
        data.append("csv_file", values.csv_file);

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
        console.error("Error on submitting CSV file:", error);
      }
    },
  });

  // Importação de Avaliações
  const formikImportScores = useFormik({
    initialValues: {
      csv_file: null,
    },
    validationSchema: Yup.object({
      csv_file: Yup.mixed().required("File is required"),
    }),
    onSubmit: async (values) => {
      try {
        const token = Cookies.get("currentUser");
        const data = new FormData();
        data.append("csv_file", values.csv_file);

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
        console.error("Error on submitting CSV file:", error);
      }
    },
  });

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
          <form onSubmit={formikUser.handleSubmit}>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              margin="normal"
              name="username"
              value={formikUser.values.username}
              onChange={formikUser.handleChange}
              onBlur={formikUser.handleBlur}
              error={
                formikUser.touched.username &&
                Boolean(formikUser.errors.username)
              }
              helperText={
                formikUser.touched.username && formikUser.errors.username
              }
              required
            />
            <TextField
              label="E-mail"
              variant="outlined"
              fullWidth
              margin="normal"
              name="email"
              value={formikUser.values.email}
              onChange={formikUser.handleChange}
              onBlur={formikUser.handleBlur}
              error={
                formikUser.touched.email && Boolean(formikUser.errors.email)
              }
              helperText={formikUser.touched.email && formikUser.errors.email}
              required
            />
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              margin="normal"
              name="password"
              type="password"
              value={formikUser.values.password}
              onChange={formikUser.handleChange}
              onBlur={formikUser.handleBlur}
              error={
                formikUser.touched.password &&
                Boolean(formikUser.errors.password)
              }
              helperText={
                formikUser.touched.password && formikUser.errors.password
              }
              required
            />
            <TextField
              label="Password Confirmation"
              variant="outlined"
              fullWidth
              margin="normal"
              name="passwordConfirmation"
              type="password"
              value={formikUser.values.passwordConfirmation}
              onChange={formikUser.handleChange}
              onBlur={formikUser.handleBlur}
              error={
                formikUser.touched.passwordConfirmation &&
                Boolean(formikUser.errors.passwordConfirmation)
              }
              helperText={
                formikUser.touched.passwordConfirmation &&
                formikUser.errors.passwordConfirmation
              }
              required
            />
          </form>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button variant="contained" onClick={formikUser.handleSubmit}>
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
          <form onSubmit={formikMovie.handleSubmit}>
            <TextField
              label="Title"
              variant="outlined"
              fullWidth
              margin="normal"
              name="title"
              value={formikMovie.values.title}
              onChange={formikMovie.handleChange}
              onBlur={formikMovie.handleBlur}
              error={
                formikMovie.touched.title && Boolean(formikMovie.errors.title)
              }
              helperText={formikMovie.touched.title && formikMovie.errors.title}
              required
            />
            <TextField
              label="Director"
              variant="outlined"
              fullWidth
              margin="normal"
              name="director"
              value={formikMovie.values.director}
              onChange={formikMovie.handleChange}
              onBlur={formikMovie.handleBlur}
              error={
                formikMovie.touched.director &&
                Boolean(formikMovie.errors.director)
              }
              helperText={
                formikMovie.touched.director && formikMovie.errors.director
              }
              required
            />
          </form>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button variant="contained" onClick={formikMovie.handleSubmit}>
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
          <form onSubmit={formikScore.handleSubmit}>
            <TextField
              label="Score"
              variant="outlined"
              fullWidth
              margin="normal"
              name="score"
              type="number"
              value={formikScore.values.score}
              onChange={formikScore.handleChange}
              onBlur={formikScore.handleBlur}
              error={
                formikScore.touched.score && Boolean(formikScore.errors.score)
              }
              helperText={formikScore.touched.score && formikScore.errors.score}
              required
            />
          </form>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button variant="contained" onClick={formikScore.handleSubmit}>
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
          <form onSubmit={formikImportMovies.handleSubmit}>
            <input
              type="file"
              onChange={(e) => {
                formikImportMovies.setFieldValue(
                  "csv_file",
                  e.currentTarget.files[0]
                );
              }}
              onBlur={formikImportMovies.handleBlur}
            />
            {formikImportMovies.touched.csv_file &&
              formikImportMovies.errors.csv_file && (
                <div>{formikImportMovies.errors.csv_file}</div>
              )}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button variant="contained" type="submit">
                Submit
              </Button>
            </Box>
          </form>
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
          <form onSubmit={formikImportScores.handleSubmit}>
            <input
              type="file"
              onChange={(e) => {
                formikImportScores.setFieldValue(
                  "csv_file",
                  e.currentTarget.files[0]
                );
              }}
              onBlur={formikImportScores.handleBlur}
            />
            {formikImportScores.touched.csv_file &&
              formikImportScores.errors.csv_file && (
                <div>{formikImportScores.errors.csv_file}</div>
              )}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button variant="contained" type="submit">
                Submit
              </Button>
            </Box>
          </form>
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
                    if (props.dataItem.average_score !== undefined) {
                      setScoreModalOpen(true);
                      setMovieId(props.dataItem.id);
                      setMovieIndex(props.dataIndex);
                      formikScore.setValues({
                        ...formikScore.values,
                        score: props.dataItem.average_score,
                      });
                    }
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
