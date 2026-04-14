// Mock data for the CRM application

export const contacts = [
  { id: 1, name: 'Elena Vasquez', email: 'elena@dessaugroup.com', phone: '+1 (555) 234-5678', company: 'Dessau Group', status: 'Active', notes: 'Key decision maker for the Q3 expansion. Prefers email communication.', avatar: 'EV', valuation: '$2.4M' },
  { id: 2, name: 'Marcus Chen', email: 'mchen@gridworks.io', phone: '+1 (555) 345-6789', company: 'GridWorks Inc', status: 'Lead', notes: 'Interested in enterprise plan. Follow up after demo.', avatar: 'MC', valuation: '$1.8M' },
  { id: 3, name: 'Sarah Kimura', email: 'sarah.k@bauhaus.co', phone: '+1 (555) 456-7890', company: 'Bauhaus & Co', status: 'Active', notes: 'Renewed contract for 2 years. Very satisfied with service.', avatar: 'SK', valuation: '$3.1M' },
  { id: 4, name: 'James Wright', email: 'jwright@archetype.dev', phone: '+1 (555) 567-8901', company: 'Archetype Dev', status: 'Prospect', notes: 'Initial meeting scheduled for next week.', avatar: 'JW', valuation: '$890K' },
  { id: 5, name: 'Lena Müller', email: 'lmuller@konstrukt.de', phone: '+49 (30) 678-9012', company: 'Konstrukt GmbH', status: 'Inactive', notes: 'Contract ended. Potential re-engagement in Q4.', avatar: 'LM', valuation: '$1.2M' },
  { id: 6, name: 'David Park', email: 'dpark@neoline.com', phone: '+1 (555) 789-0123', company: 'NeoLine Systems', status: 'Active', notes: 'Expanding to Asia-Pacific market. Needs regional support.', avatar: 'DP', valuation: '$4.5M' },
  { id: 7, name: 'Aisha Rahman', email: 'arahman@spectra.io', phone: '+1 (555) 890-1234', company: 'Spectra Analytics', status: 'Lead', notes: 'Requested pricing for team of 50+. Budget approved.', avatar: 'AR', valuation: '$2.1M' },
  { id: 8, name: 'Thomas Keller', email: 'tkeller@formfactor.co', phone: '+1 (555) 901-2345', company: 'FormFactor Co', status: 'Active', notes: 'Long-term partner. Annual review in December.', avatar: 'TK', valuation: '$5.2M' },
];

export const deals = [
  { id: 1, title: 'Dessau Enterprise License', value: 240000, stage: 'Negotiation', contactId: 1, probability: 75, daysInStage: 12 },
  { id: 2, title: 'GridWorks Platform Integration', value: 180000, stage: 'Prospect', contactId: 2, probability: 30, daysInStage: 5 },
  { id: 3, title: 'Bauhaus Contract Renewal', value: 310000, stage: 'Closed Won', contactId: 3, probability: 100, daysInStage: 0 },
  { id: 4, title: 'Archetype Pilot Program', value: 89000, stage: 'Prospect', contactId: 4, probability: 20, daysInStage: 3 },
  { id: 5, title: 'NeoLine Asia Expansion', value: 450000, stage: 'Negotiation', contactId: 6, probability: 60, daysInStage: 18 },
  { id: 6, title: 'Spectra Analytics Suite', value: 210000, stage: 'Prospect', contactId: 7, probability: 40, daysInStage: 7 },
  { id: 7, title: 'FormFactor Annual Deal', value: 520000, stage: 'Closed Won', contactId: 8, probability: 100, daysInStage: 0 },
  { id: 8, title: 'Konstrukt Re-engagement', value: 120000, stage: 'Closed Lost', contactId: 5, probability: 0, daysInStage: 45 },
  { id: 9, title: 'GridWorks Security Add-on', value: 75000, stage: 'Negotiation', contactId: 2, probability: 55, daysInStage: 8 },
  { id: 10, title: 'Dessau Training Package', value: 95000, stage: 'Prospect', contactId: 1, probability: 45, daysInStage: 2 },
];

export const tasks = [
  { id: 1, title: 'Acquisition Protocol: Phase 04', description: 'Finalize technical audit for the Dessau project. Ensure all geometric constraints align with the spatial requirements.', dueDate: '2025-10-12', status: 'In Progress', priority: 'High', assignedTo: 'Elena Vasquez' },
  { id: 2, title: 'Kandinsky Data Synthesis', description: 'Map secondary color clusters to regional pipeline performance. Visual logic must follow the established tonal architecture.', dueDate: '2025-10-14', status: 'Pending', priority: 'Medium', assignedTo: 'Marcus Chen' },
  { id: 3, title: 'Pipeline Calibration: Alpha Sector', description: 'Recalibrate the prospect scoring model based on Q3 conversion data.', dueDate: '2025-10-10', status: 'Completed', priority: 'Low', assignedTo: 'Sarah Kimura' },
  { id: 4, title: 'Initial Contact Schema', description: 'Design the onboarding flow for new enterprise contacts.', dueDate: '2025-10-09', status: 'Completed', priority: 'Medium', assignedTo: 'James Wright' },
  { id: 5, title: 'NeoLine Integration Review', description: 'Review API documentation and prepare integration timeline for Asia-Pacific rollout.', dueDate: '2025-10-15', status: 'In Progress', priority: 'High', assignedTo: 'David Park' },
  { id: 6, title: 'Quarterly Revenue Report', description: 'Compile Q3 revenue data and prepare executive summary for stakeholders.', dueDate: '2025-10-16', status: 'Pending', priority: 'High', assignedTo: 'Aisha Rahman' },
  { id: 7, title: 'FormFactor Contract Review', description: 'Review updated terms for the annual partnership renewal.', dueDate: '2025-10-18', status: 'Pending', priority: 'Medium', assignedTo: 'Thomas Keller' },
  { id: 8, title: 'Spectra Demo Preparation', description: 'Prepare product demo tailored to analytics use cases.', dueDate: '2025-10-13', status: 'In Progress', priority: 'Low', assignedTo: 'Aisha Rahman' },
];

export const salesData = [
  { month: 'Jan', revenue: 320000, deals: 12 },
  { month: 'Feb', revenue: 280000, deals: 10 },
  { month: 'Mar', revenue: 410000, deals: 18 },
  { month: 'Apr', revenue: 380000, deals: 15 },
  { month: 'May', revenue: 520000, deals: 22 },
  { month: 'Jun', revenue: 460000, deals: 19 },
  { month: 'Jul', revenue: 490000, deals: 20 },
  { month: 'Aug', revenue: 550000, deals: 24 },
  { month: 'Sep', revenue: 610000, deals: 26 },
  { month: 'Oct', revenue: 580000, deals: 23 },
  { month: 'Nov', revenue: 640000, deals: 28 },
];

export const activityHistory = [
  { id: 1, type: 'call', contact: 'Elena Vasquez', note: 'Discussed Q3 roadmap and pricing adjustments', time: '2 hours ago' },
  { id: 2, type: 'email', contact: 'Marcus Chen', note: 'Sent follow-up proposal with updated terms', time: '4 hours ago' },
  { id: 3, type: 'meeting', contact: 'Sarah Kimura', note: 'Contract renewal meeting — approved 2-year extension', time: '1 day ago' },
  { id: 4, type: 'note', contact: 'David Park', note: 'Updated CRM with APAC expansion requirements', time: '2 days ago' },
  { id: 5, type: 'deal', contact: 'Thomas Keller', note: 'Closed FormFactor annual deal — $520K', time: '3 days ago' },
];
