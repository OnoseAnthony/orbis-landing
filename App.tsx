
import React, { useState, useEffect, useRef, RefObject, useCallback } from 'react';

// --- HOOKS ---
const useOnScreen = (ref: RefObject<HTMLElement>, threshold = 0.1) => {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true);
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        threshold,
      }
    );
    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, threshold]);

  return isIntersecting;
};

// --- Animated Wrapper ---
const AnimatedSection: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className, style }) => {
    const ref = useRef<HTMLDivElement>(null);
    const onScreen = useOnScreen(ref);
    return (
        <div
            ref={ref}
            className={`${className || ''} transition-all duration-1000 ease-in-out ${onScreen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={style}
        >
            {children}
        </div>
    );
};


// --- ICONS ---
const OrbisFiLogo: React.FC = () => (
  <div className="flex items-center gap-2">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="#00F0B5" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M2 7L12 12M22 7L12 12M12 22V12" stroke="#00F0B5" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
    <span className="font-bold text-xl text-white">ORBIS</span>
  </div>
);

// --- UI COMPONENTS ---

const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // Auto-close after 5 seconds
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? 'bg-green-600/80 border-green-500' : 'bg-red-600/80 border-red-500';

    return (
        <div className={`fixed top-24 right-5 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-[100] animate-fade-in-down border backdrop-blur-sm`}>
            {message}
        </div>
    );
};

const DemoModal: React.FC<{ onClose: () => void; showToast: (type: 'success' | 'error', message: string) => void }> = ({ onClose, showToast }) => {
    const [formData, setFormData] = useState({ name: '', email: '', organization: '', message: '' });
    const [isSending, setIsSending] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateEmail = (email: string) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    // Mock API call to send email
    const sendEmail = async (data: typeof formData) => {
        console.log("Simulating: Sending email to oanthony590@gmail.com with data:", data);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

        // Simulate success/failure for demonstration
        if (data.email.includes("fail")) {
             return { success: false, message: "Failed to send. Please try again." };
        }
        return { success: true, message: "Successful, we'll get back to you soon!" };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { name, email, organization } = formData;
        if (!name || !email || !organization) {
            showToast('error', 'Please fill in all required fields.');
            return;
        }
        if (!validateEmail(email)) {
            showToast('error', 'Please enter a valid email address.');
            return;
        }

        setIsSending(true);
        const result = await sendEmail(formData);
        setIsSending(false);

        if (result.success) {
            showToast('success', result.message);
            onClose();
        } else {
            showToast('error', result.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[99]" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl w-full max-w-md m-4 relative animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white text-2xl leading-none">&times;</button>
                <h2 className="text-2xl font-bold text-white mb-6">Book a Demo</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} className="w-full bg-gray-800/50 p-3 rounded-lg border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#00f0b5]" required />
                    <input type="email" name="email" placeholder="Your Email" value={formData.email} onChange={handleChange} className="w-full bg-gray-800/50 p-3 rounded-lg border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#00f0b5]" required />
                    <input type="text" name="organization" placeholder="Organization Name" value={formData.organization} onChange={handleChange} className="w-full bg-gray-800/50 p-3 rounded-lg border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#00f0b5]" required />
                    <textarea name="message" placeholder="Your Message (Optional)" value={formData.message} onChange={handleChange} rows={3} className="w-full bg-gray-800/50 p-3 rounded-lg border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#00f0b5]"></textarea>
                    <button type="submit" disabled={isSending} className="w-full mt-2 px-8 py-3 font-semibold text-black bg-[#00f0b5] rounded-full hover:bg-opacity-80 transition-all hover:scale-105 disabled:bg-opacity-50 disabled:cursor-not-allowed disabled:scale-100">
                        {isSending ? 'Sending...' : 'Submit Request'}
                    </button>
                </form>
            </div>
        </div>
    );
};


// --- PAGE SECTIONS ---

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'About Us', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Insights', href: '#insights' },
  ];
  
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };


  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-lg border-b border-gray-800' : 'bg-transparent'}`}>
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <OrbisFiLogo />
        <div className="hidden md:flex items-center space-x-6">
          <a href="#home" onClick={(e) => handleNavClick(e, '#home')} className="px-3 py-2 text-sm rounded-full bg-gray-800/50 text-[#00f0b5] border border-teal-500/30">Home</a>
          {navItems.map(item => (
            <a key={item.name} href={item.href} onClick={(e) => handleNavClick(e, item.href)} className="text-white hover:text-[#00f0b5] transition-colors">{item.name}</a>
          ))}
        </div>
        <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="hidden md:block px-5 py-2 text-sm text-black bg-[#00f0b5] rounded-full hover:bg-opacity-80 transition-all">Contact us</a>
        <button className="md:hidden text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </nav>
    </header>
  );
};

