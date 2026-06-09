import { adminAddTaxonomyTermAction } from "@/app/admin/actions";
import { AdminDeleteTaxonomyButton } from "@/components/admin/admin-delete-taxonomy-button";
import { AdminNav, AdminSetupRequired, AdminUnavailable } from "@/components/admin/admin-display";
import { Chip } from "@/components/ui/chip";
import { PageShell } from "@/components/ui/page-shell";
import { getAdminAccess } from "@/lib/admin-auth";
import { listAdminTaxonomy, type AdminTaxonomyRow, type TaxonomyKind } from "@/lib/api/admin-taxonomy";

function AddTermForm({ kind, label }: { kind: TaxonomyKind; label: string }) {
  return (
    <form action={adminAddTaxonomyTermAction} className="flex flex-col gap-3 sm:flex-row">
      <input type="hidden" name="kind" value={kind} />
      <label htmlFor={`add-${kind}`} className="sr-only">Add {label}</label>
      <input
        id={`add-${kind}`}
        name="name"
        placeholder={`Add ${label}`}
        className="min-h-11 flex-1 rounded-2xl border border-[#E2E8F0] bg-white px-4 text-sm font-semibold text-[#0F172A] outline-none focus:border-[#0055FF] focus:ring-4 focus:ring-[#0055FF]/10"
      />
      <button
        type="submit"
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0F172A] px-5 text-sm font-bold text-white transition-colors hover:bg-[#0055FF]"
      >
        Add
      </button>
    </form>
  );
}

function TaxonomyTable({
  title,
  kind,
  rows,
}: {
  title: string;
  kind: TaxonomyKind;
  rows: AdminTaxonomyRow[];
}) {
  return (
    <section className="rounded-3xl border border-[#F1F5F9] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-[#0F172A]">{title}</h2>
          <p className="mt-1 text-sm font-medium text-[#64748B]">
            Review, add, or remove terms used by profiles and gigs.
          </p>
        </div>
        <Chip tone="neutral">{rows.length} terms</Chip>
      </div>

      <div className="mt-5">
        <AddTermForm kind={kind} label={kind} />
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-[#F1F5F9]">
        <table className="w-full min-w-180 text-left text-sm">
          <thead className="bg-[#F8FAFC] text-xs font-black uppercase tracking-[0.14em] text-[#64748B]">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Type</th>
              <th className="p-4">Musicians</th>
              <th className="p-4">Gigs</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {rows.map((row) => (
              <tr key={row.id} className="align-top">
                <td className="p-4 font-bold text-[#0F172A]">{row.name}</td>
                <td className="p-4">
                  <Chip tone={row.isDefault ? "blue" : "neutral"}>
                    {row.isDefault ? "Default" : "Custom"}
                  </Chip>
                </td>
                <td className="p-4 text-[#475569]">{row.musicianUsage}</td>
                <td className="p-4 text-[#475569]">{row.gigUsage}</td>
                <td className="p-4">
                  <AdminDeleteTaxonomyButton
                    id={row.id}
                    name={row.name}
                    kind={kind}
                    usageCount={row.musicianUsage + row.gigUsage}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function AdminTaxonomyPage() {
  const access = await getAdminAccess();
  if (!access.ok) return <AdminUnavailable reason={access.reason} />;

  let instruments: AdminTaxonomyRow[];
  let genres: AdminTaxonomyRow[];
  try {
    [instruments, genres] = await Promise.all([
      listAdminTaxonomy("instrument"),
      listAdminTaxonomy("genre"),
    ]);
  } catch (error) {
    console.error("[admin] taxonomy data failed", error);
    return <AdminSetupRequired />;
  }

  return (
    <PageShell eyebrow="Admin" title="Taxonomy" body="Review instrument and genre terms used across Motivo.">
      <AdminNav />
      <div className="grid gap-6 xl:grid-cols-2">
        <TaxonomyTable title="Instruments" kind="instrument" rows={instruments} />
        <TaxonomyTable title="Genres" kind="genre" rows={genres} />
      </div>
    </PageShell>
  );
}
