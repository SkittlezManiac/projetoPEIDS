// Mostrar / fechar modal
const modal = document.getElementById("authModal");
const btnLogin = document.getElementById("btnLogin");
const closeModal = document.getElementById("closeModal");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

btnLogin.onclick = () => modal.style.display = "flex";
closeModal.onclick = () => modal.style.display = "none";

window.onclick = (event) => {
	if (event.target === modal) modal.style.display = "none";
};

document.getElementById("showRegister").onclick = () => {
	loginForm.style.display = "none";
	registerForm.style.display = "block";
};

document.getElementById("showLogin").onclick = () => {
	registerForm.style.display = "none";
	loginForm.style.display = "block";
};

// login
document.getElementById("submitLogin").onclick = async () => {
	const email = document.getElementById("loginemail").value;
	const password = document.getElementById("loginpassword").value;

	const res = await fetch("/auth/login", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password })
	});

	const data = await res.json();
	alert(data.mensagem || data.erro);

	if (data.token) {
		localStorage.setItem("token", data.token);
		localStorage.setItem("user", JSON.stringify(data.user));
		modal.style.display = "none";
		atualizarBotaoLogin();
	}
};

// registar
document.getElementById("submitRegister").onclick = async () => {
	const name = document.getElementById("name").value;
	const email = document.getElementById("email").value;
	const password = document.getElementById("password").value;

	const res = await fetch("/auth/register", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name, email, password })
	});

	const data = await res.json(); -
		alert(data.mensagem || data.erro);

	if (!data.erro) {
		registerForm.style.display = "none";
		loginForm.style.display = "block";
	}
};

// Atualiza o botão de login/logout
function atualizarBotaoLogin() {
	const btnLogin = document.getElementById("btnLogin");
	const user = localStorage.getItem("user");

	if (user) {
		const userObj = JSON.parse(user);
		btnLogin.textContent = "Logout";
		btnLogin.onclick = () => {
			localStorage.removeItem("token");
			localStorage.removeItem("user");
			atualizarBotaoLogin();
			alert("Desconectado com sucesso!");
		};
	} else {
		btnLogin.textContent = "Login";
		btnLogin.onclick = () => modal.style.display = "flex";
	}
}

atualizarBotaoLogin();
