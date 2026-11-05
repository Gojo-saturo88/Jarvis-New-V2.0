import { EmailItem } from '../types';

export const INITIAL_EMAILS: EmailItem[] = [
  {
    id: 'em-1',
    sender: 'Pepper Potts',
    senderEmail: 'p.potts@starkindustries.com',
    subject: 'Stark Industries Global Clean Energy Protocol Q4',
    preview: 'Tony, the board of directors has finalized the international clean energy grid schedule. All reactor installations in Hong Kong and New York are on track.',
    timestamp: '10:42 AM',
    isRead: false,
    priority: 'urgent',
    category: 'personal',
  },
  {
    id: 'em-2',
    sender: 'Avengers Secure Relay',
    senderEmail: 'relay-01@shield.secure.gov',
    subject: 'Orbital Reconnaissance Telemetry: Satellite Falcon 9',
    preview: 'JARVIS, deep space monitoring sensor array 04 reported atmospheric ionization anomalies. Preliminary radar signatures forwarded for neural analysis.',
    timestamp: '09:15 AM',
    isRead: false,
    priority: 'high',
    category: 'intelligence',
  },
  {
    id: 'em-3',
    sender: 'Stark Security Subsystems',
    senderEmail: 'security-core@starktower.ai',
    subject: 'East Wing Power Grid Diagnostic Completed',
    preview: 'Power fluctuation in sector 7-G resolved automatically. Arc-reactor auxiliary capacitors recalibrated to nominal 1.21 Gigawatts.',
    timestamp: '07:30 AM',
    isRead: true,
    priority: 'normal',
    category: 'system',
  },
  {
    id: 'em-4',
    sender: 'Colonel James Rhodes',
    senderEmail: 'rhodey@usaf.mil',
    subject: 'Joint Tactical Flight Simulation Testing',
    preview: 'Hey Tony, ready when you are for the Mach 3 high-altitude maneuver tests with the War Machine suit update.',
    timestamp: 'Yesterday',
    isRead: true,
    priority: 'normal',
    category: 'personal',
  },
];

class EmailService {
  private emailsKey = 'jarvis_email_notifications';

  public getEmails(): EmailItem[] {
    if (typeof window === 'undefined') return INITIAL_EMAILS;
    try {
      const stored = localStorage.getItem(this.emailsKey);
      return stored ? JSON.parse(stored) : INITIAL_EMAILS;
    } catch {
      return INITIAL_EMAILS;
    }
  }

  public saveEmails(emails: EmailItem[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.emailsKey, JSON.stringify(emails));
    } catch {
      // storage failed
    }
  }

  public markAsRead(id: string) {
    const list = this.getEmails().map((e) => (e.id === id ? { ...e, isRead: true } : e));
    this.saveEmails(list);
    return list;
  }

  public getUnreadCount(): number {
    return this.getEmails().filter((e) => !e.isRead).length;
  }
}

export const emailService = new EmailService();
