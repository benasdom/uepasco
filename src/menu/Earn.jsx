import { useEffect } from 'react'
import rbadge from '../../public/imgs/coinstacked.png'
import racoonearn from '../../public/imgs/racoon_earn.jpg'
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons'

const Earn=()=>{
    useEffect(() => {
    location.href="#earn"
    }, [])
    
    return (
          <div className="userlevel">
           
               <div className="sectionearn">
                 <div className="levelitem2 earnbox" id="earn" style={{height:350}}>
 <img src={rbadge} className="coinstack" alt="" srcSet="" />
                   
                    <div className="streak">Earn</div>
                    
                    <a href="#begin"><div className="seemore"><div className="begin">Begin</div><ArrowRightOutlined/></div></a>
                  {/* <div className="iconlarge">💰</div> */}
                  <img src={racoonearn} className="racoon"/>
                    <div className="wish">
                       <span style={{fontWeight:600}}> What is this about?</span> ( 💸GHS 1,500+ Salary )
                    </div>
                    <div className="tovid">
                        Watch this short video for a precise walk through?
                    </div>
                    
                    <div className="watch">
                        <div className="sp">
                        Watch me 👀
                        <div className="prem2"></div>

                        </div>

                    </div>
                </div>
                <div className="levelitem2 earnbox" id="begin">
                                        <a href="#earn"><div className="seeless"><div className="begin">Return</div><ArrowLeftOutlined/></div></a>

                    Earn
                </div>
               
                </div> 
            </div>

    )
}
export default Earn;