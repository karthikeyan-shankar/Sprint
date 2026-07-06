import { useState } from "react";
import { Plus, Trash2, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import type { CustomField, CustomFieldType } from "@/lib/events";
import { cn } from "@/lib/utils";

const TYPES: { key: CustomFieldType; label: string }[] = [
  { key: "short", label: "Short text" },
  { key: "long", label: "Long text" },
  { key: "single", label: "Single choice" },
  { key: "multi", label: "Multi choice" },
];

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

export function CustomFieldsBuilder({
  value,
  onChange,
}: {
  value: CustomField[];
  onChange: (v: CustomField[]) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const add = () => {
    const f: CustomField = { id: newId(), label: "New question", type: "short", required: false };
    onChange([...value, f]);
    setExpanded(f.id);
  };
  const patch = (id: string, p: Partial<CustomField>) =>
    onChange(value.map((f) => (f.id === id ? { ...f, ...p } : f)));
  const remove = (id: string) => onChange(value.filter((f) => f.id !== id));
  const move = (id: string, dir: -1 | 1) => {
    const i = value.findIndex((f) => f.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= value.length) return;
    const next = value.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-surface-2 p-6 text-center text-sm text-muted-foreground">
          No custom questions yet. Ask registrants anything extra — t-shirt size, GitHub, dietary preference, etc.
        </div>
      )}

      {value.map((f, idx) => {
        const isOpen = expanded === f.id;
        return (
          <div key={f.id} className="rounded-2xl border border-border bg-surface-2 p-3">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : f.id)}
                className="flex-1 text-left"
              >
                <div className="text-sm font-semibold">
                  {idx + 1}. {f.label || "Untitled question"}
                  {f.required && <span className="ml-1 text-neon">*</span>}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {TYPES.find((t) => t.key === f.type)?.label}
                </div>
              </button>
              <button type="button" onClick={() => move(f.id, -1)} className="rounded-full p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground" aria-label="Move up">
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => move(f.id, 1)} className="rounded-full p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground" aria-label="Move down">
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => remove(f.id)} className="rounded-full p-1.5 text-muted-foreground hover:bg-red-500/20 hover:text-red-400" aria-label="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {isOpen && (
              <div className="mt-3 space-y-3 border-t border-border pt-3">
                <label className="block">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Question</div>
                  <input
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-neon"
                    value={f.label}
                    onChange={(e) => patch(f.id, { label: e.target.value })}
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Type</div>
                    <select
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-neon"
                      value={f.type}
                      onChange={(e) => patch(f.id, { type: e.target.value as CustomFieldType })}
                    >
                      {TYPES.map((t) => (
                        <option key={t.key} value={t.key}>{t.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-2 self-end pb-1 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-neon"
                      checked={!!f.required}
                      onChange={(e) => patch(f.id, { required: e.target.checked })}
                    />
                    Required
                  </label>
                </div>

                {(f.type === "single" || f.type === "multi") && (
                  <label className="block">
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Options (one per line)</div>
                    <textarea
                      rows={3}
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-neon"
                      value={(f.options ?? []).join("\n")}
                      onChange={(e) => patch(f.id, { options: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
                      placeholder={"Option 1\nOption 2"}
                    />
                  </label>
                )}
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={add}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-dashed border-border bg-surface-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground",
          "hover:border-neon hover:text-neon",
        )}
      >
        <Plus className="h-3.5 w-3.5" /> Add question
      </button>
    </div>
  );
}
