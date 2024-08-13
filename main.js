const API_KEY = "9c9e7a3e02cc856b7e81605083941aab";
const API_URL = "https://api.themoviedb.org/3/search/movie";
const API_URL_MOVIE_DETAILS = "https://api.themoviedb.org/3/movie/";

async function getMovies(query) {
  const url = `${API_URL}?api_key=${API_KEY}&query=${query}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Response was not ok");
    }
    const data = await response.json();
    showMovies(data);
  } catch (error) {
    console.error("Error:", error);
  }
}

function classByRating(vote) {
  if (vote >= 7) {
    return "green";
  } else if (vote > 5) {
    return "orange";
  } else {
    return "red";
  }
}

function yearRelease(releaseDate) {
  if (!releaseDate) return "";
  return releaseDate.split("-")[0];
}

function formatRating(vote) {
  if (vote === null || vote === undefined) return "0";
  return vote.toFixed(0);
}

function isValidInput(value) {
  const validPattern = /^[a-zA-Z0-9\s]*$/;
  return validPattern.test(value);
}

function showMovies(data) {
  const moviesContainer = document.querySelector(".movies");
  searchInput;
  data.results.forEach((movie) => {
    const release = yearRelease(movie.release_date);

    const rating = formatRating(movie.vote_average);

    const movieItem = document.createElement("div");
    movieItem.classList.add("movie");

    const movieItemId = movie.id;

    movieItem.innerHTML = `
            <div class="movie__cover-inner">
                <img
                    src="https://image.tmdb.org/t/p/w200${movie.poster_path}"
                    class="movie__cover"
                    alt="${movie.title}"
                />
                <div class="cover-darkened"></div>
            </div>
            <div class="movie__info">
                <div class="movie__title">${movie.title}</div>
                <div class="movie__year">${release}</div>
                ${
                  rating &&
                  `
                    <div class="movie__rating rating__${classByRating(
                      rating
                    )}">${rating}</div>
                    `
                }
            </div>
        `;

    movieItem.addEventListener("click", () => openModal(movieItemId));
    moviesContainer.appendChild(movieItem);
  });
}

document.getElementById("searchInput").addEventListener("input", function () {
  const inputValue = this.value;

  if (inputValue.length < 3 || !isValidInput(inputValue)) {
    document.querySelector(".movies").innerHTML = "";
    return;
  }

  getMovies(inputValue);
});

document
  .getElementById("searchInput")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      this.value = "";
      document.querySelector(".movies").innerHTML = "";
    }
  });

//   modal
const movieItemModal = document.createElement("div");
movieItemModal.className = "modal";
document.body.appendChild(movieItemModal);

async function openModal(id) {
  try {
    const response = await fetch(
      `${API_URL_MOVIE_DETAILS}${id}?api_key=${API_KEY}&language=en-US`
    );
    const responseData = await response.json();

    if (!responseData) {
      throw new Error("Movie not available");
    }

    const posterUrl = responseData.poster_path
      ? `https://image.tmdb.org/t/p/w300${responseData.poster_path}`
      : "";

    function getReleaseYear(releaseDate) {
      if (!releaseDate) return "";
      const [year] = releaseDate.split("-");
      return year;
    }
    const releaseYear = getReleaseYear(responseData.release_date);

    //   modal inner
    movieItemModal.innerHTML = `
      <div class="modal__card">
        <button type="button" class="modal__close">Close</button>
        <img class="modal__img" src="${posterUrl}" alt="${responseData.title}">
        <h2>
          <p class="modal__movie-title">${responseData.title}</p>
          <p class="modal__movie-release">${releaseYear}</p>
        </h2>
        <div class="modal__movie-info">
     
          ${
            responseData.runtime
              ? `<p class="modal__movie-runtime"><i>Runtime - ${responseData.runtime} min </i></</p>`
              : ""
          }
          <p class="modal__movie-overview">${responseData.overview}</p>
        </div>
      </div>
    `;

    movieItemModal.classList.add("modal__show");

    const btnClose = document.querySelector(".modal__close");
    btnClose.addEventListener("click", () => closeModal());
  } catch (error) {
    console.error("Error fetching movie details:", error);
    movieItemModal.innerHTML = `<div class="modal__card"><p>Не вдалося завантажити дані про фільм.</p></div>`;
  }
}

function closeModal() {
  movieItemModal.classList.remove("modal__show");
}

window.addEventListener("click", (e) => {
  if (e.target === movieItemModal) {
    closeModal();
  }
});
