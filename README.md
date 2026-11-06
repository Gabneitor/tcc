# Corretor Pyton

Assistente simples para estudar código Python: verificar a sintaxe, receber uma explicação em português e consultar sugestões de correção pela Groq. Projeto acadêmico feito com HTML, CSS e JavaScript, sem framework, servidor próprio ou banco de dados.

## Abrir o projeto

1. Baixe a pasta e mantenha os arquivos juntos.
2. Abra `index.html` em um navegador atualizado, com internet.
3. Selecione um exemplo e clique em **Verificar sintaxe**. Não precisa de chave.
4. Para usar a IA, clique em **Adicionar chave de API**, cole sua chave da Groq e salve.
5. Clique em **Explicar e sugerir correções com IA**.

Não é necessário instalar Python. O Pyodide carrega o Python no navegador pela internet; o primeiro carregamento pode levar alguns segundos, dependendo da conexão. O assistente não executa o código digitado.

## Criar e usar a chave

Crie uma chave no [Groq Console](https://console.groq.com/keys). O modelo configurado em `groq.js` é `openai/gpt-oss-20b`, hospedado pela Groq e listado no [plano gratuito](https://console.groq.com/docs/rate-limits). Confira os limites da sua conta; o aplicativo não altera planos nem configura faturamento. Essa chave é da Groq, independente de uma assinatura do ChatGPT. A antiga chave do Gemini não é reutilizada.

A chave é armazenada em **localStorage**: armazenamento local persistente, não o cache de arquivos do navegador. Ela permanece após recarregar a página e fechar o navegador, até ser removida ou os dados do site serem apagados. O campo é mascarado por padrão e há botões para mostrar e remover a chave. Salvar a chave não testa sua validade.

No popup da chave, **Testar conexão** envia uma pergunta curta: quanto é 1 + 1? Usa a chave que está no campo e o mesmo modelo da análise, em uma única tentativa com limite de um minuto. Não envia o código do editor nem exige a resposta JSON da análise. O teste não salva a chave e pode consumir cota. Fechar o popup interrompe a espera local. O sucesso confirma uma resposta simples naquele momento; não garante o sucesso da análise completa.

Essa opção foi escolhida para uma demonstração em que cada visitante fornece a chave. **Não é um cofre:** a chave fica sem criptografia e pode ser acessada por quem controla aquele perfil do navegador. Não coloque uma chave do autor dentro dos arquivos JavaScript ou no repositório. Se compartilhar uma chave com a banca, prefira uma exclusiva para a demonstração e revogue-a depois. Uma chave incluída em um PDF também pode ser copiada e reutilizada.

No uso da IA, o navegador envia a chave no cabeçalho HTTPS `Authorization: Bearer ...` diretamente à Groq, junto de uma solicitação com o código e o diagnóstico de sintaxe. A chave não é colocada na URL nem no texto do pedido à IA. O aplicativo não salva códigos ou respostas. Consulte a [política de dados da Groq](https://console.groq.com/docs/your-data) e use exemplos didáticos sem dados confidenciais.

## O que cada botão faz

- **Verificar sintaxe:** carrega o Python e compila o trecho para verificar a escrita, sem executar. Mostra o primeiro erro, sua linha, a mensagem original do Python e uma dica em português. Se a sintaxe for válida, também procura possíveis nomes não definidos no código principal e sugere nomes parecidos, sem API. Por exemplo, aponta `su` → `sum` e `mediaa` → `media` no exemplo de média alterado.
- **Explicar e sugerir correções com IA:** verifica a sintaxe, envia o trecho à Groq e mostra explicação, problemas, código sugerido e uma pergunta de compreensão. A sugestão também passa pelo compilador quando está dentro do limite.
- **Copiar código sugerido:** copia a sugestão. Se o navegador bloquear a área de transferência, seleciona o código e orienta a copiar manualmente.
- **Limpar:** limpa código e resultados; mantém a chave. Para apagá-la, use **Gerenciar chave de API → Remover chave**.

Ao editar ou trocar o exemplo, os resultados antigos são ocultados. Durante uma análise, os controles ficam temporariamente desativados para evitar consultas duplicadas e resultados de um código diferente.

## Exemplos incluídos

| Exemplo | Verificação de sintaxe | O que observar |
| --- | --- | --- |
| Média de notas correta | Passa | Explicação de listas, média e condição. |
| Colchete não fechado | Falha | Falta `]` na lista. |
| Falta de dois-pontos | Falha | Falta `:` no `if`. |
| Indentação incorreta | Falha | Corpo do `for` sem recuo. |
| Nome de variável diferente | Passa, com aviso de nome | A checagem local sugere `mensagem` no lugar de `menssagem`. |
| Cálculo da média incorreto | Passa | Faltam parênteses para somar antes de dividir. |
| Ponto e vírgula | Passa | Python permite separar instruções com `;`, mas geralmente não o exige ao final da linha. |

## Limitações

- O foco é Python. Não há identificação automática confiável da linguagem digitada.
- Limite de 10.000 unidades UTF-16 e 200 linhas, para trabalhar com exemplos curtos. O contador de caracteres usa o tamanho das strings JavaScript.
- Sintaxe válida não garante que o código funcione. Variáveis inexistentes, divisões por zero e erros de lógica podem passar pelo compilador.
- A checagem adicional de nomes é estática e limitada ao código principal: não analisa funções, classes, lambdas, compreensões nem anotações de tipos. Não verifica ordem de atribuição, caminhos condicionais, atributos ou nomes criados dinamicamente. Uma importação com `*` desativa essa checagem. Os avisos e as sugestões por semelhança precisam ser revisados; ausência de avisos não garante ausência de erros.
- A IA pode inventar problemas ou sugerir correções erradas. A aprovação da sintaxe de uma sugestão não valida a lógica ou a segurança.
- Pyodide `314.0.7` é carregado do jsDelivr. A verificação depende desse download; o cache do navegador pode ajudar, mas não há garantia de funcionamento offline.
- A explicação exige internet, chave válida e cota disponível. A consulta à Groq tem limite total de 60 segundos, incluindo uma possível nova tentativa. Se o primeiro pedido retornar HTTP 503, o aplicativo espera 3 segundos e repete o mesmo pedido uma única vez, avisando na tela. Outros erros não geram repetição automática. A nova tentativa pode contar nos limites de uso da conta e não garante resposta enquanto houver sobrecarga.
- Em caso de falha, a tela mostra o código HTTP, o modelo e o detalhe retornado pela Groq, quando disponível. HTTP 500 indica erro interno; 503, serviço sobrecarregado ou indisponível; 504, prazo de resposta excedido no servidor. A troca de modelo não garante que falhas do serviço sejam resolvidas.

## Testar

Abra `testes/index.html` e clique em **Executar testes**. A suíte verifica os exemplos com o compilador Python real, a atualização dos avisos após editar e corrigir nomes, a separação entre nomes do código principal e de escopos internos, a ausência de execução do código digitado, o formato das respostas e o tratamento de falhas. As chamadas da Groq são simuladas e não consomem créditos.

Para conferir a integração real, configure sua chave na tela principal e analise os exemplos. Verifique se as explicações fazem sentido, se a sugestão corrige o problema sem mudar a intenção e se o aviso de sintaxe corresponde ao código. A suíte simulada não comprova qualidade das respostas nem aceitação da chave pela Groq.

## Publicar no GitHub

Envie `index.html`, `style.css`, `exemplos.js`, `sintaxe.js`, `groq.js`, `script.js`, `.gitignore` e `.nojekyll`. As pastas `docs/` e `testes/`, os PDFs e este `README.md` ficam somente na cópia local e estão no `.gitignore`. O README público será escrito posteriormente. O `.gitignore` não impede envio manual pelo navegador. Não envie chaves.

Para disponibilizar a página, em **Settings → Pages**, escolha **Deploy from a branch**, a branch `main` e a pasta **/(root)**. O `index.html` deve estar na raiz. O orientador poderá abrir o link e informar a chave no popup. Cada navegador e endereço do site têm seu próprio armazenamento: a chave salva no arquivo local não é transferida automaticamente para o site publicado.

Caso o navegador tenha restrições a arquivos locais, também é possível servir a pasta com `python3 -m http.server 8000 --bind 127.0.0.1` e abrir `http://localhost:8000`. Esse servidor apenas entrega os arquivos; a API continua sendo consultada pelo navegador.

## Referências técnicas

- [Groq: geração de conteúdo](https://console.groq.com/docs/text-chat).
- [Groq: respostas estruturadas](https://console.groq.com/docs/structured-outputs).
- [Pyodide: início rápido](https://pyodide.org/en/stable/usage/quickstart.html).
- [Python: função compile](https://docs.python.org/3/library/functions.html#compile).
- [GitHub Pages: criar um site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

O código e a documentação foram elaborados com apoio de IA generativa. Revise, teste e compreenda o projeto antes de apresentá-lo.
