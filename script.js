// Controles da página. A chave é salva apenas no navegador do usuário.
const NOME_CHAVE = "corretor-pyton-chave-groq";
const campoCodigo = document.getElementById("codigo");
const campoExemplo = document.getElementById("exemplo");
const modalChave = document.getElementById("modal-chave");
const campoChave = document.getElementById("chave");
const erroPagina = document.getElementById("erro");
const andamento = document.getElementById("andamento");
let chaveAPI = "";
let emAnalise = false;
let controleTesteConexao = null;

try { chaveAPI = localStorage.getItem(NOME_CHAVE) || ""; }
catch { /* O formulário informará se o navegador impedir o armazenamento. */ }

function atualizarEstadoChave() {
  document.getElementById("abrir-chave").textContent = chaveAPI ? "Gerenciar chave de API" : "Adicionar chave de API";
  document.getElementById("estado-chave").textContent = chaveAPI
    ? "Chave salva neste navegador. A validade será conferida ao consultar a Groq."
    : "Sem chave configurada. Você já pode testar a verificação de sintaxe.";
}

function abrirChave() {
  campoChave.value = chaveAPI;
  campoChave.type = "password";
  document.getElementById("mostrar-chave").checked = false;
  document.getElementById("erro-chave").hidden = true;
  document.getElementById("resultado-conexao").hidden = true;
  modalChave.showModal();
  campoChave.focus();
}

function erroChave(mensagem) {
  const aviso = document.getElementById("erro-chave");
  aviso.textContent = mensagem;
  aviso.hidden = false;
}

document.getElementById("abrir-chave").addEventListener("click", abrirChave);
document.getElementById("fechar-chave").addEventListener("click", function () { modalChave.close(); });
modalChave.addEventListener("close", function () {
  if (controleTesteConexao) controleTesteConexao.abort();
  controleTesteConexao = null;
  definirTesteConexao(false);
  document.getElementById("resultado-conexao").hidden = true;
  campoChave.value = "";
  campoChave.type = "password";
  document.getElementById("mostrar-chave").checked = false;
});

function definirTesteConexao(testando) {
  ["chave", "salvar-chave", "remover-chave", "testar-conexao"].forEach(function (id) {
    document.getElementById(id).disabled = testando;
  });
  document.getElementById("testar-conexao").textContent = testando ? "Testando..." : "Testar conexão";
}

campoChave.addEventListener("input", function () {
  document.getElementById("resultado-conexao").hidden = true;
  document.getElementById("erro-chave").hidden = true;
});

document.getElementById("testar-conexao").addEventListener("click", async function () {
  if (controleTesteConexao) return;
  const resultado = document.getElementById("resultado-conexao");
  resultado.hidden = true;
  document.getElementById("erro-chave").hidden = true;
  let chaveTeste;
  try { chaveTeste = prepararChave(campoChave.value); }
  catch (erro) { erroChave(erro.message); return; }

  const controle = new AbortController();
  controleTesteConexao = controle;
  definirTesteConexao(true);
  resultado.className = "ajuda";
  resultado.textContent = "Testando conexão...";
  resultado.hidden = false;
  try {
    await testarConexaoGroq(chaveTeste, controle);
    if (controleTesteConexao !== controle) return;
    resultado.className = "sucesso";
    resultado.textContent = "Conexão confirmada! Clique em Salvar chave para usá-la.";
  } catch (erro) {
    if (controleTesteConexao !== controle) return;
    resultado.className = "erro";
    resultado.textContent = "O teste simples falhou. " + erro.message;
  } finally {
    if (controleTesteConexao === controle) {
      controleTesteConexao = null;
      definirTesteConexao(false);
    }
  }
});
document.getElementById("mostrar-chave").addEventListener("change", function (evento) {
  campoChave.type = evento.target.checked ? "text" : "password";
});

document.getElementById("form-chave").addEventListener("submit", function (evento) {
  evento.preventDefault();
  let novaChave;
  try {
    novaChave = prepararChave(campoChave.value);
  } catch (erro) {
    erroChave(erro.message);
    return;
  }
  try {
    localStorage.setItem(NOME_CHAVE, novaChave);
    chaveAPI = novaChave;
    atualizarEstadoChave();
    modalChave.close();
  } catch {
    erroChave("O navegador não permitiu salvar a chave. Verifique as permissões de armazenamento ou use outra janela do navegador.");
  }
});

