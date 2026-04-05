import {useState,useEffect} from 'react';
import racoonread from '/imgs/racoon_learn.jpg'
import { LocalApiPath } from './menu/authfetch';

const ModelComponent=({setselectModel,selectlink,getpayload,setselectedVal,selectedVal})=>{
    const [listed,setlisted]=useState({});
    const [error,seterror]=useState(null);
    const [loaded,setloaded]=useState(false);
    const handleChange=(e)=>{
setselectedVal(e.target.value);
    }
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
            .then(res => {
                if (!res || typeof res.modelsobject !== 'object') {
                    console.warn("Invalid response structure:", res);
                    seterror("Invalid model data received");
                    setlisted({});
                } else {
                    setlisted(res.modelsobject);
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

return (
    <div className="mselect">

        <div className="mcontainer">
            <div className="rbackdrop" style={{transform:"rotate(180deg)",opacity:.3,height:"600px"}}></div>
        <img src={racoonread} className="racoonload" style={{borderRadius:0,height:150}} alt="" />
        <div className="closeme" onClick={unmountme}><i className='fa fa-close'></i></div>
<div className="mchoice">
    <span className='fnav'><span className=".solstar bga">💫</span></span><br/>
    <span className="mchoice" style={{fontSize:20,fontWeight:700}}>Choose AI Model</span>
</div>
<div className="mchoice2">
     <div className='fnav'><i className='fa fa-box fa-dark'></i></div>Proceed with your prefered AI model:</div>
    <span className="mchoice3">{" "+selectedVal}</span>
       {error ? (
            <div className="mtop">
                <div className="list" style={{ height:60,display:"flex",alignItems:"center",color:"#ff6b6b", paddingRight:"10px"}}>⚠️ {error}</div>
                <div style={{color:"white", cursor:"pointer"}} className="download" onClick={fetchModels} >Retry</div >
            </div>
        ) : Object.keys(listed).length > 0 ? (
            <div className="mtop">
                <input list="list" onChange={handleChange} className="select"/>
                <datalist id="list" value={selectedVal}>
                    {Object.keys(listed).map((a,b)=><option value={listed[a]} key={b+"-"}>{a}</option>)}
                </datalist>
            </div>
        ) : (
            <div className="mtop">
                <div className="list" style={{height:60,display:"flex",alignItems:"center",justifyContent:"center"}}>{loaded ? "No models available" : "Loading models..."}</div>
            </div>
        )}
        <button className="mbottom download" style={{color:"white"}} onClick={selectlink && selectedVal?progressed:notfound}>
    <span className='fnav'><i className="fa fa-arrow-right"></i></span>
            
            continue<span className="prem4"></span></button>
        

        </div>
    </div>
)
}
export default ModelComponent;