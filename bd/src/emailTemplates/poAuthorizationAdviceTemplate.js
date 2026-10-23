module.exports = (poRecords) => {

    const po = poRecords[0];

    return `
        <p>Date: ${new Date().toLocaleDateString("en-GB")}</p>


        <p>
            Dear Business Associate,
        </p>

        <p>
            We are herewith forwarding the
            <strong>Purchase Advice</strong>
            for onward delivery of the ordered products to our respective
            <strong>Dealer Members</strong>.
        </p>

        <p>
            You are requested to kindly
            <strong>
                process the orders and ensure dispatch within the mutually
                agreed contractual timelines
            </strong>
            to facilitate timely delivery to the concerned dealerships.
        </p>

        <p>
            Please also
            <strong>
                confirm the receipt of the Purchase Advice and the expected
                dispatch date to EDDAL
            </strong>
            for our records and monitoring.
        </p>

        <p>
            Your prompt attention and timely action in this regard will be
            highly appreciated.
        </p>

        <p>
            For any clarification or assistance, please feel free to connect
            with <strong>Team-EDDAL</strong>.
        </p>

        <p>
            Best Regards,
        </p>

        <p>
            <strong>TEAM-EDDAL</strong>
        </p>
    `;
};