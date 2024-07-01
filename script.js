const codigoApiBase = "https://mock-api.driven.com.br/api/v6/uol";
const codigoApiUsers = `${codigoApiBase}/participants/3ea8da01-270c-4774-ab0e-47fed8224927`;
const codigoApiStatus = `${codigoApiBase}/status/3ea8da01-270c-4774-ab0e-47fed8224927`;
const codigoApiMessages = `${codigoApiBase}/messages/3ea8da01-270c-4774-ab0e-47fed8224927`;

let nomeUsuario = "";
let destinatario = "Todos";
let visibilidade = "message";

function adicionarUsuario() {
  nomeUsuario = prompt("Digite seu nome:");
  const nomeDigitado = { name: nomeUsuario };

  axios
    .post(codigoApiUsers, nomeDigitado)
    .then(receberResposta)
    .catch(respostaErro);

  usuariosAside();
}

function recarregarPagina() {
  if (!nomeUsuario) return;
  const dadosStatus = { name: nomeUsuario };

  axios
    .post(codigoApiStatus, dadosStatus)
    .then((resposta) => {
      console.log("Status atualizado:", resposta.data);
    })
    .catch((erro) => {
      console.error("Erro ao atualizar status:", erro);
    });
}

function recarregarMensagens() {
  axios
    .get(codigoApiMessages)
    .then((resposta) => {
      exibirMensagens(resposta.data);
    })
    .catch((erro) => {
      console.error("Erro ao recarregar mensagens:", erro);
    });
}

function receberResposta(resposta) {
  console.log("Usuário adicionado com sucesso:", resposta.data);
  exibirMensagemStatus();
  setInterval(recarregarPagina, 5000);
  setInterval(recarregarMensagens, 3000);
  setInterval(usuariosAside, 10000);
}

function exibirMensagemStatus() {
  const mensagem = document.querySelector(".mensagens");
  const horarioAtual = new Date().toLocaleTimeString();

  mensagem.innerHTML += `
    <div class="mensagem-status">
      <span>(${horarioAtual})</span>
      <p><b>${nomeUsuario}</b> entrou na sala...</p>
    </div>`;
  scrollarTela();
}

function enviarMensagem() {
  const campoEntradaMensagem = document.querySelector(".input");
  const mensagem = campoEntradaMensagem.value;

  const mensagemParaEnvio = {
    from: nomeUsuario,
    to: destinatario,
    text: mensagem,
    type: visibilidade,
  };

  axios
    .post(codigoApiMessages, mensagemParaEnvio)
    .then((resposta) => {
      console.log("Mensagem enviada com sucesso:", resposta.data);
      campoEntradaMensagem.value = "";
      buscarMensagem();
    })
    .catch((erro) => {
      console.error("Erro ao enviar mensagem:", erro);
      alert("Erro ao enviar mensagem. Tente novamente.");
    });
}

function buscarMensagem() {
  axios
    .get(codigoApiMessages)
    .then((resposta) => {
      exibirMensagens(resposta.data);
    })
    .catch((erro) => {
      console.error("Erro ao buscar mensagens:", erro);
    });
}

function exibirMensagens(mensagens) {
  const campoMensagem = document.querySelector(".mensagens");
  campoMensagem.innerHTML = "";

  mensagens.forEach((mensagem) => {
    if (
      mensagem.type === "private_message" &&
      mensagem.to !== nomeUsuario &&
      mensagem.from !== nomeUsuario
    ) {
      return;
    }

    const horarioAtual = mensagem.time;
    const tipoMensagem =
      mensagem.type === "status"
        ? "mensagem-status"
        : mensagem.type === "private_message"
        ? "mensagem-reservada"
        : "mensagem-normal";

    campoMensagem.innerHTML += `
      <div class="${tipoMensagem}">
        <span>(${horarioAtual})</span>
        <p><b>${mensagem.from}</b> para <b>${mensagem.to}</b>: ${mensagem.text}</p>
      </div>`;
  });
  scrollarTela();
}

function scrollarTela() {
  const elementoQueQueroQueApareca = document.querySelector(".mensagens");
  elementoQueQueroQueApareca.scrollIntoView(false);
}

function respostaErro(erro) {
  if (erro.response && erro.response.status === 400) {
    alert("Nome já está em uso! Por favor, digite outro nome.");
  } else {
    alert("Erro ao adicionar usuário. Tente novamente.");
  }
  adicionarUsuario();
}

function showAside() {
  const aside = document.querySelector(".aside");
  aside.classList.remove("aside-escondido");

  const overlay = document.querySelector(".disable-overlay");
  overlay.classList.remove("disable-overlay");
  overlay.classList.add("overlay");
}

function hideAside() {
  const aside = document.querySelector(".aside");
  aside.classList.add("aside-escondido");

  const overlay = document.querySelector(".overlay");
  overlay.classList.remove("overlay");
  overlay.classList.add("disable-overlay");
}

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.querySelector(".disable-overlay");
  overlay.addEventListener("click", hideAside);
});

function usuariosAside() {
  axios
    .get(codigoApiUsers)
    .then((resposta) => {
      const campoAside = document.querySelector(".itens-aside");
      campoAside.innerHTML = "";
      resposta.data.forEach((usuario) => {
        campoAside.innerHTML += `
        <div class="item" onclick="showCheck(this)">
          <span><img src="assets/person.svg" alt="">${usuario.name}</span>
          <div class="check-image">
            <img class="check" src="/assets/check.svg" alt="">
          </div>
        </div>
        `;
      });
    })
    .catch((erro) => {
      console.error("Erro ao buscar participantes:", erro);
    });
}

let typeMessage = "";

function showCheck(item) {
  const itens = document.querySelectorAll(".item");

  itens.forEach((item) => {
    item.querySelector(".check-image").classList.remove("check-active");
  });

  const checkImage = item.querySelector(".check-image");
  checkImage.classList.toggle("check-active");

  const selectInfoName = checkImage.parentNode.innerText.trim();
  destinatario = selectInfoName;

  const teste = document.querySelector(".message-info");
  if (checkImage.classList.contains("check-active")) {
    teste.innerText = `Enviando para ${selectInfoName} (${typeMessage})`;
  } else {
    destinatario = "Todos";
    teste.innerText = `Enviando para Todos (Público)`;
  }
}

function showCheckTwo(item) {
  const itens = document.querySelectorAll(".itemTwo");

  itens.forEach((item) => {
    item.querySelector(".check-image").classList.remove("check-active");
  });

  const checkImage = item.querySelector(".check-image");
  checkImage.classList.toggle("check-active");

  const selectInfoType = checkImage.parentNode.innerText.trim();

  if (checkImage.classList.contains("check-active")) {
    visibilidade =
      selectInfoType === "Reservadamente" ? "private_message" : "message";
    typeMessage = selectInfoType;
    const teste = document.querySelector(".message-info");
    if (teste) {
      const messageInfo = teste.innerText.split(" ");
      const recipient = messageInfo.slice(2, messageInfo.length - 1).join(" ");
      teste.innerText = `Enviando para ${recipient} (${typeMessage})`;
    }
  }
}

adicionarUsuario();
usuariosAside();
