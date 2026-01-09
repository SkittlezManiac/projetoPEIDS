// favoritos.js
// Lógica completa para gerir favoritos no front-end

const token = localStorage.getItem('token');
const listaFavoritos = document.getElementById('listaFavoritos');
const mensagemFavoritos = document.getElementById('mensagemFavoritos');

// ============================
// VERIFICA LOGIN
// ============================
function verificarLogin() {
	if (!token) {
		if (mensagemFavoritos) {
			mensagemFavoritos.innerText = 'Tens de fazer login para gerir favoritos.';
		}
		return false;
	}
	return true;
}

// ============================
// CARREGAR FAVORITOS
// ============================
async function carregarFavoritos() {
	if (!verificarLogin()) return;

	try {
		const res = await fetch('/api/favoritos', {
			headers: {
				'Authorization': 'Bearer ' + token
			}
		});

		if (!res.ok) throw new Error('Erro ao carregar favoritos');

		const favoritos = await res.json();

		if (!listaFavoritos) return;

		listaFavoritos.innerHTML = '';

		if (favoritos.length === 0) {
			mensagemFavoritos.innerText = 'Ainda não adicionaste nenhum favorito.';
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
          Remover dos Favoritos
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
			mensagemFavoritos.innerText = 'Erro ao carregar os favoritos.';
		}
	}
}

// ============================
// ADICIONAR AOS FAVORITOS
// ============================
async function adicionarFavorito(filme) {
	if (!verificarLogin()) {
		alert('Tens de fazer login para adicionar favoritos.');
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

		if (!res.ok) throw new Error('Erro ao adicionar favorito');

		alert('Adicionado aos favoritos ⭐');

	} catch (err) {
		console.error(err);
		alert('Erro ao adicionar aos favoritos.');
	}
}

// ============================
// REMOVER FAVORITO
// ============================
async function removerFavorito(id) {
	if (!verificarLogin()) return;

	if (!confirm('Queres remover este item dos favoritos?')) return;

	try {
		const res = await fetch('/api/favoritos/' + id, {
			method: 'DELETE',
			headers: {
				'Authorization': 'Bearer ' + token
			}
		});

		if (!res.ok) throw new Error('Erro ao remover favorito');

		// Atualizar lista
		carregarFavoritos();

	} catch (err) {
		console.error(err);
		alert('Erro ao remover dos favoritos.');
	}
}

// ============================
// FUNÇÃO AUXILIAR
// PARA BOTÕES "FAVORITO"
// ============================
function configurarBotoesFavoritos() {
	const botoes = document.querySelectorAll('.btn-favorito');

	botoes.forEach(btn => {
		btn.addEventListener('click', () => {
			const filme = {
				titulo: btn.dataset.titulo,
				ano: btn.dataset.ano,
				poster: btn.dataset.poster,
				tipo: btn.dataset.tipo // filme | serie
			};

			adicionarFavorito(filme);
		});
	});
}

// ============================
// AUTO INIT
// ============================
document.addEventListener('DOMContentLoaded', () => {
	if (listaFavoritos) {
		carregarFavoritos();
	}
});
