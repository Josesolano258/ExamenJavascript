const container = document.getElementById("departmentsContainer");
const detail = document.getElementById("detailContainer");
const searchInput = document.getElementById("searchInput");

let departments = [];

/* =========================
   CARGAR DEPARTAMENTOS
========================= */
async function loadDepartments() {
  try {
    const res = await fetch("https://api-colombia.com/api/v1/Department");
    departments = await res.json();
    renderCards(departments);
  } catch {
    container.innerHTML = "<p>Error al cargar datos.</p>";
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

    const imagePatch = `img/departments/$(id)`;

    card.innerHTML = `  
    <img src="${imagePatch}">
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
      const res = await fetch(`https://api-colombia.com/api/v1/Department/${id}`);
      const dep = await res.json();

  
      const imagePatch = `img/departments/$(id)`;

      detail.innerHTML = `  
        <img src="imagePatch">
        <div class="card-content">
          <h3>${dep.name}</h3>
          <p><strong>Capital:</strong> ${dep.cityCapital?.name || "N/A"}</p>
          <p><strong>Poblacion:</strong> ${dep.population}</p>
          <p><strong>Superficie:</strong> ${dep.surface}</p>
          <p><strong>Municipios:</strong> ${dep.municipalities}</p>
          <br><br>
          <p><strong>Descripcion:</strong> ${dep.description}</p>
        
          


        </div>
      `;
    } catch (error) {
      detail.innerHTML = `<p>Error cargando detalle 😢</p>`;
      console.error(error);
    }
  }
/* =========================
   EVENTOS MUNICIPIOS (ACCORDION)
========================= */
function activarEventosMunicipios() {
  const items = document.querySelectorAll(".municipio-item");

  items.forEach(item => {
    item.addEventListener("click", async function () {

      const id = this.dataset.id;
      const body = document.getElementById(`municipio-${id}`);

      // Cerrar otros
      document.querySelectorAll(".municipio-body").forEach(b => {
        if (b !== body) {
          b.classList.remove("active");
        }
      });

      // Si ya cargó contenido → solo alternar
      if (body.innerHTML !== "") {
        body.classList.toggle("active");
        return;
      }

      body.innerHTML = "<p>Cargando...</p>";
      body.classList.add("active");

      try {
        const res = await fetch(`https://api-colombia.com/api/v1/City/${id}`);
        const city = await res.json();

        body.innerHTML = `
          <div class="municipio-info">
            <p><strong>Descripción:</strong> ${city.description || "No disponible"}</p>
            <p><strong>Población:</strong> ${city.population ? city.population.toLocaleString() : "No disponible"}</p>
            <p><strong>Superficie:</strong> ${city.surface ? city.surface + " km²" : "No disponible"}</p>
            <p><strong>Código postal:</strong> ${city.postalCode || "No disponible"}</p>
          </div>
        `;
      } catch {
        body.innerHTML = "<p>Error al cargar municipio.</p>";
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
      const nombre = item
        .querySelector(".municipio-header")
        .textContent
        .toLowerCase();

      if (nombre.includes(value)) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
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
   INICIAR
========================= */
loadDepartments();
