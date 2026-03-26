# Auditoria Mobile-First — Página de Listagem (/imoveis)

> **Correções aplicadas em 2025-03-10.** Ver resumo ao final.

**Data:** 2025-03-10  
**Base de referência:** iPhone SE (375px), 390px, 412px  
**Escopo:** Barra de filtros, chips, grid, paginação, espaçamento, hierarquia

---

## ESTRUTURA ATUAL DA PÁGINA

1. **Header** (compartilhado)
2. **Breadcrumb** — Início / Imóveis
3. **Cabeçalho** — h1 + contagem + link "Limpar filtros" (condicional)
4. **Filtros rápidos (chips)** — Oportunidades, Lançamentos, Destaques, Limpar badges
5. **Painel de filtros** — `<details>` colapsável com formulário (cidade, bairro, tipo, quartos, preço min/max)
6. **Grid de imóveis** — `PropertyCard` em lista
7. **Paginação** — Anterior | Página X de Y | Próxima (mobile)
8. **Explorar** — Por cidade, Por tipo (quando sem filtros)
9. **Footer** (compartilhado)

---

## 1. BARRA DE FILTROS (PAINEL `<details>`)

### Problemas identificados

| Problema | Impacto UX/mobile |
|--------|--------------------|
| Summary com `px-5 py-4` (~32px altura) | Área de toque < 44px para "Filtrar imóveis" |
| SVG chevron sem `details-open:rotate-180` consistente | Tailwind `details-open:` pode não estar disponível |
| Formulário com muitos campos visíveis de uma vez | Muito scroll vertical no mobile |

### Solução proposta

- Summary com `min-h-[44px]` e `flex items-center`
- Verificar suporte `group-open` ou usar `[details[open]_&]:rotate-180` para o ícone
- Manter colapsável; campos já estão em grid que empilha no mobile

---

## 2. CHIPS/FILTROS RÁPIDOS

### Problemas identificados

| Problema | Impacto UX/mobile |
|--------|--------------------|
| Chips com `py-2` (~32px) | Altura < 44px recomendado |
| `gap-2` entre chips | Risco de toque no chip adjacente |
| "Limpar badges" com `px-3 py-2 text-xs` | Muito pequeno para toque |
| Chips podem quebrar em 2 linhas com `flex-wrap` | OK para legibilidade, mas aumenta altura |

### Solução proposta

- Chips: `min-h-[44px]`, `py-2.5` no mobile
- `gap-3` entre chips
- "Limpar badges": `min-h-[44px]`, `py-2.5`

---

## 3. CABEÇALHO (H1, CONTAGEM, CTA)

### Problemas identificados

| Problema | Impacto UX/mobile |
|--------|--------------------|
| h1 `text-2xl` no mobile | Pode ser excessivo em 375px; h1 longo quebra em várias linhas |
| CTA "Fale conosco" (quando rendaPreset) com `py-2.5` | ~40px altura |
| Link "Limpar filtros" sem min-height | Pode ficar pequeno para toque |

### Solução proposta

- h1: `text-xl` base, `sm:text-2xl`, `lg:text-3xl`
- CTA: `min-h-[44px]` e `flex items-center`
- "Limpar filtros": `min-h-[44px]` ou `py-3` para área de toque

---

## 4. FORMULÁRIO DE FILTROS (DENTRO DO DETAILS)

### Problemas identificados

| Problema | Impacto UX/mobile |
|--------|--------------------|
| Selects e inputs com `py-2` | Altura ~36px < 44px |
| Checkboxes com `h-4 w-4` | OK para checkbox; label inteiro deve ser clicável |
| Botão "Aplicar filtros" com `py-2.5` | ~40px |
| Grid `sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6` | No mobile empilha em 1 col; OK |

### Solução proposta

- Todos os selects, inputs e botão: `min-h-[44px]`
- Labels com `cursor-pointer` já ampliam área de toque dos checkboxes

---

