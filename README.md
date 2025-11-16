# 📦 Projeto: Controlador de Estoque — Simulação de Backend (Mock API)

### Autor
* **José Augusto Francisco** (Front-End)

### Detalhes da Atividade
| Detalhe | Valor |
| :--- | :--- |
| **Disciplina** | Desenvolvimento Web / Programação Orientada a Objetos |
| **Atividade** | Simulação de Sistema Full Stack com Persistência Local |
| **Tipo** | Atividade em grupo |

-----

## 🎯 Objetivo do Projeto

O objetivo deste projeto é construir uma interface **Web de Controle de Estoque** completa e profissional utilizando apenas tecnologias Frontend.

A aplicação simula um sistema Full Stack, onde as operações de banco de dados e autenticação são gerenciadas internamente usando o padrão **Mock API** com persistência de dados via `localStorage`.

### Funcionalidades Principais (CRUD & Relatórios)

O sistema permite que usuários cadastrados realizem a gestão completa do inventário:

* **Acesso Controlado:** Login, Cadastro e Controle de Acesso às abas.
* **Gestão de Produtos:** CRUD de produtos (cadastro de nome, código, valor, estoque mínimo).
* **Gestão de Categorias:** Criação de categorias para organização do inventário.
* **Movimentação:** Registro de **Entradas (Aumento de Estoque)** e **Saídas (Redução de Estoque)**.
* **Relatórios:** Geração de relatórios de Estoque Atual, Logs de Ação e Histórico de Movimentações.

### Ponto Focal Técnico: Simulação de API e Persistência

O desafio técnico deste projeto é criar uma experiência de usuário fluida e persistente sem depender de um servidor externo.

1.  **Mock API:** A classe `ApiClient` simula chamadas assíncronas (`fetch`) para endpoints de API (`/logar`, `/produtos`, `/movimentacao`), mas intercepta os erros e direciona as operações para funções internas que manipulam o estado global.
2.  **Persistência:** O estado do sistema (`MOCK_DATA`) é salvo e carregado do `localStorage` do navegador a cada operação crítica (cadastro, movimentação), garantindo que os dados permaneçam mesmo após o fechamento da página. 

-----

## ⚙️ Tecnologias Utilizadas

Este projeto é totalmente construído em um ambiente de desenvolvimento Web padrão.

| Categoria | Tecnologia | Objetivo |
| :--- | :--- | :--- |
| **Estrutura** | HTML5 | Semântica e Acessibilidade da Interface |
| **Estilização** | CSS3 Puro (Masterpiece Theme) | Design Profissional, Responsivo e Temas (Light/Dark) |
| **Lógica** | JavaScript (ES6+) | Controle de Estado, Manipulação de DOM, Lógica de Negócios e Persistência |
| **Persistência** | `localStorage` | Simulação de Banco de Dados e Login |

## 🧱 Estrutura do Projeto

O projeto é mantido em uma arquitetura de arquivo único, minimizando as dependências externas (exceto as fontes Google).
