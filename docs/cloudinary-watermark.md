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

### Variável de ambiente

```env
CLOUDINARY_WATERMARK_PUBLIC_ID=3p/logo
```

Se não definida, o padrão é `3p/logo`.

## Parâmetros da marca d'água

- **Posição:** centro (`g_center`)
- **Escala:** 25% da largura da imagem (`w_0.25`)
- **Opacidade:** 35% (`o_35`)
- **Formato:** PNG com transparência

## Onde a marca é aplicada

- Página de listagem de imóveis (cards)
- Página de detalhe do imóvel (imagem principal e galeria)
- Metadados Open Graph / Twitter
- Feeds XML (Google Merchant, Meta)

## Testes

1. **Upload:** envie uma imagem de imóvel pelo admin.
2. **Admin:** verifique que o preview mostra a imagem original (sem marca).
3. **Portal:** acesse a página do imóvel e confirme a marca d'água na imagem.
4. **Cloudinary:** inspecione a URL da imagem no portal — deve conter `l_3p:logo,o_35,c_scale,w_0.25,g_center,fl_layer_apply` na URL.
