/**
 * Public-site copy, taken verbatim from raspixmedia.com (Nov 2026).
 * Edit text here; the page components only handle layout.
 */

export const CONTACT = {
  email: "admin@raspixmedia.com",
  privacyEmail: "info@raspixmedia.com",
  location: "Pune, Maharashtra, India",
  address: "1 Kharadi,EON Free Zone, Knowledge Park, Pune, Maharashtra 411014",
  linkedin: "https://www.linkedin.com/company/raspix-media/",
};

export const SITE_NAV = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about-us" },
  { label: "Services", to: "/services" },
  { label: "Contact Us", to: "/contact-us" },
  { label: "Portfolio", to: "/portfolio" },
];

export const FOOTER = {
  blurb:
    "We help companies deliver critical messages, engage customers, and grow their audience with intelligent email solutions and data-driven insights.",
  quickLinks: [
    { label: "Home", to: "/" },
    { label: "About Us", to: "/about-us" },
    { label: "Services", to: "/services" },
    { label: "Portfolio", to: "/portfolio" },
    { label: "Contact", to: "/contact-us" },
    { label: "Privacy Policy", to: "/privacy-policy" },
  ],
  newsletterTitle: "Stay Updated",
  newsletterText: "Join our newsletter for the latest updates.",
  copyright: "© 2026 RASPIX Media Services. All rights reserved.",
};

/* ---------------- Home ---------------- */

export const HOME = {
  eyebrow: "Digital Business Solution",
  title: ["Accelerate Growth with Smart,", "Scalable Email Marketing"],
  subtitle:
    "Your best bet to get emails delivered to Inbox. Grow your business with reliable, secure, and effective email marketing.",
  cta: "Get Started",
  why: {
    eyebrow: "Why Choose Raspix Media?",
    title: "Built for Businesses That Rely on Email Communication",
    text: "Empowering companies to connect with their customers through timely, targeted email campaigns that drive engagement, build loyalty, and boost ROI.",
    points: [
      { title: "Deliverability", text: "Industry-leading inbox placement for all your emails." },
      { title: "Security", text: "Your data and campaigns are protected with enterprise-grade security." },
      { title: "Growth", text: "Tools and analytics to help you grow your audience and ROI." },
      { title: "Support", text: "Our team is here for you 24/7, every step of the way." },
    ],
  },
  solutions: {
    eyebrow: "Our Email Solutions",
    title: "Everything You Need for Seamless Email Communication",
  },
};

export const SOLUTIONS = [
  {
    title: "Transactional Emails",
    text: "Deliver time-sensitive emails instantly to your customers' inboxes, ensuring critical information is always on time.",
  },
  {
    title: "Marketing Campaigns",
    text: "Create, schedule, and automate beautiful marketing emails that drive engagement and conversions.",
  },
  {
    title: "Subscriber Growth",
    text: "Grow your audience with smart signup forms, segmentation, and referral incentives.",
  },
  {
    title: "Analytics & Insights",
    text: "Track every open, click, and conversion with real-time analytics and actionable insights.",
  },
];

/* ---------------- About ---------------- */

export const ABOUT = {
  title: "About RASPIX Media",
  subtitle: "Empowering your business with reliable, innovative, and impactful email marketing solutions.",
  storyTitle: "Our Story",
  story: [
    "RASPIX Media Email Marketing is a leading provider of email marketing solutions for businesses of all sizes. Our platform is designed to help you create, send, and track professional campaigns with ease. We believe in the power of email to build relationships, drive growth, and deliver measurable results.",
    "With a team of passionate experts, we combine technology, creativity, and data-driven strategy to help you reach your audience and achieve your goals. Whether you’re a startup or an enterprise, we’re committed to your success.",
  ],
  valuesTitle: "Our Core Values",
  values: [
    { title: "Innovation", text: "We embrace new ideas and technology." },
    { title: "Trust", text: "Integrity and transparency in all we do." },
    { title: "Growth", text: "We help clients and our team grow." },
    { title: "Collaboration", text: "We win together as a team." },
  ],
  teamTitle: "Our Team",
  team: [
    {
      initials: "RK",
      name: "Rahul Kadam",
      role: "Founder & Managing Director",
      bio: "A visionary entrepreneur with over 15 years of experience in digital marketing and SaaS. Passionate about driving innovation, fostering growth, and delivering exceptional client outcomes.",
    },
    {
      initials: "AS",
      name: "Ajay Shinde",
      role: "Co-Founder and Head Of Operations",
      bio: "A strategic thinker with deep expertise in campaign management and product analytics. Thrives on transforming complex data into impactful, growth-driven product solutions.",
    },
    {
      initials: "PD",
      name: "Parshuram Dhavle",
      role: "Head of Administration & Compliance",
      bio: "An expert in legal frameworks and regulatory compliance, ensuring all business operations align with industry standards and data protection laws.",
    },
    {
      initials: "S",
      name: "Shubham",
      role: "Technical Lead & Solutions Architect",
      bio: "A technology enthusiast committed to building high-performance platforms. Renowned for problem-solving skills, innovation, and delivering seamless client experiences.",
    },
  ],
};