## 5. GRID DE IMÓVEIS

### Problemas identificados

| Problema | Impacto UX/mobile |
|--------|--------------------|
| `grid gap-5 sm:grid-cols-2 lg:grid-cols-3` | Base sem `grid-cols-1` explícito; garantir 1 col no mobile |
| `mt-8` antes do grid | Espaçamento OK |
| `PropertyCard` já auditado na home | Reaproveita ajustes |

### Solução proposta

- Usar `grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3` (explícito)
- Manter `gap-5` no mobile
- Garantir que não haja `min-width` em pais que force overflow

---

## 6. PAGINAÇÃO

### Problemas identificados

| Problema | Impacto UX/mobile |
|--------|--------------------|
| Botões com `h-10 min-w-[40px]` | 40px < 44px recomendado |
| Mobile mostra "Página X de Y" — OK | Boa simplificação |
| Links Anterior/Próxima no mobile | Só ícone (← e →); área de toque depende do padding |

### Solução proposta

- `min-h-[44px] min-w-[44px]` nos botões de navegação
- Manter texto "Anterior/Próxima" oculto no mobile (`hidden sm:inline`)

---

## 7. BREADCRUMB

### Problemas identificados

| Problema | Impacto UX/mobile |
|--------|--------------------|
| Links com `text-sm` | Legibilidade OK |
| Área de toque | "Início" e "Imóveis" podem ser pequenos |

### Solução proposta

- Adicionar `py-2` ou garantir `min-h-[44px]` no container clicável (breadcrumb costuma ter links pequenos; opcional)

---

## 8. EXPLORAR (POR CIDADE / POR TIPO)

### Problemas identificados

| Problema | Impacto UX/mobile |
|--------|--------------------|
| Links `px-3 py-1` | Muito pequeno para toque (altura ~24px) |
| `flex-wrap gap-2` | Bom para wrapping |

### Solução proposta

- Links: `min-h-[44px]`, `py-2` ou `inline-flex items-center px-4 py-2`

---

## 9. ESTADO VAZIO (NENHUM IMÓVEL)

### Problemas identificados

| Problema | Impacto UX/mobile |
|--------|--------------------|
| Links e botões | Mesmos ajustes de touch target |

---

## 10. OVERFLOW HORIZONTAL

### Verificações

- `main`: `max-w-7xl px-4` — OK, não deve estourar
- Grid: 1 col no mobile — cada card ocupa ~100% da largura útil
- Chips `flex-wrap` — quebram linha, sem overflow
- Formulário: grid 1 col no mobile — sem overflow
- Links "Por cidade" / "Por tipo": `flex-wrap` — OK

### Possível causa de overflow (se observado)

- Algum elemento com `min-width` fixo
- `whitespace-nowrap` em texto longo sem truncate
- Grid sem `grid-cols-1` explícito (fallback inesperado)

---

## RESUMO — PRIORIDADE DE CORREÇÃO

| Prioridade | Área | Ação |
|------------|------|------|
| P0 | Grid | Garantir `grid-cols-1` explícito; verificar overflow |
| P0 | Chips filtros | `min-h-[44px]`, `gap-3` |
| P0 | Summary filtros | `min-h-[44px]` |
| P1 | Paginação | `min-h-[44px] min-w-[44px]` |
| P1 | Formulário | Inputs/selects/botão `min-h-[44px]` |
| P1 | Cabeçalho | h1 `text-xl` base; CTA `min-h-[44px]` |
| P2 | Explorar | Links com `py-2` ou `min-h-[44px]` |
| P2 | Breadcrumb | Opcional `py-2` nos links |

---

## IMPACTO SEO

- **Manter Server Component** — página é server component; nenhuma alteração exige client
- **Estrutura semântica** — h1, nav, ul preservados
- **Links indexáveis** — todos permanecem `<a href>` ou `<Link>`
- **Sem JavaScript para layout** — apenas CSS responsivo
