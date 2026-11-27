Atue como um Arquiteto de Software Sénior e Engenheiro Full-Stack. Crie a PAYORA, uma plataforma SaaS global de venda de produtos digitais (infoprodutos), gestão de afiliados, área de membros e checkout de alta conversão, inspirada no design e no funcionamento da Cakto.

### 1\. Identidade Visual, Marca (PAYORA) e Navegação

\- Nome da Plataforma: PAYORA (exibir o logótipo tipográfico moderno da PAYORA no topo do menu lateral, nas telas de login/registo, no rodapé seguro do checkout e na área de membros Payora Members).

\- Tema: Dark Mode moderno e focado em conversão:

* Fundo principal: `#0D1117`

* Fundo de cartões, modais e sidebar: `#161B22`

* Bordas subtis: `#30363D`

* Cor de destaque primária: Verde esmeralda vibrante (`#10B981`) para botões de ação, barras de progresso e indicadores de sucesso.

* Tipografia: Inter ou Plus Jakarta Sans.

\- Menu Lateral Esquerdo (Sidebar fixa e responsiva):

* Topo: Logótipo PAYORA + Seletor rápido de Moeda de Visualização + Cartão de Gamificação/Meta de Faturamento ("Faturamento: 0,00 MT / 100.000 MT") com barra de progresso dinâmica em verde.

* Links de Navegação (com ícones minimalistas Lucide):

    * Dashboard

    * Produtos

    * Vitrine (Mercado de Afiliados)

    * Minhas Vendas

    * Assinaturas

    * Financeiro e Saques

    * Integrações e Webhooks

    * Payora Members (Aceder como Aluno)

    * Administração da Plataforma (Taxas, Limites e Configurações Globais)

### 2\. Regras Financeiras: Taxa da Plataforma, Multimoeda, Saques e Garantia

### Taxa Percentual da PAYORA (Monetização da Plataforma)

* Definir uma taxa percentual padrão da plataforma configurável no painel administrativo (ex: 6,99% + taxa fixa por transação, com opção de alterar a percentagem global ou personalizada por produtor).

* Cálculo Automático de Split (Divisão de Pagamento): Em cada venda aprovada, o sistema deve calcular e gravar separadamente na tabela `orders`:

    * `gross_amount` (Valor Bruto pago pelo cliente)

    * `platform_fee` (Taxa retida pela PAYORA)

    * `affiliate_commission` (Comissão do afiliado, se houver)

    * `net_amount` (Valor Líquido creditado ao produtor)

### Sistema Multimoeda Global

\- Suporte nativo para criação de produtos, exibição de checkout e gestão de saldos em:

* Metical Moçambicano (MZN - MT)

* Dólar Americano (USD - $)

* Real Brasileiro (BRL - R$)

* Euro (EUR - €)

* Libra Esterlina (GBP - £)

* Rand Sul-Africano (ZAR - R)

* Kwanza Angolano (AOA - Kz)

* Dólar Canadiano (CAD - C$).

\- O produtor escolhe a moeda principal ao criar cada produto e o checkout exibe automaticamente o símbolo e a formatação correta da moeda selecionada.

### Limites de Saque por Moeda (Configuráveis no Painel Admin)

O sistema deve validar automaticamente se o valor solicitado está dentro do valor mínimo e máximo permitido por transação para cada moeda antes de permitir a solicitação de saque (valores padrão editáveis pelo Super Admin):

| Moeda               | Código | Saque Mínimo | Saque Máximo por Transação |
| ------------------- | ------ | ------------ | -------------------------- |
| Metical Moçambicano | MZN    | 500,00 MT    | 150.000,00 MT              |
| Dólar Americano     | USD    | $20.00       | $10,000.00                 |
| Real Brasileiro     | BRL    | R$ 50,00     | R$ 50.000,00               |
| Euro                | EUR    | €20,00       | €10.000,00                 |
| Libra Esterlina     | GBP    | £20.00       | £10,000.00                 |
| Rand Sul-Africano   | ZAR    | R 300,00     | R 100.000,00               |
| Kwanza Angolano     | AOA    | 10.000,00 Kz | 2.000.000,00 Kz            |
| Dólar Canadiano     | CAD    | C$25.00      | C$10,000.00                |