/* ---------------- Services ---------------- */

export type ServiceGroup = { id: string; title: string; items: { title: string; text: string }[] };

export const SERVICES_TITLE = "Our Services";

export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    id: "email-marketing",
    title: "Email Marketing Campaigns",
    items: [
      {
        title: "Planning and Strategy",
        text: "Thoroughly understand the client's objectives, target audience, and industry. Develop a customized email marketing strategy that outlines the campaign's goals, messaging, and timing.",
      },
      {
        title: "Customized Email Design",
        text: "Create visually appealing and responsive email templates that align with the client's branding, ensuring consistency and professionalism.",
      },
      {
        title: "Content Creation",
        text: "Craft compelling email content that resonates with the audience, including engaging headlines, persuasive copy, and relevant visuals.",
      },
      {
        title: "A/B Testing",
        text: "Conduct rigorous A/B tests on various elements such as subject lines, images, call-to-action buttons, and content to determine the most effective combinations.",
      },
      {
        title: "Scheduling and Deployment",
        text: "Carefully schedule email deployments to optimize open and click-through rates. Avoid sending emails at times when the audience is less likely to engage.",
      },
      {
        title: "Performance Tracking",
        text: "Use advanced tracking tools to monitor the performance of each email campaign, including open rates, click-through rates, conversion rates, and revenue generated.",
      },
    ],
  },
  {
    id: "email-automation",
    title: "Email Automation",
    items: [
      {
        title: "Workflow Design",
        text: "Create intricate email automation workflows that guide subscribers through different stages of the customer journey, from lead generation to post-purchase follow-ups.",
      },
      {
        title: "Drip Campaigns",
        text: "Develop nurturing drip email campaigns that provide valuable content and incentives to prospects, gradually building trust and encouraging conversions.",
      },
      {
        title: "Cart Abandonment Recovery",
        text: "Set up automated emails to recover abandoned shopping carts by reminding customers of their unpurchased items and offering incentives to complete the purchase.",
      },
      {
        title: "Welcome Series",
        text: "Design welcome email sequences that make a positive first impression on new subscribers, introduce them to the brand, and encourage further engagement.",
      },
      {
        title: "Behavioral Triggers",
        text: "Implement automated emails triggered by specific subscriber actions, such as clicking a link, downloading a resource, or making a purchase.",
      },
    ],
  },
  {
    id: "analytics-reporting",
    title: "Analytics and Reporting",
    items: [
      {
        title: "Comprehensive Reporting",
        text: "Generate detailed reports that provide insights into email campaign performance, including key metrics like open rates, click-through rates, conversion rates, and revenue generated.",
      },
      {
        title: "Conversion Tracking",
        text: "Implement conversion tracking to attribute specific actions, such as purchases or form submissions, to email campaigns.",
      },
      {
        title: "ROI Analysis",
        text: "Calculate the return on investment (ROI) for email marketing efforts by measuring the revenue generated compared to the campaign costs.",
      },
      {
        title: "Data-Driven Insights",
        text: "Use data to identify trends, customer preferences, and areas for improvement, informing future email marketing strategies and content decisions.",
      },
    ],
  },
  {
    id: "deliverability",
    title: "Email Deliverability Management",
    items: [
      {
        title: "Deliverability Monitoring",
        text: "Continuously monitor email deliverability metrics, such as inbox placement rates, spam complaints, and bounce rates, to ensure emails reach subscribers' inboxes.",
      },
      {
        title: "Spam Compliance",
        text: "Ensure email campaigns comply with spam laws, such as the CAN-SPAM Act and GDPR, by including necessary opt-out links, physical addresses, and transparent sender information.",
      },
      {
        title: "Sender Reputation",
        text: "Manage the sender's reputation by adhering to best practices, maintaining a low complaint rate, and properly configuring DNS and SPF records.",
      },
      {
        title: "List Hygiene",
        text: "Regularly clean email lists to remove invalid or inactive email addresses, reducing the likelihood of bounces and spam reports.",
      },
    ],
  },
  {
    id: "compliance",
    title: "Compliance and Best Practices",
    items: [
      {
        title: "Legal Compliance",
        text: "Ensure email marketing campaigns comply with relevant legal regulations, such as GDPR, CAN-SPAM Act, and CASL, by including opt-out options, clear sender identification, and privacy policy links.",
      },
      {
        title: "Opt-In and Opt-Out Process",
        text: "Streamline the opt-in process to make it easy for subscribers to consent to receiving emails. Likewise, provide a straightforward opt-out process for unsubscribing.",
      },
      {
        title: "Privacy and Data Security",
        text: "Protect subscriber data and privacy by implementing secure data storage practices, encryption, and transparent data collection policies.",
      },
    ],
  },
  {
    id: "digital-strategy",
    title: "Digital Marketing Strategy",
    items: [
      {
        title: "Comprehensive Planning",
        text: "Develop holistic digital marketing strategies that integrate email marketing with other digital channels, such as social media, content marketing, SEO, and paid advertising.",
      },
      {
        title: "Goal Setting",
        text: "Collaborate with clients to establish clear goals and key performance indicators (KPIs) for digital marketing campaigns, ensuring alignment with business objectives.",
      },
      {
        title: "Ongoing Strategy Optimization",
        text: "Continuously evaluate the effectiveness of digital marketing efforts, making data-driven adjustments to optimize campaigns, improve ROI, and achieve better results.",
      },
    ],
  },
  {
    id: "social-ads",
    title: "Social Media Advertising",
    items: [
      {
        title: "Campaign Strategy",
        text: "Plan and execute targeted social media advertising campaigns on platforms such as Facebook, Instagram, Twitter, and LinkedIn, based on client goals and audience demographics.",
      },
      {
        title: "Ad Creative",
        text: "Design eye-catching ad creatives, including images, videos, and ad copy, that resonate with the target audience and effectively convey the brand message.",
      },
    ],
  },
  {
    id: "design-content",
    title: "Email Design and Content Creation",
    items: [
      {
        title: "Responsive Templates",
        text: "Design responsive email templates that adapt to various devices and email clients, ensuring a consistent user experience.",
      },
      {
        title: "Compelling Copywriting",
        text: "Craft persuasive and concise email content that grabs recipients' attention, communicates the message effectively, and includes clear calls to action.",
      },
      {
        title: "Visual Design",
        text: "Incorporate visually appealing graphics, images, and videos that enhance the email's aesthetics and reinforce the brand identity.",
      },
      {
        title: "Personalization",
        text: "Utilize personalization tokens to address recipients by their names and customize content based on their preferences or past interactions.",
      },
      {
        title: "Mobile Optimization",
        text: "Optimize email content and design for mobile devices, as a significant portion of email opens occurs on smartphones and tablets.",
      },
    ],
  },
];

