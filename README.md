# teste-oxeanbits

Teste técnico oxeanbits

# Conteúdos

1. [Execução do backend](#Execução-do-backend)<br>
   1.1 [Requisitos](##Requisitos)<br>
   1.2 [Configurando ambiente local](##Configurando-ambiente-local)<br>
   1.3 [Executando projeto](##Executando-projeto)<br>
2. [Execução do frontend](#Execução-do-frontend)<br>
   2.1 [Requisitos](##Requisitos)<br>
   2.2 [Configurando ambiente local](##Configurando-ambiente-local)<br>
   2.3 [Executando projeto](##Executando-projeto)<br>
2. [Observações](#Observações)<br>

# Execução do backend

## Requisitos

- Ruby v3.1.4
- redis v7.2.4(possivelmente deve funcionar com outras versões)
- sqlite3

## Configurando ambiente local

Para configurar o ambiente local, na pasta backend do repositório, precisamos executar os seguintes comandos:

```console
bundle install
rails db:migrate
rails db:seed
```

Com isso, será configurado uma aplicação rails contando com as seguintes funcionalidades:

- Usuário padrão admin@rotten e senha admin
- Página de login
- Rota para criação de novos usuários
- Rota para cadastrar novo filme
- Rota para dar nota nos filmes
- Rota para importar filmes via arquivo CSV
- Rota para importar notas de filmes via arquivo CSV
- Exibir a média das notas de cada filme

## 1.3 Executando projeto

Para executar o ambiente dev, devemos executar o seguinte comando:

```console
rails server -p 8000
```

**Observação**: estamos executando em uma porta personalizada, visto que o projeto do frontend executará por padrão na porta 3000

Estamos utilizando a lib **Sidekiq** no projeto, e portanto precisamos executá-la separadamente. A lib utiliza o banco **redis** para eventos, então também precisamos deixá-lo executando. Dado isso, temos os seguintes comandos para executar em **terminais diferentes**:

Iniciando **redis-server**

```console
redis-server
```

Iniciando lib **Sidekiq**

```console
bundle exec sidekiq
```

Com isso podemos agora realizar a importação dos arquivos **CSV** em segundo plano.

# 2 Execução do frontend

## 2.1 Requisitos

- NodeJS v18.17.1
- npm v9.6.7

## 2.2 Configurando ambiente local

Executar o comando seguinte comando para instalar as dependências do projeto:

```console
npm i
```

Adicionalmente existe um arquivo chamado **.env.example**, copie este arquivo para um novo chamado **.env**, e substituia o valor da chave **API_URL** pelo endereço da url da api na sua máquina local.

```console
cp .env.example .env
```

## 2.3 Executando projeto

Para executar projeto no ambiente local, podemos executar o seguinte comando agora:

```console
npm run dev
```

Agora basta acessarmos a seguinte rota(se for a padrão) em um navegador de sua escolha:

`127.0.0.1:3000`

# 3 Observações

No projeto **backend**, dentro da pasta **storage**, existem dois arquivos CSVs que são foram os modelos utilizados para o desenvolvimento das rotas APIs nos requisitos do projeto: **movies_data_for_test.csv** e **movies_data_score_for_test.csv**, para filmes e avaliações respecitvamente.
