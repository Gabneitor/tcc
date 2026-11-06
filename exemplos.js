// Exemplos fixos: não precisam de uma consulta à IA para serem carregados.
const EXEMPLOS = [
  {
    titulo: "Código correto — média de notas",
    descricao: "Uma lista, um cálculo e uma condição. Peça à IA para explicar cada etapa.",
    codigo: 'notas = [7, 8, 9]\nmedia = sum(notas) / len(notas)\n\nif media >= 7:\n    print("Aprovado! Média:", media)\nelse:\n    print("Precisa estudar mais. Média:", media)',
    sintaxeValida: true
  },
  {
    titulo: "Erro de sintaxe — colchete não fechado",
    descricao: "O Python deve apontar que a lista não foi fechada. Falta o caractere ].",
    codigo: 'frutas = ["maçã", "banana", "uva"\nprint(frutas)',
    sintaxeValida: false
  },
  {
    titulo: "Erro de sintaxe — falta de dois-pontos",
    descricao: "A condição if precisa terminar com dois-pontos (:).",
    codigo: 'idade = 18\n\nif idade >= 18\n    print("Maior de idade")',
    sintaxeValida: false
  },
  {
    titulo: "Erro de sintaxe — indentação",
    descricao: "A instrução dentro do for precisa estar indentada.",
    codigo: 'for numero in range(1, 4):\nprint(numero)',
    sintaxeValida: false
  },
  {
    titulo: "Erro de escrita — variável com nome diferente",
    descricao: "A sintaxe é válida, mas o nome usado no print é diferente. A verificação local aponta o nome e sugere uma escrita parecida.",
    codigo: 'mensagem = "Olá, professor!"\nprint(menssagem)',
    sintaxeValida: true
  },
  {
    titulo: "Erro de lógica — cálculo da média",
    descricao: "A sintaxe passa. Sem parênteses, apenas a segunda nota é dividida por dois.",
    codigo: 'nota1 = 8\nnota2 = 6\nmedia = nota1 + nota2 / 2\nprint("Média:", media)',
    sintaxeValida: true
  },
  {
    titulo: "Ponto e vírgula — uso permitido",
    descricao: "Este código é válido. Em Python, o ponto e vírgula pode separar instruções na mesma linha, mas não é obrigatório no fim de cada linha.",
    codigo: 'nome = "Gabriel"; print(nome)',
    sintaxeValida: true
  }
];
