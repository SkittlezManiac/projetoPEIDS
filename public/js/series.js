let series = [];

async function carregarSeries() {
	try {
		const resposta = await fetch("/series/tmdb/populares");
		series = await resposta.json();
		ordenarEExibir(series);
	} catch (err) {
		console.error("Erro ao carregar séries:", err);
	}
}

function ordenarEExibir(lista) {
	const ordenados = [...lista].sort((a, b) =>
		a.name.localeCompare(b.name, "pt", { sensitivity: "base" })
	);
	renderizarSeries(ordenados);
}

function renderizarSeries(lista) {
	const container = document.getElementById("seriesContainer"); // <-- corrigido
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
				<p>${serie.first_air_date ? serie.first_air_date.slice(0, 4) : "N/A"}</p>
			</div>
		`;

		container.appendChild(card);
	});
}

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

carregarSeries();
