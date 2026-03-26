/**
 * Layout do segmento /admin/imoveis.
 * Garante que a rota seja reconhecida corretamente pelo Next.js.
 */
export default function AdminImoveisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
