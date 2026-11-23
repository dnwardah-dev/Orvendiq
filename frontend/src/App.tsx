// ORVENDIQ_SETTINGS_CENTER_FIXED
import SettingsPage from './components/SettingsPage'
import { AnimatePresence as OrvAnimatePresence } from 'motion/react'
// ORVENDIQ_OVERVIEW_CARD_REVEAL
import ScrollReveal from './components/ScrollReveal'
import AnimatedHeading from './components/AnimatedHeading'
import LiveSecurityPulse from './components/LiveSecurityPulse'
import LiveRecentActivity from './components/LiveRecentActivity'
import LiveBalanceCard from './components/LiveBalanceCard'
import LiveTransactionCount from './components/LiveTransactionCount'
import TransferPage from './components/TransferPage'
import TransactionsPage from './components/TransactionsPage'
import FraudAnalyticsPage from './components/FraudAnalyticsPage'
import LiveFraudCard from './components/LiveFraudCard'
import { useState } from 'react'
import { motion } from 'motion/react'
import {
  ArrowRight, Bell,
  ChartNoAxesCombined, Check, ChevronDown,
  ChevronRight, CircleHelp, Clock3, CreditCard,
  Flower2, LayoutDashboard, Menu,
  Search, Settings2, Send,
  Sparkles, X
} from 'lucide-react'

type Page = 'Overview' | 'Transactions' | 'Transfers' | 'Fraud Analytics' | 'Settings'

const navigation = [
  { name: 'Overview' as Page, icon: LayoutDashboard },
  { name: 'Transactions' as Page, icon: CreditCard },
  { name: 'Transfers' as Page, icon: Send },
  { name: 'Fraud Analytics' as Page, icon: ChartNoAxesCombined },
  { name: 'Settings' as Page, icon: Settings2 },
]


