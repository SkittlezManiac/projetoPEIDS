const token = localStorage.getItem('token');
const listaFavoritos = document.getElementById('listaFavoritos');
const mensagemFavoritos = document.getElementById('mensagemFavoritos');

// verificar login do utilizador
function verificarLogin() {
	if (!token) {
		if (mensagemFavoritos) {
			mensagemFavoritos.innerText = 'tens de fazer login para gerir favoritos.';
		}
		return false;
	}
	return true;
}

// carregar favoritos do servidor
async function carregarFavoritos() {
	if (!verificarLogin()) return;

	try {
		const res = await fetch('/api/favoritos', {
			headers: { 'Authorization': 'Bearer ' + token }
		});

		if (!res.ok) throw new Error('erro ao carregar favoritos');

		const favoritos = await res.json();

		if (!listaFavoritos) return;

		listaFavoritos.innerHTML = '';

		if (favoritos.length === 0) {
			mensagemFavoritos.innerText = 'ainda não adicionaste nenhum favorito.';
			return;
		}

		mensagemFavoritos.innerText = '';

		favoritos.forEach(f => {
			const card = document.createElement('div');
			card.className = 'movie-card';

			card.innerHTML = `
        <img src="${f.poster || 'img/no-image.png'}" alt="${f.titulo}">
        <h3>${f.titulo}</h3>
        <p>${f.ano || ''}</p>
        <button class="btn-danger" data-id="${f.id}">
          remover dos favoritos
        </button>
      `;

			card.querySelector('button').addEventListener('click', () => {
				removerFavorito(f.id);
			});

			listaFavoritos.appendChild(card);
		});

	} catch (err) {
		console.error(err);
		if (mensagemFavoritos) {
			mensagemFavoritos.innerText = 'erro ao carregar os favoritos.';
		}
	}
}

// adicionar item aos favoritos
async function adicionarFavorito(filme) {
	if (!verificarLogin()) {
		alert('tens de fazer login para adicionar favoritos.');
		return;
	}

	try {
		const res = await fetch('/api/favoritos', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token
			},
			body: JSON.stringify(filme)
		});

		if (!res.ok) throw new Error('erro ao adicionar favorito');

		alert('adicionado aos favoritos ⭐');

	} catch (err) {
		console.error(err);
		alert('erro ao adicionar aos favoritos.');
	}
}

// remover item dos favoritos
async function removerFavorito(id) {
	if (!verificarLogin()) return;
	if (!confirm('queres remover este item dos favoritos?')) return;

	try {
		const res = await fetch('/api/favoritos/' + id, {
			method: 'DELETE',
			headers: { 'Authorization': 'Bearer ' + token }
		});

		if (!res.ok) throw new Error('erro ao remover favorito');

		carregarFavoritos();

	} catch (err) {
		console.error(err);
		alert('erro ao remover dos favoritos.');
	}
}

// configurar botões de adicionar favorito
function configurarBotoesFavoritos() {
	const botoes = document.querySelectorAll('.btn-favorito');

	botoes.forEach(btn => {
		btn.addEventListener('click', () => {
			const filme = {
				titulo: btn.dataset.titulo,
				ano: btn.dataset.ano,
				poster: btn.dataset.poster,
				tipo: btn.dataset.tipo
			};
			adicionarFavorito(filme);
		});
	});
}

// inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
	if (listaFavoritos) {
		carregarFavoritos();
	}
});
