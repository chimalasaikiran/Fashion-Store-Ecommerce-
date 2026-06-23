import PageWrapper from '../../components/common/PageWrapper';

export default function HelpCenter() {
  const faqs = [
    {
      q: 'How do I add a new administrator account?',
      a: 'Navigate to the "Users" directory, click on "Add User", fill in the form with their details and select their access role. An invitation link will be sent to their email.'
    },
    {
      q: 'How are refunds processed for returned items?',
      a: 'Go to the "Returns" center to view pending authorization requests. Once verified, click "Approve Refund" to issue a refund back to the customer\'s payment method.'
    },
    {
      q: 'Where can I configure webhook notifications?',
      a: 'Go to the "Settings" tab, scroll down to the "Developers" or "Integrations" section, and paste your active webhook payload URLs.'
    },
    {
      q: 'How do I update product stock status?',
      a: 'Go to the "Products" catalog, click on the specific product item, and update the inventory quantity count in the product details panel.'
    }
  ];

  return (
    <PageWrapper title="Help Center">
      <div className="w-full max-w-4xl mx-auto space-y-8 text-left">
        {/* Support Banner */}
        <div className="bg-[#401900] text-white p-6 sm:p-8 rounded-xl shadow-sm relative overflow-hidden">
          <div className="absolute bg-[#F8B057] opacity-[0.05] rounded-full w-[400px] h-[400px] -top-[200px] -right-[100px] pointer-events-none" />
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight">Need assistance? We're here to help.</h3>
          <p className="text-white/80 text-sm mt-2 max-w-xl">
            Search our knowledge base, read FAQs, or reach out to our system administration technical team.
          </p>
        </div>

        {/* FAQ Section */}
        <section className="space-y-4">
          <h4 className="text-lg font-bold text-[#242424] border-b border-[#E0E0E0] pb-2">
            Frequently Asked Questions
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq, index) => (
              <article
                key={index}
                className="bg-white border border-[#E0E0E0]/60 p-5 rounded-xl hover:border-[#F8B057]/45 transition-colors duration-150 shadow-xs"
              >
                <h5 className="font-bold text-sm text-[#242424] flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#F8B057] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{faq.q}</span>
                </h5>
                <p className="text-xs sm:text-sm text-[#797979] mt-2.5 leading-relaxed">
                  {faq.a}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Contact Tech Support */}
        <section className="bg-white border border-[#E0E0E0]/60 p-6 rounded-xl shadow-xs space-y-4">
          <h4 className="text-lg font-bold text-[#242424]">Direct Support channels</h4>
          <p className="text-sm text-[#797979]">
            If you encounter database issues, downtime, or require higher admin permissions:
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <div className="flex-1 bg-[#F6F6F6] p-4 rounded-lg flex items-center gap-3">
              <div className="w-10 h-10 bg-[#401900]/10 rounded-full flex items-center justify-center text-[#401900]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <span className="text-xs font-bold text-[#797979] block">Email Support</span>
                <a href="mailto:admin-support@fashionstore.com" className="text-sm font-bold text-[#401900] hover:underline">
                  admin-support@fashionstore.com
                </a>
              </div>
            </div>
            <div className="flex-1 bg-[#F6F6F6] p-4 rounded-lg flex items-center gap-3">
              <div className="w-10 h-10 bg-[#401900]/10 rounded-full flex items-center justify-center text-[#401900]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <span className="text-xs font-bold text-[#797979] block">Hotline Support</span>
                <span className="text-sm font-bold text-[#401900]">
                  +1 (800) 555-FSHN (ext. 9)
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