function SkeletonView() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading dashboard">
      <div className="orv-skeleton h-8 w-64 rounded-xl" />
      <div className="orv-skeleton h-4 w-80 max-w-full rounded-lg" />
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="rounded-[24px] bg-white p-6 space-y-5">
            <div className="orv-skeleton h-11 w-11 rounded-2xl" />
            <div className="orv-skeleton h-3 w-28 rounded-lg" />
            <div className="orv-skeleton h-8 w-36 rounded-lg" />
          </div>
        ))}
      </div>
      <div className="orv-skeleton h-64 rounded-[24px]" />
      <span className="sr-only">Dashboard content is loading</span>
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState<Page>('Overview')
  const [loading, setLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  function navigate(next: Page) {
    setPage(next)
    setMenuOpen(false)
  }

  const today = new Intl.DateTimeFormat('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  }).format(new Date())

  return (
    <div className="min-h-screen bg-[#E8D8E2] text-[#463740]">
      {menuOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-[#463740]/25 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[252px] flex-col border-r border-[#EADFE6] bg-[#E4CEDB] px-5 py-7 transition-transform duration-300 lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-14 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D8B7CA] text-[#A46E96]">
              <Flower2 size={23} strokeWidth={1.8} />
            </div>
            <div>
              <div className="text-[21px] font-bold tracking-[-0.07em]">orvendiq<span className="text-[#BB87A9]">.</span></div>
              <div className="text-[9px] tracking-[0.14em] text-[#A49AA3] uppercase">Intelligence studio</div>
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={18}/></button>
        </div>

        <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A89CA7]">Workspace</div>
        <nav className="space-y-1.5" aria-label="Main navigation">
          {navigation.map((item) => {
            const Icon = item.icon
            const selected = page === item.name
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.name)}
                className={`orv-button flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-[13px] font-medium ${selected ? 'bg-[#F7E9F1] text-[#915D80]' : 'text-[#89808B] hover:bg-[#FAF5F8] hover:text-[#403A45]'}`}
                aria-current={selected ? 'page' : undefined}
              >
                <Icon size={18} strokeWidth={1.8}/>
                <span className="flex-1">{item.name}</span>
                {selected && <ChevronRight size={15}/>}
              </button>
            )
          })}
        </nav>

        <div className="mt-auto">
          <div className="rounded-[23px] bg-[#EEE9FC] p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 text-[#8271B5]">
              <Sparkles size={20}/>
            </div>
            <p className="text-[13px] font-semibold leading-relaxed text-[#514967]">A little clarity goes a long way.</p>
            <p className="mt-2 text-[11px] leading-relaxed text-[#8F86A1]">Your financial world, beautifully organized.</p>
          </div>
          <div className="mt-6 flex items-center gap-3 border-t border-[#F1ECEE] px-2 pt-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D8B7CA] text-sm font-semibold text-[#97647F]">SD</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold">Sendok</p>
              <p className="text-[10px] text-[#9D929E]">Demo workspace</p>
            </div>
            <ChevronDown size={15} className="text-[#AAA0AA]"/>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[252px]">
        <header className="flex h-[82px] items-center justify-between border-b border-[#EADFE6] bg-[#E8D8E2]/95 px-5 sm:px-9 lg:px-12">
          <div className="flex items-center gap-4">
            <button className="lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={22}/></button>
            <span className="text-[12px] font-medium text-[#A298A2]">Workspace</span>
            <ChevronRight size={14} className="text-[#C5BBC4]"/>
            <span className="text-[12px] font-semibold">{page}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-[#E5F3E9] px-3 py-1.5 text-[10px] font-semibold text-[#4E8A6B] sm:inline-flex"> Demo mode</span>
            <button className="orv-button flex h-10 w-10 items-center justify-center rounded-full bg-[#F0E4EA] text-[#77707B] shadow-sm" aria-label="Notifications"><Bell size={17}/></button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D6C9E8] text-xs font-semibold text-[#7C6BA7]">SD</div>
          </div>
        </header>

        <main className="mx-auto max-w-[1450px] px-5 py-9 sm:px-9 lg:px-12">
          {/* ORVENDIQ_SEAMLESS_PAGE_TRANSITIONS */}
          <OrvAnimatePresence mode="wait" initial={false}>
            <motion.div
              key={loading ? 'skeleton' : page}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {loading ? (
            <SkeletonView/>
          ) : page === 'Overview' ? (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.19em] text-[#A995A8]">{today} {'\u00B7'} YOUR OVERVIEW</p>
                  {/* ORVENDIQ_OVERVIEW_WORD_REVEAL */}
<AnimatedHeading
  text="Good to see you, Sendok"
  as="h1"
  className="text-[clamp(27px,3vw,39px)] font-semibold tracking-[-0.055em]"
>
  {' '}
  <span className="text-[#BC89AC]">{'\u2733'}</span>
</AnimatedHeading>
                  <p className="mt-2 text-[13px] text-[#968C98]">Here's what's happening in your little finance universe.</p>
                </div>
                <button className="orv-button inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-[#463740] px-5 py-3 text-[12px] font-semibold text-white hover:bg-[#59505D] sm:self-auto">
                  <Search size={15}/> Explore activity
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <ScrollReveal className="h-full" delay={0}><LiveBalanceCard /></ScrollReveal>
                <ScrollReveal className="h-full" delay={0.12}><LiveFraudCard /></ScrollReveal>
                              <ScrollReveal className="h-full" delay={0.24}><LiveTransactionCount /></ScrollReveal>
              </div>
              <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_1fr]">
                <ScrollReveal delay={0.08}><LiveRecentActivity onViewAll={() => navigate('Transactions')} /></ScrollReveal>

                <ScrollReveal delay={0.2}><LiveSecurityPulse onInvestigate={() => navigate('Fraud Analytics')} /></ScrollReveal>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#AAA0A8]">
                <span>âœ³ Thoughtfully made for financial clarity.</span>
                <span>Orvendiq · Portfolio preview</span>
              </div>
            </motion.div>
          ) : page === 'Transfers' ? (
            <TransferPage />
          ) : page === 'Fraud Analytics' ? (
            <FraudAnalyticsPage />
          ) : page === 'Transactions' ? (
            <TransactionsPage />
          ) : page === 'Settings' ? (
            <SettingsPage />
          ) : (
            <motion.div key={page} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.19em] text-[#A995A8]">ORVENDIQ WORKSPACE</p>
              <h1 className="text-3xl font-semibold tracking-[-0.05em]">{page}</h1>
              <div className="rounded-[25px] border border-[#EADFE6] bg-[#F0E4EA] p-9">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEE9FC] text-[#8574B5]">
                  <Settings2 size={25}/>
                </div>
                <h2 className="text-lg font-semibold">A more thoughtful workspace experience.</h2>
                <p className="mt-2 max-w-md text-[13px] leading-6 text-[#928995]">We're shaping this workspace with real backend data, clear information hierarchy, and meaningful interactions.</p>
                <button onClick={() => navigate('Overview')} className="orv-button mt-6 inline-flex items-center gap-2 rounded-xl bg-[#D8B7CA] px-4 py-3 text-[12px] font-semibold text-[#915D80]">Back to overview <ArrowRight size={14}/></button>
              </div>
            </motion.div>
              )}
            </motion.div>
          </OrvAnimatePresence>

          <div className="mt-8 flex items-center justify-between border-t border-[#EFE9EA] pt-5">
            <div className="flex items-center gap-2 text-[11px] text-[#AAA0A8]"><CircleHelp size={15}/> Preview tools</div>
            <button onClick={() => setLoading(!loading)} className="orv-button rounded-xl border border-[#E3D5DF] bg-[#F0E4EA] px-4 py-2.5 text-[11px] font-semibold text-[#8A7084]">
              {loading ? <span className="inline-flex items-center gap-2"><Check size={14}/> Show dashboard</span> : <span className="inline-flex items-center gap-2"><Clock3 size={14}/> Preview skeleton</span>}
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}