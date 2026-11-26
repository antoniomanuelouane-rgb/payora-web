# Plano: actualizar a Payora segundo o PDF completo

## Objectivo
Tratar o PDF enviado como a especificação actualizada e evoluir a versão existente, mantendo compatibilidade com os dados e com o checkout PaySuite actual.

## O que será feito
1. **Dados e segurança:** acrescentar, sem apagar campos existentes, as moedas, valores bruto/taxas/comissões/líquido, datas de libertação e reembolso, regras de garantia e estruturas de afiliação, aulas, acessos, webhooks e limites. Proteger os dados por utilizador; manter a função de administrador em registos de função protegidos.
2. **Produtos e vendas:** permitir configurar moeda, garantia e afiliação; mostrar a discriminação financeira das vendas; actualizar o checkout para apresentar a moeda, métodos adequados e o prazo de garantia; calcular as taxas no servidor.
3. **Financeiro:** separar saldos pendentes e disponíveis por moeda e validar os limites mínimo e máximo de saque indicados no PDF. Manter o processamento de saques manual.
4. **Novas áreas:** substituir os atalhos “Em breve” relevantes por páginas para Vitrine/Afiliados, Payora Members, Integrações/Webhooks e Administração, protegendo as acções administrativas por função.
5. **Qualidade:** acrescentar testes para limites, taxas e libertação/reembolso; executar os testes existentes e verificar a experiência principal no navegador.

## Limites e pressupostos
- A implementação preservará MZN e os pagamentos existentes. Métodos internacionais só serão apresentados como pagamentos activos se o gateway configurado os suportar; o PDF não fornece credenciais nem confirmação de suporte do PaySuite para essas moedas.
- A taxa percentual de 6,99% aparece como exemplo configurável, não como valor confirmado; será mantida configurável, sem assumir uma taxa fixa adicional não indicada.
- As tabelas existentes e a autenticação serão preservadas; nenhuma conta será elevada a administrador automaticamente.

## Detalhes técnicos
- Alterações de banco serão migrações aditivas através da ferramenta de base de dados do Lovable Cloud, com grants e RLS em todas as tabelas públicas novas.
- Regras financeiras serão partilhadas entre código e testes; dados sensíveis de administração permanecerão no servidor.
