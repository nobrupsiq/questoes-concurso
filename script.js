document.addEventListener("DOMContentLoaded", () => {
  let todasAsQuestoes = [];
  let questoesAtuais = [];
  let questaoAtualIndex = 0;
  let pontuacao = 0;
  let temaAtual = "";

  const selecaoTemaDiv = document.getElementById("selecao-tema");
  const quizContainerDiv = document.getElementById("quiz-container");
  const placarFinalDiv = document.getElementById("placar-final");

  const perguntaTextoEl = document.getElementById("pergunta-texto");
  const alternativasListaEl = document.getElementById("alternativas-lista");
  const contadorQuestoesEl = document.getElementById("contador-questoes");
  const tituloQuizEl = document.getElementById("quiz-titulo");

  const btnCorrigir = document.getElementById("btn-corrigir");
  const btnProxima = document.getElementById("btn-proxima");
  const botoesTema = document.querySelectorAll(".btn-tema[data-tema]");

  const feedbackContainerEl = document.getElementById("feedback-container");
  const resultadoTextoEl = document.getElementById("resultado-texto");
  const comentarioTextoEl = document.getElementById("comentario-texto");

  const btnReiniciar = document.getElementById("btn-reiniciar");
  const btnMenu = document.getElementById("btn-menu");
  const btnMenuFinal = document.getElementById("btn-menu-final");

  // FUNÇÕES DE GERENCIAMENTO DE PROGRESSO (RESTAURADAS)
  function salvarProgresso() {
    const progresso = {
      tema: temaAtual,
      questoes: questoesAtuais,
      index: questaoAtualIndex,
      pontos: pontuacao,
    };
    localStorage.setItem("progressoSimulado", JSON.stringify(progresso));
  }

  function carregarProgresso() {
    const progressoSalvo = localStorage.getItem("progressoSimulado");
    if (progressoSalvo) {
      const progresso = JSON.parse(progressoSalvo);
      temaAtual = progresso.tema;
      questoesAtuais = progresso.questoes;
      questaoAtualIndex = progresso.index;
      pontuacao = progresso.pontos;

      selecaoTemaDiv.style.display = "none";
      quizContainerDiv.style.display = "block";

      tituloQuizEl.textContent = "Agente de Endemias";
      mostrarQuestao();
    }
  }

  function limparProgresso() {
    localStorage.removeItem("progressoSimulado");
  }

  // FUNÇÕES PRINCIPAIS
  async function carregarQuestoesJSON(caminhoDoArquivo) {
    try {
      const resposta = await fetch(caminhoDoArquivo);
      if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);
      todasAsQuestoes = await resposta.json();
    } catch (erro) {
      console.error("Não foi possível carregar as questões:", erro);
      alert("Houve um erro ao carregar as questões. Verifique o console.");
    }
  }

  function embaralharArray(array) {
    const novoArray = [...array];
    for (let i = novoArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [novoArray[i], novoArray[j]] = [novoArray[j], novoArray[i]];
    }
    return novoArray;
  }

  function iniciarQuiz(tema) {
    if (todasAsQuestoes.length === 0) {
      alert("Aguarde, as questões ainda estão sendo carregadas.");
      return;
    }

    temaAtual = tema;
    questoesAtuais = embaralharArray(todasAsQuestoes);
    questaoAtualIndex = 0;
    pontuacao = 0;

    selecaoTemaDiv.style.display = "none";
    placarFinalDiv.style.display = "none";
    quizContainerDiv.style.display = "block";

    tituloQuizEl.textContent = "Agente de Endemias";
    mostrarQuestao();
    salvarProgresso(); // Salva o início do quiz
  }

  function mostrarQuestao() {
    resetarEstado();
    const questao = questoesAtuais[questaoAtualIndex];

    contadorQuestoesEl.innerText = `Questão ${questaoAtualIndex + 1} de ${
      questoesAtuais.length
    }`;
    perguntaTextoEl.innerText = questao.pergunta;

    if (questao.texto) {
      const textoBaseEl = document.createElement("div");
      textoBaseEl.className = "texto-base";
      textoBaseEl.innerText = questao.texto;
      perguntaTextoEl.prepend(textoBaseEl);
    }

    const letras = ["A", "B", "C", "D", "E"];
    questao.alternativas.forEach((alt, index) => {
      const li = document.createElement("li");
      const idAlternativa = `alt-${index}`;
      li.innerHTML = `
                <span class="alternativa-letra">${letras[index]})</span>
                <input type="radio" name="alternativa" id="${idAlternativa}" value="${alt}">
                <label for="${idAlternativa}">${alt}</label>
            `;
      li.addEventListener("click", () => {
        document.getElementById(idAlternativa).checked = true;
        document
          .querySelectorAll("#alternativas-lista li")
          .forEach((item) => item.classList.remove("selecionada"));
        li.classList.add("selecionada");
      });
      alternativasListaEl.appendChild(li);
    });
  }

  function corrigirQuestao() {
    const alternativaSelecionada = document.querySelector(
      'input[name="alternativa"]:checked'
    );
    if (!alternativaSelecionada) {
      alert("Por favor, escolha uma alternativa.");
      return;
    }

    const respostaUsuario = alternativaSelecionada.value;
    const questao = questoesAtuais[questaoAtualIndex];

    feedbackContainerEl.style.display = "block";
    comentarioTextoEl.innerHTML = `<span class="comentario-titulo">Comentário:</span> ${questao.comentario}`;

    if (respostaUsuario === questao.correta) {
      resultadoTextoEl.innerText = "Você Acertou!";
      feedbackContainerEl.classList.add("correto");
      pontuacao++;
    } else {
      resultadoTextoEl.innerText = "Você Errou!";
      feedbackContainerEl.classList.add("errado");
    }

    btnCorrigir.style.display = "none";
    document
      .querySelectorAll('input[name="alternativa"]')
      .forEach((input) => (input.disabled = true));

    btnProxima.style.display = "inline-block";
    if (questaoAtualIndex >= questoesAtuais.length - 1) {
      btnProxima.innerText = "Ver Resultado Final";
    }

    salvarProgresso(); // Salva o progresso após corrigir
  }

  function proximaQuestao() {
    questaoAtualIndex++;
    if (questaoAtualIndex < questoesAtuais.length) {
      mostrarQuestao();
      salvarProgresso(); // Salva o progresso ao ir para a próxima questão
    } else {
      mostrarPlacarFinal();
    }
  }

  function mostrarPlacarFinal() {
    limparProgresso(); // Limpa o progresso ao finalizar
    quizContainerDiv.style.display = "none";
    placarFinalDiv.style.display = "block";

    const placarTextoEl = document.getElementById("placar-texto");
    const aproveitamento = ((pontuacao / questoesAtuais.length) * 100).toFixed(
      2
    );
    placarTextoEl.innerHTML = `
            Você acertou <strong>${pontuacao}</strong> de <strong>${questoesAtuais.length}</strong> questões.
            <br>
            Seu aproveitamento foi de <strong>${aproveitamento}%</strong>.
        `;
  }

  function resetarEstado() {
    alternativasListaEl.innerHTML = "";
    btnCorrigir.style.display = "inline-block";
    btnProxima.style.display = "none";
    btnProxima.innerText = "Próxima Questão";
    feedbackContainerEl.style.display = "none";
    feedbackContainerEl.classList.remove("correto", "errado");
  }

  function voltarAoMenu() {
    if (
      confirm(
        "Tem certeza que deseja voltar ao menu? Seu progresso será perdido."
      )
    ) {
      limparProgresso();
      window.location.reload();
    }
  }

  function reiniciarSimulado() {
    if (
      confirm(
        "Tem certeza que deseja reiniciar o simulado? Todo o seu progresso será perdido."
      )
    ) {
      limparProgresso();
      iniciarQuiz(temaAtual);
    }
  }

  // EVENT LISTENERS
  botoesTema.forEach((botao) => {
    botao.addEventListener("click", () => iniciarQuiz(botao.dataset.tema));
  });

  btnCorrigir.addEventListener("click", corrigirQuestao);
  btnProxima.addEventListener("click", proximaQuestao);
  btnReiniciar.addEventListener("click", reiniciarSimulado);
  btnMenu.addEventListener("click", voltarAoMenu);
  btnMenuFinal.addEventListener("click", () => window.location.reload());

  // INICIALIZAÇÃO
  async function inicializar() {
    await carregarQuestoesJSON("questoes_endemias.json");
    carregarProgresso();
  }

  inicializar();
});
