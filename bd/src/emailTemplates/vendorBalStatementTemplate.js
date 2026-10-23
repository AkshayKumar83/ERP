module.exports = (data, toDate) => {

    console.log("toDate from template ::", toDate);

    return `
        <p>Dear Business Associate,</p>

        <p>
            We are herewith forwarding your
            <strong>Statement of Account (SOA) as on ${toDate}</strong>
            for your kind review and reconciliation with your books of account.
        </p>

        <p>
            You are requested to
            <strong>verify the transactions and balance reflected in the SOA</strong>
            and intimate EDDAL in case of any discrepancy or difference between
            our records and your books of account.
        </p>

        <p>
            In the absence of any communication from your end
            <strong>within 7 days from the date of this communication</strong>,
            it will be presumed that the Statement of Account has been duly
            reconciled and that the information contained therein is
            <strong>true and correct as per your records</strong>.
        </p>

        <p>
            You are welcome to contact us for
            <strong>any further clarification or information</strong>
            relating to the Statement of Account. We will be happy to assist you.
        </p>

        <p>
            We look forward to your cooperation and timely reconciliation.
        </p>

        <br>

        <p>
            Best Regards,
        </p>

        <p>
            <strong>TEAM-EDDAL</strong>
        </p>
    `;
};