
const Dashboard=()=>{
    return (
          <div className="userlevel">
                <div className="levelitem">

                    <div className="litem">
                        <div className="hint">level</div>
                    <div className="hint"> badge</div>

                    </div>

                    <div className="litem">
                        <div className="hint"> <div className="mtext">Rookie level</div></div>
                        <div className="hint"><div className="pic"> 🥈</div></div>

                    </div>

                </div>
                <div className="levelitem2">
                    <div className="streak">⚡STREAK⚡</div>
                    <div className="streaka">
                        <div className="hint">streak score</div>
                        <div className="hint">Highest streak</div>
                    </div>
                    <div className="streaks">
                        <div className="hint">0</div>
                        <div className="hint">1</div>

                    </div>
                    <div className="streak"></div>
                </div>
            </div>
    )
}
export default Dashboard;