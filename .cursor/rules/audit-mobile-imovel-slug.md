# Auditoria Mobile-First — Página Individual do Imóvel (/imoveis/[slug])

> **Data:** 2025-03-10  
> **Correções aplicadas:** 2025-03-10  
> **Base de referência:** 375px (iPhone SE)  
> **Escopo:** Galeria, título, preço, características, descrição, CTAs, sidebar, espaçamento, overflow

---

## ESTRUTURA ATUAL DA PÁGINA

1. **Header** (compartilhado)
2. **Breadcrumb** — Início / Imóveis / Cidade / (Bairro?) / Título
3. **Imagem principal** — aspect-video, badges (Vendido, Destaque, Lançamento, Oportunidade)
4. **Galeria de imagens** — grid 4 colunas no mobile, 6 no desktop (até 6 thumbnails)
5. **Grade principal** — grid-cols-1 no mobile, conteúdo empilhado:
   - **Coluna principal:** tipo • transação, h1, localização, preço
   - **Métricas:** área, quartos, banheiros, vagas
   - **Descrição** — "Sobre o imóvel"
   - **Tour virtual** — iframe YouTube (se existir)
   - **Sidebar:** CTA (Solicitar informações, WhatsApp), Explorar região
6. **Imóveis semelhantes** — PropertyList grid
7. **Bloco Consultoria** — texto + 2 CTAs
8. **Footer** (compartilhado)

**Nota:** Esta página **não possui formulário de lead**; os CTAs são links para /contato e WhatsApp.

---

## 1. GALERIA DE IMAGENS

### Problemas identificados

| Problema | Código atual | Impacto UX/mobile |
|----------|--------------|-------------------|
| `grid-cols-4` no mobile | ~84px por thumbnail em 375px | Thumbnails muito pequenos; difícil visualizar detalhes; área de toque inadequada se forem clicáveis |
| Sem carrossel/lightbox | Apenas grid estático | Usuário não amplia imagens; galeria não explorável no mobile |
| `gap-2` (8px) | Margem entre thumbnails | Em 4 colunas, cada célula fica apertada |
| Até 6 imagens fixas | `.slice(0, 6)` | Sem "ver mais"; scroll vertical se muitas imagens |
| `sizes="(max-width: 640px) 25vw"` | Imagem ~94px | LCP da principal já com priority; thumbnails carregam lazy — OK |

### Impacto UX

- Em 375px, 4 colunas produzem miniaturas de ~84×47px — praticamente ilegíveis.
- Usuário espera ver fotos do imóvel com clareza; thumbnail tiny frustra.
- Sem interação (toque para ampliar), a galeria é apenas decorativa.

### Solução proposta

- **Mobile (< 640px):** usar `grid-cols-2` ou `grid-cols-3` para thumbnails maiores (~160px ou ~110px).
- **Alternativa avançada:** carrossel horizontal com scroll nativo (`overflow-x-auto`, scroll-snap) ou lightbox ao toque (Client Component opcional, sem quebrar SEO).
- Manter `gap-2` ou `gap-3`; aumentar para 2–3 colunas melhora tamanho sem alterar demais o layout.

---

## 2. TÍTULO, PREÇO E BADGES

### Problemas identificados

| Problema | Código atual | Impacto UX/mobile |
|----------|--------------|-------------------|
| h1 `text-2xl` (24px) no mobile | `sm:text-3xl` | Títulos longos quebram em 3–4 linhas; domina a tela |
| Preço em `flex-wrap` com título | `justify-between gap-3` | Em mobile, preço pode ir para linha seguinte; hierarquia quebrada |
| Badges na imagem com `px-2.5 py-1 text-xs` | Área ~24×20px | Não são toque; OK como indicador visual |
| `line-clamp-1` no breadcrumb | Só no último item | Título longo no breadcrumb truncado — aceitável |
| Ordem: imagem → galeria → título | Conteúdo principal “abaixo da dobra” | Em 375×812, imagem + galeria ocupam ~400px; título só aparece após scroll |

### Impacto UX

- Usuário rola para ver preço e título; informação principal fora da dobra.
- Título muito grande em várias linhas cansa a leitura.
- Preço em linha separada no mobile pode parecer desconectado do imóvel.

### Solução proposta

- h1: `text-xl` base, `sm:text-2xl`, `lg:text-3xl` — reduz dominância no mobile.
- Garantir que preço e título fiquem visualmente unidos: `flex-col` no mobile, preço logo abaixo do título.
- Badges: manter como estão (apenas visuais).
- Considerar sticky CTA ou destaque de preço ao scroll para manter conversão.

---

## 3. BLOCO DE CARACTERÍSTICAS (quartos, banheiros, área, vagas)

### Problemas identificados

