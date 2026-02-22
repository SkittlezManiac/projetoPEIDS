let filmes = [];

// carregar filmes da tmdb
async function carregarFilmes() {
	try {
		const resposta = await fetch("/filmes/tmdb/populares");
		filmes = await resposta.json();
		ordenarEExibir(filmes);
	} catch (err) {
		console.error("erro ao carregar filmes:", err);
	}
}

// ordenar filmes por título
function ordenarEExibir(lista) {
	const ordenados = [...lista].sort((a, b) =>
		a.title.localeCompare(b.title, "pt", { sensitivity: "base" })
	);
	renderizarFilmes(ordenados);
}

// renderizar filmes no html
function renderizarFilmes(lista) {
	const container = document.getElementById("filmesContainer");
	container.innerHTML = "";

	lista.forEach(filme => {
		const card = document.createElement("div");
		card.className = "movie-card";

		const posterUrl = filme.poster_path
			? `https://image.tmdb.org/t/p/w300${filme.poster_path}`
			: "https://via.placeholder.com/300x450?text=Sem+Imagem";

		card.innerHTML = `
			<img src="${posterUrl}" alt="${filme.title}">
			<div class="movie-info">
				<h4>${filme.title}</h4>
				<p>${filme.release_date ? filme.release_date.slice(0, 4) : "n/a"}</p>
			</div>
		`;

		// clique para detalhes do filme
		card.addEventListener("click", () => {
			window.location.href = `detalhes.html?id=${filme.id}&tipo=filme`;
		});

		container.appendChild(card);
	});
}

// pesquisa em tempo real
document.getElementById("searchInput").addEventListener("input", (e) => {
	const termo = e.target.value.toLowerCase().trim();

	if (termo === "") {
		ordenarEExibir(filmes);
		return;
	}

	const filtrados = filmes.filter(f =>
		f.title.toLowerCase().includes(termo)
	);

	ordenarEExibir(filtrados);
});

// inicializar ao carregar a página
document.addEventListener("DOMContentLoaded", carregarFilmes);
