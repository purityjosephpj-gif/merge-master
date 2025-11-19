import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const FAQ = () => {
  const faqs = {
    general: [
      {
        question: "What is StoryConnect?",
        answer: "StoryConnect is a platform that connects writers with readers. Writers can self-publish their books and drafts, while readers can discover and purchase books directly from authors. We provide tools for publishing, marketing, and community engagement."
      },
      {
        question: "Is it free to join?",
        answer: "Yes! Creating an account as either a reader or writer is completely free. Readers pay only for the books they purchase, while writers can publish for free and keep a majority of their earnings."
      },
      {
        question: "How do I get started?",
        answer: "Simply click 'Get Started' and choose whether you want to join as a reader or writer. Fill out the registration form, and you'll have immediate access to the platform."
      }
    ],
    writers: [
      {
        question: "How do I publish my book?",
        answer: "After creating a writer account, go to your dashboard and click 'New Book'. Upload your manuscript, add a cover, write a description, and set your price. You can publish immediately or save as a draft."
      },
      {
        question: "What formats do you accept?",
        answer: "We accept manuscripts in PDF, DOCX, and EPUB formats. Your book will be converted to a reader-friendly format automatically."
      },
      {
        question: "How much do I earn from sales?",
        answer: "Writers keep 70% of the sale price for each book sold. We handle payment processing, hosting, and platform maintenance with the remaining 30%."
      },
      {
        question: "Can I publish chapter by chapter?",
        answer: "Yes! You can publish your work as a draft and release chapters gradually. This helps build anticipation and allows you to gather feedback as you write."
      }
    ],
    readers: [
      {
        question: "How can I read books for free?",
        answer: "Every book offers the first 3 chapters completely free. You can read these previews before deciding to purchase the full book."
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept M-Pesa mobile money and all major credit/debit cards through our secure payment gateway."
      },
      {
        question: "Can I read on mobile devices?",
        answer: "Yes! Our platform is fully responsive and works on all devices - phones, tablets, and computers."
      },
      {
        question: "How do I follow my favorite authors?",
        answer: "Click the 'Follow' button on any author's profile to stay updated when they release new books or chapters."
      }
    ],
    technical: [
      {
        question: "Is my payment information secure?",
        answer: "Absolutely. We use industry-standard encryption and work with certified payment processors to ensure your information is always protected."
      },
      {
        question: "What if I have technical issues?",
        answer: "Contact our support team through the contact page or email support@storyconnect.com. We typically respond within 24 hours."
      },
      {
        question: "Can I download books?",
        answer: "Once purchased, books are available to read on our platform. We're working on adding downloadable formats in the future."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-muted-foreground text-lg">
            Find answers to common questions about StoryConnect
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* General Questions */}
          <section>
            <h2 className="text-2xl font-bold mb-6">General Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.general.map((faq, index) => (
                <AccordionItem key={index} value={`general-${index}`} className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* For Writers */}
          <section>
            <h2 className="text-2xl font-bold mb-6">For Writers</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.writers.map((faq, index) => (
                <AccordionItem key={index} value={`writers-${index}`} className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* For Readers */}
          <section>
            <h2 className="text-2xl font-bold mb-6">For Readers</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.readers.map((faq, index) => (
                <AccordionItem key={index} value={`readers-${index}`} className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Technical */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Technical & Security</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.technical.map((faq, index) => (
                <AccordionItem key={index} value={`technical-${index}`} className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Still Have Questions */}
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Still have questions?</CardTitle>
              <CardDescription>
                Can't find what you're looking for? Our support team is here to help.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/contact">Contact Support</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/about">Learn More About Us</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQ;
