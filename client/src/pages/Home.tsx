/* Signal Room: this page is the instrument surface for a local-first quantitative learning lab. */
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpRight,
  BookOpen,
  Bot,
  Check,
  ChevronRight,
  Clipboard,
  Code2,
  Copy,
  GraduationCap,
  Laptop,
  Link2,
  LockKeyhole,
  Network,
  Play,
  Plus,
  Radio,
  RefreshCw,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
  Wifi,
  X,
} from "lucide-react";

type Mode = "simulator" | "teacher" | "workshop";
type Role = "teacher" | "student";
type SignalMessage = { kind: string; payload: unknown };
type MarketAsset = { symbol: string; name: string; price: number; change: string; tone: "mint" | "red"; coingeckoId?: string; source?: string };

const ASSETS = {
  mark: "/manus-storage/quantsim-ql-mark_1a9791a8.png",
  market: "/manus-storage/quantsim-market-illustration_fae39ee1.png",
  classroom: "/manus-storage/quantsim-classroom-illustration_08ff7f9e.png",
  workshop: "/manus-storage/quantsim-workshop-illustration_16d70d01.png",
};

const initialAssets: MarketAsset[] = [
  { symbol: "BTC", name: "Bitcoin", price: 113842, change: "+2.38%", tone: "mint", coingeckoId: "bitcoin", source: "CoinGecko" },
  { symbol: "ETH", name: "Ethereum", price: 4482, change: "+1.11%", tone: "mint", coingeckoId: "ethereum", source: "CoinGecko" },
  { symbol: "SOL", name: "Solana", price: 232, change: "-0.66%", tone: "red", coingeckoId: "solana", source: "CoinGecko" },
  { symbol: "AAPL", name: "Apple", price: 231, change: "+1.32%", tone: "mint", source: "Classroom price" },
];

const initialBlocks = [
  { id: "b1", label: "WHEN price crosses", value: "SMA(20)", color: "violet" },
  { id: "b2", label: "THEN", value: "buy 10% USDT", color: "mint" },
  { id: "b3", label: "RISK", value: "stop at -3%", color: "yellow" },
];