### Regras de Garantia, Prazo de Liberação e Reembolso

\- Prazo de Garantia por Produto: Ao criar/editar o produto, o produtor define o período de garantia incondicional (opções: 7 dias, 14 dias, 15 dias ou 30 dias). Esse prazo é exibido no selo de garantia do checkout.

### 3\. Autenticação e Perfis de Utilizador (Supabase Auth)

* Telas modernas de Login, Registo e Recuperação de Senha com a identidade visual da PAYORA.

* Um mesmo utilizador pode atuar como Produtor (vender), Afiliado (promover produtos da vitrine), Aluno (aceder aos produtos que comprou) e Super Admin (gerir taxas e limites da plataforma).

### 4\. Módulos e Funcionalidades Completas

### A. Dashboard do Produtor

* Cartões de Métricas (KPIs): Faturamento Líquido, Saldo Disponível para Saque, Saldo Pendente (em garantia), Vendas Aprovadas, Taxa de Reembolso (%) e Taxa de Conversão do Checkout (%) — com filtro por moeda.

* Gráfico Principal: Gráfico de área/linhas em verde mostrando a evolução das vendas diárias (filtros: Hoje, 7 dias, 30 dias).

* Resumo Recente: Lista rápida das últimas 5 vendas com nome do cliente, produto, moeda, valor bruto, taxa descontada, valor líquido e badge de status colorido:

    * Aprovado em verde

    * Pendente em amarelo

    * Reembolsado em roxo/cinza

    * Recusado em vermelho

### B. Gestão de Produtos, Ofertas e Editor de Checkout

\- Listagem de Produtos: Grade de cartões com capa, título, moeda e preço, status (Ativo/Rascunho) e botões rápidos: Editar Produto, Personalizar Checkout e Copiar Link de Venda.

### Criação/Edição de Produto (Abas organizadas)

1\. Dados Gerais:

\- Nome, descrição, categoria, imagem de capa, seletor de Moeda (MZN, USD, BRL, EUR, GBP, ZAR, AOA, CAD), preço principal, Prazo de Garantia (7, 14, 15 ou 30 dias) e tipo de cobrança (Pagamento Único ou Assinatura Recorrente).

2\. Conteúdo (Payora Members):

\- Construtor de Módulos e Aulas (título da aula, URL do vídeo/YouTube/Vimeo, descrição e anexo de PDF/materiais).

3\. Checkout & Conversão:

\- Editor visual para personalizar a cor do botão de compra, adicionar banner superior no checkout, ativar cronómetro de escassez (ex: 15 minutos) e configurar Order Bump (selecionar outro produto para oferecer com 1 clique antes de finalizar a compra).

4\. Afiliação:

\- Interruptor para ativar/desativar afiliação na Vitrine e campo para definir a percentagem de comissão do afiliado (ex: 30% sobre o valor líquido).

5\. Rastreamento (Pixels):

\- Campos para inserir IDs do Meta Pixel (Facebook), TikTok Pixel e Google Analytics.

### C. Página Pública de Checkout (`/checkout/[slug]`)

* Layout One-Page Checkout (Mobile-First): Fundo claro/limpo para máxima confiança do comprador, sem menus de distração.

* Estrutura:

    * Banner opcional no topo.

    * Resumo do produto com foto e preço na moeda configurada.

    * Formulário rápido (Nome Completo, E-mail, WhatsApp).

    * Seleção inteligente de método de pagamento adaptada à moeda/região:

        * M-Pesa e e-Mola para MZN.

        * PIX e Cartão para BRL.

        * Cartão Internacional Visa/Mastercard, Apple Pay e PayPal para USD, EUR e GBP.

    * Caixa destacada de Order Bump (se ativo).

    * Botão de compra de alta visibilidade.

    * Selo dinâmico de Garantia Incondicional de X dias (conforme configurado no produto).

    * Rodapé "Pagamento 100% seguro processado por PAYORA".

