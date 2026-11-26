import { cn } from "@/lib/utils";

/**
 * The enquiry box used across the site.
 *
 * Enquiries are collected by a Zoho Forms form embedded inline, so a visitor
 * never leaves the page. Submissions arrive in Zoho rather than the dashboard.
 */
const ZOHO_FORM_SRC =
  "https://forms.zohopublic.com/danishhomepropertiesgm1/form/ResidentialRentalApplicationForm/formperma/4PkWcakVCeFRcW12fFCSXbjaNpBVwn8t9b0S9NXuOKc";

export function EnquiryBox({
  heading,
  description,
  className,
}: {
  heading?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      {heading || description ? (
        <div>
          {heading ? (
            <h3 className="font-display text-[1.6rem] leading-snug text-ink">{heading}</h3>
          ) : null}
          {description ? (
            <p className="mt-3 font-sans text-[0.88rem] leading-relaxed text-stone">{description}</p>
          ) : null}
        </div>
      ) : null}

      <iframe
        title="Enquiry form"
        src={ZOHO_FORM_SRC}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-[900px] w-full border-0 bg-white"
      />

      <p className="font-sans text-[0.72rem] leading-relaxed text-mist">
        Your details are held in confidence and are never shared with third parties.
      </p>
    </div>
  );
}
