-- Seed: six real opportunities

INSERT INTO opportunities (
  title,
  description,
  category,
  deadline,
  location,
  organization,
  application_url,
  requirements,
  benefits,
  featured,
  submitted_by,
  status,
  views_count,
  applications_count
) VALUES
-- 1
(
  'Google STEP Internship (Summer 2026)',
  '11–12 week summer program for first- and second-year undergrads to develop professional skills in software engineering.',
  'internship',
  '2026-01-31',
  'Multiple (US/EU)',
  'Google',
  'https://careers.google.com/students/engineering-and-technical-internships/',
  ARRAY['Currently enrolled in BS program','Programming experience in Java, C++, or Python','Authorization to work in country of internship'],
  ARRAY['Mentorship','Competitive pay','Relocation support'],
  true,
  NULL,
  'approved',
  0,
  0
),
-- 2
(
  'Microsoft Explore Program',
  '12-week summer program for first- and second-year students combining software engineering and program management exposure.',
  'internship',
  '2026-02-15',
  'Redmond, WA (Hybrid)',
  'Microsoft',
  'https://careers.microsoft.com/students/us/en/ur-explore',
  ARRAY['Pursuing a bachelor''s degree','Demonstrated interest in CS','Strong communication skills'],
  ARRAY['Mentorship','Housing stipend','Networking events'],
  false,
  NULL,
  'approved',
  0,
  0
),
-- 3
(
  'AWS Cloud Club Captain',
  'Lead an AWS Cloud Club on campus, organize workshops, and get access to cloud resources and training.',
  'competition',
  '2025-12-31',
  'Remote / On-campus',
  'Amazon Web Services',
  'https://community.aws/awsmu/cloud-clubs',
  ARRAY['Strong interest in cloud','Leadership experience','Public speaking'],
  ARRAY['AWS credits','Swag','Training and mentorship'],
  false,
  NULL,
  'approved',
  0,
  0
),
-- 4
(
  'MLH Fellowship (Open Source Track)',
  '12-week remote internship alternative contributing to open-source under industry mentorship.',
  'internship',
  '2026-03-01',
  'Remote',
  'Major League Hacking',
  'https://fellowship.mlh.io/',
  ARRAY['Solid Git/GitHub knowledge','Experience with a programming language','Team collaboration'],
  ARRAY['Mentorship','Stipend','Career support'],
  true,
  NULL,
  'approved',
  0,
  0
),
-- 5
(
  'Adobe Research Women-in-Technology Scholarship',
  'Scholarship supporting outstanding female-identifying students in computer science and related fields.',
  'scholarship',
  '2025-11-15',
  'Global',
  'Adobe',
  'https://research.adobe.com/scholarship/',
  ARRAY['Full-time undergraduate or master''s student','Strong academic record','Research interest'],
  ARRAY['Tuition support','Mentorship','Potential internship interview'],
  false,
  NULL,
  'approved',
  0,
  0
),
-- 6
(
  'NeurIPS 2025 Student Volunteer Program',
  'Volunteer at NeurIPS, gain exposure to cutting-edge AI research and network with researchers and practitioners.',
  'event',
  '2025-10-01',
  'Vancouver, Canada',
  'NeurIPS',
  'https://neurips.cc/Conferences/2025/Volunteer',
  ARRAY['Student status verification','Fluent English','Availability during conference dates'],
  ARRAY['Conference access','Networking','Certificate of service'],
  false,
  NULL,
  'approved',
  0,
  0
);

-- Additional six Africa-focused opportunities
INSERT INTO opportunities (
  title,
  description,
  category,
  deadline,
  location,
  organization,
  application_url,
  requirements,
  benefits,
  featured,
  submitted_by,
  status,
  views_count,
  applications_count
) VALUES
-- 7
(
  'Safaricom Discover Graduate Programme 2026',
  'Rotational graduate programme developing future leaders in technology and business at Safaricom.',
  'job',
  '2026-02-28',
  'Nairobi, Kenya',
  'Safaricom',
  'https://www.safaricom.co.ke/careers/Discover-Programme',
  ARRAY['Recent bachelor''s degree','Strong academic performance','Kenyan work authorization'],
  ARRAY['Competitive salary','Medical cover','Learning and development'],
  false,
  NULL,
  'approved',
  0,
  0
),
-- 8
(
  'MTN Global Graduate Programme (West Africa)',
  'Fast-track graduate programme across MTN operations with exposure to telecom innovation.',
  'job',
  '2026-01-31',
  'Lagos, Nigeria (Regional)',
  'MTN',
  'https://www.mtn.com/careers/graduate-programme/',
  ARRAY['Recent graduate (STEM/Business)','Strong analytical skills','Mobility across regions'],
  ARRAY['Competitive pay','International exposure','Mentorship'],
  false,
  NULL,
  'approved',
  0,
  0
),
-- 9
(
  'African Development Bank (AfDB) Internship Program',
  'Intern with AfDB departments to gain development finance and policy experience.',
  'internship',
  '2026-03-15',
  'Abidjan, Côte d’Ivoire',
  'African Development Bank',
  'https://www.afdb.org/en/careers/internship-program',
  ARRAY['Master''s or final-year bachelor''s','Fluent English or French','Valid health insurance'],
  ARRAY['Stipend (per policy)','Professional exposure','Networking'],
  false,
  NULL,
  'approved',
  0,
  0
),
-- 10
(
  'ALX Software Engineering Programme (Africa-wide)',
  'Intensive software engineering training programme preparing learners for remote tech careers.',
  'event',
  '2026-04-01',
  'Remote (Africa)',
  'ALX',
  'https://www.alxafrica.com/software-engineering/',
  ARRAY['Laptop and stable internet','Time commitment','Motivation for tech career'],
  ARRAY['Industry-aligned curriculum','Career services','Community'],
  false,
  NULL,
  'approved',
  0,
  0
),
-- 11
(
  'Andela Technical Leadership Programme',
  'Hands-on training and real client projects to build software engineering skills across Africa.',
  'internship',
  '2026-02-10',
  'Remote (Africa)',
  'Andela',
  'https://andela.com/initiatives/',
  ARRAY['Programming fundamentals','Team collaboration','Reliable internet'],
  ARRAY['Mentorship','Real-world projects','Career support'],
  false,
  NULL,
  'approved',
  0,
  0
),
-- 12
(
  'Google Developer Student Clubs (GDSC) Lead — Africa',
  'Lead a GDSC chapter, organize events and workshops, and access Google resources for student communities.',
  'competition',
  '2025-08-31',
  'Campus-based (Africa)',
  'Google Developers',
  'https://developers.google.com/community/gdsc/leads',
  ARRAY['Enrolled student in Africa','Leadership potential','Interest in tech communities'],
  ARRAY['Training resources','Community support','Event funding (varies)'],
  false,
  NULL,
  'approved',
  0,
  0
);

