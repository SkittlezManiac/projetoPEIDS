let series = [];
let generosMap = {};
let generoSelecionado = "todos";

// carregar séries
async function carregarSeries() {
	try {
		const resposta = await fetch("/series/tmdb/populares");
		series = await resposta.json();

		await carregarGeneros();
		construirGeneros(series);
		ordenarEExibir(series);

	} catch (err) {
		console.error("erro ao carregar séries:", err);
	}
}

// carregar géneros da TMDB
async function carregarGeneros() {
	try {
		const res = await fetch("/series/tmdb/generos");
		const generos = await res.json();

		generosMap = {};
		generos.forEach(g => generosMap[g.id] = g.name);

	} catch (err) {
		console.error("erro ao carregar géneros:", err);
	}
}

// construir select
function construirGeneros(lista) {
	const select = document.getElementById("genreSelect");
	if (!select) return;

	select.innerHTML = `<option value="todos">Todos</option>`;

	const idsSeries = new Set();
	lista.forEach(s => s.genre_ids?.forEach(id => idsSeries.add(id)));

	idsSeries.forEach(id => {
		const option = document.createElement("option");
		option.value = id;
		option.textContent = generosMap[id] || `Género ${id}`;
		select.appendChild(option);
	});

	select.addEventListener("change", (e) => {
		generoSelecionado = e.target.value;
		filtrarEExibir();
	});
}

// filtrar
function filtrarEExibir() {
	let listaFiltrada = [...series];

	if (generoSelecionado !== "todos") {
		listaFiltrada = listaFiltrada.filter(s =>
			s.genre_ids?.includes(Number(generoSelecionado))
		);
	}

	ordenarEExibir(listaFiltrada);
}

// ordenar
function ordenarEExibir(lista) {
	const ordenados = [...lista].sort((a, b) =>
		a.name.localeCompare(b.name, "pt", { sensitivity: "base" })
	);

	renderizarSeries(ordenados);
}

// renderizar
function renderizarSeries(lista) {
	const container = document.getElementById("seriesContainer");
	container.innerHTML = "";

	lista.forEach(serie => {
		const card = document.createElement("div");
		card.className = "movie-card";

		const posterUrl = serie.poster_path
			? `https://image.tmdb.org/t/p/w300${serie.poster_path}`
			: "https://via.placeholder.com/300x450?text=Sem+Imagem";

		card.innerHTML = `
			<img src="${posterUrl}" alt="${serie.name}">
			<div class="movie-info">
				<h4>${serie.name}</h4>
				<p>${serie.first_air_date ? serie.first_air_date.slice(0, 4) : "n/a"}</p>
			</div>
		`;

		card.addEventListener("click", () => {
			window.location.href = `detalhes.html?id=${serie.id}&tipo=serie`;
		});

		container.appendChild(card);
	});
}

// pesquisa
document.getElementById("searchInput").addEventListener("input", (e) => {
	const termo = e.target.value.toLowerCase().trim();

	let listaFiltrada = series.filter(s =>
		s.name.toLowerCase().includes(termo)
	);

	if (generoSelecionado !== "todos") {
		listaFiltrada = listaFiltrada.filter(s =>
			s.genre_ids?.includes(Number(generoSelecionado))
		);
	}

	ordenarEExibir(listaFiltrada);
});

document.addEventListener("DOMContentLoaded", carregarSeries);