\- Lógica de Compra: Ao submeter o formulário, calcula automaticamente a taxa da PAYORA, a comissão do afiliado (se houver), o valor líquido e a data de liberação do saldo (`available_at`), grava na tabela `orders` e redireciona para uma página de Obrigado / Acesso Liberado.

### D. Vitrine de Afiliados e Minhas Vendas

\- Vitrine PAYORA: Galeria pública dentro do painel onde outros utilizadores veem produtos abertos para afiliação (com indicação da moeda, prazo de garantia e valor da comissão), clicam em "Afiliar-se Agora" e recebem um link exclusivo com parâmetro `?ref=ID_AFILIADO`.

\- Minhas Vendas: Tabela completa com filtros por status, moeda, data e produto, mostrando o detalhamento financeiro completo (Bruto, Taxa PAYORA, Comissão Afiliado, Líquido Produtor, Data de Liberação) e botões de ação para aprovar, simular liberação de saldo ou processar Reembolso (respeitando as regras de garantia).

### E. Financeiro e Saques

* Carteira multimoeda exibindo Saldo Disponível, Saldo Pendente (em período de garantia) e Total Já Sacado para cada moeda.

* Exibição clara dos limites mínimos e máximos de saque para a moeda selecionada.

* Formulário para cadastrar conta de recebimento (Número M-Pesa, e-Mola, Chave PIX, IBAN/NIB Bancário ou Conta Internacional) e botão "Solicitar Saque" (bloqueado se o saldo disponível for inferior ao mínimo daquela moeda) com histórico de solicitações e status (Em Análise, Pago, Rejeitado).

### F. Payora Members — Área de Membros Estilo Streaming (`/members`)

* Interface inspirada na Netflix (fundo escuro, logótipo Payora Members, banner de destaque no topo com os cursos adquiridos pelo aluno).

* Player de vídeo limpo com lista lateral de módulos e aulas, botão "Marcar como concluída" com barra de progresso do curso, área para download de materiais de apoio e opção "Solicitar Reembolso" visível apenas enquanto o pedido estiver dentro do prazo de garantia.

* Controle de acesso rigoroso: o aluno só visualiza os produtos cujos pedidos tenham status `approved` (bloqueio imediato se mudar para `refunded`).

### G. Integrações, Webhooks e Painel Admin da Plataforma

Webhooks:

\- Tela para o produtor cadastrar URLs de Webhook de saída e selecionar eventos:

* Carrinho Abandonado

* Pagamento Pendente

* Compra Aprovada

* Reembolso Solicitado/Concluído

Administração PAYORA:

\- Tela restrita ao Super Admin da plataforma para:

* Ajustar a taxa percentual padrão da PAYORA e taxas fixas.

* Editar os limites mínimos e máximos de saque por moeda e o prazo padrão de retenção de garantia.

* Visualizar a receita total acumulada em taxas por moeda.

* Aprovar ou rejeitar solicitações de saque e disputas de reembolso.

### 5\. Arquitetura de Base de Dados (Supabase)

Crie todas as tabelas necessárias no Supabase com relacionamentos e políticas de segurança (RLS) ativadas:

* `profiles` (dados do utilizador, `role: user/admin`, `custom_fee`, dados bancários/carteiras móveis)

* `platform_settings` (taxa percentual global da PAYORA, dias de retenção padrão)

* `currency_limits` (moeda, `min_withdrawal`, `max_withdrawal`, `fixed_fee`)

* `products` (dados do produto, `currency`, `price`, `guarantee_days`, configurações de checkout, pixels, regras de afiliação)

* `modules` e `lessons` (estrutura da área de membros)

* `affiliations` (ligação entre produtor, produto e afiliado)

* `orders` (pedidos com `currency`, `gross_amount`, `platform_fee`, `affiliate_commission`, `net_amount`, `status`, `available_at`, `refunded_at`, `refund_reason`, dados do cliente, método de pagamento, afiliado vinculado)

* `enrollments` (acessos liberados/bloqueados na área de membros vinculados ao `order_id`)

* `withdrawals` (solicitações de saque por moeda, validação de limite e status de aprovação)

* `webhooks` (endpoints configurados pelos produtores)