const Hero: React.FC<{ onBookDemoClick: () => void }> = ({ onBookDemoClick }) => (
  <section id="home" className="relative min-h-screen flex items-center justify-center text-center overflow-hidden pt-20">
    <div className="absolute inset-0 bg-black"></div>
     <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black via-transparent to-black opacity-50"></div>
    <img src="https://image.pollinations.ai/prompt/abstract%203d%20glass%20sculpture%20of%20a%20financial%20stock%20chart" alt="Abstract 3D glass sculpture of a financial stock chart" className="absolute top-1/4 left-10 lg:left-1/4 w-32 h-48 object-cover transform -rotate-12 opacity-80 animate-float" />
    <img src="https://image.pollinations.ai/prompt/glowing%20neural%20network%20plexus%20in%20a%20dark%20room" alt="Glowing neural network plexus" className="absolute top-1/4 right-10 lg:right-1/4 w-40 h-64 object-cover transform rotate-12 opacity-80 animate-float-delay" />
    
    <div className="relative z-10 container mx-auto px-6">
       <AnimatedSection>
        <div className="inline-block px-4 py-1.5 mb-4 text-sm bg-gray-800/50 border border-gray-700/50 rounded-full text-gray-300">
            Powering African Institutional Capital
        </div>
      </AnimatedSection>
      <AnimatedSection>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
          Fuel Your Investment Strategy
          <br />
          with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0b5] to-cyan-400">AI-Driven Data Intelligence</span>
        </h1>
       </AnimatedSection>
       <AnimatedSection>
        <p className="max-w-3xl mx-auto mt-6 text-gray-400">
          Leverage cutting-edge AI to optimize portfolio performance, price illiquid assets, analyze complex policy, and unlock the true potential of African markets.
        </p>
      </AnimatedSection>
      <AnimatedSection>
        <button onClick={onBookDemoClick} className="mt-8 px-8 py-3 font-semibold text-black bg-[#00f0b5] rounded-full hover:bg-opacity-80 transition-transform hover:scale-105">
          Apply for Design Partner Program
        </button>
      </AnimatedSection>
    </div>
  </section>
);


const Clients: React.FC = () => {
    const logos = ['Logoipsum', 'Logoipsum', 'Logoipsum', 'Logoipsum', 'Logoipsum', 'Logoipsum'];
    return (
        <section className="py-12 bg-black relative">
             <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-teal-900/40 to-transparent blur-3xl"></div>
            <div className="container mx-auto px-6 text-center">
                 <AnimatedSection>
                <p className="text-gray-400 mb-8">Join Nigeria's leading PFAs & Asset Managers in the first wave</p>
                <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
                    {logos.map((logo, index) => (
                        <div key={index} className="flex items-center gap-2 text-gray-500 font-medium text-xl">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
                                <path d="M12 10H14V14H12V10Z" fill="currentColor"/>
                                <path d="M10 10H12V14H10V10Z" fill="currentColor"/>
                            </svg>
                            {logo}
                        </div>
                    ))}
                </div>
                 </AnimatedSection>
            </div>
        </section>
    );
};