-- Additional six new opportunities
INSERT INTO opportunities (
  title,
  description,
  category,
  deadline,
  location,
  organization,
  application_url,
  requirements,
  benefits,
  featured,
  submitted_by,
  status,
  views_count,
  applications_count
) VALUES
-- 13
(
  'Meta University Engineering Program',
  '8-week summer internship program for first-year students from underrepresented backgrounds to explore software engineering careers.',
  'internship',
  '2026-03-15',
  'Menlo Park, CA (On-site)',
  'Meta',
  'https://www.metacareers.com/students-and-graduates/',
  ARRAY['First-year undergraduate','Interest in computer science','Authorization to work in US'],
  ARRAY['Competitive compensation','Housing provided','Mentorship and networking'],
  true,
  NULL,
  'approved',
  0,
  0
),
-- 14
(
  'Goldman Sachs Engineering Campus Programs',
  'Full-time engineering opportunities for recent graduates and internships for students interested in financial technology.',
  'job',
  '2026-04-30',
  'New York, NY; Dallas, TX; London, UK',
  'Goldman Sachs',
  'https://www.goldmansachs.com/careers/students-and-graduates/programs/',
  ARRAY['Bachelor''s or Master''s degree','Strong programming skills','Problem-solving ability'],
  ARRAY['Competitive compensation','Professional development','Global opportunities'],
  false,
  NULL,
  'approved',
  0,
  0
),
-- 15
(
  'United Nations Young Professionals Programme',
  'Competitive entry-level recruitment initiative that brings new talent to the UN through an annual entrance examination.',
  'job',
  '2025-12-31',
  'New York, NY; Geneva, Switzerland; Vienna, Austria',
  'United Nations',
  'https://careers.un.org/lbw/home.aspx?viewtype=YP',
  ARRAY['Master''s degree','Under 32 years old','Fluency in English or French'],
  ARRAY['International career','Competitive benefits','Professional growth'],
  false,
  NULL,
  'approved',
  0,
  0
),
-- 16
(
  'Thiel Fellowship',
  '$100,000 grant for young people who want to build new things instead of sitting in a classroom.',
  'scholarship',
  '2026-05-31',
  'Remote / San Francisco, CA',
  'Thiel Foundation',
  'https://thielfellowship.org/',
  ARRAY['Age 22 or younger','Innovative project idea','Commitment to full-time pursuit'],
  ARRAY['$100,000 grant','Mentorship network','Community support'],
  true,
  NULL,
  'approved',
  0,
  0
),
-- 17
(
  'Apple Worldwide Developers Conference (WWDC) Student Scholarship',
  'Opportunity for students and members of Apple Developer Programs to attend WWDC, learn from Apple engineers, and present your app.',
  'competition',
  '2026-04-15',
  'Cupertino, CA / Online',
  'Apple',
  'https://developer.apple.com/wwdc24/scholarships/',
  ARRAY['Age 13+','Student or member of Apple Developer Program','Swift Playgrounds project'],
  ARRAY['Free WWDC access','WWDC23 jacket and pin set','Recognition'],
  false,
  NULL,
  'approved',
  0,
  0
),
-- 18
(
  'Harvard Business School Summer Venture in Management Program',
  'One-week intensive program exposing college students from underrepresented backgrounds to business education.',
  'event',
  '2026-05-01',
  'Boston, MA',
  'Harvard Business School',
  'https://www.hbs.edu/mba/admissions/svmp/Pages/default.aspx',
  ARRAY['College junior or senior','First-generation college student or underrepresented minority','Strong academic record'],
  ARRAY['Full program scholarship','HBS case method experience','Networking opportunities'],
  false,
  NULL,
  'approved',
  0,
  0
);