/* ---------------- Contact ---------------- */

export const CONTACT_PAGE = {
  title: "Contact Us",
  intro:
    "We'd love to hear from you! For any questions or feedback, please reach out to us. Fill out the form below, and we'll respond as quickly as possible.",
};

/* ---------------- Portfolio ---------------- */

export const PORTFOLIO_TITLE = "Our Portfolio";

export const PORTFOLIO = [
  {
    title: "InboxPro Campaign",
    text: "Designed and executed a multi-segmented email campaign for a SaaS startup, resulting in a 35% open rate and 12% conversion.",
    result: "Increased user signups by 1,200 in 2 months.",
  },
  {
    title: "GrowthBoost Automation",
    text: "Implemented advanced automation for an e-commerce brand, sending personalized offers based on user behavior.",
    result: "Drove a 28% increase in repeat purchases.",
  },
  {
    title: "Subscriber Surge",
    text: "Developed a subscriber growth strategy for a digital magazine, including A/B testing and referral incentives.",
    result: "Grew the list by 5,000+ engaged subscribers in 6 months.",
  },
  {
    title: "Analytics Insight Suite",
    text: "Built a custom analytics dashboard for a retail client to track campaign ROI and engagement in real time.",
    result: "Enabled data-driven decisions and improved campaign ROI by 22%.",
  },
];

/* Privacy policy text lives in ./privacy.ts */
