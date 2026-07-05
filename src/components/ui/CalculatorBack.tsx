import "./CalculatorBack.css";

function CalculatorBack() {
    return (
        <div className="calc-back">
            <div className="calc-back-screw calc-back-screw-tl" aria-hidden="true" />
            <div className="calc-back-screw calc-back-screw-tr" aria-hidden="true" />
            <div className="calc-back-screw calc-back-screw-bl" aria-hidden="true" />
            <div className="calc-back-screw calc-back-screw-br" aria-hidden="true" />
            <div className="calc-back-vents" aria-hidden="true" />
            <div className="calc-back-plate">
                <div className="calc-back-brand">MANUEL MAGANA</div>
                <p>SOFTWARE ENGINEER · MODEL NO. MM-1989</p>
                <p>ASSEMBLED IN LOS ANGELES, CA</p>
            </div>
            <div className="calc-back-spec">
                <div className="calc-back-spec-title">SPECIFICATIONS</div>
                <dl>
                    <dt>LANG</dt>
                    <dd>PYTHON · JAVASCRIPT · GO · JAVA · C · SQL</dd>
                    <dt>SYS</dt>
                    <dd>FASTAPI · DOCKER · AWS · REDIS · POSTGRES</dd>
                    <dt>ML</dt>
                    <dd>PYTORCH · TENSORFLOW · PYSPARK</dd>
                    <dt>EDU</dt>
                    <dd>M.S. COMPUTER SCIENCE · NORTHEASTERN 2026</dd>
                    <dt></dt>
                    <dd>B.A. MCB: NEUROBIOLOGY · UC BERKELEY 2021</dd>
                    <dt>FIELD</dt>
                    <dd>GENENTECH · BIOINFORMATICS SCIENTIST 2022–25</dd>
                </dl>
            </div>
            <div className="calc-back-contact">
                <a href="mailto:manuel.ramon.magana@gmail.com">MANUEL.RAMON.MAGANA@GMAIL.COM</a>
                <span><a href="https://github.com/magana272" target="_blank">GITHUB</a> · <a href="https://www.linkedin.com/in/manuel-magana-359290160/" target="_blank">LINKEDIN</a> · <a href="https://magana272.github.io/portfolio/" target="_blank">PORTFOLIO</a></span>
            </div>
            <div className="calc-back-battery">BATTERY COVER · NO BATTERIES REQUIRED</div>
        </div>
    );
}
export default CalculatorBack;
