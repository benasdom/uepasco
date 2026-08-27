import styles from "./learningTechniques.module.css";
import racoon from '/imgs/racoon.jpg'
import PWAInstallButton from './PWAInstallButton'

const techniques =[
  {
    num: "01",
    label: "Retrieval Practice",
    title: "Remember repeatedly",
    body: "Recalling information more than once significantly boosts future accessibility in your memory.",
    icon: "🔁",
    accent: "purple",
  },
  {
    num: "02",
    label: "Testing",
    title: "Attempt, don't just read",
    body: "Answering questions or explaining concepts to others reinforces learning and surfaces gaps.",
    icon: "✏️",
    accent: "teal",
  },
  {
    num: "03",
    label: "Spaced Repetition",
    title: "Review over time",
    body: "Revisiting material at increasing intervals trains your brain to keep information long-term.",
    icon: "🕐",
    accent: "purple",
  },
  {
    num: "04",
    label: "Dual Coding",
    title: "Verbal + visual",
    body: "Engaging both language and imagery channels at once dramatically raises the chance of recall.",
    icon: "🖼️",
    accent: "teal",
  },
  {
    num: "05",
    label: "Personal Connection",
    title: "Make it yours",
    body: "Linking new material to your own experiences makes it feel relevant — and far easier to remember.",
    icon: "❤️",
    accent: "purple",
  },
];

export function LearningTechniques() {
  return (
    <div className={styles.wrap}>
        <div className="midmessage">
  <div className="midleft">
<div className="welcome"><i className="bga">🤗</i><span className="welcome" style={{textTransform:"uppercase"}}>{`HI !`}</span>
{/* <span className="prem4 difficon">
  👋🏾
</span> */}
</div>
  <div className="rbackdropa" ></div>
  <div className="rbackdropb" ></div>
  <div className="rbackdropc" ></div>

<div className={`welcmessage`} id="welcid">
Practice makes perfect. Keep your self busy with the resources we provide.
</div>

{/* <>Download Now !</> */}
<PWAInstallButton />
  </div>
  
  <div className="midleft">
  <img className="messagepic" src={racoon} alt=""/>
  </div>

      </div>
      <div className={styles.glowA} aria-hidden="true" />
      <div className={styles.glowB} aria-hidden="true" />

      <p className={styles.eyebrow}>⚙ What we help you solve</p>
      <h2 className={styles.heading}>Learn smarter, not harder.</h2>
      <p className={styles.intro}>
        Modern psychology shows the best way to retain knowledge is through
        active learning — techniques that make your brain work to recall
        information, not just passively absorb it.
      </p>

      <div className={styles.grid}>
        {techniques.map((t) => (
          <div
            key={t.num}
            className={`${styles.card} ${styles[`card--${t.accent}`]}`}
          >
            <span className={styles.cardIcon} aria-hidden="true">
              {t.icon}
            </span>
            <p className={`${styles.cardNum} ${styles[`num--${t.accent}`]}`}>
              {t.num} — {t.label}
            </p>
            <p className={styles.cardTitle}>{t.title}</p>
            <p className={styles.cardBody}>{t.body}</p>
          </div>
        ))}
      </div>

      <p className={styles.footer}>
        These strategies are grounded in decades of cognitive research, designed
        to give you the most from every hour you study.
      </p>
    </div>
  );
}