| Problema | Código atual | Impacto UX/mobile |
|----------|--------------|-------------------|
| `flex flex-wrap gap-4` | Itens em linha, quebram | Layout OK |
| Cada item `flex-col items-center` | Número + label | Hierarquia clara |
| Sem ícones | Só texto | Legibilidade OK; ícones opcionais |
| `border-y py-4` | Separação visual | OK |
| `text-xs` nos labels | 12px | Legível em mobile |

### Impacto UX

- Bloco funciona bem em mobile.
- Múltiplos itens (ex.: área + 4 quartos + 3 banheiros + 2 vagas) podem ocupar 2 linhas; aceitável.

### Solução proposta

- Manter estrutura.
- Opcional: `gap-6` no mobile para respirar melhor entre itens.

---

## 4. DESCRIÇÃO

### Problemas identificados

| Problema | Código atual | Impacto UX/mobile |
|----------|--------------|-------------------|
| `text-sm leading-relaxed` | 14px, 1.625 line-height | Leitura OK, mas texto denso |
| `whitespace-pre-line` | Preserva \n do CMS | Parágrafos quebrados; pode faltar `margin-bottom` entre blocos |
| Sem subheadings ou listas | Texto corrido | "Parede de texto"; difícil escanear |
| Container `px-4` no main | 16px cada lado | No limite; 20px seria mais confortável |
| h2 "Sobre o imóvel" `text-base` | 16px | OK |

### Impacto UX

- Descrições longas viram bloco único; usuário desiste de ler.
- Falta de hierarquia (negrito, listas, espaçamento entre parágrafos) piora escaneabilidade.

### Solução proposta

- Aumentar `leading-relaxed` ou `leading-7` no mobile.
- Adicionar `space-y-4` ou similar entre parágrafos quando `whitespace-pre-line` gerar múltiplos blocos (ex.: `split('\n\n')` e envolver em `<p>`).
- Manter h2; não alterar estrutura semântica.
- Avaliar `max-w-prose` na descrição para limite de largura de linha (~65ch) em telas maiores.

---

## 5. BOTÕES DE AÇÃO (WhatsApp, Solicitar informações)

### Problemas identificados

| Problema | Código atual | Impacto UX/mobile |
|----------|--------------|-------------------|
| `py-2.5` nos Links/anchors | ~40px altura | Abaixo de 44px recomendado |
| Sidebar após todo o conteúdo | No mobile, grid-cols-1 | CTAs aparecem só após imagem, galeria, título, características, descrição, vídeo |
| "Solicitar informações" e WhatsApp | `rounded-full px-4 py-2.5` | Área de toque insuficiente |
| Links "Explorar região" | `flex gap-2`, `text-sm` | Altura ~24px; muito pequeno para toque |

### Impacto UX

- CTAs principais longe da dobra; usuário precisa rolar bastante para contatar.
- Botões com menos de 44px aumentam erros de toque.
- Links secundários ("Explorar região") pequenos e difíceis de acertar.

### Solução proposta

- Botões: `min-h-[44px]`, `flex items-center justify-center`, manter `py-2.5` ou `py-3`.
- Reposicionar sidebar no mobile: CTAs logo após título/preço ou características (acima da descrição longa).
- Links "Explorar região": `min-h-[44px]` ou `py-2.5` nos itens da lista.
- Considerar CTA fixo/sticky (ex.: barra com WhatsApp) após certo scroll.

---

## 6. FORMULÁRIO DE LEAD

### Status

- **Não há formulário de lead** nesta página.
- CTAs são links para `/contato` e WhatsApp.
- Se no futuro for incluído `LeadForm`, aplicar as mesmas regras da auditoria de /imoveis: `min-h-[44px]` em inputs, selects e botão.

---

## 7. ESPAÇAMENTO E HIERARQUIA VISUAL

### Problemas identificados

| Problema | Código atual | Impacto UX/mobile |
|----------|--------------|-------------------|
| `main px-4` | 16px | Mínimo aceitável; 20px (px-5) melhora conforto |
| `gap-10` entre coluna e sidebar | No mobile, vira espaço vertical | OK |
| `mt-8` antes da grade principal | Separação imagem/galeria do conteúdo | Pode ser `mt-6` no mobile para紧凑 |
| Breadcrumb `mb-6 gap-2` | Compacto | Links próximos; risco de toque errado |
| Bloco Consultoria `p-6 sm:p-8` | Bom padding | OK |

### Solução proposta

- main: `px-4 sm:px-6` ou `px-5 sm:px-6` para mobile.
- Breadcrumb: `gap-2` ou `gap-3`; garantir área de toque nos links (ex.: `py-1` ou tap area via padding no `<a>`).

---

## 8. OVERFLOW HORIZONTAL

### Verificações

| Elemento | Risco |
|----------|-------|
| `main max-w-7xl px-4` | OK |
| Breadcrumb `flex-wrap` | OK; quebra linha |
| Título h1 | Pode estourar se não houver `break-words`; atualmente não há |
| Preço `whitespace-nowrap` em PropertyCard | No similar properties; não nesta página |
| Galeria `grid-cols-4` | Não gera overflow; célula encolhe |
| Descrição | Texto quebra normalmente |

