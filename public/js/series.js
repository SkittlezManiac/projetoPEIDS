let series = [];

// carregar séries da api tmdb
async function carregarSeries() {
	try {
		const resposta = await fetch("/series/tmdb/populares");
		series = await resposta.json();
		ordenarEExibir(series);
	} catch (err) {
		console.error("erro ao carregar séries:", err);
	}
}

// ordenar séries por nome
function ordenarEExibir(lista) {
	const ordenados = [...lista].sort((a, b) =>
		a.name.localeCompare(b.name, "pt", { sensitivity: "base" })
	);
	renderizarSeries(ordenados);
}

// renderizar séries no html
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

		// clique para detalhes da série
		card.addEventListener("click", () => {
			window.location.href = `detalhes.html?id=${serie.id}&tipo=serie`;
		});

		container.appendChild(card);
	});
}

// pesquisa em tempo real
document.getElementById("searchInput").addEventListener("input", (e) => {
	const termo = e.target.value.toLowerCase().trim();

	if (termo === "") {
		ordenarEExibir(series);
		return;
	}

	const filtrados = series.filter(s =>
		s.name.toLowerCase().includes(termo)
	);

	ordenarEExibir(filtrados);
});

// inicializar ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
	carregarSeries();
});
