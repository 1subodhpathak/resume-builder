import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Clock3, Coins, Database, FolderOpen, MessageSquare, ScanLine, Settings } from 'lucide-react';
import { LANDING_MODE_LABELS, REPOSITORY_SHOWCASE_VIEWS, formatLandingDate, formatLandingDateTime, formatLandingNumber } from '../data/landingData.jsx';
import { ProfileSnapshot } from './shared/LandingSectionParts.jsx';

export default function RepositoryShowcaseSection({ lastRepositorySync, latestAtsEntry, latestInterviewEntry, onOpenRepository, recentResumes, repositoryAnalytics, repositoryProfile, repositoryStats, setShowcaseView, showcaseIndex, showcaseView, topOperationUsage }) {
  return (
<section
  id="reviews"
  className="relative overflow-hidden border-b border-[#D8E0EA] bg-[#F8F7F3] py-14 sm:py-16 lg:py-20 scroll-mt-24"
>
  {/* BACKGROUND */}
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute inset-0 bg-[linear-gradient(135deg,#FAF8F2_0%,#F7F9FC_48%,#EEF3F8_100%)]" />
    <div className="absolute inset-0 opacity-[0.022] bg-[linear-gradient(#163A63_1px,transparent_1px),linear-gradient(90deg,#163A63_1px,transparent_1px)] bg-[size:42px_42px]" />
    <div className="absolute -left-[14%] -top-[40%] h-[540px] w-[540px] rounded-full bg-[#295D95]/9 blur-[130px]" />
    <div className="absolute -bottom-[45%] right-[5%] h-[460px] w-[460px] rounded-full bg-[#B98A32]/7 blur-[130px]" />
  </div>

  <div className="relative z-10 mx-auto max-w-[1450px] px-5 sm:px-7">
    <div className="grid gap-10 xl:grid-cols-[0.82fr_1.18fr] xl:items-center xl:gap-16">

      {/* =====================================================
          LEFT
      ===================================================== */}
      <div>
        {/* EYEBROW */}
        <div className="mb-3 bg-gradient-to-r from-[#8D651F] via-[#B88A32] to-[#D8B65E] bg-clip-text text-[10px] font-black uppercase tracking-[0.22em] text-transparent">
          Store. Track. Succeed.
        </div>

        {/* HEADING */}
        <h2 className="mb-4 text-[1.9rem] font-black leading-[1.06] tracking-[-0.04em] sm:text-[2.15rem] lg:text-[2.4rem]">
          <span className="bg-gradient-to-b from-[#294D7D] via-[#12345B] to-[#06172C] bg-clip-text text-transparent">
            Your Career Repository
          </span>
          <br />
          <span className="bg-gradient-to-b from-[#E7C86E] via-[#BA8B32] to-[#88601B] bg-clip-text text-transparent">
            Always Ready
          </span>
        </h2>

        {/* COPY */}
        <p className="max-w-[580px] text-[14px] font-medium leading-[1.7] text-[#53657E] sm:text-[15px]">
          Keep saved resumes, analysis history, profile information and Career
          Point usage together in one continuously updated workspace.
        </p>

        {/* COMPACT STATUS BAR */}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-[#D9E2EB] py-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#C69A3D] shadow-[0_0_0_4px_rgba(198,154,61,0.12)] motion-safe:animate-pulse" />
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.16em] text-[#8594A6]">
                Live Sync
              </div>
              <div className="text-[11px] font-bold text-[#173A62]">
                {formatLandingDateTime(lastRepositorySync)}
              </div>
            </div>
          </div>

          <div className="hidden h-7 w-px bg-[#D9E2EB] sm:block" />

          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.16em] text-[#8594A6]">
              Resumes
            </div>
            <div className="text-[11px] font-bold text-[#173A62]">
              {formatLandingNumber(repositoryStats.totalResumes)} saved
            </div>
          </div>

          <div className="hidden h-7 w-px bg-[#D9E2EB] sm:block" />

          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.16em] text-[#8594A6]">
              Analysis
            </div>
            <div className="text-[11px] font-bold text-[#173A62]">
              {formatLandingNumber(
                (repositoryStats.atsRuns || 0) +
                (repositoryStats.interviewPrepRuns || 0)
              )}{' '}
              runs
            </div>
          </div>
        </div>

        {/* MAIN METRICS */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            {
              label: 'Library',
              value: formatLandingNumber(repositoryStats.totalResumes),
              hint: 'Saved drafts',
              icon: FolderOpen,
            },
            {
              label: 'History',
              value: formatLandingNumber(
                (repositoryStats.atsRuns || 0) +
                (repositoryStats.interviewPrepRuns || 0)
              ),
              hint: 'Analysis runs',
              icon: ScanLine,
            },
            {
              label: 'Usage',
              value: formatLandingNumber(repositoryStats.totalCareerPoints),
              hint: 'Points tracked',
              icon: Coins,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-xl border border-[#D5DFE9] bg-white/70 p-3.5 shadow-[0_6px_18px_rgba(6,23,44,0.04)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C49A43]/40 hover:bg-white"
              >
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-[#28517F] via-[#14375F] to-[#071A31] text-[#DCB85F] shadow-sm">
                  <Icon size={14} />
                </div>

                <div className="text-[8px] font-black uppercase tracking-[0.16em] text-[#8494A7]">
                  {item.label}
                </div>

                <div className="mt-1 text-[1.2rem] font-black tracking-tight text-[#071A31]">
                  {item.value}
                </div>

                <div className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-[#77899F]">
                  {item.hint}
                </div>
              </div>
            );
          })}
        </div>

        {/* SIMPLE CHECKLIST — NO EXTRA CARD */}
        <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-2.5">
          {[
            'Saved resumes',
            'ATS + interview history',
            'Career Point usage',
            'Profile baseline',
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 text-[11px] font-semibold text-[#52677F]"
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#B78B32]" />
              {item}
            </div>
          ))}
        </div>

        {/* CTA */}
        {onOpenRepository && (
          <button
            type="button"
            onClick={onOpenRepository}
            className="group mt-6 inline-flex min-h-[46px] items-center gap-2.5 rounded-[0.85rem] border border-[#335F91] bg-gradient-to-b from-[#29517F] via-[#14365E] to-[#081C35] px-6 py-3 text-[11px] font-extrabold uppercase tracking-[0.11em] text-white shadow-[0_10px_24px_rgba(6,23,44,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#4778AA]"
          >
            Open My Repository
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        )}
      </div>

      {/* =====================================================
          RIGHT — LIVE WORKSPACE
      ===================================================== */}
      <div className="relative">

        {/* subtle glow */}
        <div className="pointer-events-none absolute -inset-5 rounded-[2rem] bg-[radial-gradient(circle_at_20%_10%,rgba(41,93,149,0.12),transparent_45%),radial-gradient(circle_at_85%_90%,rgba(185,138,50,0.08),transparent_38%)] blur-2xl" />

        <div className="relative flex min-h-[520px] flex-col overflow-hidden rounded-[1.5rem] border border-[#C9D6E3] bg-white/82 shadow-[0_24px_65px_rgba(6,23,44,0.11)] backdrop-blur-xl">

          {/* HEADER */}
          <div className="flex min-h-[54px] items-center justify-between border-b border-[#DEE5ED] bg-white/65 px-5 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#536780]">
              <Database size={14} className="text-[#A77924]" />
              Live Workspace
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#957027] sm:flex">
                <Clock3 size={11} />
                Auto Cycling
              </div>

              <Settings size={14} className="text-[#91A0B0]" />
            </div>
          </div>

          {/* BODY */}
          <div className="flex-1 px-5 py-5 sm:px-6">

            {/* TABS */}
            <div className="flex flex-wrap gap-2">
              {REPOSITORY_SHOWCASE_VIEWS.map((view) => {
                const Icon = view.icon;
                const isActive = showcaseView === view.id;

                return (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => setShowcaseView(view.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[8.5px] font-black uppercase tracking-[0.12em] transition-all ${
                      isActive
                        ? 'border-[#C99E47]/50 bg-[#FBF5E7] text-[#91671E] shadow-sm'
                        : 'border-[#D9E2EB] bg-white/40 text-[#76889D] hover:border-[#BFCEDC] hover:text-[#183B63]'
                    }`}
                  >
                    <Icon size={11} />
                    {view.label}
                  </button>
                );
              })}
            </div>

            {/* PROGRESS */}
            <div className="mt-4 h-[3px] overflow-hidden rounded-full bg-[#E7ECF2]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#173A63] to-[#C49A43] transition-all duration-500"
                style={{
                  width: `${100 / REPOSITORY_SHOWCASE_VIEWS.length}%`,
                  transform: `translateX(${showcaseIndex * 100}%)`,
                }}
              />
            </div>

            {/* CONTENT */}
            <div className="mt-5 h-[330px] overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={showcaseView}
                  initial={{ opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -7 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="h-full overflow-y-auto pr-1 custom-scrollbar"
                >

                  {/* RESUMES */}
                  {showcaseView === 'resumes' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          ['Saved', repositoryStats.totalResumes, 'All versions'],
                          ['Scratch', repositoryStats.scratchCount, 'Direct builds'],
                          ['Tailored', repositoryStats.tailorCount, 'Resume + JD'],
                        ].map(([label, value, hint]) => (
                          <div
                            key={label}
                            className="rounded-xl bg-[#F1F5F9] p-3.5"
                          >
                            <div className="text-[8px] font-black uppercase tracking-[0.15em] text-[#78899D]">
                              {label}
                            </div>

                            <div className="mt-1.5 text-xl font-black text-[#071A31]">
                              {formatLandingNumber(value)}
                            </div>

                            <div className="mt-1 text-[9px] text-[#718299]">
                              {hint}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div>
                        <div className="mb-2 text-[8px] font-black uppercase tracking-[0.18em] text-[#8494A7]">
                          Recent Resumes
                        </div>

                        <div className="space-y-2">
                          {recentResumes.length ? (
                            recentResumes.map((record) => (
                              <div
                                key={record.id}
                                className="flex items-center justify-between gap-4 rounded-lg border border-[#DFE6ED] bg-white/70 px-3 py-2.5"
                              >
                                <div className="min-w-0">
                                  <div className="truncate text-[11px] font-bold text-[#102F54]">
                                    {record.title}
                                  </div>
                                  <div className="text-[8px] font-bold uppercase tracking-[0.1em] text-[#9A7628]">
                                    {LANDING_MODE_LABELS[record.mode] ||
                                      record.mode}
                                  </div>
                                </div>

                                <span className="text-[9px] text-[#8493A6]">
                                  {formatLandingDate(record.updatedAt)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-lg border border-dashed border-[#CCD7E3] px-3 py-4 text-[11px] text-[#718299]">
                              Save your first resume to see it here.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* HISTORY */}
                  {showcaseView === 'history' && (
                    <div className="space-y-4">
                      {/* compact totals */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-[#F1F5F9] p-4">
                          <div className="text-[8px] font-black uppercase tracking-[0.16em] text-[#78899D]">
                            ATS Runs
                          </div>
                          <div className="mt-2 text-xl font-black text-[#071A31]">
                            {formatLandingNumber(repositoryStats.atsRuns)}
                          </div>
                          <div className="mt-1 text-[10px] text-[#64778E]">
                            Saved against resumes
                          </div>
                        </div>

                        <div className="rounded-xl bg-[#F1F5F9] p-4">
                          <div className="text-[8px] font-black uppercase tracking-[0.16em] text-[#78899D]">
                            Interview Prep
                          </div>
                          <div className="mt-2 text-xl font-black text-[#071A31]">
                            {formatLandingNumber(
                              repositoryStats.interviewPrepRuns
                            )}
                          </div>
                          <div className="mt-1 text-[10px] text-[#64778E]">
                            Saved prep sessions
                          </div>
                        </div>
                      </div>

                      {/* latest activity */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-[#DEE5ED] bg-white/60 p-4">
                          <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.16em] text-[#A57826]">
                            <ScanLine size={11} />
                            Latest ATS Result
                          </div>

                          {latestAtsEntry ? (
                            <>
                              <div className="mt-3 text-[1.55rem] font-black text-[#071A31]">
                                {latestAtsEntry.result?.score ?? '--'}%
                              </div>

                              <div className="mt-1 line-clamp-2 text-[10px] font-bold leading-[1.4] text-[#15375D]">
                                {latestAtsEntry.resumeTitle}
                              </div>

                              <div className="mt-2 text-[9px] text-[#778A9F]">
                                {latestAtsEntry.jdText
                                  ? 'Saved against target JD.'
                                  : 'Saved without JD snapshot.'}
                              </div>
                            </>
                          ) : (
                            <p className="mt-3 text-[10px] text-[#718299]">
                              Run an ATS scan to build history.
                            </p>
                          )}
                        </div>

                        <div className="rounded-xl border border-[#DEE5ED] bg-white/60 p-4">
                          <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.16em] text-[#A57826]">
                            <MessageSquare size={11} />
                            Latest Interview Prep
                          </div>

                          {latestInterviewEntry ? (
                            <>
                              <div className="mt-3 text-[1.55rem] font-black text-[#071A31]">
                                {latestInterviewEntry.result?.questions?.length ||
                                  0}
                              </div>

                              <div className="mt-1 line-clamp-2 text-[10px] font-bold leading-[1.4] text-[#15375D]">
                                Questions for{' '}
                                {latestInterviewEntry.resumeTitle}
                              </div>

                              <div className="mt-2 text-[9px] text-[#778A9F]">
                                Ready to reopen anytime.
                              </div>
                            </>
                          ) : (
                            <p className="mt-3 text-[10px] text-[#718299]">
                              Interview results appear here.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* USAGE */}
                  {showcaseView === 'usage' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          [
                            'Points',
                            formatLandingNumber(
                              repositoryStats.totalCareerPoints
                            ),
                          ],
                          ['Bill', repositoryStats.totalBillUsdFormatted],
                          [
                            'Requests',
                            formatLandingNumber(repositoryStats.totalAiCalls),
                          ],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="rounded-xl bg-[#F1F5F9] p-4"
                          >
                            <div className="text-[8px] font-black uppercase tracking-[0.14em] text-[#78899D]">
                              {label}
                            </div>

                            <div className="mt-2 text-[1.2rem] font-black text-[#071A31]">
                              {value}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-xl border border-[#DFE6ED] bg-white/60 p-4">
                        <div className="text-[8px] font-black uppercase tracking-[0.16em] text-[#8494A7]">
                          Recent Usage
                        </div>

                        <div className="mt-3 space-y-3">
                          {(repositoryAnalytics.dailyUsage || []).length ? (
                            repositoryAnalytics.dailyUsage.map((entry) => {
                              const max =
                                repositoryAnalytics.todayTokens || 1;

                              return (
                                <div key={entry.key}>
                                  <div className="mb-1 flex justify-between text-[9px] font-bold text-[#64778E]">
                                    <span>{entry.label}</span>
                                    <span>
                                      {formatLandingNumber(entry.totalTokens)}
                                    </span>
                                  </div>

                                  <div className="h-1.5 rounded-full bg-[#E5EBF1]">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-[#173A63] to-[#C49A43]"
                                      style={{
                                        width: `${Math.max(
                                          10,
                                          Math.min(
                                            100,
                                            (entry.totalTokens / max) * 100
                                          )
                                        )}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-[10px] text-[#718299]">
                              Usage appears after your first request.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* OPERATIONS */}
                  {showcaseView === 'operations' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-[#F1F5F9] p-4">
                          <div className="text-[8px] font-black uppercase tracking-[0.14em] text-[#78899D]">
                            Operations
                          </div>
                          <div className="mt-2 text-xl font-black text-[#071A31]">
                            {formatLandingNumber(topOperationUsage.length)}
                          </div>
                        </div>

                        <div className="rounded-xl bg-[#F1F5F9] p-4">
                          <div className="text-[8px] font-black uppercase tracking-[0.14em] text-[#78899D]">
                            Calls
                          </div>
                          <div className="mt-2 text-xl font-black text-[#071A31]">
                            {formatLandingNumber(
                              repositoryAnalytics.totalCalls
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#DFE6ED] bg-white/60 p-4">
                        <div className="text-[8px] font-black uppercase tracking-[0.16em] text-[#8494A7]">
                          Operation Analysis
                        </div>

                        <div className="mt-4 space-y-3">
                          {topOperationUsage.length ? (
                            topOperationUsage.map((entry, index) => {
                              const max =
                                topOperationUsage[0]?.totalTokens || 1;

                              return (
                                <div key={`${entry.operation}-${index}`}>
                                  <div className="mb-1 flex justify-between gap-4 text-[9px]">
                                    <span className="font-bold capitalize text-[#15375D]">
                                      {entry.operation.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-[#788A9F]">
                                      {formatLandingNumber(entry.totalTokens)}
                                    </span>
                                  </div>

                                  <div className="h-1.5 rounded-full bg-[#E5EBF1]">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-[#173A63] to-[#C49A43]"
                                      style={{
                                        width: `${Math.max(
                                          14,
                                          (entry.totalTokens / max) * 100
                                        )}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-[10px] text-[#718299]">
                              Operation analysis appears after actions.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PROFILE */}
                  {showcaseView === 'profile' && (
                    <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-[#F1F5F9] p-4">
                          <div className="text-[8px] font-black uppercase tracking-[0.14em] text-[#78899D]">
                            Name
                          </div>
                          <div className="mt-2 text-[13px] font-black text-[#071A31]">
                            {repositoryProfile?.name || 'Waiting for upload'}
                          </div>
                        </div>

                        <div className="rounded-xl bg-[#F1F5F9] p-4">
                          <div className="text-[8px] font-black uppercase tracking-[0.14em] text-[#78899D]">
                            Title
                          </div>
                          <div className="mt-2 text-[13px] font-black text-[#071A31]">
                            {repositoryProfile?.title || 'Add a title'}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#DFE6ED] bg-white/60 p-4">
                        <div className="text-[8px] font-black uppercase tracking-[0.16em] text-[#8494A7]">
                          Profile Snapshot
                        </div>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <ProfileSnapshot
                            label="Email"
                            value={
                              repositoryProfile?.email ||
                              'Appears after import'
                            }
                          />

                          <ProfileSnapshot
                            label="Last updated"
                            value={formatLandingDateTime(
                              repositoryProfile?.updatedAt
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* FOOTER */}
          {onOpenRepository && (
            <div className="border-t border-[#DFE6ED] bg-white/55 p-4">
              <button
                type="button"
                onClick={onOpenRepository}
                className="group flex w-full items-center justify-center gap-2 rounded-[0.75rem] bg-gradient-to-b from-[#29517F] via-[#14365E] to-[#081C35] py-2.5 text-[11px] font-extrabold text-white shadow-[0_8px_20px_rgba(6,23,44,0.14)] transition-all hover:-translate-y-0.5"
              >
                Open Portal
                <ArrowRight
                  size={13}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
</section>
  );
}