### Possíveis causas

- Títulos extremamente longos sem quebra.
- URLs ou texto sem espaço em breadcrumb (improvável).
- Valores monetários muito longos (improvável em BRL).

### Solução proposta

- h1: `break-words` para títulos longos.
- Conferir breadcrumb com muitos níveis em telas muito estreitas.

---

## 9. ELEMENTOS ACIMA DA DOBRA (375×667 ou 375×812)

### Conteúdo visível estimado

- Header: ~56–64px
- Breadcrumb: ~40px
- Imagem principal (aspect-video 16:9): ~211px em 375px
- Galeria (1 linha): ~70px
- **Total:** ~377–385px

Em 375×812 (iPhone), a dobra fica por volta de 375–400px. Logo:
- **Título, preço e CTAs ficam abaixo da dobra.**
- Usuário precisa rolar para ver identificação e ação principal.

### Solução proposta

- Encurtar área acima da dobra:
  - Galeria em 2 colunas e 1–2 linhas no mobile (menos altura).
  - Ou galeria colapsável/“Ver fotos” no mobile.
- Ou garantir CTA visível cedo:
  - Botão flutuante de WhatsApp após ~200px de scroll.
  - Ou reposicionar blocos: título + preço + CTA antes da descrição longa.

---

## 10. BREADCRUMB

### Problemas identificados

| Problema | Código atual | Impacto UX/mobile |
|----------|--------------|-------------------|
| Links `text-sm` | Legíveis | OK |
| `flex-wrap gap-2` | Quebra em várias linhas se muito longo | OK |
| Área de toque | Links pequenos | Possível toque acidental no adjacente |
| Separador `/` entre itens | `aria-hidden` | OK acessibilidade |

### Solução proposta

- Links: `py-2` ou `inline-block` com `min-h-[44px]` se possível sem quebrar layout.
- Ou manter como está; breadcrumb costuma ser secundário em prioridade.

---

## 11. IMÓVEIS SEMELHANTES

### Problemas identificados

| Problema | Código atual | Impacto UX/mobile |
|----------|--------------|-------------------|
| `PropertyList` grid-cols-1 | Uma coluna | OK |
| `PropertyCard` | Já auditado em outras páginas | Manter min-h em elementos interativos |
| `gap-5` | Espaçamento | OK |

### Solução proposta

- Manter estrutura.
- Garantir que `PropertyCard` tenha `min-h-[44px]` em áreas clicáveis (já coberto em audit-mobile-imoveis/home).

---

## 12. BLOCO CONSULTORIA

### Problemas identificados

| Problema | Código atual | Impacto UX/mobile |
|----------|--------------|-------------------|
| Botões `px-5 py-2.5` | ~40px | Abaixo de 44px |
| `flex-wrap gap-3` | Quebram em 2 linhas | OK |

### Solução proposta

- Botões: `min-h-[44px]`, `flex items-center justify-center`.

---

## RESUMO — PRIORIDADE DE CORREÇÃO

| Prioridade | Área | Ação |
|------------|------|------|
| P0 | Galeria | grid-cols-2 ou 3 no mobile; thumbnails maiores |
| P0 | CTAs (Solicitar informações, WhatsApp) | min-h-[44px] |
| P0 | Ordem no mobile | CTAs antes ou logo após características |
| P1 | h1 | text-xl base; break-words |
| P1 | Descrição | Melhor espaçamento entre parágrafos; leading |
| P1 | Links Explorar região | min-h-[44px] ou py-2.5 |
| P1 | Bloco Consultoria | Botões min-h-[44px] |
| P2 | main | px-5 no mobile |
| P2 | Breadcrumb | py-2 nos links (opcional) |
| P2 | Above the fold | CTA sticky ou reposição de blocos |

---

## IMPACTO SEO

- **Server Component:** página continua 100% server; alterações são apenas CSS/estrutura.
- **Semântica:** h1, h2, nav, section preservados.
- **Conteúdo:** nenhuma alteração em texto ou ordem semântica crítica.
- **Links:** todos permanecem `<Link>` ou `<a href>`; indexáveis.
- **Imagens:** priority na principal; sizes responsivos já definidos.
- **JSON-LD:** breadcrumb e RealEstateListing inalterados.

---

## OBSERVAÇÕES FINAIS

1. **Overlay de desenvolvimento:** O indicador "1 Issue" do Next.js pode sobrepor conteúdo em mobile; não é parte do layout de produção.
2. **Formulário de lead:** Não presente; foco em links de contato e WhatsApp.
3. **Tour virtual:** iframe YouTube com `aspect-video`; responsivo por padrão.
4. **Badges na imagem:** posição `left-4 top-4`; não interferem em toque, apenas visão.
5. **Vídeo opcional:** bloco só aparece se `youtubeVideoId` existir; não impacta imóveis sem vídeo.