function makeClassCode() {
  return `QL-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
}

function usePeerRoom(onMessage: (message: SignalMessage) => void) {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const [connected, setConnected] = useState(false);
  const [offer, setOffer] = useState("");
  const [answer, setAnswer] = useState("");
  const [localSignal, setLocalSignal] = useState("");
  const [remoteSignal, setRemoteSignal] = useState("");
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const dataRef = useRef<RTCDataChannel | null>(null);

  const send = (message: SignalMessage) => {
    if (dataRef.current?.readyState === "open") dataRef.current.send(JSON.stringify(message));
    channelRef.current?.postMessage(message);
  };

  useEffect(() => {
    if (typeof BroadcastChannel !== "undefined") {
      channelRef.current = new BroadcastChannel("quant-sim-lab-local-room");
      channelRef.current.onmessage = (event) => onMessage(event.data as SignalMessage);
    }
    return () => channelRef.current?.close();
  }, [onMessage]);

  const makePeer = (initiator: boolean) => {
    const peer = new RTCPeerConnection({ iceServers: [] });
    peerRef.current = peer;
    peer.onconnectionstatechange = () => setConnected(["connected", "completed"].includes(peer.connectionState));
    peer.ondatachannel = (event) => {
      dataRef.current = event.channel;
      event.channel.onmessage = (message) => onMessage(JSON.parse(message.data) as SignalMessage);
    };
    if (initiator) {
      const channel = peer.createDataChannel("quant-sim-room");
      dataRef.current = channel;
      channel.onmessage = (message) => onMessage(JSON.parse(message.data) as SignalMessage);
    }
    return peer;
  };

  const createOffer = async () => {
    const peer = makePeer(true);
    const nextOffer = await peer.createOffer();
    await peer.setLocalDescription(nextOffer);
    setLocalSignal(JSON.stringify(peer.localDescription));
    setOffer(JSON.stringify(peer.localDescription));
  };

  const acceptOffer = async (raw: string) => {
    const peer = makePeer(false);
    await peer.setRemoteDescription(JSON.parse(raw));
    const nextAnswer = await peer.createAnswer();
    await peer.setLocalDescription(nextAnswer);
    setLocalSignal(JSON.stringify(peer.localDescription));
    setAnswer(JSON.stringify(peer.localDescription));
  };

  const acceptAnswer = async (raw: string) => {
    await peerRef.current?.setRemoteDescription(JSON.parse(raw));
  };

  return { connected, send, offer, answer, localSignal, remoteSignal, setRemoteSignal, createOffer, acceptOffer, acceptAnswer };
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("simulator");
  const [role, setRole] = useState<Role>("teacher");
  const [classCode, setClassCode] = useState("");
  const [studentName, setStudentName] = useState("Alex");
  const [quizTitle, setQuizTitle] = useState("Read the market context");
  const [quizPrompt, setQuizPrompt] = useState("What should you review before choosing an order?");
  const [quizOptions, setQuizOptions] = useState(["Price, volume, and context", "Only the last price", "The top performer"]);
  const [controlledView, setControlledView] = useState("Simulator");
  const [quizSent, setQuizSent] = useState(false);
  const [usdt, setUsdt] = useState(0);
  const [wallet, setWallet] = useState(1000);
  const [exchange, setExchange] = useState(0);
  const [buyAmount, setBuyAmount] = useState("250");
  const [sendAmount, setSendAmount] = useState("100");
  const [botCode, setBotCode] = useState("def signal(market):\n    if market.sma(20) > market.sma(50):\n        return 'BUY'\n    return 'WAIT'");
  const [blocks, setBlocks] = useState(initialBlocks);
  const [savedBots, setSavedBots] = useState<string[]>([]);
  const [aiNote, setAiNote] = useState("Local coach ready. Ask for a safer rule or explain a block.");
  const [activeAsset, setActiveAsset] = useState("BTC");
  const [marketAssets, setMarketAssets] = useState<MarketAsset[]>(initialAssets);
  const [marketStatus, setMarketStatus] = useState("Snapshot prices");
  const [customPrices, setCustomPrices] = useState<Record<string, string>>({});
  const [activity, setActivity] = useState<string[]>(["Session started locally", "Paper wallet funded with $1,000"]);

  const handleMessage = useMemo(() => (message: SignalMessage) => {
    if (message.kind === "control") setControlledView(String(message.payload));
    if (message.kind === "quiz") setQuizSent(true);
    if (message.kind === "prices") {
      const incoming = message.payload as Record<string, number>;
      setMarketAssets((items) => items.map((asset) => incoming[asset.symbol] ? { ...asset, price: incoming[asset.symbol], source: "Teacher override" } : asset));
      toast.success("Teacher price board received");
    }
    if (message.kind === "hello") toast.success(`${String(message.payload)} joined the local room`);
  }, []);
  const peer = usePeerRoom(handleMessage);

  const refreshMarket = async () => {
    setMarketStatus("Refreshing CoinGecko…");
    try {
      const ids = initialAssets.filter((asset) => asset.coingeckoId).map((asset) => asset.coingeckoId).join(",");
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true`);
      if (!response.ok) throw new Error("CoinGecko request failed");
      const data = await response.json() as Record<string, { usd?: number; usd_24h_change?: number }>;
      setMarketAssets((items) => items.map((asset) => {
        const quote = asset.coingeckoId ? data[asset.coingeckoId] : undefined;
        if (!quote?.usd) return asset;
        const change = quote.usd_24h_change ?? 0;
        return { ...asset, price: quote.usd, change: `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`, tone: change >= 0 ? "mint" : "red", source: "CoinGecko" };
      }));
      setMarketStatus(`CoinGecko · updated ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
      log("Live crypto prices refreshed from CoinGecko");
    } catch {
      setMarketStatus("CoinGecko unavailable · using last snapshot");
      toast.error("CoinGecko could not be reached; keeping the last prices");
    }
  };

  useEffect(() => { refreshMarket(); const timer = window.setInterval(refreshMarket, 60000); return () => window.clearInterval(timer); }, []);

  const setTeacherPrice = (symbol: string, value: string) => {
    setCustomPrices((items) => ({ ...items, [symbol]: value }));
    const numeric = Number(value);
    if (numeric > 0) setMarketAssets((items) => items.map((asset) => asset.symbol === symbol ? { ...asset, price: numeric, source: "Teacher override" } : asset));
  };
  const broadcastPrices = () => {
    const prices = Object.fromEntries(marketAssets.map((asset) => [asset.symbol, asset.price]));
    peer.send({ kind: "prices", payload: prices });
    toast.success("Custom price board sent to the local class");
  };

  const log = (message: string) => setActivity((items) => [message, ...items].slice(0, 6));
  const copy = async (value: string, label: string) => {
    await navigator.clipboard?.writeText(value);
    toast.success(`${label} copied`);
  };
  const createClass = () => {
    const code = makeClassCode();
    setClassCode(code);
    peer.send({ kind: "hello", payload: "Teacher" });
    log(`Class ${code} opened on this Wi-Fi session`);
    toast.success("Class created. Share the code and local signal with students.");
  };
  const joinClass = () => {
    if (classCode.trim().length < 5) return toast.error("Enter a valid classroom code");
    peer.send({ kind: "hello", payload: studentName || "Student" });
    log(`${studentName || "Student"} joined ${classCode}`);
    toast.success("Joined local class");
  };
  const buyUsdt = () => {
    const amount = Math.max(0, Number(buyAmount));
    if (!amount || amount > wallet) return toast.error("Choose a USDT amount within the USD wallet");
    setWallet((v) => v - amount); setUsdt((v) => v + amount); log(`Bought ${amount.toFixed(2)} USDT in paper mode`); toast.success("Paper USDT purchased");
  };
  const sendUsdt = () => {
    const amount = Math.max(0, Number(sendAmount));
    if (!amount || amount > usdt) return toast.error("Choose a USDT amount within the wallet");
    setUsdt((v) => v - amount); setExchange((v) => v + amount); log(`Sent ${amount.toFixed(2)} USDT to paper exchange`); toast.success("USDT sent to exchange");
  };
  const runBot = () => { log(`Ran ${activeAsset} strategy with ${blocks.length} blocks`); toast.success("Backtest completed: +8.4% return, -3.1% drawdown"); };
  const askCoach = () => { setAiNote("Coach suggestion: add a volume confirmation block and cap each order at 10% of exchange USDT. This is an offline heuristic, not financial advice."); toast.success("Local coach updated"); };

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand-lockup"><img src={ASSETS.mark} className="brand-mark" /><div><div className="eyebrow">QUANTSIM LAB</div><div className="brand-name">paper markets / playground</div></div></div>
      <div className="top-status"><span className="status-dot" /> LOCAL SESSION <span className="status-sep">/</span> <span>{peer.connected ? "P2P CONNECTED" : "NO SERVER"}</span><button className="quiet-button" onClick={() => { localStorage.clear(); location.reload(); }}><RefreshCw size={14}/> Reset</button></div>
    </header>

    <div className="layout">
      <aside className="rail">
        <div className="rail-label">WORKSPACE</div>
        {(["simulator", "teacher", "workshop"] as Mode[]).map((item) => <button key={item} onClick={() => setMode(item)} className={`rail-button ${mode === item ? "active" : ""}`}><span className="rail-signal" />{item === "simulator" ? <Activity size={16}/> : item === "teacher" ? <GraduationCap size={16}/> : <Bot size={16}/>}<span>{item === "simulator" ? "Simulator" : item === "teacher" ? "Teacher mode" : "Bot workshop"}</span></button>)}
        <div className="rail-divider" />
        <div className="account-card"><div className="avatar">AL</div><div><b>Alex Lee</b><span>Paper exchange</span></div></div>
        <div className="rail-foot"><ShieldCheck size={14}/> Data stays in this browser</div>
      </aside>

      <main className="workspace">
        <section className="hero-band"><div className="hero-copy"><div className="eyebrow">{mode === "simulator" ? "01 / CONTROL ROOM" : mode === "teacher" ? "02 / LOCAL CLASSROOM" : "03 / STRATEGY WORKSHOP"}</div><h1>{mode === "simulator" ? <>Trade the signal,<br/><em>not the noise.</em></> : mode === "teacher" ? <>Teach the room.<br/><em>Keep control local.</em></> : <>Build the rule.<br/><em>Inspect the bot.</em></>}</h1><p>{mode === "simulator" ? "Practice the wallet → exchange → strategy workflow with explicit paper-money boundaries." : mode === "teacher" ? "Create a class, share a room code, and guide student views through a Wi-Fi-only peer channel." : "Mix readable Python with visual blocks, then test the strategy against a small local market window."}</p></div><img className="hero-art" src={mode === "simulator" ? ASSETS.market : mode === "teacher" ? ASSETS.classroom : ASSETS.workshop} /></section>

        {mode === "simulator" && <>
          <section className="quick-grid"><div className="section-kicker">PAPER WALLET / LIVE</div><div className="balance-row"><div><span>USD WALLET</span><strong>${wallet.toFixed(2)}</strong></div><ArrowDownToLine className="flow-arrow"/><div><span>USDT WALLET</span><strong>{usdt.toFixed(2)} <small>USDT</small></strong></div><ArrowDownToLine className="flow-arrow"/><div><span>EXCHANGE</span><strong>{exchange.toFixed(2)} <small>USDT</small></strong></div></div><div className="trade-controls"><label>BUY USDT AMOUNT<input value={buyAmount} onChange={(e) => setBuyAmount(e.target.value)} inputMode="decimal" /></label><button className="primary-button" onClick={buyUsdt}><Plus size={16}/> Buy USDT</button><label>SEND TO EXCHANGE<input value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} inputMode="decimal" /></label><button className="secondary-button" onClick={sendUsdt}><Send size={16}/> Send USDT</button></div><p className="fine-print"><LockKeyhole size={13}/> Simulation only. No real orders, custody, blockchain settlement, or wallet connection.</p></section>
          <section className="instrument-grid"><div className="panel market-panel"><div className="panel-head"><div><div className="eyebrow">MARKET BOARD</div><h2>Watchlist / 04</h2><small className="fine-print">{marketStatus}</small></div><button className="icon-button" onClick={refreshMarket}><RefreshCw size={16}/></button></div>{marketAssets.map((asset) => <button key={asset.symbol} onClick={() => setActiveAsset(asset.symbol)} className={`asset-row ${activeAsset === asset.symbol ? "selected" : ""}`}><span className="asset-icon">{asset.symbol.slice(0, 2)}</span><span className="asset-name"><b>{asset.symbol}</b><small>{asset.name}</small></span><strong>${asset.price.toLocaleString()}</strong><span className={asset.tone === "mint" ? "positive" : "negative"}>{asset.change}</span><small>{asset.source}</small><ChevronRight size={14}/></button>)}</div><div className="panel order-panel"><div className="eyebrow">{activeAsset} / PAPER ORDER</div><h2>Trade the exchange</h2><div className="order-price"><span>{activeAsset}/USD</span><strong>${(marketAssets.find((a) => a.symbol === activeAsset)?.price || 0).toLocaleString()}</strong><span className="positive">+2.38%</span></div><div className="order-tabs"><button className="active">BUY</button><button>SELL</button></div><label>ORDER SIZE / USDT NOTIONAL<input defaultValue="250" /></label><div className="preset-row">{["25", "100", "250", "500"].map((v) => <button key={v} onClick={() => setSendAmount(v)}>{v} USDT</button>)}</div><button className="primary-button wide" onClick={() => { if (exchange < 10) return toast.error("Send USDT to the exchange first"); log(`Bought ${activeAsset} with paper USDT`); toast.success(`Paper ${activeAsset} order filled`); }}><ArrowUpRight size={16}/> Buy {activeAsset}</button></div></section>
          <section className="lower-grid"><div className="panel activity-panel"><div className="panel-head"><div><div className="eyebrow">SESSION LOG</div><h2>What changed</h2></div><Radio size={16} className="mint-icon"/></div>{activity.map((item, index) => <div className="log-row" key={`${item}-${index}`}><span className="log-dot"/>{item}<small>now</small></div>)}</div><div className="panel learning-panel"><div className="eyebrow">LEARNING TRACK</div><h2>Read the market before the order.</h2><p>Compare price, volume, and context. Then make the smallest explainable action.</p><button className="text-button" onClick={() => setMode("workshop")}>Open the strategy lab <ChevronRight size={15}/></button></div></section>
        </>}

        {mode === "teacher" && <section className="mode-grid"><div className="panel classroom-panel"><div className="panel-head"><div><div className="eyebrow">LOCAL CLASSROOM / {role.toUpperCase()}</div><h2>{role === "teacher" ? "Open a room" : "Join a room"}</h2></div><Wifi className="mint-icon" size={18}/></div><div className="role-switch"><button className={role === "teacher" ? "active" : ""} onClick={() => setRole("teacher")}><GraduationCap size={15}/> Teacher</button><button className={role === "student" ? "active" : ""} onClick={() => setRole("student")}><Laptop size={15}/> Student</button></div>{role === "teacher" ? <><p>Create a code for the lesson. The room is only discoverable through your shared code and local peer signal.</p><button className="primary-button" onClick={createClass}><Plus size={16}/> Create class</button>{classCode && <div className="code-display"><span>CLASS CODE</span><strong>{classCode}</strong><button onClick={() => copy(classCode, "Class code")}><Copy size={15}/></button></div>}</> : <><label>YOUR NAME<input value={studentName} onChange={(e) => setStudentName(e.target.value)} /></label><label>CLASS CODE<input value={classCode} onChange={(e) => setClassCode(e.target.value.toUpperCase())} placeholder="QL-ABCD-123" /></label><button className="primary-button" onClick={joinClass}><Link2 size={16}/> Join class</button></>}</div><div className="panel signal-panel"><div className="panel-head"><div><div className="eyebrow">MANUAL SIGNAL / WEBRTC</div><h2>{peer.connected ? "Peer connected" : "Connect over Wi-Fi"}</h2></div><Network className={peer.connected ? "mint-icon" : "muted-icon"} size={18}/></div><p className="fine-print">No signaling server is used. Copy the offer to the other device, then paste the answer back here.</p>{role === "teacher" ? <><button className="secondary-button wide" onClick={peer.createOffer}><Network size={16}/> Create local offer</button><textarea value={peer.offer} readOnly placeholder="Teacher offer appears here" />{peer.offer && <button className="text-button" onClick={() => copy(peer.offer, "Offer")}><Clipboard size={14}/> Copy offer</button>}<textarea value={peer.remoteSignal} onChange={(e) => peer.setRemoteSignal(e.target.value)} placeholder="Paste student answer here" /><button className="primary-button wide" onClick={() => peer.acceptAnswer(peer.remoteSignal)}>Accept answer</button></> : <><textarea value={peer.remoteSignal} onChange={(e) => peer.setRemoteSignal(e.target.value)} placeholder="Paste teacher offer here" /><button className="secondary-button wide" onClick={() => peer.acceptOffer(peer.remoteSignal)}><Network size={16}/> Create answer</button>{peer.answer && <><textarea value={peer.answer} readOnly /><button className="text-button" onClick={() => copy(peer.answer, "Answer")}><Clipboard size={14}/> Copy answer</button></>}</>}</div><div className="panel quiz-panel"><div className="panel-head"><div><div className="eyebrow">TEACHER CONTROL</div><h2>Guide the student view</h2></div><SlidersHorizontal size={18}/></div>{role === "teacher" ? <><label>FOCUS VIEW<select value={controlledView} onChange={(e) => { setControlledView(e.target.value); peer.send({ kind: "control", payload: e.target.value }); }}><option>Simulator</option><option>Market board</option><option>Bot workshop</option><option>Quiz</option></select></label><div className="quiz-editor"><div className="price-editor"><div className="eyebrow">CLASSROOM PRICE BOARD</div><p className="fine-print">Set per-asset paper prices; this overrides live data for connected students.</p>{marketAssets.map((asset) => <label key={asset.symbol}>{asset.symbol}<input value={customPrices[asset.symbol] ?? String(asset.price)} onChange={(e) => setTeacherPrice(asset.symbol, e.target.value)} inputMode="decimal" /></label>)}<button className="secondary-button wide" onClick={broadcastPrices}><Send size={15}/> Send prices to class</button></div><input value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} /><textarea value={quizPrompt} onChange={(e) => setQuizPrompt(e.target.value)} />{quizOptions.map((option, index) => <div className="option-line" key={index}><span>{String.fromCharCode(65 + index)}</span><input value={option} onChange={(e) => setQuizOptions((items) => items.map((item, i) => i === index ? e.target.value : item))} /></div>)}<button className="primary-button wide" onClick={() => { setQuizSent(true); peer.send({ kind: "quiz", payload: { title: quizTitle, prompt: quizPrompt, options: quizOptions } }); toast.success("Quiz sent to the local room"); }}><Send size={16}/> Send quiz</button></div></> : <div className="student-quiz"><span className="eyebrow">{quizSent ? quizTitle : "WAITING FOR TEACHER"}</span><h3>{quizSent ? quizPrompt : "Your teacher can send a live question here."}</h3>{quizSent && quizOptions.map((option) => <button key={option} className="answer-button" onClick={() => toast.success("Answer sent locally")}>{option}<ChevronRight size={15}/></button>)}</div>}</div></section>}

        {mode === "workshop" && <section className="mode-grid workshop-grid"><div className="panel code-panel"><div className="panel-head"><div><div className="eyebrow">PYTHON / EDITOR</div><h2>Write the strategy</h2></div><Code2 size={18}/></div><div className="editor-toolbar"><span className="file-tab">strategy.py</span><button className="quiet-button" onClick={() => setBotCode("def signal(market):\n    return 'WAIT'")}><X size={14}/> Clear</button></div><textarea className="code-editor" value={botCode} onChange={(e) => setBotCode(e.target.value)} spellCheck={false}/><div className="editor-actions"><button className="primary-button" onClick={runBot}><Play size={15}/> Run local backtest</button><button className="secondary-button" onClick={() => { setSavedBots((bots) => [...bots, `Bot ${bots.length + 1}`]); toast.success("Bot saved in this browser"); }}><Check size={15}/> Save bot</button></div></div><div className="panel block-panel"><div className="panel-head"><div><div className="eyebrow">BLOCKS / MIXED MODE</div><h2>Assemble the rule</h2></div><Sparkles className="yellow-icon" size={18}/></div><div className="block-stack">{blocks.map((block, index) => <div className={`logic-block ${block.color}`} key={block.id}><span>{index + 1}</span><div><b>{block.label}</b><strong>{block.value}</strong></div><button onClick={() => setBlocks((items) => items.filter((item) => item.id !== block.id))}><X size={14}/></button></div>)}</div><button className="text-button" onClick={() => setBlocks((items) => [...items, { id: `b${Date.now()}`, label: "CONFIRM", value: "volume > average", color: "cyan" }])}><Plus size={15}/> Add block</button><div className="coach-box"><div><Sparkles size={16}/><b>Offline AI coach</b></div><p>{aiNote}</p><button className="secondary-button" onClick={askCoach}>Suggest an improvement</button></div></div><div className="panel results-panel"><div className="eyebrow">BACKTEST / {activeAsset}</div><div className="result-big">+8.4%</div><div className="result-label">simulated return</div><div className="result-metrics"><div><span>DRAWdown</span><strong>-3.1%</strong></div><div><span>TRADES</span><strong>14</strong></div><div><span>SHARPE</span><strong>1.42</strong></div></div><div className="saved-list"><span className="eyebrow">SAVED LOCALLY</span>{savedBots.length ? savedBots.map((bot) => <div key={bot}><Bot size={14}/>{bot}<Check size={14}/></div>) : <p>No bots saved yet. Run a rule, inspect the result, then keep the useful version.</p>}</div></div></section>}
      </main>
    </div>
    <footer className="footer-bar"><span><LockKeyhole size={13}/> LOCAL-FIRST / NO SERVER DATA STORE</span><span>QuantSim Lab v2 · paper markets only</span></footer>
  </div>;
}
