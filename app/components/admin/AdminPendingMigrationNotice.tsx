type AdminPendingMigrationNoticeProps = {
  title: string;
  tableName: string;
  description: string;
  sql: string;
};

/**
 * Aviso exibido quando a tabela canônica ainda não foi criada no Supabase.
 * Mesma UX para Bairros e Construtoras.
 */
export function AdminPendingMigrationNotice({
  title,
  tableName,
  description,
  sql,
}: AdminPendingMigrationNoticeProps) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-2">{description}</p>
      <p className="mt-2">
        A tabela <code className="rounded bg-amber-100 px-1">{tableName}</code> ainda não
        existe no banco. Cole o SQL abaixo no{" "}
        <strong>SQL Editor do Supabase</strong> (mesmo fluxo usado em Bairros):
      </p>
      <pre className="mt-3 max-h-80 overflow-auto rounded-lg bg-zinc-900 px-4 py-3 text-xs leading-relaxed text-zinc-100">
        {sql}
      </pre>
      <p className="mt-3 text-xs text-amber-900">
        Depois execute{" "}
        <code className="rounded bg-amber-100 px-1">pnpm prisma generate</code> e reinicie o{" "}
        <code className="rounded bg-amber-100 px-1">pnpm dev</code>.
      </p>
    </div>
  );
}
