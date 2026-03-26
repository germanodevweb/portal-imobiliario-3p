# Auditoria Mobile-First — Home

**Data:** 2025-03-22  
**Base de referência:** iPhone SE (375px), 390px, 412px  
**Escopo:** Header, chips/filtros, seção "Imóveis em destaque", cards de imóveis

---

## 1. HEADER E NAVEGAÇÃO MOBILE

### Problemas identificados

| Problema | Impacto UX/mobile |
|--------|--------------------|
| Logo sem texto em mobile (`hidden sm:block`) | Identidade enfraquecida; usuário vê só ícone |
| Botão hamburger com `p-2` (~40px) | Área de toque inferior a 44px recomendado (Apple HIG) |
| Links do menu mobile com `py-3` | OK, mas botão "Fale conosco" precisa de min-height |
| Espaçamento do menu `px-4 py-2` | Menu pode parecer apertado em 375px |

### Solução proposta

- Exibir versão compacta do texto "3Pinheiros" no mobile (sm já esconde; considerar `text-xs` em 390px+).
- Garantir botão hamburger ≥ 44×44px (`min-w-[44px] min-h-[44px]` ou `p-3`).
- Garantir área de toque nos links do menu mobile ≥ 44px altura.
- Manter Header como client component (necessário para menu aberto/fechado).

---

## 2. BARRA DE CHIPS/FILTROS (IncomeFilter)

### Problemas identificados

| Problema | Impacto UX/mobile |
|--------|--------------------|
| Chips com `py-1.5` (~24px altura) | Área de toque menor que 44px |
| `text-xs` em labels longos | "Renda acima de R$ 12.000" pode quebrar ou ficar ilegível |
| Scroll horizontal sem indicação visual | Usuário pode não perceber que há mais chips |
| `gap-2` entre chips | Toque pode ativar chip adjacente |

### Solução proposta

- Aumentar altura dos chips no mobile (`py-2.5` ou `min-h-[44px]`) para toque confortável.
- Manter `overflow-x-auto` e scroll suave.
- Opcional: `-webkit-overflow-scrolling: touch` e `scroll-snap` para UX nativa.
- Aumentar `gap` no mobile para evitar toques acidentais (`gap-3`).

---

## 3. SEÇÃO "IMÓVEIS EM DESTAQUE"

### Problemas identificados

| Problema | Impacto UX/mobile |
|--------|--------------------|
| `py-12` no main | Muito espaço vertical em 375px |
| `text-2xl` no h1 | Pode parecer excessivo; considerar `text-xl` base |
| `mb-8` no bloco título | Margem grande no mobile |

### Solução proposta

- Reduzir `py-12` → `py-8` no mobile, `sm:py-12`.
- h1: `text-xl` base, `sm:text-2xl`.
- Reduzir `mb-8` → `mb-6` no mobile.

---

## 4. CARDS DE IMÓVEIS (PropertyCard)

### Problemas identificados

| Problema | Impacto UX/mobile |
|--------|--------------------|
| `grid-cols-1` já OK | Grid está correto |
| `gap-6` (24px) | Adequado |
| `p-4` no conteúdo | OK |
| `text-xs` em localização e specs | Pode ser difícil de ler em 375px |
| Badges sobre imagem `left-2 top-2` | Podem sobrepor texto em telas pequenas |
| `line-clamp-2` no título | Bom, mas `text-base` pode ser pequeno |

### Solução proposta

- Manter grid 1 coluna no mobile.
- Garantir `min-h-[44px]` na área clicável (card inteiro é link — OK).
- Considerar `text-sm` para localização no mobile em vez de `text-xs`.
- Revisar tamanho dos badges; `px-2 py-0.5 text-xs` pode ser legível.
- Preço `text-base` — manter ou `text-sm` se necessário; preço é CTA visual importante.

---

## 5. CONSISTÊNCIA E OUTROS

- **Padding horizontal:** `px-4` (16px) adequado para 375px.
- **WhatsApp button:** `bottom-6 right-6` pode sobrepor conteúdo; área de toque OK.
- **Footer:** Será auditado na etapa 7; não faz parte do escopo atual.

---

## ESTRATÉGIA DE IMPLEMENTAÇÃO

1. **Header:** Ajustar tamanhos de toque e opcionalmente texto do logo no mobile.
2. **IncomeFilter:** Aumentar altura dos chips e gap para mobile.
3. **Home main:** Reduzir paddings e tamanhos de fonte no mobile.
4. **PropertyCard:** Ajustes leves de tipografia.
5. **PropertyList:** Grid já correto; validar `gap` se necessário.

**Ordem de execução:** Header → IncomeFilter → page.tsx (main) → PropertyCard → PropertyList.
