# Guia 2/7 — Tabela de testes e decisões de interface

> Preencham as colunas **resultado observado**, **aprovado?** e **evidência**
> depois de testar de verdade no navegador (prints, aba Network do DevTools).
> Se algo diferir do esperado, registrem a descoberta e justifiquem o ajuste.

## Tabela de testes

| # | Caso | Procedimento / entrada | Resultado esperado | Resultado observado | Aprovado? | Evidência / observação |
|---|------|------------------------|--------------------|---------------------|-----------|------------------------|
| 1 | Nome conhecido | Campo de nome: `agumon` | Cartão com Agumon (imagem, nome, ID, nível, tipo, atributo) | | | |
| 2 | ID conhecido | Campo de ID: `1` | Cartão com o Digimon de ID 1 | | | |
| 3 | Capitalização diferente | Campo de nome: `AgUmOn` | Mesmo resultado do caso 1 | | | |
| 4 | Espaços extras | Campo de nome: `  agumon  ` | Mesmo resultado do caso 1 | | | |
| 5 | Nome com espaço no meio | Campo de nome: `war greymon` | Cartão do WarGreymon ou "nenhum encontrado" (registrar o que a API faz) | | | |
| 6 | Campo de nome vazio | Enviar vazio / só espaços | Mensagem "Digite o nome de um Digimon."; sem chamada à API | | | |
| 7 | Campo de ID vazio | Enviar vazio | Mensagem "Digite o ID de um Digimon."; sem chamada à API | | | |
| 8 | Nome sem resultado | `xyz123` | Cartão escondido + "Nenhum Digimon encontrado com o nome ..." | | | |
| 9 | ID sem resultado | `999999` | Cartão escondido + "Nenhum Digimon encontrado com o ID ..." | | | |
| 10 | ID inválido | `abc`, `-1`, `1.5`, `0` | Mensagem explicando que o ID deve ser número inteiro maior que zero | | | |
| 11 | Número no campo de nome | `123` no campo de nome | Mensagem orientando a usar o campo de ID | | | |
| 12 | Duas buscas seguidas | `agumon` e depois `gabumon` | Cartão só com dados do Gabumon (nada do Agumon) | | | |
| 13 | Busca válida depois de inválida | `xyz123` e depois `agumon` | Mensagem de erro some e o cartão aparece | | | |
| 14 | Atualização sem recarregar | Fazer uma busca e observar a aba | A página não recarrega; só o cartão muda | | | |
| 15 | Enter no teclado | Digitar e apertar Enter | Mesmo efeito do clique no botão | | | |
| 16 | Favoritar | Buscar um Digimon e clicar em "Favoritar" | O Digimon exibido aparece em Favoritos | | | |

## Decisões de interface (rascunho para o grupo revisar)

- **Mesmo cartão (`.digimon`)**: reaproveitamos a estrutura visual existente; só os textos e a imagem mudam via JavaScript.
- **Campos do cartão**: imagem, nome, ID, nível, tipo e atributo. O ID aparece para confirmar a busca por ID. Se a API não trouxer um campo, o cartão mostra "Desconhecido" (ou "Sem imagem").
- **Dois campos de busca**: nome e ID têm entradas e validações diferentes (ID só aceita número inteiro positivo; nome não pode ser só número), então ficam em formulários separados.
- **Mensagens abaixo do título "Resultado da pesquisa"**: o mesmo espaço mostra a dica inicial, "Buscando...", erros de validação e "nenhum resultado".
- **Sem dados antigos**: a cada pesquisa o cartão é escondido e esvaziado antes de qualquer resposta; respostas atrasadas de buscas antigas são ignoradas.
- **Valores da API em inglês** (ex.: Rookie, Reptile): mantidos como a API devolve.
