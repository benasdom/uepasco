import {useState,useEffect,useMemo,useRef} from 'react';
import racoonread from '/imgs/racoon_learn.jpg'
import { LocalApiPath } from './menu/authfetch';
import {
  RobotOutlined, ThunderboltOutlined, WarningOutlined,
  CloseOutlined, ArrowRightOutlined, InboxOutlined,
  SearchOutlined, CheckCircleFilled,
} from '@ant-design/icons';

const ModelComponent=({setselectModel,selectlink,getpayload,setselectedVal,selectedVal,credits})=>{
    const [listed,setlisted]=useState({});
    const [error,seterror]=useState(null);
    const [loaded,setloaded]=useState(false);
    const [modelSearch,setmodelSearch]=useState("");
    const [dropdownOpen,setdropdownOpen]=useState(false);

    const pickerRef = useRef(null);
    const inputRef  = useRef(null);

    const progressed=(e)=>{
        e.preventDefault();
        getpayload(selectlink)
setselectModel(false);
    }
    const unmountme=()=>{
        setselectModel(false);
    }
    
    const fetchModels = () => {
        setloaded(false);
        seterror(null);
        fetch(`${LocalApiPath}/api/files/models`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                // /api/files/models now returns the model map directly
                // (e.g. { "Gemini 3": "gemini-3-pro-preview", ... }),
                // not wrapped in a `modelsobject` key.
                if (!data || typeof data !== 'object' || Array.isArray(data)) {
                    console.warn("Invalid response structure:", data);
                    seterror("Invalid model data received");
                    setlisted({});
                } else if (Object.keys(data).length === 0) {
                    // Valid but empty — surface as an error state rather
                    // than silently showing "No models available" forever,
                    // since an empty catalog usually means every provider
                    // fetch failed server-side.
                    seterror("No models are currently available. Please retry.");
                    setlisted({});
                } else {
                    setlisted(data);
                    seterror(null);
                }
                setloaded(true);
            })
            .catch(err => {
                console.error("Error fetching models:", err);
                seterror(err.message || "Failed to load models. Please check your connection.");
                setloaded(true);
            });
    }
    const notfound=(e)=>{
        e.preventDefault();
        seterror("Try again.");
    }
    
    useEffect(() => {
    fetchModels();
}, [])

    // [name, apiValue] pairs, filtered live as modelSearch changes.
    const modelEntries = useMemo(() => {
        const term = modelSearch.trim().toLowerCase();
        return Object.entries(listed).filter(([name]) =>
            !term || name.toLowerCase().includes(term)
        );
    }, [listed, modelSearch]);

    const selectedName = useMemo(() => {
        const match = Object.entries(listed).find(([, val]) => val === selectedVal);
        return match?.[0] ?? "";
    }, [listed, selectedVal]);

    // Close the dropdown on outside click / Escape — standard combobox behaviour.
    useEffect(() => {
        if (!dropdownOpen) return;
        const handleClick = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) {
                setdropdownOpen(false);
            }
        };
        const handleKey = (e) => {
            if (e.key === "Escape") {
                setdropdownOpen(false);
                inputRef.current?.blur();
            }
        };
        document.addEventListener("mousedown", handleClick);
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("keydown", handleKey);
        };
    }, [dropdownOpen]);

    const handleSelect = (name, value) => {
        setselectedVal(value);
        setmodelSearch(name);
        setdropdownOpen(false);
    };

