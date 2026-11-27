# Payora 

Crie a Payora, uma plataforma de venda de produtos digitais para Moçambique (estilo Kiwify), toda em português de Moçambique e com moeda principal MZN (metical).

IDENTIDADE
- Nome: Payora. Estilo confiável e profissional.
- Cores: verde claro #0DF28F, verde esmeralda #00A862, preto #050505, branco #FFFFFF. Degradê verde (#0DF28F para #00A862) nos botões principais.
- Logo: letra P estilizada com dobra em degradê verde, ao lado do texto PAYORA em branco, sem serifa e em maiúsculas. Crie um placeholder em SVG simples para o logo, que será trocado depois.

LAYOUT DO PAINEL (referência: dashboard da Kiwify)
- Topo: barra verde esmeralda com logo, e-mail do utilizador, barra de progresso de faturamento (MZN 0 / MZN 10K) e avatar.
- Menu lateral escuro (#0B1F17) com ícones: Dashboard, Produtos, Área de Membros, Marketplace, Meus Afiliados, Vendas, Assinaturas, Financeiro, Relatórios, Colaboradores, Apps, Ajuda. Só Dashboard, Produtos, Vendas e Financeiro funcionam agora; os outros abrem uma página "Em breve".
- Dashboard: título e três filtros (período: Hoje, 7 dias, 30 dias; produto: Todos os produtos; moeda: MZN/USD). Gráfico de vendas do período e cards brancos com: Valor líquido, Vendas, Aprovação cartão, Vendas 1-click, Reembolso, Conversão (M-Pesa/e-Mola), Chargeback, Pagamentos gerados. Todos com dados reais do banco, começando em zero.

FUNCIONALIDADES DA FASE 1
1. Cadastro e login de produtores (e-mail e senha).
2. Produtos: criar, editar, ativar/desativar. Campos: nome, descrição, preço em MZN, imagem, link de entrega (ficheiro ou URL).
3. Página pública de checkout por produto (/checkout/:id): dados do cliente (nome, e-mail, telemóvel), escolha do método: M-Pesa, e-Mola, mKesh ou cartão Visa/Mastercard (para clientes estrangeiros).
4. Vendas: lista com estado (pendente, aprovada, recusada, reembolsada), cliente, produto, valor, método e data.
5. Financeiro: saldo disponível, saldo pendente e pedidos de saque (apenas registo, sem pagamento automático).

BACKEND
- Usar o backend integrado (base de dados e autenticação), com tabelas para perfis, produtos, pedidos e saques, e segurança por linha para que cada produtor veja só os seus dados.
- Pagamentos: preparar a integração com o gateway PaySuite (Moçambique) através de uma função de servidor que cria o pagamento, redireciona o cliente para o checkout do gateway e recebe webhook/consulta de estado. O token da PaySuite deve ficar em segredo no servidor. Enquanto não houver token, usar modo de teste simulado.

Design responsivo, limpo e moderno.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8232617a-8b35-41ec-ae37-f907ff305268).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
