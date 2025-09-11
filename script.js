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

  // FUNÇÕES DE GERENCIAMENTO DE PROGRESSO (sem alterações)
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

      const nomeTema =
        temaAtual === "endemias" ? "Agente de Endemias" : "Português";
      tituloQuizEl.textContent = nomeTema;
      mostrarQuestao();
    }
  }

  function limparProgresso() {
    localStorage.removeItem("progressoSimulado");
  }

  // FUNÇÕES PRINCIPAIS

  async function inicializar() {
    try {
      // Carrega os dois arquivos JSON ao mesmo tempo
      const [questoesEndemias, questoesPortugues] = await Promise.all([
        fetch("questoes_endemias.json").then((res) => res.json()),
        fetch("questoes_portugues.json").then((res) => res.json()),
      ]);

      // Adiciona uma propriedade "tema" em cada questão para filtragem
      questoesEndemias.forEach((q) => (q.tema = "endemias"));
      questoesPortugues.forEach((q) => (q.tema = "portugues"));

      // Junta todas as questões em um único array
      todasAsQuestoes = [...questoesEndemias, ...questoesPortugues];

      // Tenta carregar um progresso salvo
      carregarProgresso();
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

  // FUNÇÃO INICIARQUIZ CORRIGIDA (FILTRA POR TEMA)
  function iniciarQuiz(tema) {
    if (todasAsQuestoes.length === 0) {
      alert("Aguarde, as questões ainda estão sendo carregadas.");
      return;
    }

    temaAtual = tema;
    // Filtra o array `todasAsQuestoes` para pegar apenas as do tema correto
    const questoesDoTema = todasAsQuestoes.filter((q) => q.tema === tema);
    questoesAtuais = embaralharArray(questoesDoTema);

    questaoAtualIndex = 0;
    pontuacao = 0;

    selecaoTemaDiv.style.display = "none";
    placarFinalDiv.style.display = "none";
    quizContainerDiv.style.display = "block";

    const nomeTema = tema === "endemias" ? "Agente de Endemias" : "Português";
    tituloQuizEl.textContent = nomeTema;

    mostrarQuestao();
    salvarProgresso();
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

  // FUNÇÃO CORRIGIR CORRIGIDA (TRATA COMENTÁRIOS NULOS)
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

    // Verifica se existe um comentário válido antes de exibi-lo
    if (
      questao.comentario &&
      questao.comentario.trim() !== "" &&
      questao.comentario.trim().toLowerCase() !== "null"
    ) {
      comentarioTextoEl.innerHTML = `<span class="comentario-titulo">Comentário:</span> ${questao.comentario}`;
    } else {
      comentarioTextoEl.innerHTML = ""; // Limpa a área de comentário se não houver
    }

    feedbackContainerEl.style.display = "block";

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

    salvarProgresso();
  }

  function proximaQuestao() {
    questaoAtualIndex++;
    if (questaoAtualIndex < questoesAtuais.length) {
      mostrarQuestao();
      salvarProgresso();
    } else {
      mostrarPlacarFinal();
    }
  }

  function mostrarPlacarFinal() {
    limparProgresso();
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
  inicializar();
});
