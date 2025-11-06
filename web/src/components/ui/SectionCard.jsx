export default function SectionCard({ title, subtitle, right, children, className = "" }) {
  return (
    <section
      className={
        "bg-[--surface] rounded-[--radius-card] [box-shadow:var(--shadow-card)] border border-[--border] overflow-hidden " +
        className
      }
    >
      {(title || subtitle || right) && (
        <div className="px-4 md:px-6 py-4 flex items-start md:items-center justify-between gap-3">
          <div>
            {title && <h2 className="text-base md:text-lg font-semibold">{title}</h2>}
            {subtitle && (
              <p className="text-xs md:text-sm text-[--text-muted2] mt-1">{subtitle}</p>
            )}
          </div>
          {right ? <div className="flex-shrink-0">{right}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}
