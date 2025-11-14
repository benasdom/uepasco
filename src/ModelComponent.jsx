import {useState,useEffect} from 'react';
import racoonread from '/imgs/racoon_learn.jpg'

const ModelComponent=({setselectModel,setselectedVal,selectedVal,setselecttrue})=>{
    const [listed,setlisted]=useState({});
    const handleChange=(e)=>{
setselectedVal(e.target.value);
    }
    const unmounted=()=>{
        setselecttrue(true);
setselectModel(false);
    }
useEffect(() => {
fetch("http://localhost:5175/api/files/models")
.then(res=>res.json())
.then(res=>setlisted(res.modelsobject))
}, [])

return (
    <div className="mselect">

        <div className="mcontainer">
            <div className="rbackdrop" style={{transform:"rotate(180deg)",height:"600px"}}></div>
        <img src={racoonread} className="racoonload" alt="" srcset="" />
<div className="mchoice">
    <span className="mchoice" style={{fontSize:20,fontWeight:700}}>Choose AI Model</span>
</div>
            <div className="mchoice">Proceed with your prefered AI model:<span className="mchoice" style={{color:"lime"}}>{" "+selectedVal}</span></div>
        <div className="mtop">
             <input list="list" onChange={handleChange} className="select"/>
            <datalist id="list" value={selectedVal}  >
                <option value="gemini-2.5-flash">gemini 2.5 flash</option>
                {/*
                <option value="openai/gpt-5.0">GPT 5.0</option>
                <option value="openai/gpt-4o">GPT 4o</option>
                <option value="openai/gpt-4.0">GPT 4.0</option>
                <option value="">Deepseek</option>
                <option value="">Co-pilot</option>
                <option value="">AI</option> 
                */}
                {Object.keys(listed).map((a,b)=><option value={listed[a]} key={b+"-"}>{a}</option>)}
            </datalist>
        </div>
        <div className="mbottom download" onClick={unmounted}>Go back <span className="prem4"></span></div>
        

        </div>
    </div>
)
}
export default ModelComponent;