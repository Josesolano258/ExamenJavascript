const container = document.getElementById("departmentsContainer");
const detail = document.getElementById("detailContainer");
const searchInput = document.getElementById("searchInput");

let departments = [];

/* =========================
   CARGAR DEPARTAMENTOS
========================= */
async function loadDepartments() {
  try {
    container.innerHTML = "<p class='loading'>Cargando departamentos...</p>";

    const res = await fetch("https://api-colombia.com/api/v1/Department");
    departments = await res.json();

    renderCards(departments);
  } catch (error) {
    container.innerHTML = "<p>Error al cargar departamentos 😢</p>";
    console.error(error);
  }
}

/* =========================
   RENDER CARDS
========================= */
function renderCards(data) {
  container.innerHTML = "";

  data.forEach(dep => {
    const card = document.createElement("div");
    card.className = "card";

    const imagePatch = `img/departments/${dep.id}.jpg`;

    card.innerHTML = `  
      <img 
        src="${imagePatch}" 
        onerror="this.src='img/departments/default.jpg'"
      >
      <div class="card-content">
        <h3>${dep.name}</h3>
        <p><strong>Capital:</strong> ${dep.cityCapital?.name || "N/A"}</p>
      </div>
    `;

    card.addEventListener("click", () => showDetail(dep.id));
    container.appendChild(card);
  });
}

/* =========================
   MOSTRAR DETALLE
========================= */
async function showDetail(id) {
  try {
    detail.innerHTML = "<p class='loading'>Cargando departamento...</p>";

    const resDep = await fetch(`https://api-colombia.com/api/v1/Department/${id}`);
    const dep = await resDep.json();

    const resCities = await fetch(`https://api-colombia.com/api/v1/Department/${id}/cities`);
    const cities = await resCities.json();

    const imagePatch = `img/departments/${id}.jpg`;

    detail.innerHTML = `  
      <img 
        src="${imagePatch}" 
        class="detail-img"
        onerror="this.src='img/departments/default.jpg'"
      >

      <div class="card-content">
        <h2>${dep.name}</h2>
        <p><strong>Capital:</strong> ${dep.cityCapital?.name || "N/A"}</p>
        <p><strong>Población:</strong> ${dep.population?.toLocaleString() || "No disponible"}</p>
        <p><strong>Superficie:</strong> ${dep.surface ? dep.surface + " km²" : "No disponible"}</p>
        <p><strong>Municipios:</strong> ${cities.length}</p>

        <br>
        <p><strong>Descripción:</strong></p>
        <p>${dep.description || "No disponible"}</p>

        <br><br>

        <input 
          type="text" 
          id="municipioSearch" 
          placeholder="Buscar municipio..."
          autocomplete="off"
        >

        <div class="municipios">
          ${cities.map(city => `
            <div class="municipio-item">
              <div class="municipio-header" data-id="${city.id}">
                ${city.name}
              </div>
              <div class="municipio-body" id="municipio-${city.id}"></div>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    activarEventosMunicipios();
    activarBuscadorMunicipios();

  } catch (error) {
    detail.innerHTML = "<p>Error cargando detalle 😢</p>";
    console.error(error);
  }
}

/* =========================
   ACCORDION MUNICIPIOS
========================= */
function activarEventosMunicipios() {
  const headers = document.querySelectorAll(".municipio-header");

  headers.forEach(header => {
    header.addEventListener("click", async function () {
      const id = this.dataset.id;
      const body = document.getElementById(`municipio-${id}`);

      document.querySelectorAll(".municipio-body").forEach(b => {
        if (b !== body) b.classList.remove("active");
      });

      if (body.innerHTML !== "") {
        body.classList.toggle("active");
        return;
      }

      body.innerHTML = "<p>Cargando municipio...</p>";
      body.classList.add("active");

      try {
        const res = await fetch(`https://api-colombia.com/api/v1/City/${id}`);
        const city = await res.json();

        body.innerHTML = `
          <p><strong>Descripción:</strong> ${city.description || "No disponible"}</p>
          <p><strong>Población:</strong> ${city.population?.toLocaleString() || "No disponible"}</p>
          <p><strong>Superficie:</strong> ${city.surface ? city.surface + " km²" : "No disponible"}</p>
          <p><strong>Código postal:</strong> ${city.postalCode || "No disponible"}</p>
        `;
      } catch {
        body.innerHTML = "<p>Error al cargar municipio 😢</p>";
      }
    });
  });
}

/* =========================
   BUSCADOR MUNICIPIOS
========================= */
function activarBuscadorMunicipios() {
  const input = document.getElementById("municipioSearch");
  const items = document.querySelectorAll(".municipio-item");

  input.addEventListener("input", function () {
    const value = this.value.toLowerCase();

    items.forEach(item => {
      const name = item
        .querySelector(".municipio-header")
        .textContent
        .toLowerCase();

      item.style.display = name.includes(value) ? "block" : "none";
    });
  });
}

/* =========================
   BUSCADOR DEPARTAMENTOS
========================= */
searchInput.addEventListener("input", e => {
  const value = e.target.value.toLowerCase();

  const filtered = departments.filter(dep =>
    dep.name.toLowerCase().includes(value)
  );

  renderCards(filtered);
});

/* =========================
   INICIAR APP
========================= */
loadDepartments();