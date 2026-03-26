# Importação de Imagens — XML Code49

> **Objetivo:** Extrair URLs de imagens do XML e associá-las aos imóveis via `externalId`.

---

## 1. IDENTIFICAÇÃO DO ID DO IMÓVEL NO XML

O XML da Code49 possui estrutura hierárquica:

```
<SITE>
  <IMOVEIS>
    <IMOVEL>
      <ID>14</ID>           ← ID interno Code49 (não usar para matching)
      <CODIGO>10</CODIGO>   ← Código de referência (usar para externalId)
      ...
      <FOTOS>
        <FOTO>
          <URL>www.3pinheirosconsultoria.com.br/admin/imovel/426.jpg</URL>
          <LEGENDA><![CDATA[]]></LEGENDA>
        </FOTO>
        ...
      </FOTOS>
    </IMOVEL>
  </IMOVEIS>
</SITE>
```

**Campo para `externalId`:**
- Usar **`CODIGO`**, não `ID`
- O script de importação de imóveis (XLS) usa a coluna "Código" → `externalId`
- No XML, `CODIGO` (ex: 10, 1, 147) corresponde ao código exibido aos clientes
- `ID` (ex: 14, 3, 5) é o identificador interno da Code49

**Observação:** As URLs não contêm o ID do imóvel — números como `426.jpg` são IDs de arquivo, não de imóvel. A associação é **estrutural**: as imagens pertencem ao bloco `<IMOVEL>` onde estão dentro de `<FOTOS>`.

---

## 2. ESTRATÉGIA DE PARSING

**Opção A — Parser XML (fast-xml-parser ou similar):**
- Parser estruturado para documentos grandes
- Navegação por tags: `IMOVEIS > IMOVEL > FOTOS > FOTO > URL`
- Extrai `CODIGO` e lista de URLs por imóvel

**Opção B — Regex em texto bruto:**
- Regex para `<IMOVEL>...</IMOVEL>` + extração de CODIGO e URLs dentro de cada bloco
- Mais frágil com CDATA e caracteres especiais
- Pode falhar com imóveis muito longos

**Escolha:** Parser XML (Node.js nativo ou fast-xml-parser) para robustez. O XML tem 135k+ linhas — streaming ou chunked parsing se necessário. Para arquivo único em memória, `fast-xml-parser` com `ignoreAttributes: false` é suficiente.

**Ordem das imagens:**
- A primeira `<FOTO>` no XML é a imagem principal
- Manter ordem original: `sortOrder` 0, 1, 2... e `isPrimary: true` na primeira

---

## 3. MAPEAMENTO COM `externalId` NO BANCO

1. Para cada `<IMOVEL>` parseado:
   - Extrair `CODIGO` (ex: "10")
   - Extrair lista de URLs de `<FOTO><URL>...</URL></FOTO>`
   - Normalizar URL: prefixar `https://` se começar com `www.`

2. Buscar `Property` no banco:
   ```ts
   const property = await prisma.property.findUnique({
     where: { externalId: codigo }
   });
   ```

3. Se `property` existir:
   - Verificar URLs já em `PropertyImage` para evitar duplicatas
   - Inserir apenas URLs novas
   - Primeira imagem: `isPrimary: true`, `sortOrder: 0`
   - Atualizar `Property.featuredImage` com a primeira URL (para hero, cards, feeds)

4. Se `property` não existir:
   - Pular (imóvel não importado no banco)
   - Log para auditoria

---

## 4. NORMALIZAÇÃO DE URLs

- Formato no XML: `www.3pinheirosconsultoria.com.br/admin/imovel/XXX.jpg`
- Formato salvo: `https://www.3pinheirosconsultoria.com.br/admin/imovel/XXX.jpg`
- Deduplicação: usar URL normalizada como chave (evitar mesmo arquivo com http/https)
- Extensões: `.jpg`, `.jpeg`, `.png` (regex: `\.(jpg|jpeg|png)(?:\?|$)`)

---

## 5. EVITAR DUPLICATAS

- Antes de inserir: `prisma.propertyImage.findFirst({ where: { propertyId, url: normalizedUrl } })`
- Ou: criar índices únicos em `(propertyId, url)` e usar `createMany` com `skipDuplicates` (se Prisma suportar)
- Prisma `createMany` com `skipDuplicates: true` evita erros em batch

---

## 6. PERFORMANCE

- Processar em lotes: ex. 100 imóveis por vez
- `createMany` para PropertyImage em vez de `create` um a um
- Buscar todos os Properties por externalId em uma query (`findMany` com `externalId: { in: codigos }`) para reduzir round-trips