return (
    <div className="mselect">

        <div className="mcontainer">
            <div className="rbackdrop" style={{transform:"rotate(180deg)",opacity:.3,height:"600px"}}></div>
        <img src={racoonread} className="racoonload" style={{borderRadius:0,height:150}} alt="" />
        <div className="closeme" onClick={unmountme}><CloseOutlined /></div>

        {/* Credits pill — top-center, same ⚡-icon language as Dashboard.jsx's
            db-icon-chip and Showfiles.jsx's sf-credits-pill, so credits read
            the same way everywhere in the app. */}
        <div className="mcredits">
            <span className="mcredits-icon"><ThunderboltOutlined /></span>
            <strong className="mcredits-count">{credits ?? 0}</strong>
            <span className="mcredits-label">credits</span>
        </div>

<div className="mchoice">
    <span className='fnav'><span className="solstar bga mchoice-icon"><RobotOutlined /></span></span><br/>
    <span className="mchoice" style={{fontSize:20,fontWeight:700}}>Choose AI Model</span>
</div>
<div className="mchoice2">
     <div className='fnav'><InboxOutlined /></div>Proceed with your prefered AI model:</div>
    <span className="mchoice3">{" "+(selectedName || selectedVal || "")}</span>

       {error ? (
            <div className="mtop">
                <div className="list" style={{ height:60,display:"flex",alignItems:"center",gap:8,color:"#ff6b6b", paddingRight:"10px"}}><WarningOutlined /> {error}</div>
                <div style={{color:"white", cursor:"pointer"}} className="download" onClick={fetchModels} >Retry</div >
            </div>
        ) : Object.keys(listed).length > 0 ? (
            /* Combobox: typing filters live, and the option list is a small
               floating panel that only appears (above the search bar) while
               the field is focused — not a permanently-open list, and not a
               native <input list>/<datalist> popup either. */
            <div className="mmodel-picker" ref={pickerRef}>
                {dropdownOpen && (
                    <div className="mmodel-dropdown" role="listbox">
                        {modelEntries.length > 0 ? (
                            modelEntries.map(([name, value]) => {
                                const active = value === selectedVal;
                                return (
                                    <button
                                        type="button"
                                        key={name}
                                        role="option"
                                        aria-selected={active}
                                        className={`mmodel-item ${active ? 'mmodel-item--active' : ''}`}
                                        // onMouseDown (not onClick) fires before the input's onBlur,
                                        // so the selection registers before the dropdown would close.
                                        onMouseDown={(e) => { e.preventDefault(); handleSelect(name, value); }}
                                    >
                                        <span className="mmodel-item__icon"><RobotOutlined /></span>
                                        <span className="mmodel-item__name">{name}</span>
                                        {active && <CheckCircleFilled className="mmodel-item__check" />}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="mmodel-empty">No models match “{modelSearch}”</div>
                        )}
                    </div>
                )}

                <div className="mmodel-search">
                    <SearchOutlined className="mmodel-search__icon" />
                    <input
                        ref={inputRef}
                        type="text"
                        inputMode="search"
                        className="mmodel-search__input"
                        placeholder="Search models…"
                        value={modelSearch}
                        onFocus={(e) => { setdropdownOpen(true); e.target.select(); }}
                        onChange={(e) => { setmodelSearch(e.target.value); setdropdownOpen(true); }}
                    />
                    {modelSearch && (
                        <button
                            type="button"
                            className="mmodel-search__clear"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => { setmodelSearch(""); inputRef.current?.focus(); }}
                            aria-label="Clear search"
                        >
                            <CloseOutlined />
                        </button>
                    )}
                </div>
            </div>
        ) : (
            <div className="mtop">
                <div className="list" style={{height:60,display:"flex",alignItems:"center",justifyContent:"center"}}>{loaded ? "No models available" : "Loading models..."}</div>
            </div>
        )}
        <button className="mbottom download" style={{color:"white"}} onClick={selectlink && selectedVal?progressed:notfound}>
    <span className='fnav'><ArrowRightOutlined /></span>
            
            continue<span className="prem4"></span></button>

        <style>{`
            .mcredits {
                position: absolute;
                top: 14px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 3;
                display: flex;
                align-items: center;
                gap: 6px;
                background: #1e1e2a;
                border: 1px solid #2e2e3a;
                border-radius: 20px;
                padding: 5px 12px;
                font-size: 12px;
                color: #fbbf24;
            }
            .mcredits-icon { font-size: 12px; display: flex; align-items: center; }
            .mcredits-count { color: #fff; font-weight: 700; }
            .mcredits-label { color: #94a3b8; }
            .mchoice-icon { display: inline-flex; align-items: center; justify-content: center; font-size: 20px; }

            /* ── Combobox model picker ── */
            .mmodel-picker {
                position: relative;
                width: 100%;
                box-sizing: border-box;
            }

            .mmodel-search {
                display: flex;
                align-items: center;
                gap: 8px;
                background: #1a1a2242;
                border: 1px solid #2a2a3841;
                border-radius: 10px;
                padding: 10px 14px;
                margin:0 auto;
                width:calc(100% - 60px);
                box-sizing: border-box;
                position: relative;
                z-index: 1;
            }
            .mmodel-search__icon { color: #666; font-size: 14px; flex-shrink: 0; }
            .mmodel-search__input {
                flex: 1;
                background: transparent;
                border: none;
                outline: none;
                color: #e8e8e8;
                font-size: 15px;
                min-width: 0;
            }
            .mmodel-search__input::placeholder { color: #fcf7f778; }
            .mmodel-search__clear {
                background: transparent;
                border: none;
                color: #777;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 4px;
                flex-shrink: 0;
            }
            .mmodel-search__clear:hover { color: #fff; }

            /* Floating panel, positioned to sit on top of (above) the search
               bar, capped at 100px so it's always a compact scrollable strip
               rather than a big list taking over the screen. */
            .mmodel-dropdown {
                position: absolute;
                left: 0;
                right: 0;
                bottom: calc(100% + 6px);
                max-height: 300px;
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
                display: flex;
                flex-direction: column;
                gap: 4px;
                background: #17171d;
                border: 1px solid #2a2a38;
                border-radius: 10px;
                padding: 6px;
                box-sizing: border-box;
                box-shadow: 0 -10px 28px rgba(0,0,0,.5);
                z-index: 30;
                animation: mmodel-pop .12s ease;
            }
            .mmodel-dropdown::-webkit-scrollbar { width: 4px; }
            .mmodel-dropdown::-webkit-scrollbar-thumb { background: #2a2a38; border-radius: 4px; }

            @keyframes mmodel-pop {
                from { opacity: 0; transform: translateY(4px); }
                to   { opacity: 1; transform: translateY(0); }
            }

            .mmodel-item {
                display: flex;
                align-items: center;
                gap: 8px;
                width: 100%;
                box-sizing: border-box;
                background: transparent;
                border: 1px solid transparent;
                border-radius: 8px;
                padding: 8px 8px;
                min-height: 34px;
                color: #d5d5dd;
                font-size: 13px;
                text-align: left;
                cursor: pointer;
                flex-shrink: 0;
                transition: background .12s, border-color .12s, color .12s;
            }
            .mmodel-item:hover { background: #1d1d26; border-color: #2e2e3a; }
            .mmodel-item--active {
                background: #1e1b4b;
                border-color: #4338ca;
                color: #c7d2fe;
            }
            .mmodel-item__icon {
                flex-shrink: 0;
                width: 22px;
                height: 22px;
                border-radius: 6px;
                background: rgba(255,255,255,.06);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                color: #9ca3af;
            }
            .mmodel-item--active .mmodel-item__icon { background: rgba(99,102,241,.25); color: #a5b4fc; }
            .mmodel-item__name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .mmodel-item__check { color: #818cf8; font-size: 13px; flex-shrink: 0; }

            .mmodel-empty {
                padding: 10px 8px;
                text-align: center;
                color: #666;
                font-size: 12px;
            }
        `}</style>

        </div>
    </div>
)
}
export default ModelComponent;