const DrivenByData: React.FC = () => (
    <section id="about" className="py-20 bg-black">
        <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                 <AnimatedSection>
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">Driven by Data, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0b5] to-cyan-400">Powered by AI</span></h2>
                    <p className="mt-4 text-gray-400">
                        Our AI-first platform is purpose-built for opacity. We ingest thousands of documents, news feeds, and filings to gather, consolidate, and—most importantly—generate the structured, queryable data that African finance has been missing. We are not a data aggregator. We are a data foundry.
                    </p>
                </div>
                 </AnimatedSection>
                 <AnimatedSection>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="p-6 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-2xl">
                        <h3 className="text-4xl font-bold text-[#00f0b5]">₦23.33T</h3>
                        <p className="mt-2 text-gray-300 text-sm">AUM of Nigerian Pension Funds (PenCom, Q1 2025) currently investing with incomplete data.</p>
                        <img src="https://image.pollinations.ai/prompt/glowing%20futuristic%20data%20streams%20forming%20a%20heart%20shape" alt="Abstract data streams" className="mt-4 w-24 h-24 object-cover rounded-full mx-auto" />
                    </div>
                    <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                        <img src="https://image.pollinations.ai/prompt/a%20glowing%20crystal%20sphere%20showing%20financial%20data%20visualizations" alt="Abstract financial data sphere" className="rounded-lg mb-4" />
                        <p className="text-lg font-semibold text-white">Our AI-powered foundry ensures every market move is <span className="text-[#00f0b5]">structured, verifiable, and decision-ready.</span></p>
                        <button className="mt-4 text-gray-300 hover:text-white group">Read More <span className="inline-block transform group-hover:translate-x-1 transition-transform">&rarr;</span></button>
                    </div>
                </div>
                </AnimatedSection>
            </div>
        </div>
    </section>
);