document.getElementById("remover-chave").addEventListener("click", function () {
  try {
    localStorage.removeItem(NOME_CHAVE);
    chaveAPI = "";
    atualizarEstadoChave();
    modalChave.close();
  } catch {
    erroChave("Não foi possível remover a chave. Apague os dados deste site nas configurações do navegador.");
  }
});

EXEMPLOS.forEach(function (exemplo, indice) {
  const opcao = document.createElement("option");
  opcao.value = indice;
  opcao.textContent = exemplo.titulo;
  campoExemplo.appendChild(opcao);
});

function atualizarContador() {
  const linhas = campoCodigo.value ? campoCodigo.value.split(/\r\n|\r|\n/).length : 0;
  document.getElementById("contador").textContent = campoCodigo.value.length.toLocaleString("pt-BR") + " caracteres · " + linhas + " linhas";
}

function limparResultados() {
  document.getElementById("resultado-sintaxe").hidden = true;
  document.getElementById("resultado-ia").hidden = true;
  document.getElementById("estado-copia").textContent = "";
  erroPagina.hidden = true;
  campoCodigo.removeAttribute("aria-invalid");
}

campoExemplo.addEventListener("change", function () {
  if (campoExemplo.value === "") return;
  const exemplo = EXEMPLOS[Number(campoExemplo.value)];
  campoCodigo.value = exemplo.codigo;
  document.getElementById("descricao-exemplo").textContent = exemplo.descricao;
  limparResultados();
  atualizarContador();
  campoCodigo.focus();
});
campoCodigo.addEventListener("input", function () {
  campoExemplo.value = "";
  document.getElementById("descricao-exemplo").textContent = "Código editado. Analise novamente para atualizar o resultado.";
  limparResultados();
  atualizarContador();
});
document.getElementById("limpar").addEventListener("click", function () {
  campoCodigo.value = "";
  campoExemplo.value = "";
  document.getElementById("descricao-exemplo").textContent = "Você também pode escrever ou colar seu próprio código abaixo.";
  limparResultados();
  atualizarContador();
  campoCodigo.focus();
});

function mostrarErro(mensagem) {
  erroPagina.textContent = mensagem;
  erroPagina.hidden = false;
}

function definirCarregamento(carregando) {
  emAnalise = carregando;
  campoCodigo.disabled = carregando;
  campoExemplo.disabled = carregando;
  ["analisar", "verificar", "limpar", "abrir-chave", "copiar"].forEach(function (id) {
    document.getElementById(id).disabled = carregando;
  });
  document.getElementById("analisar").textContent = carregando ? "Aguarde a análise..." : "Explicar e sugerir correções com IA";
  andamento.hidden = !carregando;
}

function mostrarSintaxe(dados) {
  document.getElementById("resultado-sintaxe").hidden = false;
  const resumo = document.getElementById("resumo-sintaxe");
  const avisos = dados.avisos || [];
  resumo.className = "destaque " + (dados.valido ? (avisos.length ? "aviso" : "sucesso") : "erro");
  resumo.textContent = dados.valido
    ? (avisos.length ? "Sintaxe válida, mas há possíveis erros de nomes." : "Nenhum erro encontrado nas verificações básicas.")
    : "Erro de sintaxe encontrado" + (dados.linha ? " na linha " + dados.linha : "") + ".";
  document.getElementById("detalhe-sintaxe").textContent = dados.valido
    ? "O código foi aceito pelo compilador Python, mas não foi executado."
    : dados.tipo + ": " + dados.mensagem + (dados.coluna ? " (coluna " + dados.coluna + ")" : "");
  document.getElementById("dica-sintaxe").textContent = dados.valido
    ? "A sintaxe é válida. A checagem de nomes é limitada ao código principal, fora de funções, classes e compreensões. Isso não garante que o programa funcione. Use a IA para uma revisão comentada."
    : dados.dica;
  const lista = document.getElementById("avisos-nomes");
  lista.replaceChildren();
  lista.hidden = !avisos.length;
  avisos.forEach(function (aviso) {
    const item = document.createElement("li");
    item.textContent = descreverAviso(aviso);
    lista.appendChild(item);
  });
  const trecho = document.getElementById("trecho-erro");
  trecho.hidden = !dados.trecho;
  trecho.textContent = dados.trecho || "";
}

