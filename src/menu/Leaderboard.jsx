import rbadge from '../../public/imgs/leader.png'
import racoonleaderboard from '../../public/imgs/racoon_leaderboard.jpg'
import racoonrun from '../../public/imgs/racoon_goldmedal.jpg'
import { EyeInvisibleFilled,EyeFilled,MoneyCollectOutlined,ThunderboltFilled } from '@ant-design/icons'
import { useState } from 'react'

const Leaderboard=()=>{

    const [position, setposition] = useState(0)

    return (
           <div className="rlevel">
            
                           <img src={racoonleaderboard} className="racoonlboard" alt="" srcSet="" />
                       <div className="levelitem2 leaderb">
                           <img src={rbadge} className="refbadge" alt="" srcSet="" />
                        
                             <div className="refpage" style={{fontSize:30,width:200}}>🏁 Leaderboard</div>
               
                         
                     
                           <div className="streak"></div>
                       </div>
                       <div className='yourrefs'>You have (0) referals</div>
                       <div className="reflist">

            {Array(10).fill("").map((a,b)=>
                           <div className='refblock' key={""+b}>
                           <div className='refblockleft'></div>
                           <div className='refblockcenter'>
       
                               <div className="refblockcenterdivone">Benjamin</div>
                               <div className="refblockcenterdiv"> {new Date().toISOString().slice(0,10)}</div>
                           </div>
                                               <div className='refblockend'><div className="fnav">
                                                <div className="fa fa-zap"></div>
                                                </div><div className="fnav">{b+1}</div></div>
       
                           </div>
                       )}
                                         <div className="streak" style={{margin:10}}></div>
       
                       </div>
                  
                   </div>
    )
}
export default Leaderboard;