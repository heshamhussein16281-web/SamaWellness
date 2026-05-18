// Services, Process

const SERVICES = [
{
  title: "Individual Therapy",
  desc: "Focused one-on-one sessions helping you explore personal challenges, manage stress, and develop healthy coping strategies in a safe clinical space.",
  image: "assets/individual-therapy.jpg"
},
{
  title: "Couple Therapy",
  desc: "Professional guidance for partners looking to improve communication, resolve recurring conflicts, and build a stronger relational foundation together.",
  image: "assets/couple-therapy.jpg"
},
{
  title: "Group Therapy",
  desc: "Healing within a clinically guided community. Shared experiences provide mutual support and diverse perspectives on your path to wellness.",
  image: "assets/group-therapy.jpg"
}];


const PROCESS_STEPS = [
{ image: "assets/initial-form.jpg", title: "Initial Screening Form" },
{ image: "assets/assessment.jpg", title: "15-Min assessment with counsellor Sama" },
{ image: "assets/matched-therapist.jpg", title: "Matched Therapist" }];


function Services() {
  return (
    <section
      id="services"
      style={{
        backgroundColor: "rgb(234, 228, 221)",
        width: "100%",
        minHeight: "768px",
        padding: "28px 0"

      }}>
      
      <h2 style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(26px, 2.57vw, 44px)",
        fontWeight: 400,
        color: "rgb(45, 74, 70)",
        textAlign: "center",
        marginBottom: "20px",
        marginTop: 0,
        lineHeight: 1.15
      }}>
        Healing Support &amp; Specialized Care
      </h2>

      <div className="services-grid" style={{
        display: "flex",
        justifyContent: "space-evenly",
        alignItems: "stretch",
        flexWrap: "wrap",
        rowGap: "28px"
      }}>
        {SERVICES.map((s, i) =>
        <div key={i} style={{
          backgroundColor: "#F5F2EE",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "445.94px",
          flexShrink: 0,
          padding: "53px"
        }}>
            <div className="img-zoom" style={{ borderRadius: "4px", width: "339px", height: "255px", marginBottom: "28px" }}>
              <img
              src={s.image}
              alt={s.title}
              style={{
                width: "339px",
                height: "255px",
                display: "block",
                objectFit: "cover"
              }} />
            </div>
            <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            width: "339px"
          }}>
              <h3 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(16px, 1.76vw, 30px)",
              fontWeight: 400,
              color: "rgb(45, 74, 70)",
              lineHeight: 1.2,
              margin: 0
            }}>
                {s.title}
              </h3>
              <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(12px, 1vw, 16px)",
              fontWeight: 300,
              color: "rgb(45, 74, 70)",
              lineHeight: 1.75,
              margin: 0
            }}>
                {s.desc}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>);

}

function Process() {
  return (
    <section id="process" style={{ backgroundColor: "#F5F2EE", borderTop: "1px solid rgb(234,228,221)", padding: "96px 0" }}>
      <div style={{ width: "100%", padding: "0 12.7vw" }}>
        <ScrollReveal>
          <h2 className="reveal" style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(32px, 3.75vw, 64px)",
            fontWeight: 400,
            color: "rgb(45, 74, 70)",
            textAlign: "center",
            marginBottom: "72px",
            marginTop: 0,
            letterSpacing: "0.01em",
            lineHeight: 1.2
          }}>
            The Matching Process Simplified
          </h2>
        </ScrollReveal>

        <ScrollReveal>
          <div className="process-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px" }}>
            {PROCESS_STEPS.map((s, i) =>
            <div key={i} className="reveal" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div style={{ backgroundColor: "#EAE4DD", padding: "40px 55px", marginBottom: "32px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img
                  src={s.image}
                  alt={s.title}
                  style={{ width: "171px", height: "171px", objectFit: "contain", display: "block" }} />
                
                </div>
                <h3 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(20px, 2.2vw, 37px)",
                fontWeight: 400,
                color: "rgb(45, 74, 70)",
                lineHeight: 1.25,
                margin: 0
              }}>
                  {s.title}
                </h3>
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>);

}

Object.assign(window, { Services, Process });