module.exports = () => {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <title>Submission of Pending Invoices</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background-color: #ffffff;
          font-family: Arial, Helvetica, sans-serif;
          color: #333333;
          font-size: 14px;
          line-height: 1.6;
        "
      >

        <div style="padding: 20px;">

          <!-- Date -->
          <p style="margin: 0 0 20px 0;">
            <strong>Date:</strong> ${today}
          </p>


          <!-- Greeting -->
          <p style="margin: 0 0 20px 0;">
            Dear Business Associate,
          </p>

          <!-- Paragraph 1 -->
          <p style="margin: 0 0 20px 0;">
            This is to request you to kindly
            <strong>
              submit all pending invoices against the orders already
              dispatched from your end
            </strong>
            at the earliest, to facilitate timely processing and payment.
          </p>

          <!-- Paragraph 2 -->
          <p style="margin: 0 0 20px 0;">
            Going forward, please ensure that all invoices are submitted
            to EDDAL
            <strong>
              within 15 days from the date of dispatch
            </strong>.
          </p>

          <!-- Paragraph 3 -->
          <p style="margin: 0 0 20px 0;">
            <strong>
              Invoices submitted beyond 15 days from the date of dispatch
              will not be entertained
            </strong>,
            as bulk submission of invoices at a later stage impacts our
            fund-flow planning and may consequently affect the timely
            processing of payments.
          </p>

          <!-- Paragraph 4 -->
          <p style="margin: 0 0 20px 0;">
            We hope you will appreciate the
            <strong>sanctity of this process</strong>
            and extend your full support in implementing this system
            effectively. Your timely submission of invoices will help us
            ensure
            <strong>
              smooth payment processing and avoid any unnecessary
              inconvenience or disappointment
            </strong>.
          </p>

          <!-- Paragraph 5 -->
          <p style="margin: 0 0 20px 0;">
            We request you to kindly review your records and
            <strong>
              submit all pending invoices immediately
            </strong>.
          </p>

          <!-- Paragraph 6 -->
          <p style="margin: 0 0 25px 0;">
            For any clarification or assistance, please feel free to
            connect with <strong>Team-EDDAL</strong>.
          </p>

          <!-- Closing -->
          <p style="margin: 0 0 5px 0;">
            Best Regards,
          </p>

          <p style="margin: 0;">
            <strong>TEAM-EDDAL</strong>
          </p>

        </div>

      </body>
    </html>
  `;
};