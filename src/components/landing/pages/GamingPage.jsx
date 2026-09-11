import React from 'react';
import { 
  LayoutGrid, 
  Gamepad2, 
  Award, 
  Settings, 
  HelpCircle, 
  LogOut,
  Search,
  Bell,
  ShoppingCart,
  PenTool, 
  UploadCloud, 
  Target,
  ArrowRight,
  Sparkles,
  Zap,
  Brain,
  Flame,
  TrendingUp,
  Clock
} from 'lucide-react';

// --- SIDEBAR NAV ITEM ---
const NavItem = ({ icon: Icon, active }) => (
  <div className={`p-3 rounded-xl transition-all cursor-pointer ${active ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}>
    <Icon size={22} />
  </div>
);

// --- ACTION CARD (The 3 main options) ---
const ActionCard = ({ title, subtitle, icon: Icon, accentColor, onClick, bgImage }) => (
  <div 
    onClick={onClick}
    className="group relative h-64 rounded-[30px] overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
  >
    {/* Background Image & Overlay */}
    <div className="absolute inset-0">
        <img src={bgImage} alt="bg" className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700" />
        <div className={`absolute inset-0 bg-gradient-to-t ${accentColor} opacity-80`}></div>
    </div>
    
    {/* Content */}
    <div className="relative z-10 p-6 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white">
                <Icon size={24} />
            </div>
            <div className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight size={20} />
            </div>
        </div>
        <div>
            <h3 className="text-2xl font-black text-white leading-tight mb-2">{title}</h3>
            <p className="text-sm text-white/70 font-medium">{subtitle}</p>
        </div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
const ResumeSelection = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-[#1c1115] p-6 flex justify-center font-sans overflow-hidden">
      <div className="w-full max-w-[1600px] flex gap-6 relative">
        
        {/* --- LEFT SIDEBAR --- */}
        <div className="w-24 bg-[#2d1a1e] rounded-[30px] p-4 flex flex-col items-center justify-between border border-white/5">
            <div className="space-y-6 flex flex-col items-center">
                <div className="w-12 h-12 mb-4 flex items-center justify-center">
                   <Flame size={32} className="text-orange-500" fill="currentColor" />
                </div>
                <NavItem icon={LayoutGrid} active />
                <NavItem icon={Gamepad2} />
                <NavItem icon={Award} />
                <NavItem icon={Settings} />
            </div>
            <div className="space-y-6 flex flex-col items-center">
                <NavItem icon={HelpCircle} />
                <NavItem icon={LogOut} />
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-110 transition-transform">
                    <span className="text-xl font-bold">+</span>
                </div>
            </div>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex-1 flex flex-col gap-6">
            
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Good evening, <span className="text-slate-400">Creator</span></h1>
                </div>
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input type="text" placeholder="Search templates..." className="bg-[#2d1a1e] border border-white/5 rounded-full py-3 pl-12 pr-6 text-slate-300 focus:outline-none focus:border-orange-500/50 focus:bg-[#3a2227] transition-all w-80" />
                    </div>
                    <button className="w-12 h-12 bg-[#2d1a1e] rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#3a2227] transition-all border border-white/5relative">
                        <Bell size={20} />
                        <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5 cursor-pointer">
                        <img src="https://i.pravatar.cc/150?img=12" alt="profile" className="w-full h-full rounded-full object-cover border-2 border-[#1c1115]" />
                    </div>
                </div>
            </div>

            {/* TOP ROW GRID */}
            <div className="grid grid-cols-12 gap-6 h-[400px]">
                
                {/* HERO BANNER (Top Left - Spans 8 cols) */}
                <div className="col-span-8 relative bg-[#2d1a1e] rounded-[35px] overflow-hidden flex border border-white/5 group">
                    <div className="absolute inset-0">
                        <img src="https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=2670&auto=format&fit=crop" alt="Hero Art" className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" />
                        {/* Gradient overlay mimicking the reference image red/purple wash */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#4a2525] via-[#3a1e2a]/80 to-transparent mix-blend-hard-light"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1115] via-transparent to-transparent"></div>
                    </div>
                    
                    <div className="relative z-10 p-10 flex flex-col justify-between h-full max-w-xl">
                        <div className="flex items-center gap-3 mb-4">
                             <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                <Brain size={14} fill="currentColor" /> New Engine v2.0
                             </span>
                             <div className="flex gap-1">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Visual_Studio_Code_1.35_icon.svg/512px-Visual_Studio_Code_1.35_icon.svg.png" className="w-6 h-6 opacity-70 grayscale hover:grayscale-0 transition-all"/>
                             </div>
                        </div>
                        <div>
                            <h2 className="text-6xl font-black text-white tracking-tighter mb-4">CareerSense <br/> AI Builder</h2>
                            <p className="text-slate-300 text-lg leading-relaxed mb-8">
                                Next-generation resume creation. Powered by advanced LLMs to bypass ATS filters and impress recruiters.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold flex items-center gap-3 shadow-lg shadow-orange-500/25 hover:scale-105 transition-all">
                                <Sparkles size={20} /> Start Creation
                            </button>
                             <div className="px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md text-white font-bold flex items-center gap-3 border border-white/10">
                                +45k Hired Users
                             </div>
                        </div>
                    </div>
                </div>

                 {/* SIDE STATS (Top Right - Spans 4 cols) */}
                 <div className="col-span-4 flex flex-col gap-6">
                    {/* Stat Card 1 */}
                    <div className="flex-1 bg-[#2d1a1e] rounded-[35px] p-6 border border-white/5 flex items-center justify-between relative overflow-hidden group cursor-pointer">
                         <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div>
                            <p className="text-slate-400 font-medium mb-1">Profile Strength</p>
                            <h3 className="text-3xl font-black text-white">Intermediate</h3>
                            <span className="text-sm text-purple-400 flex items-center gap-1 mt-2"><TrendingUp size={16} /> +15% this week</span>
                        </div>
                        <div className="w-24 h-24 rounded-full border-[6px] border-[#3a2227] flex items-center justify-center relative">
                             <svg className="w-full h-full -rotate-90 absolute inset-0" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#9333ea" strokeWidth="6" strokeDasharray="251.2" strokeDashoffset="100" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(147,51,234,0.5)]"/>
                            </svg>
                            <span className="text-2xl font-black text-white">60%</span>
                        </div>
                    </div>
                    {/* Stat Card 2 */}
                     <div className="flex-1 bg-[#2d1a1e] rounded-[35px] p-6 border border-white/5 flex items-center gap-6 relative overflow-hidden group cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <Clock size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white mb-1">Recent Draft</h3>
                            <p className="text-slate-400">Software Engineer - Google</p>
                            <span className="text-xs text-slate-500 mt-1 block">Edited 2 hours ago</span>
                        </div>
                        <ArrowRight className="ml-auto text-slate-500 group-hover:text-white transition-colors" />
                    </div>
                 </div>
            </div>

            {/* MIDDLE SECTION HEADER */}
            <div className="flex justify-between items-end mt-4">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Choose Initialization Path</h2>
                    <p className="text-slate-400">Select how you want to begin your resume journey.</p>
                </div>
                <button className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">See All Options <ArrowRight size={18}/></button>
            </div>

            {/* BOTTOM ROW - ACTION CARDS (Replaces "New Games" scroll) */}
            <div className="grid grid-cols-3 gap-6">
                
                <ActionCard 
                    title="Build from Scratch"
                    subtitle="Start with a blank canvas using our wizard."
                    icon={PenTool}
                    accentColor="from-slate-900 via-slate-800 to-slate-900"
                    bgImage="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574&auto=format&fit=crop"
                    onClick={() => onSelect('scratch')}
                />

                 <ActionCard 
                    title="Import Current Resume"
                    subtitle="Upload PDF/Docx for instant AI parsing."
                    icon={UploadCloud}
                    accentColor="from-blue-900 via-indigo-900 to-slate-900"
                    bgImage="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop"
                    onClick={() => onSelect('upload')}
                />

                 <ActionCard 
                    title="Target a Specific Job"
                    subtitle="AI tailors your resume to a job description."
                    icon={Target}
                    accentColor="from-orange-900 via-red-900 to-slate-900"
                    bgImage="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop"
                    onClick={() => onSelect('tailor')}
                />

            </div>

        </div>

        {/* --- RIGHT SIDEBAR (Simplified Friends List style) --- */}
        <div className="w-20 bg-[#2d1a1e] rounded-[30px] p-4 flex flex-col items-center gap-6 border border-white/5">
             <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/20 transition-all cursor-pointer">
                <Brain size={20} />
             </div>
             <div className="w-full h-[2px] bg-white/5"></div>
             {[1,2,3,4,5].map(i => (
                 <div key={i} className="relative cursor-pointer group">
                    <img src={`https://i.pravatar.cc/150?img=${i + 20}`} alt="user" className="w-12 h-12 rounded-full border-2 border-[#2d1a1e] group-hover:scale-110 transition-transform" />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#2d1a1e] rounded-full"></span>
                 </div>
             ))}
             <div className="mt-auto w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/20 transition-all cursor-pointer">
                <Settings size={20} />
             </div>
        </div>

      </div>
    </div>
  );
};

export default ResumeSelection;