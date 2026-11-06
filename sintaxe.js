// Pyodide traz o Python para o navegador. Só é baixado ao verificar um código.
const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/";
let promessaPython = null;

async function carregarPython() {
  if (!promessaPython) {
    promessaPython = (async function () {
      if (typeof loadPyodide === "undefined") {
        await new Promise(function (resolver, rejeitar) {
          const script = document.createElement("script");
          script.src = PYODIDE_URL + "pyodide.js";
          script.onload = resolver;
          script.onerror = function () {
            script.remove();
            rejeitar(new Error("Não foi possível baixar o Python. Verifique a internet e tente novamente."));
          };
          document.head.appendChild(script);
        });
      }
      return loadPyodide({ indexURL: PYODIDE_URL });
    })().catch(function () {
      promessaPython = null;
      throw new Error("Não foi possível carregar o verificador Python. Confira sua conexão e tente novamente.");
    });
  }
  return promessaPython;
}

function dicaSintaxe(mensagem, tipo) {
  if (tipo === "IndentationError" || tipo === "TabError") {
    return "Revise a indentação. Use quatro espaços para cada nível e evite misturar espaços com tabulações.";
  }
  if (mensagem.includes("was never closed")) {
    return "Feche o parêntese, colchete ou chave indicado. Confira se cada abertura tem seu fechamento correspondente.";
  }
  if (mensagem.includes("expected ':'")) {
    return "Acrescente dois-pontos (:) ao final da condição, repetição ou definição indicada.";
  }
  if (mensagem.includes("unterminated string")) {
    return "Confira se o texto tem aspas de abertura e de fechamento do mesmo tipo.";
  }
  if (mensagem.includes("unmatched") || mensagem.includes("does not match")) {
    return "Confira a ordem e o tipo dos parênteses, colchetes e chaves.";
  }
  return "Revise a linha indicada e a anterior. A IA pode ajudar a explicar o problema e sugerir uma correção.";
}

async function verificarSintaxe(codigo) {
  const python = await carregarPython();
  // O código do usuário é um dado separado, nunca parte do programa abaixo.
  python.globals.set("codigo_para_verificar", codigo);
  try {
    const resposta = python.runPython(`
import json
import warnings
import ast
import builtins
import symtable
from difflib import get_close_matches

def verificar_nomes(codigo):
    # Análise simples do código principal, sem executar nenhuma instrução.
    arvore = ast.parse(codigo)
    tabela = symtable.symtable(codigo, "<codigo>", "exec")
    conhecidos = set(dir(builtins)) | {"__name__", "__file__", "__package__", "__doc__"}
    for simbolo in tabela.get_symbols():
        if simbolo.is_assigned() or simbolo.is_imported() or simbolo.is_namespace():
            conhecidos.add(simbolo.get_name())

    # Uma importação com * pode criar nomes que só seriam conhecidos ao executar.
    if any(isinstance(no, ast.ImportFrom) and any(item.name == "*" for item in no.names)
           for no in ast.walk(arvore)):
        return []

    avisos = []
    def visitar(no):
        # Escopos internos ficam fora desta checagem básica para evitar confundir
        # parâmetros e variáveis locais com nomes do programa principal.
        if isinstance(no, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef,
                           ast.Lambda, ast.ListComp, ast.SetComp, ast.DictComp,
                           ast.GeneratorExp, ast.TypeAlias)):
            return
        if isinstance(no, ast.AnnAssign):
            if no.value is not None:
                visitar(no.value)
            return
        if isinstance(no, ast.Name) and isinstance(no.ctx, ast.Load) and no.id not in conhecidos:
            parecidos = get_close_matches(no.id, sorted(conhecidos), n=1, cutoff=0.75)
            avisos.append({"nome": no.id, "linha": no.lineno,
                           "sugestao": parecidos[0] if parecidos else ""})
        for filho in ast.iter_child_nodes(no):
            visitar(filho)
    visitar(arvore)
    return avisos

try:
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        compile(codigo_para_verificar, "<codigo>", "exec")
        avisos = verificar_nomes(codigo_para_verificar)
    resultado = {"valido": True, "avisos": avisos}
except SyntaxError as erro:
    resultado = {
        "valido": False,
        "mensagem": erro.msg,
        "linha": erro.lineno,
        "coluna": erro.offset,
        "tipo": type(erro).__name__,
        "trecho": (erro.text or "").rstrip()
    }
except (ValueError, OverflowError, RecursionError):
    resultado = {"valido": False, "mensagem": "Código inválido ou complexo demais para este exemplo.", "linha": None, "coluna": None, "tipo": "Erro", "trecho": ""}
json.dumps(resultado)
`);
    const dados = JSON.parse(resposta);
    if (!dados.valido) dados.dica = dicaSintaxe(dados.mensagem, dados.tipo);
    return dados;
  } finally {
    python.globals.delete("codigo_para_verificar");
  }
}
