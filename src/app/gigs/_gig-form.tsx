import Link from "next/link";

const inputBase = "input-base";
const selectBase = "select-base";

export type GigFormInitial = {
  title: string;
  description: string;
  projectType: string;
  location: string;
  isRemote: boolean;
  compensationType: string;
  compensationDetails: string;
  deadline: string;
  instrumentsCsv: string;
  genresCsv: string;
};

const emptyInitial: GigFormInitial = {
  title: "",
  description: "",
  projectType: "",
  location: "",
  isRemote: true,
  compensationType: "",
  compensationDetails: "",
  deadline: "",
  instrumentsCsv: "",
  genresCsv: "",
};

export function GigForm({
  initial = emptyInitial,
  action,
  submitLabel,
  cancelHref,
}: {
  initial?: Partial<GigFormInitial>;
  action: (fd: FormData) => Promise<void>;
  submitLabel: string;
  cancelHref: string;
}) {
  const values = { ...emptyInitial, ...initial };
  const deadlineValue =
    values.deadline && values.deadline.length > 0
      ? values.deadline.slice(0, 10)
      : "";

  return (
    <form action={action} className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-200">
          Basic project info
        </h2>
        <div>
          <label className="text-sm text-zinc-300">
            Title <span className="text-violet-300">*</span>
          </label>
          <input
            name="title"
            defaultValue={values.title}
            className={inputBase}
            placeholder="e.g. Composer needed for 8-minute short film"
            required
          />
        </div>
        <div>
          <label className="text-sm text-zinc-300">
            Description <span className="text-violet-300">*</span>
          </label>
          <textarea
            name="description"
            defaultValue={values.description}
            className={`${inputBase} min-h-[140px]`}
            placeholder="What are you making, what do you need, and what’s the timeline?"
            required
          />
        </div>
        <div>
          <label className="text-sm text-zinc-300">
            Project type <span className="text-violet-300">*</span>
          </label>
          <select name="projectType" className={selectBase} required defaultValue={values.projectType}>
            <option value="">Select…</option>
            <option value="FILM">Film</option>
            <option value="LIVE_EVENT">Live event</option>
            <option value="PODCAST">Podcast</option>
            <option value="GAME">Game</option>
            <option value="YOUTUBE">YouTube</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-200">Requirements</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm text-zinc-300">Instruments needed</label>
            <input
              name="instrumentsCsv"
              defaultValue={values.instrumentsCsv}
              className={inputBase}
              placeholder="Comma-separated (e.g. Violin, Piano)"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-300">Genres preferred</label>
            <input
              name="genresCsv"
              defaultValue={values.genresCsv}
              className={inputBase}
              placeholder="Comma-separated (e.g. Ambient, Jazz)"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-200">Logistics</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm text-zinc-300">Location</label>
            <input
              name="location"
              defaultValue={values.location}
              className={inputBase}
              placeholder="Optional"
            />
          </div>
          <label className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm text-zinc-200 sm:self-end">
            <input
              type="checkbox"
              name="isRemote"
              defaultChecked={values.isRemote}
              className="accent-violet-500"
            />
            Remote option
          </label>
        </div>
        <div>
          <label className="text-sm text-zinc-300">Deadline</label>
          <input type="date" name="deadline" className={inputBase} defaultValue={deadlineValue} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-200">Compensation</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm text-zinc-300">
              Compensation type <span className="text-violet-300">*</span>
            </label>
            <select name="compensationType" className={selectBase} required defaultValue={values.compensationType}>
              <option value="">Select…</option>
              <option value="PAID">Paid</option>
              <option value="UNPAID">Unpaid</option>
              <option value="NEGOTIABLE">Negotiable</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-zinc-300">Compensation details</label>
            <input
              name="compensationDetails"
              defaultValue={values.compensationDetails}
              className={inputBase}
              placeholder="Optional (e.g. $150, credit + meals)"
            />
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <Link href={cancelHref} className="text-sm text-zinc-400 hover:text-zinc-200">
          Cancel
        </Link>
        <button type="submit" className="btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
