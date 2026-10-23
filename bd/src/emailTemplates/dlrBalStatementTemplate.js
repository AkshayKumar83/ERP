module.exports = (data, toDate) => {
    return `

        <p>Dear Dealer Member,</p>

        <p>
            We are pleased to forward herewith your
            <strong>Statement of Account (SOA) as on ${toDate}</strong>
            for your kind review and reconciliation with your books of account.
        </p>

        <p>
            You are requested to verify the details and balances reflected in
            the SOA and intimate EDDAL in case of any discrepancy or difference
            in our records vis-à-vis your books of account.
        </p>

        <p>
            In the absence of any communication from your end
            <strong>within 7 days from the date of this communication</strong>,
            it will be presumed that the Statement of Account provided by EDDAL
            has been duly reconciled and the information contained therein is
            <strong>true and correct as per your records</strong>.
        </p>

        <p>
            Should you require any clarification or further information in
            relation to the SOA, you are most welcome to contact us.
            We will be happy to assist you.
        </p>

        <p>
            We look forward to your confirmation and continued cooperation.
        </p>

        <br>

        <p>Best Regards,</p>

        <p>
            <strong>TEAM-EDDAL</strong>
        </p>
    `;
};