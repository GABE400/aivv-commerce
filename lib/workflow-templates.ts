export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  defaultSchedule: string | null;
  defaultPrompt: string;
  suggestedOutputType: string;
  category: string;
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "weekly-summary",
    name: "Weekly Business Summary",
    description: "Generate a weekly summary of priorities, achievements, and tasks.",
    type: "weekly_summary",
    defaultSchedule: "0 8 * * 1", // Monday 8am
    defaultPrompt: "Generate a concise weekly business summary. Include: key achievements this week, pending tasks, areas needing attention, and priorities for next week. Format with clear sections and bullet points.",
    suggestedOutputType: "email",
    category: "Reports",
  },
  {
    id: "daily-sales",
    name: "Daily Sales Digest",
    description: "Generate a summary of total sales, performances, and targets.",
    type: "daily_digest",
    defaultSchedule: "0 18 * * 1-5", // Weekdays 6pm
    defaultPrompt: "Generate a daily sales digest summary. Include: total sales today, top performing products/services, customer interactions, and tomorrow's targets. Keep it brief and actionable.",
    suggestedOutputType: "both",
    category: "Reports",
  },
  {
    id: "customer-followup",
    name: "Customer Follow-up Email",
    description: "Draft customer follow-up emails after sales or check-ins.",
    type: "followup_email",
    defaultSchedule: "0 9 * * 1-5", // Weekdays 9am
    defaultPrompt: "Draft a professional and warm customer follow-up email checking in on recent purchases or services. Express gratitude, offer assistance, and invite feedback. Keep it personal and under 150 words.",
    suggestedOutputType: "email",
    category: "Communication",
  },
  {
    id: "invoice-reminder",
    name: "Invoice Reminder",
    description: "Draft a polite reminder for outstanding payments.",
    type: "invoice_reminder",
    defaultSchedule: "0 10 * * 1", // Monday 10am
    defaultPrompt: "Draft a polite invoice reminder email for outstanding payments. Be firm but professional. Include a call to action to settle the payment and offer to assist with any queries. Under 100 words.",
    suggestedOutputType: "email",
    category: "Communication",
  },
  {
    id: "meeting-notes",
    name: "Meeting Notes Summarizer",
    description: "Summarize meeting takeaways, decisions, and action items.",
    type: "meeting_summary",
    defaultSchedule: "0 17 * * 1-5", // Weekdays 5pm
    defaultPrompt: "Summarize today's key meetings and discussions. Include: decisions made, action items with owners, follow-ups required, and deadlines. Format as a clean bulleted list.",
    suggestedOutputType: "dashboard",
    category: "Documents",
  },
  {
    id: "monthly-performance",
    name: "Monthly Performance Report",
    description: "Generate a report covering revenue, wins, challenges, and goals.",
    type: "report_generator",
    defaultSchedule: "0 9 1 * *", // 1st of every month at 9am
    defaultPrompt: "Generate a monthly business performance report. Cover: revenue summary, key wins, challenges faced, team highlights, and goals for next month. Professional tone, structured format.",
    suggestedOutputType: "both",
    category: "Reports",
  },
  {
    id: "staff-task-update",
    name: "Staff Task Update",
    description: "Generate daily briefings and announcements for staff members.",
    type: "custom",
    defaultSchedule: "0 8 * * 1-5", // Weekdays 8am
    defaultPrompt: "Generate a morning briefing for staff. Include: today's priorities, pending tasks from yesterday, key deadlines this week, and any important announcements. Clear and motivating tone.",
    suggestedOutputType: "email",
    category: "Operations",
  },
  {
    id: "inventory-alert",
    name: "Inventory Alert",
    description: "Generate alerts and check reminders for restocking and supplies.",
    type: "custom",
    defaultSchedule: "0 7 * * *", // Daily 7am
    defaultPrompt: "Generate an inventory status check reminder. List items that typically need restocking review, prompt the team to verify stock levels, and flag any recurring supply issues to address.",
    suggestedOutputType: "dashboard",
    category: "Operations",
  },
  {
    id: "onboarding-gen",
    name: "Onboarding Document Generator",
    description: "Create structured welcome logs and checklist docs for new staff.",
    type: "custom",
    defaultSchedule: null, // manual trigger only
    defaultPrompt: "Generate a professional employee onboarding document. Include: welcome message, company overview, first week schedule, key contacts, tools and systems access checklist, and company policies summary.",
    suggestedOutputType: "dashboard",
    category: "Documents",
  },
  {
    id: "hr-policy-qa",
    name: "HR Policy Q&A",
    description: "Answer HR inquiries based on general standards and practices.",
    type: "custom",
    defaultSchedule: null, // manual trigger only
    defaultPrompt: "Answer the following HR policy question based on general best practices and professional standards: [USER_QUESTION]. Provide a clear, fair, and professional response.",
    suggestedOutputType: "dashboard",
    category: "Documents",
  },
];
