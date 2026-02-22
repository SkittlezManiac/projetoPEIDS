// carregar filmes da tmdb
async function carregarFilmesTMDB() {
	try {
		const resposta = await fetch("/filmes/tmdb/populares");
		const filmes = await resposta.json();

		const container = document.getElementById('listaFilmes');
		container.innerHTML = "";

		filmes.forEach(filme => {
			const card = document.createElement('div');
			card.className = "movie-card";

			const posterUrl = filme.poster_path
				? `https://image.tmdb.org/t/p/w300${filme.poster_path}`
				: "https://via.placeholder.com/300x450?text=Sem+Imagem";

			const titulo = filme.title || "sem título";
			const ano = filme.release_date ? filme.release_date.slice(0, 4) : "n/a";

			card.innerHTML = `
				<img src="${posterUrl}" alt="${titulo}">
				<div class="movie-info">
					<h4>${titulo}</h4>
					<p>${ano}</p>
				</div>
			`;

			// clique para detalhes do filme
			card.addEventListener("click", () => {
				window.location.href = `detalhes.html?id=${filme.id}&tipo=filme`;
			});

			container.appendChild(card);
		});

	} catch (erro) {
		console.error("erro ao carregar filmes tmdb:", erro);
	}
}

// inicializar ao carregar a página
window.addEventListener('DOMContentLoaded', carregarFilmesTMDB);