function descreverAviso(aviso) {
  return "Linha " + aviso.linha + ": o nome “" + aviso.nome + "” não tem definição identificada neste trecho." +
    (aviso.sugestao ? " Você quis dizer “" + aviso.sugestao + "”?" : " Confira a escrita ou defina esse nome antes de usá-lo.");
}

async function analisar(usarIA) {
  if (emAnalise) return;
  limparResultados();
  const codigo = campoCodigo.value;
  if (!codigo.trim() || codigo.length > 10000 || codigo.split(/\r\n|\r|\n/).length > 200) {
    mostrarErro(!codigo.trim() ? "Escreva um código ou escolha um exemplo para analisar." : "Use um trecho com até 10.000 caracteres e 200 linhas.");
    campoCodigo.setAttribute("aria-invalid", "true");
    campoCodigo.focus();
    return;
  }
  if (usarIA && !chaveAPI) {
    abrirChave();
    return;
  }

  definirCarregamento(true);
  andamento.textContent = "Preparando o Python e verificando a sintaxe. O primeiro carregamento pode demorar...";
  try {
    const sintaxe = await verificarSintaxe(codigo);
    mostrarSintaxe(sintaxe);
    if (usarIA) {
      andamento.textContent = "A Groq está preparando a explicação e as sugestões...";
      const resposta = await consultarGroq(codigo, sintaxe, chaveAPI, function (mensagem) {
        andamento.textContent = mensagem;
      });
      document.getElementById("explicacao").textContent = resposta.explicacao;
      document.getElementById("correcao").textContent = resposta.correcao;
      document.getElementById("codigo-corrigido").textContent = resposta.codigo_corrigido;
      document.getElementById("pergunta").textContent = resposta.pergunta;
      document.getElementById("estado-chave").textContent = "Chave utilizada com sucesso nesta sessão.";

      const aviso = document.getElementById("validacao-correcao");
      aviso.className = "ajuda";
      aviso.textContent = "A sugestão excede o limite do verificador; sua sintaxe não foi conferida.";
      if (resposta.codigo_corrigido.length <= 10000 && resposta.codigo_corrigido.split(/\r\n|\r|\n/).length <= 200) {
        const revisao = await verificarSintaxe(resposta.codigo_corrigido);
        aviso.textContent = revisao.valido
          ? "A sugestão passou na verificação de sintaxe. Isso não valida a lógica nem o resultado."
          : "Atenção: o código sugerido pela IA ainda tem erro de sintaxe" + (revisao.linha ? " na linha " + revisao.linha : "") + ": " + revisao.mensagem;
        if (!revisao.valido) aviso.className = "erro";
        if (revisao.valido && revisao.avisos.length) {
          aviso.className = "aviso";
          aviso.textContent = "A sugestão tem sintaxe válida, mas ainda contém possíveis erros de nomes: " + revisao.avisos.map(descreverAviso).join(" ");
        }
      }
      document.getElementById("resultado-ia").hidden = false;
      document.getElementById("titulo-ia").focus();
    } else {
      document.getElementById("titulo-sintaxe").focus();
    }
  } catch (erro) {
    mostrarErro(erro.message || "Não foi possível concluir a análise. Tente novamente.");
  } finally {
    definirCarregamento(false);
  }
}

document.getElementById("verificar").addEventListener("click", function () { analisar(false); });
document.getElementById("analisar").addEventListener("click", function () { analisar(true); });

document.getElementById("copiar").addEventListener("click", async function () {
  const codigo = document.getElementById("codigo-corrigido");
  const aviso = document.getElementById("estado-copia");
  try {
    await navigator.clipboard.writeText(codigo.textContent);
    aviso.textContent = "Código copiado.";
  } catch {
    const selecao = window.getSelection();
    const intervalo = document.createRange();
    intervalo.selectNodeContents(codigo);
    selecao.removeAllRanges();
    selecao.addRange(intervalo);
    aviso.textContent = "O navegador bloqueou a cópia automática. O código está selecionado: use Ctrl+C ou Cmd+C.";
  }
});

atualizarEstadoChave();
atualizarContador();
