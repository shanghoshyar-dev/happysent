import type { Metadata } from "next";

import { BrandName } from "@/components/brand-name";
import { brandify } from "@/lib/brandify";
import { svMarketingPageMeta } from "@/lib/marketing-metadata";

export const metadata: Metadata = svMarketingPageMeta({
  title: "Terms and Conditions | Happysent",
  description:
    "Användarvillkor för Happysents tjänst för företagskunder: leveranser, avbokning, priser och ansvar.",
  path: "/anvandarvillkor",
});

export default function AnvandarvillkorPage() {
  return (
    <article className="font-legal mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-5xl text-slate-900">
        Terms and Conditions: <BrandName className="text-slate-900" />
      </h1>
      <p className="mt-4 text-sm text-slate-500">Last updated: May 2026</p>

      <div className="prose-happysent mt-10 space-y-10 text-base leading-relaxed text-slate-700">
        <p>
          {brandify(
            "These Terms and Conditions govern the use of services provided by Happysent. By becoming a customer of Happysent, you agree to these terms in full.",
          )}
        </p>

        <section>
          <h2 className="font-display text-2xl text-slate-900">
            1. About <BrandName className="text-slate-900" />
          </h2>
          <p className="mt-3">
            {brandify(
              "Happysent is a birthday cake delivery service that automates the process of celebrating employees on their birthdays. Happysent coordinates cake orders with local partner bakeries and manages all communication and logistics on behalf of the customer.",
            )}
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">
            2. Getting Started
          </h2>
          <p className="mt-3">
            {brandify(
              "To use Happysent, the customer provides a list of employees including their names, birthdays and number of people in their department. Happysent registers this information and manages all future deliveries automatically. The customer is responsible for ensuring that they have the necessary consent from their employees to share personal data with Happysent.",
            )}
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">
            3. Deliveries
          </h2>
          <p className="mt-3">
            {brandify(
              "Happysent will send an automatic cake order to the partner bakery seven days before each employee's birthday. The cake will be delivered to the registered company address between 08:00 and 11:00 on the birthday. If the birthday falls on a weekend or Swedish public holiday, the delivery will be moved to the nearest weekday before.",
            )}
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">
            4. Cancellations
          </h2>
          <p className="mt-3">
            {brandify(
              "Cancellations must be made at least 10 days before the scheduled delivery date. Cancellations received less than 10 days before the delivery date will be charged the full price. To cancel a delivery, the customer must contact Happysent in writing via ",
            )}
            <a href="mailto:info@happysent.com">info@happysent.com</a>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">
            5. Adding and Removing Employees
          </h2>
          <p className="mt-3">
            The customer may add or remove employees at any time by submitting a
            request via the contact form on{" "}
            <a href="https://happysent.com">happysent.com</a> or by emailing{" "}
            <a href="mailto:info@happysent.com">info@happysent.com</a>. Changes
            will be processed within two business days.{" "}
            {brandify(
              "Happysent is not responsible for missed deliveries caused by failure to notify us of changes in a timely manner.",
            )}
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">6. Pricing</h2>
          <p className="mt-3">
            {brandify(
              "Pricing is agreed upon individually with each customer and confirmed in writing before the service begins. Prices may be adjusted by Happysent with a minimum of 30 days written notice to the customer.",
            )}
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">
            7. Invoicing and Payment
          </h2>
          <p className="mt-3">
            {brandify(
              "Happysent invoices customers monthly for all deliveries made during that month. Payment is due within 30 days of the invoice date. Late payments are subject to a reminder fee of 60 SEK and interest at a rate of 8% per annum in accordance with Swedish law.",
            )}
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">8. Liability</h2>
          <p className="mt-3">
            {brandify(
              "Happysent works with carefully selected partner bakeries but cannot be held responsible for delays or quality issues caused by the bakery. In the event of a failed delivery, Happysent will offer a credit on the customer's next invoice. Happysent is not liable for indirect losses or damages resulting from a missed or delayed delivery.",
            )}
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">
            9. Data and Privacy
          </h2>
          <p className="mt-3">
            {brandify(
              "Happysent collects and stores employee names, birthdays and company address for the sole purpose of managing deliveries. This data is shared only with the partner bakery responsible for the customer's deliveries. Happysent does not store personal identity numbers, salaries or any other sensitive personal data. Customers may request deletion of their data at any time by contacting ",
            )}
            <a href="mailto:info@happysent.com">info@happysent.com</a>. For full
            details, please refer to our Privacy Policy at{" "}
            <a href="/integritetspolicy">happysent.com/integritetspolicy</a>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">
            10. Termination
          </h2>
          <p className="mt-3">
            Either party may terminate the agreement with 30 days written
            notice. There is no minimum contract period or binding time. Upon
            termination, any outstanding deliveries within the notice period will
            be completed and invoiced as normal.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">
            11. Governing Law
          </h2>
          <p className="mt-3">
            These Terms and Conditions are governed by Swedish law. Any disputes
            shall be resolved in Swedish courts.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-slate-900">12. Contact</h2>
          <p className="mt-3">
            For any questions regarding these terms, please contact us at{" "}
            <a href="mailto:info@happysent.com">info@happysent.com</a>.
          </p>
        </section>
      </div>
    </article>
  );
}
