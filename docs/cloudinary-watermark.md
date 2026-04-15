# Marca d'água no Cloudinary

O portal aplica automaticamente a logo da empresa como marca d'água em todas as imagens de imóveis exibidas publicamente.

## Como funciona

- **Admin:** usa as URLs originais (sem marca d'água) para preview e gestão.
- **Portal público:** usa URLs transformadas pelo Cloudinary com overlay da logo.
- **Banco de dados:** armazena apenas as URLs originais; a marca é aplicada na exibição.

## Upload da logo

A logo da empresa está em `public/logo-watermark.png` (3Pinheiros Consultoria Imobiliária) — PNG com fundo transparente.

1. Acesse o [Cloudinary Media Library](https://cloudinary.com/console/media_library).
2. Faça upload do arquivo `public/logo-watermark.png`.
3. Defina o **public_id** como `3p/logo` (ou o valor configurado em `CLOUDINARY_WATERMARK_PUBLIC_ID`).
4. Se o upload gerar outro public_id, renomeie a imagem para `3p/logo` nas configurações do Cloudinary.

### Variáveis de ambiente

Use o **mesmo** `public_id` da logo no Cloudinary nos dois (recomendado):

```env
NEXT_PUBLIC_CLOUDINARY_WATERMARK_PUBLIC_ID=3p/logo
CLOUDINARY_WATERMARK_PUBLIC_ID=3p/logo
```

- **`NEXT_PUBLIC_…`** — usada no **browser** (galeria é Client Component). Pode omitir se `CLOUDINARY_WATERMARK_PUBLIC_ID` estiver definida: o `next.config.js` espelha esse valor para `NEXT_PUBLIC_…` no bundle (reiniciar `pnpm dev` após alterar `.env`).
- **`CLOUDINARY_…`** — lida no **servidor** (cards RSC, OG, feeds). Com o espelho acima, uma só variável no `.env` basta para galeria + servidor.

Se **nenhuma** estiver definida, o helper usa o default **`3p/logo`** (mesmo public_id do Media Library neste projeto), para a marca aparecer mesmo sem env ou sem rebuild do cliente. Aspas à volta do valor na env são removidas pelo helper.

## Parâmetros da marca d'água

- **Entrega:** `f_auto,q_auto` no início do segmento de transformação (formato e qualidade adaptativos, melhor peso/LCP).
- **Posição:** centro (`g_center`)
- **Escala em relação à foto:** `c_scale` + `fl_relative` + `w_0.xx` (sem `fl_relative`, a fração `w_0.25` não é tratada como % da imagem base e a marca pode não aparecer como esperado)
- **Imagem principal / detalhe:** `w_0.25`, opacidade 55% (`o_55`)
- **Cards e miniaturas da galeria:** `w_0.22`, opacidade 55% (`o_55`)
- **Formato da logo:** PNG com transparência
- **URLs:** `//res.cloudinary.com/...` e `http://` são normalizados antes de aplicar a transformação

## Onde a marca é aplicada

- Página de listagem de imóveis (cards)
- Página de detalhe do imóvel (imagem principal e galeria)
- Metadados Open Graph / Twitter
- Feeds XML (Google Merchant, Meta)

## Debug (só desenvolvimento)

Com `NEXT_PUBLIC_WATERMARK_DEBUG=1` no `.env.local` e `pnpm dev` reiniciado, aparecem linhas `[watermark:DEBUG]` no terminal (RSC) e na **consola do browser** (galeria). Remova a variável e, se quiser, as chamadas a `watermarkDebugLog` em `lib/cloudinary/watermark.ts` quando terminar o diagnóstico.

## Testes

1. **Upload:** envie uma imagem de imóvel pelo admin.
2. **Admin:** verifique que o preview mostra a imagem original (sem marca).
3. **Portal:** acesse a página do imóvel e confirme a marca d'água na imagem.
4. **Cloudinary:** inspecione a URL da imagem no portal — deve conter `l_<public_id>`, `fl_relative`, `g_center` e `fl_layer_apply` (ex.: `f_auto,q_auto,l_3p:logo,o_55,c_scale,fl_relative,w_0.25,g_center,fl_layer_apply` na foto grande).