const SmarterMarketing: React.FC = () => {
    const cards = [
        { title: 'Regulatory Intelligence Engine', description: 'Leverage generative AI to analyze complex policy circulars, forecast market impact, and take proactive trading stances.' },
        { title: 'Rich Data Feeds for Stocks', description: 'Leverage NLP to read all annual reports and news, building the deep, reliable feeds for all listed stocks. This is how we fix the "black box".' },
        { title: 'Proprietary Bond Pricing', description: 'Leverage ML models to analyze sparse data, generate real-time prices, and unlock Nigeria\'s illiquid corporate bond market.' },
    ];

    return (
        <section id="services" className="py-20 bg-black relative overflow-hidden">
             <img src="https://image.pollinations.ai/prompt/abstract%20floating%20bubbles%20of%20financial%20data%20glowing%20with%20a%20teal%20light" alt="Abstract floating bubbles of financial data" className="absolute -right-20 top-10 w-80 h-80 opacity-40 animate-float" />
             <img src="https://image.pollinations.ai/prompt/glowing%20data%20orbs%20floating%20in%20a%20dark%20analytical%20space" alt="Abstract glowing data orbs" className="absolute -left-10 bottom-20 w-40 h-40 opacity-40 animate-float-delay" />
            <div className="container mx-auto px-6 text-center">
                 <AnimatedSection>
                <h2 className="text-3xl md:text-4xl font-bold text-white">Smarter Investing <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0b5] to-cyan-400">Starts With AI</span></h2>
                <p className="mt-4 max-w-2xl mx-auto text-gray-400">From unstructured chaos to actionable insight—our AI solutions optimize every step of your investment workflow.</p>
                <button className="mt-6 px-6 py-2 border border-gray-700 rounded-full text-gray-300 hover:bg-gray-800/50 hover:border-gray-600 transition">See More</button>
                 </AnimatedSection>
            </div>
            <div className="container mx-auto px-6 mt-12">
                 <AnimatedSection>
                <div className="grid md:grid-cols-3 gap-8">
                    {cards.map((card, index) => (
                        <div key={index} className="p-8 rounded-2xl bg-gray-900/30 border border-gray-800 backdrop-blur-sm group hover:border-teal-500/50 transition-all duration-300 transform hover:-translate-y-2">
                            <h3 className="text-2xl font-bold text-[#00f0b5]">{card.title}</h3>
                            <p className="mt-4 text-gray-400">{card.description}</p>
                            <div className="mt-6 flex justify-end">
                                <a href="#" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 group-hover:bg-[#00f0b5] group-hover:text-black group-hover:border-[#00f0b5] transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
                 </AnimatedSection>
            </div>
        </section>
    );
};

const Campaigns: React.FC = () => {
    const campaigns = [
        { id: '01', title: 'AI-Powered PDF Analysis for CBN Circulars', type: '(Real-Time Policy Intelligence)', img: 'https://image.pollinations.ai/prompt/futuristic%20AI%20hologram%20analyzing%20a%20financial%20document%20with%20glowing%20teal%20lines' },
        { id: '02', title: 'Real-Time News & Sentiment Feed for NGX Stocks', type: '(Listed Equity Data)', img: 'https://image.pollinations.ai/prompt/abstract%20visualization%20of%20a%20real-time%20news%20feed%20and%20stock%20tickers' },
        { id: '03', title: 'Modeling Illiquid Corporate Bond Yields', type: '(Proprietary Fixed Income Data)', img: 'https://image.pollinations.ai/prompt/a%203D%20holographic%20model%20of%20a%20complex%20corporate%20bond%20yield%20curve' },
        { id: '04', title: 'Beta: Private Company Valuation Modeler', type: '(Private Market Intelligence)', img: 'https://image.pollinations.ai/prompt/a%20digital%20wireframe%20of%20a%20company%20building%20with%20financial%20data%20overlays' },
    ];
    return (
        <section id="portfolio" className="py-20 bg-black">
            <div className="container mx-auto px-6">
                 <AnimatedSection className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white"><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0b5] to-cyan-400">Real-Time Data.</span> Smart Models.<br/>Proven Financial Alpha.</h2>
                <p className="mt-4 max-w-2xl mx-auto text-gray-400">Explore how our AI-driven data foundry transforms unstructured documents into measurable alpha. From PDF to P&L.</p>
                </AnimatedSection>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {campaigns.map((campaign, index) => (
                         <AnimatedSection key={campaign.id} className={`transform transition-all duration-500 ease-out`} style={{transitionDelay: `${index * 100}ms`}}>
                        <div className="group">
                            <div className="flex justify-between items-baseline mb-2">
                                <h3 className="text-xl font-bold text-white">{campaign.id}</h3>
                            </div>
                            <h4 className="font-semibold text-white">{campaign.title}</h4>
                            <p className="text-sm text-gray-500">{campaign.type}</p>
                            <div className="mt-4 overflow-hidden rounded-lg">
                                <img src={campaign.img} alt={campaign.title} className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                        </div>
                        </AnimatedSection>
                    ))}
                </div>
            </div>
        </section>
    );
};


const AccordionItem: React.FC<{ title: string; children: React.ReactNode; isOpen: boolean; onClick: () => void }> = ({ title, children, isOpen, onClick }) => (
    <div className="border-b border-gray-800">
        <button onClick={onClick} className="w-full flex justify-between items-center py-5 text-left text-white text-xl">
            <span>{title}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
            <div className="p-6 rounded-lg bg-gray-900/50 mb-5">
                <p className="text-gray-400">{children}</p>
            </div>
        </div>
    </div>
);

const ReachPeople: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const items = [
        { title: 'Regulatory & Policy Impact Analysis', content: 'Segment audiences based on actions they take—pages visited, time spent, and previous purchases—to serve personalized messages that align with their real-time intent and readiness to convert. Leverage machine learning to forecast which users are most likely to convert, churn, or re-engage, and deliver campaigns that anticipate their needs before they even act.' },
        { title: 'Proprietary Yield Curve Modeling', content: 'Utilize advanced algorithms to build models that predict future customer behavior, enabling you to target high-value prospects with unparalleled accuracy.' },
        { title: 'Listed Equity Data Enrichment', content: 'Identify and reach new audiences that share characteristics with your best existing customers, expanding your market reach efficiently and effectively.' },
        { title: 'Real-Time Sentiment Analysis', content: 'Go beyond static demographics. Our AI analyzes evolving demographic data to refine targeting in real-time, ensuring your message resonates with the right people at the right moment.' },
        { title: 'Private Market Valuation Modeling', content: 'Automatically segment users for retargeting based on their most recent interactions, delivering hyper-relevant ads that guide them back to conversion.' },
    ];

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-20 bg-black relative overflow-hidden">
             <img src="https://image.pollinations.ai/prompt/interconnected%20rings%20of%20financial%20data%20and%20glowing%20network%20nodes" alt="Abstract rings of financial data" className="absolute -left-20 bottom-1/4 w-64 h-64 opacity-30 animate-float" />
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                 <AnimatedSection>
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">Find the Right Signal,<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0b5] to-cyan-400">Every Single Time</span></h2>
                    <p className="mt-4 text-gray-400">Deliver alpha through AI-driven market signals, predictive analytics, and real-time, structured data insights.</p>
                </div>
                 </AnimatedSection>
                 <AnimatedSection>
                <div>
                    {items.map((item, index) => (
                        <AccordionItem key={index} title={item.title} isOpen={openIndex === index} onClick={() => handleToggle(index)}>
                            {item.content}
                        </AccordionItem>
                    ))}
                </div>
                 </AnimatedSection>
            </div>
        </section>
    );
};

const DataMeetsCreative: React.FC = () => (
    <section className="py-20 bg-black">
        <div className="container mx-auto px-6">
             <AnimatedSection className="flex justify-between items-start mb-12">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">Where Data Meets<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0b5] to-cyan-400">Actionable Alpha</span></h2>
                </div>
                <div className="text-right">
                     <p className="text-gray-400 max-w-sm mb-4">See how AI-driven insights and strategies transform market-moving events through measurable, performance-based solutions.</p>
                    <button className="px-6 py-2 border border-gray-700 rounded-full text-gray-300 hover:bg-gray-800/50 hover:border-gray-600 transition">See More</button>
                </div>
             </AnimatedSection>
            <div className="grid md:grid-cols-2 gap-8">
                 <AnimatedSection>
                <img src="https://image.pollinations.ai/prompt/a%20person%20interacting%20with%20a%20large%20holographic%20financial%20data%20dashboard" alt="Person with holographic dashboard" className="w-full h-full object-cover rounded-lg" />
                 </AnimatedSection>
                 <AnimatedSection>
                <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-lg">
                    <h3 className="text-2xl font-semibold text-white">Turning a 68-page PDF into a 'NEGATIVE' Banking Sector rating in 3 seconds flat.</h3>
                    <div className="w-full bg-gray-700 rounded-full h-2.5 my-4">
                        <div className="bg-gradient-to-r from-[#00f0b5] to-cyan-400 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <img src="https://image.pollinations.ai/prompt/a%20futuristic%20AI%20financial%20dashboard%20showing%20complex%20charts%20and%20data%20visualizations" alt="Futuristic AI financial dashboard" className="w-full h-auto object-cover rounded-lg mt-4" />
                </div>
                 </AnimatedSection>
            </div>
        </div>
    </section>
);

const Insights: React.FC = () => {
    const tabs = ['All Posts', 'Market Analysis', 'Policy Deep Dives', 'AI & Modeling', 'Case Studies'];
    const posts = [
        { img: 'https://image.pollinations.ai/prompt/an%20abstract%20data%20visualization%20of%20capital%20flow%20and%20financial%20regulations', category: 'Case Studies', title: 'Case Study: How We Modeled the ₦2B BDC Capital Hike', author: 'Nadia Procopio', date: 'June 12, 2025', readTime: '6 min read', description: 'In this case study, we explore how an AI-driven campaign helped a niche e-commerce brand achieve a 3x Return on Ad Spend (ROAS) in just 45 days.' },
        { img: 'https://image.pollinations.ai/prompt/a%20dark%20black%20box%20with%20glowing%20stock%20market%20data%20leaking%20out', category: 'Market Analysis', title: 'The \'Black Box\' Problem: Why Nigerian Stock Data is Broken', author: 'Nadia Procopio', date: 'June 12, 2025', readTime: '6 min read', description: 'In this case study, we explore how an AI-driven campaign helped a niche e-commerce brand achieve a 3x Return on Ad Spend (ROAS) in just 45 days.' },
        { img: 'https://image.pollinations.ai/prompt/a%20visualization%20of%20a%20glowing%20LSTM%20neural%20network%20modeling%20bond%20prices', category: 'AI & Modeling', title: 'Pricing the Unseen: A Look at our LSTM Bond Model', author: 'Nadia Procopio', date: 'June 12, 2025', readTime: '6 min read', description: 'In this case study, we explore how an AI-driven campaign helped a niche e-commerce brand achieve a 3x Return on Ad Spend (ROAS) in just 45 days.' },
    ];

    return (
        <section id="insights" className="py-20 bg-black">
            <div className="container mx-auto px-6 text-center">
                 <AnimatedSection>
                <h2 className="text-3xl md:text-4xl font-bold text-white">Insights, Trends, and <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0b5] to-cyan-400">Alpha Powered by AI</span></h2>
                <p className="mt-4 max-w-2xl mx-auto text-gray-400">Stay ahead with AI-driven market analysis, macro-economic innovations, and deep data-foundry knowledge.</p>
                 </AnimatedSection>
                <div className="my-10 flex flex-wrap justify-center gap-2">
                    {tabs.map((tab, index) => (
                        <button key={tab} className={`px-4 py-2 rounded-full text-sm border transition-colors ${index === 4 ? 'bg-[#00f0b5] text-black border-[#00f0b5]' : 'bg-gray-900/50 border-gray-700 text-gray-300 hover:bg-gray-800'}`}>{tab}</button>
                    ))}
                </div>
                 <AnimatedSection>
                <div className="grid md:grid-cols-3 gap-8 text-left">
                    {posts.map((post, index) => (
                        <div key={index} className="group">
                            <div className="overflow-hidden rounded-lg">
                                <img src={post.img} alt={post.title} className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="p-4">
                                <p className="text-sm text-gray-500">{post.category}</p>
                                <h3 className="mt-2 text-xl font-semibold text-white group-hover:text-[#00f0b5] transition-colors">{post.title}</h3>
                                <p className="mt-2 text-sm text-gray-400">{post.description}</p>
                                <div className="mt-4 flex items-center gap-3">
                                    <img src={`https://picsum.photos/seed/author${index}/40/40`} alt={post.author} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <p className="text-sm font-medium text-white">{post.author}</p>
                                        <p className="text-xs text-gray-500">{post.date} &bull; {post.readTime}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                 </AnimatedSection>
            </div>
        </section>
    );
};

const Services: React.FC<{ onBookDemoClick: () => void }> = ({ onBookDemoClick }) => {
    const [selectedService, setSelectedService] = useState(0);
    const services = [
        { id: 0, title: 'ORBIS Terminal (Web)', icon: '🖥️' },
        { id: 1, title: 'API Data Feeds', icon: '📊' },
        { id: 2, title: 'Proprietary Model Integration', icon: '📧' },
        { id: 3, title: 'Bespoke Data Research', icon: '📰' },
    ];
    
    return (
        <section className="py-20 bg-black relative overflow-hidden">
             <img src="https://image.pollinations.ai/prompt/an%20intricate%20plexus%20of%20glowing%20data%20nodes%20and%20financial%20connections" alt="Abstract data plexus" className="absolute top-1/4 -right-40 w-[500px] h-[500px] opacity-20 animate-float" />
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                 <AnimatedSection>
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">Institutional Data<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0b5] to-cyan-400">Services Powered by AI</span></h2>
                    <p className="mt-4 text-gray-400">Discover AI-driven data solutions tailored to empower the right investment decision, on the right platform, every time.</p>
                    <div className="mt-8 space-y-4">
                        {services.map((service) => (
                            <button key={service.id} onClick={() => setSelectedService(service.id)} className={`w-full p-4 rounded-lg text-left flex items-center gap-4 transition-all duration-300 ${selectedService === service.id ? 'bg-[#00f0b5]/10 border border-[#00f0b5]/30' : 'bg-gray-900/50 border border-transparent hover:bg-gray-900'}`}>
                                <span className={`text-2xl p-2 rounded-md ${selectedService === service.id ? 'bg-[#00f0b5]/20' : 'bg-gray-800'}`}>{service.icon}</span>
                                <span className="font-semibold text-white">{service.title}</span>
                                <span className={`ml-auto transition-opacity ${selectedService === service.id ? 'opacity-100' : 'opacity-0'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#00f0b5]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
                 </AnimatedSection>
                 <AnimatedSection className="flex flex-col items-start justify-center h-full">
                    <p className="text-gray-300 max-w-md">Run intelligent ad campaigns on platforms like Instagram, LinkedIn, and TikTok, using predictive targeting and performance-driven content recommendations.</p>
                    <button onClick={onBookDemoClick} className="mt-8 px-8 py-3 font-semibold text-black bg-[#00f0b5] rounded-full hover:bg-opacity-80 transition-transform hover:scale-105">
                        Book a Demo
                    </button>
                 </AnimatedSection>
            </div>
        </section>
    );
};

const Testimonials: React.FC = () => {
    const testimonials = [
        {
            company: 'From a PFA',
            text: "Partnering with ORBIS was one of the best strategic decisions we've made. Before, our bond pricing was guesswork and basic analytics—now, every move is backed by precise, real-time data. The team not only automated our policy analysis, but the Regulatory Engine saved our team hundreds of hours.",
            logo: 'Logoipsum'
        },
        {
            company: 'From an Asset Manager',
            text: "We were running on guesswork. The ORBIS team not only helped us see the 'black box' of Nigerian stocks, but their AI also automated most of our optimization workflows. As a result, we reduced our analysis lag by 90% and doubled our effective decision speed within two quarters.",
            logo: 'Logoipsum'
        },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const next = useCallback(() => {
        setCurrentIndex(prev => (prev + 1) % testimonials.length);
    }, [testimonials.length]);

    const prev = useCallback(() => {
        setCurrentIndex(prev => (prev - 1 + testimonials.length) % testimonials.length);
    }, [testimonials.length]);

    return (
        <section className="py-20 bg-black">
            <div className="container mx-auto px-6">
                 <AnimatedSection className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Partners Speak,<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0b5] to-cyan-400">Results Prove It</span></h2>
                        <p className="mt-2 text-gray-400">Hear from the first funds that transformed their workflow through powerful AI insights and our data-foundry platform.</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={prev} className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-800 transition-all">&lt;</button>
                        <button onClick={next} className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-800 transition-all">&gt;</button>
                    </div>
                 </AnimatedSection>
                <div className="relative overflow-hidden">
                    <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * (100 / (isMobile ? 1 : 2))}%)` }}>
                        {testimonials.map((t, i) => (
                            <div key={i} className="flex-shrink-0 w-full md:w-1/2 px-4">
                                <div className="p-8 h-full rounded-2xl bg-gray-900/50 border border-gray-800 flex flex-col justify-between">
                                    <div>
                                      <p className="text-gray-400 mb-6">{t.company}</p>
                                      <p className="text-white text-lg">{t.text}</p>
                                    </div>
                                    <div className="mt-6 flex items-center gap-2 text-gray-400 font-medium">
                                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"/><path d="M12 10H14V14H12V10Z"/><path d="M10 10H12V14H10V10Z"/></svg>
                                      {t.logo}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

const Footer: React.FC<{ onBookDemoClick: () => void }> = ({ onBookDemoClick }) => {
    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
    
    return (
    <footer className="bg-black text-gray-400">
        <div id="contact" className="relative py-20 overflow-hidden">
             <div className="absolute inset-0 bg-grid-gray-800/20 [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]"></div>
             <img src="https://image.pollinations.ai/prompt/abstract%203d%20glass%20shape%20reflecting%20stock%20market%20charts" alt="Abstract glass reflecting stock charts" className="absolute top-10 left-10 w-40 opacity-30 animate-float" />
             <img src="https://image.pollinations.ai/prompt/futuristic%20crystal%20structure%20with%20glowing%20data%20inside" alt="Futuristic crystal with glowing data" className="absolute bottom-10 right-10 w-48 opacity-30 animate-float-delay" />
             <AnimatedSection className="container mx-auto px-6 text-center relative z-10">
                <div className="inline-block px-4 py-1.5 mb-4 text-sm bg-gray-800/50 border border-gray-700/50 rounded-full text-gray-300">
                    Boost Campaigns with Intelligent Insights
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white">Smarter Investing Starts With<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0b5] to-cyan-400">Better Data</span></h2>
                <p className="mt-4 text-gray-400">Let's turn data into action—connect, explore, and grow with intelligent insights by your side.</p>
                <button onClick={onBookDemoClick} className="mt-8 px-8 py-3 font-semibold text-black bg-[#00f0b5] rounded-full hover:bg-opacity-80 transition-transform hover:scale-105">
                    Get in Touch
                </button>
            </AnimatedSection>
        </div>
        <div className="py-12 bg-black border-t border-gray-800">
            <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="font-semibold text-white mb-4">Home</h3>
                    <ul>
                        <li className="mb-2"><a href="#home" onClick={(e) => handleNavClick(e, '#home')} className="hover:text-white">Main</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold text-white mb-4">Service</h3>
                    <ul className="space-y-2">
                         <li><a href="#services" onClick={(e) => handleNavClick(e, '#services')} className="hover:text-white">AI Solutions</a></li>
                         <li><a href="#portfolio" onClick={(e) => handleNavClick(e, '#portfolio')} className="hover:text-white">Case Studies</a></li>
                         <li><a href="#insights" onClick={(e) => handleNavClick(e, '#insights')} className="hover:text-white">Insights</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold text-white mb-4">About us</h3>
                    <ul className="space-y-2">
                         <li><a href="#about" onClick={(e) => handleNavClick(e, '#about')} className="hover:text-white">Our Mission</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold text-white mb-4">Portfolio</h3>
                    <ul className="space-y-2">
                         <li><a href="#portfolio" onClick={(e) => handleNavClick(e, '#portfolio')} className="hover:text-white">Featured Work</a></li>
                    </ul>
                </div>
            </div>
        </div>
        <div className="py-6 bg-black border-t border-gray-800">
            <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm">
                <p>Copyright 2025 ORBIS. All right reserved</p>
                <div className="flex space-x-6 mt-4 md:mt-0">
                    <a href="#" className="hover:text-white">Privacy Policy</a>
                    <a href="#" className="hover:text-white">Terms Condition</a>
                </div>
            </div>
        </div>
    </footer>
    )
};


// --- MAIN APP ---
const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
      setToast({ message, type });
  };

  return (
    <div className="bg-black min-h-screen text-white font-sans antialiased relative">
        <style>{`
            html { scroll-behavior: smooth; }
            @keyframes float {
                0% { transform: translatey(0px) rotate(-12deg); }
                50% { transform: translatey(-20px) rotate(-10deg); }
                100% { transform: translatey(0px) rotate(-12deg); }
            }
            @keyframes float-delay {
                0% { transform: translatey(0px) rotate(12deg); }
                50% { transform: translatey(-20px) rotate(10deg); }
                100% { transform: translatey(0px) rotate(12deg); }
            }
            @keyframes fade-in-up {
                0% { opacity: 0; transform: translateY(20px) scale(0.98); }
                100% { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes fade-in-down {
                0% { opacity: 0; transform: translateY(-20px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            .animate-float { animation: float 6s ease-in-out infinite; }
            .animate-float-delay { animation: float-delay 8s ease-in-out infinite; }
            .animate-fade-in-up { animation: fade-in-up 0.4s ease-out forwards; }
            .animate-fade-in-down { animation: fade-in-down 0.4s ease-out forwards; }
            body { background-color: #000; }
        `}</style>
        <div className="absolute top-0 left-0 w-full h-screen bg-gradient-to-br from-teal-900/30 via-transparent to-black blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-full h-screen bg-gradient-to-tl from-cyan-900/30 via-transparent to-black blur-3xl opacity-50"></div>
      
      <div className="relative z-10">
        <Header />
        <main>
          <Hero onBookDemoClick={() => setIsModalOpen(true)} />
          <DrivenByData />
          <SmarterMarketing />
          <Campaigns />
          <ReachPeople />
          <DataMeetsCreative />
          <Insights />
          <Services onBookDemoClick={() => setIsModalOpen(true)} />
        </main>
        <Footer onBookDemoClick={() => setIsModalOpen(true)} />
      </div>

      {isModalOpen && <DemoModal onClose={() => setIsModalOpen(false)} showToast={showToast} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default App;
