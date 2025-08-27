# Manual do Usuário - Sistema de Painel de Senhas

## Sumário

1. [Introdução](#introdução)
2. [Primeiros Passos](#primeiros-passos)
3. [Dashboard Principal](#dashboard-principal)
4. [Painel do Atendente](#painel-do-atendente)
5. [Painel Público](#painel-público)
6. [Gerenciamento de Guichês](#gerenciamento-de-guichês)
7. [Gerenciamento de Categorias](#gerenciamento-de-categorias)
8. [Configurações do Sistema](#configurações-do-sistema)
9. [Relatórios](#relatórios)
10. [Solução de Problemas](#solução-de-problemas)

## Introdução

O Sistema de Painel de Senhas é uma solução completa e moderna para gerenciamento de filas de atendimento em consultórios, clínicas, mercados e outros estabelecimentos. O sistema oferece uma interface intuitiva e elegante, com funcionalidades avançadas para otimizar o fluxo de atendimento.

### Principais Funcionalidades

- **Geração automática de senhas** por categorias (Normal, Preferencial, Urgência)
- **Painel público** com exibição em tempo real das senhas chamadas
- **Painel do atendente** para controle completo das chamadas
- **Gerenciamento de guichês** e categorias personalizáveis
- **Sistema de relatórios** com estatísticas detalhadas
- **Configurações flexíveis** de aparência e funcionamento
- **Notificações sonoras** e alertas visuais
- **Interface responsiva** para desktop e mobile

## Primeiros Passos

### Acesso ao Sistema

1. Abra seu navegador web e acesse o endereço do sistema
2. Na tela de login, insira suas credenciais:
   - **Usuário padrão**: admin
   - **Senha padrão**: admin123
3. Clique em "Entrar" para acessar o sistema

### Navegação Principal

O sistema possui uma barra lateral com as seguintes seções:

- **Dashboard**: Visão geral das estatísticas
- **Painel Público**: Tela de exibição para os clientes
- **Atendente**: Controle de geração e chamada de senhas
- **Guichês**: Gerenciamento dos pontos de atendimento
- **Categorias**: Configuração dos tipos de senha
- **Senhas**: Histórico de senhas geradas
- **Relatórios**: Estatísticas e análises
- **Configurações**: Personalização do sistema

## Dashboard Principal

O Dashboard oferece uma visão geral completa do funcionamento do sistema, apresentando as principais métricas em tempo real.

### Estatísticas Principais

O painel principal exibe quatro cartões com informações essenciais:

1. **Total Hoje**: Número total de senhas geradas no dia atual
2. **Aguardando**: Quantidade de senhas na fila de espera
3. **Atendidas**: Número de senhas já finalizadas
4. **Tempo Médio**: Tempo médio de atendimento por senha

### Gráficos e Análises

#### Senhas por Categoria
Mostra a distribuição das senhas geradas por categoria, permitindo identificar qual tipo de atendimento é mais demandado.

#### Performance dos Guichês
Apresenta estatísticas de cada guichê, incluindo:
- Número de senhas atendidas
- Tempo médio de atendimento
- Indicadores de performance

#### Resumo do Dia
Seção com três indicadores principais:
- **Senhas Atendidas**: Total de atendimentos concluídos
- **Senhas Perdidas**: Senhas que não foram atendidas
- **Na Fila**: Senhas aguardando atendimento

## Painel do Atendente

O Painel do Atendente é o coração operacional do sistema, onde os funcionários gerenciam a geração e chamada de senhas.

### Geração de Senhas

Para gerar uma nova senha:

1. **Selecione a Categoria**: Clique no dropdown "Categoria" e escolha entre:
   - **Normal (N)**: Atendimento padrão
   - **Preferencial (P)**: Idosos, gestantes, pessoas com deficiência
   - **Urgência (U)**: Casos emergenciais

2. **Clique em "Gerar Senha"**: O sistema criará automaticamente uma nova senha com numeração sequencial

3. **Confirmação**: Uma mensagem de sucesso será exibida e a senha aparecerá na fila de espera

### Chamada de Senhas

Para chamar uma senha:

1. **Selecione o Guichê**: Escolha qual guichê fará o atendimento
2. **Chamar Próxima**: Clica no botão para chamar a próxima senha da fila (respeitando a prioridade)
3. **Chamar Específica**: Use o botão "Chamar" ao lado de uma senha específica na fila

### Controle de Atendimento

Quando uma senha está sendo atendida, você pode:

- **Finalizar**: Marca o atendimento como concluído
- **Perdida**: Marca a senha como perdida (cliente não compareceu)

### Fila de Espera

A fila mostra todas as senhas aguardando atendimento, ordenadas por:
1. Prioridade da categoria (Urgência > Preferencial > Normal)
2. Ordem de geração

Cada item da fila exibe:
- Posição na fila
- Número da senha
- Categoria
- Horário de geração
- Botão para chamada específica

## Painel Público

O Painel Público é a tela que os clientes visualizam, mostrando as informações de chamada em tempo real.

### Layout da Tela

#### Cabeçalho
- Nome do sistema
- Data e hora atual
- Controle de som (ativar/desativar)

#### Senha Atual
Seção principal que exibe:
- Número da senha sendo chamada (em destaque com animação)
- Guichê responsável pelo atendimento
- Categoria da senha

#### Últimas Senhas Chamadas
Grid com as 5 últimas senhas chamadas, mostrando:
- Número da senha
- Guichê de atendimento
- Categoria

#### Mensagem Personalizada
Área para exibir avisos importantes, como:
- "Usar máscara obrigatório"
- "Promoção do dia"
- "Horário de funcionamento"

### Recursos Visuais

- **Animação pulsante** na senha atual para chamar atenção
- **Cores diferenciadas** por categoria de senha
- **Fonte grande** e legível para visualização à distância
- **Modo escuro/claro** configurável
- **Layout responsivo** para diferentes tamanhos de tela

### Notificações Sonoras

O sistema emite alertas sonoros quando:
- Uma nova senha é chamada
- Há mudança na senha atual
- Configurável nas configurações do sistema

## Gerenciamento de Guichês

Esta seção permite configurar e gerenciar os pontos de atendimento.

### Visualização dos Guichês

A tela apresenta todos os guichês em formato de cards, mostrando:
- Nome do guichê
- Status (Ativo/Inativo)
- Data de criação
- Descrição (se houver)

### Criar Novo Guichê

1. Clique em "Novo Guichê"
2. Preencha as informações:
   - **Nome**: Ex: "Guichê 01", "Caixa 01", "Recepção"
   - **Descrição**: Informações adicionais (opcional)
   - **Status**: Ativo/Inativo
3. Clique em "Criar"

### Editar Guichê

1. Clique no ícone de edição no card do guichê
2. Modifique as informações desejadas
3. Clique em "Atualizar"

### Ativar/Desativar Guichê

- Use o botão "Ativar/Desativar" no card do guichê
- Guichês inativos não aparecem nas opções de chamada

### Excluir Guichê

1. Clique no ícone de lixeira no card do guichê
2. Confirme a exclusão na janela de confirmação
3. **Atenção**: Esta ação não pode ser desfeita

## Gerenciamento de Categorias

Configure os tipos de senha disponíveis no sistema.

### Visualização das Categorias

Cada categoria é exibida em um card contendo:
- Nome da categoria
- Prefixo (letra que aparece na senha)
- Nível de prioridade
- Cor identificadora
- Status (Ativa/Inativa)

### Criar Nova Categoria

1. Clique em "Nova Categoria"
2. Preencha os campos:
   - **Nome**: Ex: "VIP", "Retorno", "Primeira Consulta"
   - **Prefixo**: Máximo 3 caracteres (Ex: "V", "R", "PC")
   - **Prioridade**: 
     - 1 = Normal
     - 2 = Preferencial  
     - 3 = Urgência
   - **Cor**: Escolha uma cor para identificação visual
   - **Status**: Ativa/Inativa
3. Clique em "Criar"

### Editar Categoria

1. Clique no ícone de edição no card da categoria
2. Modifique as informações
3. Clique em "Atualizar"

### Sistema de Prioridades

As senhas são chamadas respeitando a seguinte ordem:
1. **Urgência (Prioridade 3)**: Chamadas primeiro
2. **Preferencial (Prioridade 2)**: Chamadas em segundo
3. **Normal (Prioridade 1)**: Chamadas por último

Dentro da mesma prioridade, vale a ordem de geração (primeiro gerado, primeiro chamado).

## Configurações do Sistema

Personalize o funcionamento e aparência do sistema.

### Aba Painel

#### Configurações de Exibição
- **Tema**: Claro ou Escuro
- **Intervalo de Atualização**: Frequência de refresh do painel (recomendado: 3000ms)
- **Últimas Senhas Exibidas**: Quantas senhas mostrar no histórico (3-10)

#### Mensagem Personalizada
- Campo de texto para mensagem exibida no painel público
- Suporte a múltiplas linhas
- Exemplos: avisos, promoções, informações importantes

### Aba Áudio

#### Configurações de Som
- **Habilitar Sons**: Liga/desliga notificações sonoras
- **Volume**: Controle de 0% a 100%
- **Timeout de Chamada**: Tempo limite para resposta (10-120 segundos)

### Aba Aparência

#### Personalização de Cores
Configure as cores do sistema:
- **Cor Primária**: Cor principal da interface
- **Cor Secundária**: Cor de apoio
- **Cor de Destaque**: Para elementos importantes
- **Cor de Fundo**: Fundo do painel público

Cada cor pode ser selecionada via:
- Seletor visual de cores
- Código hexadecimal (#RRGGBB)

### Aba Geral

#### Informações da Unidade
- **Nome da Unidade**: Nome do estabelecimento
- **Descrição**: Informações adicionais sobre a unidade

### Salvamento das Configurações

1. Faça as alterações desejadas
2. Clique em "Salvar Configurações"
3. As mudanças são aplicadas imediatamente
4. Use "Restaurar Padrão" para voltar às configurações originais

## Relatórios

*Esta funcionalidade será implementada na próxima versão do sistema.*

Os relatórios incluirão:
- Estatísticas por período
- Performance dos guichês
- Análise de categorias
- Tempo médio de atendimento
- Exportação em PDF e Excel

## Solução de Problemas

### Problemas Comuns

#### Sistema não carrega
1. Verifique a conexão com a internet
2. Limpe o cache do navegador
3. Tente acessar em modo anônimo/privado
4. Contate o suporte técnico

#### Senhas não aparecem no painel público
1. Verifique se o painel está configurado corretamente
2. Confirme se há senhas na fila
3. Verifique o intervalo de atualização nas configurações
4. Recarregue a página do painel público

#### Som não funciona
1. Verifique se o som está habilitado nas configurações
2. Confirme o volume do sistema
3. Teste em outro navegador
4. Verifique as permissões de áudio do navegador

#### Não consegue fazer login
1. Verifique as credenciais:
   - Usuário: admin
   - Senha: admin123
2. Certifique-se de que não há espaços extras
3. Tente recarregar a página
4. Limpe os cookies do navegador

### Contato para Suporte

Para suporte técnico ou dúvidas adicionais:
- Email: suporte@sistema-senhas.com
- Telefone: (11) 9999-9999
- Horário: Segunda a Sexta, 8h às 18h

---

**Versão do Manual**: 1.0  
**Data de Atualização**: 26/08/2025  
**Desenvolvido por**: Manus AI

