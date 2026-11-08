import {useRef,useState} from 'react';
import emailjs from '@emailjs/browser';
import {contactLinks} from './publicContent';
export default function ContactForm({draft,onDraftChange,idPrefix='contact',embedded=false,onDraftReset,showActions=true}){
 const formRef=useRef(null);const [fieldErrors,setFieldErrors]=useState({});const [success,setSuccess]=useState(false);const [loading,setLoading]=useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await emailjs.sendForm(
        "service_p24wmf8",
        "template_fqxlctt",
        formRef.current,
        "GVcbG8IKCsgussbRL",
      );

      setSuccess(true);
      formRef.current.reset();
      onDraftReset?.();
    } catch (error) {
      console.error("EmailJS FULL ERROR:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

 return (              <form
                ref={formRef}
                className="contact-form grid gap-5" onChange={e=>onDraftChange?.({[e.target.name]:e.target.value})}
                onInvalid={e => {
                  const field = e.target;
                  const messages = {name: 'Enter your name.', email: 'Enter your business email.', message: 'Tell us about your business and what you want to build.'};
                  setFieldErrors(errors => ({...errors, [field.name]: messages[field.name] || field.validationMessage}));
                }}
                onInput={e => {
                  const field = e.target;
                  if (field.validity.valid) setFieldErrors(errors => ({...errors, [field.name]: undefined}));
                }}
                onSubmit={handleSubmit}
              >
                <div className="contact-field">
                  <label htmlFor={`${idPrefix}-name`}>Your name <span>(required)</span></label>
                  <input id={`${idPrefix}-name`} name="name" defaultValue={draft?.name || ""} required
                    placeholder="Your name"
                    aria-invalid={fieldErrors.name ? true : undefined}
                    aria-describedby={fieldErrors.name ? `${idPrefix}-name-error` : undefined}
                    className="rounded-xl border border-gray-300 bg-[#F9FAFB] px-4 py-3 text-[#111827] placeholder:text-[#9CA3AF]"
                  />
                  {fieldErrors.name && <p id={`${idPrefix}-name-error`} className="contact-error" role="alert">{fieldErrors.name}</p>}
                </div>

                <div className="contact-field">
                  <label htmlFor={`${idPrefix}-email`}>Business email <span>(required)</span></label>
                  <input id={`${idPrefix}-email`} name="email" defaultValue={draft?.email || ""} required
                    placeholder="Business email"
                    aria-invalid={fieldErrors.email ? true : undefined}
                    aria-describedby={fieldErrors.email ? `${idPrefix}-email-error` : undefined}
                    className="rounded-xl border border-gray-300 bg-[#F9FAFB] px-4 py-3 text-[#111827] placeholder:text-[#9CA3AF]"
                  />
                  {fieldErrors.email && <p id={`${idPrefix}-email-error`} className="contact-error" role="alert">{fieldErrors.email}</p>}
                </div>

                <div className="contact-field">
                  <label htmlFor={`${idPrefix}-message`}>How can we help? <span>(required)</span></label>
                  <textarea id={`${idPrefix}-message`} name="message" defaultValue={draft?.message || ""} required rows={5}
                    placeholder="Tell me about your business and what you want to build"
                    aria-invalid={fieldErrors.message ? true : undefined}
                    aria-describedby={fieldErrors.message ? `${idPrefix}-message-error` : undefined}
                    className="rounded-xl border border-gray-300 bg-[#F9FAFB] px-4 py-3 text-[#111827] placeholder:text-[#9CA3AF]"
                  />
                  {fieldErrors.message && <p id={`${idPrefix}-message-error`} className="contact-error" role="alert">{fieldErrors.message}</p>}
                </div>

                <button
                  type="submit"
                  className="rounded-2xl bg-[#0A84FF] px-6 py-3 font-semibold text-white shadow-lg shadow-[#0A84FF]/25 transition hover:scale-[1.02] hover:opacity-90"
                >
                  {loading ? "Sending..." : "Submit Request"}
                </button>

                {showActions && <>
                <div className="grid gap-3 sm:grid-cols-3">
                  <a
                    href={contactLinks.booking}
                    className="rounded-2xl bg-[#0A84FF] px-6 py-3 text-center font-semibold text-white shadow-lg shadow-[#0A84FF]/25 transition hover:scale-[1.02] hover:opacity-90"
                  >
                    Book Consultation{embedded ? " — opens outside office" : ""}
                  </a>

                  <a
                    href={contactLinks.sms}
                    className="rounded-2xl border border-gray-300 bg-white px-6 py-3 text-center font-semibold text-[#111827] transition hover:bg-gray-50"
                  >
                    Text Us{embedded ? " — opens outside office" : ""}
                  </a>

                  <a
                    href={contactLinks.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-[#0A84FF]/30 bg-[#0A84FF]/10 px-6 py-3 text-center font-semibold text-[#0A84FF] transition hover:bg-[#0A84FF] hover:text-white"
                  >
                    WhatsApp{embedded ? " — opens outside office" : ""}
                  </a>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-[#6B7280]">
                  <a
                    href={contactLinks.messenger}
                    target="_blank"
                    rel="noreferrer"
                    className="transition hover:text-[#111827]"
                  >
                    Messenger{embedded ? " — opens outside office" : ""}
                  </a>

                  <a
                    href={contactLinks.email}
                    className="transition hover:text-[#111827]"
                  >
                    Email{embedded ? " — opens outside office" : ""}
                  </a>

                  <a
                    href={contactLinks.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="transition hover:text-[#111827]"
                  >
                    Instagram{embedded ? " — opens outside office" : ""}
                  </a>

                  <a
                    href={contactLinks.call}
                    className="transition hover:text-[#111827]"
                  >
                    Call{embedded ? " — opens outside office" : ""}
                  </a>
                </div>

                </>}

                {success && (
                  <p className="text-center text-sm text-[#0A84FF]">
                    Request sent successfully 🚀
                  </p>
                )}

                <p className="text-center text-xs text-[#EF4444]">
                  Takes 15 minutes • No commitment • Limited build spots this
                  month
                </p>
              </form>);
}
