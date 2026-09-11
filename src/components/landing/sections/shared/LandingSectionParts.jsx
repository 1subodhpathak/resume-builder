import { ArrowRight } from 'lucide-react';

export const ProfileSnapshot = ({
  label,
  value
}) => <div className="landing-card rounded-[1rem] px-4 py-3 shadow-sm">
    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--theme-text-muted)]">{label}</div>
    <div className="mt-2 text-sm font-bold leading-6 text-[color:var(--theme-text-primary)]">{value}</div>
  </div>;

export const Highlight = ({
  icon: Icon,
  stat,
  label
}) => <div className="flex min-w-0 items-center gap-2 sm:min-w-[150px] sm:gap-3">
    <div className="landing-icon-tile flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm sm:h-10 sm:w-10">
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0">
      <div className="text-lg font-extrabold leading-none tracking-tight text-[color:var(--theme-text-primary)] sm:text-xl">{stat}</div>
      <div className="mt-1 text-[9px] font-black uppercase leading-tight tracking-[0.12em] text-[color:var(--theme-text-muted)] sm:text-[10px] sm:tracking-[0.16em]">{label}</div>
    </div>
  </div>;

export const RolePathCard = (props) => {
  const role = props.role || props;
  const Icon = role?.icon;
  const title = role?.title || '';
  const description = role?.description || role?.subtitle || '';
  const action = role?.action || role?.actionLabel || '';
  const handleClick = props.onClick || props.onStart;

  return (
    <button
      type="button"
      onClick={handleClick}
      className="landing-card group flex min-h-[170px] flex-col rounded-xl p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[color:var(--theme-accent)] hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="landing-icon-tile flex h-10 w-10 items-center justify-center rounded-lg">
          {Icon ? <Icon className="h-5 w-5" /> : null}
        </div>
        <ArrowRight className="h-4 w-4 text-[color:var(--theme-accent-strong)] transition-transform group-hover:translate-x-0.5" />
      </div>
      <h3 className="mt-5 text-sm font-extrabold tracking-tight text-[color:var(--theme-text-primary)]">{title}</h3>
      <p className="mt-2 line-clamp-3 text-[11px] font-medium leading-5 text-[color:var(--theme-text-secondary)] sm:text-xs">{description}</p>
      <span className="mt-auto pt-4 text-xs font-bold text-[color:var(--theme-text-muted)]">{action}</span>
    </button>
  );
